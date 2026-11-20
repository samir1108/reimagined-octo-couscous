/**
 * PROGRAM: Witness Awakening
 * ─────────────────────────────────────────────
 * 8 sessions. Pure sakshi-bhav training — from beginner noticing
 * to stable witness consciousness.
 */
import type { SessionProgramV3 } from "../types";

export const WITNESS_AWAKENING: SessionProgramV3 = {
  id: "witness-awakening",
  title: "Witness Awakening",
  subtitle: "Sakshi Bhav — be the one who watches",
  description:
    "An 8-session arc to install the witness — the silent presence behind every thought, feeling, and sensation. From first glimpse to stable abiding.",
  difficulty: "intermediate",
  category: "awareness",
  tags: ["sakshi", "witness", "advaita"],
  icon: "Eye",
  coverGradient: "from-slate-700 to-amber-500",
  totalSessions: 8,
  phases: [
    { phase: "Foundation", sessions: 2, focus: "Glimpse the witness" },
    { phase: "Practice", sessions: 4, focus: "Stabilise the seat" },
    { phase: "Integration", sessions: 1, focus: "Witness in motion" },
    { phase: "Mastery", sessions: 1, focus: "Abide as witness" },
  ],
  sessions: [
    // ── Foundation
    {
      index: 1,
      phase: "Foundation",
      intent: "Discover there is a watcher behind the thoughts",
      required: [
        "ritual.opening-bow",
        "teach.witness.what-is-sakshi",
        "framework.witness-vs-thinker",
        "witness.thought-counter",
      ],
      optional: ["wisdom.upanishad.tat-tvam-asi"],
      targetMinutes: 18,
    },
    {
      index: 2,
      phase: "Foundation",
      intent: "Find the gap between two thoughts",
      required: [
        "breath.coherent-5-5",
        "witness.gap-between-thoughts",
        "journal.loop-of-the-day",
      ],
      fillFrom: ["meditation", "concentration"],
      targetMinutes: 20,
    },

    // ── Practice
    {
      index: 3,
      phase: "Practice",
      intent: "Use a single object to steady the witness",
      required: [
        "ritual.opening-bow",
        "concentration.candle-trataka",
        "observe.one-object",
      ],
      fillFrom: ["concentration"],
      targetMinutes: 22,
    },
    {
      index: 4,
      phase: "Practice",
      intent: "Witness sensations without becoming them",
      required: [
        "body.head-to-toe",
        "observe.thought-count",
        "emotion.label-to-tame",
      ],
      fillFrom: ["body-scan", "observation"],
      targetMinutes: 22,
    },
    {
      index: 5,
      phase: "Practice",
      intent: "Open awareness — witness everything at once",
      required: [
        "breath.nadi-shodhana",
        "meditation.open-awareness",
        "witness.who-is-watching",
      ],
      targetMinutes: 25,
    },
    {
      index: 6,
      phase: "Practice",
      intent: "Self-inquiry — turn the witness on itself",
      required: [
        "teach.koan.who-asks",
        "inquiry.who-am-i",
        "inquiry.where-is-the-i",
      ],
      optional: ["mantra.aham-brahmasmi"],
      targetMinutes: 25,
    },

    // ── Integration
    {
      index: 7,
      phase: "Integration",
      intent: "Carry the witness into daily motion",
      required: [
        "movement.standup-stretch",
        "observe.5-senses",
        "micro-act.drink-water",
        "voice-journal.speak-it-out",
      ],
      fillFrom: ["movement", "micro-act"],
      targetMinutes: 18,
    },

    // ── Mastery
    {
      index: 8,
      phase: "Mastery",
      intent: "Abide as the witness — no effort, just presence",
      required: [
        "ritual.opening-bow",
        "mantra.so-hum",
        "meditation.open-awareness",
        "contemplation.sit-with-question",
        "ritual.dedicate-merit",
      ],
      targetMinutes: 30,
    },
  ],
};
