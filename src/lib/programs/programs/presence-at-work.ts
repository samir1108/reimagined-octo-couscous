/**
 * PROGRAM: Presence at Work — bring sadhana into your job.
 */
import type { SessionProgramV3 } from "../types";

export const PRESENCE_AT_WORK: SessionProgramV3 = {
  id: "presence-at-work",
  title: "Presence at Work",
  subtitle: "Turn your job into the practice ground",
  description:
    "A 7-session arc to bring breath, witness, and boundaries directly into the email-meeting-deadline loop of work life.",
  difficulty: "beginner",
  category: "ethics",
  tags: ["work", "focus", "presence"],
  icon: "Briefcase",
  coverGradient: "from-cyan-700 to-slate-800",
  totalSessions: 7,
  phases: [
    { phase: "Foundation", sessions: 2, focus: "See the work loop" },
    { phase: "Practice", sessions: 3, focus: "Micro-anchors in the day" },
    { phase: "Integration", sessions: 1, focus: "End-of-day close" },
    { phase: "Mastery", sessions: 1, focus: "Work as offering" },
  ],
  sessions: [
    { index: 1, phase: "Foundation",
      intent: "Map your work loop",
      required: ["ritual.opening-bow", "teach.loop.what-is-a-loop", "journal.loop-of-the-day"],
      targetMinutes: 18 },
    { index: 2, phase: "Foundation",
      intent: "The reactive default",
      required: ["neuro.amygdala-hijack", "framework.loop-anatomy", "body.tension-map"],
      targetMinutes: 20 },
    { index: 3, phase: "Practice",
      intent: "Breath between tasks",
      required: ["breath.box-4-4-4-4", "breath.coherent-5-5", "observe.5-senses"],
      targetMinutes: 18 },
    { index: 4, phase: "Practice",
      intent: "One thing at a time",
      required: ["concentration.candle-trataka", "observe.one-object", "detox.no-phone-30min"],
      targetMinutes: 22 },
    { index: 5, phase: "Practice",
      intent: "Speech in meetings",
      required: ["speech-vow.no-complaint-1h", "speech-vow.one-honest-thing", "loop-confront.interrupt-now"],
      targetMinutes: 20 },
    { index: 6, phase: "Integration",
      intent: "End-of-day close",
      required: ["journal.head-heart-gut-check", "micro-act.thank-someone", "ritual.dedicate-merit"],
      targetMinutes: 18 },
    { index: 7, phase: "Mastery",
      intent: "Work as offering",
      required: ["ritual.opening-bow", "wisdom.gita.2.47", "meditation.open-awareness", "ritual.dedicate-merit"],
      targetMinutes: 25 },
  ],
};
