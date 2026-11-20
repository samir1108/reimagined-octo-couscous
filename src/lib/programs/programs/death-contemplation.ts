/**
 * PROGRAM: Death Contemplation — maranānusmṛti.
 */
import type { SessionProgramV3 } from "../types";

export const DEATH_CONTEMPLATION: SessionProgramV3 = {
  id: "death-contemplation",
  title: "Death Contemplation",
  subtitle: "Maranānusmṛti — life seen from the end",
  description:
    "A 7-session arc using ancient death-meditation to clarify what matters now. Not morbid — devastatingly alive.",
  difficulty: "advanced",
  category: "depth",
  tags: ["death", "marana", "vairagya"],
  icon: "Hourglass",
  coverGradient: "from-stone-700 to-zinc-900",
  totalSessions: 7,
  phases: [
    { phase: "Foundation", sessions: 1, focus: "Face the fact" },
    { phase: "Practice", sessions: 4, focus: "Sit with mortality" },
    { phase: "Integration", sessions: 1, focus: "Live accordingly" },
    { phase: "Mastery", sessions: 1, focus: "Death-aware life" },
  ],
  sessions: [
    { index: 1, phase: "Foundation",
      intent: "Acknowledge you will die",
      required: ["ritual.opening-bow", "teach.koan.who-asks", "contemplation.death-meditation", "journal.unsent-letter"],
      targetMinutes: 22 },
    { index: 2, phase: "Practice",
      intent: "Body as borrowed",
      required: ["body.head-to-toe", "contemplation.death-meditation", "wisdom.gita.2.47"],
      targetMinutes: 25 },
    { index: 3, phase: "Practice",
      intent: "What dies with the body?",
      required: ["inquiry.who-am-i", "inquiry.where-is-the-i", "contemplation.sit-with-question"],
      targetMinutes: 25 },
    { index: 4, phase: "Practice",
      intent: "Letter from your deathbed",
      required: ["voice-journal.future-self", "journal.unsent-letter", "emotion.rain"],
      targetMinutes: 25 },
    { index: 5, phase: "Practice",
      intent: "Release one attachment",
      required: ["ifs.unburden-protector", "shadow.gold-projection", "journal.unsent-letter"],
      targetMinutes: 25 },
    { index: 6, phase: "Integration",
      intent: "One act that matters today",
      required: ["micro-act.call-someone", "speech-vow.one-honest-thing", "voice-journal.speak-it-out"],
      targetMinutes: 18 },
    { index: 7, phase: "Mastery",
      intent: "Live as if dying — because you are",
      required: ["ritual.opening-bow", "mantra.aham-brahmasmi", "meditation.open-awareness", "witness.who-is-watching", "ritual.dedicate-merit"],
      targetMinutes: 30 },
  ],
};
