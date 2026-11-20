/**
 * CScoreStrip — compact always-visible Consciousness Score header
 * for the top of Analytics. Tap → switches to the "overview" tab for full breakdown.
 */
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";
import { calculateScore, getTier } from "@/components/ConsciousnessScore";
import type { ConsciousnessProfile, EnginePlan } from "@/hooks/useConsciousnessEngine";

interface Props {
  profile?: ConsciousnessProfile;
  plan?: EnginePlan;
  onTap?: () => void;
}

export default function CScoreStrip({ profile, plan, onTap }: Props) {
  const score = calculateScore(profile, plan);
  const tier = getTier(score.total);
  const TrendIcon = score.trend === "up" ? TrendingUp : score.trend === "down" ? TrendingDown : Minus;

  return (
    <motion.button
      type="button"
      onClick={onTap}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="w-full text-left glass-card rounded-2xl p-4 border border-border/40 hover:border-primary/30 transition-all group flex items-center gap-4"
    >
      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${tier.ring} flex items-center justify-center flex-shrink-0`}>
        <span className={`text-xl font-display font-bold ${tier.color}`}>
          {score.total}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-display tracking-[0.22em] uppercase text-muted-foreground/80 mb-0.5">
          Consciousness Score
        </p>
        <p className="text-sm font-display font-semibold text-foreground">
          {tier.label} <span className="text-muted-foreground font-normal">· of 1000</span>
        </p>
        <div className="flex items-center gap-1 mt-0.5 text-[11px] text-muted-foreground">
          <TrendIcon className="w-3 h-3" />
          <span>{score.trend === "up" ? "Rising" : score.trend === "down" ? "Dipping" : "Steady"} this week</span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition" />
    </motion.button>
  );
}
