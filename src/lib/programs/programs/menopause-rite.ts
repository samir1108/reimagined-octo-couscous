import type { SessionProgramV3 } from "../types";

export const MENOPAUSE_RITE: SessionProgramV3 = {
  "id": "menopause-rite",
  "title": "Menopause as Rite",
  "subtitle": "Crone wisdom emerging",
  "description": "A 7-session arc — Bleeding ends, power begins; Body in fire; Releasing old roles.",
  "difficulty": "intermediate",
  "category": "integration",
  "tags": [
    "menopause",
    "feminine"
  ],
  "icon": "Flame",
  "coverGradient": "from-orange-700 to-purple-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Bleeding ends, power begins"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Releasing old roles"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Wisdom keeper"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Blessing the next"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Bleeding ends, power begins",
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
      "intent": "Body in fire",
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
      "intent": "Releasing old roles",
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
      "intent": "New voice rising",
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
      "intent": "Sacred rage",
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
      "intent": "Wisdom keeper",
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
      "intent": "Blessing the next",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
