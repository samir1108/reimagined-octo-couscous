import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Moon, Sparkles, Sun, Sunrise, Sunset } from "lucide-react";
import {
  DAY_KINDS,
  DAY_KIND_LABELS,
  DEFAULT_ENABLED_KINDS,
  defaultDayPlanConfig,
  formatBlockTime,
  type ActivityKind,
  type DayDensity,
} from "@/lib/dayPlan";
import { saveDayPlanConfig } from "@/lib/dayPlanStore";

interface DayPlanOnboardingProps {
  userId: string;
  onComplete: () => void;
  onSkip?: () => void;
}

const DENSITIES: Array<{ value: DayDensity; label: string; hint: string }> = [
  { value: "minimal", label: "Light", hint: "Two things per window" },
  { value: "standard", label: "Balanced", hint: "Four things per window" },
  { value: "full", label: "Full", hint: "Everything the app offers" },
];

const BLOCK_ICONS = [Sunrise, Sun, Sunset, Moon];

export default function DayPlanOnboarding({ userId, onComplete, onSkip }: DayPlanOnboardingProps) {
  const [density, setDensity] = useState<DayDensity>("standard");
  const [kinds, setKinds] = useState<ActivityKind[]>([...DEFAULT_ENABLED_KINDS]);
  const [saving, setSaving] = useState(false);

  const blocks = useMemo(() => defaultDayPlanConfig().blocks, []);

  const toggleKind = (kind: ActivityKind) => {
    setKinds((previous) =>
      previous.includes(kind) ? previous.filter((value) => value !== kind) : [...previous, kind],
    );
  };

  const finish = async () => {
    setSaving(true);
    try {
      await saveDayPlanConfig(userId, {
        ...defaultDayPlanConfig(),
        density,
        enabledKinds: kinds.length ? kinds : [...DEFAULT_ENABLED_KINDS],
      });
    } catch (error) {
      console.warn("Day plan onboarding save failed", error);
    } finally {
      setSaving(false);
      onComplete();
    }
  };

  return (
    <div className="min-h-[100dvh] w-full relative overflow-hidden bg-background ambient-bg flex flex-col">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 18%, hsl(var(--primary) / 0.16), transparent 65%)" }}
      />

      <div className="relative z-10 flex-1 flex items-center justify-center px-5 py-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-5">
            <p className="text-[10px] font-display tracking-[0.3em] text-primary/80 uppercase mb-2">
              Your rhythm
            </p>
            <h2 className="font-display text-xl text-foreground leading-snug mb-1.5">How should your day flow?</h2>
            <p className="text-xs text-muted-foreground leading-relaxed px-3">
              Home will show one timetable built from these windows. You can reshape every block later in
              Settings.
            </p>
          </div>

          <div className="rounded-3xl border border-border/40 bg-card/55 backdrop-blur-xl shadow-2xl p-4 space-y-4">
            <div className="space-y-1.5">
              {blocks.map((block, index) => {
                const Icon = BLOCK_ICONS[index % BLOCK_ICONS.length] ?? Sunrise;
                return (
                  <div
                    key={block.id}
                    className="flex items-center gap-2.5 rounded-xl border border-border/25 bg-background/30 px-3 py-2"
                  >
                    <Icon className="h-3.5 w-3.5 text-primary/70" />
                    <span className="flex-1 text-[11px] font-display text-foreground/85">{block.label}</span>
                    <span className="text-[9px] text-muted-foreground/50 tabular-nums">
                      {formatBlockTime(block.start)} – {formatBlockTime(block.end)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Density</span>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {DENSITIES.map((option) => {
                  const active = density === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDensity(option.value)}
                      aria-pressed={active}
                      className={`rounded-xl border px-2 py-2 text-center transition-colors ${
                        active
                          ? "border-primary/50 bg-primary/15 text-primary"
                          : "border-border/30 bg-background/40 text-muted-foreground/60 hover:border-border/60"
                      }`}
                    >
                      <span className="block text-[11px] font-display">{option.label}</span>
                      <span className="block text-[9px] opacity-70">{option.hint}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Include</span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {DAY_KINDS.map((kind) => {
                  const active = kinds.includes(kind);
                  return (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => toggleKind(kind)}
                      aria-pressed={active}
                      className={`rounded-full border px-2.5 py-1.5 text-[10px] transition-colors ${
                        active
                          ? "border-primary/50 bg-primary/15 text-primary"
                          : "border-border/30 bg-background/40 text-muted-foreground/60 hover:border-border/60"
                      }`}
                    >
                      {active ? "✓ " : ""}
                      {DAY_KIND_LABELS[kind]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => void finish()}
              disabled={saving}
              className="px-7 py-3 rounded-full bg-primary text-primary-foreground font-display tracking-wide flex items-center gap-2 disabled:opacity-30 hover:bg-primary/90 transition"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {saving ? "Saving…" : "Use this rhythm"}
            </motion.button>
            <button
              type="button"
              onClick={onSkip ?? onComplete}
              className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/70 hover:text-foreground transition"
            >
              <Sparkles className="h-3 w-3" />
              Skip — I'll shape it later in Settings
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
