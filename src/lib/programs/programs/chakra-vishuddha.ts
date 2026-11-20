import type { SessionProgramV3 } from "../types";

export const CHAKRA_VISHUDDHA: SessionProgramV3 = {
  id: "chakra-vishuddha",
  title: "Vishuddha — Throat",
  subtitle: "Truth, voice, expression",
  description: "A 7-session arc opening and balancing the vishuddha chakra.",
  difficulty: "intermediate",
  category: "heart",
  tags: ["chakra","vishuddha"],
  icon: "Mic",
  coverGradient: "from-sky-600 to-indigo-800",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Meet the vishuddha energy"},{"phase":"Practice","sessions":4,"focus":"Locate in body"},{"phase":"Integration","sessions":1,"focus":"Live the chakra today"},{"phase":"Mastery","sessions":1,"focus":"Chakra as gift"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Meet the vishuddha energy",
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
      "voice-journal.speak-it-out",
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
      "voice-journal.speak-it-out"
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
