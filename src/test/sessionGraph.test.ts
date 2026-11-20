import { describe, expect, it } from "vitest";
import {
  buildSessionGraph,
  conceptForGap,
  findGaps,
  generateSession,
  graphStats,
  nextSessionPreview,
  prerequisitePath,
  type GraphSignals,
} from "@/lib/sessionGraph";

const graph = buildSessionGraph();

function signals(patch: Partial<GraphSignals> = {}): GraphSignals {
  return {
    familiarity: {},
    capabilityLevels: {},
    activeLoops: [],
    stressedDomains: [],
    domainScores: {},
    ...patch,
  };
}

describe("session graph", () => {
  it("assembles a connected graph from existing catalogs", () => {
    const stats = graphStats(graph);
    expect(stats.nodes).toBeGreaterThan(100);
    expect(stats.edges).toBeGreaterThan(50);
    expect(stats.byKind.concept).toBeGreaterThanOrEqual(10);
    expect(stats.byKind.capability).toBeGreaterThan(40);
    expect(stats.byKind.arc).toBe(6);
    expect(stats.byKind.claim).toBe(45);
  });

  it("keeps prerequisite order for neti-neti", () => {
    expect(prerequisitePath(graph, "neti_neti")).toEqual([
      "observation",
      "self_inquiry",
      "neti_neti",
    ]);
  });

  it("keeps cross-path prerequisites", () => {
    expect(prerequisitePath(graph, "jnana")).toEqual([
      "observation",
      "self_inquiry",
      "jnana",
    ]);
    expect(prerequisitePath(graph, "raja")).toEqual(["body", "breath", "raja"]);
  });

  it("maps loops, domains, and capabilities to concepts", () => {
    expect(
      conceptForGap(graph, {
        kind: "loop_family",
        id: "validation",
        label: "Validation",
        severity: 0.8,
        evidence: [],
      }),
    ).toBe("self_inquiry");

    expect(
      conceptForGap(graph, {
        kind: "domain",
        id: "health",
        label: "Health",
        severity: 0.7,
        evidence: [],
      }),
    ).toBe("body");

    expect(
      conceptForGap(graph, {
        kind: "capability",
        id: "cap_in_observation",
        label: "Observation",
        severity: 0.5,
        evidence: [],
      }),
    ).toBe("observation");
  });

  it("puts a brand-new user on observation first", () => {
    const gaps = findGaps(graph, signals());
    expect(gaps[0].id).toBe("observation");
  });

  it("generates a short orientation for a new user", () => {
    const spec = generateSession(graph, signals());
    expect(spec.concept).toBe("observation");
    expect(spec.intent).toBe("orient");
    expect(spec.minutes).toBeLessThanOrEqual(6);
    expect(spec.arcId).toBe("observer");
    expect(spec.claimIds.length).toBeGreaterThan(0);
    expect(spec.steps[0].kind).toBe("teach");
    expect(spec.steps).toHaveLength(5);
    expect(spec.why).toBeTruthy();
  });

  it("respects a hard time ceiling", () => {
    const spec = generateSession(graph, signals(), { maxMinutes: 4 });
    expect(spec.minutes).toBeLessThanOrEqual(4);
  });

  it("uses an active loop when the concept is not otherwise weak", () => {
    const spec = generateSession(
      graph,
      signals({
        familiarity: { observation: 0.9, self_inquiry: 0.9, neti_neti: 0.9, body: 0.9, breath: 0.9, witness: 0.9, bhakti: 0.9, jnana: 0.9, karma: 0.1, raja: 0.9 },
        activeLoops: ["avoidance"],
      }),
    );
    expect(spec.concept).toBe("karma");
  });

  it("generates a training session when everything is familiar", () => {
    const familiarity = {
      observation: 0.9,
      self_inquiry: 0.9,
      neti_neti: 0.9,
      body: 0.9,
      breath: 0.9,
      witness: 0.9,
      bhakti: 0.9,
      jnana: 0.9,
      karma: 0.9,
      raja: 0.9,
    };
    const levels = Object.fromEntries(Object.keys(familiarity).map((k) => [k, 5]));
    const spec = generateSession(graph, signals({ familiarity, capabilityLevels: levels }));
    expect(spec.intent).toBe("train");
    expect(spec.steps[1].title).toBe("The practice");
  });

  it("is deterministic and previews the next sitting", () => {
    const input = signals({
      familiarity: { observation: 0.1 },
      activeLoops: ["rumination"],
    });
    expect(generateSession(graph, input)).toEqual(generateSession(graph, input));
    expect(nextSessionPreview(generateSession(graph, input))).toContain("Next:");
  });
});
