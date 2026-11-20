import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDailyRitual, useAnniversaryMoments } from "@/hooks/useDailyRitual";

/**
 * Pillar 7: Sacred Daily Touch — Morning Whisper, Evening Witness, Sunday Stillness.
 * Sits above the orb on Home. Quiet, sacred, never noisy.
 */
export default function RitualOfTheDayCard() {
  const { data, markSeen } = useDailyRitual();
  const { data: anniversaries } = useAnniversaryMoments();

  const rows = data?.rows ?? [];
  const sunday = rows.find((r) => r.ritual_type === "sunday_stillness");
  const morning = rows.find((r) => r.ritual_type === "morning_whisper");
  const evening = rows.find((r) => r.ritual_type === "evening_witness");

  // Pick what to show: hour-of-day determines morning vs evening
  const hour = new Date().getHours();
  const phase: "morning" | "evening" | "sunday" | null = useMemo(() => {
    if (sunday) return "sunday";
    if (hour < 16 && morning) return "morning";
    if (hour >= 16 && evening) return "evening";
    if (morning) return "morning";
    if (evening) return "evening";
    return null;
  }, [sunday, morning, evening, hour]);

  const active = phase === "sunday" ? sunday : phase === "morning" ? morning : evening;
  const anniversary = anniversaries?.[0];

  // Auto-mark seen after 4s
  useEffect(() => {
    if (!active || active.user_engaged) return;
    const t = setTimeout(() => markSeen.mutate(active.id), 4000);
    return () => clearTimeout(t);
  }, [active?.id]);

  if (!active && !anniversary) return null;

  return (
    <div className="w-full max-w-md mx-auto mb-4 px-2">
      <AnimatePresence mode="wait">
        {phase === "sunday" && active && (
          <motion.div
            key="sunday"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-6"
          >
            <motion.div
              animate={{ scale: [1, 1.04, 1], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-3xl mb-3"
            >
              🪔
            </motion.div>
            <p className="text-sm font-display italic text-foreground/70 leading-relaxed">
              {active.content}
            </p>
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground/40 mt-2">
              Sunday Stillness
            </p>
          </motion.div>
        )}

        {phase !== "sunday" && active && (
          <motion.div
            key={`ritual-${active.id}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-background/30 to-transparent backdrop-blur-sm px-5 py-4"
          >
            <p className="text-[9px] tracking-[0.3em] uppercase text-primary/60 mb-1.5">
              {phase === "morning" ? "Morning Whisper" : "Evening Witness"}
            </p>
            <p className="text-sm font-display text-foreground/90 leading-relaxed italic">
              {active.content}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Anniversary "Remember when…" */}
      {anniversary && phase !== "sunday" && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-2 px-5 py-3 rounded-xl border border-amber-500/15 bg-amber-500/5"
        >
          <p className="text-[9px] tracking-[0.3em] uppercase text-amber-500/70 mb-1">
            Remember when…
          </p>
          <p className="text-xs text-foreground/75 leading-snug">
            {anniversary.years_ago >= 1
              ? `${Math.round(anniversary.years_ago)} year${anniversary.years_ago >= 2 ? "s" : ""} ago today`
              : `${Math.round(anniversary.months_ago)} month${anniversary.months_ago >= 2 ? "s" : ""} ago`}
            {anniversary.user_words ? ` you wrote: "${anniversary.user_words.slice(0, 120)}${anniversary.user_words.length > 120 ? "…" : ""}"` : "."}
          </p>
        </motion.div>
      )}
    </div>
  );
}
