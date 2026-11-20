/**
 * PRACTICE TYPES — 3-Layer Practice Framework
 * Core (5) → Path (4) → Specialty (9+)
 * Each practice has defined levels with descriptions
 */

import type { DimensionId } from './consciousness';

// ─── Practice IDs ───

export type CorePracticeId = 'observation' | 'self-inquiry' | 'breath' | 'witnessing' | 'body';
export type PathPracticeId = 'bhakti' | 'karma' | 'jnana' | 'raja';
export type SpecialtyPracticeId = 'kriya' | 'tantra' | 'neuroscience' | 'relationship' | 'work-career' | 'finance' | 'health' | 'emotional-healing' | 'loop-dissolution';
export type PracticeId = CorePracticeId | PathPracticeId | SpecialtyPracticeId;

export type PracticeLayer = 'core' | 'path' | 'specialty';

// ─── Practice Level Definition ───

export interface PracticeLevelDef {
  level: number;
  name: string;
  description: string;
}

// ─── Practice Definition ───

export interface PracticeDef {
  id: PracticeId;
  label: string;
  layer: PracticeLayer;
  icon: string;
  levels: PracticeLevelDef[];
  activationCondition?: string; // For specialty practices
}

// ─── CORE PRACTICES ───

export const CORE_PRACTICES: PracticeDef[] = [
  {
    id: 'observation', label: 'Observation', layer: 'core', icon: '👁️',
    levels: [
      { level: 1, name: 'Sensory Observation', description: 'Observe through 5 senses without labeling' },
      { level: 2, name: 'Thought Watching', description: 'Label thoughts without engaging them' },
      { level: 3, name: 'Emotion Tracking', description: 'Feel emotions without reacting' },
      { level: 4, name: 'Body Scanning', description: 'Somatic awareness scan' },
      { level: 5, name: 'Gap Awareness', description: 'Notice space between thoughts' },
      { level: 6, name: 'Witness Consciousness', description: 'The observer who observes' },
      { level: 7, name: 'Non-dual Observation', description: 'Observer dissolves into observed' },
    ],
  },
  {
    id: 'self-inquiry', label: 'Self-Inquiry', layer: 'core', icon: '❓',
    levels: [
      { level: 1, name: 'Emotional Inquiry', description: 'What am I feeling right now?' },
      { level: 2, name: 'Thought Source', description: 'Where does this thought come from?' },
      { level: 3, name: 'Belief Inquiry', description: 'Is this belief actually true?' },
      { level: 4, name: 'Identity Inquiry', description: 'Who is the one asking?' },
      { level: 5, name: 'Who Am I', description: "Ramana Maharshi's direct method" },
      { level: 6, name: 'Silent Inquiry', description: 'Question dissolves into silence' },
    ],
  },
  {
    id: 'breath', label: 'Breath Awareness', layer: 'core', icon: '🌬️',
    levels: [
      { level: 1, name: 'Natural Breath', description: 'Observe breath without changing it' },
      { level: 2, name: 'Counted Breath', description: '1-10 counting cycle' },
      { level: 3, name: 'Extended Breath', description: '4-7-8 or box breathing patterns' },
      { level: 4, name: 'Energy Breath', description: 'Spinal/prana awareness' },
      { level: 5, name: 'Spontaneous Breath', description: 'Breath breathes itself' },
    ],
  },
  {
    id: 'witnessing', label: 'Witnessing', layer: 'core', icon: '🔍',
    levels: [
      { level: 1, name: 'Event Witnessing', description: 'Watch daily events without judgment' },
      { level: 2, name: 'Reaction Witnessing', description: 'Catch reactions in real-time' },
      { level: 3, name: 'Pattern Witnessing', description: 'See loops as they arise' },
      { level: 4, name: 'Sakshi Bhav', description: 'Sustained witness consciousness' },
      { level: 5, name: 'Turiya Witness', description: 'Witnessing even deep sleep' },
    ],
  },
  {
    id: 'body', label: 'Body Awareness', layer: 'core', icon: '🫁',
    levels: [
      { level: 1, name: 'Body Scan', description: 'Progressive relaxation scan' },
      { level: 2, name: 'Sensation Mapping', description: 'Where do I feel this emotion?' },
      { level: 3, name: 'Energy Awareness', description: 'Prana flow perception' },
      { level: 4, name: 'Body as Temple', description: 'Sacred somatics' },
      { level: 5, name: 'Dissolving Boundary', description: 'Energy body awareness' },
    ],
  },
];

// ─── PATH PRACTICES ───

export const PATH_PRACTICES: PracticeDef[] = [
  {
    id: 'bhakti', label: 'Bhakti Yoga', layer: 'path', icon: '❤️',
    levels: [
      { level: 1, name: 'Gratitude Practice', description: 'Daily thankfulness' },
      { level: 2, name: 'Devotional Singing', description: 'Kirtan, bhajan' },
      { level: 3, name: 'Surrender Practice', description: 'Letting go of control' },
      { level: 4, name: 'Divine Love Meditation', description: 'Heart opening' },
      { level: 5, name: 'Para Bhakti', description: 'Love without object' },
    ],
  },
  {
    id: 'karma', label: 'Karma Yoga', layer: 'path', icon: '🤲',
    levels: [
      { level: 1, name: 'Selfless Action', description: 'Act without reward expectation' },
      { level: 2, name: 'Skill in Action', description: 'Excellence as offering' },
      { level: 3, name: 'Non-attachment to Results', description: "Gita's core teaching" },
      { level: 4, name: 'Service Meditation', description: 'Seeing divine in all' },
      { level: 5, name: 'Nishkama Karma', description: 'Action from stillness' },
    ],
  },
  {
    id: 'jnana', label: 'Jnana Yoga', layer: 'path', icon: '📖',
    levels: [
      { level: 1, name: 'Discrimination', description: 'Real vs unreal' },
      { level: 2, name: 'Neti-Neti (Physical)', description: 'Not this — physical identity' },
      { level: 3, name: 'Neti-Neti (Mental)', description: 'Not this — mental/emotional identity' },
      { level: 4, name: 'Tattvamasi', description: '"I am That" contemplation' },
      { level: 5, name: 'Viveka', description: 'Discrimination in daily life' },
      { level: 6, name: 'Direct Seeing', description: 'Truth without mediator' },
    ],
  },
  {
    id: 'raja', label: 'Raja Yoga', layer: 'path', icon: '👑',
    levels: [
      { level: 1, name: 'Yama', description: 'Ethical foundation — non-violence, truth' },
      { level: 2, name: 'Niyama', description: 'Self-discipline — contentment, study' },
      { level: 3, name: 'Asana', description: 'Steady, comfortable posture' },
      { level: 4, name: 'Pranayama', description: 'Breath regulation' },
      { level: 5, name: 'Pratyahara', description: 'Sense withdrawal' },
      { level: 6, name: 'Dharana', description: 'Concentration' },
      { level: 7, name: 'Dhyana', description: 'Meditation' },
      { level: 8, name: 'Samadhi', description: 'Absorption' },
    ],
  },
];

// ─── SPECIALTY PRACTICES ───

export const SPECIALTY_PRACTICES: PracticeDef[] = [
  {
    id: 'kriya', label: 'Kriya Yoga', layer: 'specialty', icon: '⚡',
    activationCondition: 'Raja L4+ AND Body L3+',
    levels: [
      { level: 1, name: 'Basic Pranayama', description: 'Foundation breathing' },
      { level: 2, name: 'Nadi Shodhana', description: 'Alternate nostril breathing' },
      { level: 3, name: 'Kapalbhati + Bandhas', description: 'Skull-shining breath with locks' },
      { level: 4, name: 'Spinal Breathing', description: 'Sushumna channel awareness' },
      { level: 5, name: 'Kriya Proper', description: 'Classical kriya technique' },
      { level: 6, name: 'Advanced Kriya', description: 'Higher kriyas' },
      { level: 7, name: 'Spontaneous Prana', description: 'Prana moves itself' },
    ],
  },
  {
    id: 'tantra', label: 'Tantra Awareness', layer: 'specialty', icon: '🔥',
    activationCondition: 'Band 3+ AND Jnana L3+',
    levels: [
      { level: 1, name: 'Sacred Perception', description: 'Seeing divinity in ordinary' },
      { level: 2, name: 'Energy Mapping', description: 'Chakra/nadi awareness' },
      { level: 3, name: 'Polarity Integration', description: 'Shiva-Shakti balance' },
      { level: 4, name: 'Ritual Awareness', description: 'Conscious ceremony' },
      { level: 5, name: 'Non-dual Embodiment', description: 'Form as formless' },
    ],
  },
  {
    id: 'neuroscience', label: 'Neuroscience', layer: 'specialty', icon: '🧬',
    activationCondition: 'Head-dominant user',
    levels: [
      { level: 1, name: 'Brain Mapping', description: 'Understanding neural pathways' },
      { level: 2, name: 'Neuroplasticity', description: 'Rewiring habits consciously' },
      { level: 3, name: 'Vagus Nerve', description: 'Polyvagal tone training' },
      { level: 4, name: 'DMN Quieting', description: 'Default Mode Network awareness' },
      { level: 5, name: '3-Brain Coherence', description: 'Head-heart-gut alignment' },
    ],
  },
  {
    id: 'emotional-healing', label: 'Emotional Healing', layer: 'specialty', icon: '💧',
    activationCondition: 'Emotion dimension < Band 3',
    levels: [
      { level: 1, name: 'Naming', description: 'Identify and name the emotion' },
      { level: 2, name: 'Somatic Locating', description: 'Find it in the body' },
      { level: 3, name: 'Origin Tracing', description: 'When did this start?' },
      { level: 4, name: 'Transmutation', description: 'Transform the energy' },
      { level: 5, name: 'Integration', description: 'Emotion becomes wisdom' },
    ],
  },
  {
    id: 'loop-dissolution', label: 'Loop Dissolution', layer: 'specialty', icon: '🔓',
    activationCondition: 'Active loop detected',
    levels: [
      { level: 1, name: 'Identification', description: 'See the loop clearly' },
      { level: 2, name: 'Trigger Mapping', description: 'What starts this pattern?' },
      { level: 3, name: 'Pause', description: 'Insert space before reaction' },
      { level: 4, name: 'Root Inquiry', description: 'What is this loop protecting?' },
      { level: 5, name: 'Dissolution', description: 'Loop naturally releases' },
    ],
  },
  {
    id: 'relationship', label: 'Relationship', layer: 'specialty', icon: '💞',
    activationCondition: 'Relationship domain stress detected',
    levels: [
      { level: 1, name: 'Mirror Awareness', description: 'Others reflect me' },
      { level: 2, name: 'Projection Recognition', description: 'What is mine vs theirs' },
      { level: 3, name: 'Conscious Communication', description: 'Speak from awareness' },
      { level: 4, name: 'Boundary Wisdom', description: 'Healthy limits from love' },
      { level: 5, name: 'Sacred Relating', description: 'Relationship as practice' },
    ],
  },
  {
    id: 'work-career', label: 'Work & Career', layer: 'specialty', icon: '💼',
    activationCondition: 'Work domain stress detected',
    levels: [
      { level: 1, name: 'Purpose Inquiry', description: 'What is my dharma?' },
      { level: 2, name: 'Flow Mapping', description: 'When do I lose time?' },
      { level: 3, name: 'Conscious Ambition', description: 'Desire without attachment' },
      { level: 4, name: 'Leadership Presence', description: 'Lead from awareness' },
      { level: 5, name: 'Seva Integration', description: 'Work as service' },
    ],
  },
  {
    id: 'finance', label: 'Finance', layer: 'specialty', icon: '💰',
    activationCondition: 'Finance domain stress detected',
    levels: [
      { level: 1, name: 'Money Beliefs', description: 'Uncover hidden money stories' },
      { level: 2, name: 'Abundance Inquiry', description: 'Scarcity vs sufficiency' },
      { level: 3, name: 'Conscious Spending', description: 'Values-aligned finances' },
      { level: 4, name: 'Generosity Practice', description: 'Giving as receiving' },
    ],
  },
  {
    id: 'health', label: 'Health', layer: 'specialty', icon: '🏥',
    activationCondition: 'Health domain stress detected',
    levels: [
      { level: 1, name: 'Body Listening', description: 'What is my body saying?' },
      { level: 2, name: 'Habit Awareness', description: 'Unconscious health patterns' },
      { level: 3, name: 'Healing Intention', description: 'Mind-body connection' },
      { level: 4, name: 'Wholeness', description: 'Health as awareness expression' },
    ],
  },
];

// ─── All Practices Combined ───

export const ALL_PRACTICES: PracticeDef[] = [...CORE_PRACTICES, ...PATH_PRACTICES, ...SPECIALTY_PRACTICES];

// ─── Helper to get practice by ID ───

export function getPracticeById(id: PracticeId): PracticeDef | undefined {
  return ALL_PRACTICES.find(p => p.id === id);
}

export function getMaxLevel(id: PracticeId): number {
  const practice = getPracticeById(id);
  return practice ? practice.levels.length : 0;
}
