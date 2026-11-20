/**
 * PROGRAM: Forgiveness Arc — release the weight you carry.
 */
import type { SessionProgramV3 } from "../types";

export const FORGIVENESS_ARC: SessionProgramV3 = {
  id: "forgiveness-arc",
  title: "Forgiveness Arc",
  subtitle: "Release the weight you've been carrying",
  description:
    "A 7-session journey from resentment to release. Not condoning — completing. Free yourself from what's still holding you.",
  difficulty: "intermediate",
  category: "heart",
  tags: ["forgiveness", "release", "heart"],
  icon: "HeartHandshake",
  coverGradient: "from-rose-500 to-violet-700",
  totalSessions: 7,
  phases: [
    { phase: "Foundation", sessions: 2, focus: "See what you carry" },
    { phase: "Practice", sessions: 3, focus: "Feel, name, release" },
    { phase: "Integration", sessions: 1, focus: "Forgive self" },
    { phase: "Mastery", sessions: 1, focus: "Walk lighter" },
  ],
  sessions: [
    { index: 1, phase: "Foundation",
      intent: "Name the weight",
      required: ["ritual.opening-bow", "journal.head-heart-gut-check", "shadow.who-triggers-me"],
      targetMinutes: 18 },
    { index: 2, phase: "Foundation",
      intent: "Understand resentment as a loop",
      required: ["teach.loop.what-is-a-loop", "framework.loop-anatomy", "journal.loop-of-the-day"],
      targetMinutes: 20 },
    { index: 3, phase: "Practice",
      intent: "Feel it in the body",
      required: ["body.tension-map", "neuro.vagus-nerve", "emotion.rain"],
      targetMinutes: 22 },
    { index: 4, phase: "Practice",
      intent: "Write the unsent letter",
      required: ["journal.unsent-letter", "voice-journal.speak-it-out", "ifs.meet-a-part"],
      targetMinutes: 25 },
    { index: 5, phase: "Practice",
      intent: "Release the protector",
      required: ["ifs.unburden-protector", "contemplation.sit-with-question", "mantra.so-hum"],
      targetMinutes: 25 },
    { index: 6, phase: "Integration",
      intent: "Forgive yourself first",
      required: ["wisdom.rumi.guest-house", "micro-act.thank-someone", "mudra.anjali"],
      targetMinutes: 20 },
    { index: 7, phase: "Mastery",
      intent: "Walk lighter",
      required: ["ritual.opening-bow", "meditation.open-awareness", "mantra.om", "ritual.dedicate-merit"],
      targetMinutes: 25 },
  ],
};
