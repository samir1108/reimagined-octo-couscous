/**
 * JourneyArc — "arc k baare me": where the user actually stands.
 *
 * Two honest modes, both driven by real data:
 *
 *  1. ARC MODE — an active row in `theme_arcs` (the 7/21/49-day walk around
 *     one intention). Shows the arc's title, chapter, phase, intention,
 *     its anchors (path · practice · chakra · master) and quiet progress.
 *
 *  2. THREAD MODE — no active arc; the day's theme is deepening across
 *     sittings (Living Theme Engine: current_depth → max_depth). Shows the
 *     thread's depth, the initiation ladder stage, and the next threshold.
 *
 * The card is garnish, never a blocker: on error or empty it simply stays
 * quiet (null) so Home never breaks because of it.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { motion, useReducedMotion } from "framer-motion";
import { Milestone, X } from "lucide-react";
import { getLadderProgress, getLadderRung } from "@/lib/initiationLadder";
import type { JourneyTheme } from "./TodaysJourney";
import JourneySpiral from "./JourneySpiral";

const EASE = [0.16, 1, 0.3, 1] as const;

interface ArcRow {
  title: string;
  intention: string | null;
  duration_days: number | null;
  current_day: number | null;
  current_phase: string | null;
  primary_path: string | null;
  primary_practice: string | null;
  primary_chakra: string | null;
  assigned_guru: string | null;
}

interface Props {
  theme: JourneyTheme | null;
  totalSessions: number;
  gateAccent: string;
}

const PHASE_LABELS: Record<string, string> = {
  ground: "Grounding",
  grounding: "Grounding",
  deepen: "Deepening",
  deepening: "Deepening",
  integrate: "Integration",
  integration: "Integration",
  harvest: "Harvest",
  harvested: "Harvested",
};

function phaseLabel(phase: string | null | undefined): string {
  const p = String(phase || "").toLowerCase();
  return PHASE_LABELS[p] || (p ? p.charAt(0).toUpperCase() + p.slice(1) : "");
}

function titleCase(v: string): string {
  return v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** The small models occasionally emit "undefined"/"null" — never speak it. */
const JUNK_TEXT = /^(undefined|null|n\/?a|none|nan)$/i;

function cleanText(v: unknown): string {
  if (typeof v !== "string") return "";
  const s = v.trim();
  return s && !JUNK_TEXT.test(s) ? s : "";
}

interface ArcEcho {
  id: string;
  echo_type: string;
  scheduled_for: string;
  message_seed: string | null;
  metadata: { arc_title?: string; [k: string]: unknown } | null;
}

function useActiveArc() {
  return useQuery<ArcRow | null>({
    queryKey: ["home-active-arc"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("theme_arcs")
        .select(
          "title, intention, duration_days, current_day, current_phase, primary_path, primary_practice, primary_chakra, assigned_guru",
        )
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data || null;
    },
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
}

/** The oldest due, undelivered echo — "Remember X? You walked it 30 days ago." */
function useDueArcEcho(enabled: boolean) {
  return useQuery<ArcEcho | null>({
    queryKey: ["home-arc-echo"],
    enabled,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("arc_echoes")
        .select("id, echo_type, scheduled_for, message_seed, metadata")
        .eq("user_id", user.id)
        .eq("delivered", false)
        .lte("scheduled_for", today)
        .order("scheduled_for", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data || null;
    },
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
}

export default function JourneyArc({ theme, totalSessions, gateAccent }: Props) {
  const reduceMotion = useReducedMotion();
  const { data: arc, isLoading } = useActiveArc();
  const { data: echo } = useDueArcEcho(!isLoading);
  const [echoDismissed, setEchoDismissed] = useState(false);
  const ladder = getLadderRung(totalSessions + 1);
  const ladderProgress = getLadderProgress(totalSessions);

  if (isLoading) return null;

  const echoSeed = echo?.message_seed?.trim() || "";
  const dismissedBefore = (() => {
    if (!echo?.id) return false;
    try {
      return localStorage.getItem(`arc-echo-dismissed-${echo.id}`) === "1";
    } catch {
      return false;
    }
  })();
  const showEcho = !!echo && !echoDismissed && !dismissedBefore && echoSeed.length > 0;
  const dismissEcho = () => {
    setEchoDismissed(true);
    try {
      if (echo?.id) localStorage.setItem(`arc-echo-dismissed-${echo.id}`, "1");
    } catch {
      /* dismissal is memory-only when storage is unavailable */
    }
  };

  const echoNode = showEcho ? (
    <div className="mb-3 flex items-start justify-between gap-2 rounded-xl border border-violet-400/20 bg-violet-400/[0.05] px-3.5 py-2.5">
      <p className="text-[11px] italic leading-[1.6] text-violet-100/70">
        <span aria-hidden className="mr-1.5 not-italic">🕯️</span>
        {echoSeed}
      </p>
      <button
        type="button"
        onClick={dismissEcho}
        aria-label="Dismiss echo"
        className="mt-0.5 flex-shrink-0 text-muted-foreground/40 transition-colors hover:text-foreground/70"
      >
        <X className="h-3 w-3" aria-hidden />
      </button>
    </div>
  ) : null;

  // ── ARC MODE — a real multi-day walk exists ────────────────────────────────
  if (arc && cleanText(arc.title)) {
    const day = Math.max(1, Number(arc.current_day) || 1);
    const recordedDuration = Number(arc.duration_days);
    const total = Number.isFinite(recordedDuration) && recordedDuration > 0
      ? Math.max(day, recordedDuration)
      : null;
    const progress = total === null ? null : Math.max(0, Math.min(1, day / total));
    const daysLeft = total === null ? null : Math.max(0, total - day);
    const phase = phaseLabel(arc.current_phase) || "In motion";

    const chips = [
      arc.primary_path ? titleCase(arc.primary_path) : null,
      arc.primary_practice ? titleCase(arc.primary_practice) : null,
      arc.primary_chakra ? titleCase(arc.primary_chakra) : null,
      arc.assigned_guru ? `With ${arc.assigned_guru}` : null,
    ].filter(Boolean) as string[];

    return (
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.6, ease: EASE, delay: reduceMotion ? 0 : 0.18 }}
        aria-label="Your arc"
        className="w-full rounded-2xl border border-border/30 bg-card/40 px-5 py-4"
        style={{ borderTop: `1px solid hsl(${gateAccent} / 0.25)` }}
      >
        {echoNode}
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[9px] font-display tracking-[0.28em] uppercase text-primary/70">
            The arc
          </p>
          <p className="text-[9px] font-display tracking-[0.18em] uppercase text-muted-foreground/45 tabular-nums">
            Day {day}{total === null ? "" : ` of ${total}`} · {phase}
          </p>
        </div>

        <h3 className="mt-1.5 text-[16px] font-display font-semibold leading-snug text-foreground/85">
          {cleanText(arc.title)}
        </h3>

        {cleanText(arc.intention) && (
          <p className="mt-1 text-[11.5px] italic leading-[1.6] text-foreground/55">
            “{cleanText(arc.intention)}”
          </p>
        )}

        {progress !== null && daysLeft !== null && (
          <div className="mt-3 flex items-center gap-3">
            <JourneySpiral
              progress={progress}
              label={`Journey arc progress: day ${day} of ${total}, ${Math.round(progress * 100)} percent`}
              size={76}
            />
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-2 text-[10px] text-muted-foreground/60">
                <span>Arc progress</span>
                <span className="tabular-nums">{Math.round(progress * 100)}%</span>
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted/40">
                <div
                  className="h-full rounded-full bg-primary/60 transition-[width] duration-700"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground/55">
                {daysLeft > 0 ? `${daysLeft} sitting${daysLeft === 1 ? "" : "s"} to the harvest` : "The harvest is here"}
              </p>
            </div>
          </div>
        )}

        {/* Anchors — path · practice · chakra · master */}
        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {chips.map((chip, i) => (
              <span
                key={i}
                className="rounded-full border border-border/30 bg-card/40 px-2.5 py-0.5 text-[9px] font-display tracking-[0.14em] uppercase text-muted-foreground/60"
              >
                {chip}
              </span>
            ))}
          </div>
        )}

        {/* What an arc is — one quiet line */}
        <p className="mt-3 border-t border-border/30 pt-2.5 text-[10px] leading-relaxed text-muted-foreground/45">
          An arc is a long walk around one intention — every sitting is a chapter,
          and the harvest day completes it.
          {daysLeft === null
            ? " Stay with the intention one sitting at a time."
            : daysLeft > 0
              ? ` ${daysLeft} sitting${daysLeft === 1 ? "" : "s"} remain.`
              : " The harvest is here."}
        </p>
      </motion.section>
    );
  }

  // ── THREAD MODE — the theme deepens across sittings ────────────────────────
  const maxDepth = Number(theme?.max_depth ?? 0);
  const currentDepth = Number(theme?.current_depth ?? theme?.sequence_no ?? 1);
  const hasThread = maxDepth > 1 && !!theme;
  const progress = hasThread
    ? Math.max(0, Math.min(1, currentDepth / maxDepth))
    : null;
  const nextMilestone = ladderProgress.nextMilestone ?? ladder.nextMilestone;
  const journeyProgress = progress ?? (
    ladderProgress.nextMilestone ? ladderProgress.progress : null
  );
  const journeyProgressLabel = hasThread
    ? `Theme thread progress: sitting ${Math.max(1, currentDepth)} of ${maxDepth}`
    : nextMilestone
      ? `${totalSessions} of ${nextMilestone.count} sittings toward ${nextMilestone.name}`
      : `${totalSessions} completed sittings`;

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.6, ease: EASE, delay: reduceMotion ? 0 : 0.18 }}
      aria-label="Your path"
      className="w-full rounded-2xl border border-border/30 bg-card/40 px-5 py-4"
        style={{ borderTop: `1px solid hsl(${gateAccent} / 0.25)` }}
      >
        {echoNode}
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[9px] font-display tracking-[0.28em] uppercase text-primary/70">
            The path
          </p>
        {hasThread ? (
          <p className="text-[9px] font-display tracking-[0.18em] uppercase text-muted-foreground/45 tabular-nums">
            Sitting {Math.max(1, currentDepth)} of {maxDepth}
          </p>
        ) : (
          <p className="text-[9px] font-display tracking-[0.18em] uppercase text-muted-foreground/45 tabular-nums">
            {totalSessions} sitting{totalSessions === 1 ? "" : "s"} so far
          </p>
        )}
      </div>

      <h3 className="mt-1.5 text-[16px] font-display font-semibold leading-snug text-foreground/85">
        {ladder.stage}
      </h3>

      {journeyProgress !== null && (
        <div className="mt-3 flex items-center gap-3">
          <JourneySpiral
            progress={journeyProgress}
            label={`Journey progress: ${journeyProgressLabel}`}
            size={76}
          />
          <div className="min-w-0 flex-1">
            <div className="flex justify-between gap-2 text-[10px] text-muted-foreground/60">
              <span>{hasThread ? "Theme thread" : "Next threshold"}</span>
              <span className="tabular-nums">{Math.round(journeyProgress * 100)}%</span>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted/40">
              <div
                className="h-full rounded-full bg-primary/60 transition-[width] duration-700"
                style={{ width: `${Math.round(journeyProgress * 100)}%` }}
              />
            </div>
            {!hasThread && nextMilestone && (
              <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground/55">
                {Math.max(0, nextMilestone.count - totalSessions)} sitting{nextMilestone.count - totalSessions === 1 ? "" : "s"} to {nextMilestone.name}
              </p>
            )}
          </div>
        </div>
      )}

      <p className="mt-3 text-[10.5px] leading-relaxed text-foreground/55">
        {hasThread
          ? "Your theme deepens across sittings — each return lands one layer beneath the last, until the thread seals."
          : "Every sitting belongs to a stage of the ascent. The ladder is climbed one honest sitting at a time."}
      </p>

      {nextMilestone && (
        <p className="mt-2 flex items-center gap-1.5 text-[9.5px] font-display tracking-[0.16em] uppercase text-muted-foreground/45">
          <Milestone className="h-3 w-3 text-primary/50" aria-hidden />
          Next threshold · {nextMilestone.name} at {nextMilestone.count} sittings
        </p>
      )}
    </motion.section>
  );
}
