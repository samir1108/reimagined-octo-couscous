import type { SessionProgramV3 } from "../types";

export const DESERT_FATHERS: SessionProgramV3 = {
  "id": "desert-fathers",
  "title": "Desert Fathers Way",
  "subtitle": "Stillness in the cell",
  "description": "A 7-session arc — Flee, be silent, rest; The cell teaches; Watchfulness of thoughts.",
  "difficulty": "intermediate",
  "category": "devotion",
  "tags": [
    "christian",
    "solitude"
  ],
  "icon": "Mountain",
  "coverGradient": "from-yellow-800 to-stone-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Flee, be silent, rest"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Watchfulness of thoughts"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Manual labor"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Pure prayer"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Flee, be silent, rest",
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
      "intent": "The cell teaches",
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
      "intent": "Watchfulness of thoughts",
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
      "intent": "Humility practice",
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
      "intent": "Jesus prayer",
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
      "intent": "Manual labor",
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
      "intent": "Pure prayer",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
