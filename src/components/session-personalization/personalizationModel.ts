/**
 * personalizationModel — canonical model behind the Session Studio.
 *
 * Pure functions that turn one ExtendedSessionConfiguration into the
 * layer summaries, personalization depth, semantic conflicts and staged
 * AI diffs rendered by SessionStudio. No I/O, no React.
 */

import {
  DEFAULT_EXTENDED_CONFIG,
  ExtendedSessionConfiguration,
  FOCUS_TYPES,
  GUIDE_STYLES,
  LIFE_DOMAINS,
  getFocusType,
  getGuideStyle,
} from '@/types/session-config';

export type PersonalizationLayerId =
  | 'intent'
  | 'shape'
  | 'guidance'
  | 'priorities'
  | 'access'
  | 'advanced';

export type PersonalizationSource = 'default' | 'user' | 'preset' | 'ai';

export interface PersonalizationSignal {
  path: string;
  label: string;
  display: string;
  layer: PersonalizationLayerId;
  customized: boolean;
  source: PersonalizationSource;
}

export interface PersonalizationLayer {
  id: PersonalizationLayerId;
  label: string;
  description: string;
  summary: string;
  signals: PersonalizationSignal[];
  customizedCount: number;
}

export interface PersonalizationConflict {
  id: string;
  severity: 'warning' | 'blocking';
  message: string;
  paths: string[];
  resolution: string;
}

export interface PersonalizationView {
  depth: number;
  depthLabel: 'Essential' | 'Tailored' | 'Deep' | 'Master';
  activeSignals: number;
  totalSignals: number;
  layers: PersonalizationLayer[];
  conflicts: PersonalizationConflict[];
  primaryDomains: { id: string; label: string; emoji: string; weight: number }[];
  practiceTargets: { id: string; level: number; priority: string }[];
  shadowTargets: { id: string; name: string; priority: string }[];
  masters: { practice: string; name: string }[];
  safeguards: { label: string; detail: string }[];
}

export interface ConfigChange {
  path: string;
  label: string;
  before: unknown;
  after: unknown;
  displayBefore: string;
  displayAfter: string;
}

export const LAYER_META: Record<
  PersonalizationLayerId,
  { label: string; description: string }
> = {
  intent: {
    label: 'Intent & Focus',
    description: 'What this session is for and what it practices',
  },
  shape: {
    label: 'Session Shape',
    description: 'Length, energy, timing and intensity',
  },
  guidance: {
    label: 'Guidance & Reflection',
    description: 'How the session is led and how deeply you reflect',
  },
  priorities: {
    label: 'Life Priorities',
    description: 'Which life areas receive the practice',
  },
  access: {
    label: 'Access Needs',
    description: 'Voice, motion and screen-reader support',
  },
  advanced: {
    label: 'Advanced Controls',
    description: 'Practices, safeguards, personas, schedules and continuity',
  },
};

const PATH_LABELS: Record<string, string> = {
  focusType: 'Practice focus',
  timeBudgetMin: 'Duration',
  energyMode: 'Energy',
  preferredGate: 'Preferred time',
  speedProfile: 'Progression pace',
  difficultyOverride: 'Difficulty',
  structure: 'Guidance level',
  reflectionDepth: 'Reflection depth',
  guideStyle: 'Guide style',
  domainWeights: 'Life priorities',
  includedPracticeIds: 'Included practices',
  excludedPracticeIds: 'Excluded practices',
  includedTags: 'Included tags',
  excludedTags: 'Excluded tags',
  archetypeWeights: 'Session shape weights',
  ingredientPreferences: 'Ingredient preferences',
  practiceLevelTargets: 'Practice-level targets',
  microTechniques: 'Micro-techniques',
  shadowTargets: 'Shadow / wound work',
  resistanceRules: 'Resistance rules',
  crisisProtocols: 'Crisis protocols',
  masterPersonas: 'Master personas',
  weeklyPattern: 'Weekly pattern',
  progressionContracts: 'Progression contracts',
  externalSignals: 'External signals',
  sessionContinuity: 'Session continuity',
  cyclicalAlignment: 'Seasonal alignment',
  outcomeTracking: 'Outcome tracking',
  socialConfig: 'Social mode',
  intent: 'Intent',
  language: 'Language',
  voiceEnabled: 'Voice guidance',
  reducedMotion: 'Reduced motion',
  screenReaderOptimized: 'Screen-reader pacing',
};

const DOMAIN_LABELS: Record<string, string> = {
  relationship: 'Relationships',
  work: 'Work & Career',
  finance: 'Finance',
  health: 'Health',
  creativity: 'Creativity',
  spirituality: 'Spirituality',
};

export function labelForPath(path: string): string {
  if (PATH_LABELS[path]) return PATH_LABELS[path];
  if (path.startsWith('domainWeights.')) {
    return DOMAIN_LABELS[path.split('.')[1]] ?? path;
  }
  if (path.startsWith('practiceLevelTargets.')) {
    return `${path.split('.')[1]} target level`;
  }
  if (path.startsWith('microTechniques.')) {
    return `${path.split('.')[1]} micro-techniques`;
  }
  if (path.startsWith('masterPersonas.')) {
    return `${path.split('.')[1]} master`;
  }
  if (path.startsWith('shadowTargets.')) {
    return 'Shadow / wound work';
  }
  return path;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ');
}

export function describeValue(path: string, value: unknown): string {
  if (value === undefined || value === null || value === '') return 'Not set';
  if (typeof value === 'boolean') return value ? 'On' : 'Off';
  if (typeof value === 'number') {
    if (path === 'timeBudgetMin') return `${value} min`;
    if (path.startsWith('domainWeights.')) return `${Math.round(value * 100)}%`;
    if (path.endsWith('targetLevel')) return `Level ${value}`;
    return String(value);
  }
  if (typeof value === 'string') {
    if (path === 'focusType') return getFocusType(value as never).label;
    if (path === 'guideStyle') return getGuideStyle(value as never).label;
    if (path === 'intent') return value;
    return capitalize(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return 'None';
    if (path === 'shadowTargets.active') {
      return value
        .map((t) => (t && typeof t === 'object' ? (t as { name?: string }).name : t))
        .filter(Boolean)
        .join(', ');
    }
    return value
      .map((entry) =>
        entry && typeof entry === 'object'
          ? Object.values(entry as Record<string, unknown>).filter(Boolean).join(' ')
          : String(entry),
      )
      .join(', ');
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return 'None';
    if (path === 'practiceLevelTargets') {
      return entries
        .map(([id, target]) => {
          const t = target as { targetLevel?: number; priority?: string };
          return `${id} L${t.targetLevel ?? '—'} (${t.priority ?? 'medium'})`;
        })
        .join(', ');
    }
    if (path === 'masterPersonas') {
      return entries.map(([practice, master]) => `${practice} → ${master}`).join(', ');
    }
    if (path === 'shadowTargets') {
      const active = (value as { active?: unknown[] }).active ?? [];
      return `${active.length} active`;
    }
    return entries
      .slice(0, 3)
      .map(([key, entry]) => `${key}: ${describeValue(key, entry)}`)
      .join(', ');
  }
  return String(value);
}

function sameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function diffConfigPatch(
  config: ExtendedSessionConfiguration,
  patch: Record<string, unknown>,
): ConfigChange[] {
  const changes: ConfigChange[] = [];
  for (const [path, after] of Object.entries(patch ?? {})) {
    const before = (config as unknown as Record<string, unknown>)[path];
    if (sameValue(before, after)) continue;
    changes.push({
      path,
      label: labelForPath(path),
      before,
      after,
      displayBefore: describeValue(path, before),
      displayAfter: describeValue(path, after),
    });
  }
  return changes;
}

export function applyConfigChanges(
  config: ExtendedSessionConfiguration,
  changes: ConfigChange[],
): Partial<ExtendedSessionConfiguration> {
  const patch: Record<string, unknown> = {};
  for (const change of changes) {
    patch[change.path] = change.after;
  }
  return patch as Partial<ExtendedSessionConfiguration>;
}

function buildSignals(
  config: ExtendedSessionConfiguration,
  provenance: Record<string, PersonalizationSource>,
): PersonalizationSignal[] {
  const defaults = DEFAULT_EXTENDED_CONFIG;
  const source = (path: string): PersonalizationSource => provenance[path] ?? 'user';

  const push = (
    path: string,
    display: string,
    layer: PersonalizationLayerId,
    customized: boolean,
  ): PersonalizationSignal => ({
    path,
    label: labelForPath(path),
    display,
    layer,
    customized,
    source: customized ? source(path) : 'default',
  });

  const signals: PersonalizationSignal[] = [];

  signals.push(
    push(
      'intent',
      config.intent ? config.intent : 'Not set',
      'intent',
      Boolean(config.intent),
    ),
  );
  signals.push(
    push(
      'focusType',
      getFocusType(config.focusType).label,
      'intent',
      config.focusType !== defaults.focusType,
    ),
  );

  signals.push(
    push('timeBudgetMin', `${config.timeBudgetMin} min`, 'shape', config.timeBudgetMin !== defaults.timeBudgetMin),
  );
  signals.push(
    push('energyMode', capitalize(config.energyMode), 'shape', config.energyMode !== defaults.energyMode),
  );
  signals.push(
    push('preferredGate', capitalize(config.preferredGate), 'shape', config.preferredGate !== defaults.preferredGate),
  );
  signals.push(
    push('speedProfile', capitalize(config.speedProfile), 'shape', config.speedProfile !== defaults.speedProfile),
  );
  signals.push(
    push(
      'difficultyOverride',
      capitalize(config.difficultyOverride),
      'shape',
      config.difficultyOverride !== defaults.difficultyOverride,
    ),
  );

  signals.push(
    push('structure', capitalize(config.structure), 'guidance', config.structure !== defaults.structure),
  );
  signals.push(
    push(
      'reflectionDepth',
      capitalize(config.reflectionDepth),
      'guidance',
      config.reflectionDepth !== defaults.reflectionDepth,
    ),
  );
  signals.push(
    push('guideStyle', getGuideStyle(config.guideStyle).label, 'guidance', config.guideStyle !== defaults.guideStyle),
  );

  for (const domain of LIFE_DOMAINS) {
    const value = config.domainWeights[domain.id] ?? 0.5;
    const defaultValue = defaults.domainWeights[domain.id] ?? 0.5;
    signals.push(
      push(
        `domainWeights.${domain.id}`,
        `${Math.round(value * 100)}%`,
        'priorities',
        Math.abs(value - defaultValue) > 0.001,
      ),
    );
  }

  signals.push(
    push('voiceEnabled', config.voiceEnabled ? 'On' : 'Off', 'access', config.voiceEnabled !== defaults.voiceEnabled),
  );
  signals.push(
    push(
      'reducedMotion',
      config.reducedMotion ? 'On' : 'Off',
      'access',
      config.reducedMotion !== defaults.reducedMotion,
    ),
  );
  signals.push(
    push(
      'screenReaderOptimized',
      config.screenReaderOptimized ? 'On' : 'Off',
      'access',
      config.screenReaderOptimized !== defaults.screenReaderOptimized,
    ),
  );
  signals.push(
    push('language', capitalize(config.language), 'access', config.language !== defaults.language),
  );

  const advanced: Array<[string, unknown, unknown]> = [
    ['includedPracticeIds', config.includedPracticeIds, defaults.includedPracticeIds],
    ['excludedPracticeIds', config.excludedPracticeIds, defaults.excludedPracticeIds],
    ['includedTags', config.includedTags, defaults.includedTags],
    ['excludedTags', config.excludedTags, defaults.excludedTags],
    ['archetypeWeights', config.archetypeWeights, defaults.archetypeWeights],
    ['ingredientPreferences', config.ingredientPreferences, defaults.ingredientPreferences],
    ['practiceLevelTargets', config.practiceLevelTargets, defaults.practiceLevelTargets],
    ['microTechniques', config.microTechniques, defaults.microTechniques],
    ['shadowTargets', config.shadowTargets, defaults.shadowTargets],
    ['resistanceRules', config.resistanceRules, defaults.resistanceRules],
    ['crisisProtocols', config.crisisProtocols, defaults.crisisProtocols],
    ['masterPersonas', config.masterPersonas, defaults.masterPersonas],
    ['weeklyPattern', config.weeklyPattern, defaults.weeklyPattern],
    ['progressionContracts', config.progressionContracts, defaults.progressionContracts],
    ['externalSignals', config.externalSignals, defaults.externalSignals],
    ['sessionContinuity', config.sessionContinuity, defaults.sessionContinuity],
    ['cyclicalAlignment', config.cyclicalAlignment, defaults.cyclicalAlignment],
    ['outcomeTracking', config.outcomeTracking, defaults.outcomeTracking],
    ['socialConfig', config.socialConfig, defaults.socialConfig],
  ];

  for (const [path, value, defaultValue] of advanced) {
    const customized = !sameValue(value, defaultValue);
    signals.push(push(path, describeValue(path, value), 'advanced', customized));
  }

  return signals;
}

export function collectConflicts(config: ExtendedSessionConfiguration): PersonalizationConflict[] {
  const conflicts: PersonalizationConflict[] = [];

  if (config.reflectionDepth === 'deep' && config.timeBudgetMin < 10) {
    conflicts.push({
      id: 'deep-reflection-short-session',
      severity: 'blocking',
      message: `Deep reflection needs at least 10 minutes — this session is ${config.timeBudgetMin} min.`,
      paths: ['reflectionDepth', 'timeBudgetMin'],
      resolution: 'Shorten reflection to standard, or extend the session to 10+ minutes.',
    });
  }

  if (config.reflectionDepth === 'standard' && config.timeBudgetMin < 3) {
    conflicts.push({
      id: 'standard-reflection-short-session',
      severity: 'warning',
      message: `Standard reflection needs 3+ minutes — this session is ${config.timeBudgetMin} min.`,
      paths: ['reflectionDepth', 'timeBudgetMin'],
      resolution: 'Use micro reflection or extend the session.',
    });
  }

  if (config.difficultyOverride === 'harder' && config.energyMode === 'low') {
    conflicts.push({
      id: 'hard-difficulty-low-energy',
      severity: 'warning',
      message: 'Harder practice on low energy raises the chance of a forced session.',
      paths: ['difficultyOverride', 'energyMode'],
      resolution: 'Raise energy to medium, or set difficulty to standard.',
    });
  }

  if (config.guideStyle === 'silent' && config.structure === 'guided') {
    conflicts.push({
      id: 'silent-guide-guided-structure',
      severity: 'warning',
      message: 'A silent guide cannot provide step-by-step guidance.',
      paths: ['guideStyle', 'structure'],
      resolution: 'Use hybrid or self-directed structure with a silent guide.',
    });
  }

  const included = new Set(config.includedPracticeIds ?? []);
  const excluded = new Set(config.excludedPracticeIds ?? []);
  const overlap = [...included].filter((id) => excluded.has(id));
  if (overlap.length > 0) {
    conflicts.push({
      id: 'included-excluded-overlap',
      severity: 'blocking',
      message: `${overlap.join(', ')} ${overlap.length === 1 ? 'is' : 'are'} both included and excluded.`,
      paths: ['includedPracticeIds', 'excludedPracticeIds'],
      resolution: 'Remove the practice from one of the two lists.',
    });
  }

  const requiredExcluded = Object.entries(config.practiceLevelTargets ?? {})
    .filter(([, target]) => target?.priority === 'required')
    .map(([id]) => id)
    .filter((id) => excluded.has(id));
  if (requiredExcluded.length > 0) {
    conflicts.push({
      id: 'required-excluded-practice',
      severity: 'blocking',
      message: `${requiredExcluded.join(', ')} ${requiredExcluded.length === 1 ? 'is' : 'are'} required but excluded.`,
      paths: ['practiceLevelTargets', 'excludedPracticeIds'],
      resolution: 'Exclusion wins — remove it from the excluded list or lower the priority.',
    });
  }

  const domainValues = LIFE_DOMAINS.map((domain) => config.domainWeights[domain.id] ?? 0.5);
  if (domainValues.every((value) => value <= 0)) {
    conflicts.push({
      id: 'all-domains-zero',
      severity: 'warning',
      message: 'Every life priority is at zero, so practice selection has no signal to follow.',
      paths: ['domainWeights'],
      resolution: 'Raise at least one life priority.',
    });
  }

  const focus = FOCUS_TYPES.find((entry) => entry.id === config.focusType);
  if (focus && config.preferredGate !== 'flexible' && !focus.suitableGates.includes(config.preferredGate as never)) {
    conflicts.push({
      id: 'focus-gate-mismatch',
      severity: 'blocking',
      message: `${focus.label} does not fit the ${config.preferredGate} gate.`,
      paths: ['focusType', 'preferredGate'],
      resolution: `Use ${focus.suitableGates.join(', ')} or choose a flexible time.`,
    });
  }

  return conflicts;
}

function summarizeLayer(
  id: PersonalizationLayerId,
  signals: PersonalizationSignal[],
  config: ExtendedSessionConfiguration,
): string {
  const value = (path: string) => signals.find((signal) => signal.path === path)?.display ?? '';

  switch (id) {
    case 'intent':
      return config.intent
        ? `${value('focusType')} · ${config.intent}`
        : `${value('focusType')} · no intent yet`;
    case 'shape':
      return `${value('timeBudgetMin')} · ${value('energyMode')} · ${value('difficultyOverride')}`;
    case 'guidance':
      return `${value('structure')} · ${value('reflectionDepth')} · ${value('guideStyle')}`;
    case 'priorities': {
      const top = LIFE_DOMAINS.map((domain) => ({
        label: domain.label,
        weight: config.domainWeights[domain.id] ?? 0.5,
      }))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 2)
        .map((entry) => entry.label);
      return top.join(' · ');
    }
    case 'access': {
      const enabled = [
        config.voiceEnabled ? 'Voice' : null,
        config.reducedMotion ? 'Reduced motion' : null,
        config.screenReaderOptimized ? 'SR pacing' : null,
      ].filter(Boolean);
      return enabled.length > 0 ? enabled.join(' · ') : 'No access overrides';
    }
    case 'advanced': {
      const count = signals.filter((signal) => signal.customized).length;
      return count === 0 ? 'Using engine defaults' : `${count} advanced ${count === 1 ? 'signal' : 'signals'} set`;
    }
    default:
      return '';
  }
}

export function buildPersonalizationView(
  config: ExtendedSessionConfiguration,
  provenance: Record<string, PersonalizationSource> = {},
): PersonalizationView {
  const signals = buildSignals(config, provenance);
  const layers: PersonalizationLayer[] = (Object.keys(LAYER_META) as PersonalizationLayerId[]).map((id) => {
    const layerSignals = signals.filter((signal) => signal.layer === id);
    return {
      id,
      label: LAYER_META[id].label,
      description: LAYER_META[id].description,
      summary: summarizeLayer(id, layerSignals, config),
      signals: layerSignals,
      customizedCount: layerSignals.filter((signal) => signal.customized).length,
    };
  });

  const activeSignals = signals.filter((signal) => signal.customized).length;
  const totalSignals = signals.length;
  const depth = totalSignals === 0 ? 0 : activeSignals / totalSignals;
  const depthLabel: PersonalizationView['depthLabel'] =
    depth >= 0.75 ? 'Master' : depth >= 0.5 ? 'Deep' : depth >= 0.25 ? 'Tailored' : 'Essential';

  const primaryDomains = LIFE_DOMAINS.map((domain) => ({
    id: domain.id,
    label: domain.label,
    emoji: domain.emoji,
    weight: config.domainWeights[domain.id] ?? 0.5,
  }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);

  const practiceTargets = Object.entries(config.practiceLevelTargets ?? {}).map(([id, target]) => ({
    id,
    level: target?.targetLevel ?? 0,
    priority: target?.priority ?? 'medium',
  }));

  const shadowTargets = (config.shadowTargets?.active ?? []).map((target) => ({
    id: target.id,
    name: target.name,
    priority: target.priority,
  }));

  const masters = Object.entries(config.masterPersonas ?? {}).map(([practice, masterId]) => ({
    practice,
    name: masterId,
  }));

  const continuity = config.sessionContinuity;
  const safeguards: { label: string; detail: string }[] = [
    {
      label: 'Resistance rules',
      detail: `${(config.resistanceRules ?? []).filter((rule) => rule.enabled).length} active`,
    },
    {
      label: 'Crisis protocols',
      detail: `${(config.crisisProtocols ?? []).filter((protocol) => protocol.enabled).length} active`,
    },
    {
      label: 'Session continuity',
      detail: continuity?.carryThread ? 'Threads carried forward' : 'Starts fresh',
    },
    {
      label: 'Seasonal alignment',
      detail: config.cyclicalAlignment?.autoDetectSeason ? 'Auto-detect season' : 'Manual season',
    },
    {
      label: 'External signals',
      detail: `${Object.values(config.externalSignals?.providers ?? {}).filter(Boolean).length} providers`,
    },
    {
      label: 'Weekly pattern',
      detail: config.weeklyPattern?.active ? `${config.weeklyPattern.schedule.length} days planned` : 'Not scheduled',
    },
    {
      label: 'Progression contracts',
      detail: `${(config.progressionContracts ?? []).length} active`,
    },
    {
      label: 'Outcome tracking',
      detail: `${(config.outcomeTracking?.criteria ?? []).length} criteria`,
    },
    {
      label: 'Social mode',
      detail: capitalize(config.socialConfig?.mode ?? 'solo'),
    },
  ];

  return {
    depth,
    depthLabel,
    activeSignals,
    totalSignals,
    layers,
    conflicts: collectConflicts(config),
    primaryDomains,
    practiceTargets,
    shadowTargets,
    masters,
    safeguards,
  };
}
