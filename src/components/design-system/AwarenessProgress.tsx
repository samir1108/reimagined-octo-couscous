import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Progress, CircularProgress } from "./Progress";
import { Button } from "./Button";
import { Target, TrendingUp, TrendingDown, Eye, Brain, Heart, Sparkles, Leaf, Moon, Star, Zap, Activity, Compass, ChevronRight, CheckCircle } from "lucide-react";

export interface AwarenessProgressProps extends HTMLAttributes<HTMLDivElement> {
  currentStage: number;
  totalStages: number;
  stageName: string;
  stageDescription: string;
  dimensions: Array<{
    name: string;
    value: number;
    target: number;
    color: "observation" | "self-inquiry" | "meditation" | "healing" | "focus" | "shadow-work" | "awakening" | "sleep" | "integration" | "gold";
    icon?: React.ReactNode;
  }>;
  milestones: Array<{
    stage: number;
    name: string;
    achieved: boolean;
    date?: Date;
  }>;
  practicesCompleted: number;
  totalPractices: number;
  insightsGained: number;
  loopsTransformed: number;
  nextMilestone?: {
    stage: number;
    name: string;
    requirements: string[];
  };
  onContinueJourney?: () => void;
  variant?: "compact" | "standard" | "detailed";
}

export const AwarenessProgress = forwardRef<HTMLDivElement, AwarenessProgressProps>(
  ({
    className,
    currentStage,
    totalStages,
    stageName,
    stageDescription,
    dimensions,
    milestones,
    practicesCompleted,
    totalPractices,
    insightsGained,
    loopsTransformed,
    nextMilestone,
    onContinueJourney,
    variant = "standard",
    ...props
  }, ref) => {
    const overallProgress = (currentStage / totalStages) * 100;

    if (variant === "compact") {
      return (
        <Card ref={ref} variant="glass" className={cn("p-4 space-y-3", className)} {...props}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-caption text-muted">Stage {currentStage} of {totalStages}</div>
              <div className="text-h5 text-primary">{stageName}</div>
            </div>
            <CircularProgress value={overallProgress} max={100} size={48} strokeWidth={4} semanticColor="gold" showLabel />
          </div>
          <Progress value={overallProgress} max={100} semanticColor="gold" size="md" />
          <div className="flex items-center justify-between text-caption text-muted pt-2">
            <span>Practices: {practicesCompleted}/{totalPractices}</span>
            <span>Insights: {insightsGained}</span>
            <span>Loops: {loopsTransformed}</span>
          </div>
        </Card>
      );
    }

    return (
      <Card ref={ref} variant="glass-gold" className={cn("p-6 space-y-6", className)} {...props}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="gold" size="sm">Stage {currentStage} of {totalStages}</Badge>
            </div>
            <h2 className="text-h2 text-primary">{stageName}</h2>
            <p className="text-body text-secondary mt-2">{stageDescription}</p>
          </div>
          <CircularProgress
            value={overallProgress}
            max={100}
            size={80}
            strokeWidth={6}
            semanticColor="gold"
            showLabel
          />
        </div>

        <Progress value={overallProgress} max={100} semanticColor="gold" size="lg" showLabel label="Overall Journey Progress" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={CheckCircle}
            color="healing"
            value={practicesCompleted}
            label="Practices"
            total={totalPractices}
          />
          <StatCard
            icon={Sparkles}
            color="awakening"
            value={insightsGained}
            label="Insights"
          />
          <StatCard
            icon={RotateCcw}
            color="focus"
            value={loopsTransformed}
            label="Loops Transformed"
          />
          <StatCard
            icon={Target}
            color="focus"
            value={currentStage}
            label="Current Stage"
            total={totalStages}
          />
        </div>

        {dimensions && dimensions.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-h5 text-primary">Dimension Mastery</h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dimensions.map((dim, i) => {
                const percentage = Math.min(Math.max((dim.value / dim.target) * 100, 0), 100);
                return (
                  <div key={i} className="p-4 rounded-xl bg-elevated-surface/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", `text-${dim.color} bg-${dim.color}/15`)}>
                        {dim.icon || <Target className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-body font-medium text-primary">{dim.name}</div>
                        <div className="text-caption text-muted">{dim.value} / {dim.target}</div>
                      </div>
                    </div>
                    <Progress value={dim.value} max={dim.target} semanticColor={dim.color} size="sm" />
                    <div className="flex justify-between mt-2">
                      <span className="text-caption text-muted">{Math.round(percentage)}% to mastery</span>
                      <span className={cn("text-caption font-medium", percentage >= 100 && "text-healing")}>
                        {percentage >= 100 ? "Mastered" : "In Progress"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {milestones && milestones.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-h5 text-primary">Milestones</h4>
            <div className="relative pl-4 border-l border-border/50">
              {milestones.map((milestone, i) => (
                <div key={i} className="relative pb-6 last:pb-0">
                  <div className="absolute left-[-22px] top-0 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                    style={{
                      backgroundColor: milestone.achieved ? "var(--color-healing)" : "transparent",
                      borderColor: milestone.achieved ? "var(--color-healing)" : "var(--color-border)",
                    }}
                  >
                    {milestone.achieved && <CheckCircle className="w-2.5 h-2.5 text-void" />}
                  </div>
                  <div className={cn("ml-4", milestone.achieved ? "" : "opacity-50")}>
                    <div className="flex items-center gap-2">
                      <span className="text-body font-medium text-primary">{milestone.name}</span>
                      {milestone.achieved && <Badge variant="healing" size="xs">Achieved</Badge>}
                    </div>
                    {milestone.date && (
                      <div className="text-caption text-muted mt-1">Achieved {formatDate(milestone.date)}</div>
                    )}
                    {!milestone.achieved && milestone.stage === currentStage + 1 && (
                      <div className="text-caption text-primary-gold mt-1">Current target</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {nextMilestone && (
          <div className="p-4 rounded-xl bg-primary-gold/10 border border-primary-gold/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-primary-gold" />
                  <span className="text-h6 text-primary-gold">Next Milestone: {nextMilestone.name}</span>
                </div>
                <div className="text-body text-secondary mt-1">Stage {nextMilestone.stage} • {nextMilestone.requirements.length} requirements</div>
                <ul className="list-disc list-inside text-caption text-muted mt-2 space-y-1">
                  {nextMilestone.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {onContinueJourney && (
          <Button variant="gold" fullWidth size="lg" onClick={onContinueJourney} className="mt-4">
            Continue Journey
            <ChevronRight className="w-5 h-5" />
          </Button>
        )}
      </Card>
    );
  }
);

AwarenessProgress.displayName = "AwarenessProgress";

function StatCard({ icon: Icon, color, value, label, total }: { icon: React.ComponentType<any>; color: string; value: number; label: string; total?: number }) {
  return (
    <div className="p-4 rounded-xl bg-elevated-surface/50 text-center">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2", `text-${color} bg-${color}/15`)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-h4 font-medium text-primary">{value}{total && <span className="text-h6 text-muted"> / {total}</span>}</div>
      <div className="text-caption text-muted">{label}</div>
    </div>
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

import { RotateCcw } from "lucide-react";