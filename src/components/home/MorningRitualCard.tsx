/**
 * MorningRitualCard — Morning-specific add-on shown UNDER the Today's Theme card.
 * Anchors the day with a Dream Journal capture and a quick "first breath" ritual.
 *
 * - Dream Journal: tap to capture last night's dream (deeplinks to /app/journal?mode=dream)
 * - First Breath: 3-breath grounding (deeplinks to /app/guide?mode=breathwork&duration=60)
 *
 * Pure UI — no engine call needed; the feature is universal for morning users.
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Moon, Wind } from "lucide-react";

export default function MorningRitualCard() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <p className="text-[10px] font-display tracking-[0.22em] uppercase text-muted-foreground/70 text-center">
        Morning rituals
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Dream Journal */}
        <button
          onClick={() => navigate("/app/journal?mode=dream&source=morning_ritual")}
          className="text-left glass-card rounded-2xl p-4 border border-border/40 hover:border-primary/30 hover:bg-primary/5 active:scale-[0.98] transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Moon className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-display tracking-[0.18em] uppercase text-primary/80 mb-1">
                Dream Journal
              </p>
              <p className="text-sm font-display font-semibold text-foreground leading-snug">
                Capture last night
              </p>
              <p className="text-[11px] font-body text-muted-foreground/80 mt-1">
                Symbols, feelings, fragments
              </p>
            </div>
          </div>
        </button>

        {/* First Breath */}
        <button
          onClick={() => navigate("/app/guide?mode=breathwork&duration=60&source=morning_ritual")}
          className="text-left glass-card rounded-2xl p-4 border border-border/40 hover:border-primary/30 hover:bg-primary/5 active:scale-[0.98] transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Wind className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-display tracking-[0.18em] uppercase text-primary/80 mb-1">
                First Breath · 60s
              </p>
              <p className="text-sm font-display font-semibold text-foreground leading-snug">
                Three breaths in
              </p>
              <p className="text-[11px] font-body text-muted-foreground/80 mt-1">
                Arrive before the day pulls
              </p>
            </div>
          </div>
        </button>
      </div>
    </motion.div>
  );
}
