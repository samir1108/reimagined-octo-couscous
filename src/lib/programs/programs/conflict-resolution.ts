import type { SessionProgramV3 } from "../types";

export const CONFLICT_RESOLUTION: SessionProgramV3 = {
  id: "conflict-resolution",
  title: "Conflict Resolution",
  subtitle: "Stay present when it gets hot",
  description: "A 7-session arc to stay regulated and clear inside disagreement.",
  difficulty: "intermediate",
  category: "heart",
  tags: ["conflict","communication"],
  icon: "MessagesSquare",
  coverGradient: "from-stone-700 to-rose-900",
  totalSessions: 7,
  phases: [{"phase":"Foundation","sessions":1,"focus":"Conflict is not enemy"},{"phase":"Practice","sessions":4,"focus":"Regulate before reply"},{"phase":"Integration","sessions":1,"focus":"One real conversation"},{"phase":"Mastery","sessions":1,"focus":"Both heard, both whole"}],
  sessions: [
  {
    "index": 1,
    "phase": "Foundation",
    "intent": "Conflict is not enemy",
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
    "intent": "Regulate before reply",
    "required": [
      "breath.physiological-sigh",
      "somatic.sigh-3x",
      "speech-vow.pause-before-reply"
    ],
    "targetMinutes": 20
  },
  {
    "index": 3,
    "phase": "Practice",
    "intent": "Find your real ask",
    "required": [
      "inquiry.what-do-i-want",
      "contemplation.sit-with-question",
      "journal.head-heart-gut-check"
    ],
    "targetMinutes": 22
  },
  {
    "index": 4,
    "phase": "Practice",
    "intent": "Hear their ask",
    "required": [
      "observe.three-sounds",
      "meditation.loving-kindness",
      "witness.thought-as-object"
    ],
    "targetMinutes": 22
  },
  {
    "index": 5,
    "phase": "Practice",
    "intent": "Repair script",
    "required": [
      "speech-vow.one-honest-thing",
      "speech-vow.say-it-shorter",
      "voice-journal.speak-it-out"
    ],
    "targetMinutes": 22
  },
  {
    "index": 6,
    "phase": "Integration",
    "intent": "One real conversation",
    "required": [
      "micro-act.call-someone",
      "journal.loop-of-the-day",
      "journal.day-in-one-sentence"
    ],
    "targetMinutes": 18
  },
  {
    "index": 7,
    "phase": "Mastery",
    "intent": "Both heard, both whole",
    "required": [
      "ritual.opening-bow",
      "meditation.loving-kindness",
      "ritual.dedicate-merit"
    ],
    "targetMinutes": 22
  }
],
};
