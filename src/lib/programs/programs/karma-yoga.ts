/**
 * PROGRAM: Karma Yoga — work as practice.
 */
import type { SessionProgramV3 } from "../types";

export const KARMA_YOGA: SessionProgramV3 = {
  id: "karma-yoga",
  title: "Karma Yoga",
  subtitle: "Action without attachment to fruit",
  description:
    "A 7-session arc from Bhagavad Gita's core teaching: act fully, release the result, and let work become the practice.",
  difficulty: "intermediate",
  category: "ethics",
  tags: ["karma", "gita", "action"],
  icon: "Hammer",
  coverGradient: "from-emerald-600 to-amber-700",
  totalSessions: 7,
  phases: [
    { phase: "Foundation", sessions: 2, focus: "The Gita's frame" },
    { phase: "Practice", sessions: 3, focus: "Act without grasping" },
    { phase: "Integration", sessions: 1, focus: "Work as offering" },
    { phase: "Mastery", sessions: 1, focus: "Effortless action" },
  ],
  sessions: [
    { index: 1, phase: "Foundation",
      intent: "Meet the core teaching",
      required: ["ritual.opening-bow", "wisdom.gita.2.47", "framework.loop-anatomy", "journal.head-heart-gut-check"],
      targetMinutes: 18 },
    { index: 2, phase: "Foundation",
      intent: "See where you grasp for results",
      required: ["witness.thought-counter", "shadow.who-triggers-me", "journal.loop-of-the-day"],
      targetMinutes: 20 },
    { index: 3, phase: "Practice",
      intent: "One task, no checking outcome",
      required: ["micro-act.tidy-one-thing", "observe.one-object", "voice-journal.speak-it-out"],
      targetMinutes: 20 },
    { index: 4, phase: "Practice",
      intent: "Speech without agenda",
      required: ["speech-vow.no-complaint-1h", "speech-vow.one-honest-thing", "contemplation.sit-with-question"],
      targetMinutes: 20 },
    { index: 5, phase: "Practice",
      intent: "Release the fruit",
      required: ["ifs.unburden-protector", "emotion.rain", "journal.unsent-letter"],
      targetMinutes: 25 },
    { index: 6, phase: "Integration",
      intent: "Work as offering",
      required: ["mudra.anjali", "micro-act.thank-someone", "ritual.dedicate-merit"],
      targetMinutes: 18 },
    { index: 7, phase: "Mastery",
      intent: "Act fully. Be free.",
      required: ["ritual.opening-bow", "mantra.aham-brahmasmi", "meditation.open-awareness", "inquiry.who-am-i", "ritual.dedicate-merit"],
      targetMinutes: 28 },
  ],
};
