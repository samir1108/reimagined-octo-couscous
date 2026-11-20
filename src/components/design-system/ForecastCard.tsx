import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Progress } from "./Progress";
import { Button } from "./Button";
import { TrendingUp, TrendingDown, AlertTriangle, Sparkles, Heart, Brain, Eye, Search, Cloud, Sun, Moon, Star, ChevronRight, Calendar, Clock, Zap, Leaf, Droplets, Activity } from "lucide-react";

export interface ForecastCardProps extends HTMLAttributes<HTMLDivElement> {
  period: "today" | "tomorrow" | "this-week" | "next-week" | "this-month";
  overallScore: number;
  energyForecast: "high" | "medium" | "low" | "variable";
  focusAreas: Array<{
    domain: string;
    score: number;
    trend: "up" | "down" | "stable";
    recommendation: string;
  }>;
  challenges?: Array<{
    type: string;
    description: string;
    severity: "mild" | "moderate" | "intense";
    suggestion: string;
  }>;
  opportunities?: Array<{
    type: string;
    description: string;
    action: string;
  }>;
  bestTimeFor?: {
    activity: string;
    time: string;
    reason: string;
  }[];
  onViewDetails?: () => void;
}

export const ForecastCard = forwardRef<HTMLDivElement, ForecastCardProps>(
  ({
    className,
    period,
    overallScore,
    energyForecast,
    focusAreas,
    challenges,
    opportunities,
    bestTimeFor,
    onViewDetails,
    ...props
  }, ref) => {
    const periodConfig = {
      today: { label: "Today's Forecast", icon: Sun, color: "focus" },
      tomorrow: { label: "Tomorrow's Forecast", icon: Sun, color: "meditation" },
      "this-week": { label: "This Week's Forecast", icon: Calendar, color: "observation" },
      "next-week": { label: "Next Week's Forecast", icon: Calendar, color: "self-inquiry" },
      "this-month": { label: "This Month's Forecast", icon: Calendar, color: "integration" },
    };

    const energyConfig = {
      high: { color: "focus", label: "High Energy", icon: Zap, bars: 3 },
      medium: { color: "meditation", label: "Moderate Energy", icon: Activity, bars: 2 },
      low: { color: "sleep", label: "Low Energy", icon: Moon, bars: 1 },
      variable: { color: "self-inquiry", label: "Variable Energy", icon: Waves, bars: 2 },
    };

    const config = periodConfig[period];
    const energyInfo = energyConfig[energyForecast];

    const getScoreColor = (score: number) => {
      if (score >= 80) return "healing";
      if (score >= 60) return "focus";
      if (score >= 40) return "meditation";
      if (score >= 20) return "self-inquiry";
      return "shadow-work";
    };

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
              <h3 className="text-h4 text-primary">{config.label}</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className={cn("flex items-center gap-1 text-caption", `text-${energyInfo.color}`)}>
                  <energyInfo.icon className="w-3.5 h-3.5" />
                  {energyInfo.label}
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-caption text-muted">Overall Outlook</div>
            <div className={cn("text-h2 font-medium", `text-${getScoreColor(overallScore)}`)}>{overallScore}%</div>
          </div>
        </div>

        <Progress value={overallScore} max={100} semanticColor={getScoreColor(overallScore)} size="md" animate />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {focusAreas.map((area, i) => {
            const scoreColor = getScoreColor(area.score);
            return (
              <div key={i} className="p-4 rounded-xl bg-elevated-surface/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-caption font-medium text-primary">{area.domain}</span>
                  <Badge variant={scoreColor as any} size="xs">{area.score}%</Badge>
                </div>
                <Progress value={area.score} max={100} semanticColor={scoreColor} size="sm" />
                <p className="text-caption text-muted mt-2">{area.recommendation}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={cn("text-caption", area.trend === "up" && "text-healing", area.trend === "down" && "text-error", area.trend === "stable" && "text-muted")}>
                    {area.trend === "up" && <TrendingUp className="w-3.5 h-3.5 inline" />}
                    {area.trend === "down" && <TrendingDown className="w-3.5 h-3.5 inline" />}
                    {area.trend === "stable" && <Minus className="w-3.5 h-3.5 inline" />}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {challenges && challenges.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 text-caption text-error">
              <AlertTriangle className="w-3.5 h-3.5" /> Potential Challenges
            </div>
            {challenges.map((challenge, i) => (
              <div key={i} className="p-3 rounded-xl bg-error/10 border border-error/20">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-caption font-medium text-primary">{challenge.type}</span>
                      <Badge variant="error" size="xs">{challenge.severity}</Badge>
                    </div>
                    <p className="text-body text-secondary">{challenge.description}</p>
                  </div>
                </div>
                <p className="text-caption text-primary-gold mt-2"><Sparkles className="w-3.5 h-3.5 inline mr-1" /> {challenge.suggestion}</p>
              </div>
            ))}
          </div>
        )}

        {opportunities && opportunities.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 text-caption text-healing">
              <Sparkles className="w-3.5 h-3.5" /> Opportunities
            </div>
            {opportunities.map((opp, i) => (
              <div key={i} className="p-3 rounded-xl bg-healing/10 border border-healing/20">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="text-caption font-medium text-primary">{opp.type}</span>
                    <p className="text-body text-secondary mt-1">{opp.description}</p>
                  </div>
                </div>
                <Button variant="gold-ghost" size="xs" className="mt-2">{opp.action}</Button>
              </div>
            ))}
          </div>
        )}

        {bestTimeFor && bestTimeFor.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 text-caption text-primary-gold">
              <Clock className="w-3.5 h-3.5" /> Optimal Timing
            </div>
            {bestTimeFor.map((timing, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-elevated-surface/50">
                <div className="flex items-center gap-2">
                  <span className="text-caption text-muted">{timing.time}</span>
                  <span className="text-body font-medium text-primary">{timing.activity}</span>
                </div>
                <span className="text-caption text-muted">{timing.reason}</span>
              </div>
            ))}
          </div>
        )}

        {onViewDetails && (
          <Button variant="ghost" fullWidth onClick={onViewDetails} className="pt-2 border-t border-border/50">
            View Detailed Forecast
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </Card>
    );
  }
);

ForecastCard.displayName = "ForecastCard";

import { Minus, Waves } from "lucide-react";