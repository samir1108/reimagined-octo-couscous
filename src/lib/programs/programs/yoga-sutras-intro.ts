import type { SessionProgramV3 } from "../types";

export const YOGA_SUTRAS_INTRO: SessionProgramV3 = {
  id: "yoga-sutras-intro",
  title: "Yoga Sutras · Intro",
  subtitle: "Patanjali in 7 sessions",
  description: "A 7-session entry into the foundational text of yoga.",
  difficulty: "intermediate",
  category: "wisdom",
  tags: ["sutras","patanjali","scripture"],
  icon: "BookOpen",
  coverGradient: "from-amber-700 to-stone-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"1.2 — yogah chitta vritti nirodha"},{"phase":"Practice","sessions":4,"focus":"The 5 vrittis"},{"phase":"Integration","sessions":1,"focus":"One sutra in life"},{"phase":"Mastery","sessions":1,"focus":"Kaivalya — freedom"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "1.2 — yogah chitta vritti nirodha",
    "required": [
      "ritual.opening-bow",
      "framework.witness-vs-thinker",
      "meditation.anchor-breath"
    ],
    "targetMinutes": 18
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "The 5 vrittis",
    "required": [
      "witness.thought-counter",
      "journal.loop-of-the-day",
      "meditation.choiceless-awareness"
    ],
    "targetMinutes": 22
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Abhyasa & vairagya",
    "required": [
      "contemplation.sit-with-question",
      "speech-vow.pause-before-reply",
      "meditation.anchor-breath"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Kleshas — root afflictions",
    "required": [
      "shadow.what-i-hide",
      "emotion.precise-name",
      "ifs.meet-a-part"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Ashtanga preview",
    "required": [
      "breath.nadi-shodhana",
      "concentration.candle-trataka",
      "meditation.open-awareness"
    ],
    "targetMinutes": 25
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "One sutra in life",
    "required": [
      "micro-act.tidy-one-thing",
      "journal.day-in-one-sentence",
      "speech-vow.one-honest-thing"
    ],
    "targetMinutes": 15
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Kaivalya — freedom",
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
