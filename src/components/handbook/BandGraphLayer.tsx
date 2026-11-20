/**
 * BandGraphLayer — what the knowledge graph sees at a band.
 * ──────────────────────────────────────────────────────────
 * Renders behind each band of the handbook: the loops its behavioral markers
 * indicate, the chakra centers they live in, the psychic knot holding the band,
 * and any energetic signs that may surface — with the graph's own confidence
 * stated honestly instead of implied.
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { getEngine } from "@/lib/graph/engine";
import { SAFETY_TIER_LABEL } from "@/data/kundaliniSigns";

const SAFETY_STYLES: Record<string, string> = {
  normal: "border-foreground/20 bg-foreground/5 text-foreground/80",
  "check-in": "border-amber-500/40 bg-amber-500/10 text-amber-200",
  "stop-and-support": "border-destructive/40 bg-destructive/10 text-destructive",
};

export default function BandGraphLayer({ band }: { band: number }) {
  const profile = useMemo(() => getEngine().stageProfile(band), [band]);

  if (!profile) return null;

  const loops = profile.loops.slice(0, 14);
  const hasGraphSignal = loops.length > 0 || profile.topChakras.length > 0;

  return (
    <section className="rounded-3xl border border-border/40 bg-background/40 p-6 md:p-8 space-y-8">
      <div>
        <h3 className="font-display text-xl md:text-2xl mb-1">What the graph sees</h3>
        <p className="text-sm text-muted-foreground leading-snug max-w-2xl">
          The knowledge graph reads this band's {profile.markerCount} markers against 400+ behavioral loops,
          6 dimensions, and 7 energy centers.{" "}
          {profile.markerCount - profile.maturityCount} are behavioral signatures;
          {" "}{profile.maturityCount} are capacity signatures — what mastery looks like here, not what is broken.
        </p>
        <p className="text-[11px] text-muted-foreground/70 mt-2">
          Classification confidence at this band: {(profile.avgConfidence * 100).toFixed(0)}% — the graph states its own certainty rather than implying it.
        </p>
      </div>

      {!hasGraphSignal && (
        <p className="text-sm text-muted-foreground italic">
          No behavioral signal mapped at this band yet — this is a known gap in the graph, not a statement about the band.
        </p>
      )}

      {loops.length > 0 && (
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.3em] text-foreground/50 mb-3">Loops this band runs</h4>
          <div className="flex flex-wrap gap-2">
            {loops.map(({ loop, weight }) => (
              <motion.span
                key={loop.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-sm text-foreground/85"
                style={{ opacity: 0.55 + weight * 0.45 }}
                title={`Graph confidence: ${(weight * 100).toFixed(0)}%`}
              >
                {loop.label}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {profile.topChakras.length > 0 && (
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.3em] text-foreground/50 mb-3">Where it lives in the body</h4>
          <div className="flex flex-wrap gap-2">
            {profile.topChakras.map(({ chakra, count }) => (
              <span key={chakra.id} className="rounded-full border border-border/40 px-3 py-1.5 text-sm text-foreground/80">
                {chakra.label.replace(" Chakra", "")}
                <span className="text-foreground/40 ml-1.5">×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {profile.granthis.length > 0 && (
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.3em] text-foreground/50 mb-3">The knot that holds this band</h4>
          <div className="space-y-3">
            {profile.granthis.map((g) => (
              <div key={g.id} className="rounded-2xl border border-border/40 bg-foreground/[0.03] px-4 py-3">
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <span className="font-display text-base">{g.label}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {(g.data as { chakra?: string }).chakra}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 leading-snug">{(g.data as { knotOf?: string }).knotOf}</p>
                <p className="text-sm text-foreground/60 leading-snug mt-2 italic">{(g.data as { dissolution?: string }).dissolution}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.kundaliniSigns.length > 0 && (
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.3em] text-foreground/50 mb-3">Signs that may surface here</h4>
          <div className="space-y-3">
            {profile.kundaliniSigns.map((s) => {
              const data = s.data as { safety?: string; grounding?: string; tradition?: string };
              return (
                <details key={s.id} className="rounded-2xl border border-border/40 bg-foreground/[0.03] px-4 py-3 group">
                  <summary className="flex items-center justify-between gap-3 cursor-pointer list-none">
                    <span className="font-display text-base">{s.label}</span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] ${SAFETY_STYLES[data.safety ?? "normal"]}`}>
                      {SAFETY_TIER_LABEL[(data.safety ?? "normal") as keyof typeof SAFETY_TIER_LABEL]}
                    </span>
                  </summary>
                  <p className="text-sm text-foreground/80 leading-snug mt-3">{data.grounding}</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-2 italic">{data.tradition}</p>
                </details>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
