import type { SessionProgramV3 } from "../types";

export const PEOPLE_PLEASING_CURE: SessionProgramV3 = {
  id: "people-pleasing-cure",
  title: "People-Pleasing Cure",
  subtitle: "Yes that is not betrayal",
  description: "A 7-session arc to untangle approval from selfhood.",
  difficulty: "intermediate",
  category: "shadow",
  tags: ["people-pleasing","approval","self"],
  icon: "Users",
  coverGradient: "from-amber-800 to-rose-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Who am I pleasing"},{"phase":"Practice","sessions":4,"focus":"Track the auto-yes"},{"phase":"Integration","sessions":1,"focus":"Disappoint one person kindly"},{"phase":"Mastery","sessions":1,"focus":"Approval is not oxygen"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Who am I pleasing",
    "required": [
      "ritual.opening-bow",
      "journal.head-heart-gut-check",
      "framework.witness-vs-thinker"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Track the auto-yes",
    "required": [
      "loop.identify-trigger",
      "witness.thought-as-object",
      "ai-mirror.pattern-reflect"
    ],
    "targetMinutes": 20
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Find the fear underneath",
    "required": [
      "shadow.what-i-hide",
      "emotion.precise-name",
      "ifs.meet-a-part"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Body-level no",
    "required": [
      "body.felt-sense",
      "somatic.tense-release",
      "contemplation.sit-with-question"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Say a small no",
    "required": [
      "speech-vow.one-honest-thing",
      "speech-vow.say-it-shorter",
      "voice-journal.speak-it-out"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Disappoint one person kindly",
    "required": [
      "micro-act.tidy-one-thing",
      "journal.loop-of-the-day",
      "speech-vow.pause-before-reply"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Approval is not oxygen",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
