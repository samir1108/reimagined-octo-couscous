/**
 * TEMPLE VOWS COMPONENT
 * Per temple.md Section 30, 40: Psychological commitment before journeys/programs
 * Shown before 100-day journey start, program activation
 */
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { playTempleBell } from "@/lib/templeSounds";

interface TempleVowsProps {
  onAccept: () => void;
  onSkip: () => void;
  context?: string; // "journey" | "program"
  masterName?: string;
}

const VOWS = [
  "I vow to practice daily, even if only 5 minutes",
  "I vow to be honest with myself about my struggles",
  "I vow not to judge my progress or compare with others",
  "I vow to return when I fall off, without guilt or shame",
  "I vow to respect the tradition and use these teachings wisely",
  "I vow to stay open to transformation, even when it's uncomfortable",
];

export default function TempleVows({ onAccept, onSkip, context, masterName }: TempleVowsProps) {
  const [checked, setChecked] = useState<boolean[]>(new Array(VOWS.length).fill(false));

  const allChecked = checked.every(Boolean);

  const toggleVow = (index: number) => {
    setChecked(prev => prev.map((v, i) => i === index ? !v : v));
  };

  const handleAccept = () => {
    playTempleBell();
    onAccept();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-full max-w-md bg-black/95 border border-white/[0.08] rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-3xl mb-3">🕯️</div>
          <h2 className="text-white/80 text-lg font-display tracking-wide">Temple Vows</h2>
          {context && (
            <p className="text-white/30 text-xs font-display mt-1">
              Before your {context}
              {masterName && ` with ${masterName}`}
            </p>
          )}
          <p className="text-white/25 text-xs font-display mt-2">
            Make these commitments to yourself
          </p>
        </div>

        {/* Vows */}
        <div className="space-y-3 mb-6">
          {VOWS.map((vow, i) => (
            <motion.button
              key={i}
              onClick={() => toggleVow(i)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                checked[i]
                  ? "bg-emerald-500/10 border-emerald-500/20"
                  : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
              }`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0 ${
                    checked[i]
                      ? "bg-emerald-500/30 border-emerald-500/50"
                      : "border-white/[0.15]"
                  }`}
                >
                  {checked[i] && <Check className="w-3 h-3 text-emerald-400/80" />}
                </div>
                <p className="text-white/60 text-xs font-display leading-relaxed">{vow}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Footer message */}
        <p className="text-white/20 text-[10px] font-display italic text-center mb-6">
          "These vows are between you and yourself. No one judges. No one tracks. Just intention."
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onSkip}
            className="flex-1 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/40 text-xs font-display tracking-wider hover:bg-white/[0.1] transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleAccept}
            disabled={!allChecked}
            className={`flex-1 py-2.5 rounded-xl text-xs font-display tracking-wider transition-all ${
              allChecked
                ? "bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/25 text-amber-200/80 hover:from-amber-600/40 hover:to-orange-600/40"
                : "bg-white/[0.06] border border-white/[0.08] text-white/20 cursor-not-allowed"
            }`}
          >
            {allChecked ? "I Make These Vows" : "Check All Vows"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
