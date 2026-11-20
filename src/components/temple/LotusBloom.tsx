/**
 * Lotus Bloom Milestone Animation
 * Per temple.md Section 5: Progress: Golden gradient, lotus bloom at milestone
 * Milestones: 7, 21, 49, 100, 365 days
 */
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { playTempleBell, playThreeBells } from "@/lib/templeSounds";

interface LotusBloomProps {
  milestone: number;
  masterName: string;
  masterQuote: string;
  onComplete: () => void;
}

const MILESTONE_MESSAGES: Record<number, { title: string; message: string }> = {
  7: {
    title: "First Week",
    message: "Seven days. You showed up. The seed has been planted. Trust the darkness — growth happens underground first.",
  },
  21: {
    title: "21 Days",
    message: "The habit has formed. It's no longer effort — it's natural. You don't 'do' practice anymore. Practice does you.",
  },
  49: {
    title: "49 Days",
    message: "Seven weeks. Something is shifting. Not dramatically — fundamentally. The old patterns are loosening. Keep going.",
  },
  100: {
    title: "100 Days",
    message: "A century of days. You are not who you were on Day 1. The transformation is real. The Temple witnesses it.",
  },
  365: {
    title: "One Year",
    message: "365 days. A full cycle around the sun. You have become the practice. The Temple is no longer a place — it's you.",
  },
};

export default function LotusBloom({ milestone, masterName, masterQuote, onComplete }: LotusBloomProps) {
  const [phase, setPhase] = useState<"blooming" | "message" | "complete">("blooming");

  useEffect(() => {
    playTempleBell();
    const t1 = setTimeout(() => setPhase("message"), 2000);
    const t2 = setTimeout(() => { playThreeBells(); }, 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const info = MILESTONE_MESSAGES[milestone] || {
    title: `${milestone} Days`,
    message: "You've come this far. The path continues.",
  };

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Lotus bloom animation */}
      {phase === "blooming" && (
        <motion.div
          className="relative w-40 h-40 mb-8"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          {/* Lotus petals */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0"
              style={{
                transform: `rotate(${i * 45}deg)`,
                transformOrigin: "center bottom",
              }}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 0.8, delay: 0.3 + i * 0.15, ease: "easeOut" }}
            >
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-20 rounded-full"
                style={{
                  background: "linear-gradient(to top, hsla(43, 60%, 55%, 0.6), hsla(43, 60%, 55%, 0.1))",
                  boxShadow: "0 0 20px hsla(43, 60%, 55%, 0.3)",
                }}
              />
            </motion.div>
          ))}
          {/* Center glow */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            <div
              className="w-16 h-16 rounded-full"
              style={{
                background: "radial-gradient(circle, hsla(43, 96%, 56%, 0.8), hsla(30, 85%, 52%, 0.3), transparent)",
                boxShadow: "0 0 60px hsla(43, 96%, 56%, 0.4)",
              }}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Milestone message */}
      {phase !== "blooming" && (
        <motion.div
          className="text-center px-6 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Lotus icon */}
          <div className="text-4xl mb-4">🪷</div>

          <p className="text-white/20 text-[10px] font-display tracking-[0.4em] uppercase mb-2">
            Milestone
          </p>
          <h2 className="text-white/80 text-2xl font-display tracking-wide mb-1">
            {info.title}
          </h2>
          <p className="text-amber-300/50 text-sm font-display mb-4">
            {milestone} days of practice
          </p>

          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent my-6" />

          <p className="text-white/50 text-sm font-display leading-relaxed italic mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            "{info.message}"
          </p>

          <p className="text-white/30 text-xs font-display mb-2">— {masterName}</p>
          <p className="text-white/20 text-xs font-display italic mb-8">"{masterQuote}"</p>

          <motion.button
            onClick={onComplete}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/20 text-amber-200/70 text-sm font-display tracking-wider hover:from-amber-600/30 hover:to-orange-600/30 transition-all"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Continue the Path
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Check if a day is a milestone
 */
export function isMilestone(day: number): boolean {
  return [7, 21, 49, 100, 200, 365, 500, 1000].includes(day);
}

/**
 * Get milestone info for a day
 */
export function getMilestoneInfo(day: number): { title: string; message: string } | null {
  return MILESTONE_MESSAGES[day] || null;
}
