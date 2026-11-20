import type { SessionProgramV3 } from "../types";

export const SIX_BARDOS: SessionProgramV3 = {
  "id": "six-bardos",
  "title": "Six Bardos",
  "subtitle": "Transitional awareness",
  "description": "A 7-session arc — Bardo of life; Bardo of dream; Bardo of meditation.",
  "difficulty": "intermediate",
  "category": "wisdom",
  "tags": [
    "bardo",
    "death"
  ],
  "icon": "Hourglass",
  "coverGradient": "from-stone-800 to-red-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Bardo of life"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Bardo of meditation"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Bardo of becoming"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Practice for each"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Bardo of life",
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
      "intent": "Bardo of dream",
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
      "intent": "Bardo of meditation",
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
      "intent": "Bardo of dying",
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
      "intent": "Bardo of dharmata",
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
      "intent": "Bardo of becoming",
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
      "intent": "Practice for each",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
