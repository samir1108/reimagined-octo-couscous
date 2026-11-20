import type { SessionProgramV3 } from "../types";

export const DZOGCHEN_RIGPA: SessionProgramV3 = {
  "id": "dzogchen-rigpa",
  "title": "Dzogchen Rigpa",
  "subtitle": "Naked awareness",
  "description": "A 7-session arc — Pointing-out instruction; Sky-like mind; Rigpa vs. sem.",
  "difficulty": "intermediate",
  "category": "wisdom",
  "tags": [
    "dzogchen",
    "tibetan"
  ],
  "icon": "Sun",
  "coverGradient": "from-sky-700 to-indigo-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Pointing-out instruction"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Rigpa vs. sem"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Day & night practice"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Carrying rigpa into life"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Pointing-out instruction",
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
      "intent": "Sky-like mind",
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
      "intent": "Rigpa vs. sem",
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
      "intent": "Resting in nature",
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
      "intent": "Self-liberating thoughts",
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
      "intent": "Day & night practice",
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
      "intent": "Carrying rigpa into life",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
