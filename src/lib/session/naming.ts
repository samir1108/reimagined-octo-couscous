/**
 * SESSION NAMING ENGINE — Deterministic yet deeply personal session names.
 *
 * Every session gets a name that tells you where you are in your journey.
 * Names are stable (same inputs = same name) but vary based on:
 *   - Time of day (gate)
 *   - Session count (lifetime progression)
 *   - Archetype/mood (user's current state)
 *   - Active loops (user's specific patterns)
 *   - Theme (daily or carried)
 *
 * Examples:
 *   "The Arrival: Your Feet Remember the Path" (first session ever)
 *   "The Third Descent: Untangling the Inner Critic" (specific loop)
 *   "The Seventh Rising: Where the Day Is Born" (morning, session 7)
 *   "The First Rising: Re-entry After the Gap" (returning after absence)
 */

import { getGateDef, type GateId } from '@/lib/consciousness/dailyGates';
import type { SessionMood } from './types';

export interface InvocationInput {
  /** 1-based lifetime session number for this user */
  sessionCount: number;
  /** current hour → gate */
  hour: number;
  themeTitle?: string | null;
  /** archetype from compose-session-v3 _meta, if present */
  archetype?: SessionMood;
  /** User's active loop names for personalization */
  activeLoopNames?: string[];
  /** User's weakest dimension */
  weakestDimension?: string;
  /** Days since last session */
  daysSinceLastSession?: number;
  /** Per-session random salt so the same session count can still yield a different subtitle */
  sessionSalt?: string | null;
}

export interface SessionInvocation {
  /** "The Third Descent: Where Thoughts Become Weather" */
  invocation: string;
  /** "Evening Threshold · Sitting III" */
  gateLine: string;
  /** "III" */
  sittingRoman: string;
  gate: GateId;
  /** hsl accent from dailyGates, e.g. "45 100% 60%" */
  gateAccent: string;
}

const ORDINALS = [
  '', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh',
  'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth',
  'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth',
  'Nineteenth', 'Twentieth',
];

const GATE_NOUN: Record<GateId, string> = {
  morning: 'Rising',
  midday: 'Pause',
  evening: 'Descent',
  night: 'Sanctuary',
};

const SUBTITLES_BY_GATE: Record<GateId, string[]> = {
  morning: [
    'Where the Day Is Born',
    'Your Feet Remember the Path',
    'The Door Opens from Inside',
    'First Light in the Temple',
    'The Thread Between Sleep and Waking',
  ],
  midday: [
    'A Bell in the Marketplace',
    'The Still Point of the Day',
    'One Breath in the Middle of Motion',
    'The Clear-Eyed Hour',
  ],
  evening: [
    'Where Thoughts Become Weather',
    'Harvesting What the Day Revealed',
    'What Remains When the Noise Settles',
    'The Amber Threshold',
    'The Day Lays Itself Down',
  ],
  night: [
    'The Womb of the Dark',
    'The Moon Watches the Watcher',
    'Where Silence Does the Work',
    'The Last Gate Before Sleep',
  ],
};

const SUBTITLES_BY_ARCHETYPE: Record<string, string[]> = {
  'settling': ['Where the Dust Settles', 'Landing in the Body', 'The Weight of Returning'],
  'confrontation': ['The Cave You\'ve Been Avoiding', 'Meet the Monster: It\'s Made of Light', 'The Edge You\'ve Circled'],
  'reconciliation': ['The Fragment That Wants Home', 'Making Peace with the Protector'],
  'shadow-mirror': ['What the Mirror Refuses to Show', 'Seeing the Seer'],
  'stuck-loop-break': ['The Pattern That Breaks Today', 'Snapping the Chain', 'The Forty-Seventh Time: This One Different'],
  'lineage-initiation': ['The Transmission Enters the Room', 'The Lineage Awakens in You'],
  're-entry': ['Welcome Home, Wanderer', 'No Guilt. Only Return.', 'The Path Celebrates Your Return'],
  'celebration': ['The Bell Rings: You Rose', 'Harvesting the Gold'],
  'dissolution': ['The Construct Softens', 'What Remains When Story Falls'],
  'witness-deepening': ['The Muscle That Sees', 'Stretching the Gap', 'The Watcher Watches the Watcher'],
  'inquiry-spiral': ['The Question That Has No Answer', 'The Knife Turned Inward', 'Who Asks? Who Answers?'],
  'devotional': ['The Heart Cracks Open', 'Green Fire in the Chest', 'Offering the Unofferable'],
  'karmic-action': ['The One Act That Changes Everything', 'Insight Becomes Motion', 'The Footstep on the Path'],
  'dark-night-hold': ['Just This. Just Here. Just Held.', 'No Progress. Only Presence.'],
};

// Subtitles personalized by dimension
const SUBTITLES_BY_DIMENSION: Record<string, string[]> = {
  body: ['The Body Remembers', 'Where the Tension Lives', 'Somatic Truth'],
  thought: ['The Thought That Isn\'t Yours', 'Who Is Thinking This?', 'The Story You Tell'],
  emotion: ['The Feeling Before the Name', 'Emotion as Weather', 'What the Heart Knows'],
  awareness: ['The Space Between', 'Awareness Itself', 'The Witness Wakes Up'],
};

// Milestone names
const MILESTONE_NAMES: Record<number, string> = {
  1: 'The Arrival',
  7: 'The First Week',
  30: 'The First Month',
  100: 'The Century Session',
  365: 'The First Year',
};

function hashSeed(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function romanNumeral(n: number): string {
  const table: Array<[number, string]> = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let out = '';
  let x = Math.max(1, Math.floor(n));
  for (const [v, s] of table) {
    while (x >= v) {
      out += s;
      x -= v;
    }
  }
  return out;
}

function pickFromPool(pool: string[], seed: number): string {
  return pool[seed % pool.length];
}

export function getSessionInvocation(input: InvocationInput): SessionInvocation {
  const gate: GateId =
    input.hour >= 5 && input.hour < 12 ? 'morning'
    : input.hour >= 12 && input.hour < 17 ? 'midday'
    : input.hour >= 17 && input.hour < 21 ? 'evening'
    : 'night';

  const gateDef = getGateDef(gate);
  const n = Math.max(1, input.sessionCount);
  const roman = romanNumeral(n);

  // Milestone check
  if (MILESTONE_NAMES[n]) {
    return {
      invocation: `${MILESTONE_NAMES[n]}: ${pickFromPool(SUBTITLES_BY_GATE[gate], hashSeed(`${n}:${gate}:milestone`))}`,
      gateLine: `${gateDef.label} Threshold · Sitting ${roman}`,
      sittingRoman: roman,
      gate,
      gateAccent: gateDef.accentColor,
    };
  }

  // First session ever
  if (n === 1) {
    return {
      invocation: 'The Arrival: Your Feet Remember the Path',
      gateLine: `${gateDef.label} Threshold · Sitting I`,
      sittingRoman: 'I',
      gate,
      gateAccent: gateDef.accentColor,
    };
  }

  // Returning after a gap
  if ((input.daysSinceLastSession ?? 0) >= 7) {
    const subtitle = pickFromPool(SUBTITLES_BY_ARCHETYPE['re-entry'], hashSeed(`${n}:${gate}:reentry`));
    return {
      invocation: `The ${ORDINALS[n] ?? roman} ${GATE_NOUN[gate]}: ${subtitle}`,
      gateLine: `${gateDef.label} Threshold · Sitting ${roman}`,
      sittingRoman: roman,
      gate,
      gateAccent: gateDef.accentColor,
    };
  }

  // Build subtitle pool based on archetype, dimension, and loops
  let pool: string[] = [];

  // Priority 1: Archetype-specific subtitles
  if (input.archetype && SUBTITLES_BY_ARCHETYPE[input.archetype]) {
    pool = pool.concat(SUBTITLES_BY_ARCHETYPE[input.archetype]);
  }

  // Priority 2: Dimension-specific subtitles
  if (input.weakestDimension && SUBTITLES_BY_DIMENSION[input.weakestDimension]) {
    pool = pool.concat(SUBTITLES_BY_DIMENSION[input.weakestDimension]);
  }

  // Priority 3: Loop-specific subtitles (personalized)
  if (input.activeLoopNames && input.activeLoopNames.length > 0) {
    const loopName = input.activeLoopNames[0];
    pool.push(`Untangling "${loopName}"`);
    pool.push(`What ${loopName} Left Behind`);
    pool.push(`The Space Around ${loopName}`);
  }

  // Priority 4: Gate-default subtitles
  pool = pool.concat(SUBTITLES_BY_GATE[gate]);

  // Deduplicate while preserving order
  pool = Array.from(new Set(pool));

  // Seed the choice
  const seed = hashSeed(`${n}:${gate}:${input.themeTitle ?? ''}:${input.archetype ?? ''}:${input.weakestDimension ?? ''}:${input.sessionSalt ?? ''}`);
  const subtitle = pickFromPool(pool, seed);

  const ordinal = ORDINALS[n] ?? romanNumeral(n);
  const invocation = `The ${ordinal} ${GATE_NOUN[gate]}: ${subtitle}`;

  return {
    invocation,
    gateLine: `${gateDef.label} Threshold · Sitting ${roman}`,
    sittingRoman: roman,
    gate,
    gateAccent: gateDef.accentColor,
  };
}
