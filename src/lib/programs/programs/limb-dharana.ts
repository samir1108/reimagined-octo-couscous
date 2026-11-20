import type { SessionProgramV3 } from "../types";

export const LIMB_DHARANA: SessionProgramV3 = {
  id: "limb-dharana",
  title: "Limb 6 · Dharana",
  subtitle: "One-pointed concentration",
  description: "A 7-session arc training the mind to hold one object.",
  difficulty: "intermediate",
  category: "mind",
  tags: ["8-limbs","dharana","focus"],
  icon: "Target",
  coverGradient: "from-amber-700 to-red-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Why one object"},{"phase":"Practice","sessions":4,"focus":"Counted breath"},{"phase":"Integration","sessions":1,"focus":"Single-tasking life"},{"phase":"Mastery","sessions":1,"focus":"Effortless focus"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Why one object",
    "required": [
      "ritual.opening-bow",
      "framework.witness-vs-thinker",
      "neuro.default-mode-network"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Counted breath",
    "required": [
      "concentration.count-breath-21",
      "meditation.anchor-breath",
      "witness.thought-counter"
    ],
    "targetMinutes": 20
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Candle trataka",
    "required": [
      "concentration.candle-flame",
      "concentration.candle-trataka",
      "meditation.body-as-anchor"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Mantra hold",
    "required": [
      "mantra.so-hum",
      "mudra.chin",
      "meditation.anchor-breath"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Inner image hold",
    "required": [
      "observe.one-object",
      "meditation.body-as-anchor",
      "witness.gap-between-thoughts"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Single-tasking life",
    "required": [
      "detox.single-tab",
      "micro-act.tidy-one-thing",
      "speech-vow.say-it-shorter"
    ],
    "targetMinutes": 15
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Effortless focus",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
