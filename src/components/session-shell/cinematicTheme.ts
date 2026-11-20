/**
 * Cinematic theme tokens for the living sitting.
 *
 * Kept out of CinematicStage.tsx so that module only exports components
 * (fast-refresh friendly). Palettes are keyed by step kind and re-grade the
 * room as the sitting moves from threshold to threshold.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { StepKind } from "@/lib/session-shell/types";
import type { TimeSlot } from "@/lib/timeSlots";

export type CinematicPalette = { a: string; b: string; deep: string };

const PALETTES: Record<string, CinematicPalette> = {
  gold:    { a: "#f6c177", b: "#a8681f", deep: "#1c1206" },
  amber:   { a: "#f5b04a", b: "#b45309", deep: "#1f1408" },
  sky:     { a: "#7dd3fc", b: "#0369a1", deep: "#071522" },
  teal:    { a: "#5eead4", b: "#0f766e", deep: "#041715" },
  emerald: { a: "#6ee7b7", b: "#047857", deep: "#04150f" },
  rose:    { a: "#fda4af", b: "#be123c", deep: "#1c0a10" },
  violet:  { a: "#c4b5fd", b: "#6d28d9", deep: "#110b22" },
  indigo:  { a: "#a5b4fc", b: "#4338ca", deep: "#0a0c22" },
  fuchsia: { a: "#f0abfc", b: "#a21caf", deep: "#170a1d" },
  slate:   { a: "#cbd5e1", b: "#475569", deep: "#0b0e13" },
};

const KIND_PALETTE: Partial<Record<StepKind, keyof typeof PALETTES>> = {
  "wisdom-read": "gold",
  scripture: "gold",
  breathwork: "sky",
  journal: "emerald",
  "free_write": "emerald",
  "micro-act": "rose",
  gratitude: "rose",
  "loving_kindness": "rose",
  reflection: "violet",
  contemplation: "violet",
  "guide-chat": "indigo",
  practice: "fuchsia",
  visualization: "fuchsia",
  "temple-chat": "amber",
  mantra: "amber",
  witness: "slate",
  "silent_sit": "slate",
  "body_scan": "teal",
  noticing: "teal",
};

const SLOT_DEEP: Record<TimeSlot, string> = {
  morning: "#7a5a2e",
  midday: "#4a5563",
  evening: "#7a4522",
  night: "#28304f",
};

export function cinematicPalette(kind?: StepKind): CinematicPalette {
  return PALETTES[(kind && KIND_PALETTE[kind]) || "gold"] ?? PALETTES.gold;
}

export function cinematicDeep(slot: TimeSlot): string {
  return SLOT_DEEP[slot] ?? SLOT_DEEP.evening;
}

/**
 * Cinematic chrome: controls stay at full strength while the sitter moves,
 * then settle back so the frame is the subject. Nothing is ever removed.
 */
export function useIdleChrome(idleMs = 4800) {
  const [visible, setVisible] = useState(true);
  const timer = useRef<number | null>(null);

  const arm = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setVisible(false), idleMs);
  }, [idleMs]);

  const poke = useCallback(() => {
    setVisible(true);
    arm();
  }, [arm]);

  useEffect(() => {
    arm();
    window.addEventListener("pointerdown", poke, { passive: true });
    window.addEventListener("pointermove", poke, { passive: true });
    window.addEventListener("keydown", poke);
    window.addEventListener("scroll", poke, { passive: true, capture: true });
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
      window.removeEventListener("pointerdown", poke);
      window.removeEventListener("pointermove", poke);
      window.removeEventListener("keydown", poke);
      window.removeEventListener("scroll", poke, true);
    };
  }, [arm, poke]);

  return { chromeVisible: visible, poke };
}
