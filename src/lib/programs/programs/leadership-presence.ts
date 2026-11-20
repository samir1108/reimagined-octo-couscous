import type { SessionProgramV3 } from "../types";

export const LEADERSHIP_PRESENCE: SessionProgramV3 = {
  id: "leadership-presence",
  title: "Leadership Presence",
  subtitle: "Lead from grounded awareness",
  description: "A 7-session arc for embodied, regulated leadership.",
  difficulty: "intermediate",
  category: "wisdom",
  tags: ["leadership","presence","work"],
  icon: "Crown",
  coverGradient: "from-stone-800 to-indigo-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Who you are leads"},{"phase":"Practice","sessions":4,"focus":"Ground in body"},{"phase":"Integration","sessions":1,"focus":"One present meeting"},{"phase":"Mastery","sessions":1,"focus":"Servant leader"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Who you are leads",
    "required": [
      "ritual.opening-bow",
      "framework.witness-vs-thinker",
      "wisdom.gita.6.5"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Ground in body",
    "required": [
      "body.head-to-toe",
      "meditation.body-as-anchor",
      "mudra.dhyana"
    ],
    "targetMinutes": 20
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Listen across power",
    "required": [
      "observe.three-sounds",
      "speech-vow.pause-before-reply",
      "meditation.loving-kindness"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Decide from clarity",
    "required": [
      "council.three-perspectives",
      "contemplation.sit-with-question",
      "journal.head-heart-gut-check"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Hold hard truth",
    "required": [
      "speech-vow.one-honest-thing",
      "emotion.precise-name",
      "breath.coherent-5-5"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "One present meeting",
    "required": [
      "speech-vow.say-it-shorter",
      "journal.loop-of-the-day",
      "micro-act.thank-someone"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Servant leader",
    "required": [
      "ritual.opening-bow",
      "meditation.loving-kindness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
