import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  BookOpen,
  Check,
  Diamond,
  Eye,
  Flame,
  HandHeart,
  Heart,
  MessageCircle,
  Minus,
  PencilLine,
  Sparkles,
  Wind,
} from "lucide-react";
import { getStepThreshold } from "@/lib/sessionThresholds";
import { getStepMaster } from "./stepRevolution";
import type { SessionStep, StepKind } from "@/lib/session-shell/types";

export type RailTone = "morning" | "midday" | "evening" | "night";

interface SessionProgressRailProps {
  steps: SessionStep[];
  cursor: number;
  completedIndices?: number[];
  skippedIndices?: number[];
  keystoneIndex?: number;
  className?: string;
  /** Tap a node to peek at its threshold. Off for the agenda overview. */
  showPeek?: boolean;
  /** Session seed so master faces rotate the same way the step cards do. */
  seed?: string;
  /** Dims the whole rail while the sitting is held. */
  paused?: boolean;
  /** Time-of-day accent: evening amber, morning sky, night violet. */
  tone?: RailTone;
}

const STEP_ICONS: Partial<Record<StepKind, React.ComponentType<{ className?: string }>>> = {
  "wisdom-read": BookOpen,
  scripture: BookOpen,
  breathwork: Wind,
  journal: PencilLine,
  "free_write": PencilLine,
  "micro-act": HandHeart,
  reflection: Heart,
  "guide-chat": MessageCircle,
  practice: Activity,
  "temple-chat": Flame,
  witness: Eye,
};

const TONE_ACCENT: Record<RailTone, { label: string; bar: string; line: string; glow: string }> = {
  morning: {
    label: "text-sky-300/90",
    bar: "from-sky-500/50 via-sky-400 to-sky-300/90",
    line: "bg-sky-400/60",
    glow: "shadow-[0_0_18px_-4px_rgba(56,189,248,0.65)]",
  },
  midday: {
    label: "text-emerald-300/90",
    bar: "from-emerald-500/50 via-emerald-400 to-emerald-300/90",
    line: "bg-emerald-400/60",
    glow: "shadow-[0_0_18px_-4px_rgba(52,211,153,0.6)]",
  },
  evening: {
    label: "text-amber-300/90",
    bar: "from-amber-500/50 via-amber-400 to-amber-300/90",
    line: "bg-amber-400/60",
    glow: "shadow-[0_0_18px_-4px_rgba(251,191,36,0.65)]",
  },
  night: {
    label: "text-indigo-300/90",
    bar: "from-indigo-500/50 via-indigo-400 to-indigo-300/90",
    line: "bg-indigo-400/60",
    glow: "shadow-[0_0_18px_-4px_rgba(129,140,248,0.65)]",
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function romanOf(n: number) {
  return ROMAN[n] ?? String(n);
}

/**
 * Horizontal threshold pipeline — the whole sitting at a glance.
 *
 * One node per step, in the order they will be crossed, joined by a filling
 * line. The current threshold breathes, crossed ones carry a check, skipped
 * ones stay open with a dash, and the keystone is drawn larger and tagged.
 * Each node wears the face of the master who holds that crossing. Tapping a
 * node peeks at its threshold so the sitter can orient without leaving the
 * step they are in.
 */
export function SessionProgressRail({
  steps,
  cursor,
  completedIndices = [],
  skippedIndices = [],
  keystoneIndex = -1,
  className,
  showPeek = true,
  seed,
  paused = false,
  tone,
}: SessionProgressRailProps) {
  const reducedMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const total = steps.length;
  const position = clamp(cursor, 0, total);
  const finished = total > 0 && position >= total;
  const percent = total > 0 ? Math.round((position / total) * 100) : 0;
  const remainingMinutes = useMemo(
    () =>
      steps
        .slice(Math.max(position, 0))
        .reduce((sum, step) => sum + (Number(step.est_minutes) || 0), 0),
    [steps, position],
  );
  const masters = useMemo(
    () => steps.map((step) => getStepMaster(step.kind, seed)),
    [steps, seed],
  );

  const currentThreshold = !finished && cursor >= 0 && cursor < total
    ? getStepThreshold(steps[cursor], cursor)
    : null;
  const accent = tone ? TONE_ACCENT[tone] : null;

  // The hinge, when it is one crossing away, gets named before it arrives.
  const hingeSoon = !finished && keystoneIndex > cursor && keystoneIndex - cursor === 1;
  const onHinge = !finished && keystoneIndex === cursor;

  // Keep the current threshold centred as the sitting advances.
  useEffect(() => {
    const track = trackRef.current;
    const node = nodeRefs.current[cursor];
    if (!track || !node) return;
    const left = node.offsetLeft - track.clientWidth / 2 + node.clientWidth / 2;
    try {
      track.scrollTo({
        left: Math.max(0, left),
        behavior: reducedMotion ? "auto" : "smooth",
      });
    } catch {
      track.scrollLeft = Math.max(0, left);
    }
  }, [cursor, total, reducedMotion]);

  // Moving on closes any peek that was left open.
  useEffect(() => {
    setOpenIndex(null);
  }, [cursor]);

  if (!total) return null;

  const peeked = openIndex != null ? steps[openIndex] : null;
  const peekedThreshold = openIndex != null && peeked ? getStepThreshold(peeked, openIndex) : null;
  const peekedMinutes = peeked ? Math.max(1, Math.round(Number(peeked.est_minutes) || 1)) : 0;
  const peekedMaster = openIndex != null ? masters[openIndex] : null;
  const peekedNextMaster = openIndex != null && openIndex + 1 < total ? masters[openIndex + 1] : null;

  return (
    <div className={`relative z-10 px-3 pt-2 sm:px-6 ${className ?? ""}`}>
      <div className="mx-auto w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl">
        <div
          className={
            "rounded-2xl border border-border/40 bg-background/70 px-3 py-2.5 shadow-sm backdrop-blur-md transition-all duration-300 sm:px-4 " +
            (paused ? "pointer-events-none opacity-45 saturate-50" : "")
          }
        >
          <div className="flex items-center justify-between gap-2 text-[10px] font-display uppercase tracking-[0.18em] text-muted-foreground/90 sm:text-[11px]">
            <span className={`truncate ${accent ? accent.label : "text-primary/90"}`}>
              {finished
                ? "All thresholds crossed"
                : currentThreshold
                  ? `Threshold ${currentThreshold.roman} of ${romanOf(total)} · ${currentThreshold.name}`
                  : `The path · ${total} thresholds`}
            </span>
            <span className="flex shrink-0 items-center gap-1.5 tabular-nums text-muted-foreground">
              {onHinge && (
                <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-primary">
                  hinge
                </span>
              )}
              {finished ? "complete" : `${remainingMinutes} min left`}
            </span>
          </div>

          <div
            className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-border/35"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={`${percent}% of the sitting crossed`}
            aria-label="Session progress"
          >
            <div
              className={
                "h-full rounded-full transition-all duration-700 ease-out " +
                (accent
                  ? `bg-gradient-to-r ${accent.bar}`
                  : "bg-gradient-to-r from-primary/55 via-primary to-primary/85")
              }
              style={{ width: `${percent}%` }}
            />
          </div>

          <div
            ref={trackRef}
            role="list"
            className="mt-2 flex items-start gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ scrollSnapType: "x proximity" }}
          >
            {steps.map((step, index) => {
              const isCurrent = index === cursor && !finished;
              const isSkipped = skippedIndices.includes(index);
              const isDone = !isSkipped && (completedIndices.includes(index) || index < cursor);
              const isKeystone = index === keystoneIndex;
              const crossed = isDone || index < cursor;
              const Icon = STEP_ICONS[step.kind] ?? Sparkles;
              const threshold = getStepThreshold(step, index);
              const isPeeked = openIndex === index;
              const master = masters[index];

              return (
                <div key={`${step.title}-${index}`} role="listitem" className="flex min-w-0 flex-1 items-start gap-1">
                  <button
                    ref={(el) => { nodeRefs.current[index] = el; }}
                    type="button"
                    onClick={() => showPeek && setOpenIndex(isPeeked ? null : index)}
                    aria-label={`${threshold.label}${master ? `, held by ${master.name}` : ""}${isDone ? " — crossed" : isSkipped ? " — not taken" : isCurrent ? " — you are here" : ""}`}
                    aria-current={isCurrent ? "step" : undefined}
                    aria-expanded={showPeek ? isPeeked : undefined}
                    className="group flex w-[72px] shrink-0 flex-col items-center gap-1 rounded-lg px-0.5 py-0.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/60"
                    style={{ scrollSnapAlign: "center" }}
                  >
                    <span className="relative flex h-10 w-10 items-center justify-center">
                      {isCurrent && !reducedMotion && (
                        <motion.span
                          aria-hidden
                          className="absolute inset-0 rounded-full border border-primary/40"
                          animate={{ scale: [1, 1.26, 1], opacity: [0.55, 0, 0.55] }}
                          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
                        />
                      )}
                      <span
                        className={
                          "relative flex items-center justify-center overflow-hidden rounded-full border bg-center bg-no-repeat transition-all duration-300 " +
                          (isKeystone ? "h-10 w-10 ring-1 ring-primary/35 ring-offset-1 ring-offset-background " : "h-8 w-8 ") +
                          (isCurrent
                            ? "border-primary/70 bg-primary/15 text-primary " + (accent ? accent.glow : "shadow-[0_0_18px_-4px_hsl(var(--primary)/0.7)]")
                            : isDone
                              ? "border-primary/25 bg-primary/10 text-primary/80"
                              : isSkipped
                                ? "border-border/40 border-dashed bg-transparent text-muted-foreground/40"
                                : "border-border/40 bg-background/40 text-muted-foreground/45")
                        }
                        style={master?.image ? { backgroundImage: `url(${master.image})`, backgroundSize: "cover" } : undefined}
                      >
                        <span
                          className={
                            "flex items-center justify-center rounded-full " +
                            (master?.image ? "bg-background/55 p-1 backdrop-blur-[1px] " : "") +
                            (isSkipped ? "opacity-50" : "")
                          }
                        >
                          {isDone ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : isSkipped ? (
                            <Minus className="h-3.5 w-3.5" />
                          ) : (
                            <Icon className="h-3.5 w-3.5" />
                          )}
                        </span>
                      </span>
                      {isKeystone && (
                        <Diamond
                          aria-hidden
                          className="absolute -right-0.5 top-0 h-2.5 w-2.5 fill-primary/80 text-primary/80"
                        />
                      )}
                    </span>
                    <span
                      className={
                        "w-full truncate text-center text-[11px] uppercase tracking-[0.06em] transition-colors " +
                        (isCurrent
                          ? "text-foreground/95"
                          : isDone
                            ? "text-muted-foreground/90"
                            : isSkipped
                              ? "text-muted-foreground/55"
                              : "text-muted-foreground/70")
                      }
                    >
                      {threshold.name}
                    </span>
                    {isKeystone && (
                      <span className="-mt-1 text-[7px] font-bold uppercase tracking-[0.16em] text-primary/80">
                        hinge
                      </span>
                    )}
                  </button>

                  {index < total - 1 && (
                    <span aria-hidden className="mt-[19px] h-px min-w-2 flex-1 overflow-hidden rounded-full bg-border/35">
                      <span
                        className={
                          "block h-full rounded-full transition-all duration-700 ease-out " +
                          (crossed ? "w-full " + (accent ? accent.line : "bg-primary/60") : "w-0")
                        }
                      />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <AnimatePresence initial={false}>
            {(hingeSoon || (showPeek && peeked && peekedThreshold)) && (
              <motion.div
                key={hingeSoon ? "hinge-soon" : `peek-${openIndex}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.22, ease: "easeOut" }}
                className="overflow-hidden"
              >
                {hingeSoon && !peekedThreshold ? (
                  <p className="mt-2 flex items-center gap-1.5 border-t border-border/30 pt-2 text-[11px] leading-snug text-primary/90">
                    <Diamond className="h-2.5 w-2.5 shrink-0" />
                    The hinge comes next — it will ask the most of you.
                  </p>
                ) : showPeek && peeked && peekedThreshold ? (
                  <div className="mt-2 border-t border-border/30 pt-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase tracking-[0.16em] text-primary/90">
                        {peekedThreshold.label}
                      </span>
                      <span className="text-[11px] tabular-nums text-muted-foreground/85">
                        ~{peekedMinutes}m
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-snug text-foreground/90">{peeked.title}</p>
                    <p className="text-[11px] italic leading-snug text-muted-foreground/85">
                      {peekedThreshold.essence}
                    </p>
                    {peekedMaster && (
                      <p className="mt-1 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground/80">
                        <span
                          aria-hidden
                          className="h-3.5 w-3.5 rounded-full border border-border/40 bg-cover bg-center"
                          style={{ backgroundImage: peekedMaster.image ? `url(${peekedMaster.image})` : undefined }}
                        />
                        held by {peekedMaster.name}
                        {peekedNextMaster && peekedNextMaster.id !== peekedMaster.id && (
                          <span className="opacity-80">· then hands to {peekedNextMaster.name.split(" ")[0]}</span>
                        )}
                      </p>
                    )}
                    <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground/75">
                      {openIndex != null && skippedIndices.includes(openIndex)
                        ? "Not taken — the door stays open"
                        : openIndex != null && completedIndices.includes(openIndex)
                          ? "Crossed"
                          : openIndex === cursor
                            ? "You are here"
                            : openIndex != null && openIndex < cursor
                              ? "Crossed"
                              : "Opens when you arrive"}
                    </p>
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Screen readers hear the crossing change without visual noise. */}
          <p aria-live="polite" aria-atomic="true" className="sr-only">
            {finished
              ? "All thresholds crossed."
              : currentThreshold
                ? `Now at ${currentThreshold.label}${masters[cursor] ? `, held by ${masters[cursor]?.name}` : ""}.`
                : "Session overview."}
          </p>
        </div>
      </div>
    </div>
  );
}
