import { useEffect } from "react";
import { motion } from "framer-motion";
import { playRitualBell } from "./ritualAudio";

interface Props {
  guruName?: string;
  blessing?: string;
  onDone: () => void;
}

/** Cinematic full-screen close — Master's bow + Sanskrit blessing line. */
export default function BlessingBow({
  guruName = "Your Guide",
  blessing = "Tat tvam asi — Thou art That",
  onDone,
}: Props) {
  useEffect(() => {
    playRitualBell("close");
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      onClick={onDone}
      className="fixed inset-0 z-[10002] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl px-6 cursor-pointer"
      role="button"
      aria-label="Close blessing"
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [0, 18, 0] }}
          transition={{ delay: 0.6, duration: 2.4, ease: "easeInOut" }}
          className="text-[64px] mb-6 select-none"
          aria-hidden
        >
          🙏
        </motion.div>
        <p className="text-[10px] uppercase tracking-[0.4em] text-primary/70 mb-3">
          {guruName}
        </p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1.2 }}
          className="text-foreground/90 font-display text-xl leading-snug max-w-md italic"
        >
          {blessing}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 3, duration: 1.2 }}
          className="mt-12 text-muted-foreground/60 text-[11px] uppercase tracking-[0.3em]"
        >
          Tap to close
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
