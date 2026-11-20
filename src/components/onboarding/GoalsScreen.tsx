/**
 * GoalsScreen
 * ───────────
 * Cinematic Elder-style screen asking the user what brings them here.
 * - Pick 1–3 goals (first tap = priority, next two = secondary)
 * - Optional one-line "why now"
 * - Skippable; default to "presence" if skipped
 *
 * Used both in onboarding flow and as a standalone editor (via Settings).
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";
import elderImg from "@/assets/masters/the-elder.png";
import { GOAL_CATALOG } from "@/lib/goals/catalog";

export interface GoalsScreenValue {
  priorityGoal: string;
  secondaryGoals: string[];
  whyNow: string | null;
}

interface Props {
  name?: string;
  initial?: GoalsScreenValue | null;
  onComplete: (value: GoalsScreenValue) => void;
  onSkip?: () => void;
  /** When true, hides the cinematic Elder portrait (used inside Settings). */
  embedded?: boolean;
  cta?: string;
}

export default function GoalsScreen({
  name,
  initial,
  onComplete,
  onSkip,
  embedded = false,
  cta = "Continue",
}: Props) {
  const [selected, setSelected] = useState<string[]>(() => {
    if (!initial) return [];
    return [initial.priorityGoal, ...initial.secondaryGoals].filter(Boolean);
  });
  const [whyNow, setWhyNow] = useState(initial?.whyNow ?? "");

  const priorityGoal = selected[0] ?? null;
  const secondaryGoals = selected.slice(1, 3);
  const canSubmit = !!priorityGoal;

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev; // cap at 3
      return [...prev, id];
    });
  };

  const submit = () => {
    if (!priorityGoal) return;
    onComplete({ priorityGoal, secondaryGoals, whyNow: whyNow.trim() || null });
  };

  const subtitle = useMemo(() => {
    if (!selected.length) return "Tap up to 3. The first becomes your priority.";
    if (selected.length === 1) return "Priority set. Add up to 2 more (optional).";
    return `${selected.length}/3 chosen · first is priority`;
  }, [selected.length]);

  return (
    <motion.div
      key="goals-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={embedded ? "w-full" : "absolute inset-0 flex flex-col items-center justify-start px-6 pt-12 pb-32 overflow-y-auto"}
    >
      {!embedded && (
        <motion.img
          src={elderImg}
          alt=""
          className="w-20 h-20 object-contain opacity-90 mb-5"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 0.9 }}
          transition={{ duration: 0.6 }}
        />
      )}

      <motion.div
        className="w-full max-w-md text-center mb-6"
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <span className="text-[10px] font-display tracking-[0.4em] uppercase text-primary/80">
          What brings you here{name ? `, ${name}` : ""}
        </span>
        <h2 className="mt-3 text-2xl font-display text-foreground leading-tight">
          Choose what matters most
        </h2>
        <p className="mt-2 text-xs text-muted-foreground/80">{subtitle}</p>
      </motion.div>

      <div className="w-full max-w-md grid grid-cols-2 gap-2.5 mb-5">
        {GOAL_CATALOG.map((g) => {
          const idx = selected.indexOf(g.id);
          const isPriority = idx === 0;
          const isSecondary = idx > 0;
          const isOn = idx >= 0;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => toggle(g.id)}
              className={`relative text-left rounded-xl border px-3 py-2.5 transition-all ${
                isPriority
                  ? "border-primary bg-primary/15"
                  : isSecondary
                  ? "border-primary/50 bg-primary/8"
                  : "border-border/60 bg-card/40 hover:border-primary/40"
              }`}
              aria-pressed={isOn}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg leading-none mt-0.5">{g.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-display text-foreground truncate">
                      {g.label}
                    </span>
                    {isPriority && (
                      <span className="text-[8px] font-display tracking-[0.2em] uppercase text-primary">
                        ★
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground/70 leading-snug truncate">
                    {g.description}
                  </p>
                </div>
                <AnimatePresence>
                  {isOn && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="shrink-0"
                    >
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </button>
          );
        })}
      </div>

      <div className="w-full max-w-md mb-6">
        <label className="text-[10px] font-display tracking-[0.3em] uppercase text-muted-foreground/70 mb-2 block">
          Why now? <span className="opacity-60 normal-case tracking-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={whyNow}
          onChange={(e) => setWhyNow(e.target.value)}
          maxLength={140}
          placeholder="One line for your guide…"
          className="w-full rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60"
        />
      </div>

      <div className="w-full max-w-md flex items-center justify-between gap-3">
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="text-[11px] font-display tracking-[0.2em] uppercase text-muted-foreground/70 hover:text-foreground transition"
          >
            Skip for now
          </button>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="ml-auto inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/30 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition"
        >
          {cta}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
