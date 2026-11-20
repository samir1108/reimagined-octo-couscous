import type { SessionProgramV3 } from "../types";

export const MANTRA_JAPA_PATH: SessionProgramV3 = {
  id: "mantra-japa-path",
  title: "Mantra Japa Path",
  subtitle: "Repetition as remembrance",
  description: "A 7-session arc into japa — recitation as the bridge to silence.",
  difficulty: "beginner",
  category: "heart",
  tags: ["mantra","japa","bhakti"],
  icon: "Repeat",
  coverGradient: "from-orange-700 to-rose-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Why mantra works"},{"phase":"Practice","sessions":4,"focus":"Om — primal sound"},{"phase":"Integration","sessions":1,"focus":"Mantra in waiting moments"},{"phase":"Mastery","sessions":1,"focus":"Mantra becomes silence"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Why mantra works",
    "required": [
      "ritual.opening-bow",
      "wisdom.gita.6.5",
      "neuro.default-mode-network"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Om — primal sound",
    "required": [
      "mantra.om",
      "meditation.anchor-breath",
      "mudra.chin"
    ],
    "targetMinutes": 20
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "So-hum with breath",
    "required": [
      "mantra.so-hum",
      "breath.coherent-5-5",
      "meditation.body-as-anchor"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Gayatri",
    "required": [
      "mantra.gayatri",
      "mudra.anjali",
      "meditation.anchor-breath"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Om mani padme hum",
    "required": [
      "mantra.om-mani",
      "meditation.loving-kindness",
      "witness.gap-between-thoughts"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Mantra in waiting moments",
    "required": [
      "micro-act.tidy-one-thing",
      "speech-vow.pause-before-reply",
      "journal.loop-of-the-day"
    ],
    "targetMinutes": 15
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Mantra becomes silence",
    "required": [
      "ritual.opening-bow",
      "mantra.so-hum",
      "meditation.open-awareness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 25
  }
],
};
