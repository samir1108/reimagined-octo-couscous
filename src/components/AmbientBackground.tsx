import { motion } from "framer-motion";
import { getCurrentTimeSlot } from "@/lib/timeSlots";
import { useMemo } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const PARTICLES_COUNT = 12;

function FloatingParticle({ delay, x, y, size, color }: { delay: number; x: string; y: string; size: number; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, background: color }}
      animate={{
        y: [0, -20, 0],
        opacity: [0.2, 0.6, 0.2],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 6 + Math.random() * 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

function StarParticle({ delay, x, y }: { delay: number; x: string; y: string }) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full pointer-events-none"
      style={{ left: x, top: y, background: "hsl(var(--primary) / 0.4)" }}
      animate={{
        opacity: [0.1, 0.8, 0.1],
        scale: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 3 + Math.random() * 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export default function AmbientBackground() {
  const slot = getCurrentTimeSlot();
  const { mode } = useTheme();
  const isLight = mode === "light";

  const particles = useMemo(() => {
    return Array.from({ length: PARTICLES_COUNT }, (_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      delay: Math.random() * 3,
      size: 2 + Math.random() * 4,
    }));
  }, []);

  const gradients: Record<string, string> = isLight
    ? {
        morning: "radial-gradient(ellipse at 50% 80%, hsl(var(--primary) / 0.06) 0%, transparent 60%), radial-gradient(ellipse at 20% 20%, hsl(var(--secondary) / 0.04) 0%, transparent 50%)",
        midday: "radial-gradient(ellipse at 50% 30%, hsl(var(--primary) / 0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, hsl(var(--secondary) / 0.03) 0%, transparent 50%)",
        evening: "radial-gradient(ellipse at 30% 60%, hsl(var(--primary) / 0.05) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, hsl(var(--secondary) / 0.04) 0%, transparent 50%)",
        night: "radial-gradient(ellipse at 50% 50%, hsl(var(--muted) / 0.15) 0%, transparent 70%), radial-gradient(ellipse at 20% 80%, hsl(var(--primary) / 0.05) 0%, transparent 50%)",
      }
    : {
        morning: "radial-gradient(ellipse at 50% 80%, hsl(30 100% 55% / 0.08) 0%, transparent 60%), radial-gradient(ellipse at 20% 20%, hsl(45 100% 70% / 0.05) 0%, transparent 50%)",
        midday: "radial-gradient(ellipse at 50% 30%, hsl(45 100% 80% / 0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, hsl(30 100% 55% / 0.03) 0%, transparent 50%)",
        evening: "radial-gradient(ellipse at 30% 60%, hsl(20 80% 45% / 0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, hsl(280 40% 40% / 0.05) 0%, transparent 50%)",
        night: "radial-gradient(ellipse at 50% 50%, hsl(240 30% 10% / 0.5) 0%, transparent 70%), radial-gradient(ellipse at 20% 80%, hsl(260 40% 15% / 0.3) 0%, transparent 50%)",
      };

  const particleColor: Record<string, string> = isLight
    ? {
        morning: "hsl(var(--primary) / 0.2)",
        midday: "hsl(var(--primary) / 0.15)",
        evening: "hsl(var(--secondary) / 0.15)",
        night: "hsl(var(--primary) / 0.1)",
      }
    : {
        morning: "hsl(30 100% 65% / 0.4)",
        midday: "hsl(45 100% 75% / 0.3)",
        evening: "hsl(20 80% 50% / 0.3)",
        night: "hsl(45 100% 85% / 0.15)",
      };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ opacity: `var(--ambient-opacity, 1)` }}>
      <motion.div
        className="absolute inset-0"
        style={{ background: gradients[slot] }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />
      <div className="absolute inset-0">
      {slot === "night" ? (
        particles.map((p) => (
          <StarParticle key={p.id} delay={p.delay} x={p.x} y={p.y} />
        ))
      ) : (
        particles.map((p) => (
          <FloatingParticle
            key={p.id}
            delay={p.delay}
            x={p.x}
            y={p.y}
            size={p.size}
            color={particleColor[slot]}
          />
        ))
      )}
      </div>
    </div>
  );
}
