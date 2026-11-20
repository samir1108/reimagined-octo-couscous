/**
 * TheMirror — the post-eleven mapping reveal (Gate 4).
 * ─────────────────────────────────
 * After the eleven sittings, the user finally sees what was assembled from
 * a thousand small answers: where they sit on the spiral (with
 * micro-level), how the four dimensions read, which loops run loudest,
 * which archetype they currently answer to — and one honest synthesis.
 *
 * Nothing here is a verdict. It is a photograph with a timestamp — and it
 * unlocks the journeys.
 */
import { motion } from "framer-motion";
import { ChevronRight, Compass } from "lucide-react";
import { ARCHETYPE_BY_SLUG, type ArchetypeSlug } from "@/data/onboarding/archetypes";
import { usePublishMirror } from "@/hooks/usePublishMirror";
import {
  SPIRAL_BANDS,
  loopName,
  loopHint,
  dimensionLabel,
} from "@/lib/onboarding/firstElevenEngine";
import type { FirstElevenMapping, SEDimension } from "@/lib/onboarding/firstElevenTypes";

interface Props {
  mapping: FirstElevenMapping;
  onDone: () => void;
  /** Override the CTA label (the in-runner flow leads with the spiral explainer). */
  ctaLabel?: string;
}

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.15 + i * 0.18, duration: 0.6, ease: "easeOut" as const },
});

export default function TheMirror({ mapping, onDone, ctaLabel = "Choose your journey" }: Props) {
  const weakest = (Object.entries(mapping.dimensions) as [SEDimension, number][]).sort(
    (a, b) => a[1] - b[1]
  )[0]?.[0];
  const bandIdx = Math.round(mapping.band);
  const archetype = ARCHETYPE_BY_SLUG[mapping.archetypeHint as ArchetypeSlug];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-[100dvh] bg-background px-5 py-10"
    >
      <div className="w-full max-w-md mx-auto">
        {/* ─── Header ─── */}
        <motion.p {...stagger(0)} className="text-[10px] uppercase tracking-[0.32em] text-primary/80 text-center mb-2">
          The eleven are complete
        </motion.p>
        <motion.h1 {...stagger(1)} className="font-display text-3xl text-foreground text-center leading-tight mb-2">
          Your map.
        </motion.h1>
        <motion.p {...stagger(1)} className="text-xs text-muted-foreground text-center mb-8">
          A photograph with a timestamp — bands move, and that is the whole point.
        </motion.p>

        {/* ─── Spiral position ─── */}
        <motion.div
          {...stagger(2)}
          className="rounded-3xl border border-primary/30 bg-gradient-to-b from-primary/10 to-transparent px-5 py-5 mb-3"
        >
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/80 mb-2">
            Where you sit on the spiral
          </p>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-display text-4xl text-primary tabular-nums">{mapping.bandMicro}</span>
            <span className="font-display text-lg text-foreground/90">{mapping.bandLabel}</span>
          </div>

          {/* 11-band strip */}
          <div className="flex items-end gap-1 mb-2">
            {SPIRAL_BANDS.map((b) => (
              <div key={b.band} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-full transition-all ${
                    b.band === bandIdx
                      ? "h-6 bg-primary"
                      : b.band < bandIdx
                        ? "h-2 bg-primary/40"
                        : "h-2 bg-border/40"
                  }`}
                />
                <span
                  className={`text-[8px] tabular-nums ${
                    b.band === bandIdx ? "text-primary" : "text-muted-foreground/50"
                  }`}
                >
                  {b.band}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            A spiral, not a ladder — you will revisit money, power, and love at every level.
            The question is never "how high", only "how awake at this exact place".
          </p>
        </motion.div>

        {/* ─── Dimensions ─── */}
        <motion.div {...stagger(3)} className="rounded-3xl border border-border/40 bg-card/40 px-5 py-4 mb-3">
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/80 mb-3">
            The four dimensions
          </p>
          <div className="space-y-2.5">
            {(Object.entries(mapping.dimensions) as [SEDimension, number][])
              .sort((a, b) => b[1] - a[1])
              .map(([dim, value]) => (
                <div key={dim}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[13px] font-display text-foreground/90">
                      {dimensionLabel(dim)}
                      {dim === weakest && (
                        <span className="ml-2 text-[10px] text-primary/80">your door</span>
                      )}
                    </span>
                    <span className="text-[12px] tabular-nums text-muted-foreground">{value.toFixed(1)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border/30 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary/70"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (value / 10) * 100)}%` }}
                      transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
          </div>
          <p className="text-[12px] text-muted-foreground mt-3 leading-relaxed">
            The weakest dimension is not a flaw — it is where the next practice should aim.
          </p>
        </motion.div>

        {/* ─── Loops ─── */}
        <motion.div {...stagger(4)} className="rounded-3xl border border-border/40 bg-card/40 px-5 py-4 mb-3">
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/80 mb-2">
            Loudest loops
          </p>
          {mapping.loops.length === 0 ? (
            <p className="text-[12.5px] text-muted-foreground">Nothing loud yet — the doing will find them.</p>
          ) : (
            <ul className="space-y-2">
              {mapping.loops.slice(0, 3).map((l) => (
                <li key={l.id} className="rounded-2xl border border-border/25 bg-background/30 px-3.5 py-2.5">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-display text-[14px] text-foreground/90">{loopName(l.id)}</span>
                    <span className="text-[10px] tabular-nums text-muted-foreground/60">{l.score}</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-snug">{loopHint(l.id)}</p>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* ─── Archetype ─── */}
        <motion.div {...stagger(5)} className="rounded-3xl border border-border/40 bg-card/40 px-5 py-4 mb-3">
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/80 mb-1">
            The archetype you currently answer to
          </p>
          <p className="font-display text-lg text-foreground">
            {archetype?.name ?? mapping.archetypeHint}
          </p>
          <p className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed">
            {archetype?.oneLine ?? "It shifts as the bands shift."}
          </p>
        </motion.div>

        {/* ─── Synthesis ─── */}
        <motion.div {...stagger(6)} className="rounded-3xl border border-border/40 bg-card/40 px-5 py-4 mb-3">
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/80 mb-2">
            Synthesis
          </p>
          <div className="space-y-2">
            {mapping.summaryLines.map((line, i) => (
              <p key={i} className="text-[13px] text-foreground/85 leading-relaxed">
                {line}
              </p>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground/70 mt-3 tabular-nums">
            {mapping.answeredCount} questions answered · {mapping.summaryLines.length ? "map stable" : "map forming"}
          </p>
        </motion.div>

        {/* ─── CTA ─── */}
        <motion.div {...stagger(7)} className="flex flex-col items-center gap-3 pt-2 pb-8">
          <p className="text-[12.5px] text-muted-foreground text-center max-w-[300px] leading-relaxed">
            The map is drawn. Now the second question, the only one that matters:
            where do you want to go?
          </p>
          <button
            onClick={onDone}
            className="px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-display tracking-wide flex items-center gap-2 hover:bg-primary/90 transition"
          >
            <Compass className="h-4 w-4" />
            {ctaLabel}
            <ChevronRight className="h-4 w-4" />
          </button>
          <p className="text-[11px] text-muted-foreground/80 max-w-[280px] text-center leading-relaxed">
            You can return to this map any time from the app. It recalculates with every sitting.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
