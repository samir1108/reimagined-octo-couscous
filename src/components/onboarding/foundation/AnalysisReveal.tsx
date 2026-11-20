import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { getLoopName } from "@/lib/onboarding/getLoopName";
import { ARCHETYPES } from "@/data/onboarding/archetypes";
import { SECONDARY_PATHS } from "@/lib/onboarding/pathDefinitions";
import type { FoundationAnalysis } from "@/lib/onboarding/foundationAnalyzer";

interface Props {
  analysis: FoundationAnalysis;
  onNext: () => void;
}

const BRAIN_COPY: Record<string, { label: string; line: string }> = {
  head: { label: "Head-led", line: "You think first. We'll honour that, then teach the body to catch up." },
  heart: { label: "Heart-led", line: "You feel first. We'll keep that open, and add a witness behind it." },
  gut: { label: "Gut-led", line: "You move first. We'll slow you just enough to hear what's underneath." },
};

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.15 + i * 0.18, duration: 0.6, ease: "easeOut" as const },
});

export default function AnalysisReveal({ analysis, onNext }: Props) {
  const brain = BRAIN_COPY[analysis.brain] ?? BRAIN_COPY.head;
  const loopNames = analysis.loops.map(getLoopName);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-[100dvh] bg-background flex items-center justify-center px-5 py-10"
    >
      <div className="w-full max-w-md">
        <motion.p {...stagger(0)} className="text-[10px] uppercase tracking-[0.32em] text-primary/80 text-center mb-2">
          Here is what I see
        </motion.p>
        <motion.p {...stagger(0)} className="text-[10px] uppercase tracking-[0.28em] text-primary/70 text-center mb-4">
          Step 4 of 4
        </motion.p>
        <motion.h1 {...stagger(1)} className="font-display text-2xl text-foreground text-center leading-snug mb-2">
          A first photograph,<br />not a verdict.
        </motion.h1>
        <motion.p {...stagger(1)} className="text-xs text-muted-foreground text-center mb-8">
          This will shift as you practice. None of it is fixed — that's the whole point.
        </motion.p>

        {/* Band */}
        <motion.div
          {...stagger(2)}
          className="rounded-3xl border border-primary/30 bg-gradient-to-b from-primary/10 to-transparent px-5 py-5 mb-3"
        >
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/80 mb-1">Starting band</p>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl text-primary tabular-nums">{Math.max(1, Math.min(11, Math.round(analysis.band)))}</span>
            <span className="font-display text-base text-foreground/90">{analysis.bandLabel}</span>
          </div>
          <p className="text-[12.5px] text-muted-foreground mt-1.5 leading-relaxed">
            We'll re-read this every few days. Bands move. That's the whole point.
          </p>
        </motion.div>

        {/* Brain */}
        <motion.div
          {...stagger(3)}
          className="rounded-3xl border border-border/40 bg-card/40 px-5 py-4 mb-3"
        >
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/80 mb-1">Dominant centre</p>
          <p className="font-display text-lg text-foreground">{brain.label}</p>
          <p className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed">{brain.line}</p>
        </motion.div>

        {/* Loops */}
        <motion.div
          {...stagger(4)}
          className="rounded-3xl border border-border/40 bg-card/40 px-5 py-4 mb-3"
        >
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/80 mb-2">Active loops</p>
          {analysis.loopRoot && (
            <p className="text-[12px] text-primary/85 mb-2">
              Root family: <span className="font-display">{analysis.loopRootLabel}</span>
            </p>
          )}
          {loopNames.length === 0 ? (
            <p className="text-[12.5px] text-muted-foreground">Nothing loud yet — we'll find them in the doing.</p>
          ) : (
            <ul className="space-y-1.5">
              {loopNames.map((n, i) => (
                <li key={analysis.loops[i]} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/70 shrink-0" />
                  <span className="text-[14px] text-foreground/90">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Archetype */}
        <motion.div
          {...stagger(5)}
          className="rounded-3xl border border-border/40 bg-card/40 px-5 py-4 mb-3"
        >
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/80 mb-1">Archetype belief</p>
          <p className="font-display text-lg text-foreground">
            {ARCHETYPES.find((a) => a.slug === analysis.archetypePrimary)?.name || analysis.archetypePrimary}
          </p>
          <p className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed">
            Shadow twin: {ARCHETYPES.find((a) => a.slug === analysis.archetypeShadow)?.name || analysis.archetypeShadow}
          </p>
        </motion.div>

        {/* Re-think */}
        <motion.div
          {...stagger(6)}
          className="rounded-3xl border border-border/40 bg-card/40 px-5 py-4 mb-3"
        >
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/80 mb-1">Re-think theme</p>
          <p className="font-display text-lg text-foreground">{analysis.reThinkTheme}</p>
        </motion.div>

        {/* Path */}
        <motion.div
          {...stagger(7)}
          className="rounded-3xl border border-border/40 bg-card/40 px-5 py-4 mb-8"
        >
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/80 mb-1">Path affinity</p>
          <div className="flex flex-wrap gap-2">
            {analysis.suggestedSecondary.map((pid) => {
              const p = SECONDARY_PATHS.find((sp) => sp.id === pid);
              return (
                <span key={pid} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[13px] font-display">
                  {p?.name || pid}
                </span>
              );
            })}
          </div>
        </motion.div>

        <motion.div {...stagger(8)} className="flex flex-col items-center gap-3">
          <button
            onClick={onNext}
            className="px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-display tracking-wide flex items-center gap-2 hover:bg-primary/90 transition"
          >
            Enter the app
            <ChevronRight className="h-4 w-4" />
          </button>
          <p className="text-[11px] text-muted-foreground/80 max-w-[260px] leading-relaxed">
            You can always return to your reading later from Settings. Nothing is final.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
