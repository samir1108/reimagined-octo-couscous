import type { SessionProgramV3 } from "../types";

export const SELF_INQUIRY_L5: SessionProgramV3 = {
  id: "self-inquiry-l5-direct-pointing",
  title: "Self-Inquiry · Level 5",
  subtitle: "Direct pointing — already-here",
  description: "A 7-session arc of direct pointing — no method, only recognition.",
  difficulty: "advanced",
  category: "wisdom",
  tags: ["direct-pointing","non-dual"],
  icon: "Zap",
  coverGradient: "from-zinc-900 to-black",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Nothing to attain"},{"phase":"Practice","sessions":4,"focus":"Recognize awareness now"},{"phase":"Integration","sessions":1,"focus":"Walking awareness"},{"phase":"Mastery","sessions":1,"focus":"This is It"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Nothing to attain",
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
    "intent": "Recognize awareness now",
    "required": [
      "inquiry.what-is-aware",
      "witness.name-the-watcher",
      "meditation.sky-mind"
    ],
    "targetMinutes": 22
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "No subject, no object",
    "required": [
      "meditation.choiceless-awareness",
      "witness.thought-as-object",
      "meditation.open-awareness"
    ],
    "targetMinutes": 25
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Look for the looker",
    "required": [
      "inquiry.where-is-the-i",
      "witness.who-is-watching",
      "contemplation.sit-with-question"
    ],
    "targetMinutes": 25
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Rest as awareness",
    "required": [
      "meditation.open-awareness",
      "witness.gap-between-thoughts",
      "meditation.sky-mind"
    ],
    "targetMinutes": 28
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Walking awareness",
    "required": [
      "observe.5-senses",
      "micro-act.tidy-one-thing",
      "speech-vow.pause-before-reply"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "This is It",
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
