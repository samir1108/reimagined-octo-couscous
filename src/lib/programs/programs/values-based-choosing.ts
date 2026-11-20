import type { SessionProgramV3 } from "../types";

export const VALUES_BASED_CHOOSING: SessionProgramV3 = {
  id: "values-based-choosing",
  title: "Values-Based Choosing",
  subtitle: "Anchor every choice in what matters",
  description: "A 7-session arc to surface, name, and choose from your core values.",
  difficulty: "beginner",
  category: "wisdom",
  tags: ["values","choice","dharma"],
  icon: "Compass",
  coverGradient: "from-emerald-700 to-stone-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Why values"},{"phase":"Practice","sessions":4,"focus":"Mine your peaks"},{"phase":"Integration","sessions":1,"focus":"One values-aligned act"},{"phase":"Mastery","sessions":1,"focus":"Values as compass"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Why values",
    "required": [
      "ritual.opening-bow",
      "wisdom.gita.2.47",
      "framework.witness-vs-thinker"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Mine your peaks",
    "required": [
      "journal.three-wins",
      "contemplation.what-do-i-truly-want",
      "voice-journal.speak-it-out"
    ],
    "targetMinutes": 22
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Mine your pain",
    "required": [
      "shadow.what-i-hide",
      "journal.what-am-i-avoiding",
      "emotion.precise-name"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Name 3 core values",
    "required": [
      "inquiry.what-do-i-want",
      "contemplation.sit-with-question",
      "journal.morning-pages-3"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Test against a real choice",
    "required": [
      "council.three-perspectives",
      "journal.head-heart-gut-check",
      "ai-mirror.pattern-reflect"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "One values-aligned act",
    "required": [
      "micro-act.tidy-one-thing",
      "speech-vow.one-honest-thing",
      "journal.loop-of-the-day"
    ],
    "targetMinutes": 15
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Values as compass",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
