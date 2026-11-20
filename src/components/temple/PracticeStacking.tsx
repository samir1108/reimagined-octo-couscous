/**
 * Practice Stacking - Full Day Sadhana Orchestration
 * Per temple.md Section 30: Morning/Midday/Evening/Night practice flow
 */
import { motion } from "framer-motion";
import { Sun, Sunrise, Sunset, Moon, Play, Check } from "lucide-react";
import { useState } from "react";

interface PracticeSlot {
  time: "morning" | "midday" | "evening" | "night";
  timeRange: string;
  practice: string;
  master: string;
  duration: number;
  description: string;
  icon: React.ReactNode;
  done: boolean;
}

interface PracticeStackingProps {
  slots: PracticeSlot[];
  onPractice: (slot: PracticeSlot) => void;
}

export default function PracticeStacking({ slots, onPractice }: PracticeStackingProps) {
  const completedCount = slots.filter((s) => s.done).length;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white/40 text-[10px] font-display tracking-[0.3em] uppercase">
          Today's Flow
        </h3>
        <span className="text-white/25 text-[10px] font-display">
          {completedCount}/{slots.length} completed
        </span>
      </div>

      <div className="space-y-3">
        {slots.map((slot, i) => (
          <motion.div
            key={slot.time}
            className={`relative p-4 rounded-xl border transition-all ${
              slot.done
                ? "bg-emerald-500/5 border-emerald-500/15"
                : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1]"
            }`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  slot.done
                    ? "bg-emerald-500/15 text-emerald-400/60"
                    : "bg-white/[0.06] text-white/30"
                }`}
              >
                {slot.done ? <Check className="w-5 h-5" /> : slot.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-display font-medium ${slot.done ? "text-emerald-200/60" : "text-white/60"}`}>
                    {slot.practice}
                  </p>
                  <span className="text-white/20 text-[10px] font-display">{slot.duration} min</span>
                </div>
                <p className="text-white/30 text-[10px] font-display mt-0.5">
                  {slot.master} · {slot.timeRange}
                </p>
                <p className="text-white/20 text-[10px] font-display mt-0.5">{slot.description}</p>
              </div>

              {/* Play button */}
              {!slot.done && (
                <motion.button
                  onClick={() => onPractice(slot)}
                  className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-white/40 hover:bg-white/[0.12] hover:text-white/70 transition-all shrink-0"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Start ${slot.practice}`}
                >
                  <Play className="w-3.5 h-3.5 ml-0.5" />
                </motion.button>
              )}
            </div>

            {/* Connector line */}
            {i < slots.length - 1 && (
              <div className="absolute left-7 -bottom-3 w-px h-6 bg-white/[0.06]" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/**
 * Get default practice stacking based on time of day
 */
export function getDefaultPracticeStacking(hour?: number): PracticeSlot[] {
  const h = hour ?? new Date().getHours();

  const base: PracticeSlot[] = [
    {
      time: "morning",
      timeRange: "5 AM - 12 PM",
      practice: "Breathwork & Activation",
      master: "Krishna",
      duration: 15,
      description: "Fresh energy. Activate for the day.",
      icon: <Sunrise className="w-5 h-5" />,
      done: h >= 12,
    },
    {
      time: "midday",
      timeRange: "12 PM - 5 PM",
      practice: "Reset & Re-center",
      master: "Buddha",
      duration: 5,
      description: "Quick pause in the chaos.",
      icon: <Sun className="w-5 h-5" />,
      done: h >= 17,
    },
    {
      time: "evening",
      timeRange: "5 PM - 10 PM",
      practice: "Self-Inquiry & Reflection",
      master: "Ramana Maharshi",
      duration: 30,
      description: "Go inward. Process the day.",
      icon: <Sunset className="w-5 h-5" />,
      done: h >= 22,
    },
    {
      time: "night",
      timeRange: "10 PM - 5 AM",
      practice: "Yoga Nidra & Surrender",
      master: "Buddha",
      duration: 20,
      description: "Deep rest. Let go.",
      icon: <Moon className="w-5 h-5" />,
      done: false,
    },
  ];

  return base;
}
