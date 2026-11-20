import { Button } from "@/design-system";
import { getLoopName } from "@/lib/onboarding/getLoopName";
import type {
  CompletedStepRecord,
  SessionCompleteResult,
  StepKind,
} from "@/lib/session-shell/types";
import { saveFutureWhisper, saveLastSittingEssence } from "@/lib/whisperChain";
import { hapticSilence } from "@/lib/haptics";
import {
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  Flame,
  BookOpen,
  Wind,
  Eye,
  Footprints,
  PencilLine,
  MessageCircle,
  Heart,
  Feather,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveLastSessionResult } from "@/lib/lastSessionResult";
import { CinematicStage } from "./CinematicStage";

const DIM_LABELS: Record<string, string> = {
  body: "Body",
  emotion: "Emotion",
  thought: "Thought",
  awareness: "Awareness",
};

const KIND_META: Record<
  StepKind,
  { label: string; Icon: typeof BookOpen }
> = {
  "wisdom-read": { label: "Wisdom",       Icon: BookOpen },
  breathwork:    { label: "Breathwork",   Icon: Wind },
  journal:       { label: "Journal",      Icon: PencilLine },
  "micro-act":   { label: "Micro-act",    Icon: Footprints },
  reflection:    { label: "Reflection",   Icon: Sparkles },
  "guide-chat":  { label: "Guide",        Icon: MessageCircle },
  practice:      { label: "Practice",     Icon: Heart },
  "temple-chat": { label: "Master",       Icon: MessageCircle },
  witness:       { label: "Witness",       Icon: Eye },
};

const SILENCE_MS = 5000;

export function SessionCompleteScreen({
  result,
  completedSteps = [],
  syncError = false,
  onHome,
  onAnalytics,
}: {
  result: SessionCompleteResult;
  completedSteps?: CompletedStepRecord[];
  /** True when the completion API failed — the sitting is saved locally. */
  syncError?: boolean;
  onHome: () => void;
  onAnalytics: () => void;
}) {
  const minutes = Math.max(1, Math.round(result.durationMs / 60000));
  const nudges = (result.dimensionNudges || []).filter((n) => n.delta > 0);
  const engagedNothing = result.completedStepCount === 0;

  // ── The silence beat — the seal is a moment before it is a screen ──
  const [inSilence, setInSilence] = useState(!engagedNothing);
  useEffect(() => {
    if (!inSilence) return;
    const id = window.setTimeout(() => {
      setInSilence(false);
      hapticSilence();
    }, SILENCE_MS);
    return () => window.clearTimeout(id);
  }, [inSilence]);

  // ── Whisper forward — one sentence for your next sitting ──
  const [whisperText, setWhisperText] = useState("");
  const [whisperSaved, setWhisperSaved] = useState(false);

  // Home carries the essence of this sitting
  useEffect(() => {
    saveLastSittingEssence(result.shiftSummary || result.nextTeaser || "");
  }, [result.shiftSummary, result.nextTeaser]);

  // Home also shows the receipt — "you did it · what shifted · what's next".
  useEffect(() => {
    saveLastSessionResult({
      at: new Date().toISOString(),
      minutes,
      steps: result.completedStepCount,
      karma: result.karmaEarned,
      quality: Math.round(Number(result.qualityScore) || 0),
      shift: result.shiftSummary || "",
      next: result.nextTeaser || "",
    });
  }, [minutes, result.completedStepCount, result.karmaEarned, result.qualityScore, result.shiftSummary, result.nextTeaser]);

  const shiftLine = useMemo(
    () =>
      result.shiftSummary ||
      (engagedNothing
        ? "Even arriving here is the practice. The body remembers."
        : `You moved through ${result.completedStepCount} ${result.completedStepCount === 1 ? "step" : "steps"} with presence. Notice what is different — even slightly — in your body right now.`),
    [result.shiftSummary, engagedNothing, result.completedStepCount],
  );

  const handleSaveWhisper = async () => {
    const text = whisperText.trim();
    if (!text || whisperSaved) return;
    setWhisperSaved(true);
    await saveFutureWhisper(text);
  };

  // Build a step-by-step analysis (always renders something)
  const stepRows = useMemo(() => {
    if (completedSteps.length > 0) {
      return completedSteps.map((s, i) => {
        const meta = KIND_META[s.kind] ?? { label: s.kind, Icon: CheckCircle2 };
        const sec = s.durationSeconds ?? 0;
        const time =
          sec >= 60 ? `${Math.round(sec / 60)} min` : sec > 0 ? `${sec}s` : "—";
        return {
          key: `${i}-${s.kind}`,
          Icon: meta.Icon,
          label: s.title || meta.label,
          sub: meta.label,
          time,
        };
      });
    }
    return Array.from({ length: result.completedStepCount }).map((_, i) => ({
      key: `fallback-${i}`,
      Icon: CheckCircle2,
      label: `Step ${i + 1}`,
      sub: "Completed",
      time: "—",
    }));
  }, [completedSteps, result.completedStepCount]);

  if (inSilence) {
    return (
      <div className="dark fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden bg-background px-6 text-center">
        <CinematicStage kind="reflection" slot="evening" />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-black/85"
          initial={{ height: 0 }}
          animate={{ height: "8vh" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-black/85"
          initial={{ height: 0 }}
          animate={{ height: "8vh" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="relative z-10 flex flex-col items-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="text-[10px] uppercase tracking-[0.42em] text-primary/70"
          >
            The sitting closes
          </motion.p>
          <motion.div
            initial={{ opacity: 0.9 }}
            animate={{ opacity: [0.9, 0.35, 0.9] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="mt-10 h-24 w-24 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 40% 35%, hsl(var(--primary) / 0.85) 0%, hsl(var(--primary) / 0.4) 50%, hsl(var(--primary) / 0.05) 85%)",
              boxShadow: "0 0 60px hsl(var(--primary) / 0.4)",
            }}
          />
          <motion.span
            aria-hidden="true"
            className="mt-8 block h-px w-16 bg-gradient-to-r from-transparent via-primary/70 to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-6 text-sm font-display italic tracking-wide text-foreground/75"
          >
            Sit with it.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="mt-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60"
          >
            Let the session finish landing
          </motion.p>
          <button
            onClick={() => setInSilence(false)}
            className="mt-10 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70 transition hover:text-foreground"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dark fixed inset-0 z-[60] flex flex-col items-center overflow-y-auto bg-background px-5 pt-10 pb-32">
      <CinematicStage kind="reflection" slot="evening" />
      {/* Reel edges — a thin, permanent film frame around the receipt */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-10 h-6 bg-black/80" />
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 bottom-0 z-10 h-6 bg-black/80" />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* THE RESULT — you did it, then what shifted */}
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Flame className="h-6 w-6" />
            </div>
            <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
              The seal
            </p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-display font-medium leading-tight text-foreground">
              {engagedNothing ? "You arrived." : "You did it."}
            </h1>
            <p className="mt-3 text-lg sm:text-xl font-display italic leading-snug text-foreground/90">
              {shiftLine}
            </p>
          </div>

          {syncError && (
            <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs leading-relaxed text-foreground/85">
              <span className="uppercase tracking-[0.16em] text-amber-400/90">Saved on this device · </span>
              The server could not record this sitting yet. Your progress is safe here and will sync next time.
            </div>
          )}

          {/* THE RECEIPT — this sitting in four numbers */}
          {!engagedNothing && (
            <div className="mt-6 grid grid-cols-2 gap-2">
              {[
                { label: "Time", value: `${minutes} min` },
                { label: "Steps", value: String(result.completedStepCount) },
                {
                  label: "Karma",
                  value: result.karmaEarned > 0 ? `+${result.karmaEarned}` : "—",
                },
                {
                  label: "Quality",
                  value:
                    typeof result.qualityScore === "number"
                      ? `${Math.round(result.qualityScore)}%`
                      : "—",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/40 bg-card/60 px-3 py-2.5 text-center"
                >
                  <p className="font-display text-lg font-semibold text-foreground tabular-nums">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-muted-foreground/70">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* WHISPER FORWARD — the conversation with your future self */}
          {!engagedNothing && (
            <div className="mt-8 rounded-2xl border border-primary/25 bg-primary/[0.05] p-5">
              <div className="flex items-center gap-2 text-[10px] font-display tracking-[0.25em] uppercase text-primary/80">
                <Feather className="h-3 w-3" />
                Leave one sentence for your next sitting
              </div>
              {whisperSaved ? (
                <p className="mt-3 text-sm italic text-foreground/80">
                  It will greet you below the threshold next time.
                </p>
              ) : (
                <>
                  <textarea
                    value={whisperText}
                    onChange={(e) => setWhisperText(e.target.value)}
                    placeholder="What do you want your future self to hear before they begin?"
                    className="mt-3 w-full min-h-[64px] resize-none rounded-xl border border-border/50 bg-background/50 p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none"
                  />
                  <div className="mt-3 flex justify-end">
                    <Button
                      size="sm"
                      onClick={() => void handleSaveWhisper()}
                      disabled={!whisperText.trim()}
                      className="rounded-full"
                    >
                      Send it forward
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP-BY-STEP — the journey, quietly recorded */}
          {!engagedNothing && (
            <div className="mt-4 rounded-2xl border border-border/40 bg-card/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Your journey today
              </p>
              <ul className="mt-3 space-y-2">
                {stepRows.map((r) => {
                  const Icon = r.Icon;
                  return (
                    <li
                      key={r.key}
                      className="flex items-center gap-3 rounded-xl bg-background/50 px-3 py-2"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{r.label}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {r.sub}
                        </p>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {r.time}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* V-Level + Dimensions (when present) */}
          {(typeof result.vLevelDelta === "number" && result.vLevelDelta !== 0) ||
          nudges.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-border/40 bg-card/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Inner movement
              </p>
              <div className="mt-3 space-y-2">
                {typeof result.vLevelDelta === "number" && result.vLevelDelta !== 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-primary" />
                      V-level
                    </span>
                    <span className={result.vLevelDelta > 0 ? "text-primary" : "text-foreground/70"}>
                      {result.vLevelDelta > 0 ? "+" : ""}{result.vLevelDelta.toFixed(2)}
                    </span>
                  </div>
                )}
                {nudges.slice(0, 4).map((n) => (
                  <div key={n.id} className="flex items-center justify-between text-sm">
                    <span>{DIM_LABELS[n.id] || n.id}</span>
                    <span className="text-primary">+{n.delta.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Loops touched */}
          {result.loopsTouched.length > 0 && (
            <div className="mt-4 rounded-2xl border border-border/40 bg-card/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Patterns touched
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {result.loopsTouched.slice(0, 6).map((id) => (
                  <li key={id}>· {getLoopName(id)}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Next — what to carry forward */}
          {result.nextTeaser && (
            <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed">
              <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-primary/80">
                <ArrowUpRight className="h-3 w-3" />
                Next
              </p>
              <p className="mt-1.5 text-foreground/85">{result.nextTeaser}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="outline" onClick={onAnalytics} className="rounded-full">
              See analytics
            </Button>
            <Button onClick={onHome} className="rounded-full">
              Return
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
