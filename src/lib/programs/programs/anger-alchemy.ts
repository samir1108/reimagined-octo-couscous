import type { SessionProgramV3 } from "../types";

export const ANGER_ALCHEMY: SessionProgramV3 = {
  id: "anger-alchemy",
  title: "Anger Alchemy",
  subtitle: "Turn fire into clarity",
  description: "A 7-session arc to meet anger as energy and intelligence.",
  difficulty: "intermediate",
  category: "emotional",
  tags: ["anger","shadow","alchemy"],
  icon: "Flame",
  coverGradient: "from-red-700 to-stone-950",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Anger is data"},{"phase":"Practice","sessions":4,"focus":"Locate the heat"},{"phase":"Integration","sessions":1,"focus":"Anger as boundary"},{"phase":"Mastery","sessions":1,"focus":"Fire as friend"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Anger is data",
    "required": [
      "ritual.opening-bow",
      "framework.window-of-tolerance",
      "neuro.amygdala-hijack"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Locate the heat",
    "required": [
      "body.tension-map",
      "emotion.where-in-body",
      "breath.physiological-sigh"
    ],
    "targetMinutes": 20
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Name without acting",
    "required": [
      "emotion.precise-name",
      "speech-vow.pause-before-reply",
      "witness.thought-as-object"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Meet the protector",
    "required": [
      "ifs.firefighter-dialogue",
      "ifs.meet-a-part",
      "journal.unsent-letter"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Release safely",
    "required": [
      "somatic.shake-2min",
      "kriya.shaking-meditation",
      "somatic.tense-release"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Anger as boundary",
    "required": [
      "speech-vow.one-honest-thing",
      "micro-act.tidy-one-thing",
      "journal.loop-of-the-day"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Fire as friend",
    "required": [
      "ritual.opening-bow",
      "meditation.loving-kindness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
