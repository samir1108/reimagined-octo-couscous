import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Pause,
  Play,
  SkipForward,
  SlidersHorizontal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HomeOrb } from "@/components/orb";
import { Progress } from "@/design-system";
import {
  ADAPTIVE_PATHS,
  FOUNDATION_CHAPTERS,
  FOUNDATION_TOTAL_DAYS,
  getFoundationDay,
  getFoundationHandoff,
  loadTuning,
  saveTuning,
  type AdaptivePath,
  type AvailableMinutes,
  type FoundationComponent,
  type FoundationPace,
  type FoundationTone,
} from "@/lib/foundation";
import type { VLevel } from "@/types/consciousness";

const MINUTES: AvailableMinutes[] = [3, 10, 20, 40];
const PACES: FoundationPace[] = ["gentle", "steady", "deep"];
const TONES: FoundationTone[] = ["plain", "warm", "philosophical"];
const PATH_IDS: AdaptivePath[] = ["observer", "inquirer", "integrator", "devotional"];
const DAY_KEY = "satyug-foundation-day";

function gateForHour(hour: number): "morning" | "midday" | "evening" | "night" {
  if (hour < 5) return "night";
  if (hour < 12) return "morning";
  if (hour < 17) return "midday";
  if (hour < 21) return "evening";
  return "night";
}

function moodForDepth(depth: number): "calm" | "focus" | "fire" {
  if (depth >= 3) return "fire";
  if (depth >= 2) return "focus";
  return "calm";
}

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function FoundationPath() {
  const navigate = useNavigate();
  const [day, setDay] = useState(() => {
    try {
      const raw = Number(localStorage.getItem(DAY_KEY));
      return Number.isFinite(raw) && raw >= 1 ? Math.min(FOUNDATION_TOTAL_DAYS, raw) : 1;
    } catch {
      return 1;
    }
  });
  const [band, setBand] = useState(2);
  const [energy, setEnergy] = useState<"low" | "medium" | "high">("medium");
  const [tuning, setTuning] = useState(() => loadTuning());
  const [tuningOpen, setTuningOpen] = useState(false);

  const [phase, setPhase] = useState<"idle" | "running" | "paused" | "done">("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);

  const vLevel = useMemo<Pick<VLevel, "value" | "band" | "microLevel" | "witnessQuality">>(
    () => ({
      value: band + 0.2,
      band: band as VLevel["band"],
      microLevel: "entering",
      witnessQuality: 0.7,
    }),
    [band]
  );

  const plan = useMemo(
    () =>
      getFoundationDay({
        day,
        vLevel,
        minutesAvailable: tuning.minutes,
        energy,
        tuning,
      }),
    [day, vLevel, energy, tuning]
  );

  const steps = useMemo(
    () => plan.components.filter((c) => c.minutes > 0),
    [plan]
  );
  const mission = useMemo(
    () => plan.components.find((c) => c.kind === "mission"),
    [plan]
  );

  const handoff = useMemo(() => getFoundationHandoff(day, plan.path), [day, plan.path]);
  const gate = gateForHour(new Date().getHours());

  const totalSeconds = useMemo(
    () => steps.reduce((sum, s) => sum + s.minutes * 60, 0),
    [steps]
  );
  const activeStep: FoundationComponent | undefined = steps[stepIndex];

  const persistDay = useCallback((next: number) => {
    setDay(next);
    setPhase("idle");
    setStepIndex(0);
    setRemaining(0);
    try {
      localStorage.setItem(DAY_KEY, String(next));
    } catch {
      /* storage optional */
    }
  }, []);

  const update = <K extends keyof typeof tuning>(key: K, value: (typeof tuning)[K]) => {
    const next = { ...tuning, [key]: value };
    setTuning(next);
    saveTuning(next);
    setPhase("idle");
    setStepIndex(0);
  };

  const begin = useCallback(() => {
    if (!steps.length) return;
    setPhase("running");
    setStepIndex(0);
    setRemaining(steps[0].minutes * 60);
  }, [steps]);

  const nextStep = useCallback(() => {
    if (stepIndex >= steps.length - 1) {
      setPhase("done");
      setRemaining(0);
      return;
    }
    const next = stepIndex + 1;
    setStepIndex(next);
    setRemaining(steps[next].minutes * 60);
    setPhase("running");
  }, [stepIndex, steps]);

  useEffect(() => {
    if (phase !== "running") return;
    const id = window.setInterval(() => {
      setRemaining((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, stepIndex]);

  useEffect(() => {
    setPhase("idle");
    setStepIndex(0);
    setRemaining(0);
  }, [plan.minutes, plan.depth, plan.path]);

  const completedSeconds = useMemo(() => {
    let sum = 0;
    for (let i = 0; i < stepIndex; i += 1) sum += steps[i].minutes * 60;
    return sum;
  }, [stepIndex, steps]);

  const elapsed = activeStep ? activeStep.minutes * 60 - remaining : 0;
  const progress =
    phase === "done"
      ? 100
      : totalSeconds > 0
        ? Math.round(((completedSeconds + elapsed) / totalSeconds) * 100)
        : 0;

  const primaryLabel =
    phase === "idle"
      ? `Begin · ${steps[0]?.minutes ?? plan.minutes} min`
      : phase === "done"
        ? "Day complete"
        : remaining === 0
          ? "Continue"
          : "Pause";

  const primaryAction = () => {
    if (phase === "idle") {
      begin();
      return;
    }
    if (phase === "done") {
      persistDay(Math.min(FOUNDATION_TOTAL_DAYS, day + 1));
      return;
    }
    if (remaining === 0) {
      nextStep();
      return;
    }
    setPhase((p) => (p === "running" ? "paused" : "running"));
  };

  return (
    <div className="min-h-[100dvh] bg-background px-4 pb-28 pt-5 text-foreground">
      <div className="mx-auto max-w-xl">
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/app")}
            aria-label="Back to Today"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/30"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Foundation · Chapter {plan.chapter} · Day {day} / {FOUNDATION_TOTAL_DAYS}
            </p>
            <h1 className="truncate font-display text-lg font-bold leading-tight">{plan.theme}</h1>
          </div>
        </div>

        <Progress value={Math.round(((day - 1) / (FOUNDATION_TOTAL_DAYS - 1)) * 100)} className="h-1" />

        <div className="relative mx-auto mt-6 w-full max-w-[300px]">
          <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full -rotate-90" aria-hidden>
            <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.8" />
            <circle
              cx="50"
              cy="50"
              r="47"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 47}
              strokeDashoffset={2 * Math.PI * 47 * (1 - progress / 100)}
              className="text-primary"
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>
          <HomeOrb
            size={280}
            gate={gate}
            mood={moodForDepth(plan.depth)}
            interactive
            onActivate={primaryAction}
            onHold={() => setTuningOpen((v) => !v)}
            onTriple={() => setPhase("idle")}
            className="mx-auto"
          />
        </div>

        <div className="mt-5 text-center">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {phase === "idle"
              ? `${plan.depth === 0 ? "Name it" : plan.depth === 1 ? "Describe it" : plan.depth === 2 ? "Observe the observer" : "Inquire into it"} · ${plan.minutes} min`
              : phase === "done"
                ? "Complete"
                : activeStep?.title}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-foreground/90">
            {phase === "idle"
              ? plan.components.find((c) => c.kind === "wisdom")?.prompt
              : phase === "done"
                ? "You showed up. The day is complete — close it with one line in the journal."
                : activeStep?.prompt}
          </p>
          {phase !== "idle" && phase !== "done" && (
            <p className="mt-2 font-display text-2xl tabular-nums text-foreground">
              {formatClock(remaining)}
            </p>
          )}
        </div>

        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            onClick={primaryAction}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            {phase === "done" ? (
              <Check className="h-4 w-4" />
            ) : phase === "paused" ? (
              <Play className="h-4 w-4" />
            ) : phase === "running" && remaining > 0 ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {primaryLabel}
          </button>
          {phase !== "idle" && phase !== "done" && (
            <button
              onClick={nextStep}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-muted/40 px-4 py-3 text-sm text-foreground/80"
            >
              <SkipForward className="h-4 w-4" /> Next
            </button>
          )}
          <button
            onClick={() => setTuningOpen((v) => !v)}
            aria-label="Tune today"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-muted/40"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        {phase === "idle" && (
          <ol className="mt-6 space-y-2">
            {plan.components
              .filter((c) => c.kind !== "mission")
              .map((component) => (
                <li key={component.kind + component.title} className="flex gap-3 rounded-xl bg-muted/20 px-3 py-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                    {component.minutes > 0 ? component.minutes : "·"}
                  </span>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{component.kind}</p>
                    <p className="text-xs leading-snug text-foreground/85">{component.prompt}</p>
                  </div>
                </li>
              ))}
          </ol>
        )}

        {mission && (
          <p className="mt-4 rounded-xl bg-primary/5 px-3 py-2 text-xs text-foreground/80">
            Outside the app · {mission.prompt}
          </p>
        )}

        <button
          onClick={() => setTuningOpen((v) => !v)}
          className="mt-5 flex w-full items-center justify-between rounded-2xl bg-muted/20 px-4 py-3 text-sm"
        >
          <span className="font-medium">Tune today</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${tuningOpen ? "rotate-180" : ""}`} />
        </button>

        {tuningOpen && (
          <section className="glass-card mt-3 rounded-2xl p-4">
            <div className="space-y-4">
              <div>
                <p className="mb-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">Time</p>
                <div className="flex gap-2">
                  {MINUTES.map((m) => (
                    <button
                      key={m}
                      onClick={() => update("minutes", m)}
                      className={`rounded-xl px-3 py-1.5 text-xs ${
                        tuning.minutes === m ? "bg-primary text-primary-foreground" : "bg-muted/40"
                      }`}
                    >
                      {m} min
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">Pace</p>
                <div className="flex gap-2">
                  {PACES.map((p) => (
                    <button
                      key={p}
                      onClick={() => update("pace", p)}
                      className={`rounded-xl px-3 py-1.5 text-xs capitalize ${
                        tuning.pace === p ? "bg-primary text-primary-foreground" : "bg-muted/40"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">Tone</p>
                <div className="flex flex-wrap gap-2">
                  {TONES.map((t) => (
                    <button
                      key={t}
                      onClick={() => update("tone", t)}
                      className={`rounded-xl px-3 py-1.5 text-xs capitalize ${
                        tuning.tone === t ? "bg-primary text-primary-foreground" : "bg-muted/40"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">Path</p>
                <div className="flex flex-wrap gap-2">
                  {PATH_IDS.map((id) => (
                    <button
                      key={id}
                      onClick={() => update("path", tuning.path === id ? undefined : id)}
                      className={`rounded-xl px-3 py-1.5 text-xs ${
                        (tuning.path ?? plan.path) === id ? "bg-primary text-primary-foreground" : "bg-muted/40"
                      }`}
                    >
                      {ADAPTIVE_PATHS[id].label.replace(" Path", "")}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center justify-between text-xs">
                <span>Include self-inquiry</span>
                <input
                  type="checkbox"
                  checked={tuning.inquiry}
                  onChange={(e) => update("inquiry", e.target.checked)}
                  className="h-4 w-4 accent-[hsl(var(--primary))]"
                />
              </label>

              <div>
                <p className="mb-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">Energy</p>
                <div className="flex gap-2">
                  {(["low", "medium", "high"] as const).map((e) => (
                    <button
                      key={e}
                      onClick={() => setEnergy(e)}
                      className={`rounded-xl px-3 py-1.5 text-xs capitalize ${
                        energy === e ? "bg-primary text-primary-foreground" : "bg-muted/40"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                  Day · {day}
                </p>
                <input
                  type="range"
                  min={1}
                  max={FOUNDATION_TOTAL_DAYS}
                  value={day}
                  onChange={(e) => persistDay(Number(e.target.value))}
                  aria-label="Choose foundation day"
                  className="w-full accent-[hsl(var(--primary))]"
                />
              </div>

              <div>
                <p className="mb-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                  V-Level band · {band}
                </p>
                <input
                  type="range"
                  min={0}
                  max={8}
                  value={band}
                  onChange={(e) => setBand(Number(e.target.value))}
                  aria-label="Choose V-Level band"
                  className="w-full accent-[hsl(var(--primary))]"
                />
              </div>
            </div>
          </section>
        )}

        <section className="mt-4 rounded-2xl bg-muted/20 px-4 py-3">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {FOUNDATION_CHAPTERS[plan.chapter - 1]?.outcome}. Same chapter outcome at every depth —
            only the register changes.
          </p>
          {handoff.complete && (
            <div className="mt-2">
              <p className="text-xs font-semibold">{handoff.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{handoff.why}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
