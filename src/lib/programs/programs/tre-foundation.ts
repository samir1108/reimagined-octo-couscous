import type { SessionProgramV3 } from "../types";

export const TRE_FOUNDATION: SessionProgramV3 = {
  "id": "tre-foundation",
  "title": "Tension Release Foundation",
  "subtitle": "Neurogenic tremor",
  "description": "A 7-session arc — What TRE is; Safety scaffolding; Inducing the tremor.",
  "difficulty": "intermediate",
  "category": "healing",
  "tags": [
    "TRE",
    "tremor"
  ],
  "icon": "Waves",
  "coverGradient": "from-cyan-700 to-blue-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "What TRE is"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Inducing the tremor"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Weekly rhythm"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Integration day"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "What TRE is",
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
      "intent": "Safety scaffolding",
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
      "intent": "Inducing the tremor",
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
      "intent": "Self-regulation",
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
      "intent": "Releasing the psoas",
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
      "intent": "Weekly rhythm",
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
      "intent": "Integration day",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
