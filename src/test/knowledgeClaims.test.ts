import { describe, expect, it } from "vitest";
import {
  ALL_CLAIMS,
  claimCountBySection,
  claimText,
  claimsByConcept,
  claimsBySection,
  getClaim,
  resolveClaimsForSession,
  validateClaims,
} from "@/lib/knowledge";

describe("knowledge claims", () => {
  it("ships a substantial catalog", () => {
    expect(ALL_CLAIMS.length).toBeGreaterThanOrEqual(40);
  });

  it("validates: unique ids, evidence, confidence, no medical claims", () => {
    const result = validateClaims();
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("covers at least ten landing sections", () => {
    const sections = Object.keys(claimCountBySection());
    expect(sections.length).toBeGreaterThanOrEqual(10);
  });

  it("keeps every claim resolvable by id", () => {
    for (const claim of ALL_CLAIMS) {
      expect(getClaim(claim.id)?.id).toBe(claim.id);
      expect(claimText(claim.id, "short")).toBe(claim.short);
    }
  });

  it("has claims for observation and self-inquiry", () => {
    expect(claimsByConcept("observation").length).toBeGreaterThan(0);
    expect(claimsByConcept("self_inquiry").length).toBeGreaterThan(0);
  });

  it("resolves session claims by concept, practice, or section", () => {
    const byConcept = resolveClaimsForSession({ concept: "observation", limit: 2 });
    expect(byConcept.length).toBeGreaterThan(0);
    expect(byConcept[0].confidence).toBeGreaterThanOrEqual(
      byConcept[byConcept.length - 1].confidence,
    );

    const bySection = resolveClaimsForSession({ section: "session_system", limit: 3 });
    expect(bySection.length).toBe(3);
    expect(bySection.every((c) => c.section === "session_system")).toBe(true);
  });

  it("keeps the product claims verified", () => {
    const sessionClaims = claimsBySection("session_system");
    expect(sessionClaims.length).toBeGreaterThanOrEqual(4);
    expect(sessionClaims.every((c) => c.reviewStatus === "verified")).toBe(true);
  });
});
