import type { SessionProgramV3 } from "../types";

export const NADI_SHODHANA_MASTERY: SessionProgramV3 = {
  id: "nadi-shodhana-mastery",
  title: "Nadi Shodhana Mastery",
  subtitle: "Alternate-nostril for nervous balance",
  description: "A 7-session arc mastering channel purification.",
  difficulty: "intermediate",
  category: "embodiment",
  tags: ["pranayama","nadi-shodhana"],
  icon: "GitBranch",
  coverGradient: "from-teal-700 to-indigo-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Why balance nadis"},{"phase":"Practice","sessions":4,"focus":"Basic technique"},{"phase":"Integration","sessions":1,"focus":"Use before meetings"},{"phase":"Mastery","sessions":1,"focus":"Balanced as baseline"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Why balance nadis",
    "required": [
      "ritual.opening-bow",
      "neuro.vagus-nerve",
      "framework.three-brains-diagram"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Basic technique",
    "required": [
      "breath.nadi-shodhana",
      "mudra.gyan",
      "meditation.anchor-breath"
    ],
    "targetMinutes": 18
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Equal ratio 5-5",
    "required": [
      "breath.coherent-5-5",
      "breath.nadi-shodhana",
      "meditation.body-as-anchor"
    ],
    "targetMinutes": 20
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Extended exhale",
    "required": [
      "breath.nadi-shodhana",
      "breath.physiological-sigh",
      "witness.gap-between-thoughts"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Long round with retention",
    "required": [
      "breath.nadi-shodhana",
      "breath.box-4-4-4-4",
      "meditation.anchor-breath"
    ],
    "targetMinutes": 25
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Use before meetings",
    "required": [
      "micro-act.drink-water",
      "speech-vow.pause-before-reply",
      "journal.head-heart-gut-check"
    ],
    "targetMinutes": 12
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Balanced as baseline",
    "required": [
      "ritual.opening-bow",
      "breath.nadi-shodhana",
      "meditation.open-awareness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
