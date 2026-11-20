import type { SessionProgramV3 } from "../types";

export const SELF_WORTH_REBUILD: SessionProgramV3 = {
  id: "self-worth-rebuild",
  title: "Self-Worth Rebuild",
  subtitle: "Worth not earned, recognized",
  description: "A 7-session arc to anchor worth in being, not performance.",
  difficulty: "beginner",
  category: "emotional",
  tags: ["self-worth","identity"],
  icon: "HeartHandshake",
  coverGradient: "from-rose-700 to-amber-800",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Worth is not a metric"},{"phase":"Practice","sessions":4,"focus":"Where worth was conditioned"},{"phase":"Integration","sessions":1,"focus":"Receive one thing"},{"phase":"Mastery","sessions":1,"focus":"Worth as default"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Worth is not a metric",
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
    "intent": "Where worth was conditioned",
    "required": [
      "shadow.what-i-hide",
      "journal.unsent-letter",
      "ifs.meet-a-part"
    ],
    "targetMinutes": 22
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Loving-kindness for self",
    "required": [
      "meditation.loving-kindness",
      "voice-journal.gratitude-3",
      "mudra.anjali"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Body says I matter",
    "required": [
      "body.felt-sense",
      "mudra.dhyana",
      "meditation.body-as-anchor"
    ],
    "targetMinutes": 20
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Who is unworthy",
    "required": [
      "inquiry.who-am-i",
      "witness.who-is-watching",
      "contemplation.sit-with-question"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Receive one thing",
    "required": [
      "micro-act.thank-someone",
      "speech-vow.one-honest-thing",
      "journal.three-wins"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Worth as default",
    "required": [
      "ritual.opening-bow",
      "meditation.loving-kindness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
