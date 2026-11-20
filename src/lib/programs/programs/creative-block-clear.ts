import type { SessionProgramV3 } from "../types";

export const CREATIVE_BLOCK_CLEAR: SessionProgramV3 = {
  "id": "creative-block-clear",
  "title": "Creative Block Clearing",
  "subtitle": "Source meets resistance",
  "description": "A 7-session arc — Name the resistance; Morning pages; Tiny commitments.",
  "difficulty": "intermediate",
  "category": "creativity",
  "tags": [
    "creative",
    "block"
  ],
  "icon": "Palette",
  "coverGradient": "from-pink-600 to-violet-800",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Name the resistance"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Tiny commitments"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Critic as ally"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Daily devotion"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Name the resistance",
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
      "intent": "Morning pages",
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
      "intent": "Tiny commitments",
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
      "intent": "Play before product",
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
      "intent": "Share early & ugly",
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
      "intent": "Critic as ally",
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
      "intent": "Daily devotion",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
