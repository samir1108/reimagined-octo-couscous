import type { SessionProgramV3 } from "../types";

export const BHASTRIKA_PATH: SessionProgramV3 = {
  id: "bhastrika-path",
  title: "Bhastrika Path",
  subtitle: "Bellows breath — kindle inner fire",
  description: "A 7-session arc safely building bhastrika capacity.",
  difficulty: "advanced",
  category: "embodiment",
  tags: ["pranayama","bhastrika","fire"],
  icon: "Flame",
  coverGradient: "from-red-700 to-orange-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Fire safely"},{"phase":"Practice","sessions":4,"focus":"Warm-up rounds"},{"phase":"Integration","sessions":1,"focus":"Cool down well"},{"phase":"Mastery","sessions":1,"focus":"Fire as friend"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Fire safely",
    "required": [
      "ritual.opening-bow",
      "framework.window-of-tolerance",
      "body.head-to-toe"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Warm-up rounds",
    "required": [
      "breath.kapalbhati",
      "breath.coherent-5-5",
      "mudra.gyan"
    ],
    "targetMinutes": 18
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Bhastrika slow",
    "required": [
      "kriya.breath-of-fire",
      "meditation.body-as-anchor",
      "breath.coherent-5-5"
    ],
    "targetMinutes": 20
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Bhastrika medium",
    "required": [
      "kriya.breath-of-fire.v2",
      "breath.physiological-sigh",
      "meditation.anchor-breath"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Long round + retention",
    "required": [
      "kriya.breath-of-fire",
      "breath.box-4-4-4-4",
      "meditation.open-awareness"
    ],
    "targetMinutes": 25
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Cool down well",
    "required": [
      "somatic.sigh-3x",
      "body.head-to-toe",
      "meditation.anchor-breath"
    ],
    "targetMinutes": 15
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Fire as friend",
    "required": [
      "ritual.opening-bow",
      "kriya.breath-of-fire",
      "meditation.open-awareness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
