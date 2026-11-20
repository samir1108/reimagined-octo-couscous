import { describe, expect, it } from "vitest";
import { buildHumanModel, buildMemoryDigest, memoryDigestToMarkdown } from "@/lib/humanModel";

const NOW = new Date("2026-11-17T10:00:00Z");

describe("memory digest", () => {
  it("keeps one line per layer", () => {
    const model = buildHumanModel({
      userId: "u1",
      now: NOW,
      dimensionBands: { body: 4, thought: 6 },
      capabilityLevels: { observation: 2 },
      sessionCount: 5,
    });
    const digest = buildMemoryDigest(model);
    expect(digest.entries).toHaveLength(12);
    expect(digest.entries.find((entry) => entry.layer === "thought")?.evidenceCount).toBeGreaterThan(0);
    expect(digest.entries.find((entry) => entry.layer === "environment")?.line).toContain(
      "no evidence yet",
    );
  });

  it("exports a digest with the disclaimer", () => {
    const digest = buildMemoryDigest(buildHumanModel({ userId: "u1", now: NOW }));
    const md = memoryDigestToMarkdown(digest);
    expect(md).toContain("# Memory digest");
    expect(md).toContain("not a medical prediction");
  });
});
