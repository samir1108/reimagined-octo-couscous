import { motion, AnimatePresence } from "framer-motion";
import { Check, Sun, Cloud, Sunset, Moon, Sparkles, Clock, ArrowRight, Circle } from "lucide-react";
import { useDailyGates } from "@/hooks/useSpiritualDNA";
import type { UserTimeProfile } from "@/hooks/useUserTimeProfile";
import type { TimeSlot } from "@/lib/timeSlots";
import { isSlotRelevant } from "@/hooks/useUserTimeProfile";
import { getCurrentGateForSchedule, getGateDef, type GateId } from "@/lib/consciousness/dailyGates";

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

const GATE_CONFIG = {
  morning: { label: "Morning", icon: Sun, time: "After waking", theme: "Awakening", accent: "45 100% 60%" },
  midday: { label: "Midday", icon: Cloud, time: "Middle of your day", theme: "Presence", accent: "200 80% 65%" },
  evening: { label: "Evening", icon: Sunset, time: "Later in your day", theme: "Integration", accent: "240 60% 50%" },
  night: { label: "Night", icon: Moon, time: "Wind-down & sleep", theme: "Sanctuary", accent: "270 50% 30%" },
} as const;

type GateKey = keyof typeof GATE_CONFIG;

interface SuggestedPractice {
  label: string;
  durationSec: number;
  focusType: string;
}

export interface GatePortalCardProps {
  profile?: UserTimeProfile;
  engineData?: {
    suggestions?: Array<{ gate?: GateId; practice?: { label: string; durationSec: number; focusType: string } }>;
    profile?: { weakestDimension?: string; activeLoops?: string[]; bypassingRisk?: number };
  };
  onEnterGate?: (gate: GateId) => void;
  className?: string;
}

function getSuggestedPracticeForGate(gate: GateId, engineData?: GatePortalCardProps["engineData"]): SuggestedPractice | null {
  if (!engineData?.suggestions) return null;
  const match = engineData.suggestions.find(s => s.gate === gate && s.practice);
  return match?.practice ?? null;
}

function getGateStatus(
  gate: GateKey,
  gatesData: ReturnType<typeof useDailyGates>["data"],
  currentGate: GateId,
): "pending" | "active" | "complete" | "skipped" {
  if (!gatesData) return "pending";
  const doneKey = `${gate}_done` as keyof typeof gatesData;
  const atKey = `${gate}_at` as keyof typeof gatesData;
  if (gatesData[doneKey]) return "complete";
  if (gatesData[atKey]) return "active";
  if (currentGate === gate) return "active";
  if (currentGate !== gate && ["morning", "midday", "evening", "night"].indexOf(currentGate) > ["morning", "midday", "evening", "night"].indexOf(gate)) {
    return "skipped";
  }
  return "pending";
}

export default function GatePortalCard({ profile, engineData, onEnterGate, className = "" }: GatePortalCardProps) {
  const { data: gates } = useDailyGates();
  const currentGate = getCurrentGateForSchedule(new Date(), profile?.wakeTime, profile?.sleepTime);

  const relevantGates = (Object.keys(GATE_CONFIG) as GateKey[]).filter(g => isSlotRelevant(g as TimeSlot, profile));

  if (relevantGates.length === 0) return null;

  const completedCount = relevantGates.filter(g => {
    const doneKey = `${g}_done` as keyof typeof gates;
    return gates?.[doneKey];
  }).length;

  const progress = Math.round((completedCount / relevantGates.length) * 100);

  return (
    <motion.div
      className={`glass-card rounded-2xl p-4 ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary w-full h-full">
              <circle cx="12" cy="12" r="10" opacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" opacity="0.8" strokeLinecap="round" />
            </svg>
          </motion.div>
          <span className="text-[10px] font-display tracking-[0.2em] uppercase text-primary font-semibold">
            Daily Gates
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground font-body">
          {completedCount}/{relevantGates.length} complete
        </span>
      </div>

      {/* Progress ring */}
      <div className="relative mb-4">
        <svg className="w-16 h-16 mx-auto -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-muted/20"
          />
          <motion.circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="url(#gate-gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 28}
            initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - progress / 100) }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-primary"
          />
          <defs>
            <linearGradient id="gate-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(45 100% 60%)" />
              <stop offset="25%" stopColor="hsl(200 80% 65%)" />
              <stop offset="50%" stopColor="hsl(240 60% 50%)" />
              <stop offset="75%" stopColor="hsl(270 50% 30%)" />
              <stop offset="100%" stopColor="hsl(45 100% 60%)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-display font-semibold tabular-nums">{progress}%</span>
        </div>
      </div>

      {/* Gate cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {relevantGates.map((gateKey, i) => {
          const config = GATE_CONFIG[gateKey];
          const Icon = config.icon;
          const gateId = gateKey as GateId;
          const gateDef = getGateDef(gateId);
          const status = getGateStatus(gateKey, gates, currentGate);
          const isCurrent = gateId === currentGate;
          const suggestedPractice = getSuggestedPracticeForGate(gateId, engineData);
          const qualityKey = `${gateKey}_quality` as keyof typeof gates;
          const quality = gates?.[qualityKey] as number | undefined;

          const statusColors = {
            complete: "bg-primary/15 border-primary/20 text-primary",
            active: "bg-primary/10 border-primary/30 ring-2 ring-primary/20 text-primary",
            pending: "bg-muted/20 border-border/10 text-muted-foreground/60",
            skipped: "bg-muted/10 border-border/5 text-muted-foreground/30",
          };

          const statusLabels = {
            complete: "Complete",
            active: "Now",
            pending: "Upcoming",
            skipped: "Missed",
          };

          return (
            <motion.div
              key={gateKey}
              className={`relative rounded-2xl p-3 transition-all ${statusColors[status]} border cursor-pointer hover:shadow-lg hover:-translate-y-0.5`}
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.08, ...spring }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onEnterGate?.(gateId)}
              style={{ 
                background: `linear-gradient(135deg, hsl(${gateDef.accentColor} / 0.05) 0%, transparent 100%)`,
                borderColor: `hsl(${gateDef.accentColor} / ${status === "active" ? "0.4" : status === "complete" ? "0.3" : "0.1"})`,
              }}
            >
              {/* Gate accent ring */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ 
                boxShadow: `inset 0 0 0 1px hsl(${gateDef.accentColor} / ${isCurrent ? "0.3" : "0.1"})` 
              }} />

              {/* Status badge */}
              <div className="relative z-10 flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-4 h-4 ${statusColors[status].includes("text-primary") ? "text-primary" : "text-muted-foreground/40"}`} />
                  <span className="text-[9px] font-display font-medium tracking-[0.1em] uppercase">
                    {config.label}
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  {status === "complete" && (
                    <motion.div
                      key="complete"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 90 }}
                      transition={spring}
                      className="flex items-center gap-1 text-[9px] font-medium text-primary"
                    >
                      <Check className="w-3 h-3" />
                    </motion.div>
                  )}
                  {status === "active" && (
                    <motion.div
                      key="active"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={spring}
                      className="flex items-center gap-1 text-[9px] font-medium text-primary"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full bg-primary"
                      />
                      <span>Now</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Time range */}
              <p className="text-[10px] text-muted-foreground/60 mb-2 font-mono">
                {config.time}
              </p>

              {/* Theme */}
              <p className="text-[10px] font-display tracking-[0.1em] uppercase text-muted-foreground/50 mb-2">
                {config.theme}
              </p>

              {/* Suggested practice */}
              {suggestedPractice && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-2 p-2 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-primary/90 mb-1">
                    <Sparkles className="w-3 h-3" />
                    <span className="font-medium">{suggestedPractice.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-muted-foreground/60">
                    <Clock className="w-3 h-3" />
                    <span>{Math.round(suggestedPractice.durationSec / 60)} min</span>
                    <span className="text-primary/50">{suggestedPractice.focusType}</span>
                  </div>
                </motion.div>
              )}

              {/* Quality score */}
              {status === "complete" && quality !== undefined && (
                <div className="flex items-center gap-1.5 text-[10px] text-primary/80">
                  <span className="font-mono tabular-nums">{Math.round(quality * 100)}%</span>
                  <span className="text-muted-foreground/50">quality</span>
                </div>
              )}

              {/* Enter button for active/pending */}
              {(status === "active" || status === "pending") && (
                <motion.button
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="w-full mt-2 px-3 py-1.5 rounded-xl text-[10px] font-display font-medium tracking-[0.1em] uppercase text-white hover:brightness-110 transition"
                  style={{ background: `hsl(${gateDef.accentColor})` }}
                  onClick={(e) => { e.stopPropagation(); onEnterGate?.(gateId); }}
                >
                  Enter Gate
                  <ArrowRight className="w-3 h-3 inline ml-1" />
                </motion.button>
              )}

              {/* Skipped indicator */}
              {status === "skipped" && (
                <div className="w-full mt-2 px-3 py-1.5 rounded-xl text-[10px] font-display font-medium tracking-[0.1em] uppercase text-muted-foreground/40 bg-muted/20 text-center">
                  {new Date().getHours() < 5 ? "Tonight" : "Tomorrow"}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Orb sync indicator */}
      <div className="mt-4 flex items-center justify-center gap-2 text-[9px] text-muted-foreground/50">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-primary"
        />
        <span>Orb synced to {GATE_CONFIG[currentGate as GateKey].label} mode</span>
      </div>
    </motion.div>
  );
}