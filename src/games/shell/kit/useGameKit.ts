// useGameKit — shared behavioural hooks for every Conscious Game.
// Goal: each game file focuses on its *mechanic*; timing, idle detection,
// keyword listening and rolling statistics live here so all 236 games
// behave identically and read the same signal vocabulary.
import { useCallback, useEffect, useRef, useState } from "react";

// ── Clock ────────────────────────────────────────────────────────────────
export interface GameClock {
  elapsedMs: number;
  seconds: number;
  started: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  progress: (totalMs: number) => number;
}

/** Monotonic elapsed timer that survives pause/resume of the shell. */
export function useGameClock(active = true): GameClock {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [started, setStarted] = useState(false);
  const startRef = useRef<number | null>(null);
  const accumRef = useRef(0);

  useEffect(() => {
    if (!active || !started) return;
    const id = window.setInterval(() => {
      if (startRef.current == null) return;
      setElapsedMs(accumRef.current + (Date.now() - startRef.current));
    }, 100);
    return () => window.clearInterval(id);
  }, [active, started]);

  const start = useCallback(() => {
    if (startRef.current != null) return;
    startRef.current = Date.now();
    setStarted(true);
  }, []);

  const stop = useCallback(() => {
    if (startRef.current == null) return;
    accumRef.current += Date.now() - startRef.current;
    startRef.current = null;
    setElapsedMs(accumRef.current);
    setStarted(false);
  }, []);

  const reset = useCallback(() => {
    startRef.current = null;
    accumRef.current = 0;
    setElapsedMs(0);
    setStarted(false);
  }, []);

  const progress = useCallback((totalMs: number) => {
    if (!totalMs) return 0;
    return Math.min(1, Math.max(0, elapsedMs / totalMs));
  }, [elapsedMs]);

  return { elapsedMs, seconds: Math.floor(elapsedMs / 1000), started, start, stop, reset, progress };
}

// ── Idle detection ──────────────────────────────────────────────────────
export interface IdleWatch {
  idleMs: number;
  isIdle: boolean;
  lastActivityAt: number;
  markActivity: () => void;
  reset: () => void;
}

/**
 * Tracks how long the player has been physically still (no pointer, key,
 * wheel or touch). Used for stillness, witness and ekaggata mechanics.
 */
export function useIdleWatch(thresholdMs = 8000, active = true): IdleWatch {
  const [idleMs, setIdleMs] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const lastRef = useRef(Date.now());

  const markActivity = useCallback(() => {
    lastRef.current = Date.now();
    setIdleMs(0);
    setIsIdle(false);
  }, []);

  const reset = useCallback(() => {
    lastRef.current = Date.now();
    setIdleMs(0);
    setIsIdle(false);
  }, []);

  useEffect(() => {
    if (!active) return;
    const events: (keyof WindowEventMap)[] = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"];
    const handler = () => markActivity();
    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, handler));
  }, [active, markActivity]);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      const idle = Date.now() - lastRef.current;
      setIdleMs(idle);
      setIsIdle(idle >= thresholdMs);
    }, 200);
    return () => window.clearInterval(id);
  }, [active, thresholdMs]);

  return { idleMs, isIdle, lastActivityAt: lastRef.current, markActivity, reset };
}

// ── Rolling statistics ──────────────────────────────────────────────────
export interface RollingStats {
  push: (v: number) => void;
  clear: () => void;
  count: number;
  mean: number;
  variance: number;
  stdev: number;
  min: number;
  max: number;
  last: number;
  median: number;
}

/** Streaming mean / variance / median for sensor series. */
export function useRollingStats(capacity = 240): RollingStats {
  const bufRef = useRef<number[]>([]);
  const [, bump] = useState(0);

  const push = useCallback((v: number) => {
    if (!Number.isFinite(v)) return;
    bufRef.current.push(v);
    if (bufRef.current.length > capacity) bufRef.current.shift();
    bump((n) => n + 1);
  }, [capacity]);

  const clear = useCallback(() => {
    bufRef.current = [];
    bump((n) => n + 1);
  }, []);

  const arr = bufRef.current;
  const count = arr.length;
  const mean = count ? arr.reduce((a, b) => a + b, 0) / count : 0;
  const variance = count ? arr.reduce((a, b) => a + (b - mean) ** 2, 0) / count : 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const median = count
    ? count % 2
      ? sorted[(count - 1) / 2]
      : (sorted[count / 2 - 1] + sorted[count / 2]) / 2
    : 0;

  return {
    push,
    clear,
    count,
    mean,
    variance,
    stdev: Math.sqrt(variance),
    min: count ? sorted[0] : 0,
    max: count ? sorted[count - 1] : 0,
    last: count ? arr[count - 1] : 0,
    median,
  };
}

// ── Tap / rhythm analysis ───────────────────────────────────────────────
export interface TapSeries {
  taps: number[];
  intervals: number[];
  meanInterval: number;
  jitter: number;
  rate: number;
  record: () => void;
  clear: () => void;
  lastInterval: number;
}

/**
 * Captures tap timestamps and derives rhythm regularity (low jitter = steady).
 * Used by japa, mantra, rhythm, two-hands and coherence mechanics.
 */
export function useTapSeries(): TapSeries {
  const tapsRef = useRef<number[]>([]);
  const [, bump] = useState(0);

  const record = useCallback(() => {
    tapsRef.current.push(Date.now());
    if (tapsRef.current.length > 120) tapsRef.current.shift();
    bump((n) => n + 1);
  }, []);

  const clear = useCallback(() => {
    tapsRef.current = [];
    bump((n) => n + 1);
  }, []);

  const taps = tapsRef.current;
  const intervals: number[] = [];
  for (let i = 1; i < taps.length; i++) intervals.push(taps[i] - taps[i - 1]);
  const meanInterval = intervals.length ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;
  const variance = intervals.length
    ? intervals.reduce((a, b) => a + (b - meanInterval) ** 2, 0) / intervals.length
    : 0;
  const lastInterval = intervals.length ? intervals[intervals.length - 1] : 0;

  return {
    taps,
    intervals,
    meanInterval,
    jitter: Math.sqrt(variance),
    rate: meanInterval ? 60000 / meanInterval : 0,
    record,
    clear,
    lastInterval,
  };
}

// ── Keyword watch ───────────────────────────────────────────────────────
export interface KeywordWatch {
  matched: string | null;
  matchedAt: number;
  consume: () => string | null;
  reset: () => void;
}

/**
 * Watches a transcript string for any of a set of phrases.
 * The phrase set should be short and unambiguous ("enough", "stop", "help").
 */
export function useKeywordWatch(transcript: string, keywords: string[]): KeywordWatch {
  const [matched, setMatched] = useState<string | null>(null);
  const [matchedAt, setMatchedAt] = useState(0);
  const keysRef = useRef(keywords);
  keysRef.current = keywords;

  useEffect(() => {
    if (!transcript) return;
    const lower = transcript.toLowerCase();
    for (const k of keysRef.current) {
      if (lower.includes(k.toLowerCase())) {
        setMatched(k);
        setMatchedAt(Date.now());
        return;
      }
    }
  }, [transcript]);

  const consume = useCallback(() => {
    const m = matched;
    setMatched(null);
    return m;
  }, [matched]);

  const reset = useCallback(() => {
    setMatched(null);
    setMatchedAt(0);
  }, []);

  return { matched, matchedAt, consume, reset };
}

// ── Mic gate ────────────────────────────────────────────────────────────
export interface MicGate {
  /** 0..1 — how clearly the mic is picking up signal right now. */
  level: number;
  /** True when the level has been above `threshold` recently. */
  speaking: boolean;
  /** Seconds of continuous energy above threshold. */
  activeMs: number;
  threshold: number;
}

/**
 * Turns a raw mic envelope into a clean "is there signal" gate with
 * hysteresis so it doesn't flicker on room noise.
 */
export function useMicGate(envelope: number, threshold = 0.12): MicGate {
  const [speaking, setSpeaking] = useState(false);
  const [activeMs, setActiveMs] = useState(0);
  const lastAboveRef = useRef(0);

  useEffect(() => {
    const now = Date.now();
    if (envelope >= threshold) {
      if (!speaking) {
        setSpeaking(true);
        lastAboveRef.current = now;
      }
      setActiveMs(now - lastAboveRef.current);
    } else if (speaking && envelope < threshold * 0.6) {
      setSpeaking(false);
      setActiveMs(0);
    }
  }, [envelope, speaking, threshold]);

  return { level: envelope, speaking, activeMs, threshold };
}

// ── Phase machine ───────────────────────────────────────────────────────
export interface PhaseMachine<T extends string> {
  phase: T;
  setPhase: (p: T) => void;
  next: (order: readonly T[]) => void;
  is: (p: T) => boolean;
  visited: T[];
  markVisited: (p: T) => void;
}

/** Tiny typed phase tracker with an explicit visited history. */
export function usePhaseMachine<T extends string>(initial: T): PhaseMachine<T> {
  const [phase, setPhaseState] = useState<T>(initial);
  const [visited, setVisited] = useState<T[]>([initial]);
  const phaseRef = useRef<T>(initial);

  const setPhase = useCallback((p: T) => {
    phaseRef.current = p;
    setPhaseState(p);
    setVisited((v) => (v.includes(p) ? v : [...v, p]));
  }, []);

  const next = useCallback((order: readonly T[]) => {
    const i = order.indexOf(phaseRef.current);
    if (i >= 0 && i < order.length - 1) setPhase(order[i + 1]);
  }, [setPhase]);

  const is = useCallback((p: T) => phaseRef.current === p, []);
  const markVisited = useCallback((p: T) => {
    setVisited((v) => (v.includes(p) ? v : [...v, p]));
  }, []);

  return { phase, setPhase, next, is, visited, markVisited };
}

// ── Deadline ────────────────────────────────────────────────────────────
export interface Deadline {
  remainingMs: number;
  expired: boolean;
  fraction: number;
}

/** Countdown that never blocks render and fires `onExpire` exactly once. */
export function useDeadline(totalMs: number, active: boolean, onExpire: () => void): Deadline {
  const [remainingMs, setRemainingMs] = useState(totalMs);
  const doneRef = useRef(false);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  useEffect(() => {
    if (!active) return;
    doneRef.current = false;
    const end = Date.now() + totalMs;
    setRemainingMs(totalMs);
    const id = window.setInterval(() => {
      const left = Math.max(0, end - Date.now());
      setRemainingMs(left);
      if (left <= 0 && !doneRef.current) {
        doneRef.current = true;
        window.clearInterval(id);
        expireRef.current();
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [totalMs, active]);

  return {
    remainingMs,
    expired: remainingMs <= 0,
    fraction: totalMs ? remainingMs / totalMs : 0,
  };
}

// ── Sequence runner ─────────────────────────────────────────────────────
export interface StepRunner<T> {
  index: number;
  current: T | undefined;
  next: () => void;
  prev: () => void;
  goTo: (i: number) => void;
  complete: boolean;
  reset: () => void;
}

/** Walks an ordered list of steps (rounds, verses, breaths). */
export function useStepRunner<T>(steps: readonly T[]): StepRunner<T> {
  const [index, setIndex] = useState(0);
  const next = useCallback(() => setIndex((i) => Math.min(steps.length - 1, i + 1)), [steps.length]);
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const goTo = useCallback((i: number) => setIndex(Math.max(0, Math.min(steps.length - 1, i))), [steps.length]);
  const reset = useCallback(() => setIndex(0), []);
  return {
    index,
    current: steps[index],
    next,
    prev,
    goTo,
    complete: steps.length > 0 && index >= steps.length - 1,
    reset,
  };
}

// ── Signal builder ──────────────────────────────────────────────────────
/** Round + clamp a signal value so analytics stay stable across devices. */
export function sig(value: number, digits = 4): number {
  if (!Number.isFinite(value)) return 0;
  const p = 10 ** digits;
  return Math.round(value * p) / p;
}

/** Coerce any value into a signal-safe primitive (no functions, no cycles). */
export function safe(value: unknown, depth = 0): unknown {
  if (value == null) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "boolean" || typeof value === "string") return value;
  if (depth > 3) return null;
  if (Array.isArray(value)) return value.slice(0, 50).map((v) => safe(v, depth + 1));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    let n = 0;
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (n >= 40) break;
      out[k] = safe(v, depth + 1);
      n++;
    }
    return out;
  }
  return null;
}
