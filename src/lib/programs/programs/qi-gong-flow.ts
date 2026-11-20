import type { SessionProgramV3 } from "../types";

export const QI_GONG_FLOW: SessionProgramV3 = {
  "id": "qi-gong-flow",
  "title": "Qi Gong Flow",
  "subtitle": "Cultivating life-force",
  "description": "A 7-session arc — Standing post; Eight pieces of brocade; Microcosmic orbit.",
  "difficulty": "intermediate",
  "category": "energy",
  "tags": [
    "qigong",
    "energy"
  ],
  "icon": "Wind",
  "coverGradient": "from-green-700 to-teal-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Standing post"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Microcosmic orbit"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Stillness in motion"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Daily practice"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Standing post",
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
      "intent": "Eight pieces of brocade",
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
      "intent": "Microcosmic orbit",
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
      "intent": "Five animal frolics",
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
      "intent": "Breath & movement",
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
      "intent": "Stillness in motion",
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
      "intent": "Daily practice",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
