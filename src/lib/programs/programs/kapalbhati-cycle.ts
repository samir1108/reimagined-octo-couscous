import type { SessionProgramV3 } from "../types";

export const KAPALBHATI_CYCLE: SessionProgramV3 = {
  id: "kapalbhati-cycle",
  title: "Kapalbhati Cycle",
  subtitle: "Skull-shining breath",
  description: "A 7-session arc training kapalbhati for clarity.",
  difficulty: "intermediate",
  category: "embodiment",
  tags: ["pranayama","kapalbhati","clarity"],
  icon: "Sparkles",
  coverGradient: "from-yellow-700 to-orange-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Why skull-shining"},{"phase":"Practice","sessions":4,"focus":"Slow rounds"},{"phase":"Integration","sessions":1,"focus":"Morning use"},{"phase":"Mastery","sessions":1,"focus":"Clarity as default"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Why skull-shining",
    "required": [
      "ritual.opening-bow",
      "neuro.amygdala-hijack",
      "framework.window-of-tolerance"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Slow rounds",
    "required": [
      "breath.kapalbhati",
      "mudra.gyan",
      "meditation.anchor-breath"
    ],
    "targetMinutes": 18
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Medium rounds",
    "required": [
      "breath.kapalbhati",
      "breath.coherent-5-5",
      "witness.gap-between-thoughts"
    ],
    "targetMinutes": 20
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "With retention",
    "required": [
      "breath.kapalbhati",
      "breath.box-4-4-4-4",
      "meditation.body-as-anchor"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Long cycle",
    "required": [
      "breath.kapalbhati",
      "meditation.anchor-breath",
      "meditation.open-awareness"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Morning use",
    "required": [
      "detox.no-screen-1h-morning",
      "micro-act.drink-water",
      "journal.head-heart-gut-check"
    ],
    "targetMinutes": 15
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Clarity as default",
    "required": [
      "ritual.opening-bow",
      "breath.kapalbhati",
      "meditation.open-awareness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
