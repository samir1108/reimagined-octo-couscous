/**
 * Behavior Map — classifier for the Stage Handbook markers.
 * ─────────────────────────────────────────────────────────
 * `stageHandbook.ts` holds 8 bands × 30+ behavioral markers ("Reaches for phone
 * within 60 seconds of waking") — the rawest behavioral truth in the system, and
 * until now completely unconnected to the rest of the knowledge graph.
 *
 * This module classifies every marker into:
 *   • a consciousness dimension (thought / emotion / body / action / connection / spirit)
 *   • a chakra center, when the markers name body regions with high precision
 *   • candidate loops from the 300+ library, ranked by lexical overlap
 *
 * Two mechanisms keep it honest:
 *   1. **Lexicon scoring with a confidence field.** Weak matches get low
 *      confidence — the graph carries the uncertainty instead of hiding it.
 *   2. **Curated overrides.** A hand-verified layer for the flagship markers,
 *      marked `curated: true` so the provenance of every edge is knowable.
 *
 * Pure and deterministic: same input → same graph, in tests and production.
 */

import { STAGE_HANDBOOK } from '@/data/stageHandbook';
import { LOOPS } from '@/data/loops';
import type { DimensionId } from '@/types/consciousness';

// ─── Types ───

export type MarkerPolarity = 'behavioral' | 'maturity';

export interface MarkerLoopMatch {
  loopId: string;
  score: number;   // 0..1 edge weight
}

export interface ClassifiedMarker {
  id: string;                              // marker::band::index
  band: number;
  stageSlug: string;
  stageName: string;
  index: number;
  text: string;
  polarity: MarkerPolarity;                // loop signature vs. capacity signature
  dimension: DimensionId;                  // primary dimension
  dimensionScores: Record<DimensionId, number>;
  chakra?: string;                         // chakra node id, high-precision only
  loops: MarkerLoopMatch[];                // empty for maturity markers by design
  confidence: number;                      // 0..1
  curated: boolean;
}

// ─── Lexicons (stems: a token matches if it contains the stem) ───

const DIMENSION_LEXICON: Record<DimensionId, string[]> = {
  thought: [
    'believ', 'think', 'thought', 'story', 'stories', 'narrat', 'mind', 'mental',
    'opinion', 'decid', 'decision', 'analys', 'analyz', 'ruminat', 'expect',
    'assum', 'idea', 'remember', 'recall', 'imagin', 'plan', 'attention',
    'focus', 'concentrat', 'intellect', 'identity', 'label', 'concept', 'word',
    'vocabular', 'goal', 'vision', 'grip', 'opposite', 'strain', 'precision',
    'designs', 'rhythm', 'sufficien', 'search', 'preferred', 'outcome', 'trace',
    'arrived', 'lineage', 'claiming', 'named', 'names', 'projection', 'vault',
    'insight', 'journal', 'documentary', 'diets', 'diet', 'quotes',
  ],
  emotion: [
    'feel', 'emotion', 'angry', 'anger', 'anxiet', 'anxious', 'sad', 'cry',
    'cries', 'crying', 'tears', 'grief', 'joy', 'happy', 'happiness', 'approv',
    'valid', 'resent', 'shame', 'guilt', 'lonel', 'mood', 'frustrat', 'disappoint',
    'irritat', 'vulnerab', 'tender', 'love', 'reject', 'wound', 'forgiv',
    'offence', 'held', 'preference', 'discern', 'devotion', 'surprised',
    'feedback', 'collapse', 'defens', 'numb', 'overwhelm',
  ],
  body: [
    'body', 'breath', 'breathe', 'breathing', 'sleep', 'sleeping', 'slept',
    'eat', 'eaten', 'food', 'stomach', 'jaw', 'shoulder', 'tense', 'tension',
    'posture', 'walk', 'tired', 'exhaust', 'energy', 'hand', 'hands', 'physical',
    'sensat', 'itch', 'pain', 'numb', 'pulse', 'heartbeat', 'waking', 'wake',
    'drink', 'meal', 'eye', 'nervous', 'signature', 'recovers', 'sits', 'sit',
    'still', 'stillness', 'jaw', 'tension', 'carries', 'touch', 'skin',
  ],
  action: [
    'do', 'does', 'done', 'act', 'action', 'task', 'tasks', 'work', 'job',
    'productive', 'busy', 'achiev', 'purchas', 'buy', 'buying', 'shopping',
    'scroll', 'scrolling', 'feed', 'feeds', 'tab', 'tabs', 'phone', 'device',
    'app', 'apps', 'notification', 'habit', 'routine', 'repair', 'mentors',
    'adjusts', 'speaks', 'points', 'protects', 'stopped', 'receives', 'acts',
    'inward', 'time', 'rhythm',
  ],
  connection: [
    'partner', 'friend', 'people', 'others', 'other', 'relationship', 'belong',
    'group', 'social', 'like', 'likes', 'view', 'views', 'follower', 'boss',
    'colleague', 'parent', 'child', 'family', 'team', 'audience', 'solitude',
    'isolation', 'harmed', 'someone', 'trust', 'intimac', 'bond',
  ],
  spirit: [
    'observer', 'witness', 'aware', 'awareness', 'conscious', 'meditat',
    'spiritual', 'soul', 'presence', 'stillness', 'silence', 'silent', 'nature',
    'being', 'autopilot', 'devotion', 'object', 'lineage', 'honoured',
    'looked', 'seeker', 'awaken', 'grasp', 'escape', 'escaping',
  ],
};

// High precision only: two or more hits required for a chakra edge.
const CHAKRA_LEXICON: Record<string, string[]> = {
  muladhara: ['survival', 'secur', 'money', 'salar', 'scarcit', 'pelvic', 'grounding', 'threat', 'safety'],
  svadhisthana: ['sexual', 'sex', 'porn', 'pleasure', 'craving', 'desire', 'appetite', 'alcohol'],
  manipura: ['solar plexus', 'gut', 'stomach', 'willpower', 'control', 'power', 'digest'],
  anahata: ['heart', 'chest', 'love', 'loved', 'grief', 'compassion', 'lonel', 'cry', 'crying', 'tears'],
  vishuddha: ['throat', 'jaw', 'speak', 'voice', 'said', 'saying', 'unsaid', 'swallow', 'apolog'],
  ajna: ['forehead', 'eyebrow', 'dream', 'vision', 'insight', 'imagin', 'perceiv'],
  sahasrara: ['crown', 'oneness', 'unity', 'cosmic', 'transcend'],
};

// Surface words the corpus uses that must match library vocabulary.
const TOKEN_SYNONYMS: Record<string, string[]> = {
  phone: ['phone', 'device', 'screen', 'scroll', 'scrolling'],
  numbs: ['numbing', 'numbness'],
  numbing: ['numbing', 'numbness'],
  journal: ['journaling', 'writing'],
  journalled: ['journaling', 'writing'],
  meditate: ['meditation', 'meditating'],
  meditating: ['meditation', 'meditating'],
  cry: ['crying', 'tears'],
  cries: ['crying', 'tears'],
  criticism: ['criticism', 'criticize', 'critical'],
  approval: ['approval', 'approve', 'validated'],
  likes: ['like', 'likes', 'approval'],
  feed: ['feed', 'feeds', 'doomscroll', 'scrolling'],
  reacting: ['reactive', 'reactivity', 'reaction'],
  reacts: ['reactive', 'reactivity', 'reaction'],
  salary: ['salary', 'salaries', 'promotion'],
  silenced: ['silence', 'silent', 'quiet'],
};

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'are', 'was', 'were', 'has',
  'have', 'had', 'not', 'but', 'all', 'can', 'cannot', 'who', 'what', 'when',
  'where', 'how', 'why', 'into', 'out', 'over', 'under', 'than', 'then', 'them',
  'they', 'their', 'there', 'here', 'about', 'before', 'after', 'during', 'every',
  'each', 'more', 'most', 'less', 'very', 'just', 'only', 'also', 'because', 'been',
  'being', 'does', 'done', 'did', 'get', 'got', 'one', 'two', 'three', 'own',
  'without', 'within', 'while', 'will', 'would', 'could', 'should', 'know', 'knew',
  'never', 'always', 'often', 'sometimes', 'still', 'even', 'like', 'make', 'made',
  'something', 'anything', 'nothing', 'everything', 'someone', 'anyone', 'much',
  'many', 'some', 'other', 'others', 'person', 'people', 'thing', 'things', 'way',
  'day', 'days', 'year', 'years', 'time', 'times', 'first', 'last', 'next',
]);

function tokenize(text: string): string[] {
  const raw = text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .map(t => t.replace(/'s$/, '').replace(/^['-]+|['-]+$/g, ''))
    .filter(t => t.length > 0);

  const expanded: string[] = [];
  for (const token of raw) {
    if (TOKEN_SYNONYMS[token]) {
      expanded.push(...TOKEN_SYNONYMS[token]);
    } else if (token.length >= 4 && !STOPWORDS.has(token)) {
      expanded.push(token);
    }
  }
  return Array.from(new Set(expanded));
}

function stemHits(tokens: string[], stems: string[]): number {
  let hits = 0;
  for (const stem of stems) {
    let count = 0;
    for (const t of tokens) {
      if (t.includes(stem)) count++;
    }
    hits += Math.min(count, 2); // one stem may not dominate the score
  }
  return hits;
}

// ─── Loop matching ───

const LOOP_TOKEN_BAGS = LOOPS.map(loop => {
  const bag = new Map<string, number>();
  const add = (words: string[], weight: number) => {
    for (const w of words) {
      const t = w.toLowerCase().replace(/[^a-z0-9\s]/g, '');
      if (t.length >= 4 && !STOPWORDS.has(t)) {
        bag.set(t, Math.max(bag.get(t) ?? 0, weight));
      }
    }
  };
  add(loop.keywords, 3);
  add(loop.triggers, 2.5);
  add(loop.manifestations, 2.5);
  add(loop.awareness_markers, 2);
  add(loop.name.split(/\s+/), 2);
  add(loop.description.split(/\s+/).filter(w => w.length >= 5), 1);
  return { loop, bag };
});

function matchLoops(tokens: string[]): MarkerLoopMatch[] {
  if (tokens.length === 0) return [];
  const scored: MarkerLoopMatch[] = [];

  for (const { loop, bag } of LOOP_TOKEN_BAGS) {
    let score = 0;
    for (const [loopToken, weight] of bag) {
      for (const t of tokens) {
        if (t === loopToken || t.includes(loopToken) || loopToken.includes(t)) {
          score += weight;
          break;
        }
      }
    }
    if (score >= 5) scored.push({ loopId: loop.id, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map(m => ({
    loopId: m.loopId,
    score: Math.min(0.95, 0.45 + m.score / 40),
  }));
}

// ─── Curated overrides (hand-verified flagship mappings) ───

export interface MarkerOverride {
  match: string;                        // case-insensitive substring of the marker
  loops?: string[];
  dimension?: DimensionId;
  chakra?: string;
}

export const MARKER_OVERRIDES: MarkerOverride[] = [
  { match: 'Reaches for phone within 60 seconds', loops: ['ATT168', 'AVD147'], dimension: 'body', chakra: 'muladhara' },
  { match: "this is just who I am", loops: ['ATT155'], dimension: 'thought' },
  { match: 'Nums with food, alcohol, porn', loops: ['AVD121', 'AVD113', 'VAL038'], dimension: 'body' },
  { match: 'Outsources self-worth to likes', loops: ['VAL003', 'VAL004'], dimension: 'emotion', chakra: 'anahata' },
  { match: 'Says yes when the body is screaming no', loops: ['VAL001', 'VAL017'], dimension: 'body', chakra: 'vishuddha' },
  { match: 'Apologises reflexively', loops: ['VAL026'], dimension: 'emotion' },
  { match: 'Confuses opinion with identity', loops: ['ATT155', 'VAL025'], dimension: 'thought' },
  { match: 'Loses three hours to a feed', loops: ['AVD147', 'ATT168', 'VAL038'], dimension: 'action' },
  { match: 'Mistakes anxiety for being productive', loops: ['VAL008', 'VAL036'], dimension: 'emotion' },
  { match: 'Has not cried in over a year', loops: ['CTL087', 'AVD132'], dimension: 'emotion', chakra: 'anahata' },
  { match: 'Avoids silence; fills every car ride', loops: ['AVD147', 'RUM001'], dimension: 'body' },
  { match: 'Believes happiness will arrive after', loops: ['ATT200', 'NAR266'], dimension: 'thought' },
  { match: 'Defines themselves by their job title', loops: ['VAL036', 'ATT155'], dimension: 'thought' },
  { match: 'Reacts to criticism with either collapse', loops: ['VAL002', 'SRV331'], dimension: 'emotion' },
  // ─── behavioral stragglers from the gap audit ───
  { match: 'Cannot recall what was eaten', loops: ['HAB013'], dimension: 'body' },
  { match: "don't have time' to anything inward", loops: ['PRD001'], dimension: 'action' },
  { match: 'journal that is 40% used', loops: ['VAL038'], dimension: 'action' },
  { match: 'documentary on consciousness per month', loops: ['VAL038'], dimension: 'action' },
  { match: 'crystals, oracle decks, or astrology', loops: ['SPR007'], dimension: 'thought' },
  { match: "Diagnoses other people's loops cleanly", loops: ['VAL018'], dimension: 'thought' },
  { match: 'Notion or Obsidian vault', loops: ['VAL018'], dimension: 'action' },
  { match: 'diets in the name of clarity', loops: ['CTL064'], dimension: 'body' },
  { match: 'Quotes Rumi but has not journalled', loops: ['VAL009'], dimension: 'thought' },
];

/**
 * Maturity markers — positive capacity signatures ("Forgives without
 * forgetting", "Holds opposites without strain"). They are what development
 * LOOKS like at a band, not what dysfunction looks like, so they carry no
 * loop edges by design. A marker appearing here skips loop classification.
 */
export const MATURITY_MARKER_MATCHES: string[] = [
  'Can sit for 20 minutes',
  'Catches reactivity within seconds',
  'Sees a recurring loop and names it',
  'Sits with joy without grasping',
  'Notices when the day was lived from autopilot',
  'Withdraws projections',
  'Receives feedback without collapse',
  'Forgives without forgetting',
  'Has done one act of repair',
  'Recovers from being thrown',
  'Knows their nervous-system signature',
  'Speaks less, weighs more',
  'Holds vision without grip',
  'Forgives quickly because the offence',
  'Recognises the difference between solitude',
  'Has a clear daily rhythm and protects it',
  'Designs daily rhythm with the precision',
  'Mentors without claiming students',
  'Has stopped trying to be all things',
  'Operates from sufficiency',
  'Speaks and is later surprised',
  'Feels held even in difficulty',
  'Forgives instantly',
  'Loves without preference',
  'Holds opposites without strain',
  'Lets others be exactly where they are',
  'Devotion is no longer about an object',
  'No longer searches',
  'Speaks little, points often',
  'Acts without claiming the act',
  'Witnesses without claiming the witness',
  'Lineage is honoured',
  'Has no preferred state',
  'Has no preferred outcome',
  'Carries no trace',
  'Is what was being looked for',
];

function findOverride(text: string): MarkerOverride | undefined {
  const lower = text.toLowerCase();
  return MARKER_OVERRIDES.find(o => lower.includes(o.match.toLowerCase()));
}

// ─── Classification ───

function classifyMarker(band: number, stageSlug: string, stageName: string, index: number, text: string): ClassifiedMarker {
  const tokens = tokenize(text);

  // Dimension scores
  const dimensionScores = {} as Record<DimensionId, number>;
  let bestDim: DimensionId = 'thought';
  let bestHits = 0;
  for (const dim of Object.keys(DIMENSION_LEXICON) as DimensionId[]) {
    const hits = stemHits(tokens, DIMENSION_LEXICON[dim]);
    dimensionScores[dim] = hits;
    if (hits > bestHits) {
      bestHits = hits;
      bestDim = dim;
    }
  }

  // Chakra (high precision: ≥2 hits)
  let chakra: string | undefined;
  for (const [chakraId, stems] of Object.entries(CHAKRA_LEXICON)) {
    if (stemHits(tokens, stems) >= 2) {
      chakra = chakraId;
      break;
    }
  }

  const base = { id: `marker::${band}::${index}`, band, stageSlug, stageName, index, text };

  // Maturity markers: capacity signatures — no loop edges by design
  const isMaturity = MATURITY_MARKER_MATCHES.some(m => text.includes(m));
  if (isMaturity) {
    return {
      ...base,
      polarity: 'maturity',
      dimension: bestDim,
      dimensionScores,
      chakra,
      loops: [],
      confidence: bestHits > 0 ? Math.min(0.9, 0.7 + bestHits * 0.05) : 0.6,
      curated: true,
    };
  }

  const loops = matchLoops(tokens);
  const override = findOverride(text);

  if (override) {
    return {
      ...base,
      polarity: 'behavioral',
      dimension: override.dimension ?? bestDim,
      dimensionScores,
      chakra: override.chakra ?? chakra,
      loops: (override.loops ?? []).map(loopId => ({ loopId, score: 0.9 })),
      confidence: 0.95,
      curated: true,
    };
  }

  const confidence = bestHits > 0 ? Math.min(0.9, 0.5 + bestHits * 0.1) : 0.25;

  return {
    ...base,
    polarity: 'behavioral',
    dimension: bestDim,
    dimensionScores,
    chakra,
    loops,
    confidence,
    curated: false,
  };
}

let markerCache: ClassifiedMarker[] | null = null;

export function classifyStageMarkers(): ClassifiedMarker[] {
  if (markerCache) return markerCache;

  const markers: ClassifiedMarker[] = [];
  for (const stage of STAGE_HANDBOOK) {
    stage.markers.forEach((text, index) => {
      markers.push(classifyMarker(stage.band, stage.slug, stage.name, index, text));
    });
  }

  markerCache = markers;
  return markers;
}

export function resetMarkerCache(): void {
  markerCache = null;
}
