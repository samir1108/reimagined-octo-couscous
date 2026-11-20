/**
 * NextStepCard — what comes next, and why.
 * ─────────────────────────────────
 * The recommendation engine's output, rendered in plain language: the next
 * session, the capability it trains, and the reason it was chosen. The
 * system never invents an insight — it points at the map and explains.
 */
import { motion } from "framer-motion";
import { ChevronRight, Compass } from "lucide-react";
import type { Recommendation } from "@/lib/onboarding/awakening";
import { CAPABILITY_LABEL } from "@/lib/onboarding/awakening";

const CONFIDENCE: Record<string, string> = {
  hypothesized: "provisional — a first guess",
  self_reported: "provisional — from your own answers",
  measured: "measured — from your practices",
};

export default function NextStepCard({
  recommendation,
  onBegin,
  ctaLabel = "Begin the next session",
}: {
  recommendation: Recommendation;
  onBegin: () => void;
  ctaLabel?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="rounded-3xl border border-primary/30 bg-gradient-to-b from-primary/10 to-transparent px-5 py-5"
    >
      <div className="flex items-center gap-2 mb-2">
        <Compass className="h-4 w-4 text-primary/80" />
        <p className="text-[10px] uppercase tracking-[0.28em] text-primary/80 font-display">
          Next, and why
        </p>
      </div>

      <h3 className="font-display text-xl text-foreground leading-snug mb-3">
        {recommendation.sessionTitle}
      </h3>

      <p className="text-[13.5px] text-foreground/85 leading-relaxed mb-4">{recommendation.reason}</p>

      <div className="flex flex-wrap items-center gap-1.5 mb-5">
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Trains</span>
        {recommendation.targets.map((c) => (
          <span
            key={c}
            className="px-2.5 py-1 rounded-full border border-border/40 text-[11px] font-display text-foreground/80"
          >
            {CAPABILITY_LABEL[c]}
          </span>
        ))}
      </div>

      <button
        onClick={onBegin}
        className="w-full px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-display tracking-wide flex items-center justify-center gap-2 hover:bg-primary/90 transition"
      >
        {ctaLabel}
        <ChevronRight className="h-4 w-4" />
      </button>

      <p className="text-[10.5px] text-muted-foreground/60 text-center mt-3 tabular-nums">
        {CONFIDENCE[recommendation.confidence]}
      </p>
    </motion.div>
  );
}
