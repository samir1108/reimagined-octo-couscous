/**
 * PROGRAM: Tantra of Senses — sacred sensoriality.
 */
import type { SessionProgramV3 } from "../types";

export const TANTRA_SENSES: SessionProgramV3 = {
  id: "tantra-senses",
  title: "Tantra of Senses",
  subtitle: "The world is the divine — meet it",
  description:
    "A 6-session arc using sound, touch, taste, sight, smell to dissolve the gap between practitioner and life.",
  difficulty: "intermediate",
  category: "embodiment",
  tags: ["tantra", "senses", "embodiment"],
  icon: "Eye",
  coverGradient: "from-purple-700 to-rose-600",
  totalSessions: 6,
  phases: [
    { phase: "Foundation", sessions: 1, focus: "The tantric frame" },
    { phase: "Practice", sessions: 3, focus: "Each sense as gate" },
    { phase: "Integration", sessions: 1, focus: "Life as practice" },
    { phase: "Mastery", sessions: 1, focus: "All senses, one awareness" },
  ],
  sessions: [
    { index: 1, phase: "Foundation",
      intent: "Sense as gateway",
      required: ["ritual.opening-bow", "wisdom.rumi.guest-house", "observe.5-senses"],
      targetMinutes: 18 },
    { index: 2, phase: "Practice",
      intent: "Sound bath",
      required: ["mantra.om", "concentration.candle-trataka", "meditation.anchor-breath"],
      targetMinutes: 22 },
    { index: 3, phase: "Practice",
      intent: "Body as temple",
      required: ["body.head-to-toe", "kriya.spinal-flex", "mudra.anjali"],
      targetMinutes: 22 },
    { index: 4, phase: "Practice",
      intent: "Sight without naming",
      required: ["observe.one-object", "witness.who-is-watching", "contemplation.sit-with-question"],
      targetMinutes: 22 },
    { index: 5, phase: "Integration",
      intent: "Eat one meal awake",
      required: ["observe.5-senses", "micro-act.tidy-one-thing", "ritual.dedicate-merit"],
      targetMinutes: 18 },
    { index: 6, phase: "Mastery",
      intent: "All senses, one awareness",
      required: ["ritual.opening-bow", "meditation.open-awareness", "mantra.aham-brahmasmi", "ritual.dedicate-merit"],
      targetMinutes: 25 },
  ],
};
