import type { SessionProgramV3 } from "../types";

export const CONSCIOUS_DECISION_FRAMEWORK: SessionProgramV3 = {
  id: "conscious-decision-framework",
  title: "Conscious Decision Framework",
  subtitle: "Decide from awareness, not reaction",
  description: "A 7-session arc to bring choices through head, heart, and gut before acting.",
  difficulty: "beginner",
  category: "wisdom",
  tags: ["decision","clarity"],
  icon: "GitMerge",
  coverGradient: "from-stone-700 to-violet-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Reactive vs. responsive"},{"phase":"Practice","sessions":4,"focus":"Name the choice"},{"phase":"Integration","sessions":1,"focus":"Decide one real thing"},{"phase":"Mastery","sessions":1,"focus":"Choice as practice"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Reactive vs. responsive",
    "required": [
      "ritual.opening-bow",
      "framework.witness-vs-thinker",
      "framework.three-brains-diagram"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Name the choice",
    "required": [
      "inquiry.what-do-i-want",
      "journal.head-heart-gut-check",
      "contemplation.sit-with-question"
    ],
    "targetMinutes": 20
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Three-brain check",
    "required": [
      "council.three-perspectives",
      "journal.head-heart-gut-check",
      "body.felt-sense"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Loop cost ledger",
    "required": [
      "loop.cost-ledger",
      "ai-mirror.pattern-reflect",
      "journal.loop-of-the-day"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Future-self vote",
    "required": [
      "voice-journal.future-self",
      "contemplation.if-i-died-tomorrow",
      "journal.unsent-letter"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Decide one real thing",
    "required": [
      "micro-act.tidy-one-thing",
      "speech-vow.one-honest-thing",
      "journal.day-in-one-sentence"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Choice as practice",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
