// Generates 10,000+ predictive-analysis blog posts: each loop read as a
// predictive signal of a user's traits (what shows up just by observing them).
// Mirrors the mass-atlas pattern so /blog keeps growing past 20,000 entries.

import { LOOPS, LOOP_CATEGORIES, type LoopDefinition } from "./loops";
import { loopSlug } from "@/lib/seoUtils";
import type { BlogPost } from "./blogPosts";

const LENSES: { key: string; label: string; angle: string }[] = [
  { key: "gait", label: "Gait", angle: "what a person's walk predicts about the loop running underneath" },
  { key: "gaze", label: "Gaze", angle: "what eye-contact patterns predict about this user's inner state" },
  { key: "speech", label: "Speech", angle: "what speech rate and filler words predict about this trait" },
  { key: "posture", label: "Posture", angle: "what body posture predicts about which loop is dominant" },
  { key: "breath", label: "Breath", angle: "what breathing rhythm predicts about reactivity and band" },
  { key: "micro", label: "Micro-Expression", angle: "what a 200ms micro-expression predicts about the loop" },
  { key: "voice", label: "Voice Tone", angle: "what vocal tone predicts about emotional load" },
  { key: "sleepsig", label: "Sleep Signal", angle: "what sleep markers predict about this user's loop intensity" },
  { key: "digital", label: "Digital Footprint", angle: "what screen and typing patterns predict about the loop" },
  { key: "social", label: "Social Signal", angle: "what reply latency and message length predict about the trait" },
  { key: "decision", label: "Decision Signal", angle: "what choice patterns predict about the user's band" },
  { key: "stress", label: "Stress Marker", angle: "what stress biomarkers predict about loop activation" },
  { key: "energy", label: "Energy", angle: "what daily energy curve predicts about this trait" },
  { key: "relation", label: "Relational", angle: "what relationship behavior predicts about the underlying loop" },
  { key: "recovery", label: "Recovery", angle: "what recovery speed after a trigger predicts about the user" },
  { key: "longitudinal", label: "Longitudinal", angle: "what thirty days of data predict about this user's trajectory" },
];

function bullets(items: string[]): string {
  return items.map((i) => `- ${i}`).join("\n");
}

function predToMarkdown(loop: LoopDefinition, lens: { key: string; label: string; angle: string }): string {
  const cat = LOOP_CATEGORIES[loop.category];
  return `> **${loop.id} · ${cat?.emoji ?? ""} ${cat?.label ?? loop.category} — Predictive ${lens.label} Analysis** — ${loop.description}

## What this loop actually is

${loop.description}. It is one of the ${LOOPS.length}+ behavioral loops mapped inside the HOPE engine, sitting in the **${cat?.label ?? loop.category}** family — *${cat?.description ?? ""}*. This entry treats the loop as a **predictive trait signal**: ${lens.angle}.

You are not the loop. You are the awareness that can see it. But until you see it, the loop runs you.

## How it shows up in daily life

${bullets(loop.manifestations)}

## What sets it off

${bullets(loop.triggers)}

## Awareness markers — how to catch yourself inside it

${bullets(loop.awareness_markers)}

## Predictive read

When this loop is dominant, the **${lens.label}** signal shifts measurably: ${lens.angle}. Observing that shift is the first step of predictive analysis — not to label the person, but to offer the right mirror at the right moment. The engine uses this signal to time interventions, never to judge.

## The dissolution path

**${loop.dissolution_path}.**

This is the small, concrete move that begins to interrupt the loop. Not a fix. Not a cure. An interruption. Do it once and notice. Do it daily and the loop loses its grip.

## Where it lives in the body and the system

- **Dimension:** ${loop.related_dimension}
- **Chakra resonance:** ${loop.related_chakra.replace(/_/g, " ")}
- **Default intensity:** ${loop.severity_default}
- **Sub-pattern:** ${loop.subcategory}
- **Predictive lens:** ${lens.label} — ${lens.angle}

## Why we built a library for this

Most people think they have *problems*. They don't. They have **unmet loops** — 1 to 3 patterns running for years, generating what looks like a problem. Name the loop precisely and the problem starts to dissolve. Predictive analysis only works when the underlying pattern is named. That is the whole thesis behind the [Loop Library](/loops) and the engine that powers HOPE.

— HOPE Predictive Atlas`;
}

export function predictiveAsBlogPosts(): BlogPost[] {
  const publishedAt = "2025-01-04T00:00:00.000Z";
  const out: BlogPost[] = [];
  for (const loop of LOOPS) {
    const cat = LOOP_CATEGORIES[loop.category];
    const baseSlug = loopSlug(loop);
    for (const lens of LENSES) {
      const slug = `pred-${baseSlug}-${lens.key}`;
      out.push({
        slug,
        title: `${loop.name} — Predictive ${lens.label} · ${loop.id} · The Predictive Atlas`,
        keyword: `${loop.keywords.join(", ")}, predictive ${lens.label.toLowerCase()}, user traits`,
        pillar: `Predictive · ${cat?.label ?? loop.category}`,
        metaDescription: `${loop.description} Predictive ${lens.label.toLowerCase()} analysis of the user traits this loop reveals.`,
        content: predToMarkdown(loop, lens),
        publishedAt,
      } satisfies BlogPost);
    }
  }
  return out;
}
