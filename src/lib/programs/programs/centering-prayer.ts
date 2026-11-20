import type { SessionProgramV3 } from "../types";

export const CENTERING_PRAYER: SessionProgramV3 = {
  "id": "centering-prayer",
  "title": "Centering Prayer",
  "subtitle": "Resting in God",
  "description": "A 7-session arc — Sacred word; Consent to presence; Returning gently.",
  "difficulty": "intermediate",
  "category": "devotion",
  "tags": [
    "christian",
    "contemplative"
  ],
  "icon": "Cross",
  "coverGradient": "from-amber-100 to-stone-700",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Sacred word"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Returning gently"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Daily rhythm"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Lectio divina"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Sacred word",
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
      "intent": "Consent to presence",
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
      "intent": "Returning gently",
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
      "intent": "Cloud of unknowing",
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
      "intent": "Divine therapy",
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
      "intent": "Daily rhythm",
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
      "intent": "Lectio divina",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
