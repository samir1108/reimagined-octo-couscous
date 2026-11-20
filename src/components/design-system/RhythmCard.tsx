import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Progress, CircularProgress } from "./Progress";
import { Button } from "./Button";
import { Sun, Moon, Star, Heart, Brain, Leaf, Zap, Droplets, Activity, Waves, Clock, Calendar, CheckCircle, ChevronRight } from "lucide-react";

export interface RhythmCardProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  type: "circadian" | "ultradian" | "infradian" | "seasonal" | "lunar" | "personal";
  phase: "peak" | "rising" | "declining" | "trough" | "transition";
  alignment: number;
  currentEnergy: "high" | "medium" | "low";
  recommendedActivities?: string[];
  avoidActivities?: string[];
  nextTransition?: { phase: string; time: Date };
  duration?: string;
  onOptimize?: () => void;
}

export const RhythmCard = forwardRef<HTMLDivElement, RhythmCardProps>(
  ({
    className,
    name,
    type,
    phase,
    alignment,
    currentEnergy,
    recommendedActivities,
    avoidActivities,
    nextTransition,
    duration,
    onOptimize,
    ...props
  }, ref) => {
    const typeConfig = {
      circadian: { icon: Sun, color: "focus", label: "Circadian (24h)", period: "Daily" },
      ultradian: { icon: Waves, color: "observation", label: "Ultradian (90-120min)", period: "Every 90-120min" },
      infradian: { icon: Moon, color: "self-inquiry", label: "Infradian (>24h)", period: "Monthly" },
      seasonal: { icon: Leaf, color: "healing", label: "Seasonal", period: "Quarterly" },
      lunar: { icon: Star, color: "awakening", label: "Lunar (29.5 days)", period: "Monthly" },
      personal: { icon: Heart, color: "integration", label: "Personal Rhythm", period: "Unique" },
    };

    const phaseConfig = {
      peak: { label: "Peak Energy", color: "focus", icon: Activity, description: "Optimal for deep work & intense practice" },
      rising: { label: "Rising", color: "healing", icon: ArrowUpRight, description: "Building momentum, good for starting new things" },
      declining: { label: "Declining", color: "self-inquiry", icon: ChevronRight, description: "Winding down, complete tasks, reflect" },
      trough: { label: "Rest Phase", color: "sleep", icon: Moon, description: "Recovery time, gentle practices only" },
      transition: { label: "Transition", color: "meditation", icon: RotateCcw, description: "Between phases, practice awareness" },
    };

    const energyConfig = {
      high: { color: "focus", label: "High", bars: 3 },
      medium: { color: "meditation", label: "Medium", bars: 2 },
      low: { color: "sleep", label: "Low", bars: 1 },
    };

    const config = typeConfig[type];
    const phaseInfo = phaseConfig[phase];
    const energyInfo = energyConfig[currentEnergy];

    return (
      <Card
        ref={ref}
        variant="glass-gold"
        className={cn("p-6 space-y-6", className)}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", `text-${config.color} bg-${config.color}/15`)}>
              <config.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-h4 text-primary">{name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={config.color as any} size="sm">{config.label}</Badge>
                <Badge variant="gold-soft" size="xs">{config.period}</Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-caption text-muted">Alignment</div>
            <div className="flex items-center justify-end gap-2">
              <CircularProgress value={alignment} max={100} size={48} strokeWidth={4} semanticColor={phaseInfo.color} showLabel animate />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-elevated-surface/50">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", `text-${phaseInfo.color} bg-${phaseInfo.color}/15`)}>
              <phaseInfo.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-h5 text-primary">{phaseInfo.label}</div>
              <div className="text-caption text-muted">{phaseInfo.description}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-right">
            <div>
              <div className="text-caption text-muted">Current Energy</div>
              <div className="flex items-center justify-end gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={cn("w-2 h-6 rounded transition-colors", i < energyInfo.bars ? `bg-${energyInfo.color}` : "bg-border")} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {duration && (
          <div className="flex items-center gap-2 text-caption text-muted">
            <Clock className="w-3.5 h-3.5" />
            Phase duration: {duration}
          </div>
        )}

        {nextTransition && (
          <div className="p-3 rounded-xl bg-primary-gold/10 border border-primary-gold/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-primary-gold" />
                <span className="text-caption text-primary-gold">Next transition in</span>
              </div>
              <div className="text-right">
                <div className="text-body font-medium text-primary-gold">{formatTimeTo(nextTransition.time)}</div>
                <div className="text-caption text-muted">to {nextTransition.phase}</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {recommendedActivities && recommendedActivities.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-caption text-healing">
                <CheckCircle className="w-3.5 h-3.5" /> Recommended
              </div>
              <div className="flex flex-wrap gap-2">
                {recommendedActivities.map((activity, i) => (
                  <Badge key={i} variant="healing" size="sm" dot>{activity}</Badge>
                ))}
              </div>
            </div>
          )}

          {avoidActivities && avoidActivities.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-caption text-error">
                <AlertTriangle className="w-3.5 h-3.5" /> Avoid
              </div>
              <div className="flex flex-wrap gap-2">
                {avoidActivities.map((activity, i) => (
                  <Badge key={i} variant="shadow-work" size="sm" dot>{activity}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {onOptimize && (
          <Button variant="gold" fullWidth onClick={onOptimize}>
            Optimize This Rhythm
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </Card>
    );
  }
);

RhythmCard.displayName = "RhythmCard";

function formatTimeTo(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  if (diff <= 0) return "Now";
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

import { RotateCcw, AlertTriangle } from "lucide-react";