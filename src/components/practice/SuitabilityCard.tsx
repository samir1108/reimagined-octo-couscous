/**
 * SuitabilityCard — the 4-question safety gate.
 * Answers are today-scoped. The verdict changes what the app is allowed to
 * offer: rest instead of meditation, no breath retention, no closed eyes.
 */

import { useState } from "react";
import { ChevronDown, ShieldCheck, ShieldAlert } from "lucide-react";
import type { SuitabilityDecision, SuitabilityInput } from "@/lib/prescription";
import { suitabilitySummary } from "@/lib/prescription";

interface SuitabilityCardProps {
  value: SuitabilityInput;
  decision: SuitabilityDecision;
  onChange: (value: SuitabilityInput) => void;
  defaultOpen?: boolean;
}

export default function SuitabilityCard({ value, decision, onChange, defaultOpen = false }: SuitabilityCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const clear = decision.verdict === "clear";

  const patch = (next: Partial<SuitabilityInput>) => onChange({ ...value, ...next });

  return (
    <section className="rounded-2xl border border-border/40 bg-card/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2">
          {clear ? (
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          ) : (
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          )}
          <span className="text-sm font-medium">{suitabilitySummary(decision)}</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-3 border-t border-border/40 px-4 py-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-muted-foreground">
              Sleep hours
              <input
                type="number"
                min={0}
                max={12}
                step={0.5}
                value={value.sleepHours ?? 7}
                onChange={(e) => patch({ sleepHours: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-border/50 bg-background px-2 py-1.5 text-sm text-foreground"
              />
            </label>
            <label className="text-xs text-muted-foreground">
              Sleep quality
              <select
                value={value.sleepQuality ?? 3}
                onChange={(e) => patch({ sleepQuality: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })}
                className="mt-1 w-full rounded-lg border border-border/50 bg-background px-2 py-1.5 text-sm text-foreground"
              >
                <option value={1}>1 · very poor</option>
                <option value={2}>2 · poor</option>
                <option value={3}>3 · okay</option>
                <option value={4}>4 · good</option>
                <option value={5}>5 · deep</option>
              </select>
            </label>
          </div>

          <label className="block text-xs text-muted-foreground">
            Pain today: {value.painLevel ?? 0}/10
            <input
              type="range"
              min={0}
              max={10}
              value={value.painLevel ?? 0}
              onChange={(e) => patch({ painLevel: Number(e.target.value) })}
              className="mt-1 w-full"
            />
          </label>

          <label className="block text-xs text-muted-foreground">
            Emotional intensity: {value.emotionalIntensity ?? 3}/10
            <input
              type="range"
              min={0}
              max={10}
              value={value.emotionalIntensity ?? 3}
              onChange={(e) => patch({ emotionalIntensity: Number(e.target.value) })}
              className="mt-1 w-full"
            />
          </label>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {([
              ["panic", "Panic now"],
              ["dissociation", "Dissociation"],
              ["pregnancy", "Pregnancy"],
              ["recentSurgery", "Recent surgery"],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 rounded-lg bg-muted/30 px-2 py-1.5">
                <input
                  type="checkbox"
                  checked={Boolean(value[key])}
                  onChange={(e) => patch({ [key]: e.target.checked } as Partial<SuitabilityInput>)}
                />
                {label}
              </label>
            ))}
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Energy signs (optional)
            </p>
            <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
              {([
                ["kriya-movements", "Kriyas / tremors"],
                ["breath-suspension", "Breath suspension"],
                ["ego-dissolution", "Ego dissolution"],
                ["reality-contact-loss", "Reality feels thin"],
              ] as const).map(([id, label]) => {
                const current = value.energySignals ?? [];
                return (
                  <label key={id} className="flex items-center gap-2 rounded-lg bg-muted/30 px-2 py-1.5">
                    <input
                      type="checkbox"
                      checked={current.includes(id)}
                      onChange={(e) =>
                        patch({
                          energySignals: e.target.checked
                            ? [...current, id]
                            : current.filter((item) => item !== id),
                        })
                      }
                    />
                    {label}
                  </label>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            {decision.recommendedProtocol}
          </p>
        </div>
      )}
    </section>
  );
}
