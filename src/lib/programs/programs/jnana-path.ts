/**
 * PROGRAM: Jnana Path — knowledge as liberation.
 */
import type { SessionProgramV3 } from "../types";

export const JNANA_PATH: SessionProgramV3 = {
  id: "jnana-path",
  title: "Jnana Path",
  subtitle: "Knowledge is the sword that cuts illusion",
  description:
    "A 7-session arc on the path of self-knowledge — atma vichara, neti neti, and direct recognition of awareness itself.",
  difficulty: "advanced",
  category: "wisdom",
  tags: ["jnana", "advaita", "self-inquiry"],
  icon: "Sparkles",
  coverGradient: "from-indigo-700 to-slate-900",
  totalSessions: 7,
  phases: [
    { phase: "Foundation", sessions: 2, focus: "The frame of inquiry" },
    { phase: "Practice", sessions: 3, focus: "Neti neti, who am I" },
    { phase: "Integration", sessions: 1, focus: "Live as awareness" },
    { phase: "Mastery", sessions: 1, focus: "Rest as the Self" },
  ],
  sessions: [
    { index: 1, phase: "Foundation",
      intent: "What is jnana?",
      required: ["ritual.opening-bow", "wisdom.gita.2.47", "framework.loop-anatomy"],
      targetMinutes: 18 },
    { index: 2, phase: "Foundation",
      intent: "The witness frame",
      required: ["witness.who-is-watching", "witness.thought-counter", "journal.head-heart-gut-check"],
      targetMinutes: 22 },
    { index: 3, phase: "Practice",
      intent: "Neti neti — not this, not this",
      required: ["inquiry.who-am-i", "contemplation.sit-with-question", "voice-journal.speak-it-out"],
      targetMinutes: 25 },
    { index: 4, phase: "Practice",
      intent: "Who is asking?",
      required: ["teach.koan.who-asks", "inquiry.who-am-i", "meditation.open-awareness"],
      targetMinutes: 25 },
    { index: 5, phase: "Practice",
      intent: "Awareness aware of itself",
      required: ["meditation.open-awareness", "witness.who-is-watching", "mantra.aham-brahmasmi"],
      targetMinutes: 25 },
    { index: 6, phase: "Integration",
      intent: "Live as the seer",
      required: ["observe.5-senses", "micro-act.tidy-one-thing", "ritual.dedicate-merit"],
      targetMinutes: 18 },
    { index: 7, phase: "Mastery",
      intent: "Rest as That",
      required: ["ritual.opening-bow", "mantra.aham-brahmasmi", "meditation.open-awareness", "ritual.dedicate-merit"],
      targetMinutes: 28 },
  ],
};
