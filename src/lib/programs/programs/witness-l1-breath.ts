import type { SessionProgramV3 } from "../types";

export const WITNESS_L1_BREATH: SessionProgramV3 = {
  id: "witness-l1-breath",
  title: "Witness · Level 1",
  subtitle: "Breath watching — the first sakshi",
  description: "A 7-session arc training pure observation of the breath.",
  difficulty: "beginner",
  category: "mind",
  tags: ["witness","breath","sakshi"],
  icon: "Wind",
  coverGradient: "from-sky-700 to-indigo-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"What is witnessing?"},{"phase":"Practice","sessions":4,"focus":"Count 21 breaths"},{"phase":"Integration","sessions":1,"focus":"Breath in the day"},{"phase":"Mastery","sessions":1,"focus":"Breath as bell"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "What is witnessing?",
    "required": [
      "ritual.opening-bow",
      "teach.witness.what-is-sakshi",
      "framework.witness-vs-thinker"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Count 21 breaths",
    "required": [
      "concentration.count-breath-21",
      "meditation.anchor-breath",
      "witness.gap-between-thoughts"
    ],
    "targetMinutes": 18
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Feel breath in nostrils",
    "required": [
      "breath.coherent-5-5",
      "observe.5-senses",
      "meditation.anchor-breath"
    ],
    "targetMinutes": 20
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Watch breath, not control",
    "required": [
      "meditation.body-as-anchor",
      "witness.thought-as-object",
      "meditation.choiceless-awareness"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Long sit, breath only",
    "required": [
      "meditation.anchor-breath",
      "witness.name-the-watcher",
      "meditation.open-awareness"
    ],
    "targetMinutes": 25
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Breath in the day",
    "required": [
      "micro-act.drink-water",
      "somatic.sigh-3x",
      "journal.head-heart-gut-check"
    ],
    "targetMinutes": 15
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Breath as bell",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "mantra.so-hum",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
