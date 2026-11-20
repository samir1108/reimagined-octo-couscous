import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/design-system";
import { Card } from "@/design-system";
import { Progress } from "@/design-system";
import { ChevronLeft, ChevronRight, Sparkles, Loader2, Layers } from "lucide-react";
import { conscious, consciousFromError } from "@/lib/consciousToast";
import {
  scoreAssessment,
  type AssessmentQuestion,
  type ResultType,
  type ScoringLogic,
} from "@/lib/library/scoring";
import { getBank } from "@/data/mirrors/registry";
import { getMirrorByNumber } from "@/data/pre-journey/mirrors";
import { promptFor, type MirrorBank, type MirrorTier } from "@/data/mirrors/types";
import { planMirror, scoreMirror, type MirrorBand } from "@/lib/mirrors/adaptiveEngine";
import { buildMirrorInsight } from "@/lib/mirrors/insightBuilder";
import { useMirrorHistory, useWriteMirrorReading } from "@/hooks/useMirrorHistory";
import MirrorInsightReveal from "@/components/mirrors/MirrorInsightReveal";

interface AssessmentDef {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  intro: string;
  tradition: string;
  dimension_category: string;
  cover_emoji: string | null;
  question_count: number;
  estimated_minutes: number;
  questions: AssessmentQuestion[];
  scoring_logic: ScoringLogic;
  result_types: ResultType[];
  version: number;
}

type ResolvedDef = {
  def: AssessmentDef;
  bank: MirrorBank | null;
  /** True when the bank came from the registry, not the database. */
  fromRegistry: boolean;
};

type Phase = "intro" | "running" | "submitting" | "reveal";

export default function AssessmentRunner() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mirrorNumber = Number(searchParams.get("n")) || null;
  const fromMirror = searchParams.get("from") === "mirror";

  const { data: history = [] } = useMirrorHistory();
  const writeReading = useWriteMirrorReading();

  const [resolved, setResolved] = useState<ResolvedDef | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [reveal, setReveal] = useState<ReturnType<typeof buildMirrorInsight> | null>(null);

  // ─── Load ───
  // Database first — it carries the 32 original banks, which exist nowhere
  // else. The registry is the fallback for the 61 authored here, so a mirror
  // is never a dead end just because a migration has not been applied yet.
  useEffect(() => {
    if (!slug) return;
    let mounted = true;

    (async () => {
      const { data } = await supabase
        .from("assessment_definitions")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (!mounted) return;

      if (data) {
        setResolved({ def: data as unknown as AssessmentDef, bank: null, fromRegistry: false });
        setLoading(false);
        return;
      }

      const bank = getBank(slug);
      if (bank) {
        setResolved({
          def: {
            id: `registry:${bank.slug}`,
            slug: bank.slug,
            title: bank.title,
            subtitle: bank.subtitle,
            intro: bank.intro,
            tradition: bank.tradition,
            dimension_category: bank.dimensionCategory,
            cover_emoji: bank.coverEmoji,
            question_count: bank.questions.length,
            estimated_minutes: bank.estimatedMinutes,
            questions: bank.questions.map((q) => ({
              id: q.id,
              type: "choice" as const,
              prompt: promptFor(q, "surface"),
              domain: q.domain,
              options: q.options,
            })),
            scoring_logic: {
              method: "weighted_sum_percentage",
              dimensions: bank.dimensions,
              primary_rule: "highest_sub_score",
            },
            result_types: bank.resultTypes as unknown as ResultType[],
            version: bank.version,
          },
          bank,
          fromRegistry: true,
        });
        setLoading(false);
        return;
      }

      conscious("beginHere", { kind: "error", detail: "Mirror not found" });
      navigate("/app/library");
    })();

    return () => {
      mounted = false;
    };
  }, [slug, navigate]);

  // ─── Adaptive plan ───
  // Keyed on a derived signature rather than the `history` array identity, so
  // a background refetch cannot reorder the questions under a user who is
  // already answering them.
  const historySignature = useMemo(
    () => history.map((h) => `${h.slug}:${h.primaryId}:${h.confidence}`).join("|"),
    [history],
  );

  const plan = useMemo(() => {
    if (!resolved?.bank) return null;
    return planMirror(resolved.bank, history);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved?.bank, historySignature]);

  const tier: MirrorTier = plan?.tier ?? "surface";

  const questions: AssessmentQuestion[] = useMemo(() => {
    if (resolved?.bank && plan) {
      return plan.questions.map((q) => ({
        id: q.id,
        type: "choice" as const,
        prompt: promptFor(q, tier),
        domain: q.domain,
        options: q.options,
      }));
    }
    return resolved?.def.questions ?? [];
  }, [resolved, plan, tier]);

  const total = questions.length;
  const current = questions[currentIdx];
  const progress = total
    ? ((currentIdx + (answers[current?.id ?? ""] ? 1 : 0)) / total) * 100
    : 0;

  // Guard against a shrinking plan leaving the cursor past the end.
  useEffect(() => {
    if (currentIdx > questions.length - 1) {
      setCurrentIdx(Math.max(0, questions.length - 1));
    }
  }, [questions.length, currentIdx]);

  const handleSelect = (qid: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
    setTimeout(() => {
      if (currentIdx < total - 1) setCurrentIdx((i) => i + 1);
    }, 220);
  };

  // ─── Submit ───
  const handleSubmit = async () => {
    if (!resolved) return;
    setPhase("submitting");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      conscious("needPresence", { kind: "warning" });
      setPhase("running");
      return;
    }

    const { def, bank, fromRegistry } = resolved;
    const duration = startedAt ? Math.round((Date.now() - startedAt) / 1000) : null;

    try {
      // Score. The registry path re-derives the percentages itself because it
      // needs the silent-dimension list and the completion ratio, which the
      // flat scorer does not report.
      const score = bank
        ? scoreMirror(bank, plan!.questions, answers)
        : scoreAssessment(def.questions, answers, def.scoring_logic, def.result_types);

      const rawScores = "percentages" in score ? score.percentages : score.rawScores;
      const primaryId = score.primaryId;
      const secondaryId = score.secondaryId;
      const primaryType = def.result_types.find((r) => r.id === primaryId);

      // Insight. Deterministic, and built before any DB write so the reveal
      // cannot be lost to a failed insert.
      const checkpoint = mirrorNumber ? getMirrorByNumber(mirrorNumber) : undefined;
      const insight =
        bank && plan
          ? buildMirrorInsight({
              checkpoint: checkpoint ?? fallbackCheckpoint(mirrorNumber, def.slug, def.title),
              bank,
              plan,
              score: "percentages" in score
                ? score
                : scoreMirror(bank, plan.questions, answers),
              history,
            })
          : null;

      // The reading is written first and is FK-free, so a user who takes a
      // mirror can never lose it to a catalog problem.
      if (bank && plan && mirrorNumber) {
        await writeReading.mutateAsync({
          mirrorNumber,
          slug: bank.slug,
          title: bank.title,
          module: bank.module,
          score: score.percentages[primaryId] ?? 0,
          confidence: plan.confidence,
          band: plan.band,
          subScores: score.percentages,
          tags: insight?.tags ?? [],
          tier: plan.tier,
          prunedCount: plan.pruned.length,
          evidence: evidenceFor(insight),
          readingNote: insight?.reading ?? "",
          dayZero: history.length === 0,
          source: "user_mirror",
        });
      }

      // Registry-only banks have no `assessment_definitions` row yet, so
      // `user_assessment_results` cannot accept them (assessment_id is a
      // required FK). The reading above is already saved; the reveal is shown
      // inline instead of on the result page.
      if (fromRegistry) {
        setReveal(insight);
        setPhase("reveal");
        return;
      }

      const rawAnswers = Object.entries(answers).map(([qid, val]) => ({
        question_id: qid,
        answer_value: val,
        answered_at: new Date().toISOString(),
      }));

      const { data: inserted, error: insErr } = await supabase
        .from("user_assessment_results")
        .insert({
          user_id: user.id,
          assessment_id: def.id,
          assessment_slug: def.slug,
          assessment_version: def.version,
          raw_answers: rawAnswers,
          sub_scores: rawScores,
          primary_result: primaryId,
          primary_result_label: insight?.headline ?? primaryType?.label ?? primaryId,
          secondary_result: secondaryId,
          result_summary: insight?.headline ?? primaryType?.short ?? "",
          deep_analysis: insight?.reading ?? null,
          insights: insight?.cards ?? [],
          recommended_masters: insight?.practiceAffinity ?? [],
          engine_applied: !!insight,
          duration_seconds: duration,
          is_complete: true,
        })
        .select("id")
        .single();

      if (insErr || !inserted) {
        console.error(insErr);
        // The reading is already safe. Fall through to the inline reveal
        // rather than throwing the user back to the last question.
        setReveal(insight);
        setPhase("reveal");
        return;
      }

      navigate(`/app/library/result/${inserted.id}`);
    } catch (e) {
      console.error(e);
      consciousFromError(e, "somethingSlipped");
      setPhase("running");
    }
  };

  // ─── Render ───

  if (loading || !resolved) {
    return (
      <div className="max-w-2xl mx-auto pt-12 text-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
      </div>
    );
  }

  const { def, fromRegistry } = resolved;

  if (phase === "reveal") {
    return (
      <MirrorInsightReveal
        insight={reveal}
        slug={def.slug}
        onRetake={() => {
          setAnswers({});
          setCurrentIdx(0);
          setReveal(null);
          setPhase("running");
          setStartedAt(Date.now());
        }}
        onDone={() => navigate("/app/library")}
      />
    );
  }

  if (phase === "intro") {
    return (
      <div className="max-w-2xl mx-auto pt-4 sm:pt-8">
        <button
          onClick={() => navigate("/app/library")}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6"
        >
          <ChevronLeft className="w-3 h-3" /> Library
        </button>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{def.cover_emoji ?? "🪞"}</div>
            <h1 className="font-display text-3xl font-semibold tracking-tight mb-2">{def.title}</h1>
            {def.subtitle && (
              <p className="text-muted-foreground text-sm mb-1">{def.subtitle}</p>
            )}
            <p className="text-xs text-muted-foreground/70 uppercase tracking-widest mt-2">
              {def.tradition} · {def.estimated_minutes} min · {def.question_count} questions
            </p>
          </div>

          <Card className="p-6 mb-6">
            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
              {def.intro}
            </p>
          </Card>

          {plan && (
            <div className="mb-6 rounded-2xl border border-border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <Layers className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Asked at {plan.tier} depth
                  </p>
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {plan.rationale}
                  </p>
                  {plan.pruned.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {plan.pruned.length} question{plan.pruned.length === 1 ? "" : "s"} left
                      out — you have already answered those consistently elsewhere.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              setPhase("running");
              setStartedAt(Date.now());
            }}
          >
            <Sparkles className="w-4 h-4 mr-2" /> Begin
          </Button>

          {fromRegistry && (
            <p className="text-[11px] text-muted-foreground/70 mt-4 text-center leading-relaxed">
              This mirror runs from the app's own library. The full reading on the
              result page needs the library catalog migration to be applied.
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  if (phase === "submitting") {
    return (
      <div className="max-w-2xl mx-auto pt-20 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-sm text-muted-foreground">Reading your answers…</p>
      </div>
    );
  }

  const allAnswered = questions.every((q) => answers[q.id]);
  const isLast = currentIdx === total - 1;

  return (
    <div className="max-w-2xl mx-auto pt-2 sm:pt-6">
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>{currentIdx + 1} of {total}</span>
          <span className="capitalize">{current?.domain ?? ""}</span>
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="p-5 sm:p-7 mb-4">
            <h2 className="font-display text-lg sm:text-xl font-medium mb-5 leading-snug">
              {current.prompt}
            </h2>
            <div className="space-y-2">
              {current.options?.map((opt) => {
                const selected = answers[current.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(current.id, opt.value)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all text-sm leading-relaxed ${
                      selected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border/40 hover:border-border hover:bg-muted/40 text-foreground/90"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        {isLast ? (
          <Button onClick={handleSubmit} disabled={!allAnswered}>
            See your result <Sparkles className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentIdx((i) => Math.min(total - 1, i + 1))}
            disabled={!answers[current.id]}
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ───

/** A checkpoint stand-in when the mirror was opened from the Library, not the journey. */
function fallbackCheckpoint(
  mirrorNumber: number | null,
  slug: string,
  title: string,
) {
  return {
    number: mirrorNumber ?? 0,
    afterSessionNumber: 0,
    title,
    hook: "",
    assessmentSlug: slug,
    module: "Library",
    kind: "assessment" as const,
  };
}

/** A short, quotable evidence line for the reading row. */
function evidenceFor(
  insight: ReturnType<typeof buildMirrorInsight> | null,
): string {
  if (!insight) return "";
  return [insight.headline, insight.tension].filter(Boolean).join(" — ").slice(0, 500);
}

export type { MirrorBand };
