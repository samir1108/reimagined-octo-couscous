import type { SessionProgramV3 } from "../types";

export const SELF_INQUIRY_L4: SessionProgramV3 = {
  id: "self-inquiry-l4-nisargadatta",
  title: "Self-Inquiry · Level 4",
  subtitle: "Nisargadatta — sit in I-am",
  description: "A 7-session arc in the I-am method.",
  difficulty: "advanced",
  category: "wisdom",
  tags: ["nisargadatta","i-am"],
  icon: "Sparkles",
  coverGradient: "from-stone-800 to-zinc-950",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"The sense I-am"},{"phase":"Practice","sessions":4,"focus":"Locate the I-am"},{"phase":"Integration","sessions":1,"focus":"I-am in daily life"},{"phase":"Mastery","sessions":1,"focus":"The Absolute"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "The sense I-am",
    "required": [
      "ritual.opening-bow",
      "wisdom.upanishad.tat-tvam-asi",
      "framework.witness-vs-thinker"
    ],
    "targetMinutes": 18
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Locate the I-am",
    "required": [
      "body.felt-sense",
      "inquiry.what-is-aware",
      "witness.who-is-watching"
    ],
    "targetMinutes": 22
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Sit in I-am only",
    "required": [
      "meditation.anchor-breath",
      "witness.gap-between-thoughts",
      "meditation.choiceless-awareness"
    ],
    "targetMinutes": 25
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Drop the personal",
    "required": [
      "inquiry.before-this-thought",
      "witness.thought-as-object",
      "meditation.sky-mind"
    ],
    "targetMinutes": 25
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Prior to consciousness",
    "required": [
      "meditation.open-awareness",
      "contemplation.sit-with-question",
      "witness.name-the-watcher"
    ],
    "targetMinutes": 25
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "I-am in daily life",
    "required": [
      "speech-vow.one-honest-thing",
      "micro-act.tidy-one-thing",
      "voice-journal.speak-it-out"
    ],
    "targetMinutes": 20
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "The Absolute",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "mantra.aham-brahmasmi",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 28
  }
],
};
