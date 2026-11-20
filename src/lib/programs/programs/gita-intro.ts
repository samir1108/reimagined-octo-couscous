import type { SessionProgramV3 } from "../types";

export const GITA_INTRO: SessionProgramV3 = {
  id: "gita-intro",
  title: "Bhagavad Gita · Intro",
  subtitle: "Krishna on the battlefield of life",
  description: "A 7-session entry into the Gita's core teaching.",
  difficulty: "beginner",
  category: "wisdom",
  tags: ["gita","scripture","krishna"],
  icon: "BookOpen",
  coverGradient: "from-blue-800 to-indigo-950",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Arjuna's collapse"},{"phase":"Practice","sessions":4,"focus":"Karma yoga — 2.47"},{"phase":"Integration","sessions":1,"focus":"Your battlefield today"},{"phase":"Mastery","sessions":1,"focus":"Act, do not cling"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Arjuna's collapse",
    "required": [
      "ritual.opening-bow",
      "wisdom.gita.2.47",
      "journal.what-am-i-avoiding"
    ],
    "targetMinutes": 18
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Karma yoga — 2.47",
    "required": [
      "wisdom.gita.2.47",
      "micro-act.tidy-one-thing",
      "contemplation.sit-with-question"
    ],
    "targetMinutes": 22
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Sthitaprajna — the steady",
    "required": [
      "meditation.anchor-breath",
      "witness.gap-between-thoughts",
      "meditation.choiceless-awareness"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Bhakti — surrender",
    "required": [
      "mantra.om",
      "mudra.anjali",
      "meditation.loving-kindness"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Jnana — see what is",
    "required": [
      "inquiry.who-am-i",
      "wisdom.gita.6.5",
      "witness.name-the-watcher"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Your battlefield today",
    "required": [
      "speech-vow.one-honest-thing",
      "journal.loop-of-the-day",
      "micro-act.tidy-one-thing"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Act, do not cling",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "mantra.aham-brahmasmi",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 25
  }
],
};
