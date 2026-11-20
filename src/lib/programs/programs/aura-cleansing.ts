import type { SessionProgramV3 } from "../types";

export const AURA_CLEANSING: SessionProgramV3 = {
  "id": "aura-cleansing",
  "title": "Aura Cleansing",
  "subtitle": "Subtle hygiene",
  "description": "A 7-session arc — Sensing the field; Daily download release; Cord cutting.",
  "difficulty": "intermediate",
  "category": "energy",
  "tags": [
    "aura",
    "subtle"
  ],
  "icon": "Circle",
  "coverGradient": "from-cyan-500 to-violet-700",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Sensing the field"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Cord cutting"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Protection before contact"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Evening clearing"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Sensing the field",
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
      "intent": "Daily download release",
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
      "intent": "Cord cutting",
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
      "intent": "Salt water bath",
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
      "intent": "Sealing practice",
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
      "intent": "Protection before contact",
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
      "intent": "Evening clearing",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
