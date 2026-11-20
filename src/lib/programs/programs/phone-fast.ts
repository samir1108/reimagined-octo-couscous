import type { SessionProgramV3 } from "../types";

export const PHONE_FAST: SessionProgramV3 = {
  id: "phone-fast",
  title: "Phone Fast",
  subtitle: "A 7-day device sadhana",
  description: "A 7-session arc to interrupt compulsive phone use.",
  difficulty: "beginner",
  category: "mind",
  tags: ["phone","detox","attention"],
  icon: "PhoneOff",
  coverGradient: "from-slate-800 to-stone-950",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"See the dependency"},{"phase":"Practice","sessions":4,"focus":"30 min phone-free"},{"phase":"Integration","sessions":1,"focus":"Phone hygiene rules"},{"phase":"Mastery","sessions":1,"focus":"Phone as tool, not master"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "See the dependency",
    "required": [
      "ritual.opening-bow",
      "framework.witness-vs-thinker",
      "loop.identify-trigger"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "30 min phone-free",
    "required": [
      "detox.no-phone-30min",
      "observe.5-senses",
      "meditation.anchor-breath"
    ],
    "targetMinutes": 18
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Morning phone fast",
    "required": [
      "detox.no-screen-1h-morning",
      "breath.coherent-5-5",
      "journal.morning-pages-3"
    ],
    "targetMinutes": 20
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Single-tab work",
    "required": [
      "detox.single-tab",
      "concentration.count-breath-21",
      "micro-act.tidy-one-thing"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "No-phone meal",
    "required": [
      "micro-act.no-phone-meal",
      "observe.5-senses",
      "journal.head-heart-gut-check"
    ],
    "targetMinutes": 18
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Phone hygiene rules",
    "required": [
      "speech-vow.one-honest-thing",
      "journal.loop-of-the-day",
      "micro-act.tidy-one-thing"
    ],
    "targetMinutes": 15
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Phone as tool, not master",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
