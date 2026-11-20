import { motion } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";
import { useKarma } from "@/hooks/useKarma";

interface KarmaChipProps {
  className?: string;
  /** compact = legacy small pill (kept for backwards compatibility) */
  compact?: boolean;
  /** hero = large, centered, world-class presentation */
  variant?: "chip" | "hero";
}

export default function KarmaChip({
  className = "",
  compact = false,
  variant = "hero",
}: KarmaChipProps) {
  const { data } = useKarma();
  // Always render — show 0 karma until data arrives so the hero never
  // disappears (previously this returned null and the user saw an empty space).
  const points = data?.points ?? 0;
  const to_next = data?.to_next ?? 300;
  const next_threshold = data?.next_threshold ?? 300;

  // Progress to next breakthrough (0..1)
  const prevThreshold =
    next_threshold === 300 ? 0 : next_threshold === 1000 ? 300 : 1000;
  const span = next_threshold ? next_threshold - prevThreshold : 1;
  const progress = next_threshold
    ? Math.max(0, Math.min(1, (points - prevThreshold) / span))
    : 1;

  const nextLabel =
    next_threshold === 300
      ? "Minor Breakthrough ✨"
      : next_threshold === 1000
      ? "Major Breakthrough 🌟"
      : "All breakthroughs unlocked";

  // ── Legacy compact chip ───────────────────────────────────────────────────
  if (variant === "chip") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card border-0 ${className}`}
        title={
          next_threshold
            ? `${to_next} karma to ${nextLabel}`
            : "All breakthroughs unlocked"
        }
      >
        <Flame className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-display font-semibold text-foreground tabular-nums">
          {points.toLocaleString()}
        </span>
        {!compact && next_threshold && (
          <span className="text-[10px] font-body text-muted-foreground">
            · {to_next} to next
          </span>
        )}
      </motion.div>
    );
  }

  // ── Hero variant ──────────────────────────────────────────────────────────
  const RING_SIZE = 92;
  const STROKE = 5;
  const radius = Math.max(0, (RING_SIZE - STROKE) / 2);
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`relative mx-auto flex flex-col items-center ${className}`}
    >
      {/* Soft aura */}
      <div className="absolute -inset-10 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center">
        {/* Ring + center */}
        <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
          {/* Pulsing halo */}
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/15 blur-xl"
            animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />

          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            className="relative -rotate-90"
            aria-hidden="true"
          >
            {/* Track */}
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={radius}
              fill="none"
              stroke="hsl(var(--border))"
              strokeOpacity={0.35}
              strokeWidth={STROKE}
            />
            {/* Progress */}
            <motion.circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={radius}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.55))" }}
            />
          </svg>

          {/* Center value */}
          <div className="absolute inset-0 flex items-center justify-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-primary" />
            <span className="text-2xl font-display font-semibold text-foreground tabular-nums leading-none">
              {points.toLocaleString()}
            </span>
          </div>
        </div>
        <span className="text-[9px] font-display tracking-[0.32em] uppercase text-muted-foreground/70 mt-2">
          karma
        </span>
      </div>

    </motion.div>
  );
}
