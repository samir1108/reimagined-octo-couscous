import type { SessionProgramV3 } from "../types";

export const YOGA_NIDRA_PATH: SessionProgramV3 = {
  id: "yoga-nidra-path",
  title: "Yoga Nidra Path",
  subtitle: "Conscious sleep",
  description: "A 7-session arc into Satyananda yoga nidra — deep rest with awareness intact.",
  difficulty: "beginner",
  category: "rest",
  tags: ["nidra","sleep","rest"],
  icon: "Moon",
  coverGradient: "from-indigo-800 to-slate-950",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"What is yoga nidra"},{"phase":"Practice","sessions":4,"focus":"Set sankalp"},{"phase":"Integration","sessions":1,"focus":"Wake with witness"},{"phase":"Mastery","sessions":1,"focus":"Nidra as sadhana"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "What is yoga nidra",
    "required": [
      "ritual.opening-bow",
      "framework.witness-vs-thinker",
      "neuro.vagus-nerve"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Set sankalp",
    "required": [
      "voice-journal.future-self",
      "breath.coherent-5-5",
      "mudra.dhyana"
    ],
    "targetMinutes": 18
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Rotate consciousness",
    "required": [
      "body.full-scan-5min",
      "meditation.body-as-anchor",
      "breath.coherent-5-5"
    ],
    "targetMinutes": 25
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Breath & sensation",
    "required": [
      "breath.physiological-sigh",
      "breath.coherent-5-5",
      "meditation.anchor-breath"
    ],
    "targetMinutes": 25
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Visualisation & opposites",
    "required": [
      "observe.5-senses",
      "meditation.choiceless-awareness",
      "meditation.sky-mind"
    ],
    "targetMinutes": 28
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Wake with witness",
    "required": [
      "witness.who-is-watching",
      "voice-journal.future-self",
      "journal.head-heart-gut-check"
    ],
    "targetMinutes": 15
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Nidra as sadhana",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 25
  }
],
};
