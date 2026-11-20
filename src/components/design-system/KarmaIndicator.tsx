import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Progress, CircularProgress } from "./Progress";
import { Button } from "./Button";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Heart, Brain, Zap, Leaf, Moon, Sparkles } from "lucide-react";

export interface KarmaIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  score: number;
  maxScore?: number;
  label?: string;
  breakdown?: Array<{
    dimension: string;
    score: number;
    maxScore: number;
    color: "observation" | "self-inquiry" | "meditation" | "healing" | "focus" | "shadow-work" | "awakening" | "sleep" | "integration" | "gold";
    icon?: React.ReactNode;
  }>;
  trend?: "up" | "down" | "stable";
  trendValue?: number;
  size?: "sm" | "md" | "lg";
  variant?: "circular" | "linear" | "detailed";
  animate?: boolean;
}

export const KarmaIndicator = forwardRef<HTMLDivElement, KarmaIndicatorProps>(
  ({
    className,
    score,
    maxScore = 100,
    label = "Karma Score",
    breakdown,
    trend = "stable",
    trendValue,
    size = "md",
    variant = "circular",
    animate = true,
    ...props
  }, ref) => {
    const percentage = Math.min(Math.max((score / maxScore) * 100, 0), 100);

    const getScoreColor = (p: number) => {
      if (p >= 80) return "healing";
      if (p >= 60) return "focus";
      if (p >= 40) return "meditation";
      if (p >= 20) return "self-inquiry";
      return "shadow-work";
    };

    const scoreColor = getScoreColor(percentage);

    const sizes = {
      sm: { circular: 60, linear: "h-2", font: "text-h5", breakdown: "text-caption" },
      md: { circular: 96, linear: "h-3", font: "text-h3", breakdown: "text-body" },
      lg: { circular: 140, linear: "h-4", font: "text-h2", breakdown: "text-body-lg" },
    };

    const sizeConfig = sizes[size];

    const trendIcons = {
      up: <TrendingUp className="w-4 h-4 text-healing" />,
      down: <TrendingDown className="w-4 h-4 text-error" />,
      stable: <Minus className="w-4 h-4 text-muted" />,
    };

    if (variant === "circular") {
      return (
        <Card ref={ref} variant="glass-gold" className={cn("p-6 text-center space-y-4", className)} {...props}>
          <div className="relative inline-flex">
            <CircularProgress
              value={score}
              max={maxScore}
              size={sizeConfig.circular}
              strokeWidth={size === "sm" ? 4 : size === "md" ? 6 : 8}
              semanticColor={scoreColor}
              showLabel
              animate={animate}
            />
            {trend !== "stable" && (
              <div className="absolute -top-2 -right-2 flex items-center gap-1 bg-surface/90 backdrop-blur rounded-full px-2 py-1 text-caption">
                {trendIcons[trend]}
                {trendValue !== undefined && (
                  <span className={cn("font-medium", trend === "up" ? "text-healing" : "text-error")}>
                    {trendValue > 0 ? "+" : ""}{trendValue}%
                  </span>
                )}
              </div>
            )}
          </div>
          <div>
            <div className={cn(sizeConfig.font, "font-medium text-primary")}>{label}</div>
            <div className={cn("text-h6 font-medium", `text-${scoreColor}`)}>{Math.round(percentage)}%</div>
            {trendValue !== undefined && (
              <div className="flex items-center justify-center gap-1 mt-2 text-caption">
                {trendIcons[trend]}
                <span className={cn(trend === "up" ? "text-healing" : trend === "down" ? "text-error" : "text-muted")}>
                  {trend === "up" ? "+" : ""}{trendValue}% vs last period
                </span>
              </div>
            )}
          </div>
        </Card>
      );
    }

    if (variant === "linear") {
      return (
        <Card ref={ref} variant="glass" className={cn("p-6 space-y-4", className)} {...props}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-caption text-muted">{label}</div>
              <div className={cn(sizeConfig.font, "font-medium text-primary")}>{score} / {maxScore}</div>
            </div>
            <div className="text-right">
              <div className={cn("text-h6 font-medium", `text-${scoreColor}`)}>{Math.round(percentage)}%</div>
              {trendValue !== undefined && (
                <div className="flex items-center justify-end gap-1 mt-1 text-caption">
                  {trendIcons[trend]}
                  <span className={cn(trend === "up" ? "text-healing" : trend === "down" ? "text-error" : "text-muted")}>
                    {trend === "up" ? "+" : ""}{trendValue}%
                  </span>
                </div>
              )}
            </div>
          </div>
          <Progress value={score} max={maxScore} semanticColor={scoreColor} size={size === "sm" ? "sm" : size === "md" ? "md" : "lg"} animate={animate} />
        </Card>
      );
    }

    return (
      <Card ref={ref} variant="glass-gold" className={cn("p-6 space-y-6", className)} {...props}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-caption text-muted">{label}</div>
            <div className={cn(sizeConfig.font, "font-medium text-primary")}>{score} / {maxScore}</div>
          </div>
          <CircularProgress
            value={score}
            max={maxScore}
            size={size === "sm" ? 48 : size === "md" ? 72 : 96}
            strokeWidth={size === "sm" ? 3 : size === "md" ? 5 : 6}
            semanticColor={scoreColor}
            showLabel
            animate={animate}
          />
        </div>

        {breakdown && breakdown.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-h6 text-primary">Dimensions</h4>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {breakdown.map((dim, i) => {
                const dimPercentage = Math.min(Math.max((dim.score / dim.maxScore) * 100, 0), 100);
                return (
                  <div key={dim.dimension} className="p-3 rounded-xl bg-elevated-surface/50">
                    <div className="flex items-center gap-2 mb-2">
                      {dim.icon && <span className={cn("w-5 h-5", `text-${dim.color}`)}>{dim.icon}</span>}
                      <span className="text-caption font-medium text-primary">{dim.dimension}</span>
                    </div>
                    <Progress
                      value={dim.score}
                      max={dim.maxScore}
                      semanticColor={dim.color}
                      size="sm"
                      animate={animate}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-caption text-muted">{dim.score} / {dim.maxScore}</span>
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

KarmaIndicator.displayName = "KarmaIndicator";