import { motion } from "framer-motion";
import { Sparkles, ChevronRight, Star, Clock, BadgeCheck, Heart, CheckCircle2 } from "lucide-react";
import { Badge } from "@/design-system";
import { Card } from "@/design-system";
import { Button } from "@/design-system";
import type { LibraryItem } from "@/types/contentLibrary";
import { useState } from "react";

interface RecommendationCardProps {
  item: LibraryItem;
  reason: string;
  onClick: () => void;
  onDismiss?: () => void;
  onFeedback?: (positive: boolean) => void;
  progress?: any;
  isFavorited?: boolean;
  onToggleFavorite?: (itemId: string) => void;
  onStart?: (itemId: string) => void;
}

export function RecommendationCard({ item, reason, onClick, onDismiss, onFeedback, progress, isFavorited, onToggleFavorite, onStart }: RecommendationCardProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<"positive" | "negative" | null>(null);
  const status = progress?.status;
  const progressPercent = progress?.progress_percent || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className="p-3 hover:border-primary/40 transition-colors relative overflow-hidden">
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onDismiss && (
            <button
              onClick={(e) => { e.stopPropagation(); onDismiss?.(); }}
              className="p-1 rounded hover:bg-muted/50 text-muted-foreground"
              aria-label="Dismiss recommendation"
            >
              <BadgeCheck className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <button
          onClick={onClick}
          className="w-full text-left flex items-start gap-3"
        >
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-xl shrink-0 relative">
            <Sparkles className="w-5 h-5 text-primary" />
            {isFavorited && (
              <Heart className="absolute -top-1 -right-1 w-4 h-4 text-red-500 fill-red-500" />
            )}
            {status === "completed" && (
              <CheckCircle2 className="absolute -bottom-1 -right-1 w-4 h-4 text-green-500 fill-green-500" />
            )}
            {status === "in_progress" && (
              <Clock className="absolute -bottom-1 -right-1 w-4 h-4 text-blue-500 fill-blue-500" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-primary flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Recommended
              </span>
              {item.average_rating && (
                <Badge variant="secondary" className="text-[9px] py-0 flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  {item.average_rating.toFixed(1)}
                </Badge>
              )}
            </div>
            
            <p className="font-medium text-sm truncate">{item.title}</p>
            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{item.description}</p>
            
            <div className="flex items_center gap-2 mt-2 flex-wrap text-[10px] text-muted-foreground">
              {item.duration_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {item.duration_minutes}m
                </span>
              )}
              <Badge variant="outline" className="text-[9px] py-0 capitalize">{item.difficulty}</Badge>
              {item.type && (
                <Badge variant="outline" className="text-[9px] py-0 capitalize">{item.type.replace("_", " ")}</Badge>
              )}
            </div>
            
            {progressPercent > 0 && progressPercent < 100 && (
              <div className="mt-2 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full bg-primary transition-all duration-300"
                />
              </div>
            )}
            
            <p className="text-[10px] text-primary mt-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {reason}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-1 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(item.id); }}
              className="p-1 rounded hover:bg-muted/50 text-muted-foreground transition-colors"
              aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart 
                className={`w-4 h-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} 
              />
            </button>
            <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
          </div>
        </button>

        {showFeedback && !feedbackGiven && (
          <div className="mt-3 pt-3 border-t border-border/30 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Was this helpful?</span>
            <Button variant="ghost" size="sm" onClick={() => { setFeedbackGiven("positive"); onFeedback?.(true); }} className="h-7 px-2">
              👍 Yes
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setFeedbackGiven("negative"); onFeedback?.(false); }} className="h-7 px-2">
              👎 No
            </Button>
          </div>
        )}

        {feedbackGiven === "positive" && (
          <div className="mt-3 pt-3 border-t border-border/30 text-center text-xs text-green-500">
            Thanks for your feedback! 🙏
          </div>
        )}

        {feedbackGiven === "negative" && (
          <div className="mt-3 pt-3 border-t border-border/30 text-center text-xs text-orange-500">
            We'll improve recommendations. Thanks!
          </div>
        )}
      </Card>
    </motion.div>
  );
}

import { useState } from "react";

interface RecommendationSectionProps {
  items: LibraryItem[];
  reasons: Record<string, string>;
  onItemClick: (item: LibraryItem) => void;
  onDismiss?: (itemId: string) => void;
  onFeedback?: (itemId: string, positive: boolean) => void;
  title?: string;
  maxItems?: number;
  getProgress?: (itemId: string) => any;
  isFavorited?: (itemId: string) => boolean;
  onToggleFavorite?: (itemId: string) => void;
  onStart?: (itemId: string) => void;
}

export function RecommendationSection({ 
  items, 
  reasons, 
  onItemClick, 
  onDismiss, 
  onFeedback,
  title = "Recommended for You",
  maxItems = 4,
  getProgress,
  isFavorited,
  onToggleFavorite,
  onStart,
}: RecommendationSectionProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const visibleItems = items.filter((item) => !dismissed.has(item.id)).slice(0, maxItems);

  if (visibleItems.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-display text-foreground flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" /> {title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {visibleItems.map((item, idx) => (
          <RecommendationCard
            key={item.id}
            item={item}
            reason={reasons[item.id] || "Based on your journey"}
            onClick={() => onItemClick(item)}
            onDismiss={() => {
              setDismissed((prev) => new Set([...prev, item.id]));
              onDismiss?.(item.id);
            }}
            onFeedback={(positive) => onFeedback?.(item.id, positive)}
            progress={getProgress?.(item.id)}
            isFavorited={isFavorited?.(item.id)}
            onToggleFavorite={onToggleFavorite}
            onStart={onStart}
          />
        ))}
      </div>
    </div>
  );
}