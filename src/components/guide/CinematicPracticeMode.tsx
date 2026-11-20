/**
 * CinematicPracticeMode
 * ─────────────────────────────────────────────────────────────
 * Full-screen practice surface with:
 *   • Guru portrait (top, soft glow)
 *   • Breath orb (expand 4s / hold 2s / contract 4s loop)
 *   • Timer (countdown)
 *   • Text guidance (rotates through provided cues)
 *
 * Voice guidance is intentionally text-only for now.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import HomeOrb from "@/components/orb/HomeOrb";

interface CinematicPracticeModeProps {
  guruImage?: string;
  guruName?: string;
  practiceTitle: string;
  durationMinutes: number;
  guidanceCues?: string[];
  onComplete: () => void;
  onExit: () => void;
}

const DEFAULT_CUES = [
  "Soften your shoulders.",
  "Let the breath find its own rhythm.",
  "Notice — without changing.",
  "If thoughts come, let them pass like clouds.",
  "Return, gently, to the breath.",
  "You are the witness, not the witnessed.",
];

export default function CinematicPracticeMode({
  guruImage,
  guruName,
  practiceTitle,
  durationMinutes,
  guidanceCues,
  onComplete,
  onExit,
}: CinematicPracticeModeProps) {
  const totalSeconds = Math.max(60, Math.round(durationMinutes * 60));
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [cueIdx, setCueIdx] = useState(0);
  const completedRef = useRef(false);

  const cues = useMemo(
    () => (guidanceCues && guidanceCues.length > 0 ? guidanceCues : DEFAULT_CUES),
    [guidanceCues]
  );

  // Countdown
  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          if (!completedRef.current) {
            completedRef.current = true;
            // small delay so the "00:00" frame is seen
            setTimeout(() => onComplete(), 600);
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [onComplete]);

  // Rotate guidance cues every ~12s
  useEffect(() => {
    const id = setInterval(() => setCueIdx((i) => (i + 1) % cues.length), 12000);
    return () => clearInterval(id);
  }, [cues.length]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[90] flex flex-col items-center justify-between p-6 pt-10 pb-12"
      style={{
        background:
          "radial-gradient(ellipse at center, hsl(var(--background) / 0.85) 0%, hsl(var(--background)) 70%)",
      }}
    >
      {/* Exit */}
      <button
        onClick={onExit}
        aria-label="Exit practice"
        className="absolute top-5 right-5 text-muted-foreground/60 hover:text-foreground transition"
      >
        <X className="w-5 h-5" />
      </button>

      {/* ── Top: guru portrait + practice title ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="flex flex-col items-center"
      >
        {guruImage && (
          <div className="relative w-20 h-20 mb-3">
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/25 blur-xl"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <img
              src={guruImage}
              alt={guruName || "Guide"}
              className="relative w-20 h-20 rounded-full object-cover ring-2 ring-primary/40"
            />
          </div>
        )}
        <p className="text-primary/70 text-[10px] uppercase tracking-[0.3em] mb-1">
          Practice
        </p>
        <h2 className="font-display text-xl text-foreground/90 text-center max-w-xs">
          {practiceTitle}
        </h2>
      </motion.div>

      {/* ── Center: breath orb ── */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Outer glow */}
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/15 blur-3xl"
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Inner orb — the Home orb, breathing with the cue */}
          <motion.div
            className="relative w-44 h-44"
            animate={{ scale: [0.85, 1.15, 1.15, 0.85] }}
            transition={{
              duration: 10,
              times: [0, 0.4, 0.6, 1],
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <HomeOrb className="absolute inset-0" />
          </motion.div>
          {/* Timer ring */}
          <div className="absolute font-display text-3xl text-foreground/85 tracking-wider">
            {mm}:{ss}
          </div>
        </div>
      </div>

      {/* ── Bottom: rotating guidance cue ── */}
      <div className="w-full max-w-md min-h-[64px] flex items-center justify-center">
        <motion.p
          key={cueIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 1 }}
          className="text-foreground/75 text-[15px] italic text-center leading-relaxed"
        >
          "{cues[cueIdx]}"
        </motion.p>
      </div>
    </motion.div>
  );
}
