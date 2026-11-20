/**
 * PROGRAM: Morning Becoming — a fresh rebirth daily.
 */
import type { SessionProgramV3 } from "../types";

export const MORNING_BECOMING: SessionProgramV3 = {
  id: "morning-becoming",
  title: "Morning Becoming",
  subtitle: "Treat each morning as a fresh birth",
  description:
    "A 7-session arc to build a sacred morning protocol: breath, body, witness, micro-act, intent.",
  difficulty: "beginner",
  category: "ethics",
  tags: ["morning", "ritual", "routine"],
  icon: "Sunrise",
  coverGradient: "from-amber-400 to-rose-600",
  totalSessions: 7,
  phases: [
    { phase: "Foundation", sessions: 2, focus: "Settle the body & breath" },
    { phase: "Practice", sessions: 3, focus: "Build the protocol" },
    { phase: "Integration", sessions: 1, focus: "Make it portable" },
    { phase: "Mastery", sessions: 1, focus: "Born again daily" },
  ],
  sessions: [
    { index: 1, phase: "Foundation",
      intent: "Wake with breath",
      required: ["ritual.opening-bow", "breath.physiological-sigh", "body.micro-scan-60s"],
      targetMinutes: 12 },
    { index: 2, phase: "Foundation",
      intent: "Body comes online",
      required: ["movement.standup-stretch", "movement.cat-cow", "breath.coherent-5-5"],
      targetMinutes: 15 },
    { index: 3, phase: "Practice",
      intent: "Witness check-in",
      required: ["witness.thought-counter", "journal.head-heart-gut-check", "observe.5-senses"],
      targetMinutes: 18 },
    { index: 4, phase: "Practice",
      intent: "Set a clean intent",
      required: ["contemplation.sit-with-question", "voice-journal.future-self", "mudra.anjali"],
      targetMinutes: 18 },
    { index: 5, phase: "Practice",
      intent: "First micro-act",
      required: ["micro-act.drink-water", "micro-act.tidy-one-thing", "detox.no-screen-1h-morning"],
      targetMinutes: 15 },
    { index: 6, phase: "Integration",
      intent: "Stitch the full sequence",
      required: ["ritual.opening-bow", "meditation.anchor-breath", "ritual.dedicate-merit"],
      targetMinutes: 20 },
    { index: 7, phase: "Mastery",
      intent: "Born again daily",
      required: ["ritual.opening-bow", "kriya.spinal-flex", "mantra.om", "ritual.dedicate-merit"],
      targetMinutes: 22 },
  ],
};
