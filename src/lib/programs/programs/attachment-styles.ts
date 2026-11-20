import type { SessionProgramV3 } from "../types";

export const ATTACHMENT_STYLES: SessionProgramV3 = {
  id: "attachment-styles",
  title: "Attachment Styles",
  subtitle: "See the pattern, choose secure",
  description: "A 7-session arc through attachment patterns and earning security.",
  difficulty: "intermediate",
  category: "heart",
  tags: ["attachment","relationship","psychology"],
  icon: "GitFork",
  coverGradient: "from-indigo-800 to-rose-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"The four patterns"},{"phase":"Practice","sessions":4,"focus":"Map your pattern"},{"phase":"Integration","sessions":1,"focus":"One secure act"},{"phase":"Mastery","sessions":1,"focus":"Secure as home"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "The four patterns",
    "required": [
      "ritual.opening-bow",
      "framework.witness-vs-thinker",
      "journal.head-heart-gut-check"
    ],
    "targetMinutes": 18
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Map your pattern",
    "required": [
      "journal.what-am-i-avoiding",
      "ai-mirror.pattern-reflect",
      "contemplation.sit-with-question"
    ],
    "targetMinutes": 22
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Anxious — soothe self",
    "required": [
      "breath.coherent-5-5",
      "meditation.loving-kindness",
      "ifs.meet-a-part"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Avoidant — soften open",
    "required": [
      "body.felt-sense",
      "emotion.precise-name",
      "voice-journal.speak-it-out"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Earn secure base",
    "required": [
      "meditation.body-as-anchor",
      "ifs.unburden-protector",
      "journal.morning-pages-3"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "One secure act",
    "required": [
      "speech-vow.one-honest-thing",
      "micro-act.call-someone",
      "journal.loop-of-the-day"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Secure as home",
    "required": [
      "ritual.opening-bow",
      "meditation.loving-kindness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
