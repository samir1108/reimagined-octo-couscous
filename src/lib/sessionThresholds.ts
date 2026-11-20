/**
 * SESSION THRESHOLDS — step-level naming, inter-step breath pauses,
 * and position logic. A step is a threshold crossing, not a card.
 */
import type { SessionStep, StepKind } from "@/lib/session-shell/types";

const THRESHOLD_BY_KIND: Record<StepKind, string> = {
  "wisdom-read": "Illumination",
  breathwork: "Grounding",
  journal: "Naming",
  "micro-act": "Emboldening",
  reflection: "Sealing",
  "guide-chat": "Inquiry",
  practice: "Transformation",
  "temple-chat": "Transmission",
  witness: "Stillness",
};

const THRESHOLD_ESSENCE: Record<StepKind, string> = {
  "wisdom-read": "A frame lands before the work begins.",
  breathwork: "The body arrives first — the mind follows.",
  journal: "What is named loses its grip.",
  "micro-act": "One true act outlives a thousand thoughts.",
  reflection: "Silence seals what the work opened.",
  "guide-chat": "The inconvenient sentence comes out.",
  practice: "The keystone — everything hinges on this.",
  "temple-chat": "You sit in a master's field.",
  witness: "The noticer wakes behind the noise.",
};

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export interface StepThreshold {
  /** "Threshold II · Naming" */
  label: string;
  name: string;
  roman: string;
  essence: string;
}

export function getStepThreshold(step: SessionStep, index: number): StepThreshold {
  const name = THRESHOLD_BY_KIND[step.kind] || "Crossing";
  const roman = ROMAN[Math.min(index + 1, ROMAN.length - 1)] || String(index + 1);
  return {
    label: `Threshold ${roman} · ${name}`,
    name,
    roman,
    essence: THRESHOLD_ESSENCE[step.kind] || "A crossing in the session's arc.",
  };
}

const PAUSE_LINES = [
  "Let it settle — three breaths.",
  "Don't rush the crossing. Breathe.",
  "Let the last step finish landing.",
  "A threshold holds you for a moment.",
];

export function getBreathPauseLine(seed: number): string {
  return PAUSE_LINES[Math.abs(seed) % PAUSE_LINES.length];
}

const POSITION_REASONS: Record<string, string> = {
  "breathwork→witness": "After grounding the body, the noise has somewhere to go.",
  "breathwork→journal": "The body is quiet — now the loudest thing can speak.",
  "wisdom-read→witness": "The frame is set — now you watch what passes through it.",
  "wisdom-read→practice": "The frame is set — now the body does the work.",
  "wisdom-read→breathwork": "The idea is seeded — the breath makes it flesh.",
  "journal→reflection": "It's named. Now let it settle.",
  "journal→micro-act": "It's on paper. Now it becomes motion.",
  "journal→witness": "You've said it. Now watch who said it.",
  "witness→journal": "You've seen the weather — now name the cloud.",
  "witness→reflection": "The watching is done. The silence carries it out.",
  "practice→reflection": "The work is done. The silence seals it.",
  "practice→micro-act": "The practice is alive in you — give it one doorway into the day.",
  "micro-act→reflection": "The act is done. Let the body register it.",
  "temple-chat→reflection": "The master's words need silence to land.",
  "guide-chat→journal": "You spoke the truth — now write it so it stays.",
  "reflection→witness": "The settling is done — rest in the noticer.",
};

export function getStepPositionReason(prev: StepKind | undefined, cur: StepKind): string {
  if (!prev) return "The session opens exactly where you are.";
  return POSITION_REASONS[`${prev}→${cur}`] || "Each step prepares the ground for the next.";
}
