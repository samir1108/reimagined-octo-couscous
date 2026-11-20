import type { SessionProgramV3 } from "../types";

export const RAJA_YOGA: SessionProgramV3 = {
  id: "raja-yoga",
  title: "Raja Yoga",
  subtitle: "The royal eight-limbed path",
  description: "A 7-session arc through Patanjali's royal road — yamas, niyamas, asana, pranayama, pratyahara, dharana, dhyana, samadhi.",
  difficulty: "intermediate",
  category: "wisdom",
  tags: ["raja","patanjali","8-limbs"],
  icon: "Crown",
  coverGradient: "from-amber-700 to-purple-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":2,"focus":"The eight limbs"},{"phase":"Practice","sessions":3,"focus":"Asana — body as seat"},{"phase":"Integration","sessions":1,"focus":"Dharana — concentration"},{"phase":"Mastery","sessions":1,"focus":"Dhyana into Samadhi"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "The eight limbs",
    "required": [
      "ritual.opening-bow",
      "wisdom.gita.6.5",
      "framework.witness-vs-thinker"
    ],
    "targetMinutes": 18
  },
  {
    "index": 2,
    "phase": "Foundation",
    "intent": "Yamas & Niyamas in life",
    "required": [
      "journal.head-heart-gut-check",
      "speech-vow.one-honest-thing",
      "micro-act.tidy-one-thing"
    ],
    "targetMinutes": 20
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Asana — body as seat",
    "required": [
      "movement.sun-salute-1",
      "body.head-to-toe",
      "mudra.dhyana"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Pranayama — breath as bridge",
    "required": [
      "breath.nadi-shodhana",
      "breath.coherent-5-5",
      "meditation.anchor-breath"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Pratyahara — withdraw senses",
    "required": [
      "detox.silence-1h",
      "observe.5-senses",
      "witness.gap-between-thoughts"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Dharana — concentration",
    "required": [
      "concentration.candle-trataka",
      "concentration.count-breath-21",
      "meditation.anchor-breath"
    ],
    "targetMinutes": 22
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Dhyana into Samadhi",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "mantra.aham-brahmasmi",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 25
  }
],
};
