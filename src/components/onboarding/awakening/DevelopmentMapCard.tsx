/**
 * DevelopmentMapCard — the capability map, rendered honestly.
 * ─────────────────────────────────
 * Eight provisional indicators, each with its evidence level and its data
 * count. Never a score of a person — the card says so, in plain words.
 */
import { motion } from "framer-motion";
import type { CapabilityId, CapabilityMap } from "@/lib/onboarding/awakening";
import { CAPABILITY_LABEL, CAPABILITY_QUESTION } from "@/lib/onboarding/awakening";

const EVIDENCE_LABEL: Record<string, string> = {
  hypothesized: "no data yet",
  self_reported: "self-reported",
  measured: "measured",
};

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.1 + i * 0.06, duration: 0.5, ease: "easeOut" as const },
});

export default function DevelopmentMapCard({
  map,
  compact = false,
}: {
  map: CapabilityMap;
  compact?: boolean;
}) {
  const ranked = (Object.keys(map.scores) as CapabilityId[]).sort((a, b) => map.scores[a] - map.scores[b]);

  return (
    <div className="rounded-3xl border border-border/40 bg-card/40 px-5 py-4">
      <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/80 mb-1">
        Your development map
      </p>
      <p className="text-[11.5px] text-muted-foreground/70 mb-4 leading-relaxed">
        Eight capabilities, read provisionally. An indicator, not a measurement of you — any single
        answer can move it.
      </p>

      <div className="space-y-2.5">
        {ranked.map((c, i) => (
          <motion.div key={c} {...stagger(i)}>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-[13px] font-display text-foreground/90">
                {CAPABILITY_LABEL[c]}
                {c === map.weakest && (
                  <span className="ml-2 text-[10px] text-primary/80">growth edge</span>
                )}
                {c === map.strongest && (
                  <span className="ml-2 text-[10px] text-primary/60">strongest</span>
                )}
              </span>
              <span className="text-[11px] text-muted-foreground/70 tabular-nums">
                {map.scores[c].toFixed(1)} · {EVIDENCE_LABEL[map.levels[c]]}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-border/30 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary/70"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (map.scores[c] / 10) * 100)}%` }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              />
            </div>
            {!compact && (
              <p className="text-[10.5px] text-muted-foreground/60 mt-0.5 leading-snug">
                {CAPABILITY_QUESTION[c]}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground/70 mt-4 leading-relaxed tabular-nums">
        {map.answeredCount} answers · {ranked.filter((c) => map.levels[c] === "measured").length} measured
      </p>
    </div>
  );
}
