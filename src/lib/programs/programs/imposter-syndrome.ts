import type { SessionProgramV3 } from "../types";

export const IMPOSTER_SYNDROME: SessionProgramV3 = {
  id: "imposter-syndrome",
  title: "Imposter Syndrome",
  subtitle: "You are not pretending",
  description: "A 7-session arc to dissolve the \"they will find out\" loop.",
  difficulty: "intermediate",
  category: "shadow",
  tags: ["imposter","self-worth","identity"],
  icon: "UserCheck",
  coverGradient: "from-indigo-800 to-stone-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"See the loop"},{"phase":"Practice","sessions":4,"focus":"Catalog real evidence"},{"phase":"Integration","sessions":1,"focus":"One claim out loud"},{"phase":"Mastery","sessions":1,"focus":"Worth without proof"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "See the loop",
    "required": [
      "ritual.opening-bow",
      "framework.witness-vs-thinker",
      "ai-mirror.pattern-reflect"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Catalog real evidence",
    "required": [
      "journal.three-wins",
      "journal.head-heart-gut-check",
      "voice-journal.gratitude-3"
    ],
    "targetMinutes": 20
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Meet the doubter",
    "required": [
      "ifs.meet-a-part",
      "shadow.what-i-hide",
      "voice-journal.speak-it-out"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Body-level worth",
    "required": [
      "body.felt-sense",
      "meditation.loving-kindness",
      "mudra.anjali"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Who is afraid",
    "required": [
      "inquiry.who-am-i",
      "contemplation.sit-with-question",
      "witness.who-is-watching"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "One claim out loud",
    "required": [
      "speech-vow.one-honest-thing",
      "micro-act.thank-someone",
      "journal.loop-of-the-day"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Worth without proof",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
