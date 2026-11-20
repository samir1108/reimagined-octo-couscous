/**
 * CinematicFraming — opening sequence of the cinematic journey.
 *
 * Shows:
 *  - Layer title + cinematic text
 *  - Countdown (3, 2, 1)
 *  - Auto-starts after countdown or on user click
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface CinematicFramingProps {
  onStart: () => void;
  autoStart?: boolean;
}

const LAYER_0_TEXT = [
  "This is not a test.",
  "There are no right answers.",
  "Only honest ones.",
  "",
  "You are about to be asked questions",
  "that go deeper than your mind.",
  "The engine is watching — not judging.",
  "",
  "Take a breath.",
  "Begin when you're ready.",
];

export default function CinematicFraming({ onStart, autoStart }: CinematicFramingProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [phase, setPhase] = useState<"text" | "countdown" | "ready">("text");

  useEffect(() => {
    if (autoStart && phase === "text") {
      const t = setTimeout(() => setPhase("countdown"), 3000);
      return () => clearTimeout(t);
    }
  }, [autoStart, phase]);

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown === null) {
      const t = setTimeout(() => setCountdown(3), 600);
      return () => clearTimeout(t);
    }
    if (countdown === 0) {
      const t = setTimeout(() => {
        setPhase("ready");
        void onStart();
      }, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : 3)), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown, onStart]);

  const handleStartClick = useCallback(() => {
    setPhase("countdown");
  }, []);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
    >
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />

      {/* Particle field */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 0.6, 0],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 text-center px-8 max-w-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2, delay: 0.5 }}
      >
        {/* Layer badge */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span className="text-indigo-300/70 text-xs tracking-[0.4em] uppercase font-body">
            Layer 01 — Origin
          </span>
        </motion.div>

        {/* Cinematic text reveal */}
        <div className="space-y-3 mb-12">
          {LAYER_0_TEXT.map((line, i) => (
            <motion.p
              key={i}
              className={`font-body text-lg ${
                line === ""
                  ? "h-4"
                  : line.includes("—")
                    ? "text-indigo-300/50 text-base italic"
                    : "text-white/80"
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: line === "" ? 0 : 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 1.5 + i * 0.5,
                ease: "easeOut",
              }}
            >
              {line}
            </motion.p>
          ))}
        </div>

        {/* Countdown or start button */}
        <AnimatePresence mode="wait">
          {phase === "countdown" && countdown !== null && countdown > 0 && (
            <motion.div
              key="countdown"
              className="text-6xl font-display font-bold text-white/90"
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              {countdown}
            </motion.div>
          )}

          {phase === "text" && !autoStart && (
            <motion.button
              key="start-btn"
              onClick={handleStartClick}
              className="group flex items-center gap-2 mx-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 5.5 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="font-display text-white/80 text-sm">Begin the Journey</span>
              <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
