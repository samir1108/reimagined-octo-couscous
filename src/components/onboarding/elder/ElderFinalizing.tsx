/**
 * ElderFinalizing — world-class full-screen interstitial shown while the
 * Elder is synthesizing the user's reading (after dialogue ends, before
 * ElderAnalyzing starts). Pure presentation, no logic.
 */
import { motion } from "framer-motion";
const PHASES = [
  "Listening to what was said…",
  "Listening to what was not…",
  "Tracing the loops underneath…",
  "Drawing the first photograph…",
];

export default function ElderFinalizing({ name }: { name?: string }) {
  return (
    <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Cosmic backdrop */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.18),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_70%)]" />
        {Array.from({ length: 70 }).map((_, i) => {
          const top = (i * 37) % 100;
          const left = (i * 53) % 100;
          const size = (i % 3) + 1;
          const delay = (i % 9) * 0.35;
          const dur = 2.4 + (i % 6) * 0.5;
          return (
            <span
              key={i}
              className="absolute rounded-full bg-foreground/70"
              style={{
                top: `${top}%`,
                left: `${left}%`,
                width: size,
                height: size,
                opacity: 0.18 + ((i % 5) * 0.1),
                animation: `efinTwinkle ${dur}s ease-in-out ${delay}s infinite`,
              }}
            />
          );
        })}
        <style>{`
          @keyframes efinTwinkle { 0%,100% { opacity: 0.15; } 50% { opacity: 0.9; } }
          @keyframes efinPulse { 0%,100% { transform: scale(1); opacity: 0.55; } 50% { transform: scale(1.18); opacity: 0.95; } }
          @keyframes efinHalo { 0%,100% { transform: scale(1); opacity: 0.25; } 50% { transform: scale(1.4); opacity: 0.05; } }
        `}</style>
      </div>

      {/* Center — breathing orb */}
      <div className="relative flex items-center justify-center mb-12">
        
      </div>

      {/* Copy */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-[10px] uppercase tracking-[0.4em] text-primary/80 mb-4"
      >
        Reading you{name ? `, ${name}` : ""}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.9 }}
        className="font-display text-2xl md:text-3xl text-foreground/95 text-center px-8 leading-snug max-w-md"
      >
        A few breaths<br />while we draw the picture.
      </motion.h1>

      {/* Rolling phases */}
      <div className="mt-12 h-6 overflow-hidden relative w-full max-w-xs">
        {PHASES.map((p, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [10, 0, 0, -10],
            }}
            transition={{
              duration: 3.2,
              delay: i * 3.2,
              repeat: Infinity,
              repeatDelay: (PHASES.length - 1) * 3.2,
              ease: "easeInOut",
            }}
            className="absolute inset-0 text-center text-sm italic text-muted-foreground"
          >
            {p}
          </motion.p>
        ))}
      </div>

      {/* Soft progress dots */}
      <div className="mt-10 flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-primary/70"
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.4, delay: i * 0.25, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}
