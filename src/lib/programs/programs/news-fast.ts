import type { SessionProgramV3 } from "../types";

export const NEWS_FAST: SessionProgramV3 = {
  id: "news-fast",
  title: "News Fast",
  subtitle: "Withdraw to come back useful",
  description: "A 7-session arc to step away from the news loop without numbing.",
  difficulty: "beginner",
  category: "mind",
  tags: ["news","detox","attention"],
  icon: "Newspaper",
  coverGradient: "from-stone-700 to-slate-950",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Why withdraw"},{"phase":"Practice","sessions":4,"focus":"24h no news"},{"phase":"Integration","sessions":1,"focus":"News diet rules"},{"phase":"Mastery","sessions":1,"focus":"Engaged & whole"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Why withdraw",
    "required": [
      "ritual.opening-bow",
      "framework.window-of-tolerance",
      "neuro.amygdala-hijack"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "24h no news",
    "required": [
      "detox.no-news-24h",
      "breath.coherent-5-5",
      "observe.5-senses"
    ],
    "targetMinutes": 18
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Nervous-system reset",
    "required": [
      "somatic.tense-release",
      "body.head-to-toe",
      "meditation.body-as-anchor"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Compassion not collapse",
    "required": [
      "meditation.loving-kindness",
      "emotion.rain",
      "breath.coherent-5-5"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Useful action",
    "required": [
      "contemplation.sit-with-question",
      "micro-act.thank-someone",
      "speech-vow.one-honest-thing"
    ],
    "targetMinutes": 20
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "News diet rules",
    "required": [
      "speech-vow.pause-before-reply",
      "journal.loop-of-the-day",
      "micro-act.tidy-one-thing"
    ],
    "targetMinutes": 15
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Engaged & whole",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
