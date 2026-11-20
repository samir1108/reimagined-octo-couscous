import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, X } from "lucide-react";

const MANTRAS = [
  "I am not my body",
  "I am not my mind",
  "I am the witness",
  "Thoughts pass. I remain.",
  "This resistance is not me",
];

/**
 * ResistanceJap — a 60-second presence battle.
 * Triggered when the user feels resistance. Cycles short mantras
 * to break body/mind identification.
 */
export default function ResistanceJap({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [mantraIdx, setMantraIdx] = useState(0);

  useEffect(() => {
    if (!open) return;
    setSecondsLeft(60);
    setMantraIdx(0);
    const tick = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(tick);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    const cycle = setInterval(() => {
      setMantraIdx((i) => (i + 1) % MANTRAS.length);
    }, 3500);
    return () => {
      clearInterval(tick);
      clearInterval(cycle);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Feel resistance? Start a 60-second jap"
        className={`group inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary/90 transition ${
          compact
            ? "px-2.5 py-1 text-[11px]"
            : "px-3 py-1.5 text-xs"
        }`}
      >
        <Flame className="w-3 h-3" />
        <span className="font-display tracking-wide">Resistance? Fight it · 60s</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center px-6"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-6 right-6 w-11 h-11 rounded-full bg-foreground/10 hover:bg-foreground/20 border border-foreground/20 flex items-center justify-center text-foreground shadow-lg backdrop-blur"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Breath ring */}
            <div className="relative w-56 h-56 mb-10">
              <motion.div
                className="absolute inset-0 rounded-full border border-primary/40"
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-4 rounded-full border border-primary/30"
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-5xl text-primary tabular-nums">
                  {secondsLeft}
                </span>
              </div>
            </div>

            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
              Jap · break the grip
            </p>

            <AnimatePresence mode="wait">
              <motion.p
                key={mantraIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.6 }}
                className="font-display text-2xl md:text-3xl text-foreground text-center max-w-md leading-snug"
              >
                {MANTRAS[mantraIdx]}
              </motion.p>
            </AnimatePresence>

            <p className="mt-10 text-xs text-muted-foreground/70 max-w-xs text-center leading-relaxed">
              Repeat softly. Body and mind cannot grip what you do not identify with.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={() => setOpen(false)}
                className="px-5 py-2 rounded-full border border-border bg-card/60 hover:bg-card text-foreground text-sm font-display"
              >
                Close
              </button>
              {secondsLeft === 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-display"
                >
                  Return
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
