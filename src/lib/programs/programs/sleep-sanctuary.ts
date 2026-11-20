/**
 * PROGRAM: Sleep Sanctuary — wind down, deep sleep, conscious waking.
 */
import type { SessionProgramV3 } from "../types";

export const SLEEP_SANCTUARY: SessionProgramV3 = {
  id: "sleep-sanctuary",
  title: "Sleep Sanctuary",
  subtitle: "Yoga nidra — fall asleep on purpose",
  description:
    "A 6-session arc to release the day, drop into yoga-nidra-style depth, and wake with the witness intact.",
  difficulty: "beginner",
  category: "rest",
  tags: ["sleep", "nidra", "rest"],
  icon: "Moon",
  coverGradient: "from-indigo-700 to-slate-900",
  totalSessions: 6,
  phases: [
    { phase: "Foundation", sessions: 1, focus: "Wind-down ritual" },
    { phase: "Practice", sessions: 3, focus: "Body, breath, surrender" },
    { phase: "Integration", sessions: 1, focus: "Conscious waking" },
    { phase: "Mastery", sessions: 1, focus: "Sleep as practice" },
  ],
  sessions: [
    { index: 1, phase: "Foundation",
      intent: "Close the day cleanly",
      required: ["ritual.opening-bow", "journal.head-heart-gut-check", "breath.coherent-5-5", "ritual.closing-thanks"],
      targetMinutes: 15 },
    { index: 2, phase: "Practice",
      intent: "Body scan into release",
      required: ["body.head-to-toe", "somatic.sigh-3x", "meditation.anchor-breath"],
      targetMinutes: 22 },
    { index: 3, phase: "Practice",
      intent: "Slow breath, slow heart",
      required: ["breath.physiological-sigh", "breath.coherent-5-5", "mudra.dhyana"],
      targetMinutes: 20 },
    { index: 4, phase: "Practice",
      intent: "Surrender — let the day go",
      required: ["emotion.label-to-tame", "contemplation.death-meditation", "ritual.dedicate-merit"],
      targetMinutes: 22 },
    { index: 5, phase: "Integration",
      intent: "Wake with the witness",
      required: ["ritual.opening-bow", "witness.who-is-watching", "voice-journal.future-self"],
      targetMinutes: 15 },
    { index: 6, phase: "Mastery",
      intent: "Sleep as a sacred surrender",
      required: ["mantra.om", "meditation.open-awareness", "ritual.closing-thanks"],
      targetMinutes: 20 },
  ],
};
