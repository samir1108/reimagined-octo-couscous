import type { SessionProgramV3 } from "../types";

export const WITNESS_L5_PURE: SessionProgramV3 = {
  id: "witness-l5-pure",
  title: "Witness · Level 5",
  subtitle: "Pure watching — no object, no method",
  description: "A 7-session arc into objectless awareness.",
  difficulty: "advanced",
  category: "mind",
  tags: ["witness","open-awareness","pure"],
  icon: "Infinity",
  coverGradient: "from-indigo-900 to-black",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Drop the object"},{"phase":"Practice","sessions":4,"focus":"Choiceless awareness"},{"phase":"Integration","sessions":1,"focus":"Walking awareness"},{"phase":"Mastery","sessions":1,"focus":"I am awareness itself"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Drop the object",
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
    "intent": "Choiceless awareness",
    "required": [
      "meditation.choiceless-awareness",
      "witness.name-the-watcher",
      "meditation.open-awareness"
    ],
    "targetMinutes": 25
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Sky mind, long sit",
    "required": [
      "meditation.sky-mind",
      "witness.gap-between-thoughts",
      "meditation.open-awareness"
    ],
    "targetMinutes": 28
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Who is aware?",
    "required": [
      "inquiry.what-is-aware",
      "witness.who-is-watching",
      "contemplation.sit-with-question"
    ],
    "targetMinutes": 25
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Rest as awareness",
    "required": [
      "meditation.open-awareness",
      "meditation.sky-mind",
      "witness.name-the-watcher"
    ],
    "targetMinutes": 30
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Walking awareness",
    "required": [
      "observe.5-senses",
      "observe.three-sounds",
      "micro-act.tidy-one-thing"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "I am awareness itself",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "mantra.aham-brahmasmi",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 28
  }
],
};
