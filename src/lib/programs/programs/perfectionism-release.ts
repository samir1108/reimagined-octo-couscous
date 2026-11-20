import type { SessionProgramV3 } from "../types";

export const PERFECTIONISM_RELEASE: SessionProgramV3 = {
  id: "perfectionism-release",
  title: "Perfectionism Release",
  subtitle: "Good enough is the door",
  description: "A 7-session arc to soften the standards that paralyze action.",
  difficulty: "beginner",
  category: "shadow",
  tags: ["perfectionism","release","action"],
  icon: "CheckSquare",
  coverGradient: "from-stone-700 to-amber-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Perfect is the enemy"},{"phase":"Practice","sessions":4,"focus":"Cost of the standard"},{"phase":"Integration","sessions":1,"focus":"Done > perfect"},{"phase":"Mastery","sessions":1,"focus":"Imperfect & free"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Perfect is the enemy",
    "required": [
      "ritual.opening-bow",
      "framework.witness-vs-thinker",
      "journal.head-heart-gut-check"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Cost of the standard",
    "required": [
      "loop.cost-ledger",
      "journal.what-am-i-avoiding",
      "ai-mirror.pattern-reflect"
    ],
    "targetMinutes": 22
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Meet the critic",
    "required": [
      "ifs.meet-a-part",
      "shadow.what-i-hide",
      "voice-journal.speak-it-out"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Body-tension scan",
    "required": [
      "body.tension-map",
      "somatic.tense-release",
      "breath.coherent-5-5"
    ],
    "targetMinutes": 20
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Ship one ugly thing",
    "required": [
      "micro-act.tidy-one-thing",
      "speech-vow.one-honest-thing",
      "journal.three-wins"
    ],
    "targetMinutes": 20
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Done > perfect",
    "required": [
      "journal.loop-of-the-day",
      "micro-act.thank-someone",
      "speech-vow.say-it-shorter"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Imperfect & free",
    "required": [
      "ritual.opening-bow",
      "meditation.loving-kindness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
