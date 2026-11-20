import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

const PULSE_KEY = "hope-app_last_pulse";
const MIN_HOURS_BETWEEN = 4;

const QUICK_MOODS = [
  { emoji: "😔", label: "Heavy", value: 2 },
  { emoji: "😐", label: "Neutral", value: 5 },
  { emoji: "🙂", label: "Okay", value: 6 },
  { emoji: "😊", label: "Good", value: 7 },
  { emoji: "✨", label: "Alive", value: 9 },
];

interface MicroMomentPulseProps {
  userId?: string;
}

export default function MicroMomentPulse({ userId }: MicroMomentPulseProps) {
  const [visible, setVisible] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [selectedMood, setSelectedMood] = useState<typeof QUICK_MOODS[0] | null>(null);

  useEffect(() => {
    // Check if enough time has passed since last pulse
    const lastPulse = localStorage.getItem(PULSE_KEY);
    if (lastPulse) {
      const hoursSince = (Date.now() - parseInt(lastPulse)) / (1000 * 60 * 60);
      if (hoursSince < MIN_HOURS_BETWEEN) return;
    }

    // Show after a gentle delay
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSelect = async (mood: typeof QUICK_MOODS[0]) => {
    setSelectedMood(mood);
    setAnswered(true);
    localStorage.setItem(PULSE_KEY, String(Date.now()));

    // Store as a lightweight consciousness signal
    if (userId) {
      try {
        await supabase.from("consciousness_signals" as any).insert({
          user_id: userId,
          source_type: "micro_pulse",
          heart_signals: { quick_mood: mood.value, label: mood.label },
          head_signals: {},
          gut_signals: {},
          witness_signals: {},
          loops_detected: [],
          dimension_updates: { emotion: mood.value > 6 ? 0.1 : mood.value < 4 ? -0.1 : 0 },
          confidence: 0.5,
        });
      } catch (e) {
        console.error("Pulse save failed:", e);
      }
    }

    // Auto-dismiss after feedback
    setTimeout(() => setVisible(false), 2500);
  };

  const dismiss = () => {
    localStorage.setItem(PULSE_KEY, String(Date.now()));
    setVisible(false);
  };

  if (!visible || !userId) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="glass-card rounded-2xl p-4 border border-primary/20 overflow-hidden relative"
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.96 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Subtle glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="absolute top-2.5 right-2.5 p-1 rounded-full hover:bg-muted/30 transition-colors z-10"
        >
          <X className="w-3 h-3 text-muted-foreground/40" />
        </button>

        {!answered ? (
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="w-4 h-4 text-primary/70" />
              </motion.div>
              <p className="text-xs font-display font-semibold text-foreground">
                How are you feeling right now?
              </p>
            </div>
            <div className="flex justify-between gap-1.5">
              {QUICK_MOODS.map((mood, i) => (
                <motion.button
                  key={mood.label}
                  className="flex-1 flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl hover:bg-muted/20 transition-colors"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => handleSelect(mood)}
                  whileTap={{ scale: 0.92 }}
                >
                  <span className="text-xl">{mood.emoji}</span>
                  <span className="text-[9px] font-body text-muted-foreground">{mood.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            className="relative flex items-center gap-3 py-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-xs font-display font-semibold text-foreground">
                {selectedMood?.emoji} Noted. Your companion remembers.
              </p>
              <p className="text-[10px] font-body text-muted-foreground mt-0.5">
                {selectedMood && selectedMood.value >= 7
                  ? "Beautiful. Carry this energy forward."
                  : selectedMood && selectedMood.value <= 4
                  ? "I see you. This will pass. Be gentle with yourself."
                  : "Every moment of awareness counts."}
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
