import type { SessionProgramV3 } from "../types";

export const BURNOUT_RECOVERY: SessionProgramV3 = {
  id: "burnout-recovery",
  title: "Burnout Recovery",
  subtitle: "Refill what work emptied",
  description: "A 7-session arc to interrupt the burnout spiral and restore baseline.",
  difficulty: "beginner",
  category: "rest",
  tags: ["burnout","recovery","rest"],
  icon: "BatteryLow",
  coverGradient: "from-stone-700 to-slate-950",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Name the depletion"},{"phase":"Practice","sessions":4,"focus":"Permission to rest"},{"phase":"Integration","sessions":1,"focus":"One sustainable change"},{"phase":"Mastery","sessions":1,"focus":"Energy as sadhana"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Name the depletion",
    "required": [
      "ritual.opening-bow",
      "framework.window-of-tolerance",
      "journal.head-heart-gut-check"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Permission to rest",
    "required": [
      "detox.no-phone-30min",
      "breath.coherent-5-5",
      "body.head-to-toe"
    ],
    "targetMinutes": 20
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Nervous-system reset",
    "required": [
      "breath.physiological-sigh",
      "somatic.tense-release",
      "meditation.body-as-anchor"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "See the source loop",
    "required": [
      "loop.identify-trigger",
      "loop.cost-ledger",
      "ai-mirror.pattern-reflect"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Boundary in the body",
    "required": [
      "body.felt-sense",
      "speech-vow.one-honest-thing",
      "journal.what-am-i-avoiding"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "One sustainable change",
    "required": [
      "micro-act.tidy-one-thing",
      "speech-vow.pause-before-reply",
      "journal.loop-of-the-day"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Energy as sadhana",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
