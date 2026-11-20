import type { SessionProgramV3 } from "../types";

export const SOUND_CURRENT: SessionProgramV3 = {
  "id": "sound-current",
  "title": "Inner Sound Current",
  "subtitle": "Nada yoga path",
  "description": "A 7-session arc — Outer sounds; Listening to silence; Inner sound surfacing.",
  "difficulty": "intermediate",
  "category": "devotion",
  "tags": [
    "nada",
    "sound"
  ],
  "icon": "Music",
  "coverGradient": "from-purple-700 to-indigo-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Outer sounds"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Inner sound surfacing"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Riding the current"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Merging with sound"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Outer sounds",
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
      "intent": "Listening to silence",
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
      "intent": "Inner sound surfacing",
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
      "intent": "Naad of the heart",
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
      "intent": "Anahata nada",
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
      "intent": "Riding the current",
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
      "intent": "Merging with sound",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
