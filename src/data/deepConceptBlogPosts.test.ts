import { describe, it, expect } from "vitest";
import { deepConceptsAsBlogPosts } from "./deepConceptBlogPosts";

describe("deepConceptBlogPosts", () => {
  it("generates at least 10000 deep concept posts", () => {
    const posts = deepConceptsAsBlogPosts();
    expect(posts.length).toBeGreaterThanOrEqual(10000);
  });

  it("has unique, well-formed slugs", () => {
    const posts = deepConceptsAsBlogPosts();
    const slugs = new Set(posts.map((p) => p.slug));
    expect(slugs.size).toBe(posts.length);
    for (const s of slugs) {
      expect(s).toMatch(/^deepconcept-[a-z0-9-]+$/);
    }
  });

  it("produces renderable content with required fields", () => {
    const posts = deepConceptsAsBlogPosts();
    for (const p of posts.slice(0, 50)) {
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.pillar).toMatch(/^Deep Concepts - /);
      expect(p.content).toContain("## What this concept actually is");
      expect(p.metaDescription.length).toBeGreaterThan(20);
      expect(new Date(p.publishedAt).toString()).not.toBe("Invalid Date");
    }
  });
});
