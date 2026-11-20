import type { SessionProgramV3 } from "../types";

export const LIMB_PRATYAHARA: SessionProgramV3 = {
  id: "limb-pratyahara",
  title: "Limb 5 · Pratyahara",
  subtitle: "Withdrawal of the senses",
  description: "A 7-session arc to unhook from sensory input and meet the inner field.",
  difficulty: "intermediate",
  category: "mind",
  tags: ["8-limbs","pratyahara","senses"],
  icon: "EyeOff",
  coverGradient: "from-slate-700 to-indigo-950",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Turtle of the senses"},{"phase":"Practice","sessions":4,"focus":"Sound withdrawal"},{"phase":"Integration","sessions":1,"focus":"Pratyahara in noise"},{"phase":"Mastery","sessions":1,"focus":"Inner field as home"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Turtle of the senses",
    "required": [
      "ritual.opening-bow",
      "wisdom.gita.2.47",
      "framework.witness-vs-thinker"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Sound withdrawal",
    "required": [
      "detox.silence-1h",
      "observe.three-sounds",
      "meditation.anchor-breath"
    ],
    "targetMinutes": 20
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Sight withdrawal",
    "required": [
      "detox.no-screen-1h-morning",
      "observe.one-object",
      "meditation.body-as-anchor"
    ],
    "targetMinutes": 20
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Touch withdrawal",
    "required": [
      "body.felt-sense",
      "mudra.dhyana",
      "meditation.choiceless-awareness"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "All senses inward",
    "required": [
      "breath.nadi-shodhana",
      "meditation.open-awareness",
      "witness.gap-between-thoughts"
    ],
    "targetMinutes": 25
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Pratyahara in noise",
    "required": [
      "detox.no-news-24h",
      "speech-vow.pause-before-reply",
      "journal.loop-of-the-day"
    ],
    "targetMinutes": 15
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Inner field as home",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
