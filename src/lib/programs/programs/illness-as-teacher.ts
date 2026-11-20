import type { SessionProgramV3 } from "../types";

export const ILLNESS_AS_TEACHER: SessionProgramV3 = {
  "id": "illness-as-teacher",
  "title": "Illness as Teacher",
  "subtitle": "When body forces stillness",
  "description": "A 7-session arc — Stop fighting the message; What is being shown; Receiving care.",
  "difficulty": "intermediate",
  "category": "healing",
  "tags": [
    "illness",
    "surrender"
  ],
  "icon": "Bandage",
  "coverGradient": "from-blue-900 to-stone-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Stop fighting the message"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Receiving care"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Slow return"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Integrating the gift"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Stop fighting the message",
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
      "intent": "What is being shown",
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
      "intent": "Receiving care",
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
      "intent": "Surrender vs. giving up",
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
      "intent": "Inner physician",
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
      "intent": "Slow return",
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
      "intent": "Integrating the gift",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
