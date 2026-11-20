import type { SessionProgramV3 } from "../types";

export const GLOBAL_CITIZEN: SessionProgramV3 = {
  "id": "global-citizen",
  "title": "Global Citizen Sadhana",
  "subtitle": "Engaged spirituality",
  "description": "A 7-session arc — Inner work first; Bear witness; Choose one frontline.",
  "difficulty": "intermediate",
  "category": "integration",
  "tags": [
    "engaged",
    "global"
  ],
  "icon": "Globe",
  "coverGradient": "from-blue-700 to-emerald-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Inner work first"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Choose one frontline"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Coalition over purity"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Lifelong arc"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Inner work first",
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
      "intent": "Bear witness",
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
      "intent": "Choose one frontline",
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
      "intent": "Small consistent action",
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
      "intent": "Avoid doom-spirals",
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
      "intent": "Coalition over purity",
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
      "intent": "Lifelong arc",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
