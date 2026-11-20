import type { SessionProgramV3 } from "../types";

export const SELF_INQUIRY_L3: SessionProgramV3 = {
  id: "self-inquiry-l3-ramana",
  title: "Self-Inquiry · Level 3",
  subtitle: "The Ramana method — Who am I?",
  description: "A 7-session arc in Ramana Maharshi's direct method.",
  difficulty: "intermediate",
  category: "wisdom",
  tags: ["ramana","who-am-i"],
  icon: "Eye",
  coverGradient: "from-amber-800 to-stone-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"The one question"},{"phase":"Practice","sessions":4,"focus":"Who am I — first round"},{"phase":"Integration","sessions":1,"focus":"Carry the inquiry"},{"phase":"Mastery","sessions":1,"focus":"The heart on the right"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "The one question",
    "required": [
      "ritual.opening-bow",
      "wisdom.ashtavakra.1.4",
      "teach.koan.who-asks"
    ],
    "targetMinutes": 18
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Who am I — first round",
    "required": [
      "inquiry.who-am-i",
      "meditation.anchor-breath",
      "witness.name-the-watcher"
    ],
    "targetMinutes": 22
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Who am I — body negation",
    "required": [
      "body.head-to-toe",
      "inquiry.who-am-i",
      "witness.thought-as-object"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Who am I — mind negation",
    "required": [
      "witness.gap-between-thoughts",
      "inquiry.who-am-i",
      "meditation.choiceless-awareness"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Trace the I to its source",
    "required": [
      "inquiry.where-is-the-i",
      "contemplation.sit-with-question",
      "witness.who-is-watching"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Carry the inquiry",
    "required": [
      "micro-act.tidy-one-thing",
      "speech-vow.pause-before-reply",
      "voice-journal.speak-it-out"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "The heart on the right",
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
