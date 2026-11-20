/**
 * PROGRAM: Trauma-Aware Foundation — gentle, titrated, safe.
 */
import type { SessionProgramV3 } from "../types";

export const TRAUMA_AWARE_FOUNDATION: SessionProgramV3 = {
  id: "trauma-aware-foundation",
  title: "Trauma-Aware Foundation",
  subtitle: "Gentle, titrated, never overwhelming",
  description:
    "A 7-session arc for nervous-system-first practice: small doses, body-led pacing, resourcing before any deep work.",
  difficulty: "beginner",
  category: "heart",
  tags: ["trauma", "somatic", "regulation"],
  icon: "ShieldCheck",
  coverGradient: "from-emerald-700 to-slate-900",
  totalSessions: 7,
  phases: [
    { phase: "Foundation", sessions: 3, focus: "Resource & orient" },
    { phase: "Practice", sessions: 2, focus: "Titrate sensation" },
    { phase: "Integration", sessions: 1, focus: "Daily safety anchor" },
    { phase: "Mastery", sessions: 1, focus: "Held by your own system" },
  ],
  sessions: [
    { index: 1, phase: "Foundation",
      intent: "Orient to safety",
      required: ["ritual.opening-bow", "observe.5-senses", "breath.coherent-5-5"],
      targetMinutes: 15 },
    { index: 2, phase: "Foundation",
      intent: "Find a resource",
      required: ["body.micro-scan-60s", "neuro.vagus-nerve", "journal.head-heart-gut-check"],
      targetMinutes: 18 },
    { index: 3, phase: "Foundation",
      intent: "Pendulate gently",
      required: ["body.tension-map", "somatic.sigh-3x", "breath.physiological-sigh"],
      targetMinutes: 18 },
    { index: 4, phase: "Practice",
      intent: "Small dose of feeling",
      required: ["emotion.label-to-tame", "ifs.meet-a-part", "somatic.tense-release"],
      targetMinutes: 20 },
    { index: 5, phase: "Practice",
      intent: "Discharge, then rest",
      required: ["somatic.tre-tremor", "movement.shake-it-off", "meditation.anchor-breath"],
      targetMinutes: 22 },
    { index: 6, phase: "Integration",
      intent: "Daily safety anchor",
      required: ["mudra.anjali", "micro-act.drink-water", "ritual.dedicate-merit"],
      targetMinutes: 15 },
    { index: 7, phase: "Mastery",
      intent: "Held by your own system",
      required: ["ritual.opening-bow", "meditation.loving-kindness", "mantra.so-hum", "ritual.dedicate-merit"],
      targetMinutes: 22 },
  ],
};
