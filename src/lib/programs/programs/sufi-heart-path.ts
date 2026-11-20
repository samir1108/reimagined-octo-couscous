import type { SessionProgramV3 } from "../types";

export const SUFI_HEART_PATH: SessionProgramV3 = {
  "id": "sufi-heart-path",
  "title": "Sufi Heart Path",
  "subtitle": "Polishing the mirror",
  "description": "A 7-session arc — Dhikr — remembrance; Fana — annihilation; The Beloved within.",
  "difficulty": "intermediate",
  "category": "devotion",
  "tags": [
    "sufi",
    "heart"
  ],
  "icon": "Heart",
  "coverGradient": "from-rose-700 to-amber-700",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Dhikr — remembrance"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "The Beloved within"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Service as worship"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Baqa — abiding"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Dhikr — remembrance",
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
      "intent": "Fana — annihilation",
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
      "intent": "The Beloved within",
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
      "intent": "Tears of longing",
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
      "intent": "Whirling stillness",
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
      "intent": "Service as worship",
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
      "intent": "Baqa — abiding",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
