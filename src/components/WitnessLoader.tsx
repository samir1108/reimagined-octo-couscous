import { motion } from "framer-motion";

/**
 * WitnessLoader — minimal "AI is thinking" indicator.
 * Used consistently across Guide, Temple, and all chat surfaces.
 * Three soft pulsing dots in a glass bubble.
 */
export function WitnessLoader() {
  return (
    <div className="glass-card rounded-2xl rounded-bl-lg px-4 py-3 inline-flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-primary/60"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.18,
          }}
        />
      ))}
    </div>
  );
}
