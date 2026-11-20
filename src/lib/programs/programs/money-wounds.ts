import type { SessionProgramV3 } from "../types";

export const MONEY_WOUNDS: SessionProgramV3 = {
  id: "money-wounds",
  title: "Money Wounds",
  subtitle: "Heal what you inherited about money",
  description: "A 7-session arc to surface and integrate money stories.",
  difficulty: "intermediate",
  category: "shadow",
  tags: ["money","wealth","wounds"],
  icon: "Coins",
  coverGradient: "from-amber-700 to-stone-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Money is mirror"},{"phase":"Practice","sessions":4,"focus":"Inherited story"},{"phase":"Integration","sessions":1,"focus":"One clean money act"},{"phase":"Mastery","sessions":1,"focus":"Money as flow"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Money is mirror",
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
    "intent": "Inherited story",
    "required": [
      "journal.unsent-letter",
      "shadow.what-i-hide",
      "voice-journal.speak-it-out"
    ],
    "targetMinutes": 22
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Body & money",
    "required": [
      "body.tension-map",
      "emotion.where-in-body",
      "somatic.tense-release"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Scarcity loop",
    "required": [
      "loop.identify-trigger",
      "ai-mirror.pattern-reflect",
      "witness.thought-as-object"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Receive practice",
    "required": [
      "journal.three-wins",
      "meditation.loving-kindness",
      "micro-act.thank-someone"
    ],
    "targetMinutes": 20
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "One clean money act",
    "required": [
      "micro-act.tidy-one-thing",
      "speech-vow.one-honest-thing",
      "journal.loop-of-the-day"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Money as flow",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
