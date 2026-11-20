import type { SessionProgramV3 } from "../types";

export const THREE_BRAINS_LISTENING: SessionProgramV3 = {
  id: "three-brains-listening",
  title: "Three Brains Listening",
  subtitle: "Head, heart, gut — hear all three before deciding",
  description: "A 6-session arc to develop conscious access to head-mind, heart-mind, and gut-mind for clearer choices.",
  difficulty: "intermediate",
  category: "wisdom",
  tags: ["three-brains", "decision", "intuition"],
  icon: "Brain",
  coverGradient: "from-violet-700 to-rose-700",
  totalSessions: 6,
  phases: [
    { phase: "Foundation", sessions: 1, focus: "The three-brain frame" },
    { phase: "Practice", sessions: 3, focus: "Tune each center" },
    { phase: "Integration", sessions: 1, focus: "Decide together" },
    { phase: "Mastery", sessions: 1, focus: "Embodied wisdom" },
  ],
  sessions: [
    { index: 1, phase: "Foundation", intent: "Meet the three brains",
      required: ["ritual.opening-bow", "framework.three-brains-diagram", "journal.head-heart-gut-check"], targetMinutes: 18 },
    { index: 2, phase: "Practice", intent: "Head: clarity",
      required: ["concentration.count-breath-21", "inquiry.what-do-i-want", "journal.morning-pages-3"], targetMinutes: 22 },
    { index: 3, phase: "Practice", intent: "Heart: feeling",
      required: ["meditation.loving-kindness", "emotion.label-to-tame", "voice-journal.speak-it-out"], targetMinutes: 22 },
    { index: 4, phase: "Practice", intent: "Gut: knowing",
      required: ["body.tension-map", "somatic.sigh-3x", "contemplation.sit-with-question"], targetMinutes: 22 },
    { index: 5, phase: "Integration", intent: "Decide together",
      required: ["council.three-perspectives", "journal.head-heart-gut-check", "ritual.dedicate-merit"], targetMinutes: 20 },
    { index: 6, phase: "Mastery", intent: "Embodied wisdom",
      required: ["ritual.opening-bow", "meditation.open-awareness", "mantra.aham-brahmasmi", "ritual.dedicate-merit"], targetMinutes: 25 },
  ],
};
