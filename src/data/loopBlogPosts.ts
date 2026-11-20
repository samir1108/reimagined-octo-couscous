// Generates one blog post per loop from the canonical LOOPS library.
// This keeps `/blog` in sync with the 600+ loops in `src/data/loops.ts`
// without bloating `public/blog-posts.json`.

import { LOOPS, LOOP_CATEGORIES, type LoopDefinition } from "./loops";
import { loopSlug } from "@/lib/seoUtils";
import type { BlogPost } from "./blogPosts";

function bullets(items: string[]): string {
  return items.map((i) => `- ${i}`).join("\n");
}

function loopToMarkdown(loop: LoopDefinition): string {
  const cat = LOOP_CATEGORIES[loop.category];
  return `> **${loop.id} · ${cat?.emoji ?? ""} ${cat?.label ?? loop.category}** — ${loop.description}

## What this loop actually is

${loop.description}. It is one of the ${LOOPS.length}+ behavioral loops mapped inside the HOPE engine, sitting in the **${cat?.label ?? loop.category}** family — *${cat?.description ?? ""}*.

You are not the loop. You are the awareness that can see it. But until you see it, the loop runs you.

## How it shows up in daily life

${bullets(loop.manifestations)}

## What sets it off

${bullets(loop.triggers)}

## Awareness markers — how to catch yourself inside it

${bullets(loop.awareness_markers)}

## The dissolution path

**${loop.dissolution_path}.**

This is the small, concrete move that begins to interrupt the loop. Not a fix. Not a cure. An interruption. Do it once and notice. Do it daily and the loop loses its grip.

## Where it lives in the body and the system

- **Dimension:** ${loop.related_dimension}
- **Chakra resonance:** ${loop.related_chakra.replace(/_/g, " ")}
- **Default intensity:** ${loop.severity_default}
- **Sub-pattern:** ${loop.subcategory}

## Why we built a library for this

Most people think they have *problems*. They don't. They have **unmet loops** — 1 to 3 patterns running for years, generating what looks like a problem. Name the loop precisely and the problem starts to dissolve. That is the whole thesis behind the [Loop Library](/loops) and the engine that powers HOPE.

— HOPE Loop Atlas`;
}

export function loopsAsBlogPosts(): BlogPost[] {
  // Stable, dateless ISO so they don't churn the feed every day.
  const publishedAt = "2025-01-01T00:00:00.000Z";
  return LOOPS.map((loop) => {
    const cat = LOOP_CATEGORIES[loop.category];
    const slug = `loop-${loopSlug(loop)}`;
    const content = loopToMarkdown(loop);
    return {
      slug,
      title: `${loop.name} — ${loop.id} · The Loop Atlas`,
      keyword: loop.keywords.join(", "),
      pillar: `Loops · ${cat?.label ?? loop.category}`,
      metaDescription: `${loop.description}. Triggers, manifestations, awareness markers, and the dissolution path for the ${loop.name} loop (${loop.id}).`,
      content,
      publishedAt,
    } satisfies BlogPost;
  });
}
