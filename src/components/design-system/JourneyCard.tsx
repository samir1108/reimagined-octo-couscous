import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Progress } from "./Progress";
import { Button } from "./Button";
import { ChevronRight, MapPin, Flag, Star, Heart, ArrowRight, Circle, CheckCircle } from "lucide-react";

export interface JourneyCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  stage: number;
  totalStages: number;
  currentStep: string;
  steps: Array<{
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    active?: boolean;
  }>;
  progress: number;
  onStepClick?: (stepId: string) => void;
  onContinue?: () => void;
  estimatedTime?: string;
}

export const JourneyCard = forwardRef<HTMLDivElement, JourneyCardProps>(
  ({
    className,
    title,
    description,
    stage,
    totalStages,
    currentStep,
    steps,
    progress,
    onStepClick,
    onContinue,
    estimatedTime,
    ...props
  }, ref) => {
    return (
      <Card
        ref={ref}
        variant="glass-gold"
        className={cn("p-6 space-y-6", className)}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="gold" size="sm">
                Stage {stage} of {totalStages}
              </Badge>
              {estimatedTime && (
                <span className="flex items-center gap-1 text-caption text-muted">
                  <Clock className="w-3.5 h-3.5" />
                  ~{estimatedTime}
                </span>
              )}
            </div>
            <h2 className="text-h3 text-primary">{title}</h2>
            <p className="text-body text-secondary mt-2">{description}</p>
          </div>
          <div className="text-right">
            <div className="text-caption text-muted">Overall Progress</div>
            <div className="text-h4 font-medium text-primary-gold">{Math.round(progress)}%</div>
          </div>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-4 p-3 rounded-xl transition-all duration-200",
                step.active ? "bg-primary-gold/10 border border-primary-gold/30" : "hover:bg-elevated-surface/50"
              )}
              onClick={() => onStepClick?.(step.id)}
            >
              <div className={cn(
                "relative flex items-center justify-center w-10 h-10 rounded-full font-medium text-caption flex-shrink-0 transition-all duration-200",
                step.completed ? "bg-healing text-void" :
                step.active ? "bg-primary-gold text-void ring-2 ring-primary-gold/30" :
                "bg-border text-muted"
              )}>
                {step.completed && <CheckCircle className="w-5 h-5" />}
                {!step.completed && !step.active && <span>{index + 1}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={cn(
                    "text-body font-medium truncate",
                    step.active ? "text-primary" : step.completed ? "text-secondary" : "text-muted"
                  )}>
                    {step.title}
                  </h4>
                  {step.active && (
                    <Badge variant="gold" size="xs">Current</Badge>
                  )}
                </div>
                {step.description && (
                  <p className={cn("text-caption mt-1 truncate", step.active ? "text-secondary" : "text-muted")}>
                    {step.description}
                  </p>
                )}
              </div>
              {step.active && onContinue && (
                <Button variant="gold" size="sm" onClick={(e) => { e.stopPropagation(); onContinue(); }}>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <Progress value={progress} semanticColor="gold" size="md" showLabel label="Journey Progress" />
      </Card>
    );
  }
);

JourneyCard.displayName = "JourneyCard";

import { Clock } from "lucide-react";