import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Sparkles, Star } from "lucide-react";
import type { LevelEvaluation } from "@/hooks/usePracticeMatrix";

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

interface LevelUpCelebrationProps {
  evaluation: LevelEvaluation | null;
  onDismiss: () => void;
}

export default function LevelUpCelebration({ evaluation, onDismiss }: LevelUpCelebrationProps) {
  if (!evaluation) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDismiss}
      >
        <motion.div
          className="glass-card rounded-3xl p-8 max-w-sm w-full mx-4 text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={spring}
          onClick={(e) => e.stopPropagation()}
        >
          {evaluation.leveledUp ? (
            <>
              <motion.div
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center"
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: 2 }}
              >
                <Star className="w-8 h-8 text-primary" />
              </motion.div>
              <h3 className="text-xl font-display font-bold text-foreground mb-2">Level Up! 🎉</h3>
              <p className="text-sm text-muted-foreground font-body mb-1">
                {evaluation.practice}: Level {evaluation.previousLevel} → {evaluation.newLevel}
              </p>
              <p className="text-sm text-primary font-display mb-4">{evaluation.levelUpReason}</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary/60" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">Practice Complete</h3>
            </>
          )}

          <p className="text-xs text-muted-foreground font-body mb-1">
            Quality: {Math.round(evaluation.avgQuality * 100)}% · Sessions at level: {evaluation.sessionsAtLevel}
          </p>

          {evaluation.difficultyAdjustment !== "none" && (
            <p className="text-[10px] text-accent-foreground/70 font-body mb-2">
              {evaluation.difficultyAdjustment === "harder" && "📈 Increasing challenge"}
              {evaluation.difficultyAdjustment === "gentler" && "🌿 Easing difficulty"}
              {evaluation.difficultyAdjustment === "stabilize" && "🧘 Stabilization mode"}
            </p>
          )}

          <p className="text-sm text-foreground/80 font-body italic mb-4">{evaluation.antiGuiltMessage}</p>
          <p className="text-xs text-primary font-display">{evaluation.encouragement}</p>

          <button
            onClick={onDismiss}
            className="mt-5 px-6 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-sm font-display transition-colors"
          >
            Continue
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
