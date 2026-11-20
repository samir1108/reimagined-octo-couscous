/**
 * SlotAtmosphere — full-bleed slot-tinted sky behind Home content.
 * Layered above AmbientBackground; uses semantic tokens only.
 */
import { motion } from "framer-motion";
import { useMemo } from "react";
import { getSlotDesign } from "@/lib/slotDesign";
import type { TimeSlot } from "@/lib/timeSlots";

interface SlotAtmosphereProps {
  slot: TimeSlot;
}

export default function SlotAtmosphere({ slot }: SlotAtmosphereProps) {
  const design = getSlotDesign(slot);

  // Stable star positions for night/evening (deterministic)
  const stars = useMemo(() => {
    if (slot !== "night" && slot !== "evening") return [];
    const seed = slot === "night" ? 60 : 24;
    return Array.from({ length: seed }).map((_, i) => ({
      left: ((i * 53) % 97) + (i % 7),
      top: ((i * 37) % 91) + (i % 5),
      size: ((i % 3) + 1) * 0.6,
      delay: (i % 9) * 0.4,
    }));
  }, [slot]);

  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      aria-hidden
    >
      {/* Sky */}
      <motion.div
        className="absolute inset-0"
        style={{ background: design.skyVar }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        key={slot}
      />

      {/* Breath-paced glow */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: slot === "morning" ? "-20%" : slot === "evening" ? "-25%" : "-50%",
          top: slot === "midday" ? "-30%" : "auto",
          width: "140%",
          height: "100%",
          background: `radial-gradient(ellipse at center, hsl(${design.accentVar} / 0.18), transparent 60%)`,
          filter: "blur(40px)",
        }}
        animate={{
          opacity: [0.55, 0.85, 0.55],
          scale: [1, 1.04, 1],
        }}
        transition={{
          duration: design.breathSeconds * 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Stars (evening + night only) — desktop only, mobile stays clean */}
      <div>
      {stars.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-foreground/70"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
          }}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{
            duration: 3 + (i % 4),
            delay: s.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      </div>

      {/* Subtle grain veil */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  );
}
