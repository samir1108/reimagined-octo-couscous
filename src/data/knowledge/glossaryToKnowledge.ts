import { GLOSSARY } from '@/data/handbook/glossary';
import type { KnowledgeConceptSpec } from './concepts';

export const GLOSSARY_CONCEPTS: KnowledgeConceptSpec[] = GLOSSARY.map((g) => ({
  id: `concept::glossary::${g.term.toLowerCase().replace(/\s+/g, '-')}`,
  name: g.term,
  domain: g.domain === 'neuroscience' ? 'neuroscience' : g.domain === 'psychology' ? 'psychology' : g.domain === 'practice' ? 'transformation' : 'spirituality',
  nodeType: 'concept',
  description: g.longDef || g.shortDef,
  aliases: [g.shortDef],
}));
