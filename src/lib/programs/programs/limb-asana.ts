import type { SessionProgramV3 } from "../types";

export const LIMB_ASANA: SessionProgramV3 = {
  id: "limb-asana",
  title: "Limb 3 · Asana",
  subtitle: "Steady, easeful seat",
  description: "A 7-session arc on asana as preparation for meditation, not performance.",
  difficulty: "beginner",
  category: "embodiment",
  tags: ["8-limbs","asana","body"],
  icon: "PersonStanding",
  coverGradient: "from-amber-700 to-stone-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Sthira sukham"},{"phase":"Practice","sessions":4,"focus":"Find a meditation seat"},{"phase":"Integration","sessions":1,"focus":"Asana in posture today"},{"phase":"Mastery","sessions":1,"focus":"Body as temple"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Sthira sukham",
    "required": [
      "ritual.opening-bow",
      "wisdom.gita.6.5",
      "framework.window-of-tolerance"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Find a meditation seat",
    "required": [
      "body.head-to-toe",
      "mudra.dhyana",
      "meditation.body-as-anchor"
    ],
    "targetMinutes": 20
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Wake the spine",
    "required": [
      "movement.cat-cow",
      "movement.spinal-twist",
      "kriya.spinal-flex"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Sun salutation flow",
    "required": [
      "movement.sun-salute-1",
      "breath.ujjayi",
      "meditation.body-as-anchor"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Long hold, soft breath",
    "required": [
      "body.tension-map",
      "somatic.tense-release",
      "breath.coherent-5-5"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Asana in posture today",
    "required": [
      "micro-act.stretch-once",
      "movement.shoulder-roll",
      "journal.head-heart-gut-check"
    ],
    "targetMinutes": 15
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Body as temple",
    "required": [
      "ritual.opening-bow",
      "meditation.body-as-anchor",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
