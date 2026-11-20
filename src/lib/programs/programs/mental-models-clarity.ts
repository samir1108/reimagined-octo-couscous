import type { SessionProgramV3 } from "../types";

export const MENTAL_MODELS_CLARITY: SessionProgramV3 = {
  "id": "mental-models-clarity",
  "title": "Mental Models for Clarity",
  "subtitle": "Thinking tools meet awareness",
  "description": "A 7-session arc — First principles; Inversion; Probabilistic thinking.",
  "difficulty": "intermediate",
  "category": "integration",
  "tags": [
    "cognition",
    "clarity"
  ],
  "icon": "Brain",
  "coverGradient": "from-blue-700 to-slate-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "First principles"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Probabilistic thinking"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Awareness behind models"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Wisdom over cleverness"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "First principles",
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
      "intent": "Inversion",
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
      "intent": "Probabilistic thinking",
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
      "intent": "Steelmanning",
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
      "intent": "Map vs. territory",
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
      "intent": "Awareness behind models",
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
      "intent": "Wisdom over cleverness",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
