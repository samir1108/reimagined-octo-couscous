/**
 * PROGRAM: Sacred Anger — fire as fuel.
 */
import type { SessionProgramV3 } from "../types";

export const SACRED_ANGER: SessionProgramV3 = {
  id: "sacred-anger",
  title: "Sacred Anger",
  subtitle: "Let the fire move without burning the village",
  description:
    "A 7-session arc to feel anger fully, hear its message, and direct its energy toward truth instead of harm.",
  difficulty: "intermediate",
  category: "heart",
  tags: ["anger", "shadow", "emotion"],
  icon: "Flame",
  coverGradient: "from-red-700 to-amber-900",
  totalSessions: 7,
  phases: [
    { phase: "Foundation", sessions: 2, focus: "The body of anger" },
    { phase: "Practice", sessions: 3, focus: "Listen, move, redirect" },
    { phase: "Integration", sessions: 1, focus: "Honest speech" },
    { phase: "Mastery", sessions: 1, focus: "Fierce compassion" },
  ],
  sessions: [
    { index: 1, phase: "Foundation",
      intent: "Where anger lives",
      required: ["ritual.opening-bow", "body.tension-map", "journal.head-heart-gut-check"],
      targetMinutes: 18 },
    { index: 2, phase: "Foundation",
      intent: "Anger as messenger",
      required: ["ifs.meet-a-part", "framework.loop-anatomy", "voice-journal.speak-it-out"],
      targetMinutes: 22 },
    { index: 3, phase: "Practice",
      intent: "Let it move",
      required: ["kriya.spinal-flex", "breath.box-4-4-4-4", "neuro.vagus-nerve"],
      targetMinutes: 22 },
    { index: 4, phase: "Practice",
      intent: "Name without acting",
      required: ["emotion.rain", "loop-confront.interrupt-now", "contemplation.sit-with-question"],
      targetMinutes: 22 },
    { index: 5, phase: "Practice",
      intent: "Unburden the warrior",
      required: ["ifs.unburden-protector", "journal.unsent-letter", "mantra.so-hum"],
      targetMinutes: 25 },
    { index: 6, phase: "Integration",
      intent: "Honest speech",
      required: ["speech-vow.one-honest-thing", "speech-vow.no-complaint-1h", "ritual.dedicate-merit"],
      targetMinutes: 18 },
    { index: 7, phase: "Mastery",
      intent: "Fierce compassion",
      required: ["ritual.opening-bow", "meditation.open-awareness", "mantra.aham-brahmasmi", "ritual.dedicate-merit"],
      targetMinutes: 25 },
  ],
};
