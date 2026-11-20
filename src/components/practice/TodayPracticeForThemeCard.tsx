/**
 * TodayPracticeForThemeCard — Hero card on Practice tab showing the engine-recommended
 * practice that serves today's theme + current depth. Driven by the Living Theme Engine.
 */
import { motion } from 'framer-motion';
import { Sparkles, Play, Clock } from 'lucide-react';
import { Button } from "@/design-system";

interface RecommendedPractice {
  title: string;
  why: string;
  duration_min: number;
  type: string;
}

interface Props {
  themeTitle?: string;
  subAngle?: string | null;
  recommended?: RecommendedPractice | null;
  depth?: number;
  onStart?: () => void;
}

const TYPE_EMOJI: Record<string, string> = {
  breath: '🌬️',
  witness: '🪷',
  inquiry: '🔍',
  journal: '📓',
};

export default function TodayPracticeForThemeCard({
  themeTitle,
  subAngle,
  recommended,
  depth = 0,
  onStart,
}: Props) {
  if (!recommended) return null;

  const headline = subAngle || themeTitle || 'Today';
  const emoji = TYPE_EMOJI[recommended.type] || '✨';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/60 to-card/40 backdrop-blur-xl p-5 shadow-lg shadow-primary/5"
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-primary/80" />
        <span className="text-[10px] font-display tracking-[0.2em] uppercase text-primary/80">
          Today's practice for · {headline}
        </span>
        {depth > 0 && (
          <span className="ml-auto text-[10px] font-display tracking-[0.15em] uppercase text-muted-foreground/70">
            Depth {depth}
          </span>
        )}
      </div>

      <div className="flex items-start gap-3 mt-3">
        <div className="text-3xl leading-none mt-0.5">{emoji}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-display text-foreground leading-tight">
            {recommended.title}
          </h3>
          <p className="text-sm font-body text-muted-foreground/85 mt-1.5 leading-relaxed">
            {recommended.why}
          </p>
          <div className="flex items-center gap-3 mt-3 text-[11px] font-body text-muted-foreground/70">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {recommended.duration_min} min
            </span>
            <span className="capitalize">{recommended.type}</span>
          </div>
        </div>
      </div>

      {onStart && (
        <Button
          onClick={onStart}
          size="sm"
          className="mt-4 w-full bg-primary/90 hover:bg-primary text-primary-foreground"
        >
          <Play className="w-3.5 h-3.5 mr-1.5" />
          Begin
        </Button>
      )}
    </motion.div>
  );
}
