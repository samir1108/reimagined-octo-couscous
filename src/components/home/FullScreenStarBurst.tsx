import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FullScreenStarBurstProps {
  open: boolean;
  onComplete: () => void;
  durationMs?: number;
}

export default function FullScreenStarBurst({
  open,
  onComplete,
  durationMs = 2400,
}: FullScreenStarBurstProps) {
  const stars = useMemo(
    () =>
      Array.from({ length: 140 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.2 + 0.5,
        delay: Math.random() * 1.6,
        dur: Math.random() * 2.4 + 1.6,
      })),
    [],
  );

  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (!open) return;
    setVisible(true);
    const timer = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(onComplete, 400);
    }, durationMs);
    return () => window.clearTimeout(timer);
  }, [open, durationMs, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="starburst"
          className="fixed inset-0 z-[9999] overflow-hidden bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          aria-hidden
        >
          {stars.map((s) => (
            <motion.span
              key={s.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.size,
                height: s.size,
              }}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{
                opacity: [0, 1, 0.3, 1],
                scale: [0.4, 1.6, 1, 1.3],
              }}
              transition={{
                duration: s.dur,
                delay: s.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)",
            }}
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
