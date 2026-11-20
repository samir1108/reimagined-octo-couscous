import { describe, expect, it } from "vitest";
import {
  conceptSessionRoute,
  detectNeed,
  emptyConceptEvidenceMap,
  computeFamiliarity,
  type ConceptEvidence,
  type ConceptId,
  type NeedSignals,
} from "@/lib/needEngine";

function evidence(partial: Partial<ConceptEvidence> & { conceptId: ConceptId }): ConceptEvidence {
  const base = {
    conceptId: partial.conceptId,
    familiarity: 0,
    exposureCount: 0,
    practiceCount: 0,
    selfReport: 0,
    lastAt: null,
  };
  return { ...base, ...partial };
}

function signals(patch: Partial<NeedSignals> = {}): Partial<NeedSignals> {
  const concepts = { ...emptyConceptEvidenceMap(), ...(patch.concepts ?? {}) };
  const base: Partial<NeedSignals> = {
    activeLoops: [],
    stressedDomains: [],
    dimensionBands: {},
    overallBand: 0,
    energy: "medium",
    timeBudgetMin: 10,
    recentConceptIds: [],
    capabilityLevels: {},
  };
  return { ...base, ...patch, concepts };
}

describe("need engine", () => {
  it("orients a user who has never met observation", () => {
    const decision = detectNeed(signals());
    expect(decision.concept).toBe("observation");
    expect(decision.intent).toBe("orient");
    expect(decision.shape.minutes).toBeLessThanOrEqual(7);
    expect(decision.shape.teachRatio).toBeGreaterThanOrEqual(0.5);
    expect(decision.shape.steps[0].kind).toBe("teach");
    expect(decision.shape.steps).toHaveLength(5);
    expect(decision.evidence.length).toBeGreaterThanOrEqual(2);
    expect(decision.why).toContain("naya");
  });

  it("refuses neti-neti before observation is familiar", () => {
    const decision = detectNeed(signals(), {
      requested: ["neti_neti"],
    });
    expect(decision.concept).toBe("observation");
    expect(decision.intent).toBe("orient");
    expect(decision.evidence.join(" ")).toContain("prerequisite");
    expect(decision.ladder).toBe("observation");
  });

  it("allows neti-neti once observation and self-inquiry are familiar", () => {
    const decision = detectNeed(
      signals({
        concepts: {
          observation: evidence({
            conceptId: "observation",
            exposureCount: 3,
            practiceCount: 3,
            selfReport: 1,
            familiarity: 1,
          }),
          self_inquiry: evidence({
            conceptId: "self_inquiry",
            exposureCount: 2,
            practiceCount: 1,
            selfReport: 0.5,
            familiarity: 0.6,
          }),
        },
      }),
      { requested: ["neti_neti"] },
    );
    expect(decision.concept).toBe("neti_neti");
    expect(decision.ladder).toBe("neti_neti");
  });

  it("moves knowers who never sat to first contact", () => {
    const decision = detectNeed(
      signals({
        concepts: {
          observation: evidence({
            conceptId: "observation",
            exposureCount: 3,
            practiceCount: 0,
            selfReport: 0.5,
            familiarity: 0.55,
          }),
        },
      }),
      { requested: ["observation"] },
    );
    expect(decision.concept).toBe("observation");
    expect(decision.intent).toBe("first_contact");
    expect(decision.shape.depth).toBe("guided");
  });

  it("trains when familiar but not ready, integrates when ready", () => {
    const trained = detectNeed(
      signals({
        overallBand: 2,
        capabilityLevels: { observation: 1 },
        concepts: {
          observation: evidence({
            conceptId: "observation",
            exposureCount: 3,
            practiceCount: 3,
            selfReport: 1,
            familiarity: 1,
          }),
        },
      }),
      { requested: ["observation"] },
    );
    expect(trained.intent).toBe("train");

    const integrated = detectNeed(
      signals({
        overallBand: 8,
        capabilityLevels: { observation: 5 },
        concepts: {
          observation: evidence({
            conceptId: "observation",
            exposureCount: 3,
            practiceCount: 3,
            selfReport: 1,
            familiarity: 1,
          }),
        },
      }),
      { requested: ["observation"] },
    );
    expect(integrated.intent).toBe("integrate");
  });

  it("penalises a concept used in the last sessions", () => {
    const fresh = detectNeed(
      signals({
        concepts: {
          observation: evidence({ conceptId: "observation", familiarity: 0.2 }),
        },
      }),
      { requested: ["observation"] },
    );
    const repeated = detectNeed(
      signals({
        concepts: {
          observation: evidence({ conceptId: "observation", familiarity: 0.2 }),
        },
        recentConceptIds: ["observation"],
      }),
      { requested: ["observation"] },
    );
    expect(repeated.score).toBeLessThan(fresh.score);
  });

  it("is deterministic and routes to the real ladder", () => {
    const input = signals({
      concepts: {
        observation: evidence({ conceptId: "observation", familiarity: 0 }),
      },
    });
    const a = detectNeed(input);
    const b = detectNeed(input);
    expect(a).toEqual(b);
    expect(conceptSessionRoute(a)).toContain("/experience/observation/session");
    expect(conceptSessionRoute(a)).toContain("level=1");
  });

  it("computes familiarity conservatively", () => {
    expect(computeFamiliarity({ exposureCount: 3, practiceCount: 0, selfReport: 0 })).toBe(0.45);
    expect(computeFamiliarity({ exposureCount: 3, practiceCount: 3, selfReport: 1 })).toBe(1);
    expect(computeFamiliarity({})).toBe(0);
  });
});
