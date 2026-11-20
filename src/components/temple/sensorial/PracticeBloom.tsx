/**
 * PracticeBloom — closure ritual visual.
 * 24 amber petals bloom outward from a central seed, then settle.
 * Used on the complete screen so finishing a practice feels *earned*.
 */
import { motion } from "framer-motion";

export function PracticeBloom({ minutes }: { minutes: number }) {
  const petals = Array.from({ length: 24 });
  return (
    <div className="relative mx-auto mb-6 h-40 w-40">
      {/* Outer aura */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(245,197,102,0.35), rgba(245,197,102,0) 70%)",
        }}
      />
      {/* Petals */}
      {petals.map((_, i) => {
        const angle = (i / petals.length) * Math.PI * 2;
        const x = Math.cos(angle) * 56;
        const y = Math.sin(angle) * 56;
        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{ x, y, opacity: 0.85, scale: 1 }}
            transition={{
              duration: 1.4,
              delay: 0.2 + i * 0.025,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200"
            style={{ boxShadow: "0 0 8px rgba(245,197,102,0.8)" }}
          />
        );
      })}
      {/* Seed */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,228,168,0.95), rgba(245,197,102,0.2) 70%)",
          boxShadow: "0 0 30px rgba(245,197,102,0.6)",
        }}
      />
      {/* Minute count */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="font-display text-xl text-white/90">{minutes}</p>
        <p className="text-[9px] uppercase tracking-[0.3em] text-amber-200/70">min</p>
      </div>
    </div>
  );
}
