import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import StreakFlame from "@/components/StreakFlame";
import { useCompoundSession } from "@/components/sutra/CompoundSessionRunner";
import { supabase } from "@/lib/supabase";

interface SessionCompleteProps {
  streak?: number;
  insight?: string;
  /** Label of the next session in the day's rhythm (e.g. "Midday"). When provided, a CTA invites the user to continue. */
  nextSlotLabel?: string | null;
  onDone: () => void;
}

type ShiftPulse = "settled" | "stirred" | "stuck";

const PULSE_OPTIONS: Array<{ value: ShiftPulse; label: string; emoji: string }> = [
  { value: "settled", label: "Settled", emoji: "🌊" },
  { value: "stirred", label: "Stirred", emoji: "✨" },
  { value: "stuck", label: "Stuck", emoji: "🌫" },
];

function CelebrationParticle({ delay, angle }: { delay: number; angle: number }) {
  const rad = (angle * Math.PI) / 180;
  const distance = 80 + Math.random() * 60;
  return (
    <motion.div
      className="absolute w-1.5 h-1.5 rounded-full"
      style={{
        left: "50%",
        top: "50%",
        background: `hsl(${30 + Math.random() * 30} 100% ${60 + Math.random() * 20}%)`,
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: Math.cos(rad) * distance,
        y: Math.sin(rad) * distance,
        opacity: 0,
        scale: 0,
      }}
      transition={{ duration: 1.2, delay, ease: "easeOut" }}
    />
  );
}

export default function SessionComplete({ streak = 0, insight, nextSlotLabel, onDone }: SessionCompleteProps) {
  const [showInsight, setShowInsight] = useState(false);
  const [pulse, setPulse] = useState<ShiftPulse | null>(null);
  const compound = useCompoundSession();
  const firedRef = useRef(false);

  const recordPulse = async (value: ShiftPulse) => {
    if (pulse) return;
    setPulse(value);
    // Fire-and-forget — log to consciousness_signals so future composer can use it.
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await (supabase.from as any)("consciousness_signals").insert({
        user_id: user.id,
        source_type: "session_end_pulse",
        chitta_vritti: value,
        confidence: 0.6,
        gut_signals: { shift: value },
      });
    } catch (e) {
      console.debug("[session-pulse] swallowed:", e);
    }
  };

  useEffect(() => {
    const t1 = setTimeout(() => setShowInsight(true), 1000);

    // Sutra integration (Law 6 — honest movement):
    //  • Fire `complete` feedback for the just-finished block.
    //  • If we're in a compound session with another block queued,
    //    advance to it instead of returning home.
    if (!firedRef.current && compound.currentBlock) {
      firedRef.current = true;
      compound.finish({ quality: 0.7 }).then((r) => {
        if (r.advanced) return; // navigation already happened
      });
    }

    const advancing = compound.isInCompound && compound.hasNext;
    const autoMs = advancing ? 2200 : nextSlotLabel ? 3200 : 5000;
    const t2 = setTimeout(() => {
      if (!advancing) onDone();
    }, autoMs);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone, nextSlotLabel, compound]);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    angle: (360 / 20) * i,
    delay: 0.3 + Math.random() * 0.3,
  }));

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Celebration particles */}
      <div className="relative">
        {particles.map((p) => (
          <CelebrationParticle key={p.id} delay={p.delay} angle={p.angle} />
        ))}

        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="text-7xl"
        >
          🙏
        </motion.div>
      </div>

      <motion.h2
        className="text-3xl md:text-4xl font-display font-bold text-foreground mt-8 tracking-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        Session Complete
      </motion.h2>
      <motion.p
        className="text-sm text-muted-foreground mt-3 text-center px-6 max-w-sm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        {nextSlotLabel
          ? `Well done. Your next session, ${nextSlotLabel}, will be ready when you are.`
          : "Well done. Even this small pause matters — the thread holds."}
      </motion.p>
      {streak && streak > 0 && (
        <motion.p
          className="text-xs text-primary/80 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          {streak} day{streak === 1 ? "" : "s"} of showing up
        </motion.p>
      )}
    </motion.div>
  );
}
