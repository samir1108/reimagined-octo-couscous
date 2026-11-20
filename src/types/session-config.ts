/**
 * SESSION CONFIGURATION — User-tunable session parameters
 * ────────────────────────────────────────────────────────
 * Allows users to customize their session experience across
 * 1000+ combinations without breaking engine constraints.
 */

import type { GateId } from '@/lib/consciousness/dailyGates';
import type { ArchetypeId } from '@/lib/composer/archetypes';
import type { IngredientKind } from '@/lib/composer/ingredients';
import type { PracticeId } from '@/types/practices';
import type { DimensionId } from '@/types/consciousness';
import type { LoopId } from '@/types/loops';

// ─── Focus Types ───

export type FocusType =
  | 'focus'           // Concentration, single-pointed attention
  | 'attention'       // Pure attention training (shamatha-style)
  | 'self_inquiry'    // Self-inquiry, who am I
  | 'raja_yoga'       // Raja yoga (asana, pranayama, meditation)
  | 'jnana'           // Self-inquiry, discrimination
  | 'bhakti'          // Devotion, heart-opening
  | 'karma'           // Action, service, dharma
  | 'tantra'          // Energy, polarity, sacred perception
  | 'kundalini'       // Awakening, spinal energy
  | 'healing'         // Emotional/physical healing
  | 'sleep'           // Evening wind-down, rest
  | 'energy'          // Morning activation, vitality
  | 'relationship'    // Relational awareness
  | 'work'            // Work/career focus
  | 'creativity'      // Creative flow
  | 'custom';         // User-defined combination

export const FOCUS_TYPES: { id: FocusType; label: string; description: string; emoji: string; defaultDuration: [number, number]; suitableGates: GateId[] }[] = [
  { id: 'focus', label: 'Focus', description: 'Single-pointed concentration', emoji: '🎯', defaultDuration: [15, 45], suitableGates: ['morning', 'midday'] },
  { id: 'attention', label: 'Attention', description: 'Pure attention training (shamatha)', emoji: '👁️', defaultDuration: [10, 30], suitableGates: ['morning', 'midday'] },
  { id: 'self_inquiry', label: 'Self-Inquiry', description: 'Who am I? Direct investigation', emoji: '❓', defaultDuration: [10, 60], suitableGates: ['morning', 'midday', 'evening'] },
  { id: 'raja_yoga', label: 'Raja Yoga', description: 'Classical yoga: asana, pranayama, meditation', emoji: '👑', defaultDuration: [20, 90], suitableGates: ['morning', 'midday', 'evening'] },
  { id: 'jnana', label: 'Jnana Yoga', description: 'Discrimination, neti-neti, wisdom', emoji: '📖', defaultDuration: [15, 60], suitableGates: ['morning', 'midday', 'evening'] },
  { id: 'bhakti', label: 'Bhakti', description: 'Devotion, heart-opening, surrender', emoji: '❤️', defaultDuration: [10, 45], suitableGates: ['morning', 'evening', 'night'] },
  { id: 'karma', label: 'Karma Yoga', description: 'Action as practice, dharma alignment', emoji: '🤲', defaultDuration: [5, 30], suitableGates: ['morning', 'midday', 'evening'] },
  { id: 'tantra', label: 'Tantra', description: 'Energy, polarity, sacred perception', emoji: '🔥', defaultDuration: [15, 60], suitableGates: ['evening', 'night'] },
  { id: 'kundalini', label: 'Kundalini', description: 'Spinal awakening, prana flow', emoji: '⚡', defaultDuration: [20, 60], suitableGates: ['morning', 'midday'] },
  { id: 'healing', label: 'Healing', description: 'Emotional & somatic release', emoji: '💧', defaultDuration: [10, 45], suitableGates: ['evening', 'night'] },
  { id: 'sleep', label: 'Sleep Prep', description: 'Evening wind-down, body scan', emoji: '🌙', defaultDuration: [5, 20], suitableGates: ['night'] },
  { id: 'energy', label: 'Energy', description: 'Morning activation, vitality', emoji: '☀️', defaultDuration: [10, 30], suitableGates: ['morning'] },
  { id: 'relationship', label: 'Relationships', description: 'Relational awareness, mirroring', emoji: '💞', defaultDuration: [10, 30], suitableGates: ['midday', 'evening'] },
  { id: 'work', label: 'Work & Career', description: 'Dharma, flow, conscious ambition', emoji: '💼', defaultDuration: [5, 20], suitableGates: ['morning', 'midday'] },
  { id: 'creativity', label: 'Creativity', description: 'Creative flow, inspiration', emoji: '🎨', defaultDuration: [10, 45], suitableGates: ['morning', 'midday', 'evening'] },
  { id: 'custom', label: 'Custom', description: 'Build your own combination', emoji: '✨', defaultDuration: [5, 120], suitableGates: ['morning', 'midday', 'evening', 'night'] },
];

// ─── Guide Styles ───

export type GuideStyle =
  | 'gentle'          // Nurturing, soft, encouraging
  | 'direct'          // Clear, precise, no fluff
  | 'inquiry'         // Question-based, Socratic
  | 'devotional'      // Heart-centered, poetic
  | 'silent';         // Minimal words, space

export const GUIDE_STYLES: { id: GuideStyle; label: string; description: string; emoji: string }[] = [
  { id: 'gentle', label: 'Gentle', description: 'Nurturing, patient, soft guidance', emoji: '🌿' },
  { id: 'direct', label: 'Direct', description: 'Clear, precise, no hand-holding', emoji: '🎯' },
  { id: 'inquiry', label: 'Inquiry', description: 'Questions that open, not answers', emoji: '❓' },
  { id: 'devotional', label: 'Devotional', description: 'Heart-centered, poetic, surrender', emoji: '❤️' },
  { id: 'silent', label: 'Silent', description: 'Minimal words, maximum space', emoji: '🤫' },
];

// ─── Life Domain Weights ───

export type LifeDomainId =
  | 'relationship'
  | 'work'
  | 'finance'
  | 'health'
  | 'creativity'
  | 'spirituality';

export const LIFE_DOMAINS: { id: LifeDomainId; label: string; description: string; emoji: string; relatedDimension: 'thought' | 'emotion' | 'body' | 'action' | 'connection' | 'spirit' }[] = [
  { id: 'relationship', label: 'Relationships', description: 'Partner, family, friends, community', emoji: '💞', relatedDimension: 'connection' },
  { id: 'work', label: 'Work & Career', description: 'Purpose, ambition, flow, dharma', emoji: '💼', relatedDimension: 'action' },
  { id: 'finance', label: 'Finance', description: 'Money beliefs, abundance, security', emoji: '💰', relatedDimension: 'thought' },
  { id: 'health', label: 'Health', description: 'Body, vitality, somatic awareness', emoji: '🏥', relatedDimension: 'body' },
  { id: 'creativity', label: 'Creativity', description: 'Expression, inspiration, flow', emoji: '🎨', relatedDimension: 'spirit' },
  { id: 'spirituality', label: 'Spirituality', description: 'Practice, wisdom, transcendence', emoji: '✨', relatedDimension: 'spirit' },
];

export interface DomainWeights {
  [domain: string]: number; // 0-1, defaults to 0.5
}

// ─── Session Structure ───

export type SessionStructure =
  | 'guided'          // Full AI guidance
  | 'self_directed'   // User chooses, app supports
  | 'hybrid';         // Mix of both

export type ReflectionDepth =
  | 'micro'           // 1-2 min, one prompt
  | 'standard'        // 3-5 min, journaling
  | 'deep';           // 10+ min, inquiry spiral

// ─── Archetype Weights ───

export interface ArchetypeWeights {
  [archetype: string]: number; // 0-2, default 1
}

// ─── Ingredient Preferences ───

export interface IngredientPreferences {
  [kind: string]: number; // -1 to 2, default 1
}

// ─── Practice-Level Targets (Granular Control) ───

export interface PracticeLevelTarget {
  practiceId: PracticeId;
  targetLevel: number;        // 1-7 (or max level for that practice)
  priority: 'low' | 'medium' | 'high' | 'required'; // How strongly to target
  reason?: string;            // User's reason for targeting this
}

export interface PracticeLevelTargets {
  // Map of practiceId -> target config
  [practiceId: string]: PracticeLevelTarget;
}

// ─── Micro-Techniques (Sub-Practice Level) ───

export interface MicroTechnique {
  id: string;
  practiceId: PracticeId;
  level: number;
  label: string;
  description: string;
  durationSec: number;
  tags: string[];
}

export interface MicroTechniqueSelection {
  [practiceId: string]: string[]; // Selected technique IDs per practice
}

// ─── Resistance & Crisis Rules ───

export type ResistanceTrigger =
  | 'resistance_felt'
  | 'bypassing_detected'
  | 'dark_night'
  | 'low_energy'
  | 'high_stress'
  | 'loop_activated'
  | 'quality_drop'
  | 'missed_sessions';

export type ResistanceAction =
  | 'insert_grounding'
  | 'reduce_intensity'
  | 'split_session'
  | 'switch_focus'
  | 'add_compassion'
  | 'force_silence'
  | 'shorten_duration'
  | 'change_guide_style';

export interface ResistanceRule {
  id: string;
  trigger: ResistanceTrigger;
  condition?: string; // e.g., "energy=low AND time>30"
  action: ResistanceAction;
  params?: Record<string, any>; // e.g., { durationMin: 5, practice: "body" }
  priority: number;
  enabled: boolean;
}

export interface CrisisProtocol {
  id: string;
  name: string;
  trigger: string; // "panic_attack", "grief_wave", "rage", "dissociation"
  immediatePractice: PracticeId;
  immediateTechnique?: string;
  durationMin: number;
  followupPractice?: PracticeId;
  followupDurationMin?: number;
  guideStyleOverride?: GuideStyle;
  enabled: boolean;
}

// ─── Master Personas ───

export interface MasterPersona {
  id: string;
  name: string;
  tradition: string;
  practices: PracticeId[]; // Practices this master teaches
  style: GuideStyle;
  voiceProfile: {
    tone: 'gentle' | 'direct' | 'inquiry' | 'devotional' | 'silent';
    vocabulary: 'simple' | 'traditional' | 'modern' | 'poetic';
    pacing: 'slow' | 'medium' | 'fast';
  };
  signaturePractices: string[]; // Specific techniques they're known for
}

export interface MasterPersonas {
  [practiceId: string]: string; // practiceId -> masterId
}

// ─── Temporal Patterns ───

export interface DailyScheduleEntry {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  focusType: FocusType;
  timeOfDay: string; // "06:30"
  durationMin: number;
  energyMode?: 'low' | 'medium' | 'high' | 'adaptive';
  guideStyle?: GuideStyle;
  structure?: SessionStructure;
  reflectionDepth?: ReflectionDepth;
  customConfig?: Partial<SessionConfiguration>;
}

export interface WeeklyPattern {
  schedule: DailyScheduleEntry[];
  timezone: string;
  active: boolean;
}

// ─── Progression Contracts ───

export interface ProgressionMilestone {
  id: string;
  name: string;
  targetDate: string; // ISO date
  practiceTargets: PracticeLevelTargets;
  successCriteria: {
    metric: string; // e.g., "quality>=0.7 for 5 sessions"
    deadline: string;
  }[];
  status: 'pending' | 'active' | 'completed' | 'missed';
}

export interface ProgressionContract {
  id: string;
  name: string;
  description: string;
  startDate: string;
  targetDate: string;
  milestones: ProgressionMilestone[];
  autoAdjust: boolean; // Adjust plan if off-track
  status: 'draft' | 'active' | 'completed' | 'paused';
}

// ─── Shadow/Wound Targeting ───

export interface ShadowTarget {
  id: string;
  name: string; // e.g., "abandonment", "control", "unworthiness"
  description: string;
  linkedLoops: LoopId[];
  linkedChakras: string[]; // Chakra IDs
  linkedDimensions: DimensionId[];
  practiceTargets: PracticeLevelTargets;
  affirmations: string[];
  inquiryQuestions: string[];
  priority: 'low' | 'medium' | 'high' | 'core';
}

export interface ShadowTargets {
  active: ShadowTarget[];
  history: ShadowTarget[];
}

// ─── External Signals ───

export type ExternalSignalSource =
  | 'wearable'      // Oura, Whoop, Apple Watch
  | 'calendar'      // Google, Outlook
  | 'location'      // GPS, geofence
  | 'weather'       // Weather API
  | 'sleep'         // Sleep tracker
  | 'manual';       // User input

export interface ExternalSignalRule {
  id: string;
  source: ExternalSignalSource;
  metric: string; // e.g., "hrv", "meeting_hours", "sleep_score"
  condition: 'lt' | 'gt' | 'eq' | 'between';
  threshold: number | [number, number];
  action: 'switch_focus' | 'adjust_intensity' | 'add_practice' | 'modify_duration' | 'change_guide' | 'notify';
  params: Record<string, any>;
  enabled: boolean;
  cooldownHours: number;
}

export interface ExternalSignalsConfig {
  rules: ExternalSignalRule[];
  providers: {
    wearable?: { type: 'oura' | 'whoop' | 'apple_watch'; connected: boolean };
    calendar?: { type: 'google' | 'outlook'; connected: boolean };
    location?: { enabled: boolean };
    weather?: { enabled: boolean };
  };
}

// ─── Session Memory & Continuity ───

export interface SessionThread {
  id: string;
  question: string;
  depthMode: 'arrive' | 'observe' | 'investigate' | 'experiment' | 'integrate';
  sessionsCount: number;
  startedAt: string;
  lastSessionAt: string;
  insights: string[];
  isActive: boolean;
}

export interface SessionContinuityConfig {
  carryThread: boolean;
  carryDepthMode: boolean;
  carryInsights: boolean;
  carryClosingSentence: boolean;
  maxThreadAgeDays: number;
}

// ─── Seasonal/Cyclical Alignment ───

export type Season = 'winter' | 'spring' | 'summer' | 'autumn';
export type LunarPhase = 'new' | 'waxing' | 'full' | 'waning';

export interface SeasonalBias {
  [season: string]: Partial<Record<FocusType | PracticeId, number>>; // weight adjustments
}

export interface LunarPhaseBias {
  [phase: string]: Partial<Record<FocusType | PracticeId, number>>;
}

export interface CyclicalAlignmentConfig {
  seasonalBias: SeasonalBias;
  lunarPhaseBias: LunarPhaseBias;
  autoDetectSeason: boolean;
  autoDetectLunarPhase: boolean;
  hemisphere: 'northern' | 'southern';
}

// ─── Outcome Tracking ───

export interface SuccessCriterion {
  id: string;
  name: string;
  metric: string; // e.g., "quality>=0.7 for 5 sessions", "band>=2.5"
  targetValue: number;
  currentValue: number;
  deadline: string;
  status: 'pending' | 'on_track' | 'at_risk' | 'achieved' | 'missed';
  practiceIds: PracticeId[];
}

export interface OutcomeTrackingConfig {
  criteria: SuccessCriterion[];
  reviewFrequencyDays: number;
  autoAdjustPlan: boolean;
}

// ─── Social/Relational Modes ───

export type SessionMode = 'solo' | 'partner' | 'group' | 'teacher';

export interface PartnerConfig {
  partnerId?: string;
  practice: 'dual_bhakti' | 'mirror_inquiry' | 'shared_breath' | 'witnessing_partner' | 'karma_service';
  structure: 'alternate_leading' | 'simultaneous' | 'facilitator_led';
  reflection: 'shared_journal' | 'verbal_sharing' | 'silent_witness';
}

export interface GroupConfig {
  groupId?: string;
  size: number;
  practice: 'karma_yoga' | 'group_meditation' | 'chanting' | 'inquiry_circle' | 'sharing_circle';
  structure: 'facilitator_led' | 'peer_led' | 'rotating';
  sharing: 'circle' | 'pairs' | 'silent';
}

export interface SocialConfig {
  mode: SessionMode;
  partner?: PartnerConfig;
  group?: GroupConfig;
  teacherMode?: boolean;
}

// ─── Export/Share ───

export interface ExportableConfig {
  version: number;
  exportedAt: string;
  config: SessionConfiguration;
  metadata: {
    name: string;
    description: string;
    tags: string[];
    authorId?: string;
    isPublic: boolean;
  };
}

// ─── Complete Configuration (Extended) ───

export interface ExtendedSessionConfiguration extends SessionConfiguration {
  // Advanced: Micro-Techniques
  microTechniques: MicroTechniqueSelection;

  // Advanced: Resistance & Crisis Rules
  resistanceRules: ResistanceRule[];
  crisisProtocols: CrisisProtocol[];

  // Advanced: Master Personas
  masterPersonas: MasterPersonas;

  // Advanced: Temporal Patterns
  weeklyPattern: WeeklyPattern;

  // Advanced: Progression Contracts
  progressionContracts: ProgressionContract[];

  // Advanced: Shadow/Wound Targeting
  shadowTargets: ShadowTargets;

  // Advanced: External Signals
  externalSignals: ExternalSignalsConfig;

  // Advanced: Session Memory/Continuity
  sessionContinuity: SessionContinuityConfig;

  // Advanced: Seasonal/Cyclical
  cyclicalAlignment: CyclicalAlignmentConfig;

  // Advanced: Outcome Tracking
  outcomeTracking: OutcomeTrackingConfig;

  // Advanced: Social Modes
  socialConfig: SocialConfig;

  // Meta
  intent?: string; // Natural language intent
  tags?: string[];
  isTemplate?: boolean;
}



// ─── Helper Functions (Extended) ───

export function mergeExtendedConfig(
  base: ExtendedSessionConfiguration,
  overrides: Partial<ExtendedSessionConfiguration>
): ExtendedSessionConfiguration {
  return {
    ...base,
    ...overrides,
    domainWeights: { ...base.domainWeights, ...overrides.domainWeights },
    archetypeWeights: { ...base.archetypeWeights, ...overrides.archetypeWeights },
    ingredientPreferences: { ...base.ingredientPreferences, ...overrides.ingredientPreferences },
    practiceLevelTargets: { ...base.practiceLevelTargets, ...overrides.practiceLevelTargets },
    microTechniques: { ...base.microTechniques, ...overrides.microTechniques },
    masterPersonas: { ...base.masterPersonas, ...overrides.masterPersonas },
    resistanceRules: overrides.resistanceRules ?? base.resistanceRules,
    crisisProtocols: overrides.crisisProtocols ?? base.crisisProtocols,
    weeklyPattern: overrides.weeklyPattern ?? base.weeklyPattern,
    progressionContracts: overrides.progressionContracts ?? base.progressionContracts,
    shadowTargets: overrides.shadowTargets ?? base.shadowTargets,
    externalSignals: overrides.externalSignals ?? base.externalSignals,
    sessionContinuity: { ...base.sessionContinuity, ...overrides.sessionContinuity },
    cyclicalAlignment: { ...base.cyclicalAlignment, ...overrides.cyclicalAlignment },
    outcomeTracking: { ...base.outcomeTracking, ...overrides.outcomeTracking },
    socialConfig: { ...base.socialConfig, ...overrides.socialConfig },
    updatedAt: new Date().toISOString(),
    version: base.version + 1,
  };
}

export interface SessionConfiguration {
  // Core Identity
  focusType: FocusType;
  customFocusName?: string; // For custom focus
  customFocusDescription?: string;
  customFocusTags?: string[];

  // Time
  timeBudgetMin: number; // 5-720 (12 hours)

  // Life Domains (weights 0-1)
  domainWeights: DomainWeights;

  // Consciousness Targeting
  targetVLevel?: number;      // 0.0-10.0
  targetBand?: 0|1|2|3|4|5|6|7|8|9|10;
  targetMicroLevel?: 'entering' | 'deepening' | 'mastery';

  // Speed & Pacing
  speedProfile: 'fast' | 'steady' | 'deep' | 'adaptive';

  // Gate & Timing
  preferredGate: GateId | 'flexible';
  preferredTimeOfDay?: string; // "06:30" format

  // Energy
  energyMode: 'low' | 'medium' | 'high' | 'adaptive';

  // Guide
  guideStyle: GuideStyle;
  preferredMasterId?: string; // Specific master from roster

  // Content Filters
  includedPracticeIds: PracticeId[];      // Explicitly wanted
  excludedPracticeIds: PracticeId[];      // Explicitly blocked
  includedTags: string[];                  // Tag-based inclusion
  excludedTags: string[];                  // Tag-based exclusion

  // Structure
  structure: SessionStructure;
  reflectionDepth: ReflectionDepth;

  // Advanced: Archetype Control
  archetypeWeights: ArchetypeWeights;
  forcedArchetype?: ArchetypeId; // Override engine selection

  // Advanced: Ingredient Control
  ingredientPreferences: IngredientPreferences;

  // Advanced: Practice-Level Targets (e.g., "observation level 3", "karma yoga level 4")
  practiceLevelTargets: PracticeLevelTargets;

  // Accessibility
  voiceEnabled: boolean;
  language: string;
  difficultyOverride: 'gentler' | 'standard' | 'harder';
  reducedMotion: boolean;
  screenReaderOptimized: boolean;

  // Physiological (wearable integration)
  hrvTarget?: number;
  breathRateTarget?: number;

  // Metadata
  version: number;
  updatedAt: string;
  presetId?: string; // Reference to saved preset
}

// ─── Presets ───

export interface SessionPreset {
  id: string;
  name: string;
  description: string;
  config: SessionConfiguration;
  isSystem: boolean;
  createdAt: string;
  useCount: number;
}

// ─── Default Configuration ───

export const DEFAULT_SESSION_CONFIG: SessionConfiguration = {
  focusType: 'focus',
  timeBudgetMin: 20,
  domainWeights: {
    relationship: 0.5,
    work: 0.5,
    finance: 0.3,
    health: 0.5,
    creativity: 0.3,
    spirituality: 0.7,
  },
  targetVLevel: undefined,
  targetBand: undefined,
  targetMicroLevel: undefined,
  speedProfile: 'adaptive',
  preferredGate: 'flexible',
  energyMode: 'adaptive',
  guideStyle: 'gentle',
  includedPracticeIds: [],
  excludedPracticeIds: [],
  includedTags: [],
  excludedTags: [],
  structure: 'guided',
  reflectionDepth: 'standard',
  archetypeWeights: {},
  ingredientPreferences: {},
  practiceLevelTargets: {},
  voiceEnabled: true,
  language: 'en',
  difficultyOverride: 'standard',
  reducedMotion: false,
  screenReaderOptimized: false,
  version: 1,
  updatedAt: new Date().toISOString(),
};

// ─── Default Extended Configuration ───

export const DEFAULT_EXTENDED_CONFIG: ExtendedSessionConfiguration = {
  ...DEFAULT_SESSION_CONFIG,
  microTechniques: {},
  resistanceRules: [],
  crisisProtocols: [],
  masterPersonas: {},
  weeklyPattern: { schedule: [], timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, active: false },
  progressionContracts: [],
  shadowTargets: { active: [], history: [] },
  externalSignals: { rules: [], providers: {} },
  sessionContinuity: { carryThread: true, carryDepthMode: true, carryInsights: true, carryClosingSentence: true, maxThreadAgeDays: 30 },
  cyclicalAlignment: {
    seasonalBias: {},
    lunarPhaseBias: {},
    autoDetectSeason: true,
    autoDetectLunarPhase: false,
    hemisphere: 'northern',
  },
  outcomeTracking: { criteria: [], reviewFrequencyDays: 7, autoAdjustPlan: true },
  socialConfig: { mode: 'solo' },
  intent: undefined,
  tags: [],
  isTemplate: false,
};

// ─── System Presets ───

export const SYSTEM_PRESETS: SessionPreset[] = [
  {
    id: 'morning-focus',
    name: 'Morning Focus',
    description: 'Sharp 20-min concentration to start the day',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00Z',
    useCount: 0,
    config: {
      ...DEFAULT_SESSION_CONFIG,
      focusType: 'focus',
      timeBudgetMin: 20,
      preferredGate: 'morning',
      energyMode: 'medium',
      guideStyle: 'direct',
      structure: 'guided',
      reflectionDepth: 'micro',
    },
  },
  {
    id: 'raja-yoga-deep',
    name: 'Raja Yoga Deep',
    description: '45-min classical yoga: asana, pranayama, meditation',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00Z',
    useCount: 0,
    config: {
      ...DEFAULT_SESSION_CONFIG,
      focusType: 'raja_yoga',
      timeBudgetMin: 45,
      preferredGate: 'morning',
      energyMode: 'high',
      guideStyle: 'gentle',
      structure: 'guided',
      reflectionDepth: 'standard',
    },
  },
  {
    id: 'evening-release',
    name: 'Evening Release',
    description: '15-min gentle let-go before sleep',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00Z',
    useCount: 0,
    config: {
      ...DEFAULT_SESSION_CONFIG,
      focusType: 'sleep',
      timeBudgetMin: 15,
      preferredGate: 'night',
      energyMode: 'low',
      guideStyle: 'gentle',
      structure: 'guided',
      reflectionDepth: 'micro',
    },
  },
  {
    id: 'weekend-deep-dive',
    name: 'Weekend Deep Dive',
    description: '90-min immersive practice for open time',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00Z',
    useCount: 0,
    config: {
      ...DEFAULT_SESSION_CONFIG,
      focusType: 'custom',
      customFocusName: 'Deep Dive',
      customFocusDescription: 'Extended immersive session',
      timeBudgetMin: 90,
      preferredGate: 'flexible',
      energyMode: 'adaptive',
      guideStyle: 'inquiry',
      structure: 'hybrid',
      reflectionDepth: 'deep',
    },
  },
  {
    id: 'micro-pause',
    name: 'Micro Pause',
    description: '2-min presence reset between tasks',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00Z',
    useCount: 0,
    config: {
      ...DEFAULT_SESSION_CONFIG,
      focusType: 'focus',
      timeBudgetMin: 2,
      preferredGate: 'flexible',
      energyMode: 'adaptive',
      guideStyle: 'silent',
      structure: 'self_directed',
      reflectionDepth: 'micro',
    },
  },
  {
    id: 'healing-journey',
    name: 'Healing Journey',
    description: '30-min emotional & somatic release',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00Z',
    useCount: 0,
    config: {
      ...DEFAULT_SESSION_CONFIG,
      focusType: 'healing',
      timeBudgetMin: 30,
      preferredGate: 'evening',
      energyMode: 'low',
      guideStyle: 'gentle',
      domainWeights: {
        relationship: 0.8,
        work: 0.2,
        finance: 0.1,
        health: 0.9,
        creativity: 0.3,
        spirituality: 0.6,
      },
      structure: 'guided',
      reflectionDepth: 'standard',
    },
  },
];

// ─── Helper Functions ───

export function getFocusType(id: FocusType) {
  return FOCUS_TYPES.find(f => f.id === id) ?? FOCUS_TYPES[0];
}

export function getGuideStyle(id: GuideStyle) {
  return GUIDE_STYLES.find(g => g.id === id) ?? GUIDE_STYLES[0];
}

export function getLifeDomain(id: LifeDomainId) {
  return LIFE_DOMAINS.find(d => d.id === id) ?? LIFE_DOMAINS[0];
}

export function mergeSessionConfig(
  base: SessionConfiguration,
  overrides: Partial<SessionConfiguration>
): SessionConfiguration {
  return {
    ...base,
    ...overrides,
    domainWeights: { ...base.domainWeights, ...overrides.domainWeights },
    archetypeWeights: { ...base.archetypeWeights, ...overrides.archetypeWeights },
    ingredientPreferences: { ...base.ingredientPreferences, ...overrides.ingredientPreferences },
    updatedAt: new Date().toISOString(),
    version: base.version + 1,
  };
}

export function validateSessionConfig(config: SessionConfiguration): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.timeBudgetMin < 1) errors.push('Time budget must be at least 1 minute');
  if (config.timeBudgetMin > 720) errors.push('Time budget cannot exceed 12 hours (720 minutes)');

  if (config.targetVLevel !== undefined && (config.targetVLevel < 0 || config.targetVLevel > 10)) {
    errors.push('Target V-Level must be between 0 and 10');
  }

  if (config.targetBand !== undefined && (config.targetBand < 0 || config.targetBand > 10)) {
    errors.push('Target Band must be between 0 and 10');
  }

  const focus = getFocusType(config.focusType);
  if (config.preferredGate !== 'flexible' && !focus.suitableGates.includes(config.preferredGate)) {
    errors.push(`Focus "${focus.label}" is not suitable for ${config.preferredGate} gate`);
  }

  return { valid: errors.length === 0, errors };
}

// ─── Type Re-exports for Composer ───

export type {
  MicroTechnique,
  MicroTechniqueSelection,
  ResistanceRule,
  ResistanceTrigger,
  ResistanceAction,
  CrisisProtocol,
  MasterPersona,
  MasterPersonas,
  DailyScheduleEntry,
  WeeklyPattern,
  ProgressionMilestone,
  ProgressionContract,
  ShadowTarget,
  ShadowTargets,
  ExternalSignalRule,
  ExternalSignalSource,
  ExternalSignalsConfig,
  SessionThread,
  SessionContinuityConfig,
  SeasonalBias,
  LunarPhaseBias,
  CyclicalAlignmentConfig,
  SuccessCriterion,
  OutcomeTrackingConfig,
  SessionMode,
  PartnerConfig,
  GroupConfig,
  SocialConfig,
  ExportableConfig,
  ExtendedSessionConfiguration,
};