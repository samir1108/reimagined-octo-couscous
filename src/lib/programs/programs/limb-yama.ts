import type { SessionProgramV3 } from "../types";

export const LIMB_YAMA: SessionProgramV3 = {
  id: "limb-yama",
  title: "Limb 1 · Yama",
  subtitle: "Restraints — how to be with others",
  description: "A 7-session arc through ahimsa, satya, asteya, brahmacharya, aparigraha.",
  difficulty: "beginner",
  category: "wisdom",
  tags: ["8-limbs","yama","ethics"],
  icon: "Shield",
  coverGradient: "from-emerald-700 to-stone-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Why restraint"},{"phase":"Practice","sessions":4,"focus":"Ahimsa — non-harm"},{"phase":"Integration","sessions":1,"focus":"Aparigraha — non-grasping"},{"phase":"Mastery","sessions":1,"focus":"Yama as freedom"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Why restraint",
    "required": [
      "ritual.opening-bow",
      "framework.witness-vs-thinker",
      "journal.head-heart-gut-check"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Ahimsa — non-harm",
    "required": [
      "speech-vow.no-complaint-1h",
      "meditation.loving-kindness",
      "journal.loop-of-the-day"
    ],
    "targetMinutes": 20
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Satya — truth",
    "required": [
      "speech-vow.one-honest-thing",
      "journal.what-am-i-avoiding",
      "contemplation.sit-with-question"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Asteya — non-stealing",
    "required": [
      "micro-act.thank-someone",
      "journal.three-wins",
      "speech-vow.say-it-shorter"
    ],
    "targetMinutes": 20
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Brahmacharya — energy stewardship",
    "required": [
      "detox.no-phone-30min",
      "breath.coherent-5-5",
      "meditation.anchor-breath"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Aparigraha — non-grasping",
    "required": [
      "contemplation.if-i-died-tomorrow",
      "micro-act.tidy-one-thing",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 20
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Yama as freedom",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
