/**
 * CHAKRA ENGINE (v4 Theme Engine)
 *
 * Infers the most blocked chakra by combining 4 signals:
 *   1. Weakest dimension band (thought/emotion/body/awareness)
 *   2. Top active loop archetype
 *   3. Stressed life domain (work/relationship/health/finance)
 *   4. Samskara chakra_correlations (root wound mapping)
 *
 * Output: a single primary chakra + reason + opening practice.
 */

export type ChakraId = "root" | "sacral" | "solar" | "heart" | "throat" | "third_eye" | "crown";

export interface ChakraInfo {
  id: ChakraId;
  sanskrit: string;
  english: string;
  theme: string;
  bodyLocation: string;
  blockedSigns: string[];
  openingPractice: string;
}

export const CHAKRAS: Record<ChakraId, ChakraInfo> = {
  root: {
    id: "root",
    sanskrit: "Muladhara",
    english: "Root",
    theme: "Safety, Grounding, Survival",
    bodyLocation: "base of spine, pelvic floor",
    blockedSigns: ["fear", "scarcity", "instability", "financial anxiety", "feeling unsafe"],
    openingPractice: "Feel both feet on the ground for 60 seconds. Name 3 things that are stable in your life right now.",
  },
  sacral: {
    id: "sacral",
    sanskrit: "Svadhisthana",
    english: "Sacral",
    theme: "Creativity, Emotion, Pleasure",
    bodyLocation: "lower belly, hips",
    blockedSigns: ["emotional numbness", "creative block", "shame", "guilt", "stuck pleasure"],
    openingPractice: "Place hands on your lower belly. Take 3 slow breaths into that space. Let one emotion be felt fully.",
  },
  solar: {
    id: "solar",
    sanskrit: "Manipura",
    english: "Solar Plexus",
    theme: "Power, Will, Self-Worth",
    bodyLocation: "navel, upper abdomen",
    blockedSigns: ["powerlessness", "low self-worth", "control issues", "anger", "indecision"],
    openingPractice: "Stand tall. Hand on solar plexus. Say silently: 'I have the power to choose my next step.' Three breaths.",
  },
  heart: {
    id: "heart",
    sanskrit: "Anahata",
    english: "Heart",
    theme: "Love, Compassion, Connection",
    bodyLocation: "center of chest",
    blockedSigns: ["isolation", "grief", "self-criticism", "withholding love", "relationship strain"],
    openingPractice: "Hand on heart. Three breaths into the chest. Send one wish of well-being to yourself, then to one other person.",
  },
  throat: {
    id: "throat",
    sanskrit: "Vishuddha",
    english: "Throat",
    theme: "Truth, Expression, Authenticity",
    bodyLocation: "throat, jaw",
    blockedSigns: ["unspoken truth", "people-pleasing", "fear of judgment", "creative suppression"],
    openingPractice: "Hum on a low tone for 30 seconds — feel the throat vibrate. Then name one truth you've been avoiding speaking.",
  },
  third_eye: {
    id: "third_eye",
    sanskrit: "Ajna",
    english: "Third Eye",
    theme: "Insight, Intuition, Clarity",
    bodyLocation: "between eyebrows",
    blockedSigns: ["overthinking", "mental fog", "indecision", "ignoring intuition", "rumination loops"],
    openingPractice: "Eyes closed. Attention to the space between brows. Ask one question, wait for the silent answer beneath thought.",
  },
  crown: {
    id: "crown",
    sanskrit: "Sahasrara",
    english: "Crown",
    theme: "Connection, Transcendence, Meaning",
    bodyLocation: "top of head",
    blockedSigns: ["meaninglessness", "spiritual disconnection", "existential anxiety", "isolation from the larger whole"],
    openingPractice: "Sit. Imagine soft light entering the top of the head. Rest in 'something larger is holding me' for 60 seconds.",
  },
};

// Dimension → chakra mapping (primary)
const DIM_TO_CHAKRA: Record<string, ChakraId> = {
  body: "root",
  emotion: "heart",
  thought: "third_eye",
  awareness: "crown",
};

// Loop archetype keywords → chakra
const LOOP_TO_CHAKRA: Array<{ keywords: string[]; chakra: ChakraId }> = [
  { keywords: ["fear", "anxiety", "survival", "scarcity", "money"], chakra: "root" },
  { keywords: ["shame", "guilt", "creative", "pleasure", "sexual"], chakra: "sacral" },
  { keywords: ["control", "power", "anger", "worth", "validation", "comparison"], chakra: "solar" },
  { keywords: ["love", "relationship", "isolation", "grief", "self-criticism", "compassion"], chakra: "heart" },
  { keywords: ["truth", "expression", "voice", "communication", "people-pleasing"], chakra: "throat" },
  { keywords: ["overthinking", "rumination", "decision", "clarity", "doubt", "mental"], chakra: "third_eye" },
  { keywords: ["meaning", "purpose", "spiritual", "existential", "identity"], chakra: "crown" },
];

// Life domain → chakra
const DOMAIN_TO_CHAKRA: Record<string, ChakraId> = {
  finance: "root",
  health: "root",
  work: "solar",
  career: "solar",
  relationship: "heart",
  family: "heart",
  creative: "sacral",
  purpose: "crown",
  learning: "third_eye",
};

interface ChakraInput {
  weakestDimension?: string | null;
  topLoopId?: string | null;
  stressedDomain?: string | null;
  samskaraChakras?: string[] | null;   // chakras already correlated with deep wounds
  bypassingRisk?: number;
}

export interface ChakraSignal {
  primary: ChakraInfo;
  secondary: ChakraInfo | null;
  reason: string;
  promptBlock: string;
}

export function detectBlockedChakra(input: ChakraInput): ChakraSignal {
  const votes: Record<ChakraId, { count: number; reasons: string[] }> = {
    root: { count: 0, reasons: [] },
    sacral: { count: 0, reasons: [] },
    solar: { count: 0, reasons: [] },
    heart: { count: 0, reasons: [] },
    throat: { count: 0, reasons: [] },
    third_eye: { count: 0, reasons: [] },
    crown: { count: 0, reasons: [] },
  };

  // Vote 1: weakest dimension (weight 2)
  if (input.weakestDimension && DIM_TO_CHAKRA[input.weakestDimension]) {
    const c = DIM_TO_CHAKRA[input.weakestDimension];
    votes[c].count += 2;
    votes[c].reasons.push(`${input.weakestDimension} dim is weakest`);
  }

  // Vote 2: top loop archetype (weight 3)
  if (input.topLoopId) {
    const loopLower = input.topLoopId.toLowerCase();
    for (const { keywords, chakra } of LOOP_TO_CHAKRA) {
      if (keywords.some((k) => loopLower.includes(k))) {
        votes[chakra].count += 3;
        votes[chakra].reasons.push(`top loop "${input.topLoopId}" maps here`);
        break;
      }
    }
  }

  // Vote 3: stressed life domain (weight 2)
  if (input.stressedDomain) {
    const dom = input.stressedDomain.toLowerCase();
    for (const [k, c] of Object.entries(DOMAIN_TO_CHAKRA)) {
      if (dom.includes(k)) {
        votes[c].count += 2;
        votes[c].reasons.push(`${input.stressedDomain} domain stressed`);
        break;
      }
    }
  }

  // Vote 4: samskara chakra correlations (weight 2)
  if (Array.isArray(input.samskaraChakras)) {
    for (const ch of input.samskaraChakras) {
      const id = String(ch).toLowerCase().replace(/\s+/g, "_") as ChakraId;
      if (CHAKRAS[id]) {
        votes[id].count += 2;
        votes[id].reasons.push(`root wound correlates here`);
      }
    }
  }

  // Vote 5: bypassing risk → solar (avoiding power/will)
  if ((input.bypassingRisk || 0) > 0.5) {
    votes.solar.count += 1;
    votes.solar.reasons.push(`spiritual bypassing risk high`);
  }

  // Pick winner
  const ranked = (Object.entries(votes) as [ChakraId, { count: number; reasons: string[] }][])
    .sort((a, b) => b[1].count - a[1].count);

  const winnerId = ranked[0][1].count > 0 ? ranked[0][0] : "heart"; // default to heart if no signal
  const secondaryId = ranked[1] && ranked[1][1].count > 0 ? ranked[1][0] : null;

  const primary = CHAKRAS[winnerId];
  const secondary = secondaryId ? CHAKRAS[secondaryId] : null;
  const reason = ranked[0][1].reasons.length > 0
    ? ranked[0][1].reasons.join("; ")
    : "balanced — picking heart as default opener";

  const lines: string[] = [];
  lines.push(`═══ CHAKRA FOCUS (inferred) ═══`);
  lines.push(`PRIMARY: ${primary.sanskrit} (${primary.english}) — ${primary.theme}`);
  lines.push(`Why: ${reason}`);
  lines.push(`Body location: ${primary.bodyLocation}`);
  lines.push(`Blocked signs: ${primary.blockedSigns.join(", ")}`);
  lines.push(`Opening practice (use as felt-sense opener if matches): "${primary.openingPractice}"`);
  if (secondary) lines.push(`Secondary chakra also active: ${secondary.sanskrit} (${secondary.english}).`);

  return {
    primary,
    secondary,
    reason,
    promptBlock: lines.join("\n"),
  };
}
