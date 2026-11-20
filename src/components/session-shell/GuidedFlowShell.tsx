// Guided Flow Shell — runs a SessionPlan inside a chat-like surface.
// Each step appears as a "Step Card" (title · why · ~min · Begin/Swap/Skip/End)
// followed by an inline widget when Begin is tapped. When the widget completes,
// the next step card auto-appears. Wisdom/Chat steps use a simple Continue card.
//
// This is the new daily-flow container that replaces UniversalSessionShell on
// the /session/:id route. The Provider, completion API, and SessionCompleteScreen
// are reused as-is so nothing downstream breaks.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useThemeOfDay } from "@/hooks/useThemeOfDay";
import { useActiveGuruProgram } from "@/hooks/useGuruPrograms";
import { useConsciousnessEngine } from "@/hooks/useConsciousnessEngine";
import { getCurrentTimeSlot } from "@/lib/timeSlots";
import { GURUS } from "@/lib/guru-data";
import { toast } from "sonner";
import {
  ArrowRight, Clock, SkipForward, X, Sparkles,
  BookOpen, Wind, PencilLine, HandHeart, MessageCircle, Activity, Flame, Eye, Heart,
  Volume2, VolumeX, Ban, Hand, Feather, Compass, Maximize2, Minimize2,
} from "lucide-react";
import DisplayOrb from "@/components/shared/DisplayOrb";
import SessionOrbStage from "@/components/home/SessionOrbStage";
import { useImmersiveSession } from "@/hooks/useImmersiveSession";

import { Button } from "@/design-system";
import { useSound, useAudioContext } from "@/contexts/SoundContext";
import { useSessionShell, clearPersistedShell } from "@/lib/session-shell/SessionShellContext";
import { completeGenerativeSession } from "@/lib/session-shell/api";
import { SessionCompleteScreen } from "./SessionCompleteScreen";
import { SessionWeavingScreen } from "./SessionWeavingScreen";
import { SessionGuideChat } from "./SessionGuideChat";
import { SessionProgressRail } from "./SessionProgressRail";
import { AmbientLayer } from "./AmbientLayer";
import { renderWidget } from "@/components/guide/widgets";
import { StepWidget } from "./widgets/StepWidget";
import { resolveStepWidget, type ResolvedStepWidget } from "@/lib/session-shell/stepWidgets";
import { CouncilHeader } from "./CouncilHeader";
import { AgendaDissectionPanel } from "./AgendaDissectionPanel";
import { SessionFrameCard } from "./SessionFrameCard";
import { CinematicStage, CinematicChapterCard, CinematicFrame } from "./CinematicStage";
import { useIdleChrome } from "./cinematicTheme";
import { humanIntent, humanizeWhy, signalLabel, stepExpectation, stepFrame, archetypeMeta } from "./sessionFrame";
import {
  pickCouncil, getCouncilVerdicts, getImperativeTitle, getStepMaster,
  getStepWhy, pickKeystoneIndex, explainOrder, councilFromMeta,
} from "./stepRevolution";
import { getSessionInvocation, getSessionAngle } from "@/lib/sessionInvocation";
import { getStepThreshold, getBreathPauseLine, getStepPositionReason } from "@/lib/sessionThresholds";
import { getLadderRung, type LadderRung } from "@/lib/initiationLadder";
import { fetchUnconsumedWhisper, consumeWhisper, saveLastSittingEssence, type FutureWhisper } from "@/lib/whisperChain";
import { persistStepNote } from "@/lib/session-shell/journalPersist";
import { readRailVariant, logRailExposure } from "@/lib/session-shell/railVariant";
import { hapticTick } from "@/lib/haptics";
import type {
  WidgetSpec,
  WidgetResult,
} from "@/components/guide/widgets/types";
import type {
  SessionPlan,
  SessionStep,
  StepKind,
  SessionPlanMeta,
  SessionCompleteResult,
} from "@/lib/session-shell/types";

const STEP_ICONS: Record<StepKind, React.ComponentType<{ className?: string }>> = {
  "wisdom-read": BookOpen,
  breathwork: Wind,
  journal: PencilLine,
  "micro-act": HandHeart,
  reflection: Heart,
  "guide-chat": MessageCircle,
  practice: Activity,
  "temple-chat": Flame,
  witness: Eye,
};

// ── kind → widget mapping ────────────────────────────────────────────────────
function stepSeconds(step: SessionStep): number {
  const params = (step.params || {}) as Record<string, unknown>;
  const explicit = Number(params.durationSeconds) || Number(step.durationSeconds) || 0;
  if (explicit > 0) return explicit;
  return Math.max(60, Math.round((Number(step.est_minutes) || 1) * 60));
}

function widgetForStep(step: SessionStep): WidgetSpec | null {
  const title = step.title;
  const prompt = (step.script || []).join(" ") || step.prompt;
  const params = (step.params || {}) as Record<string, any>;
  const seconds = stepSeconds(step);
  const minutes = Math.max(1, Math.round(seconds / 60));

  switch (step.kind) {
    case "breathwork":
      return {
        kind: "breath_orb",
        title,
        prompt,
        script: step.script,
        pattern: params.pattern || "natural",
        duration: seconds,
        breaths: params.breaths,
        description: params.description || step.script?.[0] || undefined,
        why: params.why || step.whyForYou,
      };
    case "witness":
      return {
        kind: "witness_timer",
        title,
        prompt,
        script: step.script,
        duration: seconds,
        object: params.object,
        level: params.level,
      };
    case "practice": {
      const family = String(params.family || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      if (family === "self_inquiry" || family === "jnana" || family === "neti_neti") {
        return {
          kind: "self_inquiry",
          title,
          prompt,
          script: step.script,
          question: params.exercise || prompt || "Who is aware of this?",
        };
      }
      return {
        kind: "witness_timer",
        title,
        prompt,
        script: step.script,
        duration: seconds,
        object: params.exercise || params.object || family || "the practice",
        level: params.level != null ? String(params.level) : undefined,
      };
    }
    case "journal":
      return {
        kind: "journal",
        title,
        prompt,
        script: step.script,
        minChars: params.minChars ?? (minutes >= 3 ? 40 : 20),
        questions: Array.isArray(params.questions)
          ? (params.questions as unknown[]).map(String).slice(0, 3)
          : undefined,
      };
    case "reflection":
      return {
        kind: "reflection_card",
        title,
        prompt,
        script: step.script,
        summary: params.summary || step.whyForYou,
        minChars: 3,
      };
    case "micro-act":
      return {
        kind: "micro_act",
        title,
        prompt,
        script: step.script,
        act: params.act || prompt || title,
        window: params.window,
      };
    case "wisdom-read":
      return {
        kind: "reading",
        title,
        prompt,
        script: step.script,
        passage: params.passage || prompt || title,
        source: params.source,
        highlightPrompt: params.highlightPrompt,
      };
    default:
      // guide-chat / temple-chat run inside the Guide chat surface.
      return null;
  }
}

// ── Step Card ────────────────────────────────────────────────────────────────
interface StepCardProps {
  step: SessionStep;
  index: number;
  total: number;
  state: "pending" | "active" | "done" | "skipped";
  prevKind?: StepKind;
  seed?: string;
  onBegin: () => void;
  onSkip: () => void;
}

function StepCard({ step, index, state, prevKind, seed, onBegin, onSkip }: StepCardProps) {
  // Why-ME before How: the composer's receipt is the soul of the card.
  const why = step.whyForYou || getStepWhy(step, false);
  const threshold = getStepThreshold(step, index);
  const seconds = stepSeconds(step);
  const minutes = Math.max(1, Math.round(seconds / 60));
  // The card stays lean until asked: only the first lines show, the rest wait
  // behind "Read more".
  const [showDetail, setShowDetail] = useState(false);

  // Compact placeholder when step is done or skipped — keeps feed tidy.
  if (state === "done" || state === "skipped") {
    const isDone = state === "done";
    return (
      <div
        className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-xs backdrop-blur-md ${
          isDone
            ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-400/90"
            : "border-border/30 bg-background/30 text-muted-foreground"
        }`}
      >
        <span className="font-mono opacity-60">{String(index + 1).padStart(2, "0")}</span>
        <span className="flex-1 truncate">{step.title}</span>
        <span className="shrink-0 uppercase tracking-[0.14em] opacity-80">
          {isDone ? "✓ Crossed" : "Not taken"}
        </span>
      </div>
    );
  }

  const tone =
    state === "active"
      ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10"
      : "border-border/40 bg-card/60";

  const master = getStepMaster(step.kind, seed);
  const imperativeTitle = getImperativeTitle(step);
  const script = (step.script || []).slice(0, 5);
  const visibleScript = showDetail ? script : script.slice(0, 2);
  const hasMore = script.length > visibleScript.length
    || !!getStepPositionReason(prevKind, step.kind)
    || !!master?.quote;

  return (
    <div className={`rounded-2xl border ${tone} p-4 sm:p-5 backdrop-blur-md transition-all`}>
      <div className="mb-1 flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground/90">
        <span className="text-primary/90">{threshold.label}</span>
        <span className="flex items-center gap-1 tabular-nums">
          <Clock className="h-3 w-3" /> {minutes} min
        </span>
      </div>
      <p className="mb-3 text-xs italic leading-snug text-muted-foreground/90">
        {threshold.essence}
      </p>
      <div className="flex items-start gap-3">
        {master && (
          <div className="flex w-12 shrink-0 flex-col items-center gap-1">
            <div
              className="h-10 w-10 rounded-full border border-primary/30 bg-cover bg-center shadow-md"
              style={{ backgroundImage: master.image ? `url(${master.image})` : undefined }}
              title={master.name}
            />
            <span className="w-full truncate text-center text-[9px] uppercase tracking-[0.08em] text-muted-foreground/85">
              {master.name.split(" ")[0]}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-semibold leading-snug text-foreground">{imperativeTitle}</h3>
          <p className="mt-1.5 text-[13px] sm:text-sm text-foreground/90 leading-relaxed">{why}</p>
          {state === "active" && visibleScript.length > 0 && (
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-[13px] leading-relaxed text-foreground/80">
              {visibleScript.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ol>
          )}
          {state === "active" && showDetail && (
            <p className="mt-1 text-[11px] italic text-muted-foreground/80 leading-snug">
              {getStepPositionReason(prevKind, step.kind)}
            </p>
          )}
          {state === "active" && showDetail && master?.quote && (
            <p className="mt-2 line-clamp-2 border-l border-primary/25 pl-2 text-[11px] italic leading-snug text-muted-foreground/85">
              “{master.quote}” <span className="not-italic opacity-70">— {master.name}</span>
            </p>
          )}
          {state === "active" && hasMore && (
            <button
              type="button"
              onClick={() => setShowDetail((v) => !v)}
              aria-expanded={showDetail}
              className="mt-1.5 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-primary/90 transition-colors hover:text-primary"
            >
              {showDetail ? "Show less" : "Read more"}
              <ChevronDown className={`h-3 w-3 transition-transform ${showDetail ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {state === "active" && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={onBegin} className="rounded-full">
            Begin <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onSkip} className="rounded-full text-muted-foreground">
            <SkipForward className="mr-1 h-3.5 w-3.5" /> Not now
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Wisdom / chat fallback content card ──────────────────────────────────────
function WisdomCard({ step, onContinue }: { step: SessionStep; onContinue: (note?: string) => void }) {
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const handleContinue = () => {
    if (submitted) return;
    setSubmitted(true);
    onContinue(note.trim() || undefined);
  };
  return (
    <div className="rounded-2xl border border-primary/30 bg-card/70 p-4 sm:p-5 backdrop-blur-md">
      <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-primary/80">
        <Sparkles className="h-3 w-3" /> Wisdom · Read slowly
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown>{step.prompt || step.title}</ReactMarkdown>
      </div>
      <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground/70">
        When you're ready, tap Continue
      </p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write what arises (optional)…"
        disabled={submitted}
        className="mt-2 w-full min-h-[80px] resize-none rounded-lg border border-border/60 bg-background/40 p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none disabled:opacity-60"
      />
      <div className="mt-3 flex justify-end">
        <Button size="sm" onClick={handleContinue} disabled={submitted} className="rounded-full">
          {submitted ? "…" : "Continue"} <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ── Feed item types ──────────────────────────────────────────────────────────
const SKIP_REASONS = [
  { value: "no_time", label: "No time right now" },
  { value: "too_heavy", label: "Too heavy today" },
  { value: "not_needed", label: "Not what I need" },
  { value: "already_settled", label: "Already settled" },
] as const;

type FeedItem =
  | { kind: "intro" }
  | { kind: "step-card"; stepIndex: number }
  | { kind: "widget"; stepIndex: number }
  | { kind: "wisdom"; stepIndex: number }
  | { kind: "step-done"; stepIndex: number; summary?: string }
  | { kind: "breath-pause"; seq: number };

// ── Sitting clock — the session's pulse, not a countdown ─────────────────────
function SittingClock({
  startedAtMs,
  estMinutes,
  paused = false,
  frozenElapsedMs,
}: {
  startedAtMs: number;
  estMinutes: number;
  paused?: boolean;
  frozenElapsedMs?: number | null;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const liveElapsed = Math.max(0, Math.floor((now - startedAtMs) / 1000));
  const elapsed = paused && frozenElapsedMs != null
    ? Math.max(0, Math.floor(frozenElapsedMs / 1000))
    : liveElapsed;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  return (
    <span
      className="flex items-center gap-1.5 text-[11px] tabular-nums text-muted-foreground"
      title={paused ? "Held — the sitting is paused" : `About ${estMinutes} minutes, once all thresholds are crossed`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span
          className={
            "absolute inline-flex h-full w-full rounded-full " +
            (paused ? "bg-muted-foreground/40" : "animate-ping bg-primary/60")
          }
        />
        <span className={"relative inline-flex h-1.5 w-1.5 rounded-full " + (paused ? "bg-muted-foreground/50" : "bg-primary")} />
      </span>
      {mm}:{ss}
      <span className="hidden text-muted-foreground/70 sm:inline">{paused ? "· held" : `· ${estMinutes}m`}</span>
    </span>
  );
}

// ── Session sheet — decisions happen over the sitting, never in the feed ────
function SessionSheet({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={label}
        >
          <div
            aria-hidden="true"
            onClick={onClose}
            className="absolute inset-0 h-full w-full bg-black/65 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute inset-x-0 bottom-0 mx-auto max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border/50 bg-background p-5 pb-8 shadow-2xl sm:bottom-6 sm:rounded-3xl"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-primary/90">{label}</p>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                autoFocus
                className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Intro card — one deliberate opening, not four stacked meta blocks ───────
function SessionIntroCard({ plan }: { plan: SessionPlan }) {
  const [expanded, setExpanded] = useState(false);
  const title = humanIntent(plan.intent);
  const intro = plan.intro || "";
  const why = humanizeWhy(plan._meta?.whyThisSession, plan._meta) || plan._meta?.whyThisSession;
  const canExpand = intro.length > 150;

  return (
    <div className="rounded-2xl border border-border/40 bg-card/55 p-4 backdrop-blur-md sm:p-5">
      <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/90">Today</p>
      <h2 className="mt-1 text-xl font-semibold leading-tight text-foreground sm:text-2xl">{title}</h2>
      {intro && (
        <p className={`mt-2 text-sm leading-relaxed text-foreground/90 ${expanded ? "" : "line-clamp-2"}`}>
          {intro}
        </p>
      )}
      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-[11px] uppercase tracking-[0.14em] text-primary/90 transition-colors hover:text-primary"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
      {why && (
        <p className="mt-3 border-t border-border/30 pt-2 text-xs leading-relaxed text-muted-foreground/90">
          <span className="uppercase tracking-[0.14em] text-amber-400/90">Why this sitting · </span>
          {why}
        </p>
      )}
      {plan._meta?.fallbackReason && (
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground/80">
          Composed locally — the full composer was unavailable for this sitting.
        </p>
      )}
    </div>
  );
}

// ── Main shell ───────────────────────────────────────────────────────────────
export function GuidedFlowShell() {
  const {
    sessionId,
    plan,
    cursor,
    isAgenda,
    isFinished,
    completedSteps,
    skippedSteps,
    startedAtMs,
    paused,
    pauseSession,
    resumeSession,
    beginFromAgenda,
    goToNext,
    skipCurrent,
  } = useSessionShell();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: themeData } = useThemeOfDay();
  const currentSlot = getCurrentTimeSlot();
  const { data: engineData } = useConsciousnessEngine(currentSlot);
  const themeDescription = themeData?.theme?.description as string | undefined;
  const vLevel = (engineData as any)?.vLevel ?? null;
  const getAudioContext = useAudioContext();
  const audioContext = getAudioContext?.();
  // Chrome recedes once the sitter stops moving so the frame becomes the subject.
  const { chromeVisible } = useIdleChrome(5200);
  // Full-screen sitting: hides chrome and asks the browser for true fullscreen.
  const { immersive, toggle: toggleImmersive, exit: exitImmersive } = useImmersiveSession();

  const [feed, setFeed] = useState<FeedItem[]>([{ kind: "intro" }]);
  const [activeWidget, setActiveWidget] = useState<
    | { stepIndex: number; spec: WidgetSpec }
    | { stepIndex: number; catalog: ResolvedStepWidget }
    | null
  >(null);
  const [completedWidgetIndices, setCompletedWidgetIndices] = useState<Set<number>>(new Set());
  const [ending, setEnding] = useState(false);
  const [result, setResult] = useState<SessionCompleteResult | null>(null);
  const [syncFailed, setSyncFailed] = useState(false);
  // "Not now" opens a quiet reason sheet instead of dropping the step.
  const [skipTarget, setSkipTarget] = useState<number | null>(null);
  // Ending is a decision, not an accidental tap.
  const [endConfirmOpen, setEndConfirmOpen] = useState(false);
  // Paused time is excluded from the sitting clock so a pause never eats it.
  const pausedAtRef = useRef<number | null>(null);
  const [pausedTotalMs, setPausedTotalMs] = useState(0);
  // Full-screen orb beat before the agenda/step cards appear.
  const [revealAgenda, setRevealAgenda] = useState(true);
  const dismissAgendaReveal = useCallback(() => setRevealAgenda(false), []);
  const closingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastPushedCursor = useRef<number>(-2);

  // Which progress surface this sitting wears (pipeline vs legacy dots).
  const railVariant = useMemo(readRailVariant, []);
  useEffect(() => {
    logRailExposure(sessionId, railVariant);
  }, [sessionId, railVariant]);

  // A closing skip prompt never survives a step change.
  useEffect(() => {
    setSkipTarget(null);
  }, [cursor]);

  // Held: bring the resume card into view. Skip/end decisions use sheets.
  useEffect(() => {
    if (!paused) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: 0, behavior: "smooth" });
  }, [paused]);

  // The film ends in the room, not in a letterbox — leave full screen on close.
  useEffect(() => {
    if (isFinished || ending) exitImmersive();
  }, [isFinished, ending, exitImmersive]);

  // ─── Threshold ritual context: invocation, ladder, whisper ───
  const sessionCount = ((engineData as any)?.profile?.total_sessions as number | undefined) ?? 0;
  const planMeta = plan._meta;
  const invocation = useMemo(() => {
    const fallback = getSessionInvocation({
      sessionCount: sessionCount + 1,
      hour: new Date().getHours(),
      themeTitle: themeData?.theme?.title ?? null,
      archetype: planMeta?.archetype ?? null,
      sessionSalt: plan.id ?? null,
    });
    // The composer names the sitting server-side. Client naming is only the
    // fallback for plans composed before that field existed.
    if (!planMeta?.invocation) return fallback;
    return {
      ...fallback,
      invocation: planMeta.invocation,
      gateLine: planMeta.gateLine ?? fallback.gateLine,
      sittingRoman: planMeta.sittingRoman ?? fallback.sittingRoman,
      gateAccent: planMeta.gateAccent ?? fallback.gateAccent,
    };
  }, [sessionCount, themeData?.theme?.title, planMeta, plan.id]);
  const sessionAngle = useMemo(
    () => getSessionAngle(plan.id),
    [plan.id],
  );
  const ladderRung = useMemo(
    () => getLadderRung(sessionCount + 1),
    [sessionCount],
  );
  const [whisper, setWhisper] = useState<FutureWhisper | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const w = await fetchUnconsumedWhisper();
      if (cancelled) return;
      setWhisper(w);
      // Delivered once — mark consumed so the next greeting is a fresh one.
      if (w?.id) void consumeWhisper(w.id);
    })();
    return () => { cancelled = true; };
  }, []);

  // Build prior/upcoming summaries so Guide knows the session arc.
  const priorStepsSummary = useMemo(() => {
    return plan.steps
      .slice(0, cursor)
      .map((s, idx) => {
        const isDone = completedWidgetIndices.has(idx);
        const tag = isDone ? "✓" : "·";
        return `${idx + 1}. ${s.title} ${tag}`;
      })
      .join("\n");
  }, [plan.steps, cursor, completedWidgetIndices]);

  const upcomingStepsSummary = useMemo(() => {
    return plan.steps
      .slice(cursor + 1)
      .map((s, idx) => `${cursor + 2 + idx}. ${s.title}`)
      .join("\n");
  }, [plan.steps, cursor]);

  // Auto-scroll on new items
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [feed.length, activeWidget]);

  // When cursor advances past agenda, push a step card for it.
  useEffect(() => {
    if (isAgenda) return;
    if (cursor < 0 || cursor >= plan.steps.length) return;
    if (lastPushedCursor.current === cursor) return;
    lastPushedCursor.current = cursor;
    setFeed((f) => [...f, { kind: "step-card", stepIndex: cursor }]);
  }, [cursor, isAgenda, plan.steps.length]);

  // Auto-complete when finished
  useEffect(() => {
    if (isFinished && !result && !closingRef.current) {
      void endNow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  // Block accidental tab close mid-session
  useEffect(() => {
    if (result || isAgenda) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [result, isAgenda]);

  async function endNow() {
    if (closingRef.current) return;
    closingRef.current = true;
    setEnding(true);
    try {
      const res = await completeGenerativeSession({
        sessionId,
        completedSteps,
        skippedSteps,
        totalSeconds: Math.round((Date.now() - startedAtMs) / 1000),
        plan,
      });
      // Real completion → drop the resume snapshot.
      try { clearPersistedShell(sessionId); } catch { /* ignore */ }
      setSyncFailed(false);
      // Completion now writes karma + the day gate server-side; refresh every
      // surface that reads them so Home reflects the session immediately.
      void queryClient.invalidateQueries({ queryKey: ["user-karma"] });
      void queryClient.invalidateQueries({ queryKey: ["daily-gates"] });
      void queryClient.invalidateQueries({ queryKey: ["today-practice-pack"] });
      void queryClient.invalidateQueries({ queryKey: ["consciousness-engine"] });
      void queryClient.invalidateQueries({ queryKey: ["sessions"] });
      setResult(res);
      saveLastSittingEssence(res.shiftSummary || res.nextTeaser || plan.intent);
    } catch (e: any) {
      toast.error(e?.message || "Could not close session");
      setSyncFailed(true);
      saveLastSittingEssence(plan.intent);
      setResult({
        ok: false,
        sessionId,
        completedStepCount: completedSteps.length,
        durationMs: Math.max(0, Date.now() - startedAtMs),
        loopsTouched: [],
        karmaEarned: 0,
        shiftSummary: null,
        nextTeaser: null,
        vLevelDelta: null,
        dimensionNudges: [],
      });
    } finally {
      setEnding(false);
    }
  }

  /**
   * Pause holds the sitting where it is: the rail dims, the clock freezes and
   * the feed offers Resume — nothing is lost. "Save & exit" leaves the row
   * active so Home's resume card can pick it back up (persistence lives in the
   * provider).
   */
  function handlePauseClick() {
    if (ending || closingRef.current || paused) return;
    pausedAtRef.current = Date.now();
    pauseSession();
  }

  function handleResumeClick() {
    if (!paused) return;
    if (pausedAtRef.current != null) {
      setPausedTotalMs((ms) => ms + Math.max(0, Date.now() - (pausedAtRef.current as number)));
    }
    pausedAtRef.current = null;
    resumeSession();
  }

  /** Leave the sitting — it stays resumable from Home. */
  function handleExitClick() {
    if (ending || closingRef.current) return;
    closingRef.current = true;
    if (!paused) pauseSession();
    toast.success("Session paused. Resume anytime from Home.");
    navigate("/app");
  }

  /** Explicit "End now" — confirm first, never a native browser prompt. */
  function handleEndClick() {
    if (ending || closingRef.current) return;
    setEndConfirmOpen(true);
  }

  function confirmEndNow() {
    setEndConfirmOpen(false);
    if (ending || closingRef.current) return;
    void endNow();
  }

  function handleBegin(stepIndex: number) {
    const step = plan.steps[stepIndex];
    if (!step) return;
    // Guard: double-click / re-click on Begin must not push duplicate cards.
    setFeed((f) => {
      const already = f.some(
        (it) =>
          (it.kind === "widget" || it.kind === "wisdom") &&
          it.stepIndex === stepIndex,
      );
      if (already) return f;
      // Catalog widgets run every step that has no bespoke renderer, and can be
      // named explicitly by the composer via `params.widgetId`.
      const catalog = resolveStepWidget(step);
      if (catalog) {
        setActiveWidget({ stepIndex, catalog });
        return [...f, { kind: "widget", stepIndex }];
      }
      const spec = widgetForStep(step);
      if (spec) {
        setActiveWidget({ stepIndex, spec });
        return [...f, { kind: "widget", stepIndex }];
      }
      // wisdom-read / guide-chat / temple-chat → markdown card + Continue
      return [...f, { kind: "wisdom", stepIndex }];
    });
  }

  function handleStepDone(stepIndex: number, summary?: string, payload?: Record<string, unknown>) {
    const step = plan.steps[stepIndex];
    setCompletedWidgetIndices((s) => new Set(s).add(stepIndex));
    setActiveWidget(null);
    hapticTick();
    if (step) {
      void persistStepNote({
        sessionId,
        stepIndex,
        kind: step.kind,
        title: step.title,
        payload: payload ? { data: payload } : undefined,
        summary,
      });
    }
    setFeed((f) => [
      ...f,
      { kind: "step-done", stepIndex, summary },
      { kind: "breath-pause", seq: f.length },
    ]);
    goToNext(payload);
  }

  /** "Not now" asks once for a quiet reason — the next sitting learns from it. */
  function requestSkip(stepIndex: number) {
    if (ending || closingRef.current || paused) return;
    if (stepIndex !== cursor) return;
    setSkipTarget(stepIndex);
  }

  function confirmSkip(reason: string | null) {
    const target = skipTarget;
    setSkipTarget(null);
    if (target == null || target !== cursor) return;
    handleSkip(target, reason ?? undefined);
  }

  function handleSkip(stepIndex: number, reason?: string) {
    setActiveWidget(null);
    setFeed((f) => [...f, { kind: "step-done", stepIndex, summary: "Not taken" }]);
    skipCurrent(reason);
  }

  // Keyboard: no hidden shortcuts. A stray "s" must never skip a threshold;
  // stepping is always an explicit tap.

  if (result) {
    return (
      <SessionCompleteScreen
        result={result}
        completedSteps={completedSteps}
        syncError={syncFailed}
        onHome={() => navigate("/app")}
        onAnalytics={() => navigate("/app/analytics")}
      />
    );
  }

  // ── INTERSTITIAL — between last step done and SessionCompleteScreen ──
  // While the completion API weaves loops / karma / shift summary, show a
  // breathing orb instead of a dead/blank gap.
  if (ending || isFinished) {
    return <SessionWeavingScreen />;
  }

  const totalSteps = plan.steps.length;

  // The frame currently being shot: the live step (or the opening frame on agenda).
  const liveIndex = cursor >= 0 && cursor < totalSteps ? cursor : 0;
  const liveStep = plan.steps[liveIndex];
  const liveThreshold = liveStep ? getStepThreshold(liveStep, liveIndex) : null;
  const liveMaster = liveStep ? getStepMaster(liveStep.kind, plan.id) : null;
  const lastRoman = totalSteps > 0
    ? getStepThreshold(plan.steps[totalSteps - 1], totalSteps - 1).roman
    : "I";

  // ── AGENDA SCREEN — full-screen orb + "what to expect" card ────────────────
  if (isAgenda) {
    const totalMin = plan.steps.reduce((a, s) => a + s.est_minutes, 0);
    return (
      <div className="fixed inset-0 z-[60] flex flex-col bg-background text-foreground">
        <AmbientLayer audioContext={audioContext} />
        <CinematicStage kind={liveStep?.kind} slot={currentSlot} />
        <SessionOrbStage
          open={revealAgenda}
          autoHideMs={2400}
          onDone={dismissAgendaReveal}
          title="Your sitting is ready"
          subtitle={`${plan.steps.length} steps · tap to enter`}
        />
        <header className="relative z-10 flex items-center justify-between px-4 py-3 sm:px-6 shrink-0">
          <div className="min-w-0">
            <p className="truncate text-[9px] uppercase tracking-[0.25em] text-primary/70">
              {invocation.gateLine}
            </p>
            <p className="truncate font-display text-sm text-foreground">
              {invocation.invocation}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AgendaMuteButton />
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleImmersive}
              className="rounded-full text-muted-foreground hover:text-foreground"
              aria-label={immersive ? "Leave full screen" : "Enter full screen"}
            >
              {immersive ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleExitClick} disabled={ending} className="rounded-full">
              <X className="mr-1 h-4 w-4" /> Close
            </Button>
          </div>
        </header>

        {/* Same pipeline the sitting will wear — the mental model set early */}
        <SessionProgressRail
          steps={plan.steps}
          cursor={-1}
          keystoneIndex={pickKeystoneIndex(plan.steps)}
          seed={plan.id}
          tone={currentSlot}
          showPeek={false}
          className="shrink-0"
        />

        {/* Scrollable agenda */}
        <div className="relative z-10 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-xl px-4 sm:px-6 pt-6 pb-32 lg:max-w-3xl xl:max-w-4xl">
            <AgendaThemeHeader fallbackTitle={humanIntent(plan.intent)} fallbackIntro={plan.intro} sessionAngle={sessionAngle} />


            <AgendaRevolution
              steps={plan.steps}
              totalMin={totalMin}
              onBegin={beginFromAgenda}
              whisperText={whisper?.whisper ?? null}
              ladderRung={ladderRung}
              meta={plan._meta}
            />

          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background text-foreground">
      <AmbientLayer audioContext={audioContext} />
      <CinematicStage kind={liveStep?.kind} slot={currentSlot} paused={paused} />

      {/* Threshold title card — the cut between scenes */}
      {!paused && liveThreshold && (
        <CinematicChapterCard
          key={`chapter-${cursor}`}
          eyebrow={`Threshold ${liveThreshold.roman} of ${lastRoman}`}
          title={liveThreshold.name}
          essence={liveThreshold.essence}
          meta={liveMaster ? `held by ${liveMaster.name}` : null}
          kind={liveStep?.kind}
        />
      )}

      {/* Header */}
      {!immersive && (
      <header
        className={
          "relative z-10 flex items-center justify-between border-b border-border/25 bg-gradient-to-b from-background/85 via-background/50 to-transparent px-4 py-3 backdrop-blur-md transition-opacity duration-700 focus-within:opacity-100 hover:opacity-100 sm:px-6 " +
          (chromeVisible ? "opacity-100" : "opacity-45")
        }
      >
        <div className="min-w-0">
          <p className="truncate text-[10px] uppercase tracking-[0.22em] text-primary/85">{invocation.gateLine}</p>
          <p className="truncate text-sm font-medium">{invocation.invocation}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <SittingClock
            startedAtMs={startedAtMs}
            estMinutes={plan.steps.reduce((a, s) => a + s.est_minutes, 0)}
            paused={paused}
            frozenElapsedMs={
              paused && pausedAtRef.current != null
                ? pausedAtRef.current - startedAtMs - pausedTotalMs
                : null
            }
          />
          <AgendaMuteButton />
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleImmersive}
            className="rounded-full text-muted-foreground hover:text-foreground"
            aria-label="Enter full screen"
            title="Full screen"
          >
            <Maximize2 className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">Full screen</span>
          </Button>
          {paused ? (
            <Button size="sm" onClick={handleResumeClick} disabled={ending} className="rounded-full">
              Resume
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={handlePauseClick} disabled={ending} className="rounded-full" aria-label="Hold this sitting">
              Pause
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleEndClick}
            disabled={ending}
            className="rounded-full text-muted-foreground hover:text-foreground"
            aria-label="End this sitting"
          >
            <X className="mr-1 h-4 w-4" /> End
          </Button>
        </div>
      </header>
      )}

      {/* Full-screen HUD — everything the sitting needs, nothing else */}
      {immersive && (
        <div
          className={
            "fixed right-4 top-4 z-30 flex items-center gap-1.5 rounded-full border border-border/30 bg-background/50 p-1.5 shadow-lg backdrop-blur-md transition-opacity duration-700 " +
            (chromeVisible ? "opacity-100" : "opacity-30")
          }
        >
          {paused ? (
            <Button size="sm" onClick={handleResumeClick} disabled={ending} className="rounded-full">
              Resume
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={handlePauseClick}
              disabled={ending}
              className="rounded-full text-muted-foreground hover:text-foreground"
              aria-label="Hold this sitting"
            >
              Pause
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleEndClick}
            disabled={ending}
            className="rounded-full text-muted-foreground hover:text-foreground"
            aria-label="End this sitting"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleImmersive}
            className="rounded-full text-muted-foreground hover:text-foreground"
            aria-label="Leave full screen"
            title="Leave full screen (Esc)"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Threshold pipeline — the whole sitting, in order */}
      {!immersive && !isAgenda && (railVariant === "pipeline" ? (
        <SessionProgressRail
          steps={plan.steps}
          cursor={cursor}
          completedIndices={Array.from(completedWidgetIndices)}
          skippedIndices={skippedSteps
            .map((s) => s.stepIndex)
            .filter((i): i is number => typeof i === "number")}
          keystoneIndex={pickKeystoneIndex(plan.steps)}
          seed={plan.id}
          tone={currentSlot}
          paused={paused}
        />
      ) : (
        <div className="relative z-10 flex items-center justify-center gap-1.5 py-2">
          {plan.steps.map((_, i) => (
            <span
              key={i}
              className={
                "h-1.5 rounded-full transition-all " +
                (i < cursor ? "w-3 bg-primary/80" : i === cursor ? "w-6 bg-primary" : "w-3 bg-muted")
              }
            />
          ))}
        </div>
      ))}

      {/* Feed */}
      <main ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto py-4 sm:py-6">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 sm:px-6 lg:max-w-3xl xl:max-w-4xl">
          {paused && (
            <div className="rounded-2xl border border-primary/30 bg-card/70 p-4 backdrop-blur-md sm:p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary/80">Held</p>
              <p className="mt-1 text-sm text-foreground/85 leading-relaxed">
                The sitting holds exactly where you left it. Nothing is lost.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button size="sm" onClick={handleResumeClick} className="rounded-full">
                  Resume <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleExitClick} className="rounded-full text-muted-foreground">
                  Save &amp; exit
                </Button>
              </div>
            </div>
          )}
          {feed.map((item, i) => {
            if (item.kind === "intro") {
              return <SessionIntroCard key={i} plan={plan} />;
            }
            if (item.kind === "step-card") {
              const step = plan.steps[item.stepIndex];
              if (!step) return null;
              const isActive = item.stepIndex === cursor && !activeWidget;
              const isPastDone = completedWidgetIndices.has(item.stepIndex);
              const state: StepCardProps["state"] = isActive
                ? "active"
                : isPastDone
                  ? "done"
                  : item.stepIndex < cursor
                    ? "skipped"
                    : "pending";
              return (
                <StepCard
                  key={i}
                  step={step}
                  index={item.stepIndex}
                  total={totalSteps}
                  state={state}
                  prevKind={item.stepIndex > 0 ? plan.steps[item.stepIndex - 1]?.kind : undefined}
                  seed={plan.id}
                  onBegin={() => handleBegin(item.stepIndex)}
                  onSkip={() => requestSkip(item.stepIndex)}
                />
              );
            }
            if (item.kind === "wisdom") {
              const step = plan.steps[item.stepIndex];
              if (!step) return null;
              const done = completedWidgetIndices.has(item.stepIndex);
              const isActive = item.stepIndex === cursor;
              const master = getStepMaster(step.kind);
              // For active wisdom/chat steps, render the Guide chat surface
              // IN PLACE of the static read-card. Once the step is done or
              // cursor has moved past, collapse to a compact placeholder so
              // the feed stays tidy.
              if (!isActive || done) {
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-xs backdrop-blur-md ${
                      done
                        ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-400/90"
                        : "border-border/30 bg-background/40 text-muted-foreground"
                    }`}
                  >
                    <Sparkles className="h-3 w-3 opacity-70" />
                    <span className="flex-1 truncate">{step.title}</span>
                    <span className="shrink-0 uppercase tracking-[0.14em] opacity-80">
                      {done ? "✓ Read" : "Read"}
                    </span>
                  </div>
                );
              }
              return (
                <div key={i}>
                  <SessionGuideChat
                    variant="teaching"
                    sessionIntent={plan.intent}
                    currentStepTitle={step.title}
                    currentStepPrompt={(step.script || []).join(" ") || step.prompt}
                    stepKind={step.kind}
                    stepIndex={item.stepIndex}
                    totalSteps={totalSteps}
                    themeDescription={themeDescription}
                    vLevel={vLevel}
                    priorStepsSummary={priorStepsSummary}
                    upcomingStepsSummary={upcomingStepsSummary}
                    master={master ? { id: master.id, name: master.name, image: master.image, tradition: (master as any).tradition } : null}
                    onContinue={() =>
                      !done && handleStepDone(item.stepIndex, "Read")
                    }
                  />
                </div>
              );
            }
            if (item.kind === "widget") {
              if (!activeWidget || activeWidget.stepIndex !== item.stepIndex) {
                const step = plan.steps[item.stepIndex];
                return (
                  <div
                    key={i}
                    className="rounded-2xl border border-border/30 bg-background/40 p-3 text-xs text-muted-foreground"
                  >
                    {step?.title} — practice complete.
                  </div>
                );
              }
              const activeStep = plan.steps[item.stepIndex];
              const master = activeStep ? getStepMaster(activeStep.kind) : null;
              const shot = activeStep ? getStepThreshold(activeStep, item.stepIndex) : null;
              return (
                <div key={i} className="space-y-2">
                  <CinematicFrame label={shot?.name} meta={master?.name} kind={activeStep?.kind}>
                    {"catalog" in activeWidget ? (
                      <div className="rounded-3xl border border-border/40 bg-card/80 p-4 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:p-5">
                        <StepWidget
                          bare
                          definition={activeWidget.catalog.definition}
                          title={activeStep?.title}
                          prompt={activeStep?.script?.length ? activeStep.script.join(" ") : activeStep?.prompt}
                          whyForYou={activeStep?.whyForYou}
                          overrides={activeWidget.catalog.overrides}
                          onComplete={(r) =>
                            handleStepDone(item.stepIndex, r.summary, {
                              ...r.data,
                              widgetId: r.widgetId,
                              widgetEngine: r.engine,
                            })
                          }
                          onSkip={() => requestSkip(item.stepIndex)}
                        />
                      </div>
                    ) : (
                      renderWidget(activeWidget.spec, {
                        onComplete: (r: WidgetResult) =>
                          handleStepDone(item.stepIndex, r.summary, r.data),
                        onSkip: () => requestSkip(item.stepIndex),
                      })
                    )}
                  </CinematicFrame>
                  {activeStep && (
                    <SessionGuideChat
                      variant="companion"
                      sessionIntent={plan.intent}
                      currentStepTitle={activeStep.title}
                      currentStepPrompt={(activeStep.script || []).join(" ") || activeStep.prompt}
                      stepKind={activeStep.kind}
                      stepIndex={item.stepIndex}
                      totalSteps={totalSteps}
                      themeDescription={themeDescription}
                      vLevel={vLevel}
                      priorStepsSummary={priorStepsSummary}
                      upcomingStepsSummary={upcomingStepsSummary}
                      master={master ? { id: master.id, name: master.name, image: master.image, tradition: (master as any).tradition } : null}
                    />
                  )}
                </div>
              );
            }
            if (item.kind === "step-done") {
              const fromStep = plan.steps[item.stepIndex];
              const toStep = plan.steps[item.stepIndex + 1];
              const fromMaster = fromStep ? getStepMaster(fromStep.kind) : null;
              const toMaster = toStep ? getStepMaster(toStep.kind) : null;
              const sameMaster = fromMaster && toMaster && fromMaster.id === toMaster.id;
              const wasSkipped = skippedSteps.some((s) => s.stepIndex === item.stepIndex);
              const crossed = fromStep ? getStepThreshold(fromStep, item.stepIndex) : null;
              return (
                <div key={i} className="flex flex-col gap-2">
                  <div
                    className={`self-end rounded-full border px-3 py-1 text-[11px] ${
                      wasSkipped
                        ? "border-border/40 bg-background/40 text-muted-foreground"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-500/90"
                    }`}
                  >
                    {wasSkipped ? "Not taken — the door stays open" : `✓ ${item.summary || "Crossed"}`}
                  </div>
                  {crossed && !wasSkipped && (
                    <p className="self-end text-[10px] italic text-muted-foreground/60">
                      {crossed.name} · {crossed.essence}
                    </p>
                  )}
                  {toStep && fromMaster && toMaster && !sameMaster && (
                    <>
                      <div className="flex items-center justify-center gap-2 py-1 text-[11px] text-muted-foreground/80">
                        <div
                          className="h-6 w-6 rounded-full border border-border/40 bg-cover bg-center"
                          style={{ backgroundImage: fromMaster.image ? `url(${fromMaster.image})` : undefined }}
                          title={fromMaster.name}
                        />
                        <span className="opacity-70">hands you to</span>
                        <div
                          className="h-6 w-6 rounded-full border border-primary/40 bg-cover bg-center"
                          style={{ backgroundImage: toMaster.image ? `url(${toMaster.image})` : undefined }}
                          title={toMaster.name}
                        />
                        <span className="text-foreground/80">{toMaster.name.split(" ")[0]}</span>
                      </div>
                      {toMaster.quote && (
                        <p className="mx-auto line-clamp-2 max-w-md text-center text-[10px] italic leading-snug text-muted-foreground/60">
                          “{toMaster.quote}”
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            }
            if (item.kind === "breath-pause") {
              return (
                <div key={i} className="flex flex-col items-center py-3">
                  <div className="relative flex h-6 w-40 items-center justify-center sm:w-56">
                    <motion.span
                      className="absolute h-px w-full bg-gradient-to-r from-transparent via-primary/70 to-transparent"
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{ duration: 1.6, ease: "easeOut" }}
                    />
                    <motion.span
                      className="relative h-1.5 w-1.5 rounded-full bg-primary"
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.6, 0.8] }}
                      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                  <p className="mt-2 text-[10px] italic tracking-[0.18em] uppercase text-muted-foreground/70">
                    {getBreathPauseLine(item.seq)}
                  </p>
                </div>
              );
            }
            return null;
          })}
          <div className="h-12" />
        </div>
      </main>

      <SessionSheet
        open={skipTarget !== null}
        onClose={() => setSkipTarget(null)}
        label="Leave this threshold for now?"
      >
        <p className="text-sm leading-relaxed text-foreground/85">
          A reason helps the next sitting meet you better. The door stays open either way.
        </p>
        <div className="mt-4 space-y-1.5">
          {SKIP_REASONS.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => confirmSkip(r.value)}
              className="flex min-h-11 w-full items-center justify-between rounded-xl border border-border/50 bg-card/40 px-3 text-left text-sm text-foreground/90 transition-colors hover:border-primary/40 hover:bg-primary/5 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/60"
            >
              {r.label}
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <Button variant="ghost" onClick={() => setSkipTarget(null)} className="rounded-full">
            Keep going
          </Button>
          <Button variant="ghost" onClick={() => confirmSkip(null)} className="rounded-full text-muted-foreground">
            Skip quietly
          </Button>
        </div>
      </SessionSheet>

      <SessionSheet
        open={endConfirmOpen}
        onClose={() => setEndConfirmOpen(false)}
        label="End this sitting?"
      >
        <p className="text-sm leading-relaxed text-foreground/85">
          Your progress is saved. Ending now seals the sitting and keeps the receipt of what happened —
          you can still return Home and begin again later.
        </p>
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setEndConfirmOpen(false)} className="rounded-full">
            Keep sitting
          </Button>
          <Button onClick={confirmEndNow} className="rounded-full">
            End &amp; seal
          </Button>
        </div>
      </SessionSheet>
    </div>
  );
}

function AgendaMuteButton() {
  const { soundEnabled, toggleSound } = useSound();
  return (
    <button
      onClick={toggleSound}
      title={soundEnabled ? "Mute sounds" : "Enable sounds"}
      aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
      aria-pressed={soundEnabled}
      className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-muted/40 hover:text-foreground"
    >
      {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
    </button>
  );
}

function AgendaThemeHeader({
  fallbackTitle,
  fallbackIntro,
  sessionAngle,
}: {
  fallbackTitle: string;
  fallbackIntro?: string;
  sessionAngle?: string;
}) {
  const [open, setOpen] = useState(false);
  const { data } = useThemeOfDay();
  const theme = data?.theme;
  const currentSlot = getCurrentTimeSlot();
  const { data: engineData } = useConsciousnessEngine(currentSlot);
  const { data: activeGuruProgram } = useActiveGuruProgram();

  const activeGuru = useMemo(() => {
    const themeGuruName =
      (engineData as any)?.guruName || (engineData as any)?.todayCard?.guruName;
    if (themeGuruName) {
      const byName = GURUS.find(
        (g) => g.name.toLowerCase() === String(themeGuruName).toLowerCase()
      );
      if (byName) return byName;
    }
    const id = activeGuruProgram?.guru_id;
    if (id) {
      const found = GURUS.find((g) => g.id === id);
      if (found) return found;
    }
    if (!GURUS.length) return null;
    const dayIdx = Math.floor(Date.now() / 86400000) % GURUS.length;
    return GURUS[dayIdx] || GURUS[0];
  }, [activeGuruProgram?.guru_id, (engineData as any)?.guruName, (engineData as any)?.todayCard?.guruName]);

  const title = theme?.title || fallbackTitle;
  const description = theme?.description || fallbackIntro;
  const depth = (theme as any)?.current_depth;
  const maxDepth = (theme as any)?.max_depth;
  const evolution = (theme as any)?.evolution_status;
  const affirmation = (theme as any)?.affirmation as string | undefined;

  return (
    <div className="text-center mb-8">
      <div className="mx-auto mb-4 w-fit">
        <DisplayOrb size={64} breathing />
      </div>
      <span className="text-[10px] font-display tracking-[0.3em] uppercase text-muted-foreground/60 mb-2 block">
        Today's Theme
      </span>
      <h1 className="text-2xl sm:text-3xl font-display font-medium text-foreground leading-tight mb-2">
        {title}
      </h1>
      {sessionAngle && (
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">
          {sessionAngle}
        </p>
      )}
      {typeof depth === "number" && typeof maxDepth === "number" && maxDepth > 1 && (
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">
          This thread · layer {depth} of {maxDepth}{evolution ? ` · ${evolution}` : ""}
        </p>
      )}
      {affirmation && (
        <p className="mx-auto mt-1 max-w-md text-sm font-display italic text-primary/80">
          "{affirmation}"
        </p>
      )}
      {/* Single-guru line replaced by CouncilHeader below */}
      {description && (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 text-[10px] font-display tracking-[0.2em] uppercase text-muted-foreground/70 hover:text-foreground/90 transition-colors mx-auto"
            aria-expanded={open}
          >
            {open ? "Hide details" : "Read today's intention"}
            <ChevronDown
              className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.p
                key="theme-desc"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="text-sm font-body text-muted-foreground/80 max-w-md mx-auto leading-relaxed overflow-hidden"
              >
                {description}
              </motion.p>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

// ── AgendaRevolution — Council + dissection + master-attributed steps ───────
function AgendaRevolution({
  steps,
  totalMin,
  onBegin,
  whisperText,
  ladderRung,
  meta,
}: {
  steps: SessionStep[];
  totalMin: number;
  onBegin: () => void;
  whisperText?: string | null;
  ladderRung?: LadderRung;
  meta?: SessionPlanMeta | null;
}) {
  const { data: themeData } = useThemeOfDay();
  const { data: activeGuruProgram } = useActiveGuruProgram();

  const theme: any = themeData?.theme || {};
  const forbidden = theme?.forbidden_thing as string | undefined;
  const opener = theme?.felt_sense_opener as string | undefined;

  const council = useMemo(
    () => councilFromMeta(meta, steps) ?? pickCouncil(steps, activeGuruProgram?.guru_id),
    [meta, steps, activeGuruProgram?.guru_id]
  );
  const verdicts = useMemo(() => getCouncilVerdicts(steps, council), [steps, council]);
  const keystoneIdx = useMemo(() => pickKeystoneIndex(steps), [steps]);
  const [openStep, setOpenStep] = useState<number | null>(null);

  // Too much meta at once buries the sitting. The frame stays folded behind a
  // single "Read more" line; the step list previews the first few and offers
  // the rest on demand.
  const [showFrame, setShowFrame] = useState(false);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const PREVIEW_STEPS = 3;
  const previewSteps = showAllSteps ? steps : steps.slice(0, PREVIEW_STEPS);
  const archetype = archetypeMeta(meta?.archetype);
  const frameSummary = [
    archetype?.label,
    meta?.leadMaster ? `held by ${meta.leadMaster}` : null,
    `${steps.length} steps`,
    `~${totalMin}m`,
  ]
    .filter(Boolean)
    .join(" · ");


  return (
    <>
      {/* Whisper from the last sitting — the thread across sessions */}
      {whisperText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-6 rounded-2xl border border-primary/25 bg-primary/[0.05] p-4 sm:p-5 backdrop-blur-md"
        >
          <div className="flex items-center gap-2 text-[10px] font-display tracking-[0.25em] uppercase text-primary/80">
            <Feather className="h-3 w-3" />
            Before we begin — from your last sitting
          </div>
          <p className="mt-2 text-sm sm:text-base italic text-foreground/90 leading-relaxed">
            "{whisperText}"
          </p>
        </motion.div>
      )}

      {/* Ladder ceremony — only when this sitting earns one */}
      {ladderRung?.ceremony && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/[0.07] p-4 sm:p-5"
        >
          <p className="text-[10px] font-display tracking-[0.25em] uppercase text-amber-500/90">
            Today's rite · {ladderRung.ceremony.title}
          </p>
          <p className="mt-1.5 text-sm text-foreground/90 leading-relaxed">
            {ladderRung.ceremony.line}
          </p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.7 }}
        className="mb-6"
      >
        <button
          type="button"
          onClick={() => setShowFrame((v) => !v)}
          aria-expanded={showFrame}
          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border/40 bg-card/50 px-4 py-3 text-left backdrop-blur-md transition-colors hover:border-primary/35"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Compass className="h-3.5 w-3.5 shrink-0 text-primary/70" />
            <span className="min-w-0">
              <span className="block text-[10px] font-display uppercase tracking-[0.22em] text-primary/70">
                How this sitting was built
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-muted-foreground/80">
                {frameSummary || "Composed from your current state"}
              </span>
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
            {showFrame ? "Show less" : "Read more"}
            <ChevronDown className={`h-3 w-3 transition-transform ${showFrame ? "rotate-180" : ""}`} />
          </span>
        </button>
        <AnimatePresence initial={false}>
          {showFrame && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pt-3">
                <CouncilHeader council={council} verdicts={verdicts} totalMasters={118} />
                <SessionFrameCard meta={meta} nextMilestone={ladderRung?.nextMilestone} totalMin={totalMin} />
                {ladderRung?.allowDissection !== false && <AgendaDissectionPanel />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.7 }}
        className="rounded-3xl border border-border/40 bg-card/70 p-4 sm:p-5 shadow-2xl backdrop-blur-md"
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            The path this session
          </p>
          <span className="text-[11px] text-muted-foreground">
            {steps.length} steps · ~{totalMin}m
          </span>
        </div>
        <p className="mb-1 text-[11px] italic text-muted-foreground/80 leading-relaxed">
          Sequenced because {explainOrder(steps, keystoneIdx)}
        </p>
        <p className="mb-3 text-[9px] uppercase tracking-[0.16em] text-muted-foreground/50">
          Tap a step to see what happens
        </p>
        <ol className="relative mb-4 space-y-2.5">
          <span
            aria-hidden
            className="absolute left-[30px] top-4 bottom-4 w-px bg-border/40"
          />
          {previewSteps.map((s, i) => {
            const Icon = STEP_ICONS[s.kind] || Sparkles;
            const master = getStepMaster(s.kind, meta?.council?.reason || undefined);
            const title = getImperativeTitle(s);
            const isKeystone = i === keystoneIdx;
            const why = humanizeWhy(s.whyForYou, meta) || getStepWhy(s, isKeystone);
            const signalText = signalLabel(s.signalRef, meta);
            const isOpen = openStep === i;
            const minutes = Math.max(1, Math.round(stepSeconds(s) / 60));
            return (
              <li
                key={i}
                className={
                  "relative rounded-xl border p-3 transition-all " +
                  (isKeystone
                    ? "border-primary/50 bg-primary/5 ring-1 ring-primary/30 shadow-lg shadow-primary/10 scale-[1.01]"
                    : "border-border/30 bg-background/40")
                }
              >
                <div className="flex items-start gap-3">
                  <div className={
                    "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full " +
                    (isKeystone ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary")
                  }>
                    <Icon className="h-4 w-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenStep(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="min-w-0 flex-1 text-left focus:outline-none"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate text-[13px] font-semibold text-foreground">{title}</p>
                        {isKeystone && (
                          <span className="shrink-0 rounded-full bg-primary/20 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-primary">
                            Keystone
                          </span>
                        )}
                      </div>
                      <span className="flex shrink-0 items-center gap-1.5 text-[10px] text-muted-foreground">
                        ~{minutes}m
                        <ChevronDown
                          className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        />
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <p className="text-[10px] text-muted-foreground/70 leading-snug flex-1">
                        {why}
                      </p>
                      {master && (
                        <span className="shrink-0 text-[9px] text-muted-foreground/60">
                          {master.name.split(" ")[0]}
                        </span>
                      )}
                    </div>
                    {s.optional && (
                      <p className="mt-1 text-[9px] uppercase tracking-wider text-muted-foreground/60">
                        Optional
                      </p>
                    )}
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 space-y-1.5 border-t border-border/25 pl-12 pt-2">
                        {(s.script && s.script.length > 0) ? (
                          <ol className="list-decimal space-y-1 pl-4 text-[11px] leading-relaxed text-foreground/80">
                            {s.script.slice(0, 5).map((line, k) => (
                              <li key={k}>{line}</li>
                            ))}
                          </ol>
                        ) : (
                          <p className="text-[11px] leading-relaxed text-foreground/80">
                            {stepExpectation(s)}
                          </p>
                        )}
                        <p className="text-[10px] italic leading-snug text-muted-foreground/70">
                          {stepFrame(s.kind).what}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[9px] uppercase tracking-[0.14em] text-muted-foreground/60">
                          <span className="rounded-full border border-primary/25 bg-primary/10 px-1.5 py-0.5 text-primary/80">
                            {getStepThreshold(s, i).label}
                          </span>
                          <span className="rounded-full border border-border/40 px-1.5 py-0.5">
                            {stepFrame(s.kind).label}
                          </span>
                          <span className="rounded-full border border-border/40 px-1.5 py-0.5">
                            ~{s.est_minutes} min
                          </span>
                          {signalText && (
                            <span className="rounded-full border border-primary/25 bg-primary/10 px-1.5 py-0.5 text-primary/80">
                              {signalText}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ol>

        {steps.length > PREVIEW_STEPS && (
          <button
            type="button"
            onClick={() => setShowAllSteps((v) => !v)}
            className="mb-4 flex w-full items-center justify-center gap-1.5 rounded-full border border-border/40 bg-background/40 py-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80 transition-colors hover:border-primary/30 hover:text-foreground/90"
          >
            {showAllSteps ? "Show less" : `Read all ${steps.length} steps`}
            <ChevronDown className={`h-3 w-3 transition-transform ${showAllSteps ? "rotate-180" : ""}`} />
          </button>
        )}

        {forbidden && (
          <div className="mb-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Ban className="h-3.5 w-3.5 text-destructive/80" />
              <p className="text-[10px] font-display tracking-[0.2em] uppercase text-destructive/80 font-semibold">
                This session you will NOT
              </p>
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed">{forbidden}</p>
          </div>
        )}

        {opener && (
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
            <Hand className="h-3.5 w-3.5 text-primary/80 mt-0.5 shrink-0" />
            <p className="text-xs text-foreground/85 leading-relaxed">
              <span className="text-[10px] font-display tracking-[0.2em] uppercase text-primary/80 font-semibold block mb-0.5">
                Before you begin
              </span>
              {opener}
            </p>
          </div>
        )}

        <Button onClick={onBegin} size="lg" className="w-full rounded-full">
          Begin <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </motion.div>
    </>
  );
}
