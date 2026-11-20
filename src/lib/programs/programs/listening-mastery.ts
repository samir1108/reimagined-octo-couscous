import type { SessionProgramV3 } from "../types";

export const LISTENING_MASTERY: SessionProgramV3 = {
  id: "listening-mastery",
  title: "Listening Mastery",
  subtitle: "The fastest way to be loved",
  description: "A 7-session arc to develop full-bodied listening.",
  difficulty: "beginner",
  category: "heart",
  tags: ["listening","presence","communication"],
  icon: "Ear",
  coverGradient: "from-teal-700 to-indigo-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Listening is presence"},{"phase":"Practice","sessions":4,"focus":"Drop the rebuttal"},{"phase":"Integration","sessions":1,"focus":"Real listening rep"},{"phase":"Mastery","sessions":1,"focus":"Listen them whole"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Listening is presence",
    "required": [
      "ritual.opening-bow",
      "framework.witness-vs-thinker",
      "observe.three-sounds"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Drop the rebuttal",
    "required": [
      "witness.thought-as-object",
      "speech-vow.pause-before-reply",
      "meditation.anchor-breath"
    ],
    "targetMinutes": 20
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Hear with body",
    "required": [
      "body.felt-sense",
      "meditation.body-as-anchor",
      "observe.5-senses"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Reflect before respond",
    "required": [
      "speech-vow.say-it-shorter",
      "voice-journal.speak-it-out",
      "meditation.loving-kindness"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Listen to silence too",
    "required": [
      "detox.silence-1h",
      "witness.gap-between-thoughts",
      "meditation.open-awareness"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Real listening rep",
    "required": [
      "micro-act.call-someone",
      "speech-vow.pause-before-reply",
      "journal.loop-of-the-day"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Listen them whole",
    "required": [
      "ritual.opening-bow",
      "meditation.loving-kindness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
