import type { SessionProgramV3 } from "../types";

export const CAREER_DHARMA: SessionProgramV3 = {
  id: "career-dharma",
  title: "Career Dharma",
  subtitle: "Work as right action",
  description: "A 7-session arc to align work with deeper purpose.",
  difficulty: "intermediate",
  category: "wisdom",
  tags: ["career","dharma","work"],
  icon: "Briefcase",
  coverGradient: "from-blue-800 to-amber-800",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Work as path"},{"phase":"Practice","sessions":4,"focus":"Audit current role"},{"phase":"Integration","sessions":1,"focus":"One dharma-aligned step"},{"phase":"Mastery","sessions":1,"focus":"Work as offering"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Work as path",
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
    "intent": "Audit current role",
    "required": [
      "journal.morning-pages-3",
      "contemplation.what-do-i-truly-want",
      "ai-mirror.pattern-reflect"
    ],
    "targetMinutes": 22
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Skill × passion × need",
    "required": [
      "journal.head-heart-gut-check",
      "council.three-perspectives",
      "contemplation.sit-with-question"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Future-self pull",
    "required": [
      "voice-journal.future-self",
      "contemplation.if-i-died-tomorrow",
      "journal.unsent-letter"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Fear of the change",
    "required": [
      "ifs.meet-a-part",
      "emotion.precise-name",
      "body.felt-sense"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "One dharma-aligned step",
    "required": [
      "micro-act.tidy-one-thing",
      "speech-vow.one-honest-thing",
      "journal.loop-of-the-day"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Work as offering",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
