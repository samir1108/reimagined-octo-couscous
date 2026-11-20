import type { SessionProgramV3 } from "../types";

export const FASTING_SADHANA: SessionProgramV3 = {
  id: "fasting-sadhana",
  title: "Fasting Sadhana",
  subtitle: "Hunger as the teacher",
  description: "A 7-session arc using mindful fasting as inner inquiry.",
  difficulty: "intermediate",
  category: "embodiment",
  tags: ["fasting","tapas","discipline"],
  icon: "Utensils",
  coverGradient: "from-stone-700 to-amber-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Why fast consciously"},{"phase":"Practice","sessions":4,"focus":"Skip-meal observation"},{"phase":"Integration","sessions":1,"focus":"Break fast mindfully"},{"phase":"Mastery","sessions":1,"focus":"Master of appetite"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Why fast consciously",
    "required": [
      "ritual.opening-bow",
      "framework.window-of-tolerance",
      "wisdom.gita.6.5"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Skip-meal observation",
    "required": [
      "observe.5-senses",
      "body.felt-sense",
      "journal.head-heart-gut-check"
    ],
    "targetMinutes": 18
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Meet the craving",
    "required": [
      "emotion.precise-name",
      "ifs.meet-a-part",
      "contemplation.sit-with-question"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Body-level peace",
    "required": [
      "breath.coherent-5-5",
      "meditation.body-as-anchor",
      "witness.thought-as-object"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Hunger as teacher",
    "required": [
      "contemplation.sit-with-question",
      "witness.who-is-watching",
      "meditation.open-awareness"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Break fast mindfully",
    "required": [
      "micro-act.no-phone-meal",
      "observe.5-senses",
      "journal.loop-of-the-day"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Master of appetite",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
