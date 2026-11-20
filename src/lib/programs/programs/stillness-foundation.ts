/**
 * PROGRAM: Stillness Foundation — meditation from scratch.
 */
import type { SessionProgramV3 } from "../types";

export const STILLNESS_FOUNDATION: SessionProgramV3 = {
  id: "stillness-foundation",
  title: "Stillness Foundation",
  subtitle: "Learn to sit. Learn to stay.",
  description:
    "A 7-session meditation foundation — from posture and breath anchor to open awareness. For anyone who's tried to meditate and bounced off.",
  difficulty: "beginner",
  category: "meditation",
  tags: ["meditation", "dharana", "beginner"],
  icon: "Sparkle",
  coverGradient: "from-indigo-500 to-blue-700",
  totalSessions: 7,
  phases: [
    { phase: "Foundation", sessions: 2, focus: "Posture & breath" },
    { phase: "Practice", sessions: 3, focus: "Anchor & concentration" },
    { phase: "Integration", sessions: 1, focus: "Open awareness" },
    { phase: "Mastery", sessions: 1, focus: "Effortless sitting" },
  ],
  sessions: [
    { index: 1, phase: "Foundation",
      intent: "Find a posture you can stay in",
      required: ["ritual.opening-bow", "body.head-to-toe", "breath.coherent-5-5", "mudra.dhyana"],
      targetMinutes: 15 },
    { index: 2, phase: "Foundation",
      intent: "Use breath as a friendly anchor",
      required: ["breath.box-4-4-4-4", "meditation.anchor-breath", "journal.head-heart-gut-check"],
      targetMinutes: 18 },
    { index: 3, phase: "Practice",
      intent: "Count breaths — train attention",
      required: ["ritual.opening-bow", "concentration.count-breath-21", "witness.thought-counter"],
      fillFrom: ["concentration"], targetMinutes: 20 },
    { index: 4, phase: "Practice",
      intent: "Single-point focus on one object",
      required: ["concentration.candle-trataka", "observe.one-object"],
      targetMinutes: 22 },
    { index: 5, phase: "Practice",
      intent: "Notice the gap between thoughts",
      required: ["breath.nadi-shodhana", "witness.gap-between-thoughts", "meditation.anchor-breath"],
      targetMinutes: 25 },
    { index: 6, phase: "Integration",
      intent: "Open awareness — let it all in",
      required: ["meditation.open-awareness", "observe.5-senses", "voice-journal.speak-it-out"],
      targetMinutes: 22 },
    { index: 7, phase: "Mastery",
      intent: "Sit effortlessly",
      required: ["ritual.opening-bow", "mantra.so-hum", "meditation.open-awareness", "witness.who-is-watching", "ritual.dedicate-merit"],
      targetMinutes: 30 },
  ],
};
