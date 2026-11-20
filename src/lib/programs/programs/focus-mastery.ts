/**
 * PROGRAM: Focus Mastery — dharana for the modern mind.
 */
import type { SessionProgramV3 } from "../types";

export const FOCUS_MASTERY: SessionProgramV3 = {
  id: "focus-mastery",
  title: "Focus Mastery",
  subtitle: "Dharana — train single-pointed attention",
  description:
    "A 6-session arc to rebuild concentration: count breath, candle gazing, one-object meditation, and live focus reps.",
  difficulty: "intermediate",
  category: "mind",
  tags: ["focus", "dharana", "concentration"],
  icon: "Target",
  coverGradient: "from-amber-600 to-orange-700",
  totalSessions: 6,
  phases: [
    { phase: "Foundation", sessions: 1, focus: "Why focus matters" },
    { phase: "Practice", sessions: 3, focus: "Train attention" },
    { phase: "Integration", sessions: 1, focus: "Single-tasking life" },
    { phase: "Mastery", sessions: 1, focus: "Effortless focus" },
  ],
  sessions: [
    { index: 1, phase: "Foundation",
      intent: "See the scattered mind",
      required: ["ritual.opening-bow", "framework.witness-vs-thinker", "witness.thought-counter", "journal.loop-of-the-day"],
      targetMinutes: 15 },
    { index: 2, phase: "Practice",
      intent: "Count breaths to 21",
      required: ["breath.box-4-4-4-4", "concentration.count-breath-21", "meditation.anchor-breath"],
      targetMinutes: 20 },
    { index: 3, phase: "Practice",
      intent: "Candle trataka",
      required: ["concentration.candle-trataka", "observe.one-object"],
      targetMinutes: 22 },
    { index: 4, phase: "Practice",
      intent: "One object, many minutes",
      required: ["observe.one-object", "meditation.anchor-breath", "witness.gap-between-thoughts"],
      targetMinutes: 25 },
    { index: 5, phase: "Integration",
      intent: "Single-task one real act",
      required: ["detox.no-phone-30min", "micro-act.tidy-one-thing", "voice-journal.speak-it-out"],
      targetMinutes: 18 },
    { index: 6, phase: "Mastery",
      intent: "Focus without effort",
      required: ["ritual.opening-bow", "mantra.so-hum", "meditation.open-awareness", "ritual.dedicate-merit"],
      targetMinutes: 25 },
  ],
};
