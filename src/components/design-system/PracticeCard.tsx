import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Progress } from "./Progress";
import { Button } from "./Button";
import { Play, Pause, Clock, Calendar, Heart, Brain, Leaf, Moon, Sparkles, CheckCircle, ChevronRight } from "lucide-react";

export interface PracticeCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  type: "meditation" | "breathing" | "movement" | "journaling" | "inquiry" | "ritual" | "sleep" | "integration";
  duration: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  progress?: number;
  completed?: boolean;
  locked?: boolean;
  streak?: number;
  lastPracticed?: Date;
  benefits?: string[];
  onStart?: () => void;
  onPreview?: () => void;
  variant?: "default" | "featured" | "compact";
}

export const PracticeCard = forwardRef<HTMLDivElement, PracticeCardProps>(
  ({
    className,
    title,
    description,
    type,
    duration,
    difficulty,
    progress,
    completed,
    locked,
    streak,
    lastPracticed,
    benefits,
    onStart,
    onPreview,
    variant = "default",
    ...props
  }, ref) => {
    const typeConfig = {
      meditation: { icon: Sparkles, color: "meditation", label: "Meditation" },
      breathing: { icon: Leaf, color: "healing", label: "Breathing" },
      movement: { icon: Zap, color: "focus", label: "Movement" },
      journaling: { icon: BookOpen, color: "observation", label: "Journaling" },
      inquiry: { icon: Search, color: "self-inquiry", label: "Self-Inquiry" },
      ritual: { icon: Heart, color: "awakening", label: "Ritual" },
      sleep: { icon: Moon, color: "sleep", label: "Sleep" },
      integration: { icon: CheckCircle, color: "integration", label: "Integration" },
    };

    const config = typeConfig[type];

    const difficultyConfig = {
      beginner: { color: "healing", label: "Beginner" },
      intermediate: { color: "focus", label: "Intermediate" },
      advanced: { color: "shadow-work", label: "Advanced" },
    };

    const diffConfig = difficultyConfig[difficulty];

    const variants = {
      default: "glass-card",
      featured: "glass-gold-card gilt-border",
      compact: "glass-card-subtle",
    };

    if (variant === "compact") {
      return (
        <Card
          ref={ref}
          variant={variants[variant]}
          className={cn("p-4 space-y-3 cursor-pointer transition-all duration-200", locked && "opacity-50 pointer-events-none", className)}
          onClick={locked ? undefined : onStart}
          {...props}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", `text-${config.color} bg-${config.color}/15`)}>
                <config.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-body font-medium text-primary">{title}</h4>
                <div className="flex items-center gap-2 text-caption text-muted">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDuration(duration)}</span>
                  <Badge variant={diffConfig.color as any} size="xs">{diffConfig.label}</Badge>
                </div>
              </div>
            </div>
            {progress !== undefined && (
              <Progress value={progress} max={100} semanticColor={config.color} size="sm" className="w-24" />
            )}
          </div>
        </Card>
      );
    }

    return (
      <Card
        ref={ref}
        variant={variants[variant]}
        hover={!locked}
        className={cn("p-6 space-y-4 cursor-pointer transition-all duration-300", locked && "opacity-50 pointer-events-none", className)}
        onClick={locked ? undefined : onStart}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", `text-${config.color} bg-${config.color}/15`)}>
              <config.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-h4 text-primary">{title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={config.color as any} size="sm">{config.label}</Badge>
                <Badge variant={diffConfig.color as any} size="xs" dot>{diffConfig.label}</Badge>
              </div>
            </div>
          </div>
          {completed && (
            <div className="flex items-center gap-1 text-healing">
              <CheckCircle className="w-5 h-5" />
              <span className="text-caption font-medium">Completed</span>
            </div>
          )}
          {locked && (
            <div className="text-muted">
              <Lock className="w-5 h-5" />
            </div>
          )}
        </div>

        <p className="text-body text-secondary leading-relaxed">{description}</p>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 text-caption text-muted">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDuration(duration)}</span>
            {streak && streak > 0 && (
              <span className="flex items-center gap-1 text-healing"><Heart className="w-3.5 h-3.5" />{streak} day streak</span>
            )}
            {lastPracticed && (
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Last: {formatDistance(lastPracticed)}</span>
            )}
          </div>
          {progress !== undefined && (
            <div className="flex items-center gap-2 min-w-[150px]">
              <Progress value={progress} max={100} semanticColor={config.color} size="sm" className="flex-1" />
              <span className="text-caption text-primary-gold font-medium">{Math.round(progress)}%</span>
            </div>
          )}
        </div>

        {benefits && benefits.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {benefits.map((benefit, i) => (
              <Badge key={i} variant="gold-soft" size="xs">{benefit}</Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
          {onPreview && (
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onPreview(); }}>
              Preview
            </Button>
          )}
          {onStart && !locked && (
            <Button variant="gold" size="sm" onClick={(e) => { e.stopPropagation(); onStart(); }}>
              {progress && progress > 0 && progress < 100 ? "Continue" : completed ? "Repeat" : "Start"}
              <Play className="w-4 h-4" />
            </Button>
          )}
          {locked && (
            <Button variant="ghost" size="sm" disabled>
              Locked
              <Lock className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>
    );
  }
);

PracticeCard.displayName = "PracticeCard";

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function formatDistance(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

import { Search, BookOpen, Lock } from "lucide-react";