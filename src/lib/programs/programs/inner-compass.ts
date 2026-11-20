import type { SessionProgramV3 } from "../types";

export const INNER_COMPASS: SessionProgramV3 = {
  id: "inner-compass",
  title: "Inner Compass",
  subtitle: "Tune the felt-sense of right action",
  description: "A 7-session arc to develop somatic intuition as a daily decision tool.",
  difficulty: "intermediate",
  category: "wisdom",
  tags: ["intuition","compass","somatic"],
  icon: "Navigation",
  coverGradient: "from-sky-700 to-indigo-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Intuition is data"},{"phase":"Practice","sessions":4,"focus":"Map yes & no in body"},{"phase":"Integration","sessions":1,"focus":"Follow compass once"},{"phase":"Mastery","sessions":1,"focus":"Trust the inner yes"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Intuition is data",
    "required": [
      "ritual.opening-bow",
      "neuro.interoception",
      "framework.three-brains-diagram"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Map yes & no in body",
    "required": [
      "body.felt-sense",
      "body.tension-map",
      "journal.head-heart-gut-check"
    ],
    "targetMinutes": 22
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Tune gut signal",
    "required": [
      "somatic.sigh-3x",
      "contemplation.sit-with-question",
      "witness.thought-as-object"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Heart vs. fear",
    "required": [
      "emotion.precise-name",
      "ifs.meet-a-part",
      "meditation.loving-kindness"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Sit with the choice",
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
    "intent": "Follow compass once",
    "required": [
      "micro-act.tidy-one-thing",
      "journal.loop-of-the-day",
      "speech-vow.one-honest-thing"
    ],
    "targetMinutes": 15
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Trust the inner yes",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
