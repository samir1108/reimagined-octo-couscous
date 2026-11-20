import type { SessionProgramV3 } from "../types";

export const ADDICTION_RECOVERY_SOUL: SessionProgramV3 = {
  "id": "addiction-recovery-soul",
  "title": "Addiction Recovery — Soul Layer",
  "subtitle": "Beneath the substance",
  "description": "A 7-session arc — The hole you are filling; Higher power inquiry; Powerlessness as gift.",
  "difficulty": "intermediate",
  "category": "healing",
  "tags": [
    "recovery",
    "addiction"
  ],
  "icon": "Shield",
  "coverGradient": "from-red-900 to-stone-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "The hole you are filling"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Powerlessness as gift"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Service heals"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Spiritual awakening"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "The hole you are filling",
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
      "intent": "Higher power inquiry",
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
      "intent": "Powerlessness as gift",
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
      "intent": "Making amends",
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
      "intent": "Daily inventory",
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
      "intent": "Service heals",
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
      "intent": "Spiritual awakening",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
