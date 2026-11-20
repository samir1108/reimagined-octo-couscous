import { motion } from "framer-motion";
import { ArrowRight, Sun } from "lucide-react";
import StreakFlame from "@/components/StreakFlame";
import ThemeOfDayCard from "@/components/ThemeOfDayCard";
import GetTaskButton from "@/components/GetTaskButton";

interface CondensedMorningProps {
  userName: string;
  streak: number;
  theme?: any;
  themeLoading?: boolean;
  /** @deprecated use theme instead */
  themeName?: string;
  /** @deprecated use theme instead */
  affirmation?: string;
  onSetIntention: () => void;
  onSkip: () => void;
  onFlameClick?: () => void;
  journeyDay?: number;
}

export default function CondensedMorning({
  userName, streak, theme, themeLoading, themeName, affirmation, onSetIntention, onSkip, onFlameClick, journeyDay
}: CondensedMorningProps) {
  const resolvedThemeName = theme?.title || themeName;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center text-center px-6 relative">
      {/* GetTaskButton moved below theme card */}
      {/* Gentle breathing pulse */}
      <motion.div
        className="w-20 h-20 rounded-full border border-primary/15 flex items-center justify-center mb-8"
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sun className="w-8 h-8 text-primary/50" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <p className="text-sm text-muted-foreground font-body mb-2">
          You missed the morning gate. That's okay.
        </p>
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
            A fresh moment, <span className="text-gradient-sunrise">{userName}</span>
          </h1>
          {streak > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <StreakFlame streak={streak} size="sm" onClick={onFlameClick} />
            </motion.div>
          )}
        </div>
        <p className="text-xs text-muted-foreground font-body mb-6 mt-2">
          Every breath is a new beginning
        </p>
      </motion.div>

      {(theme || resolvedThemeName) && (
        <div className="w-full max-w-sm mb-8">
          {theme ? (
            <ThemeOfDayCard theme={theme} isLoading={themeLoading} compact defaultExpanded={false} journeyDay={journeyDay} />
          ) : (
            <motion.div
              className="glass-card rounded-2xl p-5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <p className="text-[10px] font-display tracking-[0.2em] uppercase text-primary/50 mb-2">
                Today's Intention
              </p>
              <h2 className="text-lg font-display font-semibold text-foreground mb-2 tracking-tight">
                {resolvedThemeName}
              </h2>
              {affirmation && (
                <p className="text-sm font-display italic text-muted-foreground">
                  "{affirmation}"
                </p>
              )}
            </motion.div>
          )}
        </div>
      )}

      <div className="w-full max-w-sm mb-4">
        <GetTaskButton delay={0.5} />
      </div>

      <motion.div
        className="flex flex-col gap-3 w-full max-w-xs"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={onSetIntention}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-sunrise text-primary-foreground font-display font-semibold text-sm shadow-lg shadow-primary/20"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          Quick Session
          <ArrowRight className="w-4 h-4" />
        </motion.button>
        <motion.button
          onClick={onSkip}
          className="text-xs font-display text-muted-foreground hover:text-foreground transition-colors py-2"
          whileTap={{ scale: 0.97 }}
        >
          Skip to today's dashboard →
        </motion.button>
      </motion.div>
    </div>
  );
}
