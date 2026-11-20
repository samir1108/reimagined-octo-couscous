/**
 * INSIGHT LAYER — Sits between agent output and final response.
 * Adds subtle "what's happening inside you" layer WITHOUT labeling.
 *
 * Three insight depths:
 *   - micro      → small embedded observation (most common)
 *   - framework  → indirect tradition/principle reference (occasional)
 *   - explicit   → name the practice/concept (rare, only if ready)
 */

import type { ConsciousnessStage } from './stageEngine';
import type { UserStateVector } from './stateEngine';

export type InsightDepth = 'none' | 'micro' | 'framework' | 'explicit';

export type SpiritualLean = 'inquiry' | 'devotion' | 'action' | 'somatic' | 'rational' | 'neutral';

export interface TeachabilityScores {
  curiosity: number;        // 0-10
  openness: number;         // 0-10
  egoSensitivity: number;   // 0-10 (high = more sensitive, less direct teaching)
  cognitiveLoad: number;    // 0-10
}

export interface InsightDecision {
  depth: InsightDepth;
  spiritualLean: SpiritualLean;
  /** Knowledge reveal level — what vocabulary AI may use */
  revealLevel: 1 | 2 | 3 | 4;
  /** System prompt fragment to append after agent prompts */
  promptFragment: string;
  /** Hidden narrative for the synthesizer */
  narrativeHint: string;
}

// ─── Teachability Detection ───

export function computeTeachability(input: {
  message: string;
  state: UserStateVector;
  recentEngagementScore?: number; // 0-10
}): TeachabilityScores {
  const msg = input.message.toLowerCase();
  const { state } = input;

  let curiosity = 4;
  if (/why|how does|what (is|does)|tell me|explain|curious|wonder/.test(msg)) curiosity += 3;
  if (state.intent === 'learn' || state.intent === 'explore') curiosity += 2;
  curiosity = Math.min(10, curiosity);

  const openness = clamp10(10 - state.resistanceLevel);

  // Ego sensitivity: high if validation-seeking or low awareness
  let ego = 4;
  if (state.intent === 'seek_validation') ego += 3;
  if (state.awarenessLevel < 3) ego += 2;
  if (/i am (good|right|special|the one)/.test(msg)) ego += 2;
  ego = Math.min(10, ego);

  return {
    curiosity,
    openness,
    egoSensitivity: ego,
    cognitiveLoad: state.cognitiveLoad,
  };
}

// ─── Spiritual Lean Detection ───

export function detectSpiritualLean(message: string, state: UserStateVector): SpiritualLean {
  const msg = message.toLowerCase();
  if (/who am i|what is real|consciousness|awareness|witness|self/.test(msg)) return 'inquiry';
  if (/surrender|let go|trust|grace|devotion|love|heart/.test(msg)) return 'devotion';
  if (/do|action|practice|discipline|build|move/.test(msg)) return 'action';
  if (/breath|body|feel|sensation|energy|tension/.test(msg)) return 'somatic';
  if (/think|logic|understand|analyze|figure out/.test(msg)) return 'rational';
  // Fallback by intent
  if (state.intent === 'transform' || state.intent === 'seek_truth') return 'inquiry';
  if (state.intent === 'fix') return 'action';
  return 'neutral';
}

// ─── Depth Decision ───

export function decideInsightDepth(
  teachability: TeachabilityScores,
  stage: ConsciousnessStage,
  fragility: number,
): InsightDepth {
  // Crisis / fragile → never teach
  if (fragility > 6) return 'none';
  if (teachability.cognitiveLoad > 7) return 'none';

  // Explicit teaching: high curiosity AND high awareness AND low ego
  if (teachability.curiosity >= 7 && stage >= 4 && teachability.egoSensitivity <= 5) {
    return 'explicit';
  }

  // Framework: moderate readiness
  if (teachability.openness >= 6 && stage >= 3) {
    return 'framework';
  }

  // Default: micro
  return 'micro';
}

// ─── Knowledge Reveal Level ───

export function getRevealLevel(stage: ConsciousnessStage): 1 | 2 | 3 | 4 {
  if (stage <= 1) return 1; // no jargon
  if (stage <= 3) return 2; // light concepts
  if (stage <= 5) return 3; // names allowed (self-inquiry, awareness)
  return 4;                 // full mappings (yoga paths, traditions)
}

// ─── Prompt Fragments ───

const INSIGHT_PROMPTS: Record<InsightDepth, string> = {
  none: '',
  micro:
    'INSIGHT LAYER: Add ONE short, natural observation about what may be happening inside the user. Do not name frameworks. Under 1 sentence. Embed naturally — never as a separate teaching.',
  framework:
    'INSIGHT LAYER: You may briefly connect this to a general principle. Use phrases like "in many traditions" or "this is often seen as". Do NOT label the user. Do NOT lecture. One sentence reference, then return to the user.',
  explicit:
    'INSIGHT LAYER: The user is ready for clarity. You may name what is happening (e.g. self-inquiry, witnessing, surrender) ONCE if it adds clarity. Stay grounded — never abstract. Always return focus to the user, not the concept.',
};

const LEAN_PROMPTS: Record<SpiritualLean, string> = {
  inquiry: 'Lean toward inquiry-style language: "Who is the one experiencing this?"',
  devotion: 'Lean toward surrender-style language: "What if you let it be held?"',
  action: 'Lean toward action: "What is the one small step?"',
  somatic: 'Lean toward body: "Where do you feel this right now?"',
  rational: 'Lean toward clarity: "What do you actually know to be true here?"',
  neutral: 'Match the user\'s natural mode of expression.',
};

// ─── Main Entry ───

export function buildInsightDecision(input: {
  message: string;
  state: UserStateVector;
  stage: ConsciousnessStage;
  fragility: number;
  recentEngagementScore?: number;
}): InsightDecision {
  const teachability = computeTeachability(input);
  const lean = detectSpiritualLean(input.message, input.state);
  const depth = decideInsightDepth(teachability, input.stage, input.fragility);
  const revealLevel = getRevealLevel(input.stage);

  const constraints: string[] = [];
  if (revealLevel === 1) constraints.push('No spiritual jargon. No tradition names. Plain language only.');
  if (revealLevel === 2) constraints.push('Light concepts allowed (awareness, noticing). No tradition names.');
  if (revealLevel === 3) constraints.push('Concepts and practice names OK (self-inquiry, witnessing). Tradition names sparingly.');
  if (revealLevel === 4) constraints.push('Full vocabulary available — but use restraint. Less is more.');

  const promptFragment = [
    INSIGHT_PROMPTS[depth],
    LEAN_PROMPTS[lean],
    constraints.join(' '),
    'NEVER label the user with a stage, level, or category.',
    'NEVER use Hinglish or Hindi terms — English only for now.',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    depth,
    spiritualLean: lean,
    revealLevel,
    promptFragment,
    narrativeHint: `Insight depth: ${depth}; lean: ${lean}; reveal L${revealLevel}.`,
  };
}

function clamp10(n: number): number {
  return Math.max(0, Math.min(10, n));
}
