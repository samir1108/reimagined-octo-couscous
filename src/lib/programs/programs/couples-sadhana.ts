import type { SessionProgramV3 } from "../types";

export const COUPLES_SADHANA: SessionProgramV3 = {
  id: "couples-sadhana",
  title: "Couples Sadhana",
  subtitle: "Relationship as the practice",
  description: "A 7-session arc for one or both partners — use the relating as the path.",
  difficulty: "intermediate",
  category: "heart",
  tags: ["couples","relationship","sadhana"],
  icon: "Users2",
  coverGradient: "from-rose-700 to-violet-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"The mirror"},{"phase":"Practice","sessions":4,"focus":"Listen without fixing"},{"phase":"Integration","sessions":1,"focus":"One repair act"},{"phase":"Mastery","sessions":1,"focus":"We as practice"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "The mirror",
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
    "intent": "Listen without fixing",
    "required": [
      "observe.three-sounds",
      "speech-vow.pause-before-reply",
      "meditation.anchor-breath"
    ],
    "targetMinutes": 22
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Speak the unsaid",
    "required": [
      "speech-vow.one-honest-thing",
      "journal.unsent-letter",
      "voice-journal.unsent-letter"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "See your projection",
    "required": [
      "shadow.who-triggers-me",
      "shadow.gold-projection",
      "ai-mirror.pattern-reflect"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Compassion + boundary",
    "required": [
      "meditation.loving-kindness",
      "speech-vow.one-honest-thing",
      "body.felt-sense"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "One repair act",
    "required": [
      "micro-act.thank-someone",
      "micro-act.call-someone",
      "journal.loop-of-the-day"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "We as practice",
    "required": [
      "ritual.opening-bow",
      "meditation.loving-kindness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
