import type { SessionProgramV3 } from "../types";

export const RIBHU_GITA_ESSENCE: SessionProgramV3 = {
  "id": "ribhu-gita-essence",
  "title": "Ribhu Gita Essence",
  "subtitle": "Pure being declaration",
  "description": "A 7-session arc — I am Brahman; Nothing exists but Self; The world is unreal.",
  "difficulty": "intermediate",
  "category": "wisdom",
  "tags": [
    "ribhu",
    "advaita"
  ],
  "icon": "BookOpen",
  "coverGradient": "from-amber-900 to-stone-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "I am Brahman"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "The world is unreal"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Daily declaration"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Resting as That"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "I am Brahman",
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
      "intent": "Nothing exists but Self",
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
      "intent": "The world is unreal",
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
      "intent": "Bondage is illusion",
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
      "intent": "Liberation now",
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
      "intent": "Daily declaration",
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
      "intent": "Resting as That",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
