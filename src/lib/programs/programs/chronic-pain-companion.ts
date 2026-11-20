import type { SessionProgramV3 } from "../types";

export const CHRONIC_PAIN_COMPANION: SessionProgramV3 = {
  "id": "chronic-pain-companion",
  "title": "Chronic Pain Companion",
  "subtitle": "Suffering vs. pain",
  "description": "A 7-session arc — Pain is a message; Resistance amplifies; Befriending the area.",
  "difficulty": "intermediate",
  "category": "healing",
  "tags": [
    "pain",
    "chronic"
  ],
  "icon": "HeartPulse",
  "coverGradient": "from-rose-900 to-stone-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Pain is a message"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Befriending the area"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Pacing as kindness"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Joy still possible"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Pain is a message",
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
      "intent": "Resistance amplifies",
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
      "intent": "Befriending the area",
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
      "intent": "Breath through it",
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
      "intent": "Identity beyond pain",
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
      "intent": "Pacing as kindness",
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
      "intent": "Joy still possible",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
