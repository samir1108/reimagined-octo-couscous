import type { SessionProgramV3 } from "../types";

export const EGO_DISSOLUTION: SessionProgramV3 = {
  id: "ego-dissolution",
  title: "Ego Dissolution",
  subtitle: "Loosen the I that thinks it is real",
  description: "A 7-session arc to gently see through the self-construct.",
  difficulty: "advanced",
  category: "wisdom",
  tags: ["ego","non-dual","self"],
  icon: "CircleDashed",
  coverGradient: "from-zinc-800 to-violet-950",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"What is ego"},{"phase":"Practice","sessions":4,"focus":"Catch the I-thought"},{"phase":"Integration","sessions":1,"focus":"Walk without armor"},{"phase":"Mastery","sessions":1,"focus":"Already free of I"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "What is ego",
    "required": [
      "ritual.opening-bow",
      "wisdom.ashtavakra.1.4",
      "framework.witness-vs-thinker"
    ],
    "targetMinutes": 18
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Catch the I-thought",
    "required": [
      "inquiry.who-am-i",
      "witness.thought-counter",
      "witness.thought-as-object"
    ],
    "targetMinutes": 22
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "See its costs",
    "required": [
      "loop.cost-ledger",
      "shadow.what-i-hide",
      "ai-mirror.pattern-reflect"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Soften with compassion",
    "required": [
      "ifs.meet-a-part",
      "meditation.loving-kindness",
      "journal.unsent-letter"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Look for the looker",
    "required": [
      "inquiry.where-is-the-i",
      "meditation.choiceless-awareness",
      "meditation.open-awareness"
    ],
    "targetMinutes": 25
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Walk without armor",
    "required": [
      "speech-vow.one-honest-thing",
      "micro-act.tidy-one-thing",
      "journal.loop-of-the-day"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Already free of I",
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
