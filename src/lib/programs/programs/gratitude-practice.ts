/**
 * PROGRAM: Gratitude Practice — train the noticing of grace.
 */
import type { SessionProgramV3 } from "../types";

export const GRATITUDE_PRACTICE: SessionProgramV3 = {
  id: "gratitude-practice",
  title: "Gratitude Practice",
  subtitle: "Train the eye that sees grace",
  description:
    "A 5-session arc to rewire the brain's negativity bias into a steady noticing of what's already given.",
  difficulty: "beginner",
  category: "emotional",
  tags: ["gratitude", "bhakti", "joy"],
  icon: "Sun",
  coverGradient: "from-yellow-500 to-amber-600",
  totalSessions: 5,
  phases: [
    { phase: "Foundation", sessions: 1, focus: "See what is given" },
    { phase: "Practice", sessions: 2, focus: "Feel it in body" },
    { phase: "Integration", sessions: 1, focus: "Give it back" },
    { phase: "Mastery", sessions: 1, focus: "Gratitude as baseline" },
  ],
  sessions: [
    { index: 1, phase: "Foundation",
      intent: "Notice one thing already given",
      required: ["ritual.opening-bow", "observe.5-senses", "journal.head-heart-gut-check"],
      targetMinutes: 12 },
    { index: 2, phase: "Practice",
      intent: "Feel gratitude in the body",
      required: ["body.head-to-toe", "meditation.loving-kindness", "mudra.anjali"],
      targetMinutes: 18 },
    { index: 3, phase: "Practice",
      intent: "Letter to someone who shaped you",
      required: ["wisdom.rumi.guest-house", "journal.unsent-letter", "voice-journal.speak-it-out"],
      targetMinutes: 22 },
    { index: 4, phase: "Integration",
      intent: "Give it back",
      required: ["micro-act.thank-someone", "speech-vow.one-honest-thing", "micro-act.call-someone"],
      targetMinutes: 15 },
    { index: 5, phase: "Mastery",
      intent: "Gratitude as the default lens",
      required: ["ritual.opening-bow", "mantra.om", "meditation.loving-kindness", "ritual.dedicate-merit"],
      targetMinutes: 22 },
  ],
};
