import { LOOPS } from '@/data/loops';
import type { KnowledgeConceptSpec } from './concepts';

export const LOOP_CONCEPTS: KnowledgeConceptSpec[] = LOOPS.map((l) => ({
  id: `concept::loop::${l.id}`,
  name: l.name,
  domain: 'behaviour',
  nodeType: 'concept',
  description: l.description,
  aliases: l.keywords || [],
}));
