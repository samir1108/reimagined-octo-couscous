import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Progress } from "./Progress";
import { Button } from "./Button";
import { AlertTriangle, ChevronRight, RotateCcw, ArrowUpRight, Eye, Search, Heart, Brain, Zap, Leaf, Moon, Sparkles } from "lucide-react";

export interface LoopCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  loopType: "negative" | "positive" | "neutral";
  frequency: "daily" | "weekly" | "monthly" | "occasional";
  intensity: 1 | 2 | 3 | 4 | 5;
  triggers?: string[];
  patterns?: string[];
  impact?: string;
  progress?: number;
  stage: "unaware" | "aware" | "exploring" | "transforming" | "integrated";
  onExplore?: () => void;
  onTransform?: () => void;
  variant?: "default" | "detailed";
}

export const LoopCard = forwardRef<HTMLDivElement, LoopCardProps>(
  ({
    className,
    title,
    description,
    loopType,
    frequency,
    intensity,
    triggers,
    patterns,
    impact,
    progress,
    stage,
    onExplore,
    onTransform,
    variant = "default",
    ...props
  }, ref) => {
    const loopConfig = {
      negative: { color: "shadow-work", bg: "bg-shadow-work/10", border: "border-shadow-work/20", icon: AlertTriangle, label: "Negative Loop" },
      positive: { color: "healing", bg: "bg-healing/10", border: "border-healing/20", icon: Sparkles, label: "Positive Loop" },
      neutral: { color: "self-inquiry", bg: "bg-self-inquiry/10", border: "border-self-inquiry/20", icon: RotateCcw, label: "Neutral Loop" },
    };

    const stageConfig = {
      unaware: { label: "Unaware", color: "shadow-work", progress: 0 },
      aware: { label: "Aware", color: "self-inquiry", progress: 25 },
      exploring: { label: "Exploring", color: "observation", progress: 50 },
      transforming: { label: "Transforming", color: "focus", progress: 75 },
      integrated: { label: "Integrated", color: "healing", progress: 100 },
    };

    const config = loopConfig[loopType];
    const stageInfo = stageConfig[stage];

    const frequencyIcons = {
      daily: <Calendar className="w-3.5 h-3.5" />,
      weekly: <Calendar className="w-3.5 h-3.5" />,
      monthly: <Calendar className="w-3.5 h-3.5" />,
      occasional: <HelpCircle className="w-3.5 h-3.5" />,
    };

    const intensityBars = Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        className={cn(
          "w-1.5 h-1.5 rounded transition-colors duration-200",
          i < intensity ? `bg-${config.color}` : "bg-border"
        )}
      />
    ));

    return (
      <Card
        ref={ref}
        variant="glass"
        className={cn("p-6 space-y-4", config.bg, config.border, className)}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", `text-${config.color} ${config.bg.replace("bg-", "bg-").replace("/10", "/20")}`)}>
              <config.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-h4 text-primary">{title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={config.color as any} size="sm">{config.label}</Badge>
                <Badge variant="gold-soft" size="xs">{frequency.charAt(0).toUpperCase() + frequency.slice(1)}</Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-caption text-muted">Intensity</div>
            <div className="flex items-center justify-end gap-1">{intensityBars}</div>
          </div>
        </div>

        <p className="text-body text-secondary leading-relaxed">{description}</p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-caption text-muted">Transformation Stage</span>
              <Badge variant={stageInfo.color as any} size="sm" dot>{stageInfo.label}</Badge>
            </div>
            {progress !== undefined && (
              <span className="text-caption text-primary-gold font-medium">{Math.round(progress)}%</span>
            )}
          </div>
          <Progress value={progress ?? stageInfo.progress} max={100} semanticColor={stageInfo.color} size="md" animate />
        </div>

        {triggers && triggers.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 text-caption text-muted">
              <span>Triggers:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {triggers.map((trigger, i) => (
                <Badge key={i} variant="gold-soft" size="xs">{trigger}</Badge>
              ))}
            </div>
          </div>
        )}

        {patterns && patterns.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-caption text-muted">
              <span>Patterns:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {patterns.map((pattern, i) => (
                <Badge key={i} variant={loopType === "negative" ? "shadow-work" : loopType === "positive" ? "healing" : "self-inquiry"} size="xs">{pattern}</Badge>
              ))}
            </div>
          </div>
        )}

        {impact && (
          <div className="pt-2 border-t border-border/50">
            <div className="text-caption text-muted mb-1">Impact</div>
            <p className="text-body text-secondary">{impact}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
          {stage !== "integrated" && onExplore && (
            <Button variant="ghost" size="sm" onClick={onExplore}>
              <Eye className="w-4 h-4 mr-1" /> Explore
            </Button>
          )}
          {stage === "exploring" || stage === "transforming" ? (
            onTransform && (
              <Button variant="gold" size="sm" onClick={onTransform}>
                Transform
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            )
          ) : stage === "integrated" ? (
            <Badge variant="healing" size="sm" dot>Integrated</Badge>
          ) : null}
        </div>
      </Card>
    );
  }
);

LoopCard.displayName = "LoopCard";

import { HelpCircle } from "lucide-react";