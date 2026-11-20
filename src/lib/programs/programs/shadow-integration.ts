/**
 * PROGRAM: Shadow Integration
 * ─────────────────────────────────────────────
 * 10 sessions. Meet, name, dialogue with, and integrate the
 * disowned material that runs the show from the basement.
 */
import type { SessionProgramV3 } from "../types";

export const SHADOW_INTEGRATION: SessionProgramV3 = {
  id: "shadow-integration",
  title: "Shadow Integration",
  subtitle: "Meet the basement. Reclaim the gold.",
  description:
    "A 10-session arc using Jungian shadow work and IFS to surface what you've disowned, dialogue with it, and integrate its energy back into wholeness.",
  difficulty: "advanced",
  category: "depth",
  tags: ["shadow", "ifs", "jung"],
  icon: "Moon",
  coverGradient: "from-zinc-700 to-purple-700",
  totalSessions: 10,
  phases: [
    { phase: "Foundation", sessions: 2, focus: "What is shadow?" },
    { phase: "Practice", sessions: 5, focus: "Meet & dialogue" },
    { phase: "Integration", sessions: 2, focus: "Reclaim energy" },
    { phase: "Mastery", sessions: 1, focus: "Wholeness" },
  ],
  sessions: [
    {
      index: 1,
      phase: "Foundation",
      intent: "Understand what shadow is",
      required: [
        "ritual.opening-bow",
        "framework.loop-anatomy",
        "shadow.who-triggers-me",
        "journal.loop-of-the-day",
      ],
      targetMinutes: 20,
    },
    {
      index: 2,
      phase: "Foundation",
      intent: "Notice what you defend against",
      required: [
        "witness.thought-counter",
        "emotion.label-to-tame",
        "journal.unsent-letter",
      ],
      optional: ["ai-mirror.pattern-reflect"],
      targetMinutes: 22,
    },
    {
      index: 3,
      phase: "Practice",
      intent: "Use triggers as shadow maps",
      required: [
        "ritual.opening-bow",
        "shadow.who-triggers-me",
        "emotion.rain",
        "journal.loop-of-the-day",
      ],
      fillFrom: ["shadow-work", "emotion-naming"],
      targetMinutes: 25,
    },
    {
      index: 4,
      phase: "Practice",
      intent: "Meet a disowned part",
      required: [
        "ifs.meet-a-part",
        "voice-journal.speak-it-out",
      ],
      optional: ["ifs.unburden-protector"],
      targetMinutes: 25,
    },
    {
      index: 5,
      phase: "Practice",
      intent: "Reclaim projected gold",
      required: [
        "shadow.gold-projection",
        "contemplation.sit-with-question",
        "journal.unsent-letter",
      ],
      targetMinutes: 25,
    },
    {
      index: 6,
      phase: "Practice",
      intent: "Body release for held shame",
      required: [
        "body.tension-map",
        "somatic.tre-tremor",
        "movement.shake-it-off",
      ],
      fillFrom: ["somatic-release", "movement"],
      targetMinutes: 22,
    },
    {
      index: 7,
      phase: "Practice",
      intent: "Council the shadow with light parts",
      required: [
        "council.three-perspectives",
        "guru-dialogue.open",
        "journal.head-heart-gut-check",
      ],
      targetMinutes: 28,
    },
    {
      index: 8,
      phase: "Integration",
      intent: "Take one shadow-aware action",
      required: [
        "speech-vow.one-honest-thing",
        "micro-act.call-someone",
        "voice-journal.speak-it-out",
      ],
      targetMinutes: 20,
    },
    {
      index: 9,
      phase: "Integration",
      intent: "Death meditation — what wants to die?",
      required: [
        "contemplation.death-meditation",
        "inquiry.who-am-i",
        "journal.unsent-letter",
      ],
      targetMinutes: 28,
    },
    {
      index: 10,
      phase: "Mastery",
      intent: "Whole self — light and dark, one",
      required: [
        "ritual.opening-bow",
        "breath.nadi-shodhana",
        "mantra.aham-brahmasmi",
        "meditation.open-awareness",
        "witness.who-is-watching",
        "ritual.dedicate-merit",
      ],
      targetMinutes: 32,
    },
  ],
};
