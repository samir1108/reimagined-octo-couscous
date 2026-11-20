/**
 * PROGRAM: Abundance Reset — uproot scarcity loops.
 */
import type { SessionProgramV3 } from "../types";

export const ABUNDANCE_RESET: SessionProgramV3 = {
  id: "abundance-reset",
  title: "Abundance Reset",
  subtitle: "Uproot the scarcity loops underneath your money story",
  description:
    "A 7-session arc to find the fear-stories beneath money behavior and replace them with grounded sufficiency.",
  difficulty: "intermediate",
  category: "shadow",
  tags: ["abundance", "money", "scarcity"],
  icon: "Coins",
  coverGradient: "from-amber-500 to-emerald-700",
  totalSessions: 7,
  phases: [
    { phase: "Foundation", sessions: 2, focus: "See the scarcity loop" },
    { phase: "Practice", sessions: 3, focus: "Rewire belief & body" },
    { phase: "Integration", sessions: 1, focus: "Generous act" },
    { phase: "Mastery", sessions: 1, focus: "Enough" },
  ],
  sessions: [
    { index: 1, phase: "Foundation",
      intent: "Find your money loop",
      required: ["ritual.opening-bow", "teach.loop.what-is-a-loop", "journal.loop-of-the-day"],
      targetMinutes: 18 },
    { index: 2, phase: "Foundation",
      intent: "The story under the story",
      required: ["ifs.meet-a-part", "shadow.who-triggers-me", "voice-journal.speak-it-out"],
      targetMinutes: 22 },
    { index: 3, phase: "Practice",
      intent: "Body memory of lack",
      required: ["body.tension-map", "neuro.vagus-nerve", "breath.coherent-5-5"],
      targetMinutes: 20 },
    { index: 4, phase: "Practice",
      intent: "Unburden the protector",
      required: ["ifs.unburden-protector", "emotion.rain", "contemplation.sit-with-question"],
      targetMinutes: 25 },
    { index: 5, phase: "Practice",
      intent: "Sufficiency in this moment",
      required: ["observe.5-senses", "wisdom.rumi.guest-house", "mantra.so-hum"],
      targetMinutes: 20 },
    { index: 6, phase: "Integration",
      intent: "A generous act",
      required: ["micro-act.thank-someone", "micro-act.tidy-one-thing", "ritual.dedicate-merit"],
      targetMinutes: 18 },
    { index: 7, phase: "Mastery",
      intent: "Enough",
      required: ["ritual.opening-bow", "meditation.open-awareness", "inquiry.who-am-i", "ritual.dedicate-merit"],
      targetMinutes: 25 },
  ],
};
