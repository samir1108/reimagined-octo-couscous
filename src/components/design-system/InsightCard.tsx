import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { ChevronRight, Lightbulb, Eye, Search, Heart, Brain, Zap, Moon, Sparkles, TrendingUp } from "lucide-react";

export interface InsightCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  insight: string;
  type: "observation" | "pattern" | "revelation" | "guidance" | "warning" | "celebration";
  confidence?: number;
  source?: string;
  timestamp?: Date;
  actionable?: boolean;
  actions?: Array<{ label: string; onClick: () => void }>;
  tags?: string[];
  onClick?: () => void;
}

export const InsightCard = forwardRef<HTMLDivElement, InsightCardProps>(
  ({
    className,
    title,
    insight,
    type,
    confidence,
    source,
    timestamp,
    actionable,
    actions,
    tags,
    onClick,
    ...props
  }, ref) => {
    const typeConfig = {
      observation: { icon: Eye, color: "observation", bg: "bg-observation/10", border: "border-observation/20", label: "Observation" },
      pattern: { icon: Search, color: "self-inquiry", bg: "bg-self-inquiry/10", border: "border-self-inquiry/20", label: "Pattern" },
      revelation: { icon: Lightbulb, color: "meditation", bg: "bg-meditation/10", border: "border-meditation/20", label: "Revelation" },
      guidance: { icon: Heart, color: "healing", bg: "bg-healing/10", border: "border-healing/20", label: "Guidance" },
      warning: { icon: AlertTriangle, color: "shadow-work", bg: "bg-shadow-work/10", border: "border-shadow-work/20", label: "Shadow Work" },
      celebration: { icon: Sparkles, color: "awakening", bg: "bg-awakening/10", border: "border-awakening/20", label: "Celebration" },
    };

    const config = typeConfig[type];

    return (
      <Card
        ref={ref}
        variant="glass"
        hover
        className={cn(
          "group p-6 space-y-4 cursor-pointer transition-all duration-300",
          config.bg,
          config.border,
          className
        )}
        onClick={onClick}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", `text-${config.color} ${config.bg.replace("bg-", "bg-").replace("/10", "/20")}`)}>
              <config.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-h5 text-primary">{title}</h3>
              <Badge variant={config.color as any} size="xs">{config.label}</Badge>
            </div>
          </div>
          {confidence !== undefined && (
            <div className="text-right">
              <div className="text-caption text-muted">Confidence</div>
              <div className={cn("text-h6 font-medium", `text-${config.color}`)}>
                {Math.round(confidence * 100)}%
              </div>
            </div>
          )}
        </div>

        <p className="text-body text-secondary leading-relaxed">{insight}</p>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="gold-soft" size="xs">#{tag}</Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-3 text-caption text-muted">
            {source && <span className="flex items-center gap-1">From <span className="text-primary-gold">{source}</span></span>}
            {timestamp && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDistance(timestamp)}
              </span>
            )}
          </div>
          {actionable && (
            <Button variant="ghost" size="xs" className="group-hover:opacity-100 opacity-0 transition-opacity">
              Explore
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Button>
          )}
        </div>

        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {actions.map((action, i) => (
              <Button key={i} variant="gold-ghost" size="sm" onClick={action.onClick}>
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </Card>
    );
  }
);

InsightCard.displayName = "InsightCard";

function formatDistance(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

import { AlertTriangle, Clock } from "lucide-react";