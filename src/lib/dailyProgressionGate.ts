/**
 * Daily Progression Gate — the primary journey threshold for today.
 *
 * Derived from real signals (journey day, theme, V-level/profile state,
 * incomplete missions, time of day). Never restrictive: previous days remain
 * accessible through history/journal; missing a day never resets progression.
 */

import type { GateId } from "@/lib/consciousness/dailyGates";
import { getCurrentGate } from "@/lib/consciousness/dailyGates";

export type GateStage = "arrival" | "entry" | "activation" | "exploration" | "completion";

export interface ProgressionGate {
  day: number;
  chapter: number;
  chapterLabel: string;
  name: string;
  subtitle: string;
  intention: string;
  why: string;
  observe: string;
  timeGate: GateId;
  stage: GateStage;
  completion: {
    morningPractice: boolean;
    observationMission: boolean;
    wisdom: boolean;
    eveningReflection: boolean;
    sitting: boolean;
  };
  discoveries: number;
  karma: number;
  streak: number;
  nextHint: string;
}

const CHAPTER_SIZE = 7;

const GATE_NAMES: Array<{ name: string; subtitle: string; observe: string }> = [
  { name: "The Gate of Arrival", subtitle: "Begin exactly where you are.", observe: "Notice what brought you here today." },
  { name: "The Gate of Awareness", subtitle: "Learn to observe yourself.", observe: "Watch one thought without following it." },
  { name: "The Gate of Silence", subtitle: "Meet the space beneath noise.", observe: "Notice the pause between two thoughts." },
  { name: "The Gate of Patterns", subtitle: "See what repeats.", observe: "Catch one familiar reaction as it begins." },
  { name: "The Gate of the Witness", subtitle: "Something is watching your thoughts.", observe: "Find the one who notices your mind." },
  { name: "The Gate of Breath", subtitle: "Return to the body's rhythm.", observe: "Feel one breath from beginning to end." },
  { name: "The Gate of Feeling", subtitle: "Let emotion be known.", observe: "Name what is alive without judging it." },
  { name: "The Gate of Attachment", subtitle: "See what you hold too tightly.", observe: "Notice where grasping appears today." },
  { name: "The Gate of Choice", subtitle: "Respond, don't react.", observe: "Pause once before an automatic response." },
  { name: "The Gate of Compassion", subtitle: "Include yourself.", observe: "Offer one gentle response to difficulty." },
  { name: "The Gate of Truth", subtitle: "Meet what is honest.", observe: "Notice where you soften or avoid truth." },
  { name: "The Gate of Action", subtitle: "Bring awareness into movement.", observe: "Do one ordinary act with full presence." },
  { name: "The Gate of Relationship", subtitle: "See yourself through others.", observe: "Listen once without preparing a reply." },
  { name: "The Gate of Integration", subtitle: "Carry the day inward.", observe: "Connect a practice to a real moment." },
  { name: "The Gate of the Mirror", subtitle: "Meet your reflection kindly.", observe: "Notice a pattern without making it identity." },
  { name: "The Gate of Letting Go", subtitle: "Release what is complete.", observe: "Set down one unnecessary mental weight." },
  { name: "The Gate of Meaning", subtitle: "Remember what matters.", observe: "Choose one action aligned with your deeper value." },
  { name: "The Gate of Presence", subtitle: "Arrive in this moment.", observe: "Return attention to now, gently." },
  { name: "The Gate of Courage", subtitle: "Stay with what is real.", observe: "Meet one uncomfortable truth with steadiness." },
  { name: "The Gate of Stillness", subtitle: "Rest as awareness.", observe: "Let experience move without interference." },
  { name: "The Gate of Return", subtitle: "The spiral turns again.", observe: "Meet an old pattern with new depth." },
];

function roman(n: number): string {
  const vals: Array<[number, string]> = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "";
  let x = Math.max(1, Math.floor(n));
  for (const [v, s] of vals) while (x >= v) { out += s; x -= v; }
  return out;
}

export function getProgressionGate(input: {
  journeyDay: number;
  themeTitle?: string | null;
  themeDescription?: string | null;
  intention?: string | null;
  why?: string | null;
  hasSitting: boolean;
  hasPractice: boolean;
  hasObservation: boolean;
  hasWisdom: boolean;
  hasEvening: boolean;
  discoveries: number;
  karma: number;
  streak: number;
  incompleteMissions: number;
}): ProgressionGate {
  const day = Math.max(1, Math.floor(input.journeyDay || 1));
  const chapter = Math.floor((day - 1) / CHAPTER_SIZE) + 1;
  const base = GATE_NAMES[(day - 1) % GATE_NAMES.length];
  const timeGate = getCurrentGate(new Date().getHours());

  const completion = {
    sitting: input.hasSitting,
    morningPractice: input.hasPractice,
    observationMission: input.hasObservation,
    wisdom: input.hasWisdom,
    eveningReflection: input.hasEvening,
  };
  const doneCount = Object.values(completion).filter(Boolean).length;
  const stage: GateStage =
    doneCount >= 4 ? "completion" :
    doneCount >= 1 ? "exploration" :
    input.hasSitting ? "exploration" : "arrival";

  const adaptedName = input.themeTitle?.trim()
    ? `The Gate of ${input.themeTitle.trim().replace(/^the\s+/i, "")}`
    : base.name;

  return {
    day,
    chapter,
    chapterLabel: `Chapter ${roman(chapter)}`,
    name: adaptedName,
    subtitle: base.subtitle,
    intention: input.intention?.trim() || input.themeDescription?.trim() || "Enter today's experience with honest attention.",
    why: input.why?.trim() || "This gate adapts to where you are and what your journey is asking for now.",
    observe: base.observe,
    timeGate,
    stage,
    completion,
    discoveries: input.discoveries,
    karma: input.karma,
    streak: input.streak,
    nextHint: input.incompleteMissions > 0
      ? "Today's exploration is still open. Continue gently, in your own time."
      : "Today's gate can be completed through meaningful engagement, not speed.",
  };
}
