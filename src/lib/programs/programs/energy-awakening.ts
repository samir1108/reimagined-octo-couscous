/**
 * PROGRAM: Energy Awakening — pranic vitality from breath, kriya, movement.
 */
import type { SessionProgramV3 } from "../types";

export const ENERGY_AWAKENING: SessionProgramV3 = {
  id: "energy-awakening",
  title: "Energy Awakening",
  subtitle: "Prana rising — wake the body up",
  description:
    "An 8-session arc through breath, kriya and movement to clear stagnation and bring prana online — from morning charge to full-body aliveness.",
  difficulty: "beginner",
  category: "body",
  tags: ["prana", "kriya", "energy"],
  icon: "Zap",
  coverGradient: "from-orange-500 to-yellow-500",
  totalSessions: 8,
  phases: [
    { phase: "Foundation", sessions: 2, focus: "Wake the breath" },
    { phase: "Practice", sessions: 4, focus: "Clear & circulate" },
    { phase: "Integration", sessions: 1, focus: "Daily charge" },
    { phase: "Mastery", sessions: 1, focus: "Sustained vitality" },
  ],
  sessions: [
    {
      index: 1, phase: "Foundation",
      intent: "Notice your current energy",
      required: ["ritual.opening-bow", "body.micro-scan-60s", "breath.coherent-5-5", "journal.head-heart-gut-check"],
      targetMinutes: 12,
    },
    {
      index: 2, phase: "Foundation",
      intent: "Learn the morning charge",
      required: ["breath.kapalbhati", "movement.standup-stretch", "movement.cat-cow"],
      fillFrom: ["movement", "breathwork"], targetMinutes: 15,
    },
    {
      index: 3, phase: "Practice",
      intent: "Spinal kriya — clear the central channel",
      required: ["ritual.opening-bow", "kriya.spinal-flex", "breath.nadi-shodhana"],
      fillFrom: ["kriya"], targetMinutes: 20,
    },
    {
      index: 4, phase: "Practice",
      intent: "Breath of fire",
      required: ["kriya.breath-of-fire", "body.head-to-toe", "mudra.gyan"],
      targetMinutes: 22,
    },
    {
      index: 5, phase: "Practice",
      intent: "Shake out what's stuck",
      required: ["movement.shake-it-off", "somatic.tre-tremor", "movement.cat-cow"],
      fillFrom: ["movement", "somatic-release"], targetMinutes: 20,
    },
    {
      index: 6, phase: "Practice",
      intent: "Sat kriya — sustained activation",
      required: ["ritual.opening-bow", "kriya.sat-kriya", "meditation.anchor-breath"],
      targetMinutes: 25,
    },
    {
      index: 7, phase: "Integration",
      intent: "Build your 5-minute daily charge",
      required: ["breath.kapalbhati", "movement.standup-stretch", "micro-act.drink-water", "voice-journal.speak-it-out"],
      targetMinutes: 15,
    },
    {
      index: 8, phase: "Mastery",
      intent: "Full-body aliveness, sustained",
      required: ["ritual.opening-bow", "breath.nadi-shodhana", "kriya.sat-kriya", "mantra.so-hum", "ritual.dedicate-merit"],
      targetMinutes: 28,
    },
  ],
};
