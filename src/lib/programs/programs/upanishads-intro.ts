import type { SessionProgramV3 } from "../types";

export const UPANISHADS_INTRO: SessionProgramV3 = {
  id: "upanishads-intro",
  title: "Upanishads · Intro",
  subtitle: "Tat tvam asi — you are That",
  description: "A 7-session entry into the great non-dual texts.",
  difficulty: "intermediate",
  category: "wisdom",
  tags: ["upanishads","non-dual","scripture"],
  icon: "BookOpen",
  coverGradient: "from-indigo-800 to-black",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"What is an Upanishad"},{"phase":"Practice","sessions":4,"focus":"Tat tvam asi"},{"phase":"Integration","sessions":1,"focus":"Live as That"},{"phase":"Mastery","sessions":1,"focus":"Atman = Brahman"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "What is an Upanishad",
    "required": [
      "ritual.opening-bow",
      "wisdom.upanishad.tat-tvam-asi",
      "framework.witness-vs-thinker"
    ],
    "targetMinutes": 18
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Tat tvam asi",
    "required": [
      "inquiry.what-is-aware",
      "contemplation.sit-with-question",
      "meditation.sky-mind"
    ],
    "targetMinutes": 25
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Aham brahmasmi",
    "required": [
      "mantra.aham-brahmasmi",
      "witness.who-is-watching",
      "meditation.open-awareness"
    ],
    "targetMinutes": 25
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Neti, neti",
    "required": [
      "inquiry.who-am-i",
      "witness.thought-as-object",
      "meditation.choiceless-awareness"
    ],
    "targetMinutes": 25
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "The 5 sheaths",
    "required": [
      "body.full-scan-5min",
      "witness.name-the-watcher",
      "meditation.body-as-anchor"
    ],
    "targetMinutes": 25
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Live as That",
    "required": [
      "micro-act.tidy-one-thing",
      "speech-vow.one-honest-thing",
      "journal.day-in-one-sentence"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Atman = Brahman",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "mantra.aham-brahmasmi",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 28
  }
],
};
