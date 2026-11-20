import type { SessionProgramV3 } from "../types";

export const PILGRIMAGE_PATH: SessionProgramV3 = {
  "id": "pilgrimage-path",
  "title": "Inner Pilgrimage",
  "subtitle": "Journey as practice",
  "description": "A 7-session arc — Why this journey; Vow at threshold; Walking as prayer.",
  "difficulty": "intermediate",
  "category": "integration",
  "tags": [
    "pilgrimage",
    "journey"
  ],
  "icon": "Map",
  "coverGradient": "from-amber-600 to-emerald-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Why this journey"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Walking as prayer"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Returning changed"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Integration months"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Why this journey",
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
      "intent": "Vow at threshold",
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
      "intent": "Walking as prayer",
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
      "intent": "Strangers as teachers",
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
      "intent": "The destination shifts",
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
      "intent": "Returning changed",
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
      "intent": "Integration months",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
