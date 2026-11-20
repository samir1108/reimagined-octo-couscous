import type { SessionProgramV3 } from "../types";

export const COUNCIL_OF_YOGIS: SessionProgramV3 = {
  id: "council-of-yogis",
  title: "Council of Yogis",
  subtitle: "Sit with many masters on one question",
  description: "A 6-session arc to bring a real life question before a council of inner gurus and hear what each says.",
  difficulty: "intermediate",
  category: "wisdom",
  tags: ["council", "masters", "dialogue"],
  icon: "Users2",
  coverGradient: "from-amber-700 to-purple-900",
  totalSessions: 6,
  phases: [
    { phase: "Foundation", sessions: 1, focus: "Frame the question" },
    { phase: "Practice", sessions: 3, focus: "Hear each voice" },
    { phase: "Integration", sessions: 1, focus: "Synthesize" },
    { phase: "Mastery", sessions: 1, focus: "Live the answer" },
  ],
  sessions: [
    { index: 1, phase: "Foundation", intent: "Frame the question",
      required: ["ritual.opening-bow", "inquiry.what-do-i-want", "journal.head-heart-gut-check"], targetMinutes: 18 },
    { index: 2, phase: "Practice", intent: "Ask one guru, deeply",
      required: ["guru-dialogue.open", "guru-dialogue.ask-one-question", "voice-journal.speak-it-out"], targetMinutes: 22 },
    { index: 3, phase: "Practice", intent: "Three perspectives",
      required: ["council.three-perspectives", "contemplation.sit-with-question", "journal.morning-pages-3"], targetMinutes: 25 },
    { index: 4, phase: "Practice", intent: "Listen to what unsettles",
      required: ["shadow.gold-projection", "ifs.meet-a-part", "emotion.label-to-tame"], targetMinutes: 22 },
    { index: 5, phase: "Integration", intent: "Synthesize",
      required: ["ai-mirror.pattern-reflect", "journal.loop-of-the-day", "ritual.dedicate-merit"], targetMinutes: 20 },
    { index: 6, phase: "Mastery", intent: "Live the answer",
      required: ["ritual.opening-bow", "micro-act.tidy-one-thing", "meditation.open-awareness", "ritual.dedicate-merit"], targetMinutes: 22 },
  ],
};
