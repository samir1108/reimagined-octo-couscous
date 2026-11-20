import type { SessionProgramV3 } from "../types";

export const INNER_SMILE: SessionProgramV3 = {
  id: "inner-smile",
  title: "Inner Smile",
  subtitle: "Taoist micro-healing",
  description: "A 7-session arc through the Taoist inner-smile practice — heal organs with attention.",
  difficulty: "beginner",
  category: "embodiment",
  tags: ["taoist","inner-smile","healing"],
  icon: "Smile",
  coverGradient: "from-amber-600 to-emerald-800",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Smile as medicine"},{"phase":"Practice","sessions":4,"focus":"Smile into face & throat"},{"phase":"Integration","sessions":1,"focus":"Smile in waiting moments"},{"phase":"Mastery","sessions":1,"focus":"Smile as baseline"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Smile as medicine",
    "required": [
      "ritual.opening-bow",
      "wisdom.tao.11",
      "neuro.interoception"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Smile into face & throat",
    "required": [
      "somatic.jaw-release",
      "body.head-to-toe",
      "meditation.body-as-anchor"
    ],
    "targetMinutes": 20
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Smile into heart",
    "required": [
      "body.felt-sense",
      "meditation.loving-kindness",
      "breath.coherent-5-5"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Smile into gut",
    "required": [
      "body.tension-map",
      "somatic.tense-release",
      "breath.physiological-sigh"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Full-body smile",
    "required": [
      "body.full-scan-5min",
      "meditation.loving-kindness",
      "meditation.open-awareness"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Smile in waiting moments",
    "required": [
      "micro-act.drink-water",
      "somatic.sigh-3x",
      "journal.three-wins"
    ],
    "targetMinutes": 15
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Smile as baseline",
    "required": [
      "ritual.opening-bow",
      "meditation.loving-kindness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
