import type { SessionProgramV3 } from "../types";

export const ARTIST_AS_MONK: SessionProgramV3 = {
  "id": "artist-as-monk",
  "title": "Artist as Monk",
  "subtitle": "Practice as path",
  "description": "A 7-session arc — The vow to show up; Studio as temple; Time as offering.",
  "difficulty": "intermediate",
  "category": "creativity",
  "tags": [
    "artist",
    "discipline"
  ],
  "icon": "Brush",
  "coverGradient": "from-rose-600 to-indigo-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "The vow to show up"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Time as offering"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Mastery cycles"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Service of the work"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "The vow to show up",
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
      "intent": "Studio as temple",
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
      "intent": "Time as offering",
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
      "intent": "Failing as fuel",
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
      "intent": "Hidden years",
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
      "intent": "Mastery cycles",
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
      "intent": "Service of the work",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
