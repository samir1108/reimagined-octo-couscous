import type { SessionProgramV3 } from "../types";

export const TRATAKA_PATH: SessionProgramV3 = {
  id: "trataka-path",
  title: "Trataka Path",
  subtitle: "Steady-gazing concentration",
  description: "A 7-session arc training dharana through candle and inner gazing.",
  difficulty: "intermediate",
  category: "mind",
  tags: ["trataka","dharana","candle"],
  icon: "Flame",
  coverGradient: "from-amber-600 to-red-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Why gazing trains mind"},{"phase":"Practice","sessions":4,"focus":"Outer flame"},{"phase":"Integration","sessions":1,"focus":"One-pointed life"},{"phase":"Mastery","sessions":1,"focus":"Effortless focus"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Why gazing trains mind",
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
    "intent": "Outer flame",
    "required": [
      "concentration.candle-flame",
      "concentration.candle-trataka",
      "meditation.anchor-breath"
    ],
    "targetMinutes": 20
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Hold the after-image",
    "required": [
      "concentration.candle-trataka",
      "witness.gap-between-thoughts",
      "meditation.body-as-anchor"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Inner trataka",
    "required": [
      "observe.one-object",
      "meditation.anchor-breath",
      "witness.thought-as-object"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Long gaze, no blink",
    "required": [
      "concentration.candle-trataka",
      "meditation.choiceless-awareness",
      "witness.name-the-watcher"
    ],
    "targetMinutes": 25
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "One-pointed life",
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
