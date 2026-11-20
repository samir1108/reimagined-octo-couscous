/**
 * PROGRAM: Loop Liberation
 * ─────────────────────────────────────────────
 * 10 sessions. Pattern-recognition first, then interrupt, then rewire.
 * Sessions, not days — user paces themselves.
 */
import type { SessionProgramV3 } from "../types";

export const LOOP_LIBERATION: SessionProgramV3 = {
  id: "loop-liberation",
  title: "Loop Liberation",
  subtitle: "See the loop. Name it. Break it.",
  description:
    "A 10-session arc to detect the repeating mental and behavioural loops running you, learn to interrupt them mid-cycle, and seed a new response.",
  difficulty: "intermediate",
  category: "transformation",
  tags: ["loops", "shadow", "rewire"],
  icon: "Repeat",
  coverGradient: "from-rose-500 to-amber-600",
  totalSessions: 10,
  phases: [
    { phase: "Foundation", sessions: 2, focus: "What is a loop?" },
    { phase: "Practice", sessions: 5, focus: "Detect & interrupt" },
    { phase: "Integration", sessions: 2, focus: "Rewire & rehearse" },
    { phase: "Mastery", sessions: 1, focus: "Live loop-free" },
  ],
  sessions: [
    // ── Foundation
    {
      index: 1,
      phase: "Foundation",
      intent: "Learn what a loop actually is",
      required: [
        "ritual.opening-bow",
        "teach.loop.what-is-a-loop",
        "framework.loop-anatomy",
        "journal.loop-of-the-day",
      ],
      optional: ["guide-chat.wise-sibling"],
      targetMinutes: 15,
    },
    {
      index: 2,
      phase: "Foundation",
      intent: "Spot your top 3 loops",
      required: [
        "ritual.opening-bow",
        "witness.thought-counter",
        "journal.loop-of-the-day",
      ],
      optional: ["ai-mirror.pattern-reflect"],
      fillFrom: ["observation"],
      targetMinutes: 18,
    },

    // ── Practice
    {
      index: 3,
      phase: "Practice",
      intent: "Catch the loop in real time",
      required: [
        "breath.physiological-sigh",
        "witness.gap-between-thoughts",
        "loop-confront.name-and-face",
      ],
      fillFrom: ["witness", "observation"],
      targetMinutes: 20,
    },
    {
      index: 4,
      phase: "Practice",
      intent: "Interrupt the body's loop signal",
      required: [
        "body.tension-map",
        "somatic.tense-release",
        "movement.shake-it-off",
      ],
      fillFrom: ["somatic-release", "movement"],
      targetMinutes: 22,
    },
    {
      index: 5,
      phase: "Practice",
      intent: "Meet the part driving the loop",
      required: [
        "ritual.opening-bow",
        "ifs.meet-a-part",
        "journal.unsent-letter",
      ],
      optional: ["ifs.unburden-protector"],
      targetMinutes: 25,
    },
    {
      index: 6,
      phase: "Practice",
      intent: "Face the shadow the loop protects",
      required: [
        "shadow.who-triggers-me",
        "emotion.rain",
        "journal.loop-of-the-day",
      ],
      optional: ["shadow.gold-projection"],
      targetMinutes: 22,
    },
    {
      index: 7,
      phase: "Practice",
      intent: "Pause-before-reply as the new default",
      required: [
        "teach.parable.two-arrows",
        "speech-vow.pause-before-reply",
        "loop-confront.interrupt-now",
      ],
      fillFrom: ["speech-vow", "micro-act"],
      targetMinutes: 18,
    },

    // ── Integration
    {
      index: 8,
      phase: "Integration",
      intent: "Rehearse the new response in safety",
      required: [
        "contemplation.sit-with-question",
        "voice-journal.speak-it-out",
        "micro-act.tidy-one-thing",
      ],
      optional: ["council.three-perspectives"],
      targetMinutes: 22,
    },
    {
      index: 9,
      phase: "Integration",
      intent: "Have the AI mirror your week's pattern",
      required: [
        "ai-mirror.weekly-summary",
        "guru-dialogue.ask-one-question",
        "journal.loop-of-the-day",
      ],
      targetMinutes: 20,
    },

    // ── Mastery
    {
      index: 10,
      phase: "Mastery",
      intent: "Free response — loop arises, no hook",
      required: [
        "ritual.opening-bow",
        "breath.nadi-shodhana",
        "witness.who-is-watching",
        "inquiry.where-is-the-i",
        "ritual.dedicate-merit",
      ],
      targetMinutes: 28,
    },
  ],
};
