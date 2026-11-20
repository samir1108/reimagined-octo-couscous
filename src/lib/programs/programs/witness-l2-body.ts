import type { SessionProgramV3 } from "../types";

export const WITNESS_L2_BODY: SessionProgramV3 = {
  id: "witness-l2-body",
  title: "Witness · Level 2",
  subtitle: "Body scanning — sakshi in sensation",
  description: "A 7-session arc witnessing sensation without owning it.",
  difficulty: "beginner",
  category: "mind",
  tags: ["witness","body","vipassana"],
  icon: "Activity",
  coverGradient: "from-emerald-700 to-slate-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Body as field"},{"phase":"Practice","sessions":4,"focus":"Head-to-toe scan"},{"phase":"Integration","sessions":1,"focus":"Body in the day"},{"phase":"Mastery","sessions":1,"focus":"Body as awareness"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Body as field",
    "required": [
      "ritual.opening-bow",
      "teach.witness.what-is-sakshi",
      "framework.window-of-tolerance"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Head-to-toe scan",
    "required": [
      "body.head-to-toe",
      "meditation.body-as-anchor",
      "witness.thought-as-object"
    ],
    "targetMinutes": 22
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Tension map",
    "required": [
      "body.tension-map",
      "somatic.tense-release",
      "witness.gap-between-thoughts"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Sensation as wave",
    "required": [
      "body.felt-sense",
      "meditation.choiceless-awareness",
      "witness.name-the-watcher"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Full scan, long sit",
    "required": [
      "body.full-scan-5min",
      "meditation.body-as-anchor",
      "meditation.open-awareness"
    ],
    "targetMinutes": 28
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Body in the day",
    "required": [
      "micro-act.stretch-once",
      "body.micro-scan-60s",
      "journal.head-heart-gut-check"
    ],
    "targetMinutes": 15
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Body as awareness",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "mantra.so-hum",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
