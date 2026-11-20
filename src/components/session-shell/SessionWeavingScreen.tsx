import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AmbientLayer } from "./AmbientLayer";
import { CinematicStage } from "./CinematicStage";
import HomeOrb from "@/components/orb/HomeOrb";
import { useAudioContext } from "@/contexts/SoundContext";

/**
 * SessionWeavingScreen
 * Shown between the final step completion and the SessionCompleteScreen,
 * while the completion API stitches loops / karma / shift summary.
 * A breathing orb + rotating gentle line — never a blank screen.
 */
const LINES = [
  "Weaving your session…",
  "Listening for what shifted…",
  "Gathering the threads…",
  "Settling into stillness…",
  "Honoring what arose…",
];

export function SessionWeavingScreen() {
  const [i, setI] = useState(0);
  const getAudioContext = useAudioContext();
  const audioContext = getAudioContext?.();
  const reduce = useReducedMotion();
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % LINES.length), 2600);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="dark fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden bg-background text-foreground">
      <AmbientLayer audioContext={audioContext} showControls={false} />
      <CinematicStage kind="reflection" slot="evening" />

      {/* Letterbox — the sitting is being cut together */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-black/85"
        initial={{ height: reduce ? "7vh" : 0 }}
        animate={{ height: "7vh" }}
        transition={{ duration: reduce ? 0 : 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-black/85"
        initial={{ height: reduce ? "7vh" : 0 }}
        animate={{ height: "7vh" }}
        transition={{ duration: reduce ? 0 : 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
      />

      <div className="relative z-10 flex flex-col items-center gap-10 px-8 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1.2 }}
          className="text-[10px] uppercase tracking-[0.42em] text-primary/70"
        >
          The seal · weaving
        </motion.p>

        {/* Breathing orb — the same orb as Home */}
        <div className="relative h-44 w-44">
          <HomeOrb className="absolute inset-0" />
        </div>

        {/* Rotating line — one caption at a time, like a subtitle */}
        <div className="flex min-h-[4.5rem] flex-col items-center gap-2">
          <AnimatePresence mode="wait">
            <motion.p
              key={i}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, filter: "blur(4px)" }}
              transition={{ duration: reduce ? 0.15 : 0.7, ease: "easeOut" }}
              className="text-base italic sm:text-lg text-foreground/85"
            >
              {LINES[i]}
            </motion.p>
          </AnimatePresence>
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/70">
            A moment…
          </p>
        </div>
      </div>
    </div>
  );
}
