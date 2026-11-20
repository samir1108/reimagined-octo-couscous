import type { SessionProgramV3 } from "../types";

export const DEPRESSION_COMPANION: SessionProgramV3 = {
  id: "depression-companion",
  title: "Depression Companion",
  subtitle: "A gentle presence in the dark",
  description: "A 7-session arc for low-energy days — no pressure, only company.",
  difficulty: "beginner",
  category: "emotional",
  tags: ["depression","companion","gentle"],
  icon: "CloudMoon",
  coverGradient: "from-slate-700 to-indigo-950",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"No fixing tonight"},{"phase":"Practice","sessions":4,"focus":"One micro-act"},{"phase":"Integration","sessions":1,"focus":"One step today"},{"phase":"Mastery","sessions":1,"focus":"You are not alone"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "No fixing tonight",
    "required": [
      "ritual.opening-bow",
      "framework.window-of-tolerance",
      "journal.head-heart-gut-check"
    ],
    "targetMinutes": 12
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "One micro-act",
    "required": [
      "micro-act.drink-water",
      "somatic.sigh-3x",
      "body.micro-scan-60s"
    ],
    "targetMinutes": 12
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Be with the heaviness",
    "required": [
      "emotion.rain",
      "meditation.body-as-anchor",
      "breath.physiological-sigh"
    ],
    "targetMinutes": 18
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Reach for one thread",
    "required": [
      "micro-act.call-someone",
      "voice-journal.speak-it-out",
      "guide-chat.check-in"
    ],
    "targetMinutes": 18
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "A small light",
    "required": [
      "journal.three-wins",
      "meditation.loving-kindness",
      "mantra.om"
    ],
    "targetMinutes": 20
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "One step today",
    "required": [
      "micro-act.stretch-once",
      "micro-act.tidy-one-thing",
      "journal.day-in-one-sentence"
    ],
    "targetMinutes": 12
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "You are not alone",
    "required": [
      "ritual.opening-bow",
      "meditation.loving-kindness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 18
  }
],
};
