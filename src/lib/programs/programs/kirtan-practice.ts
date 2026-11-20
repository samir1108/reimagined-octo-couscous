import type { SessionProgramV3 } from "../types";

export const KIRTAN_PRACTICE: SessionProgramV3 = {
  "id": "kirtan-practice",
  "title": "Kirtan Practice",
  "subtitle": "Call & response devotion",
  "description": "A 7-session arc — Opening invocation; Call & response basics; Hare Krishna.",
  "difficulty": "intermediate",
  "category": "devotion",
  "tags": [
    "kirtan",
    "bhakti"
  ],
  "icon": "Mic",
  "coverGradient": "from-orange-600 to-pink-700",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Opening invocation"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Hare Krishna"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Closing arati"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Carrying it forward"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Opening invocation",
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
      "intent": "Call & response basics",
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
      "intent": "Hare Krishna",
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
      "intent": "Om Namah Shivaya",
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
      "intent": "Drop into ecstasy",
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
      "intent": "Closing arati",
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
      "intent": "Carrying it forward",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
