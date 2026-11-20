/**
 * PROGRAM: Loving-Kindness Path — metta as medicine.
 */
import type { SessionProgramV3 } from "../types";

export const LOVING_KINDNESS_PATH: SessionProgramV3 = {
  id: "loving-kindness-path",
  title: "Loving-Kindness Path",
  subtitle: "Metta as medicine for the heart",
  description:
    "A 7-session arc through traditional metta — self, benefactor, neutral, difficult, all beings — to soften and widen the heart.",
  difficulty: "beginner",
  category: "heart",
  tags: ["metta", "loving-kindness", "heart"],
  icon: "Sparkle",
  coverGradient: "from-pink-500 to-amber-500",
  totalSessions: 7,
  phases: [
    { phase: "Foundation", sessions: 1, focus: "The metta frame" },
    { phase: "Practice", sessions: 4, focus: "Widening circles" },
    { phase: "Integration", sessions: 1, focus: "Bring it to life" },
    { phase: "Mastery", sessions: 1, focus: "All beings, no exception" },
  ],
  sessions: [
    { index: 1, phase: "Foundation",
      intent: "What is metta?",
      required: ["ritual.opening-bow", "teach.parable.two-arrows", "mudra.anjali"],
      targetMinutes: 16 },
    { index: 2, phase: "Practice",
      intent: "Metta for yourself",
      required: ["meditation.loving-kindness", "body.head-to-toe", "journal.head-heart-gut-check"],
      targetMinutes: 22 },
    { index: 3, phase: "Practice",
      intent: "Metta for a benefactor",
      required: ["meditation.loving-kindness", "voice-journal.speak-it-out", "micro-act.thank-someone"],
      targetMinutes: 22 },
    { index: 4, phase: "Practice",
      intent: "Metta for a neutral one",
      required: ["meditation.loving-kindness", "observe.5-senses", "contemplation.sit-with-question"],
      targetMinutes: 22 },
    { index: 5, phase: "Practice",
      intent: "Metta for a difficult one",
      required: ["meditation.loving-kindness", "shadow.who-triggers-me", "ifs.unburden-protector"],
      targetMinutes: 25 },
    { index: 6, phase: "Integration",
      intent: "Bring it to life",
      required: ["micro-act.call-someone", "speech-vow.one-honest-thing", "ritual.dedicate-merit"],
      targetMinutes: 18 },
    { index: 7, phase: "Mastery",
      intent: "All beings, no exception",
      required: ["ritual.opening-bow", "meditation.loving-kindness", "mantra.om", "ritual.dedicate-merit"],
      targetMinutes: 25 },
  ],
};
