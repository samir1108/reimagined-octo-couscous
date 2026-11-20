/**
 * Local Loop & Source Detection Engine
 * Uses loops_catalog table (single source of truth) instead of hardcoded entries.
 * Runs client-side — ZERO AI cost, ZERO latency.
 * Returns confidence scores; if too low/ambiguous, caller can fall back to AI.
 */

import { fetchLoopsCatalog } from '@/lib/loopsCatalog';
import type { DetectedLoop, DetectedSource } from "@/hooks/useLiveDetection";

type LoopCatalogEntry = {
  id: string;
  name: string;
  category: string;
  hint: string;
  keywords: string[];
  phrases: string[];
  root_wound: string | null;
  chakras: string[];
  way_out: string | null;
  triggers: Record<string, string[]> | null;
  severity_thresholds: { low: number; medium: number; high: number } | null;
  is_active: boolean;
};

// ─── SOURCE KEYWORD MAP ──────────────────────────────────────────────

interface SourceKeywords {
  type: "mind" | "heart" | "gut" | "body" | "identity" | "fear" | "witness";
  keywords: string[];
  phrases: string[];
}

const SOURCE_ENTRIES: SourceKeywords[] = [
  {
    type: "mind",
    keywords: ["think", "thought", "analyze", "logic", "reason", "understand", "figure out", "make sense", "rationalize", "plan", "strategy", "idea", "concept", "intellectually", "theoretically", "perspective", "argument", "explain", "consider", "evaluate"],
    phrases: ["i think that", "it makes sense", "logically speaking", "i've been thinking", "trying to figure out", "analyzing this", "my mind keeps", "can't stop thinking", "rationally i know"],
  },
  {
    type: "heart",
    keywords: ["feel", "emotion", "love", "grief", "sad", "happy", "joy", "hurt", "pain", "longing", "miss", "care", "compassion", "tender", "vulnerable", "cry", "tears", "touched", "moved", "warm"],
    phrases: ["i feel", "my heart", "it hurts", "i miss", "breaks my heart", "feeling so", "emotionally", "deeply touched", "it pains me", "with all my heart"],
  },
  {
    type: "gut",
    keywords: ["instinct", "impulse", "react", "urge", "gut feeling", "survival", "fight", "flee", "rage", "furious", "explosive", "snap", "trigger", "reflex", "visceral"],
    phrases: ["my gut tells", "something feels off", "i just reacted", "instinctively", "fight or flight", "visceral reaction", "an urge to", "gut feeling"],
  },
  {
    type: "body",
    keywords: ["body", "tension", "tight", "relax", "breathe", "physical", "sensation", "muscle", "stomach", "chest", "shoulder", "jaw", "fatigue", "energy", "tired", "exhausted", "restless", "nauseous", "shaking", "sweating", "heartbeat"],
    phrases: ["my body feels", "physically i", "tension in my", "can feel it in my", "body is telling", "somatic", "physical sensation", "my shoulders are"],
  },
  {
    type: "identity",
    keywords: ["i am", "i'm a", "that's me", "who i am", "my identity", "defines me", "i've always been", "that's just how", "type of person"],
    phrases: ["that's just who i am", "i've always been", "i'm the kind of", "as a person i", "my identity is", "i define myself", "this is me"],
  },
  {
    type: "fear",
    keywords: ["afraid", "scared", "fear", "worry", "anxious", "terrified", "dread", "panic", "nervous", "threat", "danger", "risk", "worst case"],
    phrases: ["i'm afraid", "i'm scared", "what if", "i worry", "i'm anxious", "terrified of", "dreading", "fills me with dread", "scared that"],
  },
  {
    type: "witness",
    keywords: ["observe", "notice", "aware", "watching", "seeing", "present", "conscious", "mindful", "witnessing", "detached", "space", "clarity", "stillness", "recognize"],
    phrases: ["i notice that", "i'm observing", "i can see", "watching myself", "part of me sees", "with awareness", "i'm present to", "stepping back i see", "i recognize that"],
  },
];

// ─── DETECTION ENGINE ──────────────────────────────────────────────

let loopsCache: LoopCatalogEntry[] | null = null;

async function getLoopEntries(): Promise<LoopCatalogEntry[]> {
  if (loopsCache) return loopsCache;
  loopsCache = await fetchLoopsCatalog();
  return loopsCache;
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/['']/g, "'").replace(/[""]/g, '"').replace(/\s+/g, " ").trim();
}

function scoreLoop(entry: LoopCatalogEntry, text: string): { confidence: number; evidence: string } {
  const normalized = normalizeText(text);
  let score = 0;
  let bestEvidence = "";
  let bestEvidenceLen = 0;

  // Check phrases (higher weight — 0.25 each, max contribute 0.75)
  for (const phrase of entry.phrases) {
    if (normalized.includes(phrase)) {
      score += 0.25;
      if (phrase.length > bestEvidenceLen) {
        bestEvidenceLen = phrase.length;
        const idx = normalized.indexOf(phrase);
        const start = Math.max(0, idx - 20);
        const end = Math.min(text.length, idx + phrase.length + 20);
        bestEvidence = text.slice(start, end).trim();
      }
    }
  }

  // Check keywords (lower weight — 0.1 each, max contribute 0.4)
  let kwMatches = 0;
  for (const kw of entry.keywords) {
    if (normalized.includes(kw)) {
      kwMatches++;
      if (!bestEvidence && kw.length > bestEvidenceLen) {
        bestEvidenceLen = kw.length;
        const idx = normalized.indexOf(kw);
        const start = Math.max(0, idx - 25);
        const end = Math.min(text.length, idx + kw.length + 25);
        bestEvidence = text.slice(start, end).trim();
      }
    }
  }
  score += Math.min(0.4, kwMatches * 0.1);

  return { confidence: Math.min(0.95, score), evidence: bestEvidence };
}

function scoreSource(entry: SourceKeywords, text: string): { strength: number; evidence: string } {
  const normalized = normalizeText(text);
  let score = 0;
  let bestEvidence = "";

  for (const phrase of entry.phrases) {
    if (normalized.includes(phrase)) {
      score += 0.2;
      if (!bestEvidence) {
        const idx = normalized.indexOf(phrase);
        const start = Math.max(0, idx - 15);
        const end = Math.min(text.length, idx + phrase.length + 15);
        bestEvidence = text.slice(start, end).trim();
      }
    }
  }

  let kwCount = 0;
  for (const kw of entry.keywords) {
    if (normalized.includes(kw)) kwCount++;
  }
  score += Math.min(0.4, kwCount * 0.08);

  return { strength: Math.min(0.95, score), evidence: bestEvidence };
}

// Why explanations for top categories
const LOOP_WHY: Record<string, string> = {
  VAL: "This validation-seeking pattern often stems from early experiences where love felt conditional on performance or pleasing others.",
  CTL: "Control patterns typically emerge when uncertainty feels threatening — the mind tries to manage what it fears it can't handle.",
  AVD: "Avoidance is a protective strategy that worked in the past but now keeps you from fully engaging with life.",
  SRV: "Survival responses are hardwired — your nervous system is activating ancient protective mechanisms.",
  BOD: "Your body is storing emotional energy that hasn't been fully processed or released.",
  ENR: "Energy depletion patterns reveal where your life force is being unconsciously drained.",
  EMO: "Emotional loops indicate feelings that are cycling without being fully felt or integrated.",
  MEN: "Mental loops show the mind trying to solve something that thinking alone cannot resolve.",
  BHV: "Behavioral patterns are automated responses — the body repeating what's been wired through repetition.",
  HAB: "Habits operate below conscious awareness — recognizing them is the first step to freedom.",
  SOC: "Social patterns reveal where your authentic self gets hidden behind protective social masks.",
  REL: "Relationship loops often mirror our earliest attachment experiences, repeating until seen clearly.",
  IDN: "Identity loops keep you locked into a fixed story about who you are, limiting your growth.",
  EGO: "Ego patterns protect a fragile self-image — they dissolve when observed with compassion.",
  BLF: "Core beliefs were formed early and feel like absolute truths, but they are learned interpretations.",
  COG: "Cognitive biases are mental shortcuts that distort reality — awareness alone begins to loosen them.",
  ATT: "Attention patterns determine what reality you inhabit — where attention goes, energy flows.",
  MOT: "Motivation loops reveal a misunderstanding about how action and energy actually work.",
  DEC: "Decision patterns expose the fear underneath — usually fear of loss, regret, or commitment.",
  LRN: "Learning loops often mask a deeper fear of truly applying and being seen in your competence.",
  PRD: "Productivity loops confuse doing with being — your worth isn't measured in output.",
  CRE: "Creative blocks are almost always emotional — the art is blocked by fear, not lack of skill.",
  PUR: "Purpose anxiety reveals a deep longing for meaning that's actually already present in your being.",
  SPR: "Spiritual loops are some of the most subtle — using awakening to avoid being fully human.",
};

const SOURCE_INSIGHTS: Record<string, string> = {
  mind: "Your analytical mind is leading — it's trying to solve or understand, but some truths require feeling, not thinking.",
  heart: "Your heart is speaking — this is emotional intelligence arising. Honor these feelings without needing to fix them.",
  gut: "Your instinctual center is activated — trust this primal knowing, it often perceives what the mind misses.",
  body: "Your body is communicating — it holds wisdom and memory that words can't capture. Listen to its signals.",
  identity: "You're speaking from a fixed self-concept — notice how 'I am...' statements create invisible walls.",
  fear: "Fear is driving this expression — acknowledge it without letting it steer. Fear seen clearly loses its grip.",
  witness: "Beautiful — the witness is active. This observing awareness is your deepest nature, beyond all patterns.",
};

export interface LocalDetectionResult {
  loops: DetectedLoop[];
  sources: DetectedSource[];
  overall_insight?: string;
  isAmbiguous: boolean; // true = low confidence, should call AI
}

/**
 * Run local keyword-based loop and source detection.
 * @param messages Recent conversation messages
 * @returns Detection result + ambiguity flag
 */
export async function detectLocally(
  messages: Array<{ role: string; content: string }>
): Promise<LocalDetectionResult> {
  // Combine last few user messages for analysis
  const userMessages = messages
    .filter((m) => m.role === "user")
    .slice(-5)
    .map((m) => m.content);

  if (userMessages.length === 0) {
    return { loops: [], sources: [], isAmbiguous: false };
  }

  const combinedText = userMessages.join(" ");
  const loopEntries = await getLoopEntries();

  // Score all loops
  const loopScores = loopEntries.map((entry) => {
    const { confidence, evidence } = scoreLoop(entry, combinedText);
    const category = entry.id.replace(/\d+/g, "");
    return {
      id: entry.id,
      name: entry.name,
      confidence,
      evidence,
      why: LOOP_WHY[category] || "This pattern is operating below conscious awareness — recognition is the first step.",
    };
  })
    .filter((l) => l.confidence >= 0.3)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  // Score sources
  const sourceScores = SOURCE_ENTRIES.map((entry) => {
    const { strength, evidence } = scoreSource(entry, combinedText);
    return {
      type: entry.type,
      strength,
      evidence,
      insight: SOURCE_INSIGHTS[entry.type],
    };
  })
    .filter((s) => s.strength >= 0.15)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 3) as DetectedSource[];

  // Determine ambiguity
  const topLoopConfidence = loopScores[0]?.confidence || 0;
  const totalLoops = loopScores.length;
  const isAmbiguous =
    (totalLoops === 0 && userMessages.join("").length > 100) ||
    (topLoopConfidence > 0 && topLoopConfidence < 0.4);

  // Generate overall insight
  let overall_insight: string | undefined;
  if (loopScores.length > 0 && sourceScores.length > 0) {
    const topLoop = loopScores[0].name;
    const topSource = sourceScores[0].type;
    overall_insight = `A ${topLoop} pattern appears to be active, primarily expressed through your ${topSource}. Notice this with curiosity rather than judgment.`;
  }

  return {
    loops: loopScores as DetectedLoop[],
    sources: sourceScores,
    overall_insight,
    isAmbiguous,
  };
}

// Export for backward compatibility
export { fetchLoopsCatalog };
export type { LoopCatalogEntry };