import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { MessageSquare, Heart, Brain, Eye, Search, Lightbulb, BookOpen, Sparkles, ChevronRight, ArrowRight, Calendar, Clock, PenTool } from "lucide-react";

export interface ReflectionCardProps extends HTMLAttributes<HTMLDivElement> {
  prompt: string;
  type: "daily" | "weekly" | "monthly" | "post-practice" | "milestone" | "shadow-work" | "gratitude" | "intention";
  response?: string;
  completed?: boolean;
  completedAt?: Date;
  mood?: "very-positive" | "positive" | "neutral" | "negative" | "very-negative";
  insights?: string[];
  tags?: string[];
  wordCount?: number;
  timeSpent?: number;
  isPrivate?: boolean;
  onWrite?: () => void;
  onView?: () => void;
  onShare?: () => void;
  variant?: "default" | "prompt-only" | "completed";
}

export const ReflectionCard = forwardRef<HTMLDivElement, ReflectionCardProps>(
  ({
    className,
    prompt,
    type,
    response,
    completed,
    completedAt,
    mood,
    insights,
    tags,
    wordCount,
    timeSpent,
    isPrivate,
    onWrite,
    onView,
    onShare,
    variant = "default",
    ...props
  }, ref) => {
    const typeConfig = {
      daily: { icon: Sun, color: "focus", label: "Daily Reflection", prompt: "How did your day unfold?" },
      weekly: { icon: Calendar, color: "observation", label: "Weekly Review", prompt: "What patterns emerged this week?" },
      monthly: { icon: Calendar, color: "self-inquiry", label: "Monthly Reflection", prompt: "What transformed this month?" },
      "post-practice": { icon: Sparkles, color: "meditation", label: "Post-Practice", prompt: "What did you notice?" },
      milestone: { icon: Flag, color: "awakening", label: "Milestone", prompt: "What does this achievement mean?" },
      "shadow-work": { icon: Eye, color: "shadow-work", label: "Shadow Work", prompt: "What emerged from the depths?" },
      gratitude: { icon: Heart, color: "healing", label: "Gratitude", prompt: "What are you grateful for?" },
      intention: { icon: Lightbulb, color: "integration", label: "Intention Setting", prompt: "What do you intend to cultivate?" },
    };

    const moodConfig = {
      "very-positive": { color: "healing", label: "Radiant", icon: Sparkles },
      positive: { color: "focus", label: "Good", icon: Heart },
      neutral: { color: "observation", label: "Balanced", icon: Minus },
      negative: { color: "self-inquiry", label: "Challenging", icon: Cloud },
      "very-negative": { color: "shadow-work", label: "Dark", icon: Moon },
    };

    const config = typeConfig[type];
    const moodInfo = mood ? moodConfig[mood] : null;

    if (variant === "prompt-only") {
      return (
        <Card
          ref={ref}
          variant="glass-gold"
          className={cn("p-6 space-y-4 cursor-pointer transition-all duration-200", className)}
          onClick={onWrite}
          {...props}
        >
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", `text-${config.color} bg-${config.color}/15`)}>
              <config.icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-caption text-muted">{config.label}</span>
              <h3 className="text-h5 text-primary mt-1">{prompt}</h3>
            </div>
          </div>
          <Button variant="gold" fullWidth size="sm" className="mt-2">
            <PenTool className="w-4 h-4 mr-1" /> Write Reflection
          </Button>
        </Card>
      );
    }

    if (variant === "completed" && response) {
      return (
        <Card
          ref={ref}
          variant="glass"
          className={cn("p-6 space-y-4", className)}
          {...props}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", `text-${config.color} bg-${config.color}/15`)}>
                <config.icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-caption text-muted">{config.label}</span>
                <h3 className="text-h5 text-primary mt-1">{prompt}</h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {moodInfo && (
                <Badge variant={moodInfo.color as any} size="sm" dot>{moodInfo.label}</Badge>
              )}
              {isPrivate && <Badge variant="gold-soft" size="xs">Private</Badge>}
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-body text-secondary leading-relaxed">
            {response}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-center gap-4 text-caption text-muted">
              {completedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(completedAt)}
                </span>
              )}
              {wordCount && (
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  {wordCount} words
                </span>
              )}
              {timeSpent && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {Math.round(timeSpent)} min
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onView && <Button variant="ghost" size="sm" onClick={onView}>View</Button>}
              {onShare && !isPrivate && <Button variant="gold-ghost" size="sm" onClick={onShare}>Share</Button>}
            </div>
          </div>

          {insights && insights.length > 0 && (
            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 text-caption text-primary-gold mb-2">
                <Lightbulb className="w-3.5 h-3.5" /> Insights
              </div>
              <div className="flex flex-wrap gap-2">
                {insights.map((insight, i) => (
                  <Badge key={i} variant="gold-soft" size="sm">{insight}</Badge>
                ))}
              </div>
            </div>
          )}

          {tags && tags.length > 0 && (
            <div className="pt-2">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <Badge key={i} variant="gold-soft" size="xs">#{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      );
    }

    return (
      <Card
        ref={ref}
        variant="glass-gold"
        hover
        className={cn("p-6 space-y-4 cursor-pointer transition-all duration-300", className)}
        onClick={onWrite}
        {...props}
      >
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", `text-${config.color} bg-${config.color}/15`)}>
            <config.icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-caption text-muted">{config.label}</span>
            <h3 className="text-h4 text-primary mt-1">{prompt}</h3>
          </div>
        </div>

        {response && (
          <div className="prose prose-invert max-w-none text-body text-secondary leading-relaxed line-clamp-3">
            {response}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-4 text-caption text-muted">
            {wordCount && (
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                {wordCount} words
              </span>
            )}
            {timeSpent && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {Math.round(timeSpent)} min
              </span>
            )}
            {completedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(completedAt)}
              </span>
            )}
          </div>
          <Button variant="gold" size="sm" onClick={(e) => { e.stopPropagation(); onWrite?.(); }}>
            {completed ? "Reflect Again" : "Write Reflection"}
            <PenTool className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>
    );
  }
);

ReflectionCard.displayName = "ReflectionCard";

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

import { Sun, Flag, Cloud, Minus, FileText } from "lucide-react";