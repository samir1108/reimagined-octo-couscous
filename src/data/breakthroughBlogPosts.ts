// Generates one blog post per generated breakthrough from the canonical
// breakthrough catalog (src/data/breakthroughs.generated.ts). Mirrors the
// pattern in loopBlogPosts.ts so the 1000 generated breakthroughs surface
// on the landing Journal section and /blog without bloating
// public/blog-posts.json.

import { GENERATED_BREAKTHROUGHS } from "./breakthroughs.generated";
import { slugify } from "@/lib/seoUtils";
import type { BlogPost } from "./blogPosts";

interface GeneratedBreakthrough {
  id: string;
  name: string;
  emoji: string;
  description: string;
  keywords: string[];
  category: string;
  rarity: string;
  karmaPoints: number;
}

interface CategoryMeta {
  label: string;
  family: string;
  invitation: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  awareness: {
    label: "Awareness",
    family:
      "the **Awareness** family — breakthroughs that happen the instant you catch the mind mid-move and step out of automation into witnessing",
    invitation:
      "Pick one ordinary moment today — pouring tea, opening a door, the first ring of a phone — and arrive two seconds early. Watch the movement begin before you are inside it. That gap is where this breakthrough lives.",
  },
  emotional: {
    label: "Emotional",
    family:
      "the **Emotional** family — breakthroughs where a feeling is allowed to move through cleanly, without suppression, dramatization, or story",
    invitation:
      "Next time a strong feeling arrives, drop the narration for sixty seconds. Locate it in the body, let it be exactly as intense as it is, and keep breathing. Feeling without story is the doorway.",
  },
  pattern: {
    label: "Pattern",
    family:
      "the **Pattern** family — breakthroughs that interrupt a long-running loop at the moment it would normally take over",
    invitation:
      "Name your pattern out loud the next time it starts. Not to fight it — naming alone creates a sliver of distance. Then do one small thing the pattern would never do.",
  },
  relational: {
    label: "Relational",
    family:
      "the **Relational** family — breakthroughs of truth, boundaries, and vulnerability in the presence of another person",
    invitation:
      "Choose one person and one unsaid sentence. Say it plainly, without preface or apology-stack, and stay present for what comes back. Relational breakthroughs only happen in the open.",
  },
  somatic: {
    label: "Somatic",
    family:
      "the **Somatic** family — breakthroughs read directly through the body: breath, tension, movement, and the signals beneath thought",
    invitation:
      "Scan the body once and find the loudest sensation. Instead of fixing it, ask what it is communicating — then answer with an action the body recognizes: a long exhale, a shake, a slow stretch.",
  },
  existential: {
    label: "Existential",
    family:
      "the **Existential** family — breakthroughs of meaning, impermanence, mortality, and the dissolving of the separate self",
    invitation:
      "Sit with one unanswerable question — why anything exists, what death is, who is watching your thoughts — and resist resolving it. Let the question do its work. These breakthroughs ripen in the unresolved.",
  },
  integration: {
    label: "Integration",
    family:
      "the **Integration** family — breakthroughs where head, heart, and gut stop arguing and a fragmented part of you becomes whole",
    invitation:
      "Take one decision you keep reopening and check all three centers: what does the head think, the heart feel, the gut know? Write all three answers without editing. Agreement, when it comes, is the breakthrough.",
  },
};

const RARITY_NOTE: Record<string, string> = {
  common: "Common — most practitioners touch this within their first weeks of real practice.",
  uncommon:
    "Uncommon — this one asks for a slightly deeper level of honesty or sensitivity than the everyday breakthroughs.",
  rare: "Rare — the engine sees this only when awareness has become unusually steady.",
  epic: "Epic — a marker of sustained practice; most people meet this after months of daily work.",
  legendary:
    "Legendary — a once-in-a-journey event. The engine awards it accordingly, and it usually marks a genuine change of band.",
};

function signalPhrases(bt: GeneratedBreakthrough): string[] {
  const clean = bt.keywords.filter((k) => k.length >= 5).slice(0, 4);
  return clean.length > 0 ? clean : bt.keywords.slice(0, 3);
}

function breakthroughToMarkdown(bt: GeneratedBreakthrough): string {
  const meta = CATEGORY_META[bt.category] ?? {
    label: bt.category,
    family: `the **${bt.category}** family of the breakthrough catalog`,
    invitation:
      "Slow the moment down and watch it from the beginning. Every breakthrough starts as an ordinary moment seen completely.",
  };
  const rarityLabel = bt.rarity.charAt(0).toUpperCase() + bt.rarity.slice(1);
  const signals = signalPhrases(bt)
    .map((k) => `*${k}*`)
    .join(", ");

  return `> **${bt.id} · ${bt.emoji} ${meta.label}** — ${bt.description}

## What this breakthrough actually is

${bt.description}. It is one of the 1000+ breakthrough moments mapped inside the HOPE engine, sitting in ${meta.family}.

A breakthrough is not an achievement. It is a recognition — something that was always available becomes *noticed*, and the noticing changes the system. The engine's job is simply to see it and say so, in real time.

## The tell-tale signs

The detection layer listens to your journaling, your Guide conversations, and your session reflections. Signal fragments it looks for: ${signals}.

You do not have to perform it. You only have to record honestly. The breakthrough is already happening in your life more often than you think — it is being *seen* that is rare.

## Why the engine ranks it ${rarityLabel.toLowerCase()}

${RARITY_NOTE[bt.rarity] ?? RARITY_NOTE.common} When detected, it awards **${bt.karmaPoints} karma** — the currency the engine uses to keep score of inner work, visible on [your journey](/journey).

Rarity is not a judgment of worth. The common breakthroughs compound fastest; the rare ones mark thresholds. Both matter. Both are yours.

## How to invite it

${meta.invitation}

## Where it fits in the system

Every breakthrough is a loop that lost a round. If this one keeps recurring for you, the pattern underneath it has an entry in the [Loop Library](/loops) — name the loop precisely and the breakthrough stops being occasional and starts being stable.

— HOPE Breakthrough Atlas`;
}

export function breakthroughsAsBlogPosts(): BlogPost[] {
  // Stable, dateless ISO so they don't churn the feed every day.
  const publishedAt = "2025-01-01T00:00:00.000Z";
  return (GENERATED_BREAKTHROUGHS as GeneratedBreakthrough[]).map((bt) => {
    const meta = CATEGORY_META[bt.category];
    const slug = `breakthrough-${slugify(bt.name)}-${bt.id.toLowerCase()}`;
    return {
      slug,
      title: `${bt.name} — ${bt.id} · The Breakthrough Atlas`,
      keyword: bt.keywords.join(", "),
      pillar: `Breakthroughs · ${meta?.label ?? bt.category}`,
      metaDescription: `${bt.description} — why the HOPE engine ranks this ${bt.rarity} breakthrough, and how to invite it into your own practice.`,
      content: breakthroughToMarkdown(bt),
      publishedAt,
    } satisfies BlogPost;
  });
}
