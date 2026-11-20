// ═══════════════════════════════════════════
// BREAKTHROUGHS — AI-Detected Consciousness Shifts
// Celebration moments detected from Guide/Journal/Sessions
// 1075+ entries spanning 7 categories. Each awards karma by rarity.
// ═══════════════════════════════════════════

import { GENERATED_BREAKTHROUGHS } from "./breakthroughs.generated";

export type BreakthroughCategory =
  | "awareness" | "emotional" | "pattern" | "relational" | "somatic" | "existential" | "integration";
export type BreakthroughRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface BreakthroughType {
  id: string;
  name: string;
  emoji: string;
  description: string;
  keywords: string[];
  category: BreakthroughCategory;
  rarity: BreakthroughRarity;
  /** Karma awarded when this breakthrough is detected. */
  karmaPoints?: number;
}

/** Karma awarded per rarity tier (used as a default if karmaPoints is missing). */
export const RARITY_KARMA: Record<BreakthroughRarity, number> = {
  common: 25,
  uncommon: 60,
  rare: 150,
  epic: 350,
  legendary: 800,
};

export function getBreakthroughKarma(bt: Pick<BreakthroughType, "rarity" | "karmaPoints">): number {
  return bt.karmaPoints ?? RARITY_KARMA[bt.rarity] ?? 25;
}

const HAND_CRAFTED: BreakthroughType[] = [
  // AWARENESS
  { id: "BT001", name: "First Witness", emoji: "👁️", description: "First time noticing yourself thinking without getting caught in the thought", keywords: ["noticed", "watching", "observing thoughts", "saw myself"], category: "awareness", rarity: "common" },
  { id: "BT002", name: "Gap Finder", emoji: "⚡", description: "Found the space between stimulus and response", keywords: ["paused", "didn't react", "space", "chose"], category: "awareness", rarity: "common" },
  { id: "BT003", name: "Loop Detected", emoji: "🔄", description: "First time recognizing a recurring pattern in real-time", keywords: ["pattern", "loop", "noticed again", "same thing", "realized"], category: "awareness", rarity: "common" },
  { id: "BT004", name: "Observer Awakens", emoji: "🌅", description: "Sustained witnessing awareness during daily life, not just meditation", keywords: ["whole day", "aware all day", "present", "watching throughout"], category: "awareness", rarity: "uncommon" },
  { id: "BT005", name: "Meta-Awareness", emoji: "🔮", description: "Awareness of awareness itself — knowing that you know", keywords: ["aware of being aware", "consciousness of consciousness", "witnessing the witness"], category: "awareness", rarity: "rare" },

  // EMOTIONAL
  { id: "BT010", name: "Emotional Alchemy", emoji: "⚗️", description: "Transmuted a difficult emotion into insight or energy", keywords: ["transformed", "anger became", "sadness turned", "used the energy"], category: "emotional", rarity: "uncommon" },
  { id: "BT011", name: "First Tears", emoji: "💧", description: "Allowed yourself to cry authentically after long suppression", keywords: ["finally cried", "tears came", "let myself feel", "release"], category: "emotional", rarity: "common" },
  { id: "BT012", name: "Anger Liberation", emoji: "🔥", description: "Expressed anger cleanly without suppression or explosion", keywords: ["expressed anger", "said what I felt", "boundary", "stood up"], category: "emotional", rarity: "uncommon" },
  { id: "BT013", name: "Joy Without Fear", emoji: "🌈", description: "Experienced pure joy without waiting for the other shoe to drop", keywords: ["purely happy", "enjoyed without worry", "present in joy", "no anxiety"], category: "emotional", rarity: "uncommon" },
  { id: "BT014", name: "Grief Release", emoji: "🕊️", description: "Finally processed grief you'd been carrying", keywords: ["grief", "let go", "mourned", "released", "said goodbye"], category: "emotional", rarity: "uncommon" },
  { id: "BT015", name: "Emotional Granularity", emoji: "🎨", description: "Named a complex emotion with precision for the first time", keywords: ["exactly what I feel", "specific emotion", "not just sad but", "realized it was"], category: "emotional", rarity: "common" },

  // PATTERN BREAKING
  { id: "BT020", name: "Pattern Breaker", emoji: "💥", description: "Broke a long-standing behavioral pattern consciously", keywords: ["didn't do it", "chose different", "broke the pattern", "first time I"], category: "pattern", rarity: "uncommon" },
  { id: "BT021", name: "Loop Dissolve", emoji: "🌀", description: "A recurring loop lost its power through awareness", keywords: ["doesn't affect me", "no longer", "loop dissolved", "free from"], category: "pattern", rarity: "rare" },
  { id: "BT022", name: "Shadow Integration", emoji: "🌗", description: "Accepted and integrated a previously denied part of yourself", keywords: ["accepted", "part of me", "no longer deny", "embraced", "shadow"], category: "pattern", rarity: "rare" },
  { id: "BT023", name: "Trigger Mastery", emoji: "🎯", description: "A former trigger no longer causes automatic reaction", keywords: ["no longer triggered", "didn't react", "used to bother", "calm now"], category: "pattern", rarity: "uncommon" },
  { id: "BT024", name: "Belief Shift", emoji: "🔑", description: "A core limiting belief fundamentally changed", keywords: ["realized I can", "belief changed", "no longer believe", "new perspective"], category: "pattern", rarity: "rare" },

  // RELATIONAL
  { id: "BT030", name: "Authentic Expression", emoji: "💎", description: "Said something true that you'd never said before", keywords: ["finally said", "truth", "authentic", "real", "first time telling"], category: "relational", rarity: "common" },
  { id: "BT031", name: "Boundary Birth", emoji: "🛡️", description: "Set a boundary you'd never been able to set before", keywords: ["said no", "boundary", "first time refusing", "stood my ground"], category: "relational", rarity: "uncommon" },
  { id: "BT032", name: "Mirror Recognition", emoji: "🪞", description: "Saw yourself clearly reflected in a relationship dynamic", keywords: ["projection", "it's me", "mirror", "I was the one", "recognized"], category: "relational", rarity: "uncommon" },
  { id: "BT033", name: "Forgiveness Bloom", emoji: "🌸", description: "Genuinely forgave someone or yourself", keywords: ["forgave", "let go", "no longer angry", "freed", "forgiveness"], category: "relational", rarity: "rare" },
  { id: "BT034", name: "Vulnerability Victory", emoji: "💗", description: "Was fully vulnerable and experienced connection instead of rejection", keywords: ["opened up", "vulnerable", "accepted", "they understood", "connected"], category: "relational", rarity: "uncommon" },

  // SOMATIC
  { id: "BT040", name: "Body Speaks", emoji: "🫀", description: "First time understanding what your body was communicating", keywords: ["body told me", "felt in my", "physical sensation", "body wisdom"], category: "somatic", rarity: "common" },
  { id: "BT041", name: "Tension Release", emoji: "🧊", description: "Released chronic tension you'd been carrying unconsciously", keywords: ["released", "tension gone", "finally relaxed", "letting go physically"], category: "somatic", rarity: "uncommon" },
  { id: "BT042", name: "Breath Discovery", emoji: "🌬️", description: "Discovered how breath directly controls emotional state", keywords: ["breathing changed", "breath calmed", "breathwork shifted", "pranayama"], category: "somatic", rarity: "common" },
  { id: "BT043", name: "Somatic Memory", emoji: "📍", description: "Accessed a memory through body sensation rather than thought", keywords: ["body remembered", "felt the memory", "stored in my body", "physical memory"], category: "somatic", rarity: "rare" },

  // EXISTENTIAL
  { id: "BT050", name: "Impermanence Insight", emoji: "🍂", description: "Deeply felt (not just understood) that everything changes", keywords: ["everything passes", "impermanent", "this too", "letting go", "flowing"], category: "existential", rarity: "uncommon" },
  { id: "BT051", name: "Death Acceptance", emoji: "💀", description: "Moved from fear to peace with mortality", keywords: ["death", "mortality", "peace with dying", "acceptance", "not afraid"], category: "existential", rarity: "rare" },
  { id: "BT052", name: "Purpose Clarity", emoji: "🧭", description: "Sudden clarity about life purpose or direction", keywords: ["know my purpose", "clarity", "calling", "meant to", "this is why"], category: "existential", rarity: "rare" },
  { id: "BT053", name: "Interconnection", emoji: "🕸️", description: "Felt genuine connection to all life/existence", keywords: ["connected", "all one", "no separation", "unity", "everything"], category: "existential", rarity: "epic" },
  { id: "BT054", name: "Ego Transparency", emoji: "👤", description: "Saw through the ego's constructions clearly", keywords: ["ego", "just a construct", "not real", "seen through", "illusion"], category: "existential", rarity: "epic" },

  // INTEGRATION
  { id: "BT060", name: "Three Brains Aligned", emoji: "🧬", description: "Head, heart, and gut in agreement on a decision", keywords: ["aligned", "head heart gut", "all agree", "congruent", "clear"], category: "integration", rarity: "uncommon" },
  { id: "BT061", name: "Paradox Holding", emoji: "☯️", description: "Held two opposing truths simultaneously without needing to resolve them", keywords: ["both true", "paradox", "contradiction", "both and", "not either or"], category: "integration", rarity: "rare" },
  { id: "BT062", name: "Witness Stabilization", emoji: "⛰️", description: "The witnessing awareness became stable — not just glimpses", keywords: ["stable awareness", "constant witness", "always watching", "stabilized"], category: "integration", rarity: "epic" },
  { id: "BT063", name: "Band Shift", emoji: "📊", description: "A noticeable shift to a higher consciousness band", keywords: ["level up", "shifted", "different person", "can't go back", "permanent change"], category: "integration", rarity: "epic" },
  { id: "BT064", name: "Full Integration", emoji: "🌟", description: "A fragmented aspect of self became integrated and whole", keywords: ["whole", "integrated", "complete", "no longer split", "united"], category: "integration", rarity: "legendary" },

  // Additional common ones
  { id: "BT070", name: "Morning Presence", emoji: "🌅", description: "Woke up present instead of in anxiety/autopilot", keywords: ["woke up present", "morning peace", "no morning anxiety", "calm awakening"], category: "awareness", rarity: "common" },
  { id: "BT071", name: "Gratitude Wave", emoji: "🙏", description: "Spontaneous wave of genuine gratitude for life", keywords: ["grateful", "thankful", "appreciating", "overflow", "blessed"], category: "emotional", rarity: "common" },
  { id: "BT072", name: "Compassion Expansion", emoji: "💚", description: "Felt genuine compassion for someone you previously judged", keywords: ["compassion", "understood them", "felt for them", "empathy", "forgave"], category: "relational", rarity: "uncommon" },
  { id: "BT073", name: "Creative Breakthrough", emoji: "✨", description: "Consciousness insight expressed through creative act", keywords: ["created", "art", "wrote", "expressed", "channeled"], category: "integration", rarity: "uncommon" },
  { id: "BT074", name: "Silence Comfort", emoji: "🤫", description: "Found genuine comfort and richness in silence", keywords: ["silence", "quiet", "peaceful", "no noise", "comfortable alone"], category: "awareness", rarity: "common" },
  { id: "BT075", name: "Dream Lucidity", emoji: "🌙", description: "Became aware within a dream that you were dreaming", keywords: ["lucid dream", "knew I was dreaming", "conscious in dream", "dream aware"], category: "awareness", rarity: "rare" },
];

/**
 * Full catalog: 75 hand-crafted + 1000 generated = 1075+ breakthroughs.
 * Each generated entry already carries a karmaPoints value; hand-crafted
 * entries fall back to RARITY_KARMA via getBreakthroughKarma().
 */
export const BREAKTHROUGH_TYPES: BreakthroughType[] = [
  ...HAND_CRAFTED,
  ...(GENERATED_BREAKTHROUGHS as BreakthroughType[]),
];

export const RARITY_CONFIG: Record<string, { color: string; label: string; glow: string }> = {
  common: { color: "text-muted-foreground", label: "Common", glow: "" },
  uncommon: { color: "text-chart-2", label: "Uncommon", glow: "shadow-chart-2/20" },
  rare: { color: "text-primary", label: "Rare", glow: "shadow-primary/30" },
  epic: { color: "text-chart-4", label: "Epic", glow: "shadow-chart-4/30" },
  legendary: { color: "text-amber-400", label: "Legendary", glow: "shadow-amber-400/40" },
};

export function getBreakthroughById(id: string): BreakthroughType | undefined {
  return BREAKTHROUGH_TYPES.find(b => b.id === id);
}

export function searchBreakthroughs(text: string): BreakthroughType[] {
  const lower = text.toLowerCase();
  return BREAKTHROUGH_TYPES.filter(b =>
    b.keywords.some(k => lower.includes(k)) ||
    b.description.toLowerCase().split(" ").some(w => lower.includes(w))
  ).sort((a, b) => {
    const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
    return rarityOrder[b.rarity] - rarityOrder[a.rarity];
  });
}
