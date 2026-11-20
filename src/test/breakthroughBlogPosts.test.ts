import { describe, it, expect, vi, beforeAll } from "vitest";
import { breakthroughsAsBlogPosts } from "@/data/breakthroughBlogPosts";
import { GENERATED_BREAKTHROUGHS } from "@/data/breakthroughs.generated";
import { loadBlogPosts } from "@/data/blogPosts";

describe("breakthroughBlogPosts", () => {
  it("generates one post per generated breakthrough", () => {
    const posts = breakthroughsAsBlogPosts();
    expect(GENERATED_BREAKTHROUGHS.length).toBe(1000);
    expect(posts.length).toBe(1000);
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
    for (const p of breakthroughsAsBlogPosts()) {
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.pillar).toMatch(/^Breakthroughs · /);
      expect(p.content.split(/\n\s*\n/).length).toBeGreaterThanOrEqual(6);
      expect(p.content).toContain("## What this breakthrough actually is");
      expect(p.metaDescription.length).toBeGreaterThan(20);
      expect(new Date(p.publishedAt).toString()).not.toBe("Invalid Date");
    }
  });

  describe("merged into the blog feed", () => {
    beforeAll(() => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) })
      );
    });

    it("surfaces 1000+ extra posts on /blog and the landing Journal section", async () => {
      const merged = await loadBlogPosts();
      const breakthroughPosts = merged.filter((p) => p.slug.startsWith("breakthrough-"));
      expect(breakthroughPosts.length).toBe(1000);
      expect(merged.length).toBeGreaterThanOrEqual(1000);
    });
  });
});
