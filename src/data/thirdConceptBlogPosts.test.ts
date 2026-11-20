import { describe, it, expect } from "vitest";
import { thirdConceptsAsBlogPosts } from "./thirdConceptBlogPosts";

describe("thirdConceptBlogPosts", () => {
  it("generates at least 10000 third concept posts", () => {
    const posts = thirdConceptsAsBlogPosts();
    expect(posts.length).toBeGreaterThanOrEqual(10000);
  });

  it("has unique, well-formed slugs", () => {
    const posts = thirdConceptsAsBlogPosts();
    const slugs = new Set(posts.map((p) => p.slug));
    expect(slugs.size).toBe(posts.length);
    for (const s of slugs) {
      expect(s).toMatch(/^thirdconcept-[a-z0-9-]+$/);
    }
  });

  it("produces renderable content with required fields", () => {
    const posts = thirdConceptsAsBlogPosts();
    for (const p of posts.slice(0, 50)) {
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.pillar).toMatch(/^Third Concepts - /);
      expect(p.content).toContain("## What this concept actually is");
      expect(p.metaDescription.length).toBeGreaterThan(20);
      expect(new Date(p.publishedAt).toString()).not.toBe("Invalid Date");
    }
  });
});
