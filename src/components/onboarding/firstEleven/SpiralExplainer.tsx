/**
 * SpiralExplainer — the framework, in detail, after the mapping (Gate 5).
 * ─────────────────────────────────
 * The Mirror showed the user WHERE they sit. This teaches the map itself:
 * the four principles that keep it honest, then all eleven bands with their
 * core fear, their 2026 felt-sense, their micro-level read, and what moves
 * a person through. The user's current band carries a "you are here" mark.
 */
import { motion } from "framer-motion";
import { ChevronRight, Compass } from "lucide-react";
import {
  SPIRAL_FRAMEWORK,
  SPIRAL_PRINCIPLES,
  type SpiralBand,
} from "@/lib/onboarding/spiralFramework";

interface Props {
  /** The user's current band (0–10), for the "you are here" mark. */
  currentBand?: number;
  onDone: () => void;
}

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.12 + i * 0.1, duration: 0.6, ease: "easeOut" as const },
});

export default function SpiralExplainer({ currentBand, onDone }: Props) {
  const currentIdx = currentBand === undefined
    ? -1
    : Math.max(0, Math.min(10, Math.round(currentBand)));

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
          The map, explained
        </motion.p>
        <motion.h1 {...stagger(1)} className="font-display text-3xl text-foreground text-center leading-tight mb-2">
          The Spiral.
        </motion.h1>
        <motion.p {...stagger(1)} className="text-xs text-muted-foreground text-center mb-8 leading-relaxed">
          Eleven bands of being human. Not a ranking — a map of what runs the show
          at each level, and what it costs to skip a level.
        </motion.p>

        {/* ─── Principles ─── */}
        {SPIRAL_PRINCIPLES.map((p, i) => (
          <motion.div
            key={p.id}
            {...stagger(2 + i)}
            className="rounded-3xl border border-primary/25 bg-primary/[0.06] px-5 py-4 mb-3"
          >
            <p className="font-display text-[15px] text-foreground mb-1">{p.title}</p>
            <p className="text-[12.5px] text-muted-foreground leading-relaxed">{p.body}</p>
          </motion.div>
        ))}

        {/* ─── The eleven bands ─── */}
        <motion.p {...stagger(6)} className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground/80 text-center mt-8 mb-4">
          The eleven bands
        </motion.p>

        <div className="space-y-3 pb-4">
          {SPIRAL_FRAMEWORK.map((band, i) => (
            <BandCard key={band.band} band={band} index={i} isCurrent={band.band === currentIdx} />
          ))}
        </div>

        {/* ─── CTA ─── */}
        <motion.div {...stagger(17)} className="flex flex-col items-center gap-3 pt-4 pb-8">
          <p className="text-[12.5px] text-muted-foreground text-center max-w-[300px] leading-relaxed">
            The map is yours now. The only question left is which direction to walk in it.
          </p>
          <button
            onClick={onDone}
            className="px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-display tracking-wide flex items-center gap-2 hover:bg-primary/90 transition"
          >
            <Compass className="h-4 w-4" />
            Choose your journey
            <ChevronRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

function BandCard({
  band, index, isCurrent,
}: {
  band: SpiralBand;
  index: number;
  isCurrent: boolean;
}) {
  return (
    <motion.div
      {...stagger(7 + index)}
      className={`rounded-3xl border px-5 py-4 ${
        isCurrent
          ? "border-primary/60 bg-primary/[0.08] shadow-[0_0_40px_-16px_hsl(var(--primary)/0.6)]"
          : "border-border/40 bg-card/40"
      }`}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <span
          className={`h-7 w-7 shrink-0 grid place-items-center rounded-full font-display text-[13px] tabular-nums ${
            isCurrent ? "bg-primary text-primary-foreground" : "bg-border/40 text-muted-foreground"
          }`}
        >
          {band.band}
        </span>
        <span className="font-display text-[16px] text-foreground">{band.name}</span>
        {isCurrent && (
          <span className="ml-auto text-[9px] uppercase tracking-[0.2em] text-primary font-display">
            you are here
          </span>
        )}
      </div>

      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70 mb-2">
        Core fear · {band.fear}
      </p>

      <p className="text-[13px] text-foreground/85 leading-relaxed mb-2">{band.in2026}</p>
      <p className="text-[12px] text-muted-foreground leading-relaxed mb-2 italic">{band.micro}</p>

      <div className="flex items-start gap-1.5 pt-1">
        <span className="text-[10px] uppercase tracking-[0.2em] text-primary/80 font-display shrink-0 mt-0.5">
          Through
        </span>
        <span className="text-[12.5px] text-muted-foreground leading-relaxed">{band.through}</span>
      </div>
    </motion.div>
  );
}
