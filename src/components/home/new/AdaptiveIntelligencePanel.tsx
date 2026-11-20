"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { AlertCircle, Brain, Sparkles, Target, TrendingUp, Zap, ChevronDown } from "lucide-react";

interface AdaptiveIntelligencePanelProps {
  insight: {
    type: "loop" | "dimension" | "arc" | "celebration" | "crisis";
    message: string;
    action?: string;
  } | null;
  activeLoops: string[];
  vLevel: number;
  streak: number;
  onQuickStart: (duration: number, energy: "low" | "medium" | "high") => void;
  onOpenGuide: () => void;
  onOpenPractice: () => void;
  className?: string;
}

const typeIcons = {
  loop: AlertCircle,
  dimension: Brain,
  arc: Target,
  celebration: Sparkles,
  crisis: Zap,
};

const typeColors = {
  loop: "bg-destructive/10 border-destructive/20 text-destructive",
  dimension: "bg-blue/10 border-blue/20 text-blue",
  arc: "bg-amber/10 border-amber/20 text-amber",
  celebration: "bg-green/10 border-green/20 text-green",
  crisis: "bg-destructive/10 border-destructive/20 text-destructive animate-pulse",
};

const typeLabels = {
  loop: "Loop Alert",
  dimension: "Dimension Starved",
  arc: "Arc Shift",
  celebration: "Streak Momentum",
  crisis: "Crisis Mode",
};

export function AdaptiveIntelligencePanel({
  insight,
  activeLoops,
  vLevel,
  streak,
  onQuickStart,
  onOpenGuide,
  onOpenPractice,
  className = "",
}: AdaptiveIntelligencePanelProps) {
  const reducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(true);

  if (!insight) return null;

  const Icon = typeIcons[insight.type];
  const colorClass = typeColors[insight.type];
  const label = typeLabels[insight.type];

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
      className={`w-full max-w-2xl mx-auto ${className}`}
    >
      <details className={expanded ? "open" : ""} onToggle={() => setExpanded(!expanded)}>
        <summary className="flex items-center gap-3 cursor-pointer p-4 bg-background/40 backdrop-blur-md border border-border/30 rounded-2xl list-none">
          <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-display font-medium text-foreground">Adaptive Intelligence</h3>
            <p className="text-xs text-muted-foreground">{label} · Per-moment guidance from unified brain</p>
          </div>
          <ChevronDown className="text-muted-foreground transition-transform duration-200" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} />
        </summary>
        <div className="px-4 pb-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-3">
            {/* Primary Insight */}
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              className={`p-4 rounded-xl ${colorClass}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{insight.message}</p>
                  {insight.action && (
                    <p className="text-sm text-foreground/80 mt-1">→ {insight.action}</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Additional Context Cards */}
            <div className="grid grid-cols-2 gap-2">
              {activeLoops.length > 0 && (
                <motion.div
                  initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
                  animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
                  className="p-3 bg-background/40 border border-border/30 rounded-xl"
                >
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Active Loops</p>
                  <div className="flex flex-wrap gap-1">
                    {activeLoops.slice(0, 4).map(loop => (
                      <span key={loop} className="px-2 py-0.5 text-[11px] bg-destructive/10 border border-destructive/20 text-destructive rounded-full">
                        {loop}
                      </span>
                    ))}
                    {activeLoops.length > 4 && (
                      <span className="px-2 py-0.5 text-[11px] bg-muted/50 text-muted-foreground rounded-full">
                        +{activeLoops.length - 4}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}

              {vLevel > 0 && vLevel < 2 && (
                <motion.div
                  initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
                  animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
                  className="p-3 bg-background/40 border border-border/30 rounded-xl"
                >
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Foundation Phase</p>
                  <p className="text-sm text-foreground">V-Level {vLevel.toFixed(1)} — consistency over depth</p>
                </motion.div>
              )}

              {streak >= 7 && (
                <motion.div
                  initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
                  animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
                  className="p-3 bg-background/40 border border-border/30 rounded-xl"
                >
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Streak</p>
                  <p className="text-sm text-foreground">{streak} days — {streak >= 21 ? "Habit formed" : streak >= 14 ? "Building momentum" : "Early days"}</p>
                </motion.div>
              )}

              {insight.type === "crisis" && (
                <motion.div
                  initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
                  animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
                  className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl"
                >
                  <p className="text-xs font-medium text-destructive uppercase tracking-wide mb-1">Crisis Support</p>
                  <p className="text-sm text-foreground">988 (US) · 116 123 (UK) · Local: <a href="https://findahelpline.com" target="_blank" rel="noopener" className="underline hover:text-primary">findahelpline.com</a></p>
                </motion.div>
              )}
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-2 pt-2"
            >
              <button 
                onClick={() => onQuickStart(5, "medium")}
                className="p-3 bg-background/40 border border-border/30 rounded-xl text-left hover:border-primary/50 transition-colors flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium text-sm text-foreground">5-min Quick</p>
                  <p className="text-xs text-muted-foreground">Breath + witness</p>
                </div>
              </button>
              <button 
                onClick={() => onQuickStart(15, "medium")}
                className="p-3 bg-background/40 border border-border/30 rounded-xl text-left hover:border-primary/50 transition-colors flex items-center gap-2"
              >
                <Target className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium text-sm text-foreground">15-min Standard</p>
                  <p className="text-xs text-muted-foreground">Full practice flow</p>
                </div>
              </button>
              <button 
                onClick={onOpenGuide}
                className="p-3 bg-background/40 border border-border/30 rounded-xl text-left hover:border-primary/50 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium text-sm text-foreground">Open Guide</p>
                  <p className="text-xs text-muted-foreground">Chat with your master</p>
                </div>
              </button>
              <button 
                onClick={onOpenPractice}
                className="p-3 bg-background/40 border border-border/30 rounded-xl text-left hover:border-primary/50 transition-colors flex items-center gap-2"
              >
                <Brain className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium text-sm text-foreground">Practice Tab</p>
                  <p className="text-xs text-muted-foreground">Self-guided sessions</p>
                </div>
              </button>
            </motion.div>
          </div>
        </div>
      </details>
    </motion.div>
  );
}

