import type { SessionProgramV3 } from "../types";

export const TONGLEN_PATH: SessionProgramV3 = {
  id: "tonglen-path",
  title: "Tonglen Path",
  subtitle: "Breathe in pain, breathe out relief",
  description: "A 7-session arc into the Tibetan practice of taking and giving.",
  difficulty: "intermediate",
  category: "heart",
  tags: ["tonglen","compassion","tibetan"],
  icon: "Heart",
  coverGradient: "from-rose-700 to-amber-700",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Reverse the instinct"},{"phase":"Practice","sessions":4,"focus":"Tonglen for self"},{"phase":"Integration","sessions":1,"focus":"Tonglen in news cycle"},{"phase":"Mastery","sessions":1,"focus":"Compassion as default"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Reverse the instinct",
    "required": [
      "ritual.opening-bow",
      "wisdom.rumi.guest-house",
      "framework.window-of-tolerance"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Tonglen for self",
    "required": [
      "emotion.rain",
      "meditation.loving-kindness",
      "breath.coherent-5-5"
    ],
    "targetMinutes": 22
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Tonglen for one person",
    "required": [
      "meditation.loving-kindness",
      "emotion.where-in-body",
      "breath.coherent-5-5"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Tonglen for the difficult",
    "required": [
      "ifs.meet-a-part",
      "meditation.loving-kindness",
      "witness.thought-as-object"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Tonglen for all beings",
    "required": [
      "meditation.loving-kindness",
      "meditation.open-awareness",
      "mantra.om-mani"
    ],
    "targetMinutes": 25
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Tonglen in news cycle",
    "required": [
      "detox.no-news-24h",
      "journal.loop-of-the-day",
      "micro-act.thank-someone"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Compassion as default",
    "required": [
      "ritual.opening-bow",
      "meditation.loving-kindness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 25
  }
],
};
