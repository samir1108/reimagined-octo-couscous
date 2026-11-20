import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Progress } from "./Progress";
import { Button } from "./Button";
import { ChevronRight, Sparkles, Target, TrendingUp, Clock, Heart, Brain, Leaf } from "lucide-react";

export interface MissionCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  progress: number;
  icon?: React.ReactNode;
  iconColor?: "observation" | "self-inquiry" | "meditation" | "healing" | "focus" | "shadow-work" | "awakening" | "sleep" | "integration" | "gold";
  variant?: "default" | "featured" | "active" | "completed";
  onClick?: () => void;
  metadata?: {
    duration?: string;
    difficulty?: "beginner" | "intermediate" | "advanced";
    category?: string;
  };
  cta?: {
    label: string;
    onClick: () => void;
  };
}

export const MissionCard = forwardRef<HTMLDivElement, MissionCardProps>(
  ({
    className,
    title,
    description,
    progress,
    icon,
    iconColor = "gold",
    variant = "default",
    onClick,
    metadata,
    cta,
    ...props
  }, ref) => {
    const iconColors = {
      observation: "text-observation bg-observation/15",
      "self-inquiry": "text-self-inquiry bg-self-inquiry/15",
      meditation: "text-meditation bg-meditation/15",
      healing: "text-healing bg-healing/15",
      focus: "text-focus bg-focus/15",
      "shadow-work": "text-shadow-work bg-shadow-work/15",
      awakening: "text-awakening bg-awakening/15",
      sleep: "text-sleep bg-sleep/15",
      integration: "text-integration bg-integration/15",
      gold: "text-primary-gold bg-primary-gold/15",
    };

    const variants = {
      default: "glass-card",
      featured: "glass-gold-card gilt-border",
      active: "glass-card ring-1 ring-primary-gold/30",
      completed: "glass-card ring-1 ring-healing/30",
    };

    return (
      <Card
        ref={ref}
        variant={variants[variant]}
        hover={variant !== "completed"}
        className={cn("group p-6 space-y-4 cursor-pointer transition-all duration-300", className)}
        onClick={onClick}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconColors[iconColor])}>
              {icon || <Sparkles className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-h5 text-primary">{title}</h3>
              {metadata?.category && (
                <Badge variant="gold-soft" size="xs" className="mt-1">
                  {metadata.category}
                </Badge>
              )}
            </div>
          </div>
          {variant === "completed" && (
            <div className="flex items-center gap-1 text-healing">
              <CheckCircle className="w-5 h-5" />
              <span className="text-caption font-medium">Completed</span>
            </div>
          )}
        </div>

        <p className="text-body text-secondary leading-relaxed">{description}</p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-caption text-muted">Progress</span>
              <span className="text-caption text-primary-gold font-medium">{Math.round(progress)}%</span>
            </div>
            {metadata?.duration && (
              <span className="flex items-center gap-1 text-caption text-muted">
                <Clock className="w-3.5 h-3.5" />
                {metadata.duration}
              </span>
            )}
          </div>
          <Progress value={progress} semanticColor={iconColor} size="md" animate />
        </div>

        {metadata?.difficulty && (
          <div className="flex items-center gap-2 pt-2">
            <Badge
              variant={metadata.difficulty === "beginner" ? "healing" : metadata.difficulty === "intermediate" ? "focus" : "shadow-work"}
              size="sm"
              dot
            >
              {metadata.difficulty.charAt(0).toUpperCase() + metadata.difficulty.slice(1)}
            </Badge>
          </div>
        )}

        {cta && (
          <Button
            variant="gold-ghost"
            size="sm"
            fullWidth
            onClick={(e) => { e.stopPropagation(); cta.onClick(); }}
            className="mt-2 group-hover:opacity-100 opacity-0 transition-opacity"
          >
            {cta.label}
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
      </Card>
    );
  }
);

MissionCard.displayName = "MissionCard";

import { CheckCircle } from "lucide-react";