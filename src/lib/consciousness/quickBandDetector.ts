/**
 * QUICK BAND DETECTOR — 4-question diagnostic
 *
 * Maps a user's 4 onboarding answers to:
 *   • Starting Band (0.0 – 6.9)
 *   • Micro-level (entering / deepening / mastery)
 *   • Phase (1–7 visible, mapped from existing 10-phase lifetimeSpiral)
 *   • Assigned Core Guru
 *
 * Engine still recalibrates the band over the first 7 sessions.
 * Bands 7+ (Divine Journey) are reserved for long-term progression
 * via the existing lifetimeSpiral engine.
 */

export type MicroLevel = "entering" | "deepening" | "mastery";

export interface QuickAnswers {
  // Q1 — Witness depth: "When difficult emotion arises…"
  emotion_response: 0 | 1 | 2 | 3;
  // Q2 — Practice maturity: "How familiar are you with watching thoughts?"
  practice_history: 0 | 1 | 2 | 3;
  // Q3 — Phase intent: "What brings you here?"
  intent: 0 | 1 | 2 | 3;
  // Q4 — Belief state: "Which feels most true?"
  belief: 0 | 1 | 2 | 3;
}

export interface QuickBandResult {
  band: number;                 // 0.0 – 6.9
  bandFloor: number;            // 0–6
  microLevel: MicroLevel;
  bandName: string;             // e.g. "The Mid-Awareness Hero"
  microName: string;            // e.g. "Deepening"
  phase: number;                // 1–7 (visible)
  phaseName: string;
  phaseDescription: string;
  guruId: string;
  guruName: string;
  guruWhy: string;              // "Why this guru is right for you"
  rationale: string;            // 1-line summary for reveal
}

/** Band 0–6 names (from blueprint Sleeper → Channel) */
const BAND_NAMES: Record<number, string> = {
  0: "The Sleeper",
  1: "The Questioner",
  2: "The Observer",
  3: "The Alchemist",
  4: "The Navigator",
  5: "The Architect",
  6: "The Channel",
};

/** Micro-level names per band (entering / deepening / mastery) */
const MICRO_NAMES: Record<number, [string, string, string]> = {
  0: ["Deep Sleep", "Awakening Spark", "The Seeker"],
  1: ["The Doubter", "The Gap Finder", "The Pattern Spotter"],
  2: ["The Watcher", "The Mid-Awareness Hero", "The Sustained Witness"],
  3: ["The Transformer", "The Loop Breaker", "The Golden Alchemist"],
  4: ["The Conscious Chooser", "The Identity Shedder", "The Navigator"],
  5: ["The Life Integrator", "The Fractal Master", "The Architect"],
  6: ["The Flow Walker", "The Deep Channel", "The Dissolving Self"],
};

/** Phase mapping: Band 0–6 → Phase 1–7 (visible to user) */
const PHASES: { phase: number; name: string; description: string }[] = [
  { phase: 1, name: "Awakening",    description: "First contact. Stabilising the nervous system." },
  { phase: 2, name: "Questioning",  description: "Noticing the gap between stimulus and response." },
  { phase: 3, name: "Observing",    description: "The witness is forming. Watching without reacting." },
  { phase: 4, name: "Alchemy",      description: "Pain becomes a teacher. Loops begin to dissolve." },
  { phase: 5, name: "Navigating",   description: "Choice replaces reaction. Identity loosens." },
  { phase: 6, name: "Architecting", description: "Awareness shapes reality. Integration deepens." },
  { phase: 7, name: "Channeling",   description: "Surrender. Life moves through you." },
];

/**
 * Core Guru roster — IDs match src/lib/temple-guides.ts
 * Mapped per band so each user gets a teacher matched to their depth.
 */
const CORE_GURU_BY_BAND: Record<number, { id: string; name: string; why: string }> = {
  0: {
    id: "aarav",
    name: "Aarav",
    why: "A modern, grounded guide. He'll meet you exactly where the noise is loudest.",
  },
  1: {
    id: "veer",
    name: "Veer",
    why: "He helps you spot the patterns you've started to sense but cannot yet name.",
  },
  2: {
    id: "patanjali",
    name: "Patanjali",
    why: "The codifier of the witness. He'll stabilise the watcher you've already glimpsed.",
  },
  3: {
    id: "buddha",
    name: "Buddha",
    why: "He'll show you how suffering itself becomes the doorway through.",
  },
  4: {
    id: "krishna",
    name: "Krishna",
    why: "He teaches conscious choice — action without attachment to the result.",
  },
  5: {
    id: "shankaracharya",
    name: "Adi Shankaracharya",
    why: "Non-dual pointing. He helps you see the One reality behind the many forms.",
  },
  6: {
    id: "ramana",
    name: "Ramana Maharshi",
    why: "Pure silence. He holds the space where the seeker dissolves.",
  },
};

/**
 * Compute starting Band, micro-level, phase & guru from 4 answers.
 *
 * Weighting (per blueprint):
 *   • belief        — 35%  (direct band marker — most diagnostic)
 *   • emotion_response — 30% (witness depth)
 *   • practice_history — 20% (practice maturity → micro-level)
 *   • intent        — 15%  (phase intent)
 *
 * Each answer is on a 0–3 scale → multiplied by 2 → contributes 0–6 band points.
 */
export function detectQuickBand(answers: QuickAnswers): QuickBandResult {
  const beliefScore  = answers.belief * 2;            // 0–6
  const emotionScore = answers.emotion_response * 2;  // 0–6
  const practiceScore = answers.practice_history * 2; // 0–6
  const intentScore  = answers.intent * 2;            // 0–6

  // Weighted average → 0.0 – 6.0
  const raw =
    beliefScore   * 0.35 +
    emotionScore  * 0.30 +
    practiceScore * 0.20 +
    intentScore   * 0.15;

  // Clamp to 0.0 – 6.9 (Bands 7+ unlock through actual practice, not self-report)
  const band = Math.max(0, Math.min(6.9, Math.round(raw * 10) / 10));
  const bandFloor = Math.floor(band);

  // Micro-level from fractional part
  const frac = band - bandFloor;
  let microIdx: 0 | 1 | 2;
  let microLevel: MicroLevel;
  if (frac < 0.34)      { microIdx = 0; microLevel = "entering"; }
  else if (frac < 0.67) { microIdx = 1; microLevel = "deepening"; }
  else                  { microIdx = 2; microLevel = "mastery"; }

  // Practice history can BUMP the micro-level if user clearly has experience
  // (someone with years of practice but Band 1 belief is still .9 of Band 1)
  let bumpedMicro = microIdx;
  if (answers.practice_history >= 2 && microIdx === 0) bumpedMicro = 1;
  if (answers.practice_history === 3 && bumpedMicro < 2) bumpedMicro = 2;

  const finalBand = bandFloor + (bumpedMicro === 0 ? 0.1 : bumpedMicro === 1 ? 0.5 : 0.9);

  const phaseInfo = PHASES[bandFloor] || PHASES[0];
  const guru = CORE_GURU_BY_BAND[bandFloor] || CORE_GURU_BY_BAND[0];
  const microName = MICRO_NAMES[bandFloor]?.[bumpedMicro] || "Beginning";

  return {
    band: Math.round(finalBand * 10) / 10,
    bandFloor,
    microLevel: bumpedMicro === 0 ? "entering" : bumpedMicro === 1 ? "deepening" : "mastery",
    bandName: BAND_NAMES[bandFloor] || "The Sleeper",
    microName,
    phase: phaseInfo.phase,
    phaseName: phaseInfo.name,
    phaseDescription: phaseInfo.description,
    guruId: guru.id,
    guruName: guru.name,
    guruWhy: guru.why,
    rationale: buildRationale(bandFloor, bumpedMicro, answers),
  };
}

function buildRationale(band: number, micro: number, a: QuickAnswers): string {
  if (band <= 1) return "You're at the very start of the inner journey. We'll move gently — building the ground first.";
  if (band === 2) return "The witness is forming in you. We'll strengthen what you've already begun to notice.";
  if (band === 3) return "You've started to transmute pain into insight. We'll deepen that capacity.";
  if (band === 4) return "You can choose your responses. Now we explore what freedom truly asks of you.";
  if (band === 5) return "You sense how awareness shapes reality. We'll integrate this across all of life.";
  return "You're close to the edge of the personal self. We'll hold space for what wants to arise.";
}

/** Default fallback if the user somehow skips */
export const DEFAULT_BAND_RESULT: QuickBandResult = detectQuickBand({
  emotion_response: 0,
  practice_history: 0,
  intent: 0,
  belief: 0,
});
