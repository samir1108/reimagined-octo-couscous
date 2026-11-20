import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Card } from "@/design-system";
import { Button } from "@/design-system";
import { ChevronLeft, Loader2, Sparkles, Library as LibraryIcon, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { conscious, consciousFromError } from "@/lib/consciousToast";
import ReactMarkdown from "react-markdown";

/** The shape `buildMirrorInsight` writes into `user_assessment_results.insights`. */
interface InsightCard {
  title?: string;
  body?: string;
  type?: 'strength' | 'shadow' | 'edge';
}

interface ResultRow {
  id: string;
  assessment_slug: string;
  sub_scores: Record<string, number>;
  primary_result: string;
  primary_result_label: string | null;
  secondary_result: string | null;
  result_summary: string | null;
  deep_analysis: string | null;
  insights: any[];
  recommended_masters: string[] | any;
  engine_applied: boolean;
  taken_at: string;
  assessment: {
    title: string;
    cover_emoji: string | null;
    tradition: string;
    result_types: any[];
  };
}

export default function AssessmentResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<ResultRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const load = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from("user_assessment_results")
      .select("*, assessment:assessment_definitions(title,cover_emoji,tradition,result_types)")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) {
      conscious("beginHere", { kind: "error", detail: "Result not found" });
      navigate("/app/library");
      return;
    }
    setResult(data as unknown as ResultRow);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  // Auto-trigger AI deep analysis if not yet generated
  useEffect(() => {
    if (!result || result.deep_analysis || analyzing) return;
    runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.id]);

  const runAnalysis = async () => {
    if (!result) return;
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-assessment", {
        body: { result_id: result.id },
      });
      if (error) {
        const msg = (error as any).message ?? "Analysis failed";
        consciousFromError(new Error(msg), "somethingSlipped");
        setAnalyzing(false);
        return;
      }
      // reload with the new analysis
      await load();
    } catch (e) {
      console.error(e);
      consciousFromError(e, "somethingSlipped");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading || !result) {
    return (
      <div className="max-w-2xl mx-auto pt-12 text-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
      </div>
    );
  }

  const resultTypes = Array.isArray(result.assessment?.result_types) ? result.assessment.result_types : [];
  const primaryType = resultTypes.find((r: any) => r.id === result.primary_result);
  const subScores = result.sub_scores ?? {};
  const totalScore = Object.values(subScores).reduce((s: number, v: any) => s + (Number(v) || 0), 0) || 1;

  const masters = Array.isArray(result.recommended_masters) ? result.recommended_masters : [];

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <button
        onClick={() => navigate("/app/library")}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="w-3 h-3" /> Library
      </button>

      {/* Hero result */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="text-6xl mb-3">{result.assessment?.cover_emoji ?? "🪷"}</div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          {result.assessment?.title}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mb-1">
          {result.primary_result_label ?? primaryType?.label ?? result.primary_result}
        </h1>
        {result.result_summary && (
          <p className="text-sm text-muted-foreground italic">{result.result_summary}</p>
        )}
      </motion.div>

      {/* Sub-score bars */}
      <Card className="p-5 mb-4">
        <h3 className="font-display text-xs uppercase tracking-widest text-muted-foreground mb-4">
          Your Composition
        </h3>
        <div className="space-y-3">
          {Object.entries(subScores).map(([dim, score]) => {
            const numScore = Number(score) || 0;
            const pct = Math.round((numScore / totalScore) * 100);
            const dimType = resultTypes.find((r: any) => r.id === dim);
            const isPrimary = dim === result.primary_result;
            return (
              <div key={dim}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className={`capitalize ${isPrimary ? "font-semibold text-foreground" : "text-foreground/80"}`}>
                    {dimType?.label ?? dim}
                  </span>
                  <span className="text-muted-foreground tabular-nums">{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: dimType?.color ?? "hsl(var(--primary))" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Deep analysis */}
      <Card className="p-5 sm:p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xs uppercase tracking-widest text-muted-foreground">
            Council of Yogis · Deep Reading
          </h3>
          {result.deep_analysis && !analyzing && (
            <Button variant="ghost" size="sm" onClick={runAnalysis} className="h-7 text-xs">
              <RefreshCw className="w-3 h-3 mr-1" /> Regenerate
            </Button>
          )}
        </div>

        {analyzing ? (
          <div className="py-12 text-center">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-3 text-primary" />
            <p className="text-sm text-muted-foreground">
              The Council is reading your pattern…
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              This may take 10–20 seconds
            </p>
          </div>
        ) : result.deep_analysis ? (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-display prose-headings:tracking-tight prose-h2:text-base prose-h2:mt-5 prose-h2:mb-2 prose-p:text-sm prose-p:leading-relaxed prose-p:text-foreground/90">
            <ReactMarkdown>{result.deep_analysis}</ReactMarkdown>
          </div>
        ) : (
          <div className="py-8 text-center">
            <Button onClick={runAnalysis} size="sm">
              <Sparkles className="w-4 h-4 mr-2" /> Generate Deep Reading
            </Button>
          </div>
        )}
      </Card>

      {/* Recommended masters */}
      {masters.length > 0 && (
        <Card className="p-5 mb-4">
          <h3 className="font-display text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Masters For This Path
          </h3>
          <div className="flex flex-wrap gap-2">
            {masters.map((m: string) => (
              <button
                key={m}
                onClick={() => navigate(`/app/masters`)}
                className="px-3 py-1.5 rounded-full text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors capitalize"
              >
                {m.replace(/-/g, " ")}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Mirror insight — the deterministic reading written at completion */}
      {Array.isArray(result.insights) && result.insights.length > 0 && (
        <Card className="p-5 sm:p-6 mb-4">
          <h3 className="font-display text-xs uppercase tracking-widest text-muted-foreground mb-4">
            What this changes
          </h3>
          <div className="space-y-3">
            {result.insights.map((card: InsightCard, i: number) => (
              <div key={i} className="border-l-2 border-border pl-3">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">
                  {card?.title}
                </p>
                <p className="text-sm leading-relaxed text-foreground/90">{card?.body}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Shadow callout */}
      {primaryType?.shadow && (
        <Card className="p-5 mb-4 border-amber-500/20 bg-amber-500/5">
          <h3 className="font-display text-xs uppercase tracking-widest text-amber-500/80 mb-2">
            Shadow To Watch
          </h3>
          <p className="text-sm text-foreground/90 italic leading-relaxed">{primaryType.shadow}</p>
        </Card>
      )}

      {/* Engine status */}
      {result.engine_applied && (
        <div className="text-center text-[11px] text-muted-foreground/70 mt-6">
          <Sparkles className="w-3 h-3 inline mr-1" />
          Integrated into your daily engine
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Button variant="outline" onClick={() => navigate("/app/library")}>
          <LibraryIcon className="w-4 h-4 mr-2" /> Back to Library
        </Button>
      </div>
    </div>
  );
}
