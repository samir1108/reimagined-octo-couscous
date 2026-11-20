/**
 * ARCHIVED — DailyRoutineIntake (English version)
 * Removed from active app on user request. Kept here for future reuse.
 *
 * Cinematic full-screen sheet that asks the user about their day timetable
 * (wake, morning, midday, evening, night, sleep) so AI context is rich
 * before the first cinematic practice session.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Sunrise, Coffee, Sunset, Moon, Bed, Sparkles } from "lucide-react";
import { useSaveDailyRoutine, type DailyRoutine } from "@/hooks/useDailyRoutine";

interface Field {
  key: keyof DailyRoutine;
  label: string;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
  type?: "time" | "text";
}

const FIELDS: Field[] = [
  { key: "wake_time", label: "When do you wake up?", placeholder: "06:30", icon: Sunrise, type: "time" },
  { key: "morning_activities", label: "What does your morning look like?", placeholder: "tea, walk, work prep…", icon: Coffee },
  { key: "midday_activities", label: "Midday / your day?", placeholder: "office, classes, lunch…", icon: Sun },
  { key: "evening_activities", label: "Evenings?", placeholder: "family, gym, commute…", icon: Sunset },
  { key: "night_activities", label: "Nights?", placeholder: "dinner, screen, reading…", icon: Moon },
  { key: "sleep_time", label: "When do you sleep?", placeholder: "23:00", icon: Bed, type: "time" },
];

export default function DailyRoutineIntake({ onDone, onSkip }: { onDone: () => void; onSkip?: () => void }) {
  const save = useSaveDailyRoutine();
  const [routine, setRoutine] = useState<DailyRoutine>({});
  const [notes, setNotes] = useState("");

  const submit = async () => {
    try {
      await save.mutateAsync({ ...routine, notes: notes || null });
    } catch { /* silent — still proceed so practice isn't blocked */ }
    onDone();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[125] bg-background overflow-y-auto"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="max-w-lg mx-auto px-5 py-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-full bg-primary/15 items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <p className="text-[10px] font-display tracking-[0.32em] uppercase text-primary/80">One-time setup</p>
          <h2 className="font-display text-2xl text-foreground">Tell us about your day</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Knowing your daily rhythm lets every master weave practice into your real life.
          </p>
        </div>

        <div className="space-y-3">
          {FIELDS.map(({ key, label, placeholder, icon: Icon, type }) => (
            <div key={key} className="rounded-2xl border border-border/40 bg-card/50 p-3">
              <label className="flex items-center gap-2 text-[11px] font-display tracking-[0.2em] uppercase text-muted-foreground mb-2">
                <Icon className="h-3.5 w-3.5 text-primary/80" />
                {label}
              </label>
              <input
                type={type === "time" ? "time" : "text"}
                value={(routine[key] as string) ?? ""}
                onChange={(e) => setRoutine((r) => ({ ...r, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full bg-transparent border-0 outline-none text-foreground font-display text-sm placeholder:text-muted-foreground/60"
              />
            </div>
          ))}

          <div className="rounded-2xl border border-border/40 bg-card/50 p-3">
            <label className="flex items-center gap-2 text-[11px] font-display tracking-[0.2em] uppercase text-muted-foreground mb-2">
              <Sparkles className="h-3.5 w-3.5 text-primary/80" />
              Anything else the masters should know?
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="weekend pattern, stress points, family, sleep struggles…"
              rows={3}
              className="w-full bg-transparent border-0 outline-none text-foreground font-display text-sm placeholder:text-muted-foreground/60 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          {onSkip && (
            <button
              onClick={onSkip}
              className="flex-1 py-3 rounded-full border border-border/50 text-sm font-display text-muted-foreground hover:text-foreground transition-colors"
            >
              Not now
            </button>
          )}
          <button
            onClick={submit}
            disabled={save.isPending}
            className="flex-1 py-3 rounded-full bg-primary text-primary-foreground text-sm font-display tracking-[0.15em] uppercase hover:bg-primary/90 disabled:opacity-50 transition"
          >
            {save.isPending ? "Saving…" : "Begin Practice"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
