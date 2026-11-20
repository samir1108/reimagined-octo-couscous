import type { SessionProgramV3 } from "../types";

export const ELDER_WISDOM: SessionProgramV3 = {
  "id": "elder-wisdom",
  "title": "Elder Wisdom Path",
  "subtitle": "Aging consciously",
  "description": "A 7-session arc — Honoring the harvest; Body as ally; Legacy beyond doing.",
  "difficulty": "intermediate",
  "category": "integration",
  "tags": [
    "elder",
    "aging"
  ],
  "icon": "Sparkles",
  "coverGradient": "from-stone-500 to-indigo-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Honoring the harvest"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Legacy beyond doing"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Meeting mortality"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Blessing the young"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Honoring the harvest",
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
      "intent": "Body as ally",
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
      "intent": "Legacy beyond doing",
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
      "intent": "Becoming counsel",
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
      "intent": "Surrender of identity",
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
      "intent": "Meeting mortality",
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
      "intent": "Blessing the young",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
