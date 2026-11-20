/**
 * 100-DIMENSION MAP (Batch 13)
 * Full taxonomy mapping every primary dimension to ~16 sub-dimensions.
 * Used by the radial UI to give users a fractal view of self.
 */

export interface SubDimension {
  id: string;
  label: string;
  parent: 'thought' | 'emotion' | 'body' | 'action' | 'connection' | 'spirit';
}

const make = (parent: SubDimension['parent'], labels: string[]): SubDimension[] =>
  labels.map((l) => ({ id: `${parent}.${l.toLowerCase().replace(/[^a-z0-9]/g, '_')}`, label: l, parent }));

export const DIMENSIONS_100: SubDimension[] = [
  ...make('thought', [
    'Clarity', 'Belief Patterns', 'Inner Critic', 'Mental Loops', 'Decision Style',
    'Memory Use', 'Attention Span', 'Cognitive Bias', 'Mind Wandering', 'Self-Talk',
    'Curiosity', 'Skepticism', 'Worry Index', 'Planning', 'Perspective-Taking', 'Meta-Cognition',
  ]),
  ...make('emotion', [
    'Range', 'Regulation', 'Awareness', 'Expression', 'Empathy',
    'Joy', 'Grief', 'Anger', 'Fear', 'Shame',
    'Compassion', 'Vulnerability', 'Boundaries', 'Mood Stability', 'Emotional Honesty', 'Heart Openness',
  ]),
  ...make('body', [
    'Energy', 'Sleep', 'Tension', 'Breath', 'Posture',
    'Hunger Cues', 'Movement', 'Rest Quality', 'Sensory Awareness', 'Nervous System Tone',
    'Gut Signals', 'Sexual Energy', 'Pain Awareness', 'Vitality', 'Embodiment', 'Somatic Memory',
  ]),
  ...make('action', [
    'Integrity', 'Discipline', 'Procrastination', 'Follow-Through', 'Risk',
    'Patience', 'Service', 'Effort', 'Habit Strength', 'Recovery',
    'Conflict Style', 'Generosity', 'Reactivity', 'Initiative', 'Courage', 'Restraint',
  ]),
  ...make('connection', [
    'Intimacy', 'Trust', 'Listening', 'Repair', 'Belonging',
    'Solitude Tolerance', 'Family Bond', 'Friendship Depth', 'Romantic Bond', 'Community',
    'Conflict Repair', 'Forgiveness', 'Receiving Love', 'Giving Love', 'Witnessing Others', 'Being Seen',
  ]),
  ...make('spirit', [
    'Witness', 'Surrender', 'Devotion', 'Awe', 'Silence',
    'Non-Dual Glimpses', 'Faith', 'Mystery', 'Death Awareness', 'Cosmic Sense',
    'Ego Loosening', 'Presence', 'Meaning', 'Sacred Sense', 'Inner Stillness', 'Transcendence',
  ]),
];

export function getDimensionsByParent(parent: SubDimension['parent']): SubDimension[] {
  return DIMENSIONS_100.filter((d) => d.parent === parent);
}
