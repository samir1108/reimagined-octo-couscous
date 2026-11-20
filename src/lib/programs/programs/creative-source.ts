/**
 * PROGRAM: Creative Source — unblock the channel.
 */
import type { SessionProgramV3 } from "../types";

export const CREATIVE_SOURCE: SessionProgramV3 = {
  id: "creative-source",
  title: "Creative Source",
  subtitle: "Unblock the channel — make what wants to be made",
  description:
    "A 7-session arc combining IFS, witness, and play to dissolve the inner critic and reconnect to creative flow.",
  difficulty: "beginner",
  category: "embodiment",
  tags: ["creativity", "flow", "inner-critic"],
  icon: "Palette",
  coverGradient: "from-amber-500 to-fuchsia-700",
  totalSessions: 7,
  phases: [
    { phase: "Foundation", sessions: 2, focus: "Meet the block" },
    { phase: "Practice", sessions: 3, focus: "Inner critic & flow" },
    { phase: "Integration", sessions: 1, focus: "One small thing" },
    { phase: "Mastery", sessions: 1, focus: "Channel open" },
  ],
  sessions: [
    { index: 1, phase: "Foundation",
      intent: "What is wanting to be made?",
      required: ["ritual.opening-bow", "journal.head-heart-gut-check", "contemplation.sit-with-question"],
      targetMinutes: 18 },
    { index: 2, phase: "Foundation",
      intent: "Meet the block",
      required: ["ifs.meet-a-part", "body.tension-map", "voice-journal.speak-it-out"],
      targetMinutes: 22 },
    { index: 3, phase: "Practice",
      intent: "The inner critic",
      required: ["shadow.who-triggers-me", "ifs.unburden-protector", "journal.unsent-letter"],
      targetMinutes: 25 },
    { index: 4, phase: "Practice",
      intent: "Open the senses",
      required: ["observe.5-senses", "concentration.candle-trataka", "mantra.so-hum"],
      targetMinutes: 22 },
    { index: 5, phase: "Practice",
      intent: "Play without product",
      required: ["micro-act.tidy-one-thing", "kriya.spinal-flex", "meditation.open-awareness"],
      targetMinutes: 22 },
    { index: 6, phase: "Integration",
      intent: "Make one small thing",
      required: ["micro-act.tidy-one-thing", "speech-vow.one-honest-thing", "ritual.dedicate-merit"],
      targetMinutes: 20 },
    { index: 7, phase: "Mastery",
      intent: "Channel open",
      required: ["ritual.opening-bow", "meditation.open-awareness", "mantra.aham-brahmasmi", "ritual.dedicate-merit"],
      targetMinutes: 25 },
  ],
};
