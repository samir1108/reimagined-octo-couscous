import type { SessionProgramV3 } from "../types";

export const KUNDALINI_AWAKENING: SessionProgramV3 = {
  id: "kundalini-awakening",
  title: "Kundalini Awakening",
  subtitle: "Awaken the serpent safely",
  description: "A 7-session arc preparing the body for kundalini work — safety first.",
  difficulty: "advanced",
  category: "embodiment",
  tags: ["kundalini","energy","tantra"],
  icon: "Zap",
  coverGradient: "from-amber-700 to-violet-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Respect the serpent"},{"phase":"Practice","sessions":4,"focus":"Open the spine"},{"phase":"Integration","sessions":1,"focus":"Ground & integrate"},{"phase":"Mastery","sessions":1,"focus":"Shakti as ally"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Respect the serpent",
    "required": [
      "ritual.opening-bow",
      "framework.window-of-tolerance",
      "wisdom.gita.6.5"
    ],
    "targetMinutes": 18
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Open the spine",
    "required": [
      "kriya.spinal-flex",
      "movement.cat-cow",
      "breath.coherent-5-5"
    ],
    "targetMinutes": 22
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Breath of fire",
    "required": [
      "kriya.breath-of-fire",
      "kriya.sat-kriya",
      "mudra.gyan"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Channel purification",
    "required": [
      "breath.nadi-shodhana",
      "mudra.dhyana",
      "meditation.body-as-anchor"
    ],
    "targetMinutes": 25
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Long sit, rising",
    "required": [
      "meditation.anchor-breath",
      "meditation.open-awareness",
      "witness.gap-between-thoughts"
    ],
    "targetMinutes": 25
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Ground & integrate",
    "required": [
      "body.head-to-toe",
      "somatic.tense-release",
      "micro-act.tidy-one-thing"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Shakti as ally",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "mantra.aham-brahmasmi",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 25
  }
],
};
