// Generates 1000+ additional "practice guide" blog posts from the canonical
// breakthrough catalog, mirroring breakthroughBlogPosts.ts so /blog and the
// landing Journal section grow past 2000+ entries without bloating
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
  awareness: { label: "Awareness", family: "the **Awareness** family", invitation: "Arrive two seconds early in an ordinary moment and watch the movement begin before you are inside it." },
  emotional: { label: "Emotional", family: "the **Emotional** family", invitation: "Drop the narration for sixty seconds and let the feeling move through cleanly." },
  pattern: { label: "Pattern", family: "the **Pattern** family", invitation: "Name your pattern out loud the next time it starts, then do one small thing the pattern would never do." },
  relational: { label: "Relational", family: "the **Relational** family", invitation: "Say one unsaid sentence plainly and stay present for what comes back." },
  somatic: { label: "Somatic", family: "the **Somatic** family", invitation: "Find the loudest sensation and ask what it is communicating, then answer with an action the body recognizes." },
  existential: { label: "Existential", family: "the **Existential** family", invitation: "Sit with one unanswerable question and resist resolving it." },
  integration: { label: "Integration", family: "the **Integration** family", invitation: "Check head, heart, and gut on one reopened decision and write all three answers without editing." },
};

function signalPhrases(bt: GeneratedBreakthrough): string[] {
  const clean = bt.keywords.filter((k) => k.length >= 5).slice(0, 4);
  return clean.length > 0 ? clean : bt.keywords.slice(0, 3);
}

function practiceToMarkdown(bt: GeneratedBreakthrough): string {
  const meta = CATEGORY_META[bt.category] ?? { label: bt.category, family: `the **${bt.category}** family`, invitation: "Slow the moment down and watch it from the beginning." };
  const signals = signalPhrases(bt).map((k) => `*${k}*`).join(", ");
  return `> **${bt.id} · ${bt.emoji} ${meta.label} — Practice Guide** — ${bt.description}

## Why this practice matters

${bt.description}. It is one of the 1000+ breakthrough moments mapped inside the HOPE engine, sitting in ${meta.family}. This essay is the *practice* companion: not what the breakthrough is, but how to rehearse it until it becomes stable.

A breakthrough that happens once is a gift. A breakthrough that happens daily is a trait. The difference is practice — small, repeated, honest contact with the same moment until the nervous system stops treating it as new.

## The rehearsal

The detection layer listens to your journaling, your Guide conversations, and your session reflections. Signal fragments it looks for: ${signals}.

You do not have to perform it. You only have to record honestly. The breakthrough is already happening in your life more often than you think — it is being *seen* that is rare. Rehearse by writing one honest line each evening about whether the moment appeared. That single line is the whole practice.

## How to invite it

${meta.invitation}

Return to the same invitation for seven consecutive days before judging it. Most breakthroughs ripen on day four or five, when the novelty has worn off and the practice has become boring. Boring is where the work actually lives.

## Where it fits in the system

Every breakthrough is a loop that lost a round. If this one keeps recurring for you, the pattern underneath it has an entry in the [Loop Library](/loops) — name the loop precisely and the breakthrough stops being occasional and starts being stable. Track your progress on [your journey](/journey).

— HOPE Practice Atlas`;
}

export function moreAsBlogPosts(): BlogPost[] {
  const publishedAt = "2025-01-02T00:00:00.000Z";
  return (GENERATED_BREAKTHROUGHS as GeneratedBreakthrough[]).map((bt) => {
    const meta = CATEGORY_META[bt.category];
    const slug = `practice-${slugify(bt.name)}-${bt.id.toLowerCase()}`;
    return {
      slug,
      title: `${bt.name} — ${bt.id} · The Practice Atlas`,
      keyword: bt.keywords.join(", "),
      pillar: `Practice · ${meta?.label ?? bt.category}`,
      metaDescription: `${bt.description} — a practice guide for inviting this ${bt.rarity} breakthrough into daily life.`,
      content: practiceToMarkdown(bt),
      publishedAt,
    } satisfies BlogPost;
  });
}
