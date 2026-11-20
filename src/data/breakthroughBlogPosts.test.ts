import { describe, it, expect } from "vitest";
import { breakthroughsAsBlogPosts } from "./breakthroughBlogPosts";
import { GENERATED_BREAKTHROUGHS } from "./breakthroughs.generated";

describe("breakthroughBlogPosts", () => {
  it("generates one post per generated breakthrough", () => {
    const posts = breakthroughsAsBlogPosts();
    expect(GENERATED_BREAKTHROUGHS.length).toBeGreaterThanOrEqual(1000);
    expect(posts.length).toBe(GENERATED_BREAKTHROUGHS.length);
  });

  it("has unique, well-formed slugs", () => {
    const posts = breakthroughsAsBlogPosts();
    const slugs = new Set(posts.map((p) => p.slug));
    expect(slugs.size).toBe(posts.length);
    for (const s of slugs) {
      expect(s).toMatch(/^breakthrough-[a-z0-9-]+-btg\d+$/);
    }
  });

  it("produces renderable content with required fields", () => {
    const posts = breakthroughsAsBlogPosts();
    for (const p of posts) {
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.pillar).toMatch(/^Breakthroughs · /);
      expect(p.content.split(/\n\s*\n/).length).toBeGreaterThanOrEqual(6);
      expect(p.content).toContain("## What this breakthrough actually is");
      expect(p.metaDescription.length).toBeGreaterThan(20);
      expect(new Date(p.publishedAt).toString()).not.toBe("Invalid Date");
    }
  });
});
