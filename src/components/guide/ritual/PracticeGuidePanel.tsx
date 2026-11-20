import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { playRitualBell } from "./ritualAudio";

interface Props {
  name: string;
  rounds: number;
  secondsPerPhase: number;
  onComplete: () => void;
  onExit: () => void;
}

const PHASES = ["Inhale", "Hold", "Exhale", "Hold"] as const;

/**
 * Live guided breath panel — replaces text instructions with an
 * animated ring + round counter + audio cues. Cycles 4 phases per round.
 */
export default function PracticeGuidePanel({
  name,
  rounds,
  secondsPerPhase,
  onComplete,
  onExit,
}: Props) {
  const [round, setRound] = useState(1);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secLeft, setSecLeft] = useState(secondsPerPhase);
  const completedRef = useRef(false);

  useEffect(() => {
    playRitualBell("start");
    return () => {
      if (!completedRef.current) playRitualBell("end");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setSecLeft((s) => {
        if (s > 1) return s - 1;
        // advance phase
        setPhaseIdx((p) => {
          const next = (p + 1) % PHASES.length;
          if (next === 0) {
            // round complete
            setRound((r) => {
              const nr = r + 1;
              if (nr > rounds) {
                completedRef.current = true;
                playRitualBell("end");
                clearInterval(id);
                setTimeout(onComplete, 300);
                return r;
              }
              return nr;
            });
          }
          return next;
        });
        return secondsPerPhase;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [rounds, secondsPerPhase, onComplete]);

  const phase = PHASES[phaseIdx];
  const ringScale = phase === "Inhale" ? 1.25 : phase === "Exhale" ? 0.85 : phase === "Hold" && phaseIdx === 1 ? 1.25 : 0.85;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10001] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md px-6"
    >
      <button
        onClick={() => {
          completedRef.current = true;
          onExit();
        }}
        className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 p-2 text-muted-foreground/70 hover:text-foreground"
        aria-label="Exit practice"
      >
        <X className="w-5 h-5" />
      </button>

      <p className="text-[10px] uppercase tracking-[0.35em] text-primary/70 mb-2">
        Sadhana
      </p>
      <h2 className="text-foreground/90 font-display text-xl mb-12 text-center">{name}</h2>

      <motion.div
        animate={{ scale: ringScale }}
        transition={{ duration: secondsPerPhase, ease: "easeInOut" }}
        className="relative w-56 h-56 rounded-full border border-primary/40 flex items-center justify-center mb-10"
      >
        <div className="absolute inset-4 rounded-full bg-primary/10 backdrop-blur-sm" />
        <div className="relative z-10 text-center">
          <p className="text-foreground font-display text-2xl mb-1">{phase}</p>
          <p className="text-primary/80 font-mono tabular-nums text-sm">{secLeft}s</p>
        </div>
      </motion.div>

      <p className="text-muted-foreground/75 text-sm font-mono tabular-nums">
        Round {Math.min(round, rounds)} / {rounds}
      </p>
    </motion.div>
  );
}
