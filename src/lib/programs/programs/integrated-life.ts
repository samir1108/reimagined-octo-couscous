import type { SessionProgramV3 } from "../types";

export const INTEGRATED_LIFE: SessionProgramV3 = {
  "id": "integrated-life",
  "title": "Integrated Life Design",
  "subtitle": "Sadhana inside modernity",
  "description": "A 7-session arc — Audit your week; Anchors & rhythms; Work as practice.",
  "difficulty": "intermediate",
  "category": "integration",
  "tags": [
    "modern",
    "design"
  ],
  "icon": "LayoutGrid",
  "coverGradient": "from-emerald-700 to-slate-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Audit your week"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Work as practice"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Rest as sacred"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Iterate quarterly"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Audit your week",
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
      "intent": "Anchors & rhythms",
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
      "intent": "Work as practice",
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
      "intent": "Tech boundaries",
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
      "intent": "Relationships as mirror",
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
      "intent": "Rest as sacred",
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
      "intent": "Iterate quarterly",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
