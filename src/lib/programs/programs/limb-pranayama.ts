import type { SessionProgramV3 } from "../types";

export const LIMB_PRANAYAMA: SessionProgramV3 = {
  id: "limb-pranayama",
  title: "Limb 4 · Pranayama",
  subtitle: "Breath as the bridge",
  description: "A 7-session arc surveying the major pranayamas as Patanjali frames them.",
  difficulty: "intermediate",
  category: "embodiment",
  tags: ["8-limbs","pranayama"],
  icon: "Wind",
  coverGradient: "from-cyan-700 to-blue-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Why breath is bridge"},{"phase":"Practice","sessions":4,"focus":"Coherent 5-5"},{"phase":"Integration","sessions":1,"focus":"Breath in life"},{"phase":"Mastery","sessions":1,"focus":"Prana as guide"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Why breath is bridge",
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
    "intent": "Coherent 5-5",
    "required": [
      "breath.coherent-5-5",
      "meditation.anchor-breath",
      "mudra.gyan"
    ],
    "targetMinutes": 18
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Box breathing",
    "required": [
      "breath.box-4-4-4-4",
      "meditation.body-as-anchor",
      "witness.gap-between-thoughts"
    ],
    "targetMinutes": 20
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Nadi shodhana",
    "required": [
      "breath.nadi-shodhana",
      "mudra.gyan",
      "meditation.anchor-breath"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Ujjayi + kumbhaka",
    "required": [
      "breath.ujjayi",
      "breath.box-4-4-4-4",
      "meditation.open-awareness"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Breath in life",
    "required": [
      "somatic.sigh-3x",
      "breath.physiological-sigh",
      "journal.head-heart-gut-check"
    ],
    "targetMinutes": 15
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Prana as guide",
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
