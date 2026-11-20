/**
 * SUITABILITY — the safety gate.
 * ──────────────────────────────
 * The app must never hand a sleepy, panicking, dissociating, pregnant or
 * post-surgical user a deep meditation. Meditation is not mind-holding and it
 * is not sleep; when the body needs rest, rest is the practice.
 *
 * Order matters: crisis and psychosis outrank everything else.
 */

import type { SuitabilityDecision, SuitabilityInput } from "./types";
import { KUNDALINI_SIGNS } from "@/data/kundaliniSigns";

const SIGN_SAFETY = new Map(KUNDALINI_SIGNS.map((sign) => [sign.id, sign.safety]));

const clamp = (n: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));

export function defaultSuitability(): SuitabilityInput {
  return {
    sleepHours: 7,
    sleepQuality: 3,
    painLevel: 0,
    emotionalIntensity: 3,
    panic: false,
    dissociation: false,
    pregnancy: false,
    recentSurgery: false,
    psychosisHistory: false,
    substance: false,
    ageBand: "adult",
    crisis: false,
  };
}

export function decideSuitability(input: SuitabilityInput = {}): SuitabilityDecision {
  const s: SuitabilityInput = { ...defaultSuitability(), ...input };
  const reasons: string[] = [];

  if (s.crisis) {
    reasons.push("crisis signal present");
    return {
      verdict: "hold",
      reasons,
      allowMeditation: false,
      allowBreathRetention: false,
      allowClosedEyes: false,
      allowLongSit: false,
      maxMinutes: 3,
      recommendedProtocol: "Grounding only, then talk to a human you trust.",
    };
  }

  if (s.psychosisHistory) {
    reasons.push("history of psychosis or mania");
    return {
      verdict: "refer",
      reasons,
      allowMeditation: false,
      allowBreathRetention: false,
      allowClosedEyes: false,
      allowLongSit: false,
      maxMinutes: 0,
      recommendedProtocol: "Speak to a clinician before intensive practice.",
    };
  }

  if (s.panic || (s.emotionalIntensity ?? 0) >= 8) {
    reasons.push(s.panic ? "panic signal" : "emotional intensity 8+");
    return {
      verdict: "adapt",
      reasons,
      allowMeditation: true,
      allowBreathRetention: false,
      allowClosedEyes: false,
      allowLongSit: false,
      maxMinutes: 8,
      recommendedProtocol: "Eyes open, feet on the floor, natural breath. No retention, no silence.",
    };
  }

  if (s.dissociation) {
    reasons.push("dissociation signal");
    return {
      verdict: "adapt",
      reasons,
      allowMeditation: true,
      allowBreathRetention: false,
      allowClosedEyes: false,
      allowLongSit: false,
      maxMinutes: 8,
      recommendedProtocol: "Sensory orientation first: name 5 things you see, 3 you hear, 1 you touch.",
    };
  }

  // Energy signs: kundalini phenomena can mimic panic and dissociation. The
  // corpus is explicit that signs are not goals, and force is never the move.
  const energy = (s.energySignals ?? []).filter((id) => SIGN_SAFETY.has(id));
  if (energy.some((id) => SIGN_SAFETY.get(id) === "stop-and-support")) {
    reasons.push("energy sign: stop-and-support");
    return {
      verdict: "hold",
      reasons,
      allowMeditation: false,
      allowBreathRetention: false,
      allowClosedEyes: false,
      allowLongSit: false,
      maxMinutes: 3,
      recommendedProtocol:
        "Stop intensive practice. Grounding only: feet, breath, room, one person you trust. No energy work today.",
    };
  }
  if (energy.some((id) => SIGN_SAFETY.get(id) === "check-in")) {
    reasons.push("energy sign: check-in");
    return {
      verdict: "adapt",
      reasons,
      allowMeditation: true,
      allowBreathRetention: false,
      allowClosedEyes: true,
      allowLongSit: false,
      maxMinutes: 10,
      recommendedProtocol:
        "Slow down: shorter sit, natural breath, no retention, no chasing the phenomenon. Ground after.",
    };
  }

  const hours = Number(s.sleepHours ?? 7);
  const quality = Number(s.sleepQuality ?? 3);
  if (hours < 5 || quality <= 2) {
    reasons.push(`low sleep (${hours}h, quality ${quality}/5)`);
    return {
      verdict: "rest_only",
      reasons,
      allowMeditation: false,
      allowBreathRetention: false,
      allowClosedEyes: true,
      allowLongSit: false,
      maxMinutes: 10,
      recommendedProtocol: "Rest protocol (body rest / yoga nidra). Sleep first; meditation later.",
    };
  }

  const pain = clamp(Number(s.painLevel ?? 0), 0, 10);
  if (pain >= 6) {
    reasons.push(`pain ${pain}/10`);
    return {
      verdict: "adapt",
      reasons,
      allowMeditation: true,
      allowBreathRetention: false,
      allowClosedEyes: true,
      allowLongSit: false,
      maxMinutes: 6,
      recommendedProtocol: "Short body/breath only. Change posture freely. Pain is information, not progress.",
    };
  }

  if (s.pregnancy || s.recentSurgery || s.substance) {
    if (s.pregnancy) reasons.push("pregnancy");
    if (s.recentSurgery) reasons.push("recent surgery");
    if (s.substance) reasons.push("substance influence");
    return {
      verdict: "adapt",
      reasons,
      allowMeditation: true,
      allowBreathRetention: false,
      allowClosedEyes: true,
      allowLongSit: false,
      maxMinutes: 10,
      recommendedProtocol: "Gentle natural breath. No retention, no strong body work.",
    };
  }

  if (s.ageBand === "teen") {
    reasons.push("teen dose cap");
    return {
      verdict: "adapt",
      reasons,
      allowMeditation: true,
      allowBreathRetention: false,
      allowClosedEyes: true,
      allowLongSit: false,
      maxMinutes: 10,
      recommendedProtocol: "Short, guided, plain language. No intensive silence.",
    };
  }

  reasons.push("no red flags");
  return {
    verdict: "clear",
    reasons,
    allowMeditation: true,
    allowBreathRetention: true,
    allowClosedEyes: true,
    allowLongSit: true,
    maxMinutes: 30,
    recommendedProtocol: "Standard practice allowed.",
  };
}

export function suitabilitySummary(decision: SuitabilityDecision): string {
  if (decision.verdict === "clear") return "Clear to practice.";
  if (decision.verdict === "rest_only") return "Rest today — sleep is the practice.";
  if (decision.verdict === "hold") return "Hold — ground first, no deep practice.";
  if (decision.verdict === "refer") return "Support first — speak to a professional.";
  return `Adapted: ${decision.recommendedProtocol}`;
}
