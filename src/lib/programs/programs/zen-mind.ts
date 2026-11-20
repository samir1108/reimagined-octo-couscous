/**
 * PROGRAM: Zen Mind — beginner's mind, every day.
 */
import type { SessionProgramV3 } from "../types";

export const ZEN_MIND: SessionProgramV3 = {
  id: "zen-mind",
  title: "Zen Mind",
  subtitle: "Sit. Breathe. Don't know.",
  description:
    "A 7-session arc into shikantaza, koan inquiry, and the radical simplicity of just-this-moment Zen practice.",
  difficulty: "intermediate",
  category: "meditation",
  tags: ["zen", "shikantaza", "koan"],
  icon: "Mountain",
  coverGradient: "from-stone-700 to-stone-900",
  totalSessions: 7,
  phases: [
    { phase: "Foundation", sessions: 2, focus: "Just sit" },
    { phase: "Practice", sessions: 3, focus: "Koan & silence" },
    { phase: "Integration", sessions: 1, focus: "Zen in chores" },
    { phase: "Mastery", sessions: 1, focus: "Nothing special" },
  ],
  sessions: [
    { index: 1, phase: "Foundation",
      intent: "Just sit",
      required: ["ritual.opening-bow", "body.head-to-toe", "meditation.anchor-breath"],
      targetMinutes: 18 },
    { index: 2, phase: "Foundation",
      intent: "Posture & breath",
      required: ["mudra.anjali", "breath.coherent-5-5", "witness.thought-counter"],
      targetMinutes: 20 },
    { index: 3, phase: "Practice",
      intent: "Shikantaza — just sitting",
      required: ["meditation.open-awareness", "witness.who-is-watching", "contemplation.sit-with-question"],
      targetMinutes: 25 },
    { index: 4, phase: "Practice",
      intent: "Hold a koan",
      required: ["teach.koan.who-asks", "inquiry.who-am-i", "voice-journal.speak-it-out"],
      targetMinutes: 22 },
    { index: 5, phase: "Practice",
      intent: "Silence as teacher",
      required: ["speech-vow.no-complaint-1h", "detox.no-phone-30min", "meditation.open-awareness"],
      targetMinutes: 25 },
    { index: 6, phase: "Integration",
      intent: "Zen in chores",
      required: ["micro-act.tidy-one-thing", "observe.5-senses", "ritual.dedicate-merit"],
      targetMinutes: 18 },
    { index: 7, phase: "Mastery",
      intent: "Nothing special",
      required: ["ritual.opening-bow", "meditation.open-awareness", "ritual.dedicate-merit"],
      targetMinutes: 28 },
  ],
};
