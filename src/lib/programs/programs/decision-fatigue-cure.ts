import type { SessionProgramV3 } from "../types";

export const DECISION_FATIGUE_CURE: SessionProgramV3 = {
  "id": "decision-fatigue-cure",
  "title": "Decision Fatigue Cure",
  "subtitle": "Less choice, more presence",
  "description": "A 7-session arc — Audit decisions; Automate the trivial; Theme your days.",
  "difficulty": "intermediate",
  "category": "integration",
  "tags": [
    "decisions",
    "simplify"
  ],
  "icon": "CheckSquare",
  "coverGradient": "from-teal-700 to-stone-900",
  "totalSessions": 7,
  "phases": [
    {
      "phase": "Foundation",
      "sessions": 2,
      "focus": "Audit decisions"
    },
    {
      "phase": "Practice",
      "sessions": 3,
      "focus": "Theme your days"
    },
    {
      "phase": "Integration",
      "sessions": 1,
      "focus": "Pause practice"
    },
    {
      "phase": "Mastery",
      "sessions": 1,
      "focus": "Trust the gut"
    }
  ],
  "sessions": [
    {
      "index": 1,
      "phase": "Foundation",
      "intent": "Audit decisions",
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
      "intent": "Automate the trivial",
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
      "intent": "Theme your days",
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
      "intent": "Default to yes/no rules",
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
      "intent": "Energy budget",
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
      "intent": "Pause practice",
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
      "intent": "Trust the gut",
      "required": [
        "ritual.opening-bow",
        "meditation.open-awareness",
        "ritual.dedicate-merit"
      ],
      "targetMinutes": 22
    }
  ]
};
