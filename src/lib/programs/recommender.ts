/**
 * V3 Program Recommender
 * ─────────────────────────
 * Scores the 42 developed V3 programs against the user's journey signals
 * and returns ranked matches. Pure, no I/O.
 *
 * Inputs (all optional):
 *   - activeLoops: detected loop IDs (e.g. ["VAL001"])
 *   - energy: low|medium|high
 *   - vLevel: 0..10 (band)
 *   - stressedDomains: e.g. ["work","relationships"]
 *   - completedProgramIds: avoid re-recommending
 *   - timeOfDay: morning|midday|evening|night
 *   - recentTags: tags from recent practice (light theme alignment)
 */
import { ALL_PROGRAMS_V3 } from "./index";
import type { SessionProgramV3, ProgramDifficulty } from "./types";

export interface JourneyMetrics {
  activeLoops?: string[];
  energy?: "low" | "medium" | "high";
  vLevel?: number; // 0..10
  stressedDomains?: string[];
  completedProgramIds?: string[];
  timeOfDay?: "morning" | "midday" | "evening" | "night";
  recentTags?: string[];
}

export interface ProgramRecommendation {
  program: SessionProgramV3;
  score: number;
  reasons: string[];
}

// Soft mapping of stressed domains → relevant program tags
const DOMAIN_TAG_HINTS: Record<string, string[]> = {
  work: ["focus", "presence", "boundaries", "dharma", "stress"],
  relationships: ["heart", "forgiveness", "boundaries", "anger", "communication", "shadow"],
  sleep: ["sleep", "evening", "rest", "stillness"],
  anxiety: ["anxiety", "breath", "witness", "stillness"],
  grief: ["grief", "heart", "trauma"],
  creativity: ["creative", "flow", "tantra"],
  body: ["body", "kriya", "energy"],
  money: ["abundance", "dharma"],
};

const TIME_TAG_HINTS: Record<string, string[]> = {
  morning: ["morning", "energy", "becoming", "pranayama"],
  midday: ["focus", "presence", "attention"],
  evening: ["evening", "reflection", "heart", "dissolve"],
  night: ["sleep", "stillness", "dream", "rest"],
};

function difficultyFitsLevel(d: ProgramDifficulty, vLevel: number): number {
  if (vLevel <= 2) return d === "beginner" ? 1.5 : d === "intermediate" ? 0.2 : -0.8;
  if (vLevel <= 5) return d === "intermediate" ? 1.2 : d === "beginner" ? 0.5 : 0.3;
  return d === "advanced" ? 1.5 : d === "intermediate" ? 0.6 : 0;
}

function scoreProgram(p: SessionProgramV3, m: JourneyMetrics): ProgramRecommendation {
  let score = 0;
  const reasons: string[] = [];
  const tagSet = new Set(p.tags.map((t) => t.toLowerCase()));
  const title = (p.title + " " + p.subtitle).toLowerCase();

  // Already completed → big penalty
  if (m.completedProgramIds?.includes(p.id)) {
    score -= 5;
  }

  // Stressed domains → tag overlap
  if (m.stressedDomains?.length) {
    for (const d of m.stressedDomains) {
      const hints = DOMAIN_TAG_HINTS[d.toLowerCase()] ?? [];
      const hits = hints.filter((h) => tagSet.has(h) || title.includes(h));
      if (hits.length) {
        score += 2 * hits.length;
        reasons.push(`addresses ${d}`);
      }
    }
  }

  // Time-of-day fit
  if (m.timeOfDay) {
    const hints = TIME_TAG_HINTS[m.timeOfDay] ?? [];
    const hits = hints.filter((h) => tagSet.has(h) || title.includes(h));
    if (hits.length) {
      score += 1.2;
      reasons.push(`fits ${m.timeOfDay}`);
    }
  }

  // V-Level fit
  if (typeof m.vLevel === "number") {
    const fit = difficultyFitsLevel(p.difficulty, m.vLevel);
    score += fit;
    if (fit > 0.8) reasons.push(`matches your level`);
  }

  // Active loops → light theme alignment via tags
  if (m.activeLoops?.length) {
    // Loop IDs are opaque (VAL001 etc) — use a fuzzy heuristic via category
    const introspective = ["shadow", "witness", "inquiry", "loop", "ifs"].some(
      (k) => tagSet.has(k) || title.includes(k),
    );
    if (introspective) {
      score += 1.5;
      reasons.push(`works your active patterns`);
    }
  }

  // Recent tag overlap (continuity bonus, small)
  if (m.recentTags?.length) {
    const hits = m.recentTags.filter((t) => tagSet.has(t.toLowerCase())).length;
    if (hits) score += 0.6 * hits;
  }

  // Energy hint — high → fierce/energy programs; low → stillness/sleep
  if (m.energy === "high" && (tagSet.has("energy") || tagSet.has("kriya") || tagSet.has("fierce"))) {
    score += 0.8;
  }
  if (m.energy === "low" && (tagSet.has("rest") || tagSet.has("stillness") || tagSet.has("sleep"))) {
    score += 0.8;
  }

  return { program: p, score, reasons };
}

export function recommendV3Programs(
  metrics: JourneyMetrics,
  limit = 3,
): ProgramRecommendation[] {
  return ALL_PROGRAMS_V3
    .map((p) => scoreProgram(p, metrics))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function topV3Program(metrics: JourneyMetrics): ProgramRecommendation | null {
  return recommendV3Programs(metrics, 1)[0] ?? null;
}
