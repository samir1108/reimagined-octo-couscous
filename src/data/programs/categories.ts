import type { CategoryMeta } from './types';

export const PROGRAM_CATEGORIES: CategoryMeta[] = [
  {
    id: 'awareness',
    label: 'Awareness & Observation',
    description: 'Develop the witness consciousness — learn to observe yourself without judgment',
    icon: 'Eye',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: 'mind',
    label: 'Mind & Thought Patterns',
    description: 'Master your mental landscape — break free from repetitive thinking',
    icon: 'Brain',
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'emotional',
    label: 'Emotional Intelligence',
    description: 'Feel fully, respond wisely — develop deep emotional mastery',
    icon: 'Heart',
    gradient: 'from-rose-500 to-pink-600',
  },
];

export function getCategoryMeta(id: string): CategoryMeta | undefined {
  return PROGRAM_CATEGORIES.find(c => c.id === id);
}
