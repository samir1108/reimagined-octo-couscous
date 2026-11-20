import type { SessionProgramV3 } from "../types";

export const CAREGIVER_SADHANA: SessionProgramV3 = {
  "id": "caregiver-sadhana",
  "title": "Caregiver Sadhana",
  "subtitle": "Holding without losing self",
  "description": "A 7-session arc — Own oxygen first; The weight is real; Boundaries with love.",
  "difficulty": "intermediate",
  "category": "integration",
  "tags": [
    "caregiver",
    "service"
  ],
  "icon": "HandHeart",
  "coverGradient": "from-teal-700 to-rose-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Own oxygen first"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Boundaries with love"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Micro-restoration"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Sacred service"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Own oxygen first",
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
      "intent": "The weight is real",
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
      "intent": "Boundaries with love",
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
      "intent": "Grief in waiting",
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
      "intent": "Asking for help",
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
      "intent": "Micro-restoration",
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
      "intent": "Sacred service",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
