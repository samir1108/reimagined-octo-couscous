import { ArrowRight, Briefcase, Moon, Sunrise, Utensils } from "lucide-react";
import { Button, Card, CardContent, Eyebrow, Heading, Body } from "@/design-system/primitives";

export interface DailyRhythmAnswers {
  wake_time: string;
  sleep_time: string;
  work_start?: string;
  lunch_time?: string;
  work_end?: string;
}

interface DailyRhythmOnboardingProps {
  name: string;
  value: DailyRhythmAnswers;
  onChange: (value: DailyRhythmAnswers) => void;
  onContinue: () => void;
  saving?: boolean;
}

const fields = [
  { key: "wake_time", label: "Wake up", hint: "When your day usually begins", Icon: Sunrise, required: true },
  { key: "work_start", label: "Work or study", hint: "Optional · when you usually begin", Icon: Briefcase, required: false },
  { key: "lunch_time", label: "Midday pause", hint: "Optional · a natural moment to reset", Icon: Utensils, required: false },
  { key: "work_end", label: "Work winds down", hint: "Optional · mark the transition out", Icon: ArrowRight, required: false },
  { key: "sleep_time", label: "Sleep", hint: "When you usually wind down", Icon: Moon, required: true },
] as const;

export default function DailyRhythmOnboarding({
  name,
  value,
  onChange,
  onContinue,
  saving = false,
}: DailyRhythmOnboardingProps) {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-background px-5 py-10 text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 12%, hsl(var(--primary) / 0.16), transparent 58%)" }}
      />
      <Card className="relative z-10 w-full max-w-xl border-border/50 bg-card/75 shadow-2xl backdrop-blur-xl">
        <CardContent className="space-y-7 p-6 sm:p-9">
          <header className="text-center">
            <Eyebrow className="text-primary/80">Make this yours</Eyebrow>
            <Heading level="h1" className="mt-3">
              A rhythm that fits your day{name.trim() ? `, ${name.trim().split(/\s+/)[0]}` : ""}
            </Heading>
            <Body className="mx-auto mt-3 max-w-md text-muted-foreground">
              Your home moments, reminders, and suggested practices will follow your real routine.
              Set the essentials now; the rest can stay flexible.
            </Body>
          </header>

          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map(({ key, label, hint, Icon, required }) => (
              <label key={key} className="block rounded-2xl border border-border/50 bg-background/45 p-4">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                  {label}
                  {required ? <span className="text-primary" aria-hidden="true">*</span> : null}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
                <input
                  type="time"
                  value={value[key] ?? ""}
                  required={required}
                  onChange={(event) => onChange({ ...value, [key]: event.target.value })}
                  aria-label={label}
                  className="mt-3 min-h-11 w-full rounded-xl border border-border/60 bg-card px-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3">
            <Button
              type="button"
              size="lg"
              variant="sacred"
              disabled={!value.wake_time || !value.sleep_time || saving}
              onClick={onContinue}
              className="w-full sm:w-auto"
            >
              {saving ? "Saving your rhythm…" : "Continue to your guide"}
              <ArrowRight aria-hidden="true" />
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              You can change these times anytime in Settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
