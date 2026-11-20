import type { SessionProgramV3 } from "../types";

export const SERVICE_VOW: SessionProgramV3 = {
  "id": "service-vow",
  "title": "Seva Vow",
  "subtitle": "Service without ego",
  "description": "A 7-session arc — Why serve; The trap of helper; Hidden seva.",
  "difficulty": "intermediate",
  "category": "devotion",
  "tags": [
    "seva",
    "service"
  ],
  "icon": "HelpingHand",
  "coverGradient": "from-emerald-700 to-amber-700",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Why serve"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Hidden seva"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Anonymous good"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Lifelong dedication"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Why serve",
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
      "intent": "The trap of helper",
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
      "intent": "Hidden seva",
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
      "intent": "Service as worship",
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
      "intent": "Burnout boundaries",
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
      "intent": "Anonymous good",
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
      "intent": "Lifelong dedication",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
