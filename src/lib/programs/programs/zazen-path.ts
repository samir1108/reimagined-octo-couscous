import type { SessionProgramV3 } from "../types";

export const ZAZEN_PATH: SessionProgramV3 = {
  id: "zazen-path",
  title: "Zazen Path",
  subtitle: "Just sitting",
  description: "A 7-session arc into Soto Zen — shikantaza, posture, and the koan of presence.",
  difficulty: "intermediate",
  category: "mind",
  tags: ["zen","zazen","shikantaza"],
  icon: "Square",
  coverGradient: "from-stone-700 to-zinc-950",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Why just sit"},{"phase":"Practice","sessions":4,"focus":"Posture as practice"},{"phase":"Integration","sessions":1,"focus":"Walking zen"},{"phase":"Mastery","sessions":1,"focus":"Nothing special"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Why just sit",
    "required": [
      "ritual.opening-bow",
      "teach.koan.who-asks",
      "framework.witness-vs-thinker"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Posture as practice",
    "required": [
      "body.head-to-toe",
      "mudra.dhyana",
      "meditation.body-as-anchor"
    ],
    "targetMinutes": 20
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Susokukan — count breath",
    "required": [
      "concentration.count-breath-21",
      "meditation.anchor-breath",
      "witness.gap-between-thoughts"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Shikantaza — no method",
    "required": [
      "meditation.choiceless-awareness",
      "meditation.sky-mind",
      "witness.name-the-watcher"
    ],
    "targetMinutes": 28
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Long sit",
    "required": [
      "meditation.open-awareness",
      "meditation.body-as-anchor",
      "witness.gap-between-thoughts"
    ],
    "targetMinutes": 30
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Walking zen",
    "required": [
      "observe.5-senses",
      "micro-act.tidy-one-thing",
      "speech-vow.say-it-shorter"
    ],
    "targetMinutes": 15
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Nothing special",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 25
  }
],
};
