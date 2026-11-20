// Generates 40,000+ "deep" posts per batch. Default 3 batches (~120k) to
// keep build times reasonable; increase BATCHES for more.

import { LOOPS, LOOP_CATEGORIES, type LoopDefinition } from "./loops";
import { loopSlug } from "@/lib/seoUtils";
import type { BlogPost } from "./blogPosts";

const BATCHES = 3;
const PER_LOOP = 62; // ~652*62 = 40,424 per batch

function bullets(items: string[]): string {
  return items.map((i) => `- ${i}`).join("\n");
}

function deepToMarkdown(loop: LoopDefinition, batch: number, i: number): string {
  const cat = LOOP_CATEGORIES[loop.category];
  const lens = `deep-${(i % 16) + 1}`;
  const depth = (i % 10) + 1;
  return `> **${loop.id} · ${cat?.emoji ?? ""} ${cat?.label ?? loop.category} — Deep Batch ${batch + 1} · ${lens} · Depth ${depth}** — ${loop.description}

## What this loop actually is

${loop.description}. It is one of the ${LOOPS.length}+ behavioral loops mapped inside the HOPE engine, sitting in the **${cat?.label ?? loop.category}** family — *${cat?.description ?? ""}*. This deep entry (batch ${batch + 1}, index ${i}) explores the ${lens} dimension at depth ${depth}.

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
- **Batch:** ${batch + 1}
- **Index:** ${i}

## Why we built a library for this

Most people think they have *problems*. They don't. They have **unmet loops** — 1 to 3 patterns running for years, generating what looks like a problem. Name the loop precisely and the problem starts to dissolve. That is the whole thesis behind the [Loop Library](/loops) and the engine that powers HOPE.

— HOPE Deep Batch Atlas`;
}

export function deepBatchAsBlogPosts(): BlogPost[] {
  const publishedAt = "2025-01-06T00:00:00.000Z";
  const out: BlogPost[] = [];
  for (let b = 0; b < BATCHES; b++) {
    for (const loop of LOOPS) {
      const cat = LOOP_CATEGORIES[loop.category];
      const baseSlug = loopSlug(loop);
      for (let i = 0; i < PER_LOOP; i++) {
        const slug = `deep-b${b + 1}-${baseSlug}-i${i}`;
        out.push({
          slug,
          title: `${loop.name} — Deep Batch ${b + 1} · Index ${i} · ${loop.id}`,
          keyword: `${loop.keywords.join(", ")}, deep batch ${b + 1}`,
          pillar: `Deep Batch · ${cat?.label ?? loop.category}`,
          metaDescription: `${loop.description} Deep batch ${b + 1} exploration, index ${i}.`,
          content: deepToMarkdown(loop, b, i),
          publishedAt,
        } satisfies BlogPost);
      }
    }
  }
  return out;
}
