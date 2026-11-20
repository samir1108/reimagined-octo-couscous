import type { SessionProgramV3 } from "../types";

export const SOMATIC_RELEASE: SessionProgramV3 = {
  "id": "somatic-release",
  "title": "Somatic Release",
  "subtitle": "Body remembers",
  "description": "A 7-session arc — Track sensations; Pendulation; Titration.",
  "difficulty": "intermediate",
  "category": "healing",
  "tags": [
    "somatic",
    "body"
  ],
  "icon": "Activity",
  "coverGradient": "from-amber-700 to-red-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Track sensations"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Titration"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Completing the response"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Integration"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Track sensations",
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
      "intent": "Pendulation",
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
      "intent": "Titration",
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
      "intent": "Discharge cycles",
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
      "intent": "Resourcing",
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
      "intent": "Completing the response",
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
      "intent": "Integration",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
