import type { SessionProgramV3 } from "../types";

export const SILENT_RETREAT_SELF: SessionProgramV3 = {
  "id": "silent-retreat-self",
  "title": "Self-led Silent Retreat",
  "subtitle": "Designing your own",
  "description": "A 7-session arc — Choosing the container; Pre-retreat clean-up; Day 1 — landing.",
  "difficulty": "intermediate",
  "category": "integration",
  "tags": [
    "retreat",
    "silence"
  ],
  "icon": "VolumeX",
  "coverGradient": "from-stone-700 to-slate-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Choosing the container"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Day 1 — landing"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Closing carefully"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Re-entry"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Choosing the container",
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
      "intent": "Pre-retreat clean-up",
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
      "intent": "Day 1 — landing",
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
      "intent": "Day 2 — turbulence",
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
      "intent": "Day 3 — settling",
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
      "intent": "Closing carefully",
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
      "intent": "Re-entry",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
