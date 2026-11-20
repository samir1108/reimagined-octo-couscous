import type { PathId } from "./foundationQuestions";

export interface PathDefinition {
  id: PathId;
  name: string;
  sanskrit: string;
  blurb: string;
  whoFor: string;
  glyph: string; // emoji as glyph; design can swap later
}

export const SECONDARY_PATHS: PathDefinition[] = [
  {
    id: "kriya",
    name: "Kriya",
    sanskrit: "क्रिया",
    blurb: "Energy work through breath and inner technique.",
    whoFor: "If you live in your body and want to feel alive.",
    glyph: "🜔",
  },
  {
    id: "karma",
    name: "Karma Yoga",
    sanskrit: "कर्म",
    blurb: "Action without attachment. Service as prayer.",
    whoFor: "If doing is how you metabolise meaning.",
    glyph: "✦",
  },
  {
    id: "bhakti",
    name: "Bhakti",
    sanskrit: "भक्ति",
    blurb: "Devotion. Letting the heart lead.",
    whoFor: "If something in you longs to surrender.",
    glyph: "❤︎",
  },
  {
    id: "jnana",
    name: "Jnana",
    sanskrit: "ज्ञान",
    blurb: "Inquiry. Cutting through illusion with clarity.",
    whoFor: "If your mind needs truth before it can rest.",
    glyph: "◇",
  },
  {
    id: "tantra",
    name: "Tantra",
    sanskrit: "तन्त्र",
    blurb: "Everything is sacred. Nothing is excluded.",
    whoFor: "If you want to weave the worldly and the holy.",
    glyph: "∞",
  },
  {
    id: "dhyana",
    name: "Dhyana",
    sanskrit: "ध्यान",
    blurb: "Silent sitting. Depth through stillness.",
    whoFor: "If you're called toward the quiet.",
    glyph: "○",
  },
];

export const PATH_BY_ID = Object.fromEntries(SECONDARY_PATHS.map((p) => [p.id, p])) as Record<PathId, PathDefinition>;
