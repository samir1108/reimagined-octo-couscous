import type { SessionProgramV3 } from "../types";

export const LIMB_NIYAMA: SessionProgramV3 = {
  id: "limb-niyama",
  title: "Limb 2 · Niyama",
  subtitle: "Observances — how to be with yourself",
  description: "A 7-session arc through saucha, santosha, tapas, svadhyaya, ishvara-pranidhana.",
  difficulty: "beginner",
  category: "wisdom",
  tags: ["8-limbs","niyama"],
  icon: "Flower2",
  coverGradient: "from-teal-700 to-emerald-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Inner architecture"},{"phase":"Practice","sessions":4,"focus":"Saucha — purity"},{"phase":"Integration","sessions":1,"focus":"Ishvara-pranidhana — surrender"},{"phase":"Mastery","sessions":1,"focus":"Niyama as devotion"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Inner architecture",
    "required": [
      "ritual.opening-bow",
      "framework.witness-vs-thinker",
      "journal.morning-pages-3"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Saucha — purity",
    "required": [
      "detox.silence-1h",
      "micro-act.tidy-one-thing",
      "breath.kapalbhati"
    ],
    "targetMinutes": 20
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Santosha — contentment",
    "required": [
      "journal.three-wins",
      "meditation.loving-kindness",
      "voice-journal.gratitude-3"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Tapas — disciplined heat",
    "required": [
      "kriya.breath-of-fire",
      "concentration.count-breath-21",
      "contemplation.sit-with-question"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Svadhyaya — self-study",
    "required": [
      "inquiry.who-am-i",
      "ai-mirror.weekly-summary",
      "journal.loop-of-the-day"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Ishvara-pranidhana — surrender",
    "required": [
      "mantra.om",
      "mudra.anjali",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 20
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Niyama as devotion",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
