import type { SessionProgramV3 } from "../types";

export const VIPASSANA_PATH: SessionProgramV3 = {
  id: "vipassana-path",
  title: "Vipassana Path",
  subtitle: "See things as they are",
  description: "A 7-session arc through the Theravada insight path of impermanence, suffering, and non-self.",
  difficulty: "intermediate",
  category: "mind",
  tags: ["vipassana","insight","theravada"],
  icon: "Aperture",
  coverGradient: "from-amber-800 to-emerald-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"The three marks"},{"phase":"Practice","sessions":4,"focus":"Anapanasati — breath"},{"phase":"Integration","sessions":1,"focus":"Insight in life"},{"phase":"Mastery","sessions":1,"focus":"Anicca, dukkha, anatta"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "The three marks",
    "required": [
      "ritual.opening-bow",
      "wisdom.dhammapada.1",
      "framework.witness-vs-thinker"
    ],
    "targetMinutes": 18
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Anapanasati — breath",
    "required": [
      "breath.coherent-5-5",
      "meditation.anchor-breath",
      "concentration.count-breath-21"
    ],
    "targetMinutes": 22
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Body sweep",
    "required": [
      "body.head-to-toe",
      "body.full-scan-5min",
      "witness.thought-as-object"
    ],
    "targetMinutes": 25
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Sensation as wave",
    "required": [
      "body.felt-sense",
      "meditation.choiceless-awareness",
      "witness.gap-between-thoughts"
    ],
    "targetMinutes": 25
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Equanimity in burn",
    "required": [
      "somatic.tense-release",
      "meditation.anchor-breath",
      "emotion.rain"
    ],
    "targetMinutes": 25
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Insight in life",
    "required": [
      "observe.5-senses",
      "journal.loop-of-the-day",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Anicca, dukkha, anatta",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "mantra.so-hum",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 25
  }
],
};
