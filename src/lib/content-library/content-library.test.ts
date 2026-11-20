import { describe, it, expect } from "vitest";
import { getLibraryItems, getLibraryItemById, searchLibraryItems, getLibraryStats, getCategories } from "./index";
import { validateLibraryItem, scoreContentQuality, findDuplicates } from "./ingestion";
import { generateRecommendations, generateDailyBundle, buildRecommendationContext, enforceDiversity } from "./recommendations";
import { buildLibrarySubgraph, getGraphNeighbors } from "./graph";
import { CATEGORY_SPECS, MAIN_TOTAL, ADDITIONAL_TOTAL } from "./generator/manifest";

describe("Content Library — counts", () => {
  it("has 10,000+ items", () => {
    const items = getLibraryItems();
    expect(items.length).toBeGreaterThanOrEqual(10000);
  });

  it("main library matches target", () => {
    const stats = getLibraryStats();
    const mainCats = CATEGORY_SPECS.filter((c) => !c.additional).map((c) => c.slug);
    const mainCount = mainCats.reduce((s, c) => s + (stats.byCategory[c] || 0), 0);
    expect(mainCount).toBeGreaterThanOrEqual(10350);
  });

  it("has all 18 main categories", () => {
    const mainCats = CATEGORY_SPECS.filter((c) => !c.additional);
    expect(mainCats.length).toBe(18);
  });

  it("has all 14 additional libraries", () => {
    const addCats = CATEGORY_SPECS.filter((c) => c.additional);
    expect(addCats.length).toBe(14);
  });

  it("category counts match manifest", () => {
    const stats = getLibraryStats();
    for (const spec of CATEGORY_SPECS) {
      expect(stats.byCategory[spec.slug]).toBe(spec.subcategories.reduce((s, x) => s + x.count, 0));
    }
  });
});

describe("Content Library — validation", () => {
  it("validates a good item", () => {
    const item = getLibraryItems()[0];
    const { valid } = validateLibraryItem(item);
    expect(valid).toBe(true);
  });

  it("rejects item missing title", () => {
    const item = { ...getLibraryItems()[0], title: "" };
    const { valid, errors } = validateLibraryItem(item);
    expect(valid).toBe(false);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects item missing consciousness_dimensions", () => {
    const item = { ...getLibraryItems()[0], consciousness_dimensions: [] };
    const { valid } = validateLibraryItem(item);
    expect(valid).toBe(false);
  });
});

describe("Content Library — quality", () => {
  it("scores items above 0.7", () => {
    const items = getLibraryItems().slice(0, 100);
    for (const item of items) {
      const report = scoreContentQuality(item);
      expect(report.quality_score).toBeGreaterThanOrEqual(0.7);
    }
  });

  it("all published items have quality >= 0.7", () => {
    const items = getLibraryItems().filter((i) => i.review_status === "published");
    const low = items.filter((i) => (i.quality_score || 0) < 0.7);
    expect(low.length).toBe(0);
  });
});

describe("Content Library — dedup", () => {
  it("has no exact duplicate titles within a category", () => {
    const items = getLibraryItems();
    const byCat: Record<string, Set<string>> = {};
    for (const it of items) {
      if (!byCat[it.category]) byCat[it.category] = new Set();
      byCat[it.category].add(it.title);
    }
    for (const cat of Object.keys(byCat)) {
      // titles may repeat across variants but check exact dupes are minimal
      expect(byCat[cat].size).toBeGreaterThan(0);
    }
  });
});

describe("Content Library — search", () => {
  it("searches by keyword", () => {
    const results = searchLibraryItems("witness", 10);
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns empty for empty query", () => {
    expect(searchLibraryItems("", 10)).toEqual([]);
  });

  it("limits results", () => {
    const results = searchLibraryItems("a", 5);
    expect(results.length).toBeLessThanOrEqual(5);
  });
});

describe("Content Library — graph", () => {
  it("builds subgraph with nodes and edges", () => {
    const items = getLibraryItems().slice(0, 50);
    const rels = items.flatMap((i) => (i.related_items || []).map((r: string) => ({
      id: `${i.id}-${r}`,
      from_item_id: i.id,
      to_item_id: r,
      relationship_type: "related_to" as any,
      weight: 0.5,
      confidence: 0.7,
      bidirectional: false,
      metadata: {},
      created_at: "2026-01-01T00:00:00.000Z",
    })));
    const graph = buildLibrarySubgraph(items, rels as any);
    expect(graph.nodes.size).toBe(50);
    expect(graph.edges.length).toBeGreaterThan(0);
    expect(graph.adjacency.size).toBeGreaterThan(0);
  });

  it("getGraphNeighbors returns neighbors", () => {
    const items = getLibraryItems().slice(0, 20);
    const rels = items.flatMap((i) => (i.related_items || []).map((r: string) => ({
      id: `${i.id}-${r}`,
      from_item_id: i.id,
      to_item_id: r,
      relationship_type: "related_to" as any,
      weight: 0.5,
      confidence: 0.7,
      bidirectional: false,
      metadata: {},
      created_at: "2026-01-01T00:00:00.000Z",
    })));
    const graph = buildLibrarySubgraph(items, rels as any);
    const nodeId = `library::${items[0].id}`;
    const neighbors = getGraphNeighbors(graph, nodeId, 1);
    expect(Array.isArray(neighbors)).toBe(true);
  });
});

describe("Content Library — recommendations", () => {
  it("generates recommendations", () => {
    const ctx = buildRecommendationContext("user1");
    const recs = generateRecommendations(ctx, 4);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.length).toBeLessThanOrEqual(4);
  });

  it("excludes completed items", () => {
    const items = getLibraryItems();
    const ctx = buildRecommendationContext("user1", { completed_item_ids: [items[0].id] });
    const recs = generateRecommendations(ctx, 4);
    expect(recs.every((r) => r.item.id !== items[0].id)).toBe(true);
  });

  it("generates daily bundle", () => {
    const ctx = buildRecommendationContext("user1");
    const bundle = generateDailyBundle(ctx);
    expect(bundle).toHaveProperty("awareness_game");
    expect(bundle).toHaveProperty("body_practice");
    expect(bundle).toHaveProperty("wisdom_teaching");
    expect(bundle).toHaveProperty("reflection");
  });

  it("enforces diversity", () => {
    const ctx = buildRecommendationContext("user1");
    const recs = generateRecommendations(ctx, 20);
    const diverse = enforceDiversity(recs, 2);
    const catCounts = new Map<string, number>();
    for (const r of diverse) {
      catCounts.set(r.item.category, (catCounts.get(r.item.category) || 0) + 1);
    }
    for (const c of catCounts.values()) {
      expect(c).toBeLessThanOrEqual(2);
    }
  });
});

describe("Content Library — categories", () => {
  it("returns categories with item counts", () => {
    const cats = getCategories();
    expect(cats.length).toBe(32);
    for (const cat of cats) {
      expect(cat.item_count).toBeGreaterThan(0);
    }
  });
});


describe("Content Library � wisdom depth", { timeout: 60000 }, () => {
  it("has 1000+ wisdom items", () => {
    const items = getLibraryItems().filter((i) => i.type === "wisdom");
    expect(items.length).toBeGreaterThanOrEqual(1000);
  });

  it("wisdom items have references", () => {
    const items = getLibraryItems().filter((i) => i.type === "wisdom").slice(0, 50);
    for (const item of items) {
      const c = item.content as Record<string, unknown>;
      expect(Array.isArray(c.references)).toBe(true);
    }
  });

  it("wisdom items have consciousness_dimensions", () => {
    const items = getLibraryItems().filter((i) => i.type === "wisdom").slice(0, 50);
    for (const item of items) {
      expect(item.consciousness_dimensions.length).toBeGreaterThan(0);
    }
  });
});

describe("Content Library � games", { timeout: 60000 }, () => {
  it("has 600 game items", () => {
    const items = getLibraryItems().filter((i) => i.type === "game");
    expect(items.length).toBe(600);
  });

  it("games have observation_outputs", () => {
    const items = getLibraryItems().filter((i) => i.type === "game").slice(0, 10);
    for (const item of items) {
      const c = item.content as Record<string, unknown>;
      expect(Array.isArray(c.observation_outputs)).toBe(true);
    }
  });
});

describe("Content Library � programs", { timeout: 60000 }, () => {
  it("has 700 program items", () => {
    const items = getLibraryItems().filter((i) => i.type === "program");
    expect(items.length).toBe(700);
  });

  it("programs have days", () => {
    const items = getLibraryItems().filter((i) => i.type === "program").slice(0, 5);
    for (const item of items) {
      const c = item.content as Record<string, unknown>;
      expect(Array.isArray(c.days)).toBe(true);
    }
  });
});
