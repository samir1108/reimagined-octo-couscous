import type { SessionProgramV3 } from "../types";

export const LIMB_DHYANA: SessionProgramV3 = {
  id: "limb-dhyana",
  title: "Limb 7 · Dhyana",
  subtitle: "Sustained meditation",
  description: "A 7-session arc into unbroken meditation flow.",
  difficulty: "advanced",
  category: "mind",
  tags: ["8-limbs","dhyana","flow"],
  icon: "Sparkles",
  coverGradient: "from-indigo-800 to-violet-950",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Dharana → Dhyana"},{"phase":"Practice","sessions":4,"focus":"Anchor that dissolves"},{"phase":"Integration","sessions":1,"focus":"Carry the flow"},{"phase":"Mastery","sessions":1,"focus":"Meditation as state"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Dharana → Dhyana",
    "required": [
      "ritual.opening-bow",
      "framework.witness-vs-thinker",
      "wisdom.gita.6.5"
    ],
    "targetMinutes": 18
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Anchor that dissolves",
    "required": [
      "meditation.anchor-breath",
      "witness.gap-between-thoughts",
      "meditation.choiceless-awareness"
    ],
    "targetMinutes": 25
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Long sit, breath only",
    "required": [
      "breath.coherent-5-5",
      "meditation.body-as-anchor",
      "meditation.open-awareness"
    ],
    "targetMinutes": 30
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Sky-mind hold",
    "required": [
      "meditation.sky-mind",
      "meditation.choiceless-awareness",
      "witness.name-the-watcher"
    ],
    "targetMinutes": 30
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Objectless meditation",
    "required": [
      "meditation.open-awareness",
      "witness.who-is-watching",
      "contemplation.sit-with-question"
    ],
    "targetMinutes": 30
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Carry the flow",
    "required": [
      "observe.5-senses",
      "micro-act.tidy-one-thing",
      "speech-vow.pause-before-reply"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Meditation as state",
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
