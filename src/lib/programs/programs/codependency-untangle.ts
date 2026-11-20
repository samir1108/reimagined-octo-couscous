import type { SessionProgramV3 } from "../types";

export const CODEPENDENCY_UNTANGLE: SessionProgramV3 = {
  id: "codependency-untangle",
  title: "Codependency Untangle",
  subtitle: "Find yourself inside the we",
  description: "A 7-session arc to separate self from the other you keep rescuing.",
  difficulty: "intermediate",
  category: "shadow",
  tags: ["codependency","boundaries","self"],
  icon: "Unlink",
  coverGradient: "from-rose-800 to-stone-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Where I end, they begin"},{"phase":"Practice","sessions":4,"focus":"Map the fusion"},{"phase":"Integration","sessions":1,"focus":"One clear boundary"},{"phase":"Mastery","sessions":1,"focus":"Love without losing self"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Where I end, they begin",
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
    "intent": "Map the fusion",
    "required": [
      "journal.what-am-i-avoiding",
      "shadow.what-i-hide",
      "ai-mirror.pattern-reflect"
    ],
    "targetMinutes": 22
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Meet the rescuer part",
    "required": [
      "ifs.meet-a-part",
      "ifs.unburden-protector",
      "voice-journal.speak-it-out"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Feel your own no",
    "required": [
      "body.felt-sense",
      "speech-vow.one-honest-thing",
      "contemplation.sit-with-question"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Self before other",
    "required": [
      "inquiry.what-do-i-want",
      "meditation.loving-kindness",
      "journal.morning-pages-3"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "One clear boundary",
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
    "intent": "Love without losing self",
    "required": [
      "ritual.opening-bow",
      "meditation.loving-kindness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
