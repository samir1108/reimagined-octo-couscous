/**
 * CinematicStage — the film layer of the living sitting.
 *
 * Three pieces live here:
 *   1. CinematicStage   — a full-screen colour grade, drifting auras and a
 *                         projector beam that re-light themselves for each
 *                         step kind and time of day. Sits above AmbientLayer
 *                         and below the session content, so the scene art
 *                         survives and only the grade changes.
 *   2. CinematicChapterCard — the letterboxed title card shown as a threshold
 *                         is entered. Bars slide in, the name holds, it dissolves.
 *   3. CinematicFrame   — viewfinder brackets that stage the live widget as the
 *                         current "shot" instead of another card in a feed.
 *
 * Everything collapses to a still, faint wash under prefers-reduced-motion.
 * Palette + idle-chrome helpers live in ./cinematicTheme so this module only
 * exports components.
 */
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { StepKind } from "@/lib/session-shell/types";
import type { TimeSlot } from "@/lib/timeSlots";
import { cinematicDeep, cinematicPalette } from "./cinematicTheme";

// ── 1. The stage ─────────────────────────────────────────────────────────────

interface StageProps {
  kind?: StepKind;
  slot?: TimeSlot;
  paused?: boolean;
}

export function CinematicStage({ kind, slot = "evening", paused = false }: StageProps) {
  const reduce = useReducedMotion();
  const p = cinematicPalette(kind);
  const deep = cinematicDeep(slot);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Base exposure — tints the room for the current threshold without
          crushing the ambient scene underneath (colour-only blend). */}
      <div
        className="absolute inset-0 opacity-45 mix-blend-color transition-[background] duration-[2200ms] ease-in-out"
        style={{
          background: `linear-gradient(165deg, ${deep} 0%, #2b3342 58%, ${p.deep} 100%)`,
        }}
      />

      {/* Two slow auras drifting behind the content. */}
      <div
        className="absolute left-1/2 top-[-32%] h-[92vmax] w-[92vmax] rounded-full blur-[90px] mix-blend-screen"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${p.a}4d 0%, ${p.b}26 34%, transparent 64%)`,
          opacity: paused ? 0.28 : 0.55,
          animation: reduce ? undefined : "cineDriftA 34s ease-in-out infinite",
          transition: "opacity 1.2s ease, background 2.2s ease",
        }}
      />
      <div
        className="absolute bottom-[-38%] right-[-14%] h-[74vmax] w-[74vmax] rounded-full blur-[110px] mix-blend-screen"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${p.b}40 0%, transparent 62%)`,
          opacity: paused ? 0.16 : 0.34,
          animation: reduce ? undefined : "cineDriftB 46s ease-in-out infinite",
          transition: "opacity 1.2s ease, background 2.2s ease",
        }}
      />

      {/* Projector beam — the room is lit by something off-screen. */}
      {!reduce && (
        <div
          className="absolute -inset-y-1/4 left-[-30%] w-[70%] mix-blend-screen"
          style={{
            background: `linear-gradient(100deg, transparent 0%, ${p.a}12 42%, ${p.a}1f 50%, ${p.a}0a 62%, transparent 100%)`,
            animation: "cineBeam 26s ease-in-out infinite",
          }}
        />
      )}

      {/* Central bloom — focus pull toward the practice. */}
      <div
        className="absolute left-1/2 top-1/2 h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${p.a}18 0%, transparent 58%)`,
          opacity: paused ? 0.2 : 0.75,
        }}
      />

      {/* Exposure edges — every frame is darker at the gates. */}
      <div
        className="absolute inset-x-0 top-0 h-[16vh]"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.62), transparent)" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[20vh]"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}
      />

      <style>{`
        @keyframes cineDriftA {
          0%, 100% { transform: translate3d(-50%, -2%, 0) scale(1); }
          50%      { transform: translate3d(-46%, 3%, 0) scale(1.07); }
        }
        @keyframes cineDriftB {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50%      { transform: translate3d(-4%, -3%, 0) scale(1.09); }
        }
        @keyframes cineBeam {
          0%, 100% { transform: translateX(-16%) skewX(-12deg); opacity: 0.5; }
          50%      { transform: translateX(22%) skewX(-12deg); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}

// ── 2. The chapter card ──────────────────────────────────────────────────────

interface ChapterProps {
  eyebrow: string;
  title: string;
  essence?: string;
  meta?: string | null;
  kind?: StepKind;
  holdMs?: number;
}

export function CinematicChapterCard({
  eyebrow,
  title,
  essence,
  meta,
  kind,
  holdMs = 2600,
}: ChapterProps) {
  const reduce = useReducedMotion();
  const p = cinematicPalette(kind);
  const [show, setShow] = useState(true);
  const timer = useRef<number | null>(null);

  const dismiss = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    setShow(false);
  }, []);

  useEffect(() => {
    timer.current = window.setTimeout(() => setShow(false), holdMs);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [holdMs]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="cinematic-chapter"
          className="fixed inset-0 z-[68] flex items-center justify-center px-8"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: reduce ? 0.1 : 0.6, ease: "easeOut" } }}
          onClick={dismiss}
          role="presentation"
        >
          {/* Letterbox bars */}
          <motion.div
            className="pointer-events-none absolute inset-x-0 top-0 bg-black/85"
            initial={{ height: reduce ? "9vh" : 0 }}
            animate={{ height: "9vh" }}
            exit={{ height: 0 }}
            transition={{ duration: reduce ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/85"
            initial={{ height: reduce ? "9vh" : 0 }}
            animate={{ height: "9vh" }}
            exit={{ height: 0 }}
            transition={{ duration: reduce ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Soft grade wash behind the type */}
          <motion.div
            className="pointer-events-none absolute inset-0 mix-blend-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 1.1 }}
            style={{
              background: `radial-gradient(60vmax 40vmax at 50% 50%, ${p.a}22 0%, transparent 70%)`,
            }}
          />

          <motion.div
            className="relative max-w-xl text-center"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, filter: "blur(10px)" }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12, filter: "blur(6px)" }}
            transition={{ duration: reduce ? 0.2 : 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <p
              className="text-[10px] uppercase tracking-[0.42em]"
              style={{ color: `${p.a}cc` }}
            >
              {eyebrow}
            </p>
            <h2 className="mt-4 font-display text-3xl font-medium leading-tight tracking-[0.02em] text-white/95 sm:text-5xl">
              {title}
            </h2>
            <motion.span
              className="mx-auto mt-5 block h-px w-16 origin-center"
              style={{ background: `linear-gradient(90deg, transparent, ${p.a}, transparent)` }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: reduce ? 0 : 0.35, duration: 0.8, ease: "easeOut" }}
            />
            {essence && (
              <p className="mt-4 text-sm italic leading-relaxed text-white/65 sm:text-base">
                {essence}
              </p>
            )}
            {meta && (
              <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-white/35">{meta}</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── 3. The viewfinder frame ──────────────────────────────────────────────────

interface FrameProps {
  label?: string;
  meta?: string | null;
  kind?: StepKind;
  children: ReactNode;
}

export function CinematicFrame({ label, meta, kind, children }: FrameProps) {
  const p = cinematicPalette(kind);
  return (
    <div className="relative">
      {/* Bloom behind the live shot */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[2.5rem] blur-2xl"
        style={{
          background: `radial-gradient(60% 60% at 50% 40%, ${p.a}1f 0%, transparent 70%)`,
        }}
      />
      {/* Viewfinder brackets */}
      <div aria-hidden="true" className="pointer-events-none absolute -inset-2.5 sm:-inset-3.5">
        <span className="absolute left-0 top-0 h-4 w-4 border-l border-t border-white/20" />
        <span className="absolute right-0 top-0 h-4 w-4 border-r border-t border-white/20" />
        <span className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-white/20" />
        <span className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-white/20" />
      </div>
      {(label || meta) && (
        <div className="mb-2 flex items-center justify-between px-1 text-[9px] uppercase tracking-[0.32em] text-muted-foreground/60">
          <span style={{ color: `${p.a}b3` }}>{label}</span>
          <span className="truncate pl-3 text-right">{meta}</span>
        </div>
      )}
      {children}
    </div>
  );
}
