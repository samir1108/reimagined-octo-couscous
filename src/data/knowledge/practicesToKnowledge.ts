import { ALL_PRACTICES } from '@/types/practices';
import type { KnowledgeConceptSpec } from './concepts';

export const PRACTICE_CONCEPTS: KnowledgeConceptSpec[] = ALL_PRACTICES.map((p) => ({
  id: `concept::practice::${p.id}`,
  name: p.label,
  domain: 'transformation',
  nodeType: 'practice',
  description: `Practice: ${p.label} (${p.layer}).`,
  aliases: [p.id],
}));
