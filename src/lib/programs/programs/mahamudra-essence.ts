import type { SessionProgramV3 } from "../types";

export const MAHAMUDRA_ESSENCE: SessionProgramV3 = {
  "id": "mahamudra-essence",
  "title": "Mahamudra Essence",
  "subtitle": "The great seal",
  "description": "A 7-session arc — Shamatha foundation; Vipashyana inquiry; Mind looking at mind.",
  "difficulty": "intermediate",
  "category": "wisdom",
  "tags": [
    "mahamudra",
    "tibetan"
  ],
  "icon": "Hand",
  "coverGradient": "from-rose-900 to-purple-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Shamatha foundation"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Mind looking at mind"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "One-taste"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Non-meditation"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Shamatha foundation",
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
      "intent": "Vipashyana inquiry",
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
      "intent": "Mind looking at mind",
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
      "intent": "Co-emergent wisdom",
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
      "intent": "Beyond meditation",
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
      "intent": "One-taste",
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
      "intent": "Non-meditation",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
