import type { SessionProgramV3 } from "../types";

export const UJJAYI_DEEP: SessionProgramV3 = {
  id: "ujjayi-deep",
  title: "Ujjayi Deep",
  subtitle: "Ocean breath — calm with strength",
  description: "A 7-session arc into ujjayi — the victorious breath.",
  difficulty: "beginner",
  category: "embodiment",
  tags: ["pranayama","ujjayi","ocean"],
  icon: "Waves",
  coverGradient: "from-cyan-700 to-blue-950",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Ocean in the throat"},{"phase":"Practice","sessions":4,"focus":"Find the sound"},{"phase":"Integration","sessions":1,"focus":"Ujjayi in stress"},{"phase":"Mastery","sessions":1,"focus":"Ocean as baseline"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Ocean in the throat",
    "required": [
      "ritual.opening-bow",
      "neuro.vagus-nerve",
      "framework.witness-vs-thinker"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Find the sound",
    "required": [
      "breath.ujjayi",
      "meditation.anchor-breath",
      "mudra.chin"
    ],
    "targetMinutes": 18
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Ujjayi 5-5",
    "required": [
      "breath.ujjayi",
      "breath.coherent-5-5",
      "meditation.body-as-anchor"
    ],
    "targetMinutes": 20
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "With movement",
    "required": [
      "movement.sun-salute-1",
      "breath.ujjayi",
      "meditation.anchor-breath"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Long sit, ocean only",
    "required": [
      "breath.ujjayi",
      "witness.gap-between-thoughts",
      "meditation.open-awareness"
    ],
    "targetMinutes": 25
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Ujjayi in stress",
    "required": [
      "speech-vow.pause-before-reply",
      "somatic.jaw-release",
      "journal.head-heart-gut-check"
    ],
    "targetMinutes": 15
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Ocean as baseline",
    "required": [
      "ritual.opening-bow",
      "breath.ujjayi",
      "meditation.open-awareness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
