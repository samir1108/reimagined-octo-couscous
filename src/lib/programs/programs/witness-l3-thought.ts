import type { SessionProgramV3 } from "../types";

export const WITNESS_L3_THOUGHT: SessionProgramV3 = {
  id: "witness-l3-thought",
  title: "Witness · Level 3",
  subtitle: "Thought watching — observe the mind",
  description: "A 7-session arc witnessing thought as weather, not self.",
  difficulty: "intermediate",
  category: "mind",
  tags: ["witness","thought"],
  icon: "CloudCog",
  coverGradient: "from-violet-700 to-slate-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Thoughts are not you"},{"phase":"Practice","sessions":4,"focus":"Count thoughts"},{"phase":"Integration","sessions":1,"focus":"Thought hygiene"},{"phase":"Mastery","sessions":1,"focus":"Free of mind-rule"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Thoughts are not you",
    "required": [
      "ritual.opening-bow",
      "framework.witness-vs-thinker",
      "teach.witness.what-is-sakshi"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Count thoughts",
    "required": [
      "witness.thought-counter",
      "observe.thought-count",
      "meditation.anchor-breath"
    ],
    "targetMinutes": 20
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Label thoughts",
    "required": [
      "witness.thought-as-object",
      "emotion.label-to-tame",
      "witness.gap-between-thoughts"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Find the gap",
    "required": [
      "witness.gap-between-thoughts",
      "meditation.choiceless-awareness",
      "meditation.sky-mind"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Sky mind",
    "required": [
      "meditation.sky-mind",
      "meditation.open-awareness",
      "witness.name-the-watcher"
    ],
    "targetMinutes": 25
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Thought hygiene",
    "required": [
      "journal.loop-of-the-day",
      "speech-vow.pause-before-reply",
      "micro-act.tidy-one-thing"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Free of mind-rule",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "mantra.aham-brahmasmi",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
