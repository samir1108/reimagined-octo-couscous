/**
 * DAILY GATES — Dynamic Context System (No Rigid Flows)
 * Time is a CONTEXT MODIFIER, not a flow definition.
 * The AI decides what to do — not fixed steps.
 * 
 * Extended with consciousness psychology: V-Level, dimensions, loops, bypassing, circadian rhythms.
 */

// ─── Gate Types ───

export type GateId = 'morning' | 'midday' | 'evening' | 'night';

export function isGateId(value: string | null): value is GateId {
  return value === "morning" || value === "midday" || value === "evening" || value === "night";
}

export interface GateContext {
  id: GateId;
  label: string;
  icon: string;
  timeRange: string;
  theme: string;
  accentColor: string;
  /** What kind of energy this time naturally carries */
  naturalEnergy: 'awakening' | 'active' | 'settling' | 'stillness';
  /** Default conversation depth at this time */
  defaultDepth: 'gentle' | 'moderate' | 'deep' | 'minimal';
  /** Suggested tone modifiers for AI */
  toneModifiers: string[];
  /** Max recommended session duration in minutes */
  maxDurationMinutes: number;
  /** Whether heavy practices should be avoided */
  avoidHeavyPractice: boolean;
  /** Breath pattern [inhale, hold, exhale, rest] in seconds */
  breathPattern: [number, number, number, number];
  /** Default practice family for this gate */
  defaultPracticeFamily: string;
  /** Gate-specific teaching themes */
  teachingThemes: string[];
}

export const GATES: GateContext[] = [
  {
    id: 'morning', label: 'Morning', icon: '🌅', timeRange: '5am–12pm', theme: 'Awakening',
    accentColor: '45 100% 60%',
    naturalEnergy: 'awakening', defaultDepth: 'moderate',
    toneModifiers: ['grounding', 'clarity', 'intention'],
    maxDurationMinutes: 30, avoidHeavyPractice: false,
    breathPattern: [4, 2, 6, 0],
    defaultPracticeFamily: 'energy',
    teachingThemes: ['grounding', 'intention', 'new beginnings', 'body awareness'],
  },
  {
    id: 'midday', label: 'Midday', icon: '☀️', timeRange: '12pm–5pm', theme: 'Presence',
    accentColor: '200 80% 65%',
    naturalEnergy: 'active', defaultDepth: 'gentle',
    toneModifiers: ['brief', 'anchoring', 'micro-awareness'],
    maxDurationMinutes: 10, avoidHeavyPractice: true,
    breathPattern: [4, 4, 4, 4],
    defaultPracticeFamily: 'focus',
    teachingThemes: ['presence in action', 'micro-returns', 'transition awareness'],
  },
  {
    id: 'evening', label: 'Evening', icon: '🌆', timeRange: '5pm–9pm', theme: 'Integration',
    accentColor: '240 60% 50%',
    naturalEnergy: 'settling', defaultDepth: 'deep',
    toneModifiers: ['reflective', 'pattern-linking', 'closure'],
    maxDurationMinutes: 20, avoidHeavyPractice: false,
    breathPattern: [5, 0, 5, 0],
    defaultPracticeFamily: 'healing',
    teachingThemes: ['metabolizing the day', 'pattern recognition', 'release'],
  },
  {
    id: 'night', label: 'Night', icon: '🌙', timeRange: '9pm–5am', theme: 'Sanctuary',
    accentColor: '270 50% 30%',
    naturalEnergy: 'stillness', defaultDepth: 'minimal',
    toneModifiers: ['soothing', 'minimal-words', 'release'],
    maxDurationMinutes: 10, avoidHeavyPractice: true,
    breathPattern: [4, 7, 8, 0],
    defaultPracticeFamily: 'sleep',
    teachingThemes: ['surrender', 'non-doing', 'rest as practice'],
  },
];

// ─── Time Slot Patterns ───

export type TimeSlotPatternId = 'morning-only' | 'all-4' | 'morning-evening' | 'night-only' | 'irregular' | 'weekday-weekend';

export interface TimeSlotPattern {
  id: TimeSlotPatternId;
  label: string;
  description: string;
  slots: Record<GateId, 'full' | 'mini' | 'skip'>;
  /** How AI adapts when user shows up outside their pattern */
  outOfPatternBehavior: string;
}

export const TIME_SLOT_PATTERNS: TimeSlotPattern[] = [
  {
    id: 'morning-only', label: 'Morning Only', description: 'Full morning session, available rest of day',
    slots: { morning: 'full', midday: 'skip', evening: 'skip', night: 'skip' },
    outOfPatternBehavior: 'Welcome warmly, offer brief check-in, no pressure for full session',
  },
  {
    id: 'all-4', label: 'All 4 Gates', description: 'Practice woven through the entire day',
    slots: { morning: 'full', midday: 'full', evening: 'full', night: 'full' },
    outOfPatternBehavior: 'Full depth available at any time',
  },
  {
    id: 'morning-evening', label: 'Morning + Evening', description: 'Bookend your day with awareness',
    slots: { morning: 'full', midday: 'mini', evening: 'full', night: 'skip' },
    outOfPatternBehavior: 'Midday: quick presence anchor only',
  },
  {
    id: 'night-only', label: 'Night Only', description: 'Practice before sleep',
    slots: { morning: 'skip', midday: 'skip', evening: 'skip', night: 'full' },
    outOfPatternBehavior: 'If user shows up during day, treat as bonus — gentle and brief',
  },
  {
    id: 'irregular', label: 'Flexible', description: 'No fixed schedule — practice when moved to',
    slots: { morning: 'mini', midday: 'mini', evening: 'mini', night: 'mini' },
    outOfPatternBehavior: 'Every entry is valid, adapt fully to current state',
  },
  {
    id: 'weekday-weekend', label: 'Weekday Light', description: 'Brief weekdays, deeper weekends',
    slots: { morning: 'mini', midday: 'skip', evening: 'mini', night: 'skip' },
    outOfPatternBehavior: 'Weekday: 5 min max. Weekend: full depth available',
  },
];

// ─── Entry Context (replaces rigid flows) ───

export type EntryContextType =
  | 'fresh_entry'       // First open of the day
  | 'continuation'      // Already engaged today
  | 'return_after_gap'  // 2+ days since last session
  | 'emotional_trigger' // User arrives in reactive state
  | 'exploration'       // Curious, open, browsing
  | 'crisis'            // Acute distress
  | 'celebration'       // User had a breakthrough
  | 'routine_checkin';  // Regular pattern user checking in

export interface EntryContext {
  type: EntryContextType;
  gate: GateContext;
  daysSinceLastSession: number;
  sessionsToday: number;
  isWeekend: boolean;
  userTimePattern: TimeSlotPatternId;
  isOutOfPattern: boolean; // User showing up outside their usual time
  
  // Psychology extensions
  vLevel?: number;
  weakestDimension?: 'thought' | 'emotion' | 'body' | 'action' | 'connection' | 'spirit';
  activeLoops?: string[];
  bypassingRisk?: number;
  dimensionBands?: Record<string, number>;
  circadianType?: 'early-bird' | 'normal' | 'night-owl';
  speedProfile?: 'fast' | 'steady' | 'deep' | 'adaptive';
}

export interface GateSessionConfig {
  focusType: string;
  guideStyle: 'gentle' | 'direct' | 'inquiry' | 'devotional' | 'silent';
  durationMin: number;
  energy: 'low' | 'medium' | 'high' | 'adaptive';
  intent?: string;
  practices: string[]; // Specific practice IDs
  antidotes: string[]; // Loop antidotes for this gate
}

// ─── User Time Profile ───

export interface UserTimeProfile {
  availableSlots: GateId[];
  primarySlot: GateId;
  secondarySlot?: GateId;
  skippedSlots: GateId[];
  flexibleMode: boolean;
  weekdayDurationMinutes: number;
  weekendDurationMinutes: number;
  circadianType: 'early-bird' | 'normal' | 'night-owl';
}

// ─── Helpers ───

export function getCurrentGate(hour: number): GateId {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'midday';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export function getCurrentGateForSchedule(
  date: Date,
  wakeTime?: string | null,
  sleepTime?: string | null,
): GateId {
  const parseMinutes = (time?: string | null): number | null => {
    const match = time?.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) return null;
    return hours * 60 + minutes;
  };

  const wake = parseMinutes(wakeTime);
  const sleep = parseMinutes(sleepTime);
  if (wake === null || sleep === null || wake === sleep) {
    return getCurrentGate(date.getHours());
  }

  const awakeMinutes = (sleep - wake + 1440) % 1440;
  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  const elapsed = (nowMinutes - wake + 1440) % 1440;
  if (elapsed >= awakeMinutes) return 'night';
  if (elapsed < awakeMinutes * 0.25) return 'morning';
  if (elapsed < awakeMinutes * 0.6) return 'midday';
  if (elapsed < awakeMinutes * 0.85) return 'evening';
  return 'night';
}

export function getGateDef(id: GateId): GateContext {
  return GATES.find(g => g.id === id) ?? GATES[0];
}

export function isGateActive(gateId: GateId, pattern: TimeSlotPattern): boolean {
  return pattern.slots[gateId] !== 'skip';
}

/**
 * Determine entry context — the REAL driver of conversation behavior
 */
export function determineEntryContext(
  hour: number,
  daysSinceLastSession: number,
  sessionsToday: number,
  userTimePattern: TimeSlotPatternId,
  emotionalState?: string,
): EntryContext {
  const gateId = getCurrentGate(hour);
  const gate = getGateDef(gateId);
  const pattern = TIME_SLOT_PATTERNS.find(p => p.id === userTimePattern) ?? TIME_SLOT_PATTERNS[4]; // default irregular
  const isOutOfPattern = pattern.slots[gateId] === 'skip';
  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;

  let type: EntryContextType = 'fresh_entry';

  if (emotionalState === 'crisis' || emotionalState === 'distress') {
    type = 'crisis';
  } else if (emotionalState === 'breakthrough' || emotionalState === 'joy') {
    type = 'celebration';
  } else if (emotionalState === 'reactive' || emotionalState === 'anxious' || emotionalState === 'angry') {
    type = 'emotional_trigger';
  } else if (daysSinceLastSession > 2) {
    type = 'return_after_gap';
  } else if (sessionsToday > 0) {
    type = 'continuation';
  } else if (sessionsToday === 0 && daysSinceLastSession <= 1) {
    type = 'fresh_entry';
  }

  return {
    type,
    gate,
    daysSinceLastSession,
    sessionsToday,
    isWeekend,
    userTimePattern,
    isOutOfPattern,
  };
}

/**
 * Get contextual greeting — no rigid scripts, adapts to entry type
 */
export function getGateGreeting(gateId: GateId, daysSinceLastSession: number): string {
  if (daysSinceLastSession > 7) {
    return "You are here now. That is all that matters.";
  }
  if (daysSinceLastSession > 2) {
    return "Welcome back. No guilt, no rush. Just presence.";
  }

  switch (gateId) {
    case 'morning': return 'Good morning. A new day of awareness begins.';
    case 'midday': return 'A moment of stillness in your day.';
    case 'evening': return 'The day is settling. Time to integrate.';
    case 'night': return 'The sanctuary awaits. Rest in awareness.';
  }
}

/**
 * Night guard — prevent heavy practice at late hours
 */
export function getNightGuardMessage(hour: number, attemptedHeavyPractice: boolean): string | null {
  if (hour >= 0 && hour < 5 && attemptedHeavyPractice) {
    return 'Rest now. We will continue with a fresh mind tomorrow.';
  }
  return null;
}

// ─── Adaptive Gate Intelligence ───

/** Loop antidotes per gate — what each gate offers for each pattern */
export const LOOP_ANTIDOTES: Record<string, Record<GateId, string>> = {
  overthinking: {
    morning: 'Morning grounding: 3 breaths before rising breaks the spin before it starts',
    midday: 'Midday anchor: 60s sensation between tasks interrupts the loop',
    evening: 'Evening inquiry: trace one thought to its bodily source — feel, don\'t analyze',
    night: 'Night release: long exhales, no agenda — the loop cannot survive surrender',
  },
  avoidance: {
    morning: 'Morning karma: one small committed action builds momentum',
    midday: 'Midday focus: 10-min single-task container — no escape',
    evening: 'Evening healing: name what you\'re avoiding, feel the edge',
    night: 'Night sanctuary: avoidance rests here too — no pressure',
  },
  perfectionism: {
    morning: 'Morning intention: "good enough" is the practice',
    midday: 'Midday presence: done is better than perfect',
    evening: 'Evening integration: celebrate what completed, release what didn\'t',
    night: 'Night sanctuary: perfectionism has no place in rest',
  },
  numbing: {
    morning: 'Morning sensation: cold water, bare feet, sharp inhale — wake the body',
    midday: 'Midday micro-dose: 30s intense sensation (ice, stretch, breath hold)',
    evening: 'Evening feeling: name the numbness, stay with the edge of it',
    night: 'Night sanctuary: numbness is safe here — no demand to feel',
  },
  comparing: {
    morning: 'Morning uniqueness: your path has never been walked before',
    midday: 'Midday focus: your only metric is presence, not progress',
    evening: 'Evening reflection: compare today\'s you to yesterday\'s you only',
    night: 'Night sanctuary: comparison dissolves in darkness',
  },
};

/** Gate-specific practice recommendations based on consciousness profile */
export const GATE_PRACTICE_MAP: Record<GateId, {
  baseFamily: string;
  vLevelAdjustments: Record<string, { family: string; guideStyle: 'gentle' | 'direct' | 'inquiry' | 'devotional' | 'silent'; durationMod: number }>;
  dimensionAdjustments: Record<string, { family: string; reason: string }>;
  circadianAdjustments: Record<string, { durationMod: number; energy: 'low' | 'medium' | 'high' | 'adaptive' }>;
}> = {
  morning: {
    baseFamily: 'energy',
    vLevelAdjustments: {
      '0-1.5': { family: 'energy', guideStyle: 'gentle', durationMod: -5 },
      '1.5-3': { family: 'energy', guideStyle: 'direct', durationMod: 0 },
      '3-5': { family: 'kundalini', guideStyle: 'inquiry', durationMod: 5 },
      '5+': { family: 'raja_yoga', guideStyle: 'silent', durationMod: 10 },
    },
    dimensionAdjustments: {
      body: { family: 'energy', reason: 'Weakest dimension is body — morning gate prioritizes somatic awakening' },
      emotion: { family: 'bhakti', reason: 'Weakest dimension is emotion — morning heart-opening sets tone' },
      thought: { family: 'focus', reason: 'Weakest dimension is thought — morning concentration anchors mind' },
      spirit: { family: 'self_inquiry', reason: 'Weakest dimension is spirit — morning direct investigation' },
    },
    circadianAdjustments: {
      'early-bird': { durationMod: 5, energy: 'high' },
      'normal': { durationMod: 0, energy: 'adaptive' },
      'night-owl': { durationMod: -5, energy: 'low' },
    },
  },
  midday: {
    baseFamily: 'focus',
    vLevelAdjustments: {
      '0-1.5': { family: 'focus', guideStyle: 'gentle', durationMod: -3 },
      '1.5-3': { family: 'focus', guideStyle: 'direct', durationMod: 0 },
      '3-5': { family: 'attention', guideStyle: 'inquiry', durationMod: 3 },
      '5+': { family: 'attention', guideStyle: 'silent', durationMod: 5 },
    },
    dimensionAdjustments: {
      thought: { family: 'focus', reason: 'Overthinking loop active — midday focus anchors attention' },
      emotion: { family: 'healing', reason: 'Emotional reactivity — midday micro-healing between tasks' },
      body: { family: 'energy', reason: 'Body disconnect — midday movement/sensation micro-practices' },
    },
    circadianAdjustments: {
      'early-bird': { durationMod: 0, energy: 'medium' },
      'normal': { durationMod: 0, energy: 'adaptive' },
      'night-owl': { durationMod: 2, energy: 'high' },
    },
  },
  evening: {
    baseFamily: 'healing',
    vLevelAdjustments: {
      '0-1.5': { family: 'healing', guideStyle: 'gentle', durationMod: -5 },
      '1.5-3': { family: 'healing', guideStyle: 'inquiry', durationMod: 0 },
      '3-5': { family: 'jnana', guideStyle: 'inquiry', durationMod: 5 },
      '5+': { family: 'self_inquiry', guideStyle: 'silent', durationMod: 10 },
    },
    dimensionAdjustments: {
      emotion: { family: 'healing', reason: 'Emotional residue from day — evening metabolization' },
      thought: { family: 'jnana', reason: 'Mental loops — evening discrimination/inquiry' },
      body: { family: 'healing', reason: 'Somatic tension — evening release practices' },
      spirit: { family: 'witnessing', reason: 'Spiritual bypassing — evening witnessing without agenda' },
    },
    circadianAdjustments: {
      'early-bird': { durationMod: -3, energy: 'low' },
      'normal': { durationMod: 0, energy: 'adaptive' },
      'night-owl': { durationMod: 5, energy: 'high' },
    },
  },
  night: {
    baseFamily: 'sleep',
    vLevelAdjustments: {
      '0-1.5': { family: 'sleep', guideStyle: 'gentle', durationMod: -3 },
      '1.5-3': { family: 'sleep', guideStyle: 'gentle', durationMod: 0 },
      '3-5': { family: 'sleep', guideStyle: 'devotional', durationMod: 3 },
      '5+': { family: 'sleep', guideStyle: 'silent', durationMod: 5 },
    },
    dimensionAdjustments: {
      body: { family: 'sleep', reason: 'Body scan for deep release' },
      emotion: { family: 'bhakti', reason: 'Heart-centered surrender' },
      thought: { family: 'sleep', reason: 'Mental quietude — no inquiry needed' },
    },
    circadianAdjustments: {
      'early-bird': { durationMod: 0, energy: 'low' },
      'normal': { durationMod: 0, energy: 'adaptive' },
      'night-owl': { durationMod: 5, energy: 'medium' },
    },
  },
};

/**
 * Get adaptive gate session config based on full consciousness profile
 * This is the main entry point for AI-driven gate personalization
 */
export function getAdaptiveGateConfig(
  gateId: GateId,
  profile: {
    vLevel?: number;
    weakestDimension?: string;
    activeLoops?: string[];
    bypassingRisk?: number;
    dimensionBands?: Record<string, number>;
    circadianType?: 'early-bird' | 'normal' | 'night-owl';
    speedProfile?: 'fast' | 'steady' | 'deep' | 'adaptive';
  }
): GateSessionConfig {
  const gate = getGateDef(gateId);
  const map = GATE_PRACTICE_MAP[gateId];
  const vLevel = profile.vLevel ?? 0;
  const weakestDimension = profile.weakestDimension ?? 'unknown';
  const activeLoops = profile.activeLoops ?? [];
  const bypassingRisk = profile.bypassingRisk ?? 0;
  const circadianType = profile.circadianType ?? 'normal';
  const speedProfile = profile.speedProfile ?? 'adaptive';

  // Base config from gate
  let config: GateSessionConfig = {
    focusType: map.baseFamily,
    guideStyle: 'gentle',
    durationMin: Math.min(gate.maxDurationMinutes, 20),
    energy: 'adaptive',
    practices: [map.baseFamily],
    antidotes: [],
  };

  // Bypassing risk override — highest priority
  if (bypassingRisk > 0.7) {
    config = {
      ...config,
      focusType: 'healing',
      guideStyle: 'gentle',
      durationMin: Math.min(config.durationMin + 5, gate.maxDurationMinutes),
      energy: 'low',
      practices: ['healing', 'body'],
      antidotes: ['Grounding before teaching: 2-min body scan', 'No spiritual concepts until sensation stabilized'],
    };
    return config;
  }

  // V-Level adjustment
  let vLevelKey = '0-1.5';
  if (vLevel >= 5) vLevelKey = '5+';
  else if (vLevel >= 3) vLevelKey = '3-5';
  else if (vLevel >= 1.5) vLevelKey = '1.5-3';
  
  const vLevelAdj = map.vLevelAdjustments[vLevelKey];
  if (vLevelAdj) {
    config = {
      ...config,
      focusType: vLevelAdj.family,
      guideStyle: vLevelAdj.guideStyle,
      durationMin: Math.min(Math.max(config.durationMin + vLevelAdj.durationMod, 5), gate.maxDurationMinutes),
    };
  }

  // Weakest dimension adjustment
  const dimAdj = map.dimensionAdjustments[weakestDimension];
  if (dimAdj && weakestDimension !== 'unknown') {
    config = {
      ...config,
      focusType: dimAdj.family,
      practices: [dimAdj.family, ...config.practices.filter(p => p !== dimAdj.family)],
    };
  }

  // Active loops — add antidotes
  const antidotes: string[] = [];
  for (const loop of activeLoops) {
    const antidote = LOOP_ANTIDOTES[loop]?.[gateId];
    if (antidote) antidotes.push(antidote);
  }
  config.antidotes = antidotes;

  // Circadian adjustment
  const circAdj = map.circadianAdjustments[circadianType];
  if (circAdj) {
    config = {
      ...config,
      durationMin: Math.min(Math.max(config.durationMin + circAdj.durationMod, 5), gate.maxDurationMinutes),
      energy: circAdj.energy,
    };
  }

  // Speed profile adjustment
  if (speedProfile === 'fast') {
    config.durationMin = Math.max(config.durationMin - 3, 5);
    config.guideStyle = 'direct';
  } else if (speedProfile === 'deep') {
    config.durationMin = Math.min(config.durationMin + 5, gate.maxDurationMinutes);
    config.guideStyle = config.guideStyle === 'silent' ? 'silent' : 'inquiry';
  }

  // Ensure duration doesn't exceed gate max
  config.durationMin = Math.min(config.durationMin, gate.maxDurationMinutes);

  return config;
}

/**
 * Get loop antidote for a specific loop at a specific gate
 */
export function getLoopAntidote(loop: string, gateId: GateId): string | null {
  return LOOP_ANTIDOTES[loop]?.[gateId] ?? null;
}

/**
 * Get gate-specific recommendations for UI display
 */
export function getGateRecommendations(
  gateId: GateId,
  profile: {
    vLevel?: number;
    weakestDimension?: string;
    activeLoops?: string[];
    bypassingRisk?: number;
    circadianType?: 'early-bird' | 'normal' | 'night-owl';
  },
  userTimeProfile?: {
    circadianType?: 'early-bird' | 'normal' | 'night-owl';
    availableSlots?: string[];
  }
): string[] {
  const gate = getGateDef(gateId);
  const vLevel = profile.vLevel ?? 0;
  const weakestDimension = profile.weakestDimension;
  const bypassingRisk = profile.bypassingRisk ?? 0;
  const circadianType = userTimeProfile?.circadianType ?? profile.circadianType ?? 'normal';

  const base: Record<GateId, string[]> = {
    morning: [
      'Three conscious breaths before feet leave bed',
      'Set one intention for the day\'s quality of presence',
      'Morning light exposure within 30 min of waking',
    ],
    midday: [
      '60-second sensation anchor between every task',
      'One conscious transition: feel feet, hear sounds, breathe',
      'Micro-practice: 3 breaths before each meeting/message',
    ],
    evening: [
      'Trace one reactive moment to its bodily sensation',
      'Name what completes today — write it, release it',
      'No screens 30 min before sleep gate',
    ],
    night: [
      'Long exhales only — no technique, just release',
      'Lay down tomorrow\'s identity with today\'s clothes',
      'Rest in what remains when nothing is required',
    ],
  };

  let recs = [...base[gateId]];

  if (bypassingRisk > 0.7) {
    recs.unshift('⚠️ Grounding first: 2-min body scan before any teaching');
  }
  if (weakestDimension === 'body' && gateId !== 'morning') {
    recs.unshift('💪 Somatic focus: add 5-min movement/breath before session');
  }
  if (vLevel < 1.5) {
    recs.push('🌱 Gentle mode: shorter duration, more guidance, less silence');
  }
  if (vLevel > 5) {
    recs.push('🧘 Deep mode: extend silence, reduce words, trust the field');
  }
  if (circadianType === 'night-owl' && gateId === 'morning') {
    recs.push('🌙 Night-owl adjustment: softer entry, 10-min max, no pressure');
  }

  return recs.slice(0, 5);
}
