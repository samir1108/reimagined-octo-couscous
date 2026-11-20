import type { SessionProgramV3 } from "../types";

export const LIFELONG_SADHANA_DESIGN: SessionProgramV3 = {
  "id": "lifelong-sadhana-design",
  "title": "Lifelong Sadhana Design",
  "subtitle": "Decades, not days",
  "description": "A 7-session arc — 10-year vision; Seasons of practice; Lineage & guides.",
  "difficulty": "intermediate",
  "category": "integration",
  "tags": [
    "lifelong",
    "design"
  ],
  "icon": "Infinity",
  "coverGradient": "from-amber-800 to-indigo-950",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "10-year vision"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Lineage & guides"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Death as horizon"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Pass it forward"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "10-year vision",
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
      "intent": "Seasons of practice",
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
      "intent": "Lineage & guides",
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
      "intent": "Community rhythm",
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
      "intent": "Rituals across decades",
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
      "intent": "Death as horizon",
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
      "intent": "Pass it forward",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
