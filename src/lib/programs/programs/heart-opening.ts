/**
 * PROGRAM: Heart Opening
 * ─────────────────────────────────────────────
 * 9 sessions. Move from armored heart → soft, sensing, generous.
 */
import type { SessionProgramV3 } from "../types";

export const HEART_OPENING: SessionProgramV3 = {
  id: "heart-opening",
  title: "Heart Opening",
  subtitle: "Soften the armor. Feel again.",
  description:
    "A 9-session arc to thaw the defended heart, name unfelt emotion, and re-learn the language of tenderness — toward self, then others.",
  difficulty: "beginner",
  category: "emotional",
  tags: ["heart", "bhakti", "emotion"],
  icon: "Heart",
  coverGradient: "from-rose-400 to-pink-600",
  totalSessions: 9,
  phases: [
    { phase: "Foundation", sessions: 2, focus: "Locate the heart" },
    { phase: "Practice", sessions: 4, focus: "Soften & feel" },
    { phase: "Integration", sessions: 2, focus: "Extend outward" },
    { phase: "Mastery", sessions: 1, focus: "Live heart-first" },
  ],
  sessions: [
    {
      index: 1,
      phase: "Foundation",
      intent: "Notice where the heart is closed",
      required: [
        "ritual.opening-bow",
        "body.tension-map",
        "emotion.label-to-tame",
        "journal.head-heart-gut-check",
      ],
      optional: ["wisdom.rumi.guest-house"],
      targetMinutes: 18,
    },
    {
      index: 2,
      phase: "Foundation",
      intent: "Breathe into the chest",
      required: [
        "breath.coherent-5-5",
        "body.head-to-toe",
        "mudra.anjali",
      ],
      fillFrom: ["breathwork", "body-scan"],
      targetMinutes: 18,
    },
    {
      index: 3,
      phase: "Practice",
      intent: "Welcome every emotion as guest",
      required: [
        "wisdom.rumi.guest-house",
        "emotion.rain",
        "journal.unsent-letter",
      ],
      targetMinutes: 22,
    },
    {
      index: 4,
      phase: "Practice",
      intent: "Loving-kindness for self first",
      required: [
        "ritual.opening-bow",
        "meditation.loving-kindness",
        "voice-journal.speak-it-out",
      ],
      fillFrom: ["meditation"],
      targetMinutes: 22,
    },
    {
      index: 5,
      phase: "Practice",
      intent: "Release stored grief from the body",
      required: [
        "somatic.sigh-3x",
        "somatic.tre-tremor",
        "journal.unsent-letter",
      ],
      fillFrom: ["somatic-release"],
      targetMinutes: 25,
    },
    {
      index: 6,
      phase: "Practice",
      intent: "Meet the part that armored up",
      required: [
        "ifs.meet-a-part",
        "ifs.unburden-protector",
        "emotion.label-to-tame",
      ],
      targetMinutes: 25,
    },
    {
      index: 7,
      phase: "Integration",
      intent: "Extend kindness to one other person",
      required: [
        "meditation.loving-kindness",
        "micro-act.thank-someone",
        "speech-vow.one-honest-thing",
      ],
      fillFrom: ["micro-act"],
      targetMinutes: 18,
    },
    {
      index: 8,
      phase: "Integration",
      intent: "Repair one relationship in voice",
      required: [
        "contemplation.sit-with-question",
        "voice-journal.speak-it-out",
        "micro-act.call-someone",
      ],
      targetMinutes: 20,
    },
    {
      index: 9,
      phase: "Mastery",
      intent: "Heart-first as a default posture",
      required: [
        "ritual.opening-bow",
        "mantra.om",
        "meditation.loving-kindness",
        "mudra.anjali",
        "ritual.dedicate-merit",
      ],
      targetMinutes: 28,
    },
  ],
};
