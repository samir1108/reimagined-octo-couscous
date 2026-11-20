import type { SessionProgramV3 } from "../types";

export const SELF_INQUIRY_L1: SessionProgramV3 = {
  id: "self-inquiry-l1-beginner",
  title: "Self-Inquiry · Level 1",
  subtitle: "Beginner's atma-vichara",
  description: "A gentle 7-session entry into the question that unmakes the questioner.",
  difficulty: "beginner",
  category: "wisdom",
  tags: ["self-inquiry","atma-vichara","beginner"],
  icon: "HelpCircle",
  coverGradient: "from-slate-700 to-indigo-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":2,"focus":"What is inquiry?"},{"phase":"Practice","sessions":3,"focus":"Watch the watcher"},{"phase":"Integration","sessions":1,"focus":"Inquiry in the day"},{"phase":"Mastery","sessions":1,"focus":"Rest as the questioner"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "What is inquiry?",
    "required": [
      "ritual.opening-bow",
      "teach.koan.who-asks",
      "framework.witness-vs-thinker"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Foundation",
    "intent": "Meet the I-thought",
    "required": [
      "inquiry.who-am-i",
      "witness.who-is-watching",
      "journal.head-heart-gut-check"
    ],
    "targetMinutes": 18
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Watch the watcher",
    "required": [
      "witness.name-the-watcher",
      "meditation.anchor-breath",
      "contemplation.sit-with-question"
    ],
    "targetMinutes": 20
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Where does I rise?",
    "required": [
      "inquiry.where-is-the-i",
      "body.felt-sense",
      "witness.thought-as-object"
    ],
    "targetMinutes": 20
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Before this thought",
    "required": [
      "inquiry.before-this-thought",
      "witness.gap-between-thoughts",
      "meditation.open-awareness"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Inquiry in the day",
    "required": [
      "micro-act.tidy-one-thing",
      "speech-vow.pause-before-reply",
      "journal.loop-of-the-day"
    ],
    "targetMinutes": 15
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Rest as the questioner",
    "required": [
      "ritual.opening-bow",
      "inquiry.what-is-aware",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
