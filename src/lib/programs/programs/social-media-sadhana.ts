import type { SessionProgramV3 } from "../types";

export const SOCIAL_MEDIA_SADHANA: SessionProgramV3 = {
  id: "social-media-sadhana",
  title: "Social Media Sadhana",
  subtitle: "Conscious scroll, conscious post",
  description: "A 7-session arc to relate to feeds without losing self.",
  difficulty: "beginner",
  category: "mind",
  tags: ["social-media","attention","identity"],
  icon: "Globe",
  coverGradient: "from-rose-800 to-indigo-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Notice the pull"},{"phase":"Practice","sessions":4,"focus":"Track triggers"},{"phase":"Integration","sessions":1,"focus":"Feed boundary"},{"phase":"Mastery","sessions":1,"focus":"You are not the feed"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Notice the pull",
    "required": [
      "ritual.opening-bow",
      "loop.identify-trigger",
      "framework.witness-vs-thinker"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Track triggers",
    "required": [
      "witness.thought-counter",
      "journal.loop-of-the-day",
      "ai-mirror.pattern-reflect"
    ],
    "targetMinutes": 20
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Comparison detox",
    "required": [
      "shadow.envy-as-mirror",
      "shadow.gold-projection",
      "journal.what-am-i-avoiding"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Post from grounded",
    "required": [
      "speech-vow.one-honest-thing",
      "contemplation.sit-with-question",
      "body.felt-sense"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "1-hour scroll fast",
    "required": [
      "detox.no-phone-30min",
      "detox.silence-1h",
      "observe.5-senses"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Feed boundary",
    "required": [
      "speech-vow.pause-before-reply",
      "micro-act.tidy-one-thing",
      "journal.loop-of-the-day"
    ],
    "targetMinutes": 15
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "You are not the feed",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
