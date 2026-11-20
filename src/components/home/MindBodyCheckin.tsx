import { motion } from "framer-motion";
import { Heart, Activity, Wind, Check, Brain, Zap } from "lucide-react";
import { useState } from "react";
import { getCurrentGate, getGateDef } from "@/lib/consciousness/dailyGates";
import { hapticBreath } from "@/lib/haptics";
import { playSoundEffect } from "@/lib/soundEffects";

const EASE = [0.16, 1, 0.3, 1] as const;
const JUNK_TEXT = /^(undefined|null|n\/?a|none|nan)$/i;

function cleanText(v: unknown): string {
  if (typeof v !== "string") return "";
  const s = v.trim();
  return s && !JUNK_TEXT.test(s) ? s : "";
}

const todayKey = () => new Date().toISOString().split("T")[0];

function readKeptGate(): string | null {
  try {
    return localStorage.getItem(`checkin-kept-${todayKey()}`);
  } catch {
    return null;
  }
}

interface PresenceCard {
  prompt: string;
  type: string;
}

interface Props {
  presenceCard: PresenceCard | null;
  engineData: {
    plan?: {
      focusDimension?: string;
      presenceCard?: PresenceCard;
    } | null;
    profile?: {
      dimension_bands?: Record<string, number>;
    } | null;
  } | null;
}

const CHECKIN_STEPS = [
  { key: "body", label: "Body", icon: Activity, color: "text-emerald-400", prompt: "Scan your body. Where is tension? Where is ease?" },
  { key: "emotion", label: "Emotion", icon: Heart, color: "text-rose-300", prompt: "What emotion is here? Name it without story." },
  { key: "breath", label: "Breath", icon: Wind, color: "text-sky-300", prompt: "Three slow breaths. Feel the air enter and leave." },
] as const;

export default function MindBodyCheckin({ presenceCard, engineData }: Props) {
  const gate = getCurrentGate(new Date().getHours());
  const gateDef = getGateDef(gate);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`checkin-steps-${todayKey()}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const enginePresence = engineData?.plan?.presenceCard;
  const card = presenceCard || enginePresence;
  const weakestDim = engineData?.plan?.focusDimension?.toLowerCase();

  const allDone = CHECKIN_STEPS.every((s) => completed.includes(s.key));

  const completeStep = (stepKey: string) => {
    hapticBreath();
    playSoundEffect("threshold");
    const next = [...completed, stepKey];
    setCompleted(next);
    try {
      localStorage.setItem(`checkin-steps-${todayKey()}`, JSON.stringify(next));
    } catch {}
    if (next.length >= CHECKIN_STEPS.length) {
      try {
        localStorage.setItem(`checkin-kept-${todayKey()}`, gate);
      } catch {}
    }
    if (currentStep < CHECKIN_STEPS.length - 1) {
      setCurrentStep((c) => c + 1);
    }
  };

  const resetCheckin = () => {
    setCompleted([]);
    setCurrentStep(0);
    try {
      localStorage.removeItem(`checkin-steps-${todayKey()}`);
      localStorage.removeItem(`checkin-kept-${todayKey()}`);
    } catch {}
  };

  if (!card?.prompt && !weakestDim) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.11 }}
      aria-label="Mind–body check-in"
      className="w-full rounded-2xl border border-border/30 bg-card/40 px-5 py-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-display tracking-[0.28em] uppercase text-primary/70 flex items-center gap-1.5">
          <Brain className="h-3 w-3" aria-hidden />
          Mind–body check-in
        </p>
        <span className={`text-[9px] font-display tracking-[0.14em] uppercase ${allDone ? "text-emerald-300/80" : "text-muted-foreground/45"}`}>
          {allDone ? "Complete" : `Step ${currentStep + 1} of ${CHECKIN_STEPS.length}`}
        </span>
      </div>

      {card?.prompt && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
          className="mt-3 text-center text-[13px] leading-[1.65] text-foreground/80"
          style={{ color: `hsl(${gateDef.accentColor} / 0.9)` }}
        >
          {card.prompt}
        </motion.p>
      )}

      <div className="mt-4 space-y-2" role="list">
        {CHECKIN_STEPS.map((step, i) => {
          const isDone = completed.includes(step.key);
          const isCurrent = i === currentStep && !allDone;
          const isWeakest = weakestDim && step.key === weakestDim;

          return (
            <motion.button
              key={step.key}
              type="button"
              onClick={() => isDone ? undefined : completeStep(step.key)}
              disabled={isDone || (isCurrent === false && i > currentStep)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.15 + i * 0.05 }}
              className={`w-full flex items-center gap-3 rounded-xl p-3 transition-all ${
                isDone
                  ? "bg-emerald-400/[0.07] border border-emerald-400/20"
                  : isCurrent
                  ? "bg-primary/10 border border-primary/30 ring-2 ring-primary/20"
                  : "bg-card/50 border border-border/30 opacity-50 hover:opacity-100 hover:border-primary/20"
              }`}
              role="listitem"
              aria-disabled={isDone || i > currentStep}
              aria-current={isCurrent ? "step" : undefined}
            >
              <step.icon
                className={`flex-shrink-0 h-4.5 w-4.5 ${isDone ? "text-emerald-400" : isCurrent ? step.color : "text-muted-foreground/40"}`}
                aria-hidden
              />
              <div className="flex-1 text-left">
                <p className={`text-[11px] font-medium ${isDone ? "text-emerald-300/80" : isCurrent ? "text-foreground/90" : "text-foreground/60"}`}>
                  {step.label}
                  {isWeakest && <span className="ml-1.5 text-[9px] font-display tracking-[0.1em] uppercase text-primary/70">(focus)</span>}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground/50 line-clamp-1">{step.prompt}</p>
              </div>
              {isDone ? (
                <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" aria-hidden />
              ) : isCurrent ? (
                <Zap className="h-4 w-4 text-primary flex-shrink-0 animate-pulse" aria-hidden />
              ) : (
                <div className="flex-shrink-0 h-4 w-4" />
              )}
            </motion.button>
          );
        })}
      </div>

      {allDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
          className="mt-4 flex items-center justify-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2"
        >
          <Check className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
          <span className="text-[10px] font-display tracking-[0.18em] uppercase text-emerald-300/90">
            Check-in complete
          </span>
        </motion.div>
      )}

      {!allDone && completed.length > 0 && (
        <button
          type="button"
          onClick={resetCheckin}
          className="mt-3 w-full text-center text-[9px] font-display tracking-[0.18em] uppercase text-muted-foreground/40 hover:text-foreground/60 transition-colors"
        >
          Reset check-in
        </button>
      )}
    </motion.section>
  );
}