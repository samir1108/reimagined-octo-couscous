import type { SessionProgramV3 } from "../types";

export const TAI_CHI_ESSENCE: SessionProgramV3 = {
  "id": "tai-chi-essence",
  "title": "Tai Chi Essence",
  "subtitle": "Meditation in motion",
  "description": "A 7-session arc — Rooting; Sinking; Yin & yang flow.",
  "difficulty": "intermediate",
  "category": "energy",
  "tags": [
    "taichi",
    "movement"
  ],
  "icon": "Repeat",
  "coverGradient": "from-emerald-600 to-stone-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Rooting"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Yin & yang flow"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Continuous round"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Empty & full"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Rooting",
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
      "intent": "Sinking",
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
      "intent": "Yin & yang flow",
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
      "intent": "Single whip",
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
      "intent": "Push hands principle",
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
      "intent": "Continuous round",
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
      "intent": "Empty & full",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
