import type { SessionProgramV3 } from "../types";

export const SELF_INQUIRY_L2: SessionProgramV3 = {
  id: "self-inquiry-l2-layered",
  title: "Self-Inquiry · Level 2",
  subtitle: "Layered why — peel the onion",
  description: "A 7-session arc using the layered-why method to find the root under every story.",
  difficulty: "intermediate",
  category: "wisdom",
  tags: ["self-inquiry","layered","why"],
  icon: "Layers",
  coverGradient: "from-slate-700 to-purple-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Why under why"},{"phase":"Practice","sessions":4,"focus":"Peel one belief"},{"phase":"Integration","sessions":1,"focus":"Hold the root"},{"phase":"Mastery","sessions":1,"focus":"No more layers"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Why under why",
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
    "intent": "Peel one belief",
    "required": [
      "inquiry.what-do-i-want",
      "contemplation.sit-with-question",
      "journal.morning-pages-3"
    ],
    "targetMinutes": 22
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Peel one emotion",
    "required": [
      "emotion.precise-name",
      "emotion.where-in-body",
      "journal.what-am-i-avoiding"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Peel one loop",
    "required": [
      "loop.identify-trigger",
      "loop-confront.name-and-face",
      "ai-mirror.pattern-reflect"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Trace to source",
    "required": [
      "inquiry.before-this-thought",
      "witness.thought-as-object",
      "meditation.choiceless-awareness"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Hold the root",
    "required": [
      "voice-journal.speak-it-out",
      "journal.loop-of-the-day",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 20
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "No more layers",
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
