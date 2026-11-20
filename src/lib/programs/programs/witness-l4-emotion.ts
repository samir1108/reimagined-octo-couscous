import type { SessionProgramV3 } from "../types";

export const WITNESS_L4_EMOTION: SessionProgramV3 = {
  id: "witness-l4-emotion",
  title: "Witness · Level 4",
  subtitle: "Emotion sakshi — feel without becoming",
  description: "A 7-session arc witnessing emotion as weather in the body.",
  difficulty: "intermediate",
  category: "emotional",
  tags: ["witness","emotion","rain"],
  icon: "CloudRain",
  coverGradient: "from-rose-700 to-indigo-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Emotion is signal"},{"phase":"Practice","sessions":4,"focus":"Name to tame"},{"phase":"Integration","sessions":1,"focus":"Emotion in relating"},{"phase":"Mastery","sessions":1,"focus":"Emotion as energy"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Emotion is signal",
    "required": [
      "ritual.opening-bow",
      "framework.window-of-tolerance",
      "neuro.interoception"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Name to tame",
    "required": [
      "emotion.precise-name",
      "emotion.label-to-tame",
      "journal.head-heart-gut-check"
    ],
    "targetMinutes": 20
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "RAIN protocol",
    "required": [
      "emotion.rain",
      "emotion.where-in-body",
      "meditation.anchor-breath"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Hold without fixing",
    "required": [
      "ifs.meet-a-part",
      "contemplation.sit-with-question",
      "witness.thought-as-object"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Watch the weather pass",
    "required": [
      "meditation.choiceless-awareness",
      "witness.gap-between-thoughts",
      "meditation.open-awareness"
    ],
    "targetMinutes": 25
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Emotion in relating",
    "required": [
      "speech-vow.pause-before-reply",
      "voice-journal.speak-it-out",
      "micro-act.thank-someone"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Emotion as energy",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "mantra.so-hum",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
