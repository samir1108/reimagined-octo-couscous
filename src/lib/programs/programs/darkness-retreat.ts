import type { SessionProgramV3 } from "../types";

export const DARKNESS_RETREAT: SessionProgramV3 = {
  "id": "darkness-retreat",
  "title": "Darkness Practice",
  "subtitle": "Pineal awakening (gentle intro)",
  "description": "A 7-session arc — Why darkness; Mini sessions at home; Sensory recalibration.",
  "difficulty": "intermediate",
  "category": "energy",
  "tags": [
    "darkness",
    "advanced"
  ],
  "icon": "Moon",
  "coverGradient": "from-indigo-950 to-black",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Why darkness"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Sensory recalibration"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Safety scaffolding"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "When to seek a guide"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Why darkness",
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
      "intent": "Mini sessions at home",
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
      "intent": "Sensory recalibration",
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
      "intent": "Inner lights",
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
      "intent": "Time dissolves",
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
      "intent": "Safety scaffolding",
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
      "intent": "When to seek a guide",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
