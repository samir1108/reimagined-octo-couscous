/**
 * TodaysJourney — the reason to return.
 *
 * An editorial card over the real journey data: the day's theme row
 * (daily_themes, with the Living Theme Engine's arc fields), the journey day
 * from the consciousness engine, and the persisted mission-kept record.
 *
 * Lifecycle states, all driven by the backend:
 *   error      — theme fetch failed → honest retry
 *   new user   — no theme yet → a welcoming first threshold
 *   composing  — generate-theme is weaving the day
 *   active     — theme · arc progress · intention · why · do · let go ·
 *                yogic lens · the day's scroll · continue
 *   sealed     — thread complete → completion + explicit next-thread action
 *   rest       — the arc asks for integration, not effort
 *   harvest    — the arc's harvest chapter
 *   cool-down  — exhaustion handler asks the user to integrate
 *   session    — an active generative session exists → return to it first
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, ArrowRight, RotateCcw, Check, PauseCircle, Flower2, ChevronDown, ScrollText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { playSoundEffect } from "@/lib/soundEffects";
import { hapticBreakthrough } from "@/lib/haptics";
import type { Session } from "@/types/database";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Loose shape of the daily theme row + Living-Theme-Engine fields. */
export interface JourneyTheme {
  id?: string;
  title?: string;
  description?: string | null;
  sub_angle?: string | null;
  felt_sense_opener?: string | null;
  theme_rationale?: string | { whyToday?: string; summary?: string; reason?: string } | null;
  action_items?: string[] | null;
  daily_intentions?: string[] | null;
  learning_focus?: string | null;
  sequence_no?: number | null;
  current_depth?: number | null;
  max_depth?: number | null;
  evolution_status?: string | null;
  spiral_marker?: string | null;
  _composing?: boolean;
  // v4 transformational fields (written by generate-theme)
  affirmation?: string | null;
  forbidden_thing?: string | null;
  resistance_warning?: string | null;
  inner_inquiry?: string | null;
  real_life_trigger?: string | null;
  integration?: string | null;
  micro_practice?: { title?: string; why?: string; [k: string]: unknown } | null;
  micro_prompt?: string | null;
  evening_close?: string | null;
  tradition_lens?: { sanskrit?: string; translation?: string; why_today?: string } | null;
  chakra_focus?: { sanskrit?: string; english?: string; opening_practice?: string } | null;
  yesterday_bridge?: string | null;
}

interface Props {
  theme: JourneyTheme | null;
  isError: boolean;
  onRetry: () => void;
  sessions: Session[];
  journeyDay: number;
  gateAccent: string;
  isCooldown: boolean;
  activeSessionId: string | null;
  onResumeSession: () => void;
  onStartSitting: () => void;
  onBeginNextThread: () => void;
  nextThreadPending: boolean;
  /** Today's master — name + voice, when the engine or program has chosen one. */
  guru?: { name: string; title?: string; quote?: string } | null;
  /** Days since the last session (from generate-theme) — 2+ shows the re-entry note. */
  gapDays?: number;
  /** The engine's recalibration line for re-entry days. */
  recalibrationNote?: string;
  /** Active program label, e.g. "Foundation · Day 12" — replaces the eyebrow. */
  programLabel?: string;
}

/** The small theme models occasionally emit "undefined"/"null" — never speak it. */
const JUNK_TEXT = /^(undefined|null|n\/?a|none|nan)$/i;

function cleanText(v: unknown): string {
  if (typeof v !== "string") return "";
  const s = v.trim();
  return s && !JUNK_TEXT.test(s) ? s : "";
}

function cleanList(v: unknown): string[] {
  return (Array.isArray(v) ? v : []).map(cleanText).filter(Boolean);
}

/** Blessings spoken when the intention is kept — deterministic per theme+day. */
const BLESSINGS = [
  "The temple saw this. The merit is yours alone.",
  "One vow kept. The mind was watched — and knew it was watched.",
  "This is how the current turns: one kept promise at a time.",
  "Kept. Carry it into the next hour; the practice begins again there.",
  "The diya stays lit. Tomorrow will stand on what you did today.",
  "Said and done. The day now carries the shape you gave it.",
  "Small, honest, complete. This is the whole path, compressed.",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const todayKey = () => new Date().toISOString().split("T")[0];

interface MissionRecord {
  themeId: string;
  completedAt: string;
}

function readMissionRecord(): MissionRecord | null {
  try {
    const raw = localStorage.getItem(`hope-mission-${todayKey()}`);
    return raw ? (JSON.parse(raw) as MissionRecord) : null;
  } catch {
    return null;
  }
}

function writeMissionRecord(rec: MissionRecord) {
  try {
    localStorage.setItem(`hope-mission-${todayKey()}`, JSON.stringify(rec));
  } catch {
    /* storage quota exceeded — completion stays for this session only */
  }
}

export default function TodaysJourney({
  theme,
  isError,
  onRetry,
  sessions,
  journeyDay,
  gateAccent,
  isCooldown,
  activeSessionId,
  onResumeSession,
  onStartSitting,
  onBeginNextThread,
  nextThreadPending,
  guru,
  gapDays,
  recalibrationNote,
  programLabel,
}: Props) {
  const [record, setRecord] = useState<MissionRecord | null>(readMissionRecord);
  const [scrollOpen, setScrollOpen] = useState(false);

  const completedToday = sessions.filter((s) => s.status === "completed").length;

  // ── Error — the temple is unreachable; never fabricate a day ──────────────
  if (isError) {
    return (
      <section className="w-full rounded-2xl border border-border/30 bg-card/40 px-5 py-6 text-center">
        <p className="text-[9px] font-display tracking-[0.28em] uppercase text-muted-foreground/60">
          Today's journey
        </p>
        <p className="mt-2 text-[12px] text-foreground/60 leading-relaxed">
          The day could not be reached. Nothing has been lost.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-[10px] font-display tracking-[0.2em] uppercase text-primary hover:bg-primary/20 transition-colors"
        >
          <RotateCcw className="h-3 w-3" aria-hidden />
          Try again
        </button>
      </section>
    );
  }

  // ── New user — no theme has ever been woven ────────────────────────────────
  if (!theme) {
    return (
      <section className="w-full rounded-2xl border border-border/30 bg-card/40 px-5 py-6 text-center">
        <p className="text-[9px] font-display tracking-[0.28em] uppercase text-primary/70">
          Your journey
        </p>
        <h2 className="mt-2 text-[19px] font-display font-semibold leading-snug text-foreground/90">
          Every path begins with one honest sitting
        </h2>
        <p className="mt-1.5 text-[12px] text-foreground/55 leading-relaxed max-w-xs mx-auto">
          Hold the orb when you are ready. The first thread will be woven around
          where you actually are.
        </p>
        <button
          type="button"
          onClick={onStartSitting}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-[10px] font-display tracking-[0.22em] uppercase text-primary hover:bg-primary/20 transition-colors"
        >
          Begin your first journey
          <ArrowRight className="h-3 w-3" aria-hidden />
        </button>
      </section>
    );
  }

  const t = theme;

  // ── Composing — the day is being woven ────────────────────────────────────
  if (t._composing === true) {
    return (
      <section className="w-full rounded-2xl border border-border/30 bg-card/40 px-5 py-6 text-center">
        <div className="flex items-center justify-center gap-3">
          <motion.div
            aria-hidden
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary/80"
          />
          <div className="text-left">
            <p className="text-[9px] font-display tracking-[0.25em] uppercase text-amber-200/60">
              Your journey is being woven
            </p>
            <p className="text-[12px] text-foreground/70 mt-0.5">
              Today's thread is being prepared for you.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ── Theme fields, cleaned ──────────────────────────────────────────────────
  const title = cleanText(t.title) || "Today's theme";
  const essence = cleanText(t.sub_angle) || cleanText(t.felt_sense_opener);
const essenceDisplay = essence.replace(/^["“”'‘’]+/, "").replace(/["“”'‘’]+$/, "").trim() || essence;
  const description = cleanText(t.description);
  const whyText = (() => {
    const r = t.theme_rationale;
    if (typeof r === "string") return cleanText(r);
    return cleanText(r?.whyToday) || cleanText(r?.summary) || cleanText(r?.reason);
  })();
  const intention =
    cleanList(t.daily_intentions)[0] || cleanList(t.action_items)[0] || "";

  // ── The day's concrete guidance (v4 fields, all optional) ─────────────────
  const actions = cleanList(t.action_items).slice(0, 3);
  const forbidden = cleanText(t.forbidden_thing);
  const resistance = cleanText(t.resistance_warning);
const inquiry = cleanText(t.inner_inquiry).replace(/^["“”'‘’]+/, "").replace(/["“”'‘’]+$/, "").trim();
const trigger = cleanText(t.real_life_trigger);
const integration = cleanText(t.integration);
const bridge = cleanText(t.yesterday_bridge);
const affirmation = cleanText(t.affirmation).replace(/^["“”'‘’]+/, "").replace(/["“”'‘’]+$/, "").trim();
const eveningClose = cleanText(t.evening_close).replace(/^["“”'‘’]+/, "").replace(/["“”'‘’]+$/, "").trim();
  const spiralNote = cleanText(t.spiral_marker);
  const microPracticeTitle = cleanText(t.micro_practice?.title);
  const microPracticeWhy = cleanText(t.micro_practice?.why);
  const lens = t.tradition_lens && typeof t.tradition_lens === "object"
    ? {
        sanskrit: cleanText(t.tradition_lens.sanskrit),
        translation: cleanText(t.tradition_lens.translation),
        whyToday: cleanText(t.tradition_lens.why_today),
      }
    : null;
  const chakra = t.chakra_focus && typeof t.chakra_focus === "object"
    ? {
        sanskrit: cleanText(t.chakra_focus.sanskrit),
        english: cleanText(t.chakra_focus.english),
        openingPractice: cleanText(t.chakra_focus.opening_practice),
      }
    : null;

  const hasScroll = !!(
    bridge || trigger || resistance || inquiry || integration ||
    microPracticeTitle || eveningClose || affirmation || spiralNote ||
    (guru?.quote && cleanText(guru.quote))
  );

  // ── Arc state ─────────────────────────────────────────────────────────────
  const maxDepth = Number(t.max_depth ?? 0);
  const currentDepth = Number(t.current_depth ?? t.sequence_no ?? 1);
  const isSealed =
    t.evolution_status === "closed" || (maxDepth > 0 && currentDepth >= maxDepth);
  const marker = String(t.spiral_marker || "").toLowerCase();
  const isHarvest = !isSealed && marker === "harvest";
  const isRest = !isSealed && marker === "rest";

  const arcLabel = isSealed
    ? "Thread sealed"
    : isHarvest
      ? "Harvest day"
      : isRest
        ? "Rest chapter"
        : maxDepth > 1
          ? `Sitting ${Math.max(1, currentDepth)} of ${maxDepth}`
          : "One-sitting thread";

  const missionRecord = !!record && !!t.id && record.themeId === t.id;
  const blessing = BLESSINGS[hashString(`${t.id ?? title}|${todayKey()}`) % BLESSINGS.length];

  const keepIntention = () => {
    if (missionRecord) return;
    hapticBreakthrough();
    playSoundEffect("threshold");
    const rec: MissionRecord = {
      themeId: t.id ?? title ?? todayKey(),
      completedAt: new Date().toISOString(),
    };
    setRecord(rec);
    writeMissionRecord(rec);
    toast({ title: "Intention kept", description: blessing });
  };

  const progressPct =
    maxDepth > 1 ? Math.max(0, Math.min(1, currentDepth / maxDepth)) : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: EASE, delay: 0.1 }}
      className="relative w-full overflow-hidden rounded-2xl border border-border/30 bg-card/40"
      style={{ borderTop: `2px solid hsl(${gateAccent} / 0.45)` }}
    >
      {/* Candlelight under the gate line */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-14 left-1/2 h-28 w-64 -translate-x-1/2 rounded-full"
        style={{
          background: `radial-gradient(ellipse, hsl(${gateAccent} / 0.10) 0%, transparent 70%)`,
          filter: "blur(24px)",
        }}
      />

      <div className="relative px-5 sm:px-6 pt-5 pb-4">
        {/* Eyebrow — program (or day) + arc */}
        <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
          <p className="text-[9px] font-display tracking-[0.3em] uppercase text-primary/70">
            {programLabel || `Your journey · Day ${journeyDay}`}
          </p>
          <span className="text-[9px] font-display tracking-[0.18em] uppercase text-muted-foreground/45">
            {arcLabel}
          </span>
        </div>

        {/* Re-entry — honest welcome after a gap, no guilt */}
        {(gapDays ?? 0) >= 2 && (
          <p className="mx-auto mt-2 max-w-sm text-center text-[11px] italic leading-relaxed text-amber-200/55">
            {recalibrationNote ||
              `Welcome back after ${gapDays} days. No guilt, no rush — the thread is still here.`}
          </p>
        )}

        {/* Title + essence */}
        <h2 className="mt-2.5 text-center text-[22px] sm:text-[26px] font-display font-semibold leading-tight tracking-tight text-foreground/90">
          {title}
        </h2>
        {essenceDisplay && (
          <p className="mt-1 text-center text-[11px] italic leading-snug text-foreground/50">
            “{essenceDisplay}”
          </p>
        )}

        {/* Arc progress — a quiet hairline, only when the journey is deep */}
        {progressPct !== null && !isSealed && (
          <div className="mx-auto mt-3 h-px w-44 overflow-hidden rounded-full bg-muted/40">
            <div
              className="h-full rounded-full bg-primary/50"
              style={{ width: `${Math.round(progressPct * 100)}%` }}
            />
          </div>
        )}

        {/* Intention */}
        {intention && (
          <div className="mt-4 text-center">
            <p className="text-[8px] font-display tracking-[0.28em] uppercase text-muted-foreground/45">
              Today's intention
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-foreground/85">{intention}</p>
          </div>
        )}

        {/* Why this matters — full text on demand, never silently cut */}
        {whyText && (
          <div className="mt-3.5 text-center">
            <p className="text-[8px] font-display tracking-[0.28em] uppercase text-muted-foreground/45">
              Why this matters
            </p>
            <Expandable lines={3} textClass="text-foreground/60">{whyText}</Expandable>
          </div>
        )}

        {/* What you'll explore */}
        {description && (
          <div className="mt-3.5 text-center">
            <p className="text-[8px] font-display tracking-[0.28em] uppercase text-muted-foreground/45">
              What you'll explore
            </p>
            <Expandable lines={2} textClass="text-foreground/60">{description}</Expandable>
          </div>
        )}

        {/* Do today — concrete micro-actions, straight from the theme row */}
        {actions.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-[8px] font-display tracking-[0.28em] uppercase text-primary/60">
              Do today
            </p>
            <ul className="mx-auto mt-1.5 max-w-md space-y-1.5 text-left">
              {actions.map((a, i) => (
                <li key={i} className="flex gap-2.5 text-[12px] leading-[1.55] text-foreground/70">
                  <span aria-hidden className="mt-[7px] h-1 w-1 flex-shrink-0 rounded-full bg-primary/50" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Let go of today — the fast from a pattern (forbidden_thing) */}
        {forbidden && (
          <div className="mt-4 text-center">
            <p className="text-[8px] font-display tracking-[0.28em] uppercase text-rose-300/60">
              Let go of today
            </p>
            <Expandable lines={2} textClass="text-rose-100/60">{forbidden}</Expandable>
          </div>
        )}

        {/* The yogic lens — sutra + chakra, straight from tradition_lens/chakra_focus */}
        {(lens || chakra) && (
          <div className="mt-4 text-center">
            <p className="text-[8px] font-display tracking-[0.28em] uppercase text-amber-200/55">
              The yogic lens
            </p>
            {lens?.sanskrit && (
              <p className="mt-1.5 font-sacred text-[16px] leading-relaxed text-primary/85">
                {lens.sanskrit}
              </p>
            )}
            {lens?.translation && (
              <p className="mx-auto mt-1 max-w-md text-[11.5px] leading-[1.6] text-foreground/60">
                {lens.translation}
              </p>
            )}
            {lens?.whyToday && (
              <p className="mx-auto mt-1 max-w-md text-[11px] leading-[1.6] text-muted-foreground/55">
                Why this lens — {lens.whyToday}
              </p>
            )}
            {chakra && (
              <div className="mt-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/[0.06] px-3 py-1 text-[9px] font-display tracking-[0.18em] uppercase text-amber-200/75">
                  {chakra.sanskrit || "Chakra"}{chakra.english ? ` · ${chakra.english}` : ""}
                </span>
                {chakra.openingPractice && (
                  <p className="mx-auto mt-1.5 max-w-md text-[11px] leading-[1.6] text-foreground/55">
                    {chakra.openingPractice}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* The day's scroll — the rest of what the day carries, folded by default */}
        {hasScroll && (
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => setScrollOpen((v) => !v)}
              aria-expanded={scrollOpen}
              className="inline-flex items-center gap-1.5 text-[9px] font-display tracking-[0.22em] uppercase text-muted-foreground/50 transition-colors hover:text-primary/80"
            >
              <ScrollText className="h-2.5 w-2.5" aria-hidden />
              {scrollOpen ? "Fold the day's scroll" : "Open the day's scroll"}
              <ChevronDown
                className="h-3 w-3 transition-transform duration-300"
                style={{ transform: scrollOpen ? "rotate(180deg)" : undefined }}
                aria-hidden
              />
            </button>

            <AnimatePresence initial={false}>
              {scrollOpen && (
                <motion.div
                  key="scroll"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="mx-auto mt-4 max-w-md space-y-4 border-t border-border/30 pt-4 text-left">
                    {bridge && (
                      <ScrollBlock label="The thread so far">{bridge}</ScrollBlock>
                    )}
                    {trigger && (
                      <ScrollBlock label="Where it will meet you">{trigger}</ScrollBlock>
                    )}
                    {resistance && (
                      <ScrollBlock label="The mind will say">{resistance}</ScrollBlock>
                    )}
                    {inquiry && (
                      <ScrollBlock label="Sit with this question">
                        <span className="italic text-foreground/75">“{inquiry}”</span>
                      </ScrollBlock>
                    )}
                    {microPracticeTitle && (
                      <ScrollBlock label="Micro-practice">
                        <span className="text-foreground/80">{microPracticeTitle}</span>
                        {microPracticeWhy && (
                          <span className="block mt-0.5 text-foreground/55">{microPracticeWhy}</span>
                        )}
                      </ScrollBlock>
                    )}
                    {integration && (
                      <ScrollBlock label="Carry it into life">{integration}</ScrollBlock>
                    )}
                    {eveningClose && (
                      <ScrollBlock label="When the day closes">
                        <span className="italic text-foreground/70">“{eveningClose}”</span>
                      </ScrollBlock>
                    )}
                    {affirmation && (
                      <ScrollBlock label="The vow">
                        <span className="italic text-primary/70">“{affirmation}”</span>
                      </ScrollBlock>
                    )}
                    {spiralNote && (
                      <ScrollBlock label="An older teaching returns">{spiralNote}</ScrollBlock>
                    )}
                    {guru && (cleanText(guru.quote) || cleanText(guru.name)) && (
                      <div className="pt-1 text-center">
                        <p className="text-[8px] font-display tracking-[0.28em] uppercase text-muted-foreground/45">
                          The master's voice
                        </p>
                        {cleanText(guru.quote) && (
                          <p className="mx-auto mt-1.5 max-w-md text-[12.5px] italic leading-[1.65] text-foreground/75">
                            “{cleanText(guru.quote)}”
                          </p>
                        )}
                        <p className="mt-1.5 text-[9px] font-display tracking-[0.18em] uppercase text-muted-foreground/50">
                          — {cleanText(guru.name)}{cleanText(guru.title) ? `, ${cleanText(guru.title)}` : ""}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Cool-down — the exhaustion handler asks for integration, not effort */}
        {isCooldown && !isSealed && (
          <p className="mx-auto mt-4 max-w-sm text-center text-[11px] italic leading-relaxed text-amber-200/60">
            You have given much today. Let this sitting be brief — or let today be rest.
          </p>
        )}

        {/* Continuation */}
        <div className="mt-5 flex flex-col items-center gap-2.5">
          {isSealed ? (
            <>
              <div className="flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/[0.08] px-3 py-1">
                <Flower2 className="h-3 w-3 text-amber-300/80" aria-hidden />
                <span className="text-[9px] font-display tracking-[0.2em] uppercase text-amber-200/80">
                  Journey complete
                </span>
              </div>
              <button
                type="button"
                onClick={onBeginNextThread}
                disabled={nextThreadPending}
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-[10px] font-display tracking-[0.22em] uppercase text-primary hover:bg-primary/20 transition-colors disabled:opacity-60"
              >
                {nextThreadPending ? (
                  <motion.span
                    aria-hidden
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                    className="h-3 w-3 rounded-full border border-primary/30 border-t-primary/80"
                  />
                ) : (
                  <ArrowRight className="h-3 w-3" aria-hidden />
                )}
                {nextThreadPending ? "Weaving the next thread" : "Begin the next journey"}
              </button>
            </>
          ) : null}

          {!isSealed && (
            <button
              type="button"
              onClick={() => {
                if (activeSessionId) {
                  onResumeSession();
                  return;
                }
                onStartSitting();
              }}
              disabled={nextThreadPending}
              className="group inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-6 py-2.5 text-[11px] font-display tracking-[0.22em] uppercase text-primary hover:bg-primary/20 transition-colors disabled:opacity-60"
            >
              {activeSessionId
                ? "Return to your sitting"
                : completedToday > 0
                  ? "Sit again"
                  : isRest
                    ? "Sit lightly"
                    : "Continue journey"}
              <ArrowRight
                className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </button>
          )}

          {/* Keep the intention — persisted per day + theme, never gamified */}
          {intention && !isSealed && (
            <AnimatePresence mode="wait" initial={false}>
              {missionRecord ? (
                <motion.div
                  key="kept"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[9px] font-display tracking-[0.2em] uppercase text-amber-300/90">
                    <Check className="h-2.5 w-2.5" aria-hidden />
                    Intention kept
                  </span>
                  <p className="max-w-xs text-center text-[10px] italic leading-relaxed text-amber-200/55">
                    “{blessing}”
                  </p>
                </motion.div>
              ) : (
                <motion.button
                  key="keep"
                  type="button"
                  onClick={keepIntention}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="inline-flex items-center gap-1.5 text-[9px] font-display tracking-[0.2em] uppercase text-muted-foreground/50 hover:text-primary/80 transition-colors"
                >
                  <Flame className="h-2.5 w-2.5" aria-hidden />
                  I kept this today
                </motion.button>
              )}
            </AnimatePresence>
          )}

          {isRest && !missionRecord && (
            <p className="inline-flex items-center gap-1 text-[9px] text-muted-foreground/40">
              <PauseCircle className="h-2.5 w-2.5" aria-hidden />
              A rest chapter — arrive, listen, do little.
            </p>
          )}
        </div>
      </div>
    </motion.section>
  );
}

/**
 * Expandable — text that never gets silently cut.
 *
 * Short text renders whole (no toggle, nothing to do). Long text clamps to
 * `lines` and reveals a tiny Read more toggle; open shows every word,
 * with Show less to fold it back. The clamp state is measured, not
 * assumed, so it adapts to any screen width.
 */
function Expandable({
  lines,
  textClass,
  children,
}: {
  lines: number;
  textClass: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [clamped, setClamped] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (open) return;
    const el = ref.current;
    if (!el) return;
    const check = () => setClamped(el.scrollHeight > el.clientHeight + 2);
    check();
    if (typeof ResizeObserver === "undefined") return () => {};
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, children]);

  return (
    <div className="mx-auto mt-1 max-w-md">
      <p
        ref={ref}
        className={`text-[12px] leading-[1.6] ${textClass}`}
        style={{
          display: "-webkit-box",
          WebkitLineClamp: open ? "unset" : lines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {children}
      </p>
      {clamped && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-1 inline-flex items-center gap-1 text-[9px] font-display tracking-[0.22em] uppercase text-muted-foreground/50 transition-colors hover:text-primary/80"
        >
          {open ? "Show less" : "Read more"}
          <ChevronDown
            className="h-3 w-3 transition-transform duration-300"
            style={{ transform: open ? "rotate(180deg)" : undefined }}
            aria-hidden
          />
        </button>
      )}
    </div>
  );
}

/** One quiet labelled block inside the day's scroll. */
function ScrollBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[8px] font-display tracking-[0.28em] uppercase text-muted-foreground/45">
        {label}
      </p>
      <div className="mt-1 text-[11.5px] leading-[1.65] text-foreground/65">{children}</div>
    </div>
  );
}
