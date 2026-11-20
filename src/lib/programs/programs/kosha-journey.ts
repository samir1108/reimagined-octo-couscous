import type { SessionProgramV3 } from "../types";

export const KOSHA_JOURNEY: SessionProgramV3 = {
  "id": "kosha-journey",
  "title": "Five Koshas",
  "subtitle": "Sheaths of self",
  "description": "A 7-session arc — Annamaya — food; Pranamaya — breath; Manomaya — mind.",
  "difficulty": "intermediate",
  "category": "wisdom",
  "tags": [
    "kosha",
    "vedanta"
  ],
  "icon": "Layers",
  "coverGradient": "from-amber-700 to-indigo-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Annamaya — food"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Manomaya — mind"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Beyond all sheaths"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Living from center"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Annamaya — food",
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
      "intent": "Pranamaya — breath",
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
      "intent": "Manomaya — mind",
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
      "intent": "Vijnanamaya — wisdom",
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
      "intent": "Anandamaya — bliss",
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
      "intent": "Beyond all sheaths",
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
      "intent": "Living from center",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
