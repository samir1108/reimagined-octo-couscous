import type { SessionProgramV3 } from "../types";

export const RUMI_IMMERSION: SessionProgramV3 = {
  "id": "rumi-immersion",
  "title": "Rumi Immersion",
  "subtitle": "Drunk on the Beloved",
  "description": "A 7-session arc — The reed flute cries; Guest house of self; Love is the bridge.",
  "difficulty": "intermediate",
  "category": "devotion",
  "tags": [
    "rumi",
    "poetry"
  ],
  "icon": "Flower2",
  "coverGradient": "from-pink-700 to-red-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "The reed flute cries"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Love is the bridge"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Silent ocean"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Become the poem"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "The reed flute cries",
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
      "intent": "Guest house of self",
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
      "intent": "Love is the bridge",
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
      "intent": "Tavern of ruin",
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
      "intent": "Sun of Tabriz",
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
      "intent": "Silent ocean",
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
      "intent": "Become the poem",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
