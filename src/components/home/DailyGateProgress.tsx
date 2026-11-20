import { motion } from "framer-motion";
import { Check, Sun, Cloud, Sunset, Moon } from "lucide-react";
import { useDailyGates } from "@/hooks/useSpiritualDNA";
import type { UserTimeProfile } from "@/hooks/useUserTimeProfile";
import type { TimeSlot } from "@/lib/timeSlots";
import { isSlotRelevant } from "@/hooks/useUserTimeProfile";

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

const GATES = [
  { key: "morning", label: "Morning", icon: Sun, time: "5am-12pm" },
  { key: "midday", label: "Midday", icon: Cloud, time: "12pm-5pm" },
  { key: "evening", label: "Evening", icon: Sunset, time: "5pm-9pm" },
  { key: "night", label: "Night", icon: Moon, time: "9pm-5am" },
] as const;

interface DailyGateProgressProps {
  profile?: UserTimeProfile;
}

export default function DailyGateProgress({ profile }: DailyGateProgressProps) {
  const { data: gates } = useDailyGates();

  const relevantGates = GATES.filter(g => isSlotRelevant(g.key as TimeSlot, profile));

  if (relevantGates.length === 0) return null;

  const completedCount = relevantGates.filter(g => {
    const doneKey = `${g.key}_done` as keyof typeof gates;
    return gates?.[doneKey];
  }).length;

  const progress = Math.round((completedCount / relevantGates.length) * 100);

  return (
    <motion.div
      className="glass-card rounded-2xl p-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-display tracking-[0.2em] uppercase text-primary font-semibold">
          Daily Gates
        </span>
        <span className="text-[10px] text-muted-foreground font-body">
          {completedCount}/{relevantGates.length} complete
        </span>
      </div>

      <div className="flex gap-2">
        {relevantGates.map((gate, i) => {
          const Icon = gate.icon;
          const doneKey = `${gate.key}_done`;
          const isDone = gates?.[doneKey as keyof typeof gates];
          
          return (
            <motion.div
              key={gate.key}
              className={`flex-1 rounded-xl p-2.5 text-center transition-colors ${
                isDone ? "bg-primary/15 border border-primary/20" : "bg-muted/20 border border-border/10"
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="relative inline-block">
                <Icon className={`w-4 h-4 mx-auto mb-1 ${isDone ? "text-primary" : "text-muted-foreground/40"}`} />
                {isDone && (
                  <Check className="w-2.5 h-2.5 text-primary absolute -top-0.5 -right-1.5" />
                )}
              </div>
              <p className={`text-[9px] font-display ${isDone ? "text-primary" : "text-muted-foreground/50"}`}>
                {gate.label}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 rounded-full bg-muted/20 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary/50"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}
