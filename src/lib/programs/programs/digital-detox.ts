/**
 * PROGRAM: Digital Detox — reclaim attention from screens.
 */
import type { SessionProgramV3 } from "../types";

export const DIGITAL_DETOX: SessionProgramV3 = {
  id: "digital-detox",
  title: "Digital Detox",
  subtitle: "Reclaim your attention",
  description:
    "A 7-session reset for the over-stimulated mind. Notice the dopamine loop, practice abstinence in micro-doses, rebuild a real attention span.",
  difficulty: "beginner",
  category: "lifestyle",
  tags: ["detox", "attention", "digital"],
  icon: "PhoneOff",
  coverGradient: "from-emerald-600 to-teal-700",
  totalSessions: 7,
  phases: [
    { phase: "Foundation", sessions: 2, focus: "See the hook" },
    { phase: "Practice", sessions: 3, focus: "Abstain & substitute" },
    { phase: "Integration", sessions: 1, focus: "New defaults" },
    { phase: "Mastery", sessions: 1, focus: "Sovereign attention" },
  ],
  sessions: [
    { index: 1, phase: "Foundation",
      intent: "See your phone-loop honestly",
      required: ["ritual.opening-bow", "teach.loop.what-is-a-loop", "framework.loop-anatomy", "journal.loop-of-the-day"],
      targetMinutes: 15 },
    { index: 2, phase: "Foundation",
      intent: "Notice the urge without obeying it",
      required: ["witness.thought-counter", "observe.thought-count", "emotion.label-to-tame"],
      targetMinutes: 18 },
    { index: 3, phase: "Practice",
      intent: "30 minutes phone-free",
      required: ["detox.no-phone-30min", "breath.physiological-sigh", "journal.morning-pages-3"],
      targetMinutes: 20 },
    { index: 4, phase: "Practice",
      intent: "Morning without screens",
      required: ["detox.no-screen-1h-morning", "movement.standup-stretch", "observe.5-senses"],
      fillFrom: ["movement", "micro-act"], targetMinutes: 20 },
    { index: 5, phase: "Practice",
      intent: "One hour of silence",
      required: ["detox.silence-1h", "meditation.anchor-breath", "voice-journal.speak-it-out"],
      targetMinutes: 22 },
    { index: 6, phase: "Integration",
      intent: "Replace the scroll with a real act",
      required: ["loop-confront.interrupt-now", "micro-act.tidy-one-thing", "micro-act.call-someone", "speech-vow.one-honest-thing"],
      targetMinutes: 18 },
    { index: 7, phase: "Mastery",
      intent: "Attention as a sovereign act",
      required: ["ritual.opening-bow", "contemplation.sit-with-question", "meditation.open-awareness", "ritual.dedicate-merit"],
      targetMinutes: 25 },
  ],
};
