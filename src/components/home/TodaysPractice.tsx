/**
 * TodaysPractice — the single practice the engine picked for today.
 *
 * Reads from the engine's TodayCard / theme micro-practice and gives the user
 * one obvious action: begin. The orb stays the free-form path; this card is the
 * guided path for today's slot.
 */
import { motion, useReducedMotion } from "framer-motion";
import { Check, Clock, Play, Sparkles, User } from "lucide-react";

interface TodaysPracticeProps {
  title: string;
  description?: string;
  minutes?: number;
  steps?: string[];
  guruName?: string;
  slotLabel?: string;
  done?: boolean;
  onBegin: () => void;
  onDetails?: () => void;
}

export default function TodaysPractice({
  title,
  description,
  minutes,
  steps,
  guruName,
  slotLabel,
  done,
  onBegin,
  onDetails,
}: TodaysPracticeProps) {
  const reducedMotion = useReducedMotion();
  const preview = (steps ?? []).slice(0, 2);

  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="glass-1 premium-panel-hover w-full rounded-2xl p-4 sm:p-5 text-left"
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-[10px] font-display tracking-[0.25em] uppercase text-muted-foreground/75">
          Today's Practice
        </p>
        <div className="flex items-center gap-1.5">
          {slotLabel && (
            <span className="rounded-full border border-border/30 bg-muted/20 px-2 py-0.5 text-[9px] font-display uppercase tracking-[0.15em] text-muted-foreground/60">
              {slotLabel}
            </span>
          )}
          {done && (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[9px] font-medium text-primary">
              <Check className="w-2.5 h-2.5" /> Done
            </span>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="gilt-ring w-10 h-10 rounded-xl bg-[linear-gradient(160deg,hsl(var(--primary)/0.18),hsl(var(--primary)/0.06))] flex items-center justify-center shrink-0 shadow-[0_0_18px_hsl(var(--primary)/0.12)]">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-editorial text-[1.15rem] font-medium text-foreground leading-snug">
            {title}
          </h3>
          {(description || preview.length > 0) && (
            <p className="mt-1 text-xs text-muted-foreground/70 leading-relaxed line-clamp-2">
              {description || preview[0]}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground/50">
            {!!minutes && (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" /> {minutes} min
              </span>
            )}
            {guruName && (
              <span className="inline-flex items-center gap-1 truncate">
                <User className="w-3 h-3" /> {guruName}
              </span>
            )}
            {preview.length > 1 && (
              <span className="truncate">{preview.length} steps · guided</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <motion.button
          onClick={onBegin}
          whileTap={{ scale: 0.97 }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--secondary)))] px-3 py-2 text-xs font-semibold text-primary-foreground shadow-[inset_0_1px_0_hsl(var(--gold-50)/0.38),0_1px_2px_hsl(0_0%_0%/0.22),0_6px_16px_hsl(var(--primary)/0.28)] hover:brightness-[1.06] transition-[filter,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <Play className="w-3.5 h-3.5" />
          {done ? "Practice again" : "Begin practice"}
        </motion.button>
        {onDetails && (
          <button
            onClick={onDetails}
            className="rounded-xl border border-border/50 bg-card/30 px-3 py-2 text-xs font-medium text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-primary/[0.07] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Briefing
          </button>
        )}
      </div>
    </motion.section>
  );
}
