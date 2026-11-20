/**
 * PROGRAM: Sacred Sexuality — energy as awareness.
 */
import type { SessionProgramV3 } from "../types";

export const SACRED_SEXUALITY: SessionProgramV3 = {
  id: "sacred-sexuality",
  title: "Sacred Sexuality",
  subtitle: "Reclaim eros as life-force, not leakage",
  description:
    "A 7-session tantric arc to re-frame sexual energy as creative life-force — circulated, honored, and integrated.",
  difficulty: "advanced",
  category: "embodiment",
  tags: ["tantra", "sexuality", "energy"],
  icon: "Heart",
  coverGradient: "from-rose-600 to-purple-900",
  totalSessions: 7,
  phases: [
    { phase: "Foundation", sessions: 2, focus: "Reframe & feel" },
    { phase: "Practice", sessions: 3, focus: "Circulate the energy" },
    { phase: "Integration", sessions: 1, focus: "Honored daily" },
    { phase: "Mastery", sessions: 1, focus: "Eros as awareness" },
  ],
  sessions: [
    { index: 1, phase: "Foundation",
      intent: "Reframe the energy",
      required: ["ritual.opening-bow", "wisdom.rumi.guest-house", "framework.loop-anatomy"],
      targetMinutes: 18 },
    { index: 2, phase: "Foundation",
      intent: "Where it lives in the body",
      required: ["body.head-to-toe", "body.tension-map", "journal.head-heart-gut-check"],
      targetMinutes: 22 },
    { index: 3, phase: "Practice",
      intent: "Breath up the spine",
      required: ["kriya.spinal-flex", "breath.nadi-shodhana", "mudra.anjali"],
      targetMinutes: 22 },
    { index: 4, phase: "Practice",
      intent: "Witness the urge",
      required: ["witness.who-is-watching", "loop-confront.interrupt-now", "contemplation.sit-with-question"],
      targetMinutes: 22 },
    { index: 5, phase: "Practice",
      intent: "Shame unburdening",
      required: ["ifs.unburden-protector", "emotion.rain", "journal.unsent-letter"],
      targetMinutes: 25 },
    { index: 6, phase: "Integration",
      intent: "Honored daily",
      required: ["mudra.anjali", "speech-vow.one-honest-thing", "ritual.dedicate-merit"],
      targetMinutes: 18 },
    { index: 7, phase: "Mastery",
      intent: "Eros as awareness",
      required: ["ritual.opening-bow", "meditation.open-awareness", "mantra.aham-brahmasmi", "ritual.dedicate-merit"],
      targetMinutes: 28 },
  ],
};
