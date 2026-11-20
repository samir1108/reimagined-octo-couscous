/**
 * NowHero — The single AI-chosen practice for THIS moment.
 * The hero of Practice v2. One decision, one tap, no menus.
 */
import { motion } from "framer-motion";
import { Play, Sparkles, Clock, Loader2 } from "lucide-react";

interface Props {
  emoji: string;
  title: string;
  subtitle?: string | null;     // why this, now
  durationMin: number;
  badge?: string | null;        // e.g. "Breath · L2" or "Theme: Vikshipta"
  loading?: boolean;
  onBegin: () => void;
}

export default function NowHero({
  emoji,
  title,
  subtitle,
  durationMin,
  badge,
  loading,
  onBegin,
}: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-card/40 to-background p-7 sm:p-9"
    >
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/15 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-accent/10 blur-[90px]" />

      <div className="relative">
        <div className="flex items-center gap-2 text-[10px] font-display tracking-[0.32em] uppercase text-primary/80">
          <Sparkles className="h-3 w-3" />
          Now
          {badge && (
            <span className="ml-auto rounded-full border border-border/40 bg-background/30 px-2.5 py-0.5 text-[10px] tracking-[0.18em] text-muted-foreground">
              {badge}
            </span>
          )}
        </div>

        <div className="mt-5 flex items-start gap-4">
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-5xl leading-none"
          >
            {emoji}
          </motion.div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-foreground leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-sm sm:text-[15px] font-body leading-relaxed text-muted-foreground/90">
                {subtitle}
              </p>
            )}
            <div className="mt-3 flex items-center gap-1.5 text-xs font-body text-muted-foreground/70">
              <Clock className="h-3 w-3" />
              {durationMin} min
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground/70 leading-relaxed max-w-sm">
              This practice was chosen for you based on today's theme and your recent sessions. There's no "right" way to do it — just show up and notice what happens.
            </p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.985 }}
          whileHover={{ y: -1 }}
          onClick={onBegin}
          disabled={loading}
          className="mt-7 group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent py-4 text-sm font-display font-semibold tracking-[0.22em] uppercase text-primary-foreground shadow-[0_10px_40px_-12px_hsl(var(--primary)/0.55)] transition-shadow hover:shadow-[0_14px_50px_-10px_hsl(var(--primary)/0.7)] disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          )}
          Begin Practice
        </motion.button>
      </div>
    </motion.section>
  );
}
