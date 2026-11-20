import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Progress, CircularProgress } from "./Progress";
import { Button } from "./Button";
import { Heart, Brain, Briefcase, Home, Users, BookOpen, Dumbbell, Leaf, Music, Sparkles, Target, TrendingUp, ChevronRight, AlertTriangle, CheckCircle, Compass, PieChart } from "lucide-react";

export interface LifeDomainCardProps extends HTMLAttributes<HTMLDivElement> {
  domain: {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: "observation" | "self-inquiry" | "meditation" | "healing" | "focus" | "shadow-work" | "awakening" | "sleep" | "integration" | "gold";
    score: number;
    target: number;
    trend: "up" | "down" | "stable";
    trendValue?: number;
    subdomains?: Array<{
      name: string;
      score: number;
      target: number;
    }>;
    practices?: string[];
    challenges?: string[];
    insights?: string[];
  };
  onFocus?: () => void;
  onViewDetails?: () => void;
  variant?: "default" | "detailed" | "compact";
}

export const LifeDomainCard = forwardRef<HTMLDivElement, LifeDomainCardProps>(
  ({
    className,
    domain,
    onFocus,
    onViewDetails,
    variant = "default",
    ...props
  }, ref) => {
    const percentage = Math.min(Math.max((domain.score / domain.target) * 100, 0), 100);
    const scoreColor = percentage >= 80 ? "healing" : percentage >= 60 ? "focus" : percentage >= 40 ? "meditation" : percentage >= 20 ? "self-inquiry" : "shadow-work";

    const trendIcons = {
      up: <TrendingUp className="w-3.5 h-3.5 text-healing" />,
      down: <TrendingDown className="w-3.5 h-3.5 text-error" />,
      stable: <Minus className="w-3.5 h-3.5 text-muted" />,
    };

    if (variant === "compact") {
      return (
        <Card
          ref={ref}
          variant="glass"
          className={cn("p-4 space-y-3 cursor-pointer transition-all duration-200", className)}
          onClick={onFocus}
          {...props}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", `text-${domain.color} bg-${domain.color}/15`)}>
                {domain.icon}
              </div>
              <div>
                <h4 className="text-body font-medium text-primary">{domain.name}</h4>
                <div className="flex items-center gap-2 text-caption">
                  <span className="text-muted">{domain.score}/{domain.target}</span>
                  {domain.trendValue !== undefined && trendIcons[domain.trend]}
                </div>
              </div>
            </div>
            <CircularProgress value={domain.score} max={domain.target} size={40} strokeWidth={3} semanticColor={domain.color} showLabel />
          </div>
          <Progress value={domain.score} max={domain.target} semanticColor={domain.color} size="sm" />
        </Card>
      );
    }

    return (
      <Card
        ref={ref}
        variant="glass-gold"
        className={cn("p-6 space-y-6", className)}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", `text-${domain.color} bg-${domain.color}/15`)}>
              {domain.icon}
            </div>
            <div>
              <h3 className="text-h3 text-primary">{domain.name}</h3>
              <p className="text-body text-secondary mt-1">{domain.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-caption text-muted">Alignment</div>
            <div className="flex items-center justify-end gap-2">
              <CircularProgress value={domain.score} max={domain.target} size={56} strokeWidth={4} semanticColor={domain.color} showLabel />
            </div>
          </div>
        </div>

        <Progress value={domain.score} max={domain.target} semanticColor={domain.color} size="md" showLabel label="Domain Score" />

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-4 text-caption">
            <span className={cn("font-medium", `text-${scoreColor}`)}>{Math.round(percentage)}% to target</span>
            <span className="flex items-center gap-1 text-muted">{trendIcons[domain.trend]} {domain.trendValue !== undefined ? (domain.trendValue > 0 ? "+" : "") + domain.trendValue + "%" : "Stable"}</span>
          </div>
          <div className="flex items-center gap-2">
            {onFocus && <Button variant="gold" size="sm" onClick={(e) => { e.stopPropagation(); onFocus(); }}>Focus Here</Button>}
            {onViewDetails && <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onViewDetails(); }}>Details</Button>}
          </div>
        </div>

        {domain.subdomains && domain.subdomains.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-border/50">
            <h4 className="text-h5 text-primary">Subdomains</h4>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {domain.subdomains.map((sub, i) => {
                const subPercentage = Math.min(Math.max((sub.score / sub.target) * 100, 0), 100);
                return (
                  <div key={i} className="p-3 rounded-xl bg-elevated-surface/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-body font-medium text-primary">{sub.name}</span>
                      <span className={cn("text-caption font-medium", subPercentage >= 80 ? "text-healing" : subPercentage >= 60 ? "text-focus" : "text-muted")}>
                        {sub.score} / {sub.target}
                      </span>
                    </div>
                    <Progress value={sub.score} max={sub.target} semanticColor={domain.color} size="sm" />
                    <div className="text-caption text-muted mt-1">{Math.round(subPercentage)}% aligned</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {domain.practices && domain.practices.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 text-caption text-primary-gold">
              <Sparkles className="w-3.5 h-3.5" /> Recommended Practices
            </div>
            <div className="flex flex-wrap gap-2">
              {domain.practices.map((practice, i) => (
                <Badge key={i} variant="gold-soft" size="sm">{practice}</Badge>
              ))}
            </div>
          </div>
        )}

        {domain.challenges && domain.challenges.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 text-caption text-error">
              <AlertTriangle className="w-3.5 h-3.5" /> Challenges
            </div>
            <div className="flex flex-wrap gap-2">
              {domain.challenges.map((challenge, i) => (
                <Badge key={i} variant="shadow-work" size="sm">{challenge}</Badge>
              ))}
            </div>
          </div>
        )}

        {domain.insights && domain.insights.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 text-caption text-primary-gold">
              <Sparkles className="w-3.5 h-3.5" /> Insights
            </div>
            <div className="flex flex-wrap gap-2">
              {domain.insights.map((insight, i) => (
                <Badge key={i} variant="gold-soft" size="sm">{insight}</Badge>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  }
);

LifeDomainCard.displayName = "LifeDomainCard";

import { TrendingDown, Minus } from "lucide-react";