/**
 * PROGRAM: Bhakti Flow — devotion as path.
 */
import type { SessionProgramV3 } from "../types";

export const BHAKTI_FLOW: SessionProgramV3 = {
  id: "bhakti-flow",
  title: "Bhakti Flow",
  subtitle: "Devotion as the most direct path",
  description:
    "A 6-session arc into the heart-centered path of bhakti yoga: mantra, surrender, and the dissolution of the small self.",
  difficulty: "beginner",
  category: "heart",
  tags: ["bhakti", "devotion", "mantra"],
  icon: "Flame",
  coverGradient: "from-orange-500 to-rose-700",
  totalSessions: 6,
  phases: [
    { phase: "Foundation", sessions: 1, focus: "The bhakti frame" },
    { phase: "Practice", sessions: 3, focus: "Mantra & surrender" },
    { phase: "Integration", sessions: 1, focus: "Daily devotion" },
    { phase: "Mastery", sessions: 1, focus: "Become the song" },
  ],
  sessions: [
    { index: 1, phase: "Foundation",
      intent: "What is devotion?",
      required: ["ritual.opening-bow", "wisdom.rumi.guest-house", "mudra.anjali"],
      targetMinutes: 18 },
    { index: 2, phase: "Practice",
      intent: "Mantra as anchor",
      required: ["mantra.om", "breath.coherent-5-5", "meditation.anchor-breath"],
      targetMinutes: 20 },
    { index: 3, phase: "Practice",
      intent: "Heart opening",
      required: ["body.tension-map", "emotion.rain", "mantra.so-hum"],
      targetMinutes: 22 },
    { index: 4, phase: "Practice",
      intent: "Surrender",
      required: ["ifs.unburden-protector", "contemplation.sit-with-question", "journal.unsent-letter"],
      targetMinutes: 22 },
    { index: 5, phase: "Integration",
      intent: "Devotion in action",
      required: ["micro-act.thank-someone", "speech-vow.one-honest-thing", "ritual.dedicate-merit"],
      targetMinutes: 18 },
    { index: 6, phase: "Mastery",
      intent: "Become the song",
      required: ["ritual.opening-bow", "mantra.aham-brahmasmi", "meditation.open-awareness", "ritual.dedicate-merit"],
      targetMinutes: 25 },
  ],
};
