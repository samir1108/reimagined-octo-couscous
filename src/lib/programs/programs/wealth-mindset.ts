import type { SessionProgramV3 } from "../types";

export const WEALTH_MINDSET: SessionProgramV3 = {
  id: "wealth-mindset",
  title: "Wealth Mindset",
  subtitle: "Inner stewardship before outer",
  description: "A 7-session arc on the inner posture wealth requires.",
  difficulty: "beginner",
  category: "wisdom",
  tags: ["wealth","mindset","money"],
  icon: "TrendingUp",
  coverGradient: "from-emerald-700 to-amber-800",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Stewardship not greed"},{"phase":"Practice","sessions":4,"focus":"Cost ledger"},{"phase":"Integration","sessions":1,"focus":"One steward act"},{"phase":"Mastery","sessions":1,"focus":"Abundance as default"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Stewardship not greed",
    "required": [
      "ritual.opening-bow",
      "wisdom.gita.2.47",
      "framework.witness-vs-thinker"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Cost ledger",
    "required": [
      "loop.cost-ledger",
      "journal.head-heart-gut-check",
      "contemplation.sit-with-question"
    ],
    "targetMinutes": 22
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "What is enough",
    "required": [
      "contemplation.what-do-i-truly-want",
      "journal.three-wins",
      "meditation.loving-kindness"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Receive cleanly",
    "required": [
      "micro-act.thank-someone",
      "voice-journal.gratitude-3",
      "mudra.anjali"
    ],
    "targetMinutes": 20
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Give cleanly",
    "required": [
      "micro-act.thank-someone",
      "speech-vow.one-honest-thing",
      "journal.loop-of-the-day"
    ],
    "targetMinutes": 20
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "One steward act",
    "required": [
      "micro-act.tidy-one-thing",
      "speech-vow.say-it-shorter",
      "journal.day-in-one-sentence"
    ],
    "targetMinutes": 15
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Abundance as default",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
