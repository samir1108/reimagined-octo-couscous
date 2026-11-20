/**
 * PROGRAM: Sacred Speech — vāk yoga, the discipline of words.
 */
import type { SessionProgramV3 } from "../types";

export const SACRED_SPEECH: SessionProgramV3 = {
  id: "sacred-speech",
  title: "Sacred Speech",
  subtitle: "Vāk yoga — the discipline of words",
  description:
    "A 6-session arc to upgrade speech: less complaint, more truth, more silence — and the courage to say one honest thing a day.",
  difficulty: "intermediate",
  category: "ethics",
  tags: ["speech", "vak", "satya"],
  icon: "MessageCircle",
  coverGradient: "from-amber-500 to-rose-500",
  totalSessions: 6,
  phases: [
    { phase: "Foundation", sessions: 1, focus: "Audit your speech" },
    { phase: "Practice", sessions: 3, focus: "Pause, refrain, speak true" },
    { phase: "Integration", sessions: 1, focus: "Repair" },
    { phase: "Mastery", sessions: 1, focus: "Speech as prayer" },
  ],
  sessions: [
    { index: 1, phase: "Foundation",
      intent: "Hear how you actually speak",
      required: ["ritual.opening-bow", "witness.thought-counter", "journal.loop-of-the-day", "voice-journal.speak-it-out"],
      targetMinutes: 18 },
    { index: 2, phase: "Practice",
      intent: "One hour without complaint",
      required: ["speech-vow.no-complaint-1h", "emotion.label-to-tame", "journal.unsent-letter"],
      targetMinutes: 20 },
    { index: 3, phase: "Practice",
      intent: "Pause before every reply",
      required: ["teach.parable.two-arrows", "speech-vow.pause-before-reply", "breath.physiological-sigh"],
      targetMinutes: 20 },
    { index: 4, phase: "Practice",
      intent: "Say one honest thing",
      required: ["speech-vow.one-honest-thing", "contemplation.sit-with-question", "voice-journal.speak-it-out"],
      targetMinutes: 22 },
    { index: 5, phase: "Integration",
      intent: "Make one repair call",
      required: ["micro-act.call-someone", "micro-act.thank-someone", "journal.unsent-letter"],
      targetMinutes: 18 },
    { index: 6, phase: "Mastery",
      intent: "Speech as prayer",
      required: ["ritual.opening-bow", "mantra.om", "mantra.so-hum", "ritual.dedicate-merit"],
      targetMinutes: 25 },
  ],
};
