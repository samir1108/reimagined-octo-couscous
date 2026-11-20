import type { SessionProgramV3 } from "../types";

export const CHAKRA_AJNA: SessionProgramV3 = {
  id: "chakra-ajna",
  title: "Ajna — Third Eye",
  subtitle: "Insight, intuition, vision",
  description: "A 7-session arc opening and balancing the ajna chakra.",
  difficulty: "intermediate",
  category: "mind",
  tags: ["chakra","ajna"],
  icon: "Eye",
  coverGradient: "from-indigo-700 to-violet-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Meet the ajna energy"},{"phase":"Practice","sessions":4,"focus":"Locate in body"},{"phase":"Integration","sessions":1,"focus":"Live the chakra today"},{"phase":"Mastery","sessions":1,"focus":"Chakra as gift"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Meet the ajna energy",
    "required": [
      "ritual.opening-bow",
      "framework.three-brains-diagram",
      "body.tension-map"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Locate in body",
    "required": [
      "body.felt-sense",
      "body.head-to-toe",
      "meditation.body-as-anchor"
    ],
    "targetMinutes": 20
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Breath & seed sound",
    "required": [
      "breath.nadi-shodhana",
      "mantra.om",
      "mudra.gyan"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Shadow of the chakra",
    "required": [
      "shadow.what-i-hide",
      "journal.what-am-i-avoiding",
      "ifs.meet-a-part"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Open & integrate",
    "required": [
      "kriya.spinal-flex",
      "meditation.loving-kindness",
      "breath.coherent-5-5"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Live the chakra today",
    "required": [
      "micro-act.tidy-one-thing",
      "speech-vow.one-honest-thing",
      "journal.what-am-i-avoiding"
    ],
    "targetMinutes": 15
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Chakra as gift",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "mantra.om",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
