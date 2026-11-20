import type { SessionProgramV3 } from "../types";

export const ADVAITA_DIRECT: SessionProgramV3 = {
  "id": "advaita-direct",
  "title": "Advaita Direct Path",
  "subtitle": "Pointing beyond mind",
  "description": "A 7-session arc — What remains when thought stops; Who is the seer; The screen and the movie.",
  "difficulty": "intermediate",
  "category": "wisdom",
  "tags": [
    "advaita",
    "non-dual"
  ],
  "icon": "Eye",
  "coverGradient": "from-slate-900 to-indigo-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "What remains when thought stops"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "The screen and the movie"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Direct recognition"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Living as awareness"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "What remains when thought stops",
      "required": [
        "ritual.opening-bow",
        "wisdom.gita.6.5",
        "framework.witness-vs-thinker"
      ],
      "targetMinutes": 18
    },
    {
      "index": 2,
      "phase": "Foundation",
      "intent": "Who is the seer",
      "required": [
        "journal.head-heart-gut-check",
        "observe.5-senses",
        "speech-vow.one-honest-thing"
      ],
      "targetMinutes": 20
    },
    {
      "index": 3,
      "phase": "Practice",
      "intent": "The screen and the movie",
      "required": [
        "body.head-to-toe",
        "breath.coherent-5-5",
        "meditation.anchor-breath"
      ],
      "targetMinutes": 22
    },
    {
      "index": 4,
      "phase": "Practice",
      "intent": "Awareness aware of itself",
      "required": [
        "witness.gap-between-thoughts",
        "meditation.open-awareness",
        "observe.5-senses"
      ],
      "targetMinutes": 24
    },
    {
      "index": 5,
      "phase": "Practice",
      "intent": "No path, no goer",
      "required": [
        "breath.nadi-shodhana",
        "meditation.anchor-breath",
        "mudra.dhyana"
      ],
      "targetMinutes": 18
    },
    {
      "index": 6,
      "phase": "Integration",
      "intent": "Direct recognition",
      "required": [
        "journal.head-heart-gut-check",
        "witness.gap-between-thoughts",
        "micro-act.tidy-one-thing"
      ],
      "targetMinutes": 20
    },
    {
      "index": 7,
      "phase": "Mastery",
      "intent": "Living as awareness",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
