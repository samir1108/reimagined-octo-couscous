import type { SessionProgramV3 } from "../types";

export const LIMB_SAMADHI: SessionProgramV3 = {
  id: "limb-samadhi",
  title: "Limb 8 · Samadhi",
  subtitle: "Absorption — the meeter and met dissolve",
  description: "A 7-session arc pointing toward samadhi as recognition, not attainment.",
  difficulty: "advanced",
  category: "wisdom",
  tags: ["8-limbs","samadhi","non-dual"],
  icon: "Infinity",
  coverGradient: "from-violet-900 to-black",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"What is samadhi"},{"phase":"Practice","sessions":4,"focus":"Drop the seeker"},{"phase":"Integration","sessions":1,"focus":"Live as That"},{"phase":"Mastery","sessions":1,"focus":"Already free"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "What is samadhi",
    "required": [
      "ritual.opening-bow",
      "wisdom.upanishad.tat-tvam-asi",
      "framework.witness-vs-thinker"
    ],
    "targetMinutes": 18
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Drop the seeker",
    "required": [
      "inquiry.who-am-i",
      "witness.name-the-watcher",
      "meditation.sky-mind"
    ],
    "targetMinutes": 25
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Subject-object collapse",
    "required": [
      "inquiry.what-is-aware",
      "meditation.choiceless-awareness",
      "meditation.open-awareness"
    ],
    "targetMinutes": 28
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Rest as awareness",
    "required": [
      "meditation.open-awareness",
      "witness.who-is-watching",
      "meditation.sky-mind"
    ],
    "targetMinutes": 30
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Beyond witness",
    "required": [
      "inquiry.before-this-thought",
      "meditation.choiceless-awareness",
      "meditation.open-awareness"
    ],
    "targetMinutes": 30
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Live as That",
    "required": [
      "observe.5-senses",
      "micro-act.tidy-one-thing",
      "speech-vow.one-honest-thing"
    ],
    "targetMinutes": 20
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Already free",
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
