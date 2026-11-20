/**
 * PROGRAM: Boundaries Practice — clear, kind, embodied limits.
 */
import type { SessionProgramV3 } from "../types";

export const BOUNDARIES_PRACTICE: SessionProgramV3 = {
  id: "boundaries-practice",
  title: "Boundaries Practice",
  subtitle: "Say the true 'no' so your 'yes' means something",
  description:
    "A 7-session arc to feel boundaries somatically, name them clearly, and hold them without contempt or collapse.",
  difficulty: "intermediate",
  category: "shadow",
  tags: ["boundaries", "assertiveness", "ifs"],
  icon: "Shield",
  coverGradient: "from-sky-600 to-violet-800",
  totalSessions: 7,
  phases: [
    { phase: "Foundation", sessions: 2, focus: "Where boundaries live" },
    { phase: "Practice", sessions: 3, focus: "Feel, name, hold" },
    { phase: "Integration", sessions: 1, focus: "One clear no" },
    { phase: "Mastery", sessions: 1, focus: "Boundaried & open" },
  ],
  sessions: [
    { index: 1, phase: "Foundation",
      intent: "What is a boundary?",
      required: ["ritual.opening-bow", "framework.loop-anatomy", "journal.head-heart-gut-check"],
      targetMinutes: 18 },
    { index: 2, phase: "Foundation",
      intent: "Where you over-give",
      required: ["shadow.who-triggers-me", "ifs.meet-a-part", "body.tension-map"],
      targetMinutes: 22 },
    { index: 3, phase: "Practice",
      intent: "Body says no first",
      required: ["body.tension-map", "neuro.vagus-nerve", "breath.box-4-4-4-4"],
      targetMinutes: 22 },
    { index: 4, phase: "Practice",
      intent: "Unburden the pleaser",
      required: ["ifs.unburden-protector", "emotion.rain", "voice-journal.speak-it-out"],
      targetMinutes: 25 },
    { index: 5, phase: "Practice",
      intent: "Rehearse the sentence",
      required: ["speech-vow.one-honest-thing", "journal.unsent-letter", "contemplation.sit-with-question"],
      targetMinutes: 22 },
    { index: 6, phase: "Integration",
      intent: "Say one clear no",
      required: ["micro-act.tidy-one-thing", "speech-vow.one-honest-thing", "ritual.dedicate-merit"],
      targetMinutes: 18 },
    { index: 7, phase: "Mastery",
      intent: "Held, open, free",
      required: ["ritual.opening-bow", "meditation.open-awareness", "mantra.aham-brahmasmi", "ritual.dedicate-merit"],
      targetMinutes: 25 },
  ],
};
