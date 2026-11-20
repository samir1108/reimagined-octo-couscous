import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  seconds: number;
  onComplete: () => void;
}

/**
 * Forced contemplative pause: shows a slow breath ring + countdown.
 * Used when AI emits [REFLECT_PAUSE: N] mid-teaching so the shishya
 * actually sits with the words instead of rushing the reply.
 */
export default function ReflectPause({ seconds, onComplete }: Props) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete();
      return;
    }
    const id = setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-3 max-w-[85%] rounded-2xl bg-card/40 border border-primary/30 px-5 py-6 flex flex-col items-center gap-4"
    >
      <p className="text-[10px] uppercase tracking-[0.3em] text-primary/70">
        Sit with this
      </p>
      <motion.div
        className="relative w-20 h-20 rounded-full border border-primary/40"
        animate={{
          scale: [1, 1.18, 1.18, 1],
          opacity: [0.6, 1, 1, 0.6],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.4, 0.6, 1],
        }}
      >
        <div className="absolute inset-2 rounded-full bg-primary/15 backdrop-blur-sm flex items-center justify-center">
          <span className="text-foreground/85 font-mono tabular-nums text-lg">
            {remaining}
          </span>
        </div>
      </motion.div>
      <p className="text-muted-foreground/80 text-xs text-center leading-relaxed">
        Breath in… breath out…
      </p>
    </motion.div>
  );
}
