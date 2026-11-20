/**
 * JourneyPersonalization — final phase of the cinematic journey.
 * Allows the user to review and fine-tune the metrics computed by the engine.
 * Once confirmed, data is persisted to Supabase and the journey completes.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { ComputedMetrics } from "@/machines/journeyMachine";

interface JourneyPersonalizationProps {
  metrics: ComputedMetrics;
  onConfirm: () => void;
}

const EDITABLE_METRICS: { key: keyof ComputedMetrics; label: string; type: "select" | "scale" }[] = [
  { key: "primaryPath", label: "Primary Path", type: "select" },
  { key: "archetypePrimary", label: "Archetype", type: "select" },
  { key: "dominantBrain", label: "Dominant Brain", type: "select" },
  { key: "attachmentStyle", label: "Attachment Style", type: "select" },
  { key: "beliefLevel", label: "Belief Level", type: "select" },
  { key: "circadianPeak", label: "Peak Energy Time", type: "select" },
];

const PATH_OPTIONS = ["bhakti", "karma", "jnana", "raja", "tantra", "kriya", "dhyana"];
const ARCHETYPE_OPTIONS = ["seeker", "devotee", "warrior", "sage", "mystic", "healer", "lover", "creator", "hermit", "servant"];
const BRAIN_OPTIONS = ["head", "heart", "gut"];
const ATTACHMENT_OPTIONS = ["secure", "anxious", "avoidant", "disorganized", "mixed"];
const BELIEF_OPTIONS = ["external", "mixed", "internal", "nondual"];
const CIRCADIAN_OPTIONS = ["morning", "midday", "evening", "night"];

const OPTION_MAP: Record<string, string[]> = {
  primaryPath: PATH_OPTIONS,
  archetypePrimary: ARCHETYPE_OPTIONS,
  dominantBrain: BRAIN_OPTIONS,
  attachmentStyle: ATTACHMENT_OPTIONS,
  beliefLevel: BELIEF_OPTIONS,
  circadianPeak: CIRCADIAN_OPTIONS,
};

export default function JourneyPersonalization({ metrics, onConfirm }: JourneyPersonalizationProps) {
  const [localMetrics, setLocalMetrics] = useState<Partial<ComputedMetrics>>(metrics);
  const [confirmed, setConfirmed] = useState(false);

  const handleChange = (key: keyof ComputedMetrics, value: string | number) => {
    setLocalMetrics((prev) => ({ ...prev, [key]: value }));
  };

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(onConfirm, 800);
  };

  return (
    <motion.div
      className="absolute inset-0 z-50 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-fuchsia-950" />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-10 space-y-6">
        <motion.div
          className="text-center space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Personalise</h2>
          <p className="text-white/50 font-body text-sm">
            Review your metrics. Adjust anything that doesn't feel right.
          </p>
        </motion.div>

        {/* Hero band */}
        <motion.div
          className="glass-card rounded-2xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-white/40 text-xs font-body uppercase tracking-wider mb-1">Overall Band</p>
          <p className="text-5xl font-display font-bold text-white">
            {localMetrics.overallBand?.toFixed(1)}
          </p>
        </motion.div>

        {/* Editable fields */}
        <div className="space-y-4">
          {EDITABLE_METRICS.map(({ key, label }, i) => {
            const options = OPTION_MAP[key] || [];
            const current = (localMetrics as any)[key] || "";
            return (
              <motion.div
                key={key}
                className="glass-card rounded-2xl p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <label className="text-white/50 text-xs font-body uppercase tracking-wider block mb-3">
                  {label}
                </label>
                <div className="flex flex-wrap gap-2">
                  {options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleChange(key, opt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-body capitalize transition-all ${
                        current === opt
                          ? "bg-white/15 border border-white/30 text-white"
                          : "bg-white/5 border border-white/10 text-white/50 hover:bg-white/10"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Confirm */}
        <motion.div
          className="pt-4 pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <button
            onClick={handleConfirm}
            disabled={confirmed}
            className="group flex items-center gap-2 mx-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all disabled:opacity-50"
          >
            {confirmed ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="font-display text-emerald-300 text-sm">Saved</span>
              </>
            ) : (
              <>
                <span className="font-display text-white/80 text-sm">Confirm & Save</span>
                <Check className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" />
              </>
            )}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
