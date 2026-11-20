import type { SessionProgramV3 } from "../types";

export const PARENTING_AS_PRACTICE: SessionProgramV3 = {
  "id": "parenting-as-practice",
  "title": "Parenting as Practice",
  "subtitle": "The child as guru",
  "description": "A 7-session arc — Presence over perfection; Repair > rupture; Your triggers, your work.",
  "difficulty": "intermediate",
  "category": "relationships",
  "tags": [
    "parenting",
    "family"
  ],
  "icon": "Baby",
  "coverGradient": "from-orange-400 to-rose-700",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Presence over perfection"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Your triggers, your work"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Holding without controlling"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Letting go in stages"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Presence over perfection",
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
      "intent": "Repair > rupture",
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
      "intent": "Your triggers, your work",
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
      "intent": "Listening to small voices",
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
      "intent": "Modeling regulation",
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
      "intent": "Holding without controlling",
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
      "intent": "Letting go in stages",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
