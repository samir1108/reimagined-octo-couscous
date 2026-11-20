import type { SessionProgramV3 } from "../types";

export const NETI_NETI_PATH: SessionProgramV3 = {
  "id": "neti-neti-path",
  "title": "Neti Neti",
  "subtitle": "Not this, not this",
  "description": "A 7-session arc — Body — not me; Senses — not me; Mind — not me.",
  "difficulty": "intermediate",
  "category": "wisdom",
  "tags": [
    "advaita",
    "negation"
  ],
  "icon": "Minus",
  "coverGradient": "from-zinc-800 to-slate-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Body — not me"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Mind — not me"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Witness — beyond me"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "What cannot be negated"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Body — not me",
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
      "intent": "Senses — not me",
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
      "intent": "Mind — not me",
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
      "intent": "Emotions — not me",
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
      "intent": "Roles — not me",
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
      "intent": "Witness — beyond me",
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
      "intent": "What cannot be negated",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
