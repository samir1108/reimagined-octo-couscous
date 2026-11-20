/**
 * PROGRAM: Wisdom of Tao — wu wei, flow, non-forcing.
 */
import type { SessionProgramV3 } from "../types";

export const TAO_FLOW: SessionProgramV3 = {
  id: "tao-flow",
  title: "Wisdom of Tao",
  subtitle: "Wu wei — accomplish by not forcing",
  description:
    "A 6-session arc through the Tao Te Ching's core teaching: yielding, flowing, and effortless action.",
  difficulty: "beginner",
  category: "wisdom",
  tags: ["tao", "wu-wei", "flow"],
  icon: "Waves",
  coverGradient: "from-teal-700 to-emerald-900",
  totalSessions: 6,
  phases: [
    { phase: "Foundation", sessions: 1, focus: "The water way" },
    { phase: "Practice", sessions: 3, focus: "Yield, flow, soften" },
    { phase: "Integration", sessions: 1, focus: "One unforced act" },
    { phase: "Mastery", sessions: 1, focus: "Like water" },
  ],
  sessions: [
    { index: 1, phase: "Foundation",
      intent: "The water way",
      required: ["ritual.opening-bow", "wisdom.tao.11", "framework.witness-vs-thinker"],
      targetMinutes: 18 },
    { index: 2, phase: "Practice",
      intent: "Yield in the body",
      required: ["body.head-to-toe", "movement.cat-cow", "breath.coherent-5-5"],
      targetMinutes: 20 },
    { index: 3, phase: "Practice",
      intent: "Soften the grip",
      required: ["ifs.unburden-protector", "emotion.rain", "contemplation.sit-with-question"],
      targetMinutes: 22 },
    { index: 4, phase: "Practice",
      intent: "Listen, don't push",
      required: ["meditation.open-awareness", "observe.5-senses", "witness.gap-between-thoughts"],
      targetMinutes: 22 },
    { index: 5, phase: "Integration",
      intent: "One unforced act",
      required: ["micro-act.tidy-one-thing", "speech-vow.pause-before-reply", "ritual.dedicate-merit"],
      targetMinutes: 18 },
    { index: 6, phase: "Mastery",
      intent: "Like water",
      required: ["ritual.opening-bow", "meditation.open-awareness", "mantra.so-hum", "ritual.dedicate-merit"],
      targetMinutes: 25 },
  ],
};
