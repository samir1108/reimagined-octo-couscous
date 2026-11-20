/**
 * REGISTRY — one lookup surface for every claim.
 * ─────────────────────────────────────────────
 * Landing sections, session teaching, and the guide all resolve claims here.
 * `validateClaims()` is the gate: no evidence, no ship.
 */

import { ALL_CLAIMS } from "./claims";
import {
  BANNED_MEDICAL_TERMS,
  type Claim,
  type ClaimValidation,
  type LandingSection,
} from "./types";

export const KNOWLEDGE_VERSION = 1;

export function getClaim(id: string): Claim | undefined {
  return ALL_CLAIMS.find((claim) => claim.id === id);
}

export function claimsBySection(section: LandingSection): Claim[] {
  return ALL_CLAIMS.filter((claim) => claim.section === section);
}

export function claimsByConcept(conceptId: string): Claim[] {
  return ALL_CLAIMS.filter((claim) => claim.conceptId === conceptId);
}

export function claimsByPractice(practiceId: string): Claim[] {
  return ALL_CLAIMS.filter((claim) => claim.practiceId === practiceId);
}

export function claimsByLoop(loopId: string): Claim[] {
  return ALL_CLAIMS.filter((claim) => claim.loopIds?.includes(loopId));
}

export function claimsByDomain(domainId: string): Claim[] {
  return ALL_CLAIMS.filter((claim) => claim.domainIds?.includes(domainId));
}

export function claimText(id: string, mode: "short" | "statement" = "short"): string | null {
  const claim = getClaim(id);
  if (!claim) return null;
  return mode === "short" ? claim.short : claim.statement;
}

export function claimCountBySection(): Record<string, number> {
  return ALL_CLAIMS.reduce<Record<string, number>>((acc, claim) => {
    acc[claim.section] = (acc[claim.section] ?? 0) + 1;
    return acc;
  }, {});
}

/**
 * Pick the claims a session should stand on. Teaching text must be traceable
 * to this list — the composer may rephrase, never invent a new doctrine.
 */
export interface ClaimQuery {
  concept?: string;
  practice?: string;
  section?: LandingSection;
  limit?: number;
}

export function resolveClaimsForSession(query: ClaimQuery): Claim[] {
  const limit = Math.max(1, Math.min(5, query.limit ?? 2));
  const pool = ALL_CLAIMS.filter((claim) => {
    if (query.concept && claim.conceptId === query.concept) return true;
    if (query.practice && claim.practiceId === query.practice) return true;
    if (query.section && claim.section === query.section) return true;
    return false;
  });
  return [...pool].sort((a, b) => b.confidence - a.confidence).slice(0, limit);
}

export function validateClaims(claims: Claim[] = ALL_CLAIMS): ClaimValidation {
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const claim of claims) {
    if (!claim.id.startsWith("k.")) errors.push(`${claim.id}: id must start with "k."`);
    if (seen.has(claim.id)) errors.push(`${claim.id}: duplicate id`);
    seen.add(claim.id);

    if (!claim.statement || claim.statement.trim().length < 20) {
      errors.push(`${claim.id}: statement too short`);
    }
    if (!claim.short || claim.short.length > 90) {
      errors.push(`${claim.id}: short must be present and <= 90 chars`);
    }
    if (!claim.evidence || claim.evidence.length === 0) {
      errors.push(`${claim.id}: needs at least one evidence reference`);
    }
    if (!Number.isFinite(claim.confidence) || claim.confidence < 0 || claim.confidence > 1) {
      errors.push(`${claim.id}: confidence must be 0..1`);
    }
    if (!claim.language) errors.push(`${claim.id}: language required`);
    if (!claim.reviewStatus) errors.push(`${claim.id}: reviewStatus required`);

    const text = `${claim.statement} ${claim.short}`.toLowerCase();
    for (const term of BANNED_MEDICAL_TERMS) {
      if (text.includes(term)) {
        errors.push(`${claim.id}: contains medical claim term "${term}"`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}
