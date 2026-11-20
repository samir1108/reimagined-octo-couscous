import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";
import GetTaskButton from "@/components/GetTaskButton";

interface WelcomeBackProps {
  userName: string;
  daysAway: number;
  longestStreak: number;
  onContinue: () => void;
}

const MOOD_ORBS = [
  { emoji: "😔", label: "Heavy", value: "heavy" },
  { emoji: "😐", label: "Neutral", value: "neutral" },
  { emoji: "🙂", label: "Okay", value: "okay" },
  { emoji: "😊", label: "Good", value: "good" },
  { emoji: "✨", label: "Ready", value: "ready" },
];

export default function WelcomeBack({ userName, daysAway, longestStreak, onContinue }: WelcomeBackProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 relative">
      {/* Gentle pulse */}
      <motion.div
        className="w-24 h-24 rounded-full border border-primary/10 flex items-center justify-center mb-8"
        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Heart className="w-8 h-8 text-primary/40" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3 tracking-tight">
          Welcome back, <span className="text-gradient-sunrise">{userName}</span>
        </h1>
        <p className="text-sm text-muted-foreground font-body mb-2">
          No judgment. No guilt. Just presence.
        </p>
        <p className="text-xs text-muted-foreground font-body">
          Life happened. You're here now. That's what matters.
        </p>
      </motion.div>

      {/* Longest streak preserved */}
      {longestStreak > 0 && (
        <motion.div
          className="mt-6 px-4 py-2 rounded-full glass-subtle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-xs font-display text-muted-foreground">
            Your longest streak: <span className="text-primary font-semibold">{longestStreak} days</span> — still yours
          </span>
        </motion.div>
      )}

      <div className="mt-6 w-full max-w-sm">
        <GetTaskButton delay={0.5} />
      </div>

      {/* Mood check */}
      <motion.div
        className="mt-10 w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <p className="text-[10px] font-display tracking-[0.2em] uppercase text-primary/50 mb-4">
          How are you feeling right now?
        </p>
        <div className="flex justify-center gap-3">
          {MOOD_ORBS.map((mood, i) => (
            <motion.button
              key={mood.value}
              onClick={() => setSelectedMood(mood.value)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                selectedMood === mood.value
                  ? "bg-primary/10 scale-110"
                  : "hover:bg-muted/20"
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.08 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-[9px] font-body text-muted-foreground">{mood.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Continue */}
      <motion.button
        onClick={onContinue}
        className={`mt-10 flex items-center gap-2 px-8 py-4 rounded-2xl font-display font-semibold text-base transition-all ${
          selectedMood
            ? "bg-gradient-sunrise text-primary-foreground shadow-lg shadow-primary/20"
            : "glass-card text-foreground/50"
        }`}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        whileHover={selectedMood ? { scale: 1.02 } : undefined}
        whileTap={selectedMood ? { scale: 0.97 } : undefined}
      >
        Begin fresh
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </div>
  );
}
