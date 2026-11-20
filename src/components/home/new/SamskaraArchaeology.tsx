"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, TrendingDown, Target, AlertCircle, Heart, Brain, Activity, Sparkles } from "lucide-react";

interface SamskaraArchaeologyProps {
  samskaras: Array<{
    rootWound: string;
    depth: number;
    loops: string[];
    firstSeen: string;
    healingTrajectory: {
      sessionsTargeting: number;
      dissolutionRate: number;
      projectedResolutionDay: number;
      onTrack: boolean;
    };
    insight: string;
  }>;
  onViewDetails: (rootWound: string) => void;
  className?: string;
}

const woundIcons: Record<string, React.ReactNode> = {
  unworthiness: <Heart className="w-4 h-4 text-destructive" />,
  unsafety: <AlertCircle className="w-4 h-4 text-amber" />,
  inner_void: <Target className="w-4 h-4 text-purple" />,
  abandonment: <Heart className="w-4 h-4 text-pink" />,
  repression: <Brain className="w-4 h-4 text-indigo" />,
  identity_fixation: <Brain className="w-4 h-4 text-blue" />,
  disconnection: <Activity className="w-4 h-4 text-green" />,
};

export function SamskaraArchaeology({
  samskaras,
  onViewDetails,
  className = "",
}: SamskaraArchaeologyProps) {
  const reducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(true);

  if (!samskaras.length) return null;

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
      className={`w-full max-w-2xl mx-auto ${className}`}
    >
      <details className={expanded ? "open" : ""} onToggle={() => setExpanded(!expanded)}>
        <summary className="flex items-center gap-3 cursor-pointer p-4 bg-background/40 backdrop-blur-md border border-border/30 rounded-2xl list-none">
          <div className="w-10 h-10 rounded-xl bg-purple/20 flex items-center justify-center">
            <Target className="text-purple w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-display font-medium text-foreground">Samskara Archaeology</h3>
            <p className="text-xs text-muted-foreground">Root wound healing trajectories</p>
          </div>
          <ChevronDown className="text-muted-foreground transition-transform duration-200" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} />
        </summary>
        <div className="px-4 pb-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-4">
            {samskaras.map((samskara, i) => (
              <motion.div
                key={samskara.rootWound}
                initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="p-4 bg-background/40 border border-border/30 rounded-xl"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center flex-shrink-0">
                    {woundIcons[samskara.rootWound] || <Target className="w-5 h-5 text-purple" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground capitalize">{samskara.rootWound.replace("_", " ")}</span>
                      <span className="px-2 py-0.5 text-xs bg-purple/20 text-purple rounded-full">{Math.round(samskara.depth * 100)}% depth</span>
                    </div>
                    <p className="text-xs text-muted-foreground">First seen: {samskara.firstSeen} · Loops: {samskara.loops.join(", ")}</p>
                  </div>
                </div>

                {/* Depth Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Healing Progress</span>
                    <span className="font-medium text-foreground">{Math.round((1 - samskara.depth) * 100)}% dissolved</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={reducedMotion ? {} : { width: 0 }}
                      animate={reducedMotion ? {} : { width: `${(1 - samskara.depth) * 100}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-purple to-pink rounded-full"
                    />
                  </div>
                </div>

                {/* Healing Trajectory */}
                <div className="grid grid-cols-3 gap-3 mb-3 p-3 bg-muted/30 border border-border/30 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-display font-bold text-foreground">{samskara.healingTrajectory.sessionsTargeting}</p>
                    <p className="text-xs text-muted-foreground">Sessions Targeting</p>
                  </div>
                  <div className="text-center border-x border-border/30 px-3">
                    <p className="text-2xl font-display font-bold text-foreground">{samskara.healingTrajectory.dissolutionRate.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Dissolution/Session</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-display font-bold text-foreground">Day {samskara.healingTrajectory.projectedResolutionDay}</p>
                    <p className="text-xs text-muted-foreground">Projected Resolution</p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${samskara.healingTrajectory.onTrack ? "bg-green/20 text-green" : "bg-amber/20 text-amber"}`}>
                    {samskara.healingTrajectory.onTrack ? "✓ On Track" : "⚠ Off Track"}
                  </span>
                  <TrendingDown className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Depth decreasing</span>
                </div>

                {/* Insight */}
                <motion.div
                  initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
                  animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
                  className="p-3 bg-purple/10 border border-purple/20 rounded-lg"
                >
                  <p className="text-sm text-foreground/90 italic">"{samskara.insight}"</p>
                </motion.div>

                <button
                  onClick={() => onViewDetails(samskara.rootWound)}
                  className="w-full mt-2 px-3 py-2 text-sm bg-background/40 border border-border/30 rounded-lg hover:border-primary/50 transition-colors text-left"
                >
                  View Details →
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </details>
    </motion.div>
  );
}