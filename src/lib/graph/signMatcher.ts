/**
 * Sign Matcher — from what a person felt to what the tradition calls it.
 * ────────────────────────────────────────────────────────────────────
 * The kundalini-sign layer knows each sign's body center, grounding protocol,
 * and safety tier. This module closes the loop: a person describes a sensation
 * in plain words ("I felt heat rising in my spine during the sit") and gets back
 * the named sign, the grounding protocol, and the correct safety tier.
 *
 * Deterministic keyword matching with a confidence score — no AI call needed,
 * so it works offline and inside practice sessions where latency is felt.
 * Deliberately conservative: only matches above threshold; ambiguity resolves
 * toward the safer sign, and anything reality-adjacent escalates to
 * 'stop-and-support' guidance.
 */

import { KUNDALINI_SIGNS, type KundaliniSign } from '@/data/kundaliniSigns';

const MATCHER_LEXICON: Record<string, string[]> = {
  'spinal-heat': ['heat', 'hot', 'warm', 'burning', 'fire', 'rising', 'spine', 'spinal', 'back', 'sacrum'],
  'kriya-movements': ['shake', 'shaking', 'tremor', 'trembling', 'rocking', 'twitch', 'jerking', 'moved on its own', 'involuntary', 'moving by itself', 'spasm'],
  'root-pressure': ['base', 'root', 'perineum', 'pelvic', 'bottom of the spine', 'pulsing at the base', 'coiled'],
  'emotional-purging': ['cry', 'cried', 'crying', 'tears', 'sobbing', 'grief', 'weeping', 'emotional wave', 'sadness out of nowhere'],
  'bliss-waves': ['bliss', 'joy', 'love', 'ecstasy', 'Euphoria', 'overwhelming happiness', 'waves of love'],
  'paresthesia': ['tingling', 'pins and needles', 'crawling', 'buzzing', 'vibrating', 'numbness', 'prickling'],
  'inner-light': ['light', 'lights', 'colors', 'colours', 'geometric', 'patterns', 'vision', 'visions', 'saw something'],
  'nada-sounds': ['sound', 'sounds', 'humming', 'ringing', 'buzzing in the ears', 'ocean', 'flute', 'tone'],
  'breath-suspension': ['breath stopped', 'stopped breathing', 'breathless', 'breath paused', 'shallow breath', "couldn't breathe", 'held my breath'],
  'time-distortion': ['time', 'timeless', 'minutes felt like', 'hours passed', 'lost track of time', 'fast sit'],
  'sleep-disruption': ['sleep', 'sleepless', 'insomnia', 'woke up', 'waking at night', 'restless night', "couldn't sleep"],
  'ego-dissolution': ['dissolved', 'dissolution', 'no self', 'boundary', 'boundaries dissolved', 'one with', 'merged', 'separate self', 'ego death', 'no boundary'],
  'compassion-surge': ['compassion', 'love for everyone', 'tenderness', 'kindness surged', 'heart opened', 'empathy surge'],
  'reality-contact-loss': ["can't tell what's real", 'cant tell whats real', 'unreal', 'derealization', 'lost touch with reality', "don't know what's real", 'confused about reality', 'seeing things that', 'hearing things that', 'cannot orient'],
};

export interface SignMatch {
  sign: KundaliniSign;
  confidence: number;    // 0..1 keyword overlap strength
  matchedTerms: string[];
}

const SAFETY_RANK = { 'stop-and-support': 3, 'check-in': 2, normal: 1 } as const;

/**
 * Classify a reported sensation. Returns matches above threshold, safest first —
 * so if "unreal heat" could be either spinal heat or reality-contact loss, the
 * reality flag arrives first in the caller's view.
 */
export function matchSign(report: string, limit = 3): SignMatch[] {
  const text = report.toLowerCase();
  const matches: SignMatch[] = [];

  for (const sign of KUNDALINI_SIGNS) {
    const terms = MATCHER_LEXICON[sign.id] ?? [];
    const matchedTerms = terms.filter(t => text.includes(t));
    if (matchedTerms.length === 0) continue;

    const confidence = Math.min(1, matchedTerms.length / Math.max(2, Math.min(terms.length, 3)));
    matches.push({ sign, confidence, matchedTerms });
  }

  return matches
    .filter(m => m.matchedTerms.length >= 2 || m.sign.safety !== 'normal')
    .sort((a, b) => {
      const safety = SAFETY_RANK[b.sign.safety] - SAFETY_RANK[a.sign.safety];
      return safety !== 0 ? safety : b.confidence - a.confidence;
    })
    .slice(0, limit);
}

/** The single best match, or null when the report matches nothing known. */
export function matchSignBest(report: string): SignMatch | null {
  return matchSign(report, 1)[0] ?? null;
}

/** Full guidance payload for a reported sensation — UI and AI context both use this. */
export interface SignGuidance {
  report: string;
  match: SignMatch | null;
  headline: string;
  protocol: string;
  escalate: boolean;
}

export function getSignGuidance(report: string): SignGuidance {
  const match = matchSignBest(report);

  if (!match) {
    return {
      report,
      match: null,
      headline: 'Not in the sign library',
      protocol:
        'The graph does not recognise this sensation. If it is uncomfortable or persistent, treat it as new information — ground with slow breathing, feet on the floor, and name five things you can see.',
      escalate: false,
    };
  }

  const isStop = match.sign.safety === 'stop-and-support';
  return {
    report,
    match,
    headline: isStop ? 'This one needs support, not practice' : `This reads as: ${match.sign.label}`,
    protocol: match.sign.grounding,
    escalate: isStop,
  };
}
