// Generates 10,000+ additional blog posts ("mass atlas") by crossing every
// loop in the canonical LOOPS library with a set of practice lenses. This
// keeps /blog and the landing Journal section growing past 10,000 entries
// without bloating public/blog-posts.json.

import { LOOPS, LOOP_CATEGORIES, type LoopDefinition } from "./loops";
import { loopSlug } from "@/lib/seoUtils";
import type { BlogPost } from "./blogPosts";

const LENSES: { key: string; label: string; angle: string }[] = [
  { key: "recognition", label: "Recognition", angle: "how to recognize this loop in the first thirty seconds of it starting" },
  { key: "trigger", label: "Trigger", angle: "the smallest trigger that reliably sets this loop in motion" },
  { key: "body", label: "Body", angle: "where this loop lives in the body and how it announces itself physically" },
  { key: "mind", label: "Mind", angle: "the thought-pattern that keeps this loop self-sustaining" },
  { key: "shadow", label: "Shadow", angle: "the hidden payoff that keeps you returning to this loop" },
  { key: "relation", label: "Relation", angle: "how this loop reshapes your relationships when it is running" },
  { key: "work", label: "Work", angle: "how this loop shows up at work and in performance" },
  { key: "sleep", label: "Sleep", angle: "how this loop disturbs rest and what to do about it at night" },
  { key: "morning", label: "Morning", angle: "a two-minute morning practice that loosens this loop before the day begins" },
  { key: "evening", label: "Evening", angle: "an evening review that prevents this loop from carrying into tomorrow" },
  { key: "emergency", label: "Emergency", angle: "what to do in the first sixty seconds when this loop has already taken over" },
  { key: "longterm", label: "Long-Term", angle: "the ninety-day path from seeing this loop to being free of it" },
  { key: "childhood", label: "Childhood", angle: "the early origin most loops of this kind trace back to" },
  { key: "neuro", label: "Neuroscience", angle: "the neural circuitry this loop recruits and how to recruit a different one" },
  { key: "wisdom", label: "Wisdom", angle: "what the contemplative traditions say about this exact pattern" },
  { key: "integration", label: "Integration", angle: "how this loop integrates into a larger, healthier pattern when met with awareness" },
];

function bullets(items: string[]): string {
  return items.map((i) => `- ${i}`).join("\n");
}

function massToMarkdown(loop: LoopDefinition, lens: { key: string; label: string; angle: string }): string {
  const cat = LOOP_CATEGORIES[loop.category];
  return `> **${loop.id} · ${cat?.emoji ?? ""} ${cat?.label ?? loop.category} — ${lens.label} Lens** — ${loop.description}

## What this loop actually is

${loop.description}. It is one of the ${LOOPS.length}+ behavioral loops mapped inside the HOPE engine, sitting in the **${cat?.label ?? loop.category}** family — *${cat?.description ?? ""}*. This entry reads the loop through the **${lens.label}** lens: ${lens.angle}.

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
- **Lens:** ${lens.label} — ${lens.angle}

## Why we built a library for this

Most people think they have *problems*. They don't. They have **unmet loops** — 1 to 3 patterns running for years, generating what looks like a problem. Name the loop precisely and the problem starts to dissolve. That is the whole thesis behind the [Loop Library](/loops) and the engine that powers HOPE.

— HOPE Mass Atlas`;
}

export function massAsBlogPosts(): BlogPost[] {
  const publishedAt = "2025-01-03T00:00:00.000Z";
  const out: BlogPost[] = [];
  for (const loop of LOOPS) {
    const cat = LOOP_CATEGORIES[loop.category];
    const baseSlug = loopSlug(loop);
    for (const lens of LENSES) {
      const slug = `mass-${baseSlug}-${lens.key}`;
      out.push({
        slug,
        title: `${loop.name} — ${lens.label} Lens · ${loop.id} · The Mass Atlas`,
        keyword: `${loop.keywords.join(", ")}, ${lens.label.toLowerCase()}`,
        pillar: `Mass Atlas · ${cat?.label ?? loop.category}`,
        metaDescription: `${loop.description} Read through the ${lens.label.toLowerCase()} lens: ${lens.angle}.`,
        content: massToMarkdown(loop, lens),
        publishedAt,
      } satisfies BlogPost);
    }
  }
  return out;
}
