import type { SessionProgramV3 } from "../types";

export const MENS_CIRCLE_PATH: SessionProgramV3 = {
  "id": "mens-circle-path",
  "title": "Men's Inner Circle",
  "subtitle": "Healthy masculine",
  "description": "A 7-session arc — Father wounds; Brotherhood need; Healthy anger.",
  "difficulty": "intermediate",
  "category": "integration",
  "tags": [
    "men",
    "masculine"
  ],
  "icon": "Users",
  "coverGradient": "from-stone-700 to-indigo-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Father wounds"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Healthy anger"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Mentoring younger"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "King energy"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Father wounds",
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
      "intent": "Brotherhood need",
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
      "intent": "Healthy anger",
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
      "intent": "Holding ground",
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
      "intent": "Being seen",
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
      "intent": "Mentoring younger",
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
      "intent": "King energy",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
