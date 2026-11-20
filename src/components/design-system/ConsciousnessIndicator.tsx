import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Progress, CircularProgress, RadialProgress } from "./Progress";
import { Button } from "./Button";
import { Brain, Eye, Heart, Sparkles, Zap, Leaf, Moon, Star, Activity, Layers, ChevronRight, TrendingUp, Target, Compass, Waves, Sun } from "lucide-react";

export interface ConsciousnessIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  level: number;
  maxLevel?: number;
  dimensions: Array<{
    name: string;
    value: number;
    maxValue: number;
    color: "observation" | "self-inquiry" | "meditation" | "healing" | "focus" | "shadow-work" | "awakening" | "sleep" | "integration" | "gold";
    icon?: React.ReactNode;
    description?: string;
  }>;
  overallState: "sleeping" | "waking" | "aware" | "expanded" | "unified";
  coherence?: number;
  resonance?: number;
  variant?: "compact" | "standard" | "detailed" | "orb";
  animate?: boolean;
  onDimensionClick?: (dimension: string) => void;
}

export const ConsciousnessIndicator = forwardRef<HTMLDivElement, ConsciousnessIndicatorProps>(
  ({
    className,
    level,
    maxLevel = 100,
    dimensions,
    overallState,
    coherence,
    resonance,
    variant = "standard",
    animate = true,
    onDimensionClick,
    ...props
  }, ref) => {
    const stateConfig = {
      sleeping: { label: "Deep Sleep", color: "sleep", icon: Moon, description: "Consciousness at rest" },
      waking: { label: "Waking Up", color: "self-inquiry", icon: Sun, description: "Awareness emerging" },
      aware: { label: "Fully Aware", color: "focus", icon: Eye, description: "Clear, present consciousness" },
      expanded: { label: "Expanded", color: "meditation", icon: Sparkles, description: "Awareness beyond self" },
      unified: { label: "Unified", color: "awakening", icon: Star, description: "Oneness with all" },
    };

    const stateInfo = stateConfig[overallState];
    const percentage = Math.min(Math.max((level / maxLevel) * 100, 0), 100);
    const levelColor = percentage >= 80 ? "awakening" : percentage >= 60 ? "meditation" : percentage >= 40 ? "focus" : percentage >= 20 ? "self-inquiry" : "shadow-work";

    if (variant === "compact") {
      return (
        <Card ref={ref} variant="glass-gold" className={cn("p-4 space-y-3", className)} {...props}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", `text-${stateInfo.color} bg-${stateInfo.color}/15`)}>
                <stateInfo.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-h5 text-primary">{stateInfo.label}</div>
                <div className="text-caption text-muted">Level {level} / {maxLevel}</div>
              </div>
            </div>
            <CircularProgress value={level} max={maxLevel} size={48} strokeWidth={4} semanticColor={levelColor} showLabel animate={animate} />
          </div>
          {coherence !== undefined && (
            <div className="flex items-center gap-4 text-caption">
              <span className="flex items-center gap-1 text-muted"><Brain className="w-3.5 h-3.5" /> Coherence: {Math.round(coherence * 100)}%</span>
              {resonance !== undefined && <span className="flex items-center gap-1 text-muted"><Waves className="w-3.5 h-3.5" /> Resonance: {Math.round(resonance * 100)}%</span>}
            </div>
          )}
        </Card>
      );
    }

    if (variant === "orb") {
      return (
        <Card ref={ref} variant="glass-gold" className={cn("p-6 space-y-6", className)} {...props}>
          <div className="relative inline-flex">
            <CircularProgress
              value={level}
              max={maxLevel}
              size={160}
              strokeWidth={8}
              semanticColor={levelColor}
              showLabel
              animate={animate}
            />
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <div className="text-h1 font-medium text-primary">{level}</div>
              <div className="text-caption text-muted">/ {maxLevel}</div>
            </div>
          </div>
          <div className="text-center">
            <Badge variant={stateInfo.color as any} size="lg" dot className="mb-2">{stateInfo.label}</Badge>
            <p className="text-body text-secondary">{stateInfo.description}</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-h6 font-medium text-primary">{Math.round((coherence ?? 0) * 100)}%</div>
              <div className="text-caption text-muted">Coherence</div>
            </div>
            <div>
              <div className="text-h6 font-medium text-primary">{Math.round((resonance ?? 0) * 100)}%</div>
              <div className="text-caption text-muted">Resonance</div>
            </div>
            <div>
              <div className="text-h6 font-medium text-primary">{dimensions.length}</div>
              <div className="text-caption text-muted">Dimensions</div>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card ref={ref} variant="glass-gold" className={cn("p-6 space-y-6", className)} {...props}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", `text-${stateInfo.color} bg-${stateInfo.color}/15`)}>
              <stateInfo.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-h3 text-primary">{stateInfo.label}</div>
              <div className="text-body text-secondary mt-1">{stateInfo.description}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-caption text-muted">Consciousness Level</div>
            <div className={cn("text-h2 font-medium", `text-${levelColor}`)}>Level {level} / {maxLevel}</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <CircularProgress
            value={level}
            max={maxLevel}
            size={96}
            strokeWidth={6}
            semanticColor={levelColor}
            showLabel
            animate={animate}
          />
          <div className="flex-1 ml-6 space-y-3">
            {coherence !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-caption text-muted flex items-center gap-1"><Brain className="w-3.5 h-3.5" /> Coherence</span>
                  <span className="text-body font-medium text-primary">{Math.round(coherence * 100)}%</span>
                </div>
                <Progress value={coherence * 100} max={100} semanticColor="focus" size="sm" animate={animate} />
              </div>
            )}
            {resonance !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-caption text-muted flex items-center gap-1"><Waves className="w-3.5 h-3.5" /> Resonance</span>
                  <span className="text-body font-medium text-primary">{Math.round(resonance * 100)}%</span>
                </div>
                <Progress value={resonance * 100} max={100} semanticColor="meditation" size="sm" animate={animate} />
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-caption text-muted flex items-center gap-1"><Target className="w-3.5 h-3.5" /> Alignment</span>
                <span className="text-body font-medium text-primary">{percentage.toFixed(1)}%</span>
              </div>
              <Progress value={percentage} max={100} semanticColor={levelColor} size="sm" animate={animate} />
            </div>
          </div>
        </div>

        {dimensions && dimensions.length > 0 && (
          <div className="pt-4 border-t border-border/50">
            <h4 className="text-h5 text-primary mb-4">Dimensions of Awareness</h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dimensions.map((dim, i) => {
                const dimPercentage = Math.min(Math.max((dim.value / dim.maxValue) * 100, 0), 100);
                return (
                  <div
                    key={i}
                    className={cn(
                      "p-4 rounded-xl bg-elevated-surface/50 cursor-pointer transition-all duration-200",
                      "hover:bg-elevated-surface/80 hover:shadow-lg"
                    )}
                    onClick={() => onDimensionClick?.(dim.name)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", `text-${dim.color} bg-${dim.color}/15`)}>
                        {dim.icon || <Layers className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-body font-medium text-primary truncate">{dim.name}</div>
                        <div className="text-caption text-muted">{dim.description || `${dim.value} / ${dim.maxValue}`}</div>
                      </div>
                    </div>
                    <Progress value={dim.value} max={dim.maxValue} semanticColor={dim.color} size="sm" animate={animate} />
                    <div className="flex justify-between mt-2">
                      <span className="text-caption text-muted">{dim.value} / {dim.maxValue}</span>
                      <span className={cn("text-caption font-medium", `text-${dim.color}`)}>{Math.round(dimPercentage)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    );
  }
);

ConsciousnessIndicator.displayName = "ConsciousnessIndicator";