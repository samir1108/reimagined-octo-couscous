import type { SessionProgramV3 } from "../types";

export const PROCRASTINATION_ROOT: SessionProgramV3 = {
  id: "procrastination-root",
  title: "Procrastination · Root",
  subtitle: "Find what avoidance is protecting",
  description: "A 7-session arc to meet what hides under delay.",
  difficulty: "beginner",
  category: "shadow",
  tags: ["procrastination","avoidance","action"],
  icon: "Hourglass",
  coverGradient: "from-stone-700 to-violet-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Delay is information"},{"phase":"Practice","sessions":4,"focus":"Name the avoided task"},{"phase":"Integration","sessions":1,"focus":"Tiny daily commitment"},{"phase":"Mastery","sessions":1,"focus":"Action as devotion"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Delay is information",
    "required": [
      "ritual.opening-bow",
      "framework.witness-vs-thinker",
      "journal.what-am-i-avoiding"
    ],
    "targetMinutes": 15
  },
  {
    "index": 2,
    "phase": "Practice",
    "intent": "Name the avoided task",
    "required": [
      "contemplation.sit-with-question",
      "journal.head-heart-gut-check",
      "voice-journal.speak-it-out"
    ],
    "targetMinutes": 18
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Fear beneath the task",
    "required": [
      "emotion.precise-name",
      "shadow.what-i-hide",
      "ifs.meet-a-part"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Body-level resistance",
    "required": [
      "body.tension-map",
      "somatic.tense-release",
      "breath.physiological-sigh"
    ],
    "targetMinutes": 20
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Two-minute start",
    "required": [
      "micro-act.tidy-one-thing",
      "detox.single-tab",
      "witness.thought-as-object"
    ],
    "targetMinutes": 18
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "Tiny daily commitment",
    "required": [
      "journal.three-wins",
      "speech-vow.one-honest-thing",
      "journal.loop-of-the-day"
    ],
    "targetMinutes": 15
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Action as devotion",
    "required": [
      "ritual.opening-bow",
      "meditation.open-awareness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
