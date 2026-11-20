/**
 * PROGRAM: 3 Inner LLMs
 * ─────────────────────────────────────────────
 * 12 sessions. Not days — sessions. User progresses when they
 * complete each session; pacing is theirs.
 *
 * Arc:
 *   Foundation (1–3)  — meet the 3 centres
 *   Practice   (4–8)  — learn to tune each centre
 *   Integration (9–11) — let them council together
 *   Mastery    (12)    — embodied 3-brain coherence
 *
 * Each session = required atoms (always run) + optional fillers
 * the composer may add based on user state and time budget.
 */
import type { SessionProgramV3 } from "../types";

export const THREE_INNER_LLMS: SessionProgramV3 = {
  id: "three-inner-llms",
  title: "The Three Inner LLMs",
  subtitle: "Head, Heart, Gut — meet your three intelligences",
  description:
    "A 12-session journey to recognise the three intelligences running inside you and learn to let the right one lead at the right time.",
  difficulty: "beginner",
  category: "awareness",
  tags: ["foundational", "three-brains", "head-heart-gut"],
  icon: "Brain",
  coverGradient: "from-violet-500 to-indigo-600",
  totalSessions: 12,
  phases: [
    { phase: "Foundation", sessions: 3, focus: "Meet head, heart, gut" },
    { phase: "Practice", sessions: 5, focus: "Tune each centre individually" },
    { phase: "Integration", sessions: 3, focus: "Let them council together" },
    { phase: "Mastery", sessions: 1, focus: "Embodied coherence" },
  ],
  sessions: [
    // ─── FOUNDATION ──────────────────────────────
    {
      index: 1,
      phase: "Foundation",
      intent: "Discover that there are three voices inside",
      required: [
        "ritual.opening-bow",
        "teach.three-inner-llms.intro",
        "breath.box-4-4-4-4",
        "journal.head-heart-gut-check",
        "ritual.closing-thanks",
      ],
      optional: ["guide-chat.wise-sibling"],
      targetMinutes: 15,
    },
    {
      index: 2,
      phase: "Foundation",
      intent: "Learn what each centre is good at",
      required: [
        "ritual.opening-bow",
        "framework.three-brains-diagram",
        "neuro.default-mode-network",
        "observe.5-senses",
        "journal.head-heart-gut-check",
      ],
      optional: ["wisdom.gita.2.47"],
      targetMinutes: 15,
    },
    {
      index: 3,
      phase: "Foundation",
      intent: "See which centre dominates you most",
      required: [
        "teach.loop.what-is-a-loop",
        "witness.thought-counter",
        "journal.loop-of-the-day",
      ],
      optional: ["guide-chat.wise-sibling"],
      targetMinutes: 18,
    },

    // ─── PRACTICE — tune each centre ─────────────
    {
      index: 4,
      phase: "Practice",
      intent: "Tune the HEAD — quiet the thinking mind",
      required: [
        "ritual.opening-bow",
        "breath.coherent-5-5",
        "meditation.anchor-breath",
        "journal.morning-pages-3",
      ],
      fillFrom: ["meditation", "witness"],
      targetMinutes: 20,
    },
    {
      index: 5,
      phase: "Practice",
      intent: "Tune the HEART — open emotional sensing",
      required: [
        "ritual.opening-bow",
        "body.head-to-toe",
        "emotion.rain",
        "journal.unsent-letter",
      ],
      fillFrom: ["body-scan", "emotion-naming"],
      targetMinutes: 22,
    },
    {
      index: 6,
      phase: "Practice",
      intent: "Tune the GUT — recover instinct",
      required: [
        "ritual.opening-bow",
        "breath.kapalbhati",
        "somatic.tense-release",
        "movement.shake-it-off",
        "inquiry.what-do-i-want",
      ],
      fillFrom: ["movement", "somatic-release"],
      targetMinutes: 20,
    },
    {
      index: 7,
      phase: "Practice",
      intent: "Witness which centre speaks first in a trigger",
      required: [
        "teach.parable.two-arrows",
        "witness.gap-between-thoughts",
        "journal.loop-of-the-day",
      ],
      optional: ["loop-confront.name-and-face"],
      targetMinutes: 22,
    },
    {
      index: 8,
      phase: "Practice",
      intent: "Meet the part that hijacks the other two",
      required: [
        "ritual.opening-bow",
        "ifs.meet-a-part",
        "shadow.who-triggers-me",
      ],
      optional: ["guide-chat.wise-sibling"],
      targetMinutes: 25,
    },

    // ─── INTEGRATION — three together ────────────
    {
      index: 9,
      phase: "Integration",
      intent: "Hold one decision in all three centres",
      required: [
        "teach.koan.who-asks",
        "contemplation.sit-with-question",
        "journal.head-heart-gut-check",
      ],
      optional: ["council.three-perspectives"],
      targetMinutes: 22,
    },
    {
      index: 10,
      phase: "Integration",
      intent: "Practice 3-brain check-in inside daily life",
      required: [
        "breath.physiological-sigh",
        "observe.5-senses",
        "micro-act.call-someone",
        "voice-journal.speak-it-out",
      ],
      targetMinutes: 18,
    },
    {
      index: 11,
      phase: "Integration",
      intent: "Refine — which centre is your weakest? Strengthen it",
      required: [
        "ai-mirror.pattern-reflect",
        "guru-dialogue.open",
        "journal.head-heart-gut-check",
      ],
      targetMinutes: 25,
    },

    // ─── MASTERY ─────────────────────────────────
    {
      index: 12,
      phase: "Mastery",
      intent: "Embodied coherence — head, heart, gut as one",
      required: [
        "ritual.opening-bow",
        "breath.nadi-shodhana",
        "mantra.so-hum",
        "witness.who-is-watching",
        "inquiry.who-am-i",
        "ritual.closing-thanks",
      ],
      targetMinutes: 30,
    },
  ],
};
