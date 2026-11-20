/**
 * PROGRAM: Anxiety Relief — somatic-first regulation.
 */
import type { SessionProgramV3 } from "../types";

export const ANXIETY_RELIEF: SessionProgramV3 = {
  id: "anxiety-relief",
  title: "Anxiety Relief",
  subtitle: "Down-regulate the nervous system",
  description:
    "A 7-session somatic-first arc for anxious minds: vagus-nerve breath, body scans, RAIN, and the witness behind worry.",
  difficulty: "beginner",
  category: "emotional",
  tags: ["anxiety", "nervous-system", "regulation"],
  icon: "Wind",
  coverGradient: "from-sky-500 to-blue-700",
  totalSessions: 7,
  phases: [
    { phase: "Foundation", sessions: 2, focus: "Map the anxiety" },
    { phase: "Practice", sessions: 3, focus: "Regulate fast" },
    { phase: "Integration", sessions: 1, focus: "Daily toolkit" },
    { phase: "Mastery", sessions: 1, focus: "Calm as baseline" },
  ],
  sessions: [
    { index: 1, phase: "Foundation",
      intent: "See anxiety as a loop, not you",
      required: ["ritual.opening-bow", "neuro.amygdala-hijack", "framework.loop-anatomy", "journal.loop-of-the-day"],
      targetMinutes: 18 },
    { index: 2, phase: "Foundation",
      intent: "Locate anxiety in the body",
      required: ["body.tension-map", "body.micro-scan-60s", "emotion.label-to-tame"],
      targetMinutes: 18 },
    { index: 3, phase: "Practice",
      intent: "Vagus reset in 60 seconds",
      required: ["neuro.vagus-nerve", "breath.physiological-sigh", "somatic.sigh-3x"],
      targetMinutes: 15 },
    { index: 4, phase: "Practice",
      intent: "Coherent breath, calm heart",
      required: ["breath.coherent-5-5", "meditation.anchor-breath", "body.head-to-toe"],
      targetMinutes: 22 },
    { index: 5, phase: "Practice",
      intent: "RAIN with anxiety",
      required: ["emotion.rain", "ifs.meet-a-part", "journal.unsent-letter"],
      targetMinutes: 25 },
    { index: 6, phase: "Integration",
      intent: "Your anxiety toolkit",
      required: ["breath.physiological-sigh", "movement.shake-it-off", "micro-act.drink-water", "voice-journal.speak-it-out"],
      targetMinutes: 18 },
    { index: 7, phase: "Mastery",
      intent: "Spacious behind the worry",
      required: ["ritual.opening-bow", "meditation.open-awareness", "witness.who-is-watching", "ritual.dedicate-merit"],
      targetMinutes: 25 },
  ],
};
