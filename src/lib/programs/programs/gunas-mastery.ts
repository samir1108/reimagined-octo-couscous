import type { SessionProgramV3 } from "../types";

export const GUNAS_MASTERY: SessionProgramV3 = {
  "id": "gunas-mastery",
  "title": "Three Gunas Mastery",
  "subtitle": "Tamas, rajas, sattva",
  "description": "A 7-session arc — Spotting tamas; Working with rajas; Cultivating sattva.",
  "difficulty": "intermediate",
  "category": "wisdom",
  "tags": [
    "gunas",
    "samkhya"
  ],
  "icon": "Triangle",
  "coverGradient": "from-stone-800 to-amber-700",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Spotting tamas"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Cultivating sattva"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Beyond the three"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Stabilizing sattva"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Spotting tamas",
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
      "intent": "Working with rajas",
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
      "intent": "Cultivating sattva",
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
      "intent": "Diet & gunas",
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
      "intent": "Company & gunas",
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
      "intent": "Beyond the three",
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
      "intent": "Stabilizing sattva",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
