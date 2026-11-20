// Generates 100,000+ blog posts by crossing every loop with 16 lenses × 10
// depth levels. Keeps /blog growing past 100,000 entries.

import { LOOPS, LOOP_CATEGORIES, type LoopDefinition } from "./loops";
import { loopSlug } from "@/lib/seoUtils";
import type { BlogPost } from "./blogPosts";

const LENSES = ["recognition","trigger","body","mind","shadow","relation","work","sleep","morning","evening","emergency","longterm","childhood","neuro","wisdom","integration"];
const DEPTHS = [1,2,3,4,5,6,7,8,9,10];

function bullets(items: string[]): string {
  return items.map((i) => `- ${i}`).join("\n");
}

function scaleToMarkdown(loop: LoopDefinition, lens: string, depth: number): string {
  const cat = LOOP_CATEGORIES[loop.category];
  return `> **${loop.id} · ${cat?.emoji ?? ""} ${cat?.label ?? loop.category} — ${lens} · Depth ${depth}** — ${loop.description}

## What this loop actually is

${loop.description}. It is one of the ${LOOPS.length}+ behavioral loops mapped inside the HOPE engine, sitting in the **${cat?.label ?? loop.category}** family — *${cat?.description ?? ""}*. This entry explores the **${lens}** dimension at depth level ${depth} of 10.

You are not the loop. You are the awareness that can see it. But until you see it, the loop runs you.

## How it shows up in daily life

${bullets(loop.manifestations)}

## What sets it off

${bullets(loop.triggers)}

## Awareness markers — how to catch yourself inside it

${bullets(loop.awareness_markers)}

## The dissolution path

**${loop.dissolution_path}.**

This is the small, concrete move that begins to interrupt the loop. Not a fix. Not a cure. An interruption. Do it once and notice. Do it daily and the loop loses its grip. At depth ${depth}, the practice is ${depth === 1 ? "simply noticing" : "returning to the noticing after " + (depth - 1) + " distractions"}.

## Where it lives in the body and the system

- **Dimension:** ${loop.related_dimension}
- **Chakra resonance:** ${loop.related_chakra.replace(/_/g, " ")}
- **Default intensity:** ${loop.severity_default}
- **Sub-pattern:** ${loop.subcategory}
- **Lens:** ${lens}
- **Depth:** ${depth}/10

## Why we built a library for this

Most people think they have *problems*. They don't. They have **unmet loops** — 1 to 3 patterns running for years, generating what looks like a problem. Name the loop precisely and the problem starts to dissolve. That is the whole thesis behind the [Loop Library](/loops) and the engine that powers HOPE.

— HOPE Scale Atlas`;
}

export function scaleAsBlogPosts(): BlogPost[] {
  const publishedAt = "2025-01-05T00:00:00.000Z";
  const out: BlogPost[] = [];
  for (const loop of LOOPS) {
    const cat = LOOP_CATEGORIES[loop.category];
    const baseSlug = loopSlug(loop);
    for (const lens of LENSES) {
      for (const depth of DEPTHS) {
        const slug = `scale-${baseSlug}-${lens}-d${depth}`;
        out.push({
          slug,
          title: `${loop.name} — ${lens} · Depth ${depth} · ${loop.id} · The Scale Atlas`,
          keyword: `${loop.keywords.join(", ")}, ${lens}, depth ${depth}`,
          pillar: `Scale · ${cat?.label ?? loop.category}`,
          metaDescription: `${loop.description} Explored through the ${lens} lens at depth ${depth}.`,
          content: scaleToMarkdown(loop, lens, depth),
          publishedAt,
        } satisfies BlogPost);
      }
    }
  }
  return out;
}
