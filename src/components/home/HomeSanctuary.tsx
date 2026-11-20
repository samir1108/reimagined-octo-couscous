import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Compass,
  Moon,
  Settings2,
  Sun,
  Sunrise,
  Sunset,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDailyGates } from "@/hooks/useSpiritualDNA";
import type { EnginePlan, ConsciousnessProfile } from "@/hooks/useConsciousnessEngine";
import type { GateId } from "@/lib/consciousness/dailyGates";
import { getCurrentGateForSchedule } from "@/lib/consciousness/dailyGates";

interface HomeTheme {
  id?: string;
  title?: string;
  description?: string;
  inner_inquiry?: string;
  micro_practice?: {
    title?: string;
    description?: string;
    duration_min?: number;
  } | null;
}

interface HomeSanctuaryProps {
  orb: ReactNode;
  userName: string;
  theme: HomeTheme | null;
  themeLoading: boolean;
  themeError: boolean;
  onRetryTheme: () => void;
  onStartSession: () => void;
  onResumeSession: () => void;
  activeSession: boolean;
  journeyDay: number;
  streak: number;
  plan?: EnginePlan;
  profile?: ConsciousnessProfile;
  karmaPoints?: number;
  karmaTier?: string;
  karmaToNext?: number | null;
  lastSummary: string;
  regenerating: boolean;
  wakeTime?: string | null;
  sleepTime?: string | null;
  onEnterGate: (gate: GateId) => void;
}

const GATES = [
  { id: "morning", label: "Awakening", hint: "Arrive in the day", Icon: Sunrise },
  { id: "midday", label: "Presence", hint: "Meet the moment", Icon: Sun },
  { id: "evening", label: "Integration", hint: "Gather what the day held", Icon: Sunset },
  { id: "night", label: "Sanctuary", hint: "Let the day settle", Icon: Moon },
] as const;

const DOMAIN_NAMES: Record<string, string> = {
  body: "Body",
  health: "Body",
  mind: "Mind",
  emotion: "Emotions",
  emotions: "Emotions",
  relationships: "Relationships",
  work: "Work",
  spirituality: "Inner life",
  purpose: "Purpose",
  creativity: "Creativity",
  community: "Community",
};

function getGreeting(hour: number) {
  if (hour < 5) return "A quieter hour";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "A quieter hour";
}

function cleanText(value: unknown): string {
  if (typeof value !== "string") return "";
  const text = value.trim();
  return /^(undefined|null|n\/?a|none|nan)$/i.test(text) ? "" : text;
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-5">
      <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-primary/65">{eyebrow}</p>
      <h2 className="mt-1.5 font-display text-xl font-light tracking-wide text-foreground sm:text-2xl">{title}</h2>
    </div>
  );
}

export default function HomeSanctuary({
  orb,
  userName,
  theme,
  themeLoading,
  themeError,
  onRetryTheme,
  onStartSession,
  onResumeSession,
  activeSession,
  journeyDay,
  streak,
  plan,
  profile,
  karmaPoints,
  karmaTier,
  karmaToNext,
  lastSummary,
  regenerating,
  wakeTime,
  sleepTime,
  onEnterGate,
}: HomeSanctuaryProps) {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { data: gateRecord } = useDailyGates();
  const [now, setNow] = useState(() => new Date());
  const gate = getCurrentGateForSchedule(now, wakeTime, sleepTime);
  const firstName = cleanText(userName).split(/\s+/)[0];
  const inquiry = cleanText(theme?.inner_inquiry);
  const practiceTitle = cleanText(theme?.micro_practice?.title);
  const atmosphereGlow = gate === "night"
    ? "hsl(var(--muted-foreground) /,.12)"
    : gate === "evening"
      ? "hsl(var(--gold-700) /,.16)"
      : gate === "midday"
        ? "hsl(var(--primary) /,.15)"
        : "hsl(var(--gold-600) /,.18)";
  const domains = Object.entries(profile?.life_domains ?? {})
    .filter((entry): entry is [string, number] => typeof entry[1] === "number" && Number.isFinite(entry[1]))
    .slice(0, 4);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const openSuggestion = (suggestion: NonNullable<EnginePlan["suggestions"]>[number]) => {
    const target = cleanText(suggestion.action.target).toLowerCase();
    if (target === "journal") {
      navigate("/app/journal");
      return;
    }
    if (target === "practice") {
      navigate("/app/practice");
      return;
    }
    const context = [
      `A moment to explore: ${cleanText(suggestion.title)}`,
      cleanText(suggestion.description),
      cleanText(suggestion.action.context),
    ].filter(Boolean).join(" | ");
    try {
      sessionStorage.setItem("journeySession:aiContext", context);
      sessionStorage.setItem("journeySession:ts", String(Date.now()));
    } catch (error) {
      console.warn("[Home] Could not preserve suggestion context for the Guide.", error);
    }
    navigate("/app/guide?journey=1");
  };

  const suggestions = (plan?.suggestions ?? [])
    .filter((item) => cleanText(item.title) && cleanText(item.action?.target))
    .slice(0, 2);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[760px]"
        style={{
          background: `radial-gradient(ellipse 58% 48% at 50% 12%, ${atmosphereGlow}, transparent 72%), radial-gradient(ellipse 42% 34% at 50% 48%, hsl(var(--primary) /,.09), transparent 75%)`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:radial-gradient(rgba(255,255,255,.9)_0.45px,transparent_0.45px)] [background-size:5px_5px]" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-6 sm:px-8 sm:pt-8 lg:px-12">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.34em] text-primary/80">ConsciousOS</p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.19em] text-muted-foreground/65">
              {new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(now)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/app/settings")}
            aria-label="Open your profile and settings"
            className="grid h-10 w-10 place-items-center rounded-full border border-primary/15 bg-card/60 text-primary/80 transition hover:border-primary/35 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <UserRound className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <section className="mx-auto mt-7 max-w-3xl text-center sm:mt-10">
          <p className="text-[9px] uppercase tracking-[0.3em] text-primary/65">{getGreeting(now.getHours())}</p>
          <h1 className="mt-2 font-display text-[27px] font-light leading-tight text-foreground sm:text-4xl">
            {firstName ? `Welcome back, ${firstName}.` : "Welcome back to yourself."}
          </h1>
          <p className="mx-auto mt-2 flex min-h-5 max-w-lg items-center justify-center text-[13px] leading-relaxed text-muted-foreground">
            {themeLoading ? (
              <span aria-hidden="true" className="h-3 w-52 rounded-full bg-muted/60 motion-safe:animate-pulse" />
            ) : (
              theme?.title ? `Today, make room for ${theme.title.toLowerCase()}.` : "A moment to meet the day as it is."
            )}
          </p>
        </section>

        <section aria-label="Begin a session" className="relative mx-auto mt-2 w-full max-w-[min(82vw,390px)] sm:mt-3">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-[8%] rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, hsl(var(--primary) /,.14), hsl(var(--gold-700) /,.08) 44%, transparent 72%)" }}
          />
          <div className="relative">{orb}</div>
          <p className="pointer-events-none -mt-2 text-center text-[9px] uppercase tracking-[0.25em] text-primary/65">
            Hold or tap to begin
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground/75">
            <span>Day {journeyDay}</span>
            {streak > 0 && <span>{streak} day{streak === 1 ? "" : "s"} in your rhythm</span>}
            {typeof karmaPoints === "number" && karmaPoints > 0 && (
              <span className="text-primary/80">{karmaPoints} karma{karmaTier ? ` · ${karmaTier}` : ""}</span>
            )}
          </div>
        </section>

        <div className="mx-auto mt-12 max-w-4xl space-y-12 sm:mt-16 sm:space-y-16">
          <section aria-labelledby="journey-title" aria-busy={themeLoading}>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.28em] text-primary/65">Your journey today</p>
                <h2 id="journey-title" className="mt-1.5 font-display text-2xl font-light text-foreground sm:text-3xl">
                  {themeLoading ? (
                    <span aria-hidden="true" className="mt-2 block h-7 w-64 max-w-full rounded-md bg-muted/60 motion-safe:animate-pulse sm:h-9" />
                  ) : theme?.title || "A path begins with presence"}
                </h2>
              </div>
              <span className="hidden pb-1 text-[10px] text-muted-foreground/60 sm:block">A small step, at your pace</span>
            </div>
            <div className="grid gap-5 rounded-2xl border border-primary/10 bg-card/60/75 p-5 sm:grid-cols-[1fr_auto] sm:items-end sm:p-7">
              <div>
                {themeError ? (
                  <div className="space-y-3">
                    <p className="text-sm leading-relaxed text-muted-foreground">Today’s journey could not be loaded. Your progress is safe.</p>
                    <button type="button" onClick={onRetryTheme} className="text-xs text-primary underline decoration-primary/30 underline-offset-4">Try again</button>
                  </div>
                ) : themeLoading ? (
                  <div aria-hidden="true" className="space-y-2 py-1">
                    <span className="block h-3 w-full max-w-2xl rounded-full bg-white/[0.06] motion-safe:animate-pulse" />
                    <span className="block h-3 w-4/5 max-w-xl rounded-full bg-white/[0.06] motion-safe:animate-pulse" />
                  </div>
                ) : (
                  <p className="max-w-2xl text-sm leading-7 text-foreground/70">
                    {cleanText(theme?.description) || "When your day’s direction is ready, it will meet you here. There is no need to rush."}
                  </p>
                )}
                {themeLoading && <span role="status" className="sr-only">Loading today’s journey</span>}
                {practiceTitle && (
                  <p className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5 text-primary/75" aria-hidden="true" />
                    {practiceTitle}
                    {theme?.micro_practice?.duration_min ? ` · ${theme.micro_practice.duration_min} min` : ""}
                  </p>
                )}
              </div>
              <button
                type="button"
                disabled={regenerating}
                onClick={activeSession ? onResumeSession : onStartSession}
                className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full border border-primary/30 bg-primary/[0.08] px-5 text-xs text-accent transition hover:bg-primary/[0.14] disabled:cursor-wait disabled:opacity-60 sm:self-auto"
              >
                {activeSession ? "Return to session" : "Continue your journey"}
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </section>

          <section aria-labelledby="gates-title">
            <SectionHeading eyebrow="A gentle rhythm, never a checklist" title="Four moments in the day" />
            <div className="relative grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-0">
              <div aria-hidden="true" className="absolute left-[12%] right-[12%] top-5 hidden h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent md:block" />
              {GATES.map(({ id, label, hint, Icon }) => {
                const isCurrent = gate === id;
                const isComplete = gateRecord?.[`${id}_done`] === true;
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => onEnterGate(id)}
                    className={`group relative rounded-xl px-3 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:px-4 ${isCurrent ? "bg-card/70" : "hover:bg-card/45"}`}
                    aria-label={`Enter ${label} gate`}
                  >
                    <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-card/60 text-primary/85">
                      {isComplete ? <Check className="h-4 w-4" aria-hidden="true" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
                    </div>
                    <p className={`mt-3 text-[9px] font-medium uppercase tracking-[0.18em] ${isCurrent ? "text-accent" : "text-foreground/75"}`}>
                      {label}
                    </p>
                    <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground/65">{hint}</p>
                    <p className="mt-2 text-[9px] text-primary/55">
                      {isComplete ? "Completed" : isCurrent ? "Now" : "Whenever it fits"}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {suggestions.length > 0 && (
            <section aria-labelledby="moments-title">
              <div className="mb-5 flex items-end justify-between gap-4">
                <SectionHeading eyebrow="From your journey" title="A moment to explore" />
                <span className="mb-5 hidden text-[10px] text-muted-foreground/55 sm:block">Choose what feels useful</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={`${suggestion.title}-${index}`}
                    type="button"
                    initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: reducedMotion ? 0 : index * 0.08 }}
                    onClick={() => openSuggestion(suggestion)}
                    className="group rounded-xl border border-border/50 bg-card/60/55 p-5 text-left transition hover:border-primary/20 hover:bg-card/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span className="text-[9px] uppercase tracking-[0.21em] text-primary/60">A thread to follow</span>
                    <span className="mt-2 flex items-center justify-between gap-3 font-display text-lg font-light text-foreground">
                      {suggestion.title}
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-primary/50 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                    {cleanText(suggestion.description) && <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">{suggestion.description}</span>}
                  </motion.button>
                ))}
              </div>
            </section>
          )}

          {inquiry && (
            <section aria-label="Question from today's journey" className="relative overflow-hidden border-y border-primary/10 py-7 sm:py-9">
              <BookOpen className="mb-3 h-4 w-4 text-primary/65" aria-hidden="true" />
              <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground/65">A question from today’s journey</p>
              <p className="mt-3 max-w-3xl font-display text-2xl font-light leading-snug text-foreground sm:text-3xl">“{inquiry}”</p>
              <p className="mt-3 text-[10px] text-muted-foreground/60">Drawn from your current journey · not a quotation</p>
            </section>
          )}

          {(lastSummary || domains.length > 0 || (typeof karmaPoints === "number" && karmaPoints > 0)) && (
            <section aria-label="Your journey reflections and life domains" className="grid gap-8 md:grid-cols-[1fr_0.8fr]">
              <div>
                <SectionHeading eyebrow="What you have noticed" title="A thread in your journey" />
                {lastSummary ? (
                  <div className="border-l border-primary/30 pl-4">
                    <p className="text-sm leading-7 text-foreground/70">{lastSummary}</p>
                    <p className="mt-3 text-[9px] uppercase tracking-[0.18em] text-muted-foreground/55">From a recent completed session</p>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-muted-foreground">As you spend time with your journey, meaningful notes from completed sessions can find their way here.</p>
                )}
              </div>

              {domains.length > 0 && (
                <div>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.25em] text-primary/65">Your life</p>
                      <h3 className="mt-1 font-display text-xl font-light text-foreground">Awareness, lived</h3>
                    </div>
                    <button type="button" onClick={() => navigate("/app/analytics?tab=domains")} className="text-[10px] text-primary/75 hover:text-accent">
                      Explore <ArrowUpRight className="ml-1 inline h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                  <ul className="space-y-3">
                    {domains.map(([name, value]) => (
                      <li key={name} className="flex items-center justify-between gap-4 border-b border-border/40 pb-2 text-xs">
                        <span className="text-foreground/70">{DOMAIN_NAMES[name] || name.replace(/[_-]/g, " ")}</span>
                        <span className="tabular-nums text-primary/75">{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border/50 pt-5">
            <p className="text-[10px] leading-relaxed text-muted-foreground/55">A companion for the life you are already living.</p>
            <div className="flex items-center gap-4">
              {typeof karmaPoints === "number" && karmaPoints > 0 && (
                <button type="button" onClick={() => navigate("/app/analytics")} className="text-[10px] text-primary/70 hover:text-accent">
                  Karma {karmaPoints}{karmaToNext ? ` · ${karmaToNext} to next` : ""}
                </button>
              )}
              <button type="button" onClick={() => navigate("/app/practice")} className="text-[10px] text-muted-foreground/65 transition hover:text-foreground">
                <Compass className="mr-1 inline h-3 w-3" aria-hidden="true" /> Explore
              </button>
              <button type="button" onClick={() => navigate("/app/settings")} aria-label="Settings" className="text-muted-foreground/55 transition hover:text-foreground">
                <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
