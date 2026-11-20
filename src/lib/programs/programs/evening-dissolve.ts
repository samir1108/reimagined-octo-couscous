/**
 * PROGRAM: Evening Dissolve — close the day cleanly.
 */
import type { SessionProgramV3 } from "../types";

export const EVENING_DISSOLVE: SessionProgramV3 = {
  id: "evening-dissolve",
  title: "Evening Dissolve",
  subtitle: "Close the day cleanly so tomorrow is fresh",
  description:
    "A 7-session arc to build a wind-down protocol: dump, digest, dedicate, release into sleep.",
  difficulty: "beginner",
  category: "ethics",
  tags: ["evening", "sleep", "ritual"],
  icon: "Moon",
  coverGradient: "from-indigo-700 to-slate-900",
  totalSessions: 7,
  phases: [
    { phase: "Foundation", sessions: 2, focus: "Drop the day" },
    { phase: "Practice", sessions: 3, focus: "Digest & soften" },
    { phase: "Integration", sessions: 1, focus: "Daily dissolution" },
    { phase: "Mastery", sessions: 1, focus: "Sleep as offering" },
  ],
  sessions: [
    { index: 1, phase: "Foundation",
      intent: "Mark the transition",
      required: ["ritual.opening-bow", "detox.no-phone-30min", "breath.coherent-5-5"],
      targetMinutes: 14 },
    { index: 2, phase: "Foundation",
      intent: "Brain dump",
      required: ["journal.morning-pages-3", "journal.head-heart-gut-check", "voice-journal.speak-it-out"],
      targetMinutes: 18 },
    { index: 3, phase: "Practice",
      intent: "Digest the day",
      required: ["ai-mirror.pattern-reflect", "contemplation.sit-with-question", "emotion.label-to-tame"],
      targetMinutes: 20 },
    { index: 4, phase: "Practice",
      intent: "Soften the body",
      required: ["body.head-to-toe", "somatic.tense-release", "breath.physiological-sigh"],
      targetMinutes: 18 },
    { index: 5, phase: "Practice",
      intent: "Forgive the day",
      required: ["meditation.loving-kindness", "ifs.unburden-protector", "mudra.anjali"],
      targetMinutes: 20 },
    { index: 6, phase: "Integration",
      intent: "Dedicate & release",
      required: ["ritual.closing-thanks", "ritual.dedicate-merit", "mantra.om"],
      targetMinutes: 15 },
    { index: 7, phase: "Mastery",
      intent: "Sleep as offering",
      required: ["ritual.opening-bow", "meditation.anchor-breath", "mantra.so-hum", "ritual.dedicate-merit"],
      targetMinutes: 22 },
  ],
};
