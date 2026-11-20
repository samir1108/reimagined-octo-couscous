import type { SessionProgramV3 } from "../types";

export const APOLOGY_PRACTICE: SessionProgramV3 = {
  id: "apology-practice",
  title: "Apology Practice",
  subtitle: "Repair without diminishing",
  description: "A 7-session arc to apologize cleanly — no defensiveness, no self-erasure.",
  difficulty: "intermediate",
  category: "heart",
  tags: ["apology","repair","speech"],
  icon: "HandshakeIcon",
  coverGradient: "from-amber-700 to-rose-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Why repair matters"},{"phase":"Practice","sessions":4,"focus":"See the harm honestly"},{"phase":"Integration","sessions":1,"focus":"Deliver one repair"},{"phase":"Mastery","sessions":1,"focus":"Repair as devotion"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Why repair matters",
    "required": [
      "ritual.opening-bow",
      "wisdom.rumi.guest-house",
      "framework.witness-vs-thinker"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "See the harm honestly",
    "required": [
      "shadow.what-i-hide",
      "contemplation.sit-with-question",
      "journal.what-am-i-avoiding"
    ],
    "targetMinutes": 22
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Feel without collapsing",
    "required": [
      "emotion.rain",
      "body.felt-sense",
      "ifs.meet-a-part"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Apology without excuse",
    "required": [
      "speech-vow.one-honest-thing",
      "speech-vow.say-it-shorter",
      "voice-journal.unsent-letter"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Hold the other's response",
    "required": [
      "meditation.loving-kindness",
      "witness.thought-as-object",
      "contemplation.sit-with-question"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Deliver one repair",
    "required": [
      "micro-act.call-someone",
      "journal.loop-of-the-day",
      "speech-vow.one-honest-thing"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Repair as devotion",
    "required": [
      "ritual.opening-bow",
      "meditation.loving-kindness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
