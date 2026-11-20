import type { SessionProgramV3 } from "../types";

export const COMPARISON_CURE: SessionProgramV3 = {
  id: "comparison-cure",
  title: "Comparison Cure",
  subtitle: "Envy as the door to dharma",
  description: "A 7-session arc using envy and comparison as data, not poison.",
  difficulty: "beginner",
  category: "shadow",
  tags: ["comparison","envy","self"],
  icon: "Scale",
  coverGradient: "from-violet-800 to-amber-800",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Envy is a signal"},{"phase":"Practice","sessions":4,"focus":"Name what you envy"},{"phase":"Integration","sessions":1,"focus":"One dharma act"},{"phase":"Mastery","sessions":1,"focus":"Your lane only"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Envy is a signal",
    "required": [
      "ritual.opening-bow",
      "shadow.envy-as-mirror",
      "framework.witness-vs-thinker"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Name what you envy",
    "required": [
      "journal.what-am-i-avoiding",
      "contemplation.what-do-i-truly-want",
      "voice-journal.speak-it-out"
    ],
    "targetMinutes": 22
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Gold projection mirror",
    "required": [
      "shadow.gold-projection",
      "ifs.meet-a-part",
      "contemplation.sit-with-question"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Receive your own life",
    "required": [
      "journal.three-wins",
      "meditation.loving-kindness",
      "voice-journal.gratitude-3"
    ],
    "targetMinutes": 20
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Walk your dharma",
    "required": [
      "inquiry.what-do-i-want",
      "journal.morning-pages-3",
      "council.three-perspectives"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "One dharma act",
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
    "intent": "Your lane only",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
