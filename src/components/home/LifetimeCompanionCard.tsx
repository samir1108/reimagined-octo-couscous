import { motion } from "framer-motion";
import { Infinity as InfinityIcon, Heart, Compass, Sparkles } from "lucide-react";
import { useLifetimeCompanion } from "@/hooks/useLifetimeCompanion";

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

interface Props {
  userId: string | null | undefined;
}

/**
 * Surfaces Batch 9 (Lifetime Phase) + Batch 14 (Relationship, Life Stage, Retention)
 * as a single quiet card on Home — the "lifetime companion" pulse.
 */
export default function LifetimeCompanionCard({ userId }: Props) {
  const { data, isLoading } = useLifetimeCompanion(userId);
  if (!userId || isLoading || !data) return null;

  const { phase, phaseProgress, relationship, lifeStageProfile, retention, vLevel } = data;
  const phasePct = Math.round(phaseProgress * 100);

  return (
    <motion.div
      className="glass-card rounded-2xl p-4 space-y-3"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <InfinityIcon className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-display tracking-[0.2em] uppercase text-primary font-semibold">
            Lifetime Companion
          </span>
        </div>
        <span className="text-[10px] font-display text-muted-foreground/70">
          V-Level {vLevel.toFixed(1)}
        </span>
      </div>

      {/* Phase */}
      <div className="glass-subtle rounded-xl p-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-foreground/60" />
            <span className="text-[11px] font-display font-semibold text-foreground">
              Phase {phase.phase} · {phase.name}
            </span>
          </div>
          <span className="text-[10px] font-display text-muted-foreground">{phasePct}%</span>
        </div>
        <p className="text-[11px] text-muted-foreground font-body leading-relaxed mb-2">
          {phase.description}
        </p>
        <div className="h-1 rounded-full bg-muted/30 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${phasePct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Relationship + Life Stage */}
      <div className="grid grid-cols-2 gap-2">
        <div className="glass-subtle rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Heart className="w-3 h-3 text-primary/80" />
            <span className="text-[9px] font-display tracking-[0.15em] uppercase text-muted-foreground/70">
              Relationship
            </span>
          </div>
          <p className="text-[11px] font-display font-semibold text-foreground capitalize">
            {relationship.phase}
          </p>
          <p className="text-[10px] text-muted-foreground/80 font-body">
            Day {relationship.daysKnown}
          </p>
        </div>

        <div className="glass-subtle rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Compass className="w-3 h-3 text-secondary/80" />
            <span className="text-[9px] font-display tracking-[0.15em] uppercase text-muted-foreground/70">
              Life Stage
            </span>
          </div>
          <p className="text-[11px] font-display font-semibold text-foreground">
            {lifeStageProfile.label}
          </p>
          <p className="text-[10px] text-muted-foreground/80 font-body line-clamp-1">
            {lifeStageProfile.practiceBias}
          </p>
        </div>
      </div>

      {/* Retention prescription — only if it has copy */}
      {retention.copy && retention.risk !== "thriving" && (
        <motion.div
          className="rounded-xl p-2.5 bg-accent/10 border border-accent/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[10px] font-display uppercase tracking-[0.15em] text-accent-foreground/80 mb-0.5">
            A note for you
          </p>
          <p className="text-[11px] text-foreground/85 font-body leading-relaxed">
            {retention.copy}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
