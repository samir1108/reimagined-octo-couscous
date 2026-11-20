import type { KnowledgeDomain } from '@/types/knowledgeGraph';
import type { KnowledgeConceptSpec } from './concepts';

const DOMAIN_TOPICS: Record<KnowledgeDomain, string[]> = {
  consciousness: ['awareness', 'attention', 'witness', 'presence', 'identification', 'stillness', 'mindfulness', 'embodiment'],
  mind: ['thought', 'belief', 'memory', 'imagination', 'cognition', 'mental model', 'bias', 'rumination'],
  psychology: ['emotion', 'fear', 'anger', 'sadness', 'joy', 'shame', 'attachment', 'shadow', 'identity', 'maturity'],
  yoga: ['asana', 'pranayama', 'dharana', 'dhyana', 'samadhi', 'viveka', 'vairagya', 'karma', 'bhakti', 'hatha'],
  spirituality: ['vedanta', 'upanishads', 'atman', 'brahman', 'maya', 'karma', 'samsara', 'moksha', 'nirvana', 'sati'],
  neuroscience: ['neuroplasticity', 'attention', 'nervous system', 'amygdala', 'prefrontal cortex', 'interoception', 'vagus nerve', 'DMN'],
  body: ['breath', 'sleep', 'movement', 'energy', 'posture', 'physiology', 'diaphragmatic breathing'],
  behaviour: ['habit', 'conditioning', 'reinforcement', 'avoidance', 'loop', 'decision', 'action', 'pattern'],
  life: ['relationships', 'career', 'health', 'finance', 'purpose', 'goals', 'challenges', 'stress'],
  transformation: ['practice', 'meditation', 'reflection', 'breathwork', 'somatic', 'contemplation', 'journey', 'integration'],
};

const ASPECTS = ['foundations', 'advanced', 'practice', 'theory', 'application', 'measurement', 'integration', 'safety'];

export function generateKnowledgeConcepts(target = 1000005): KnowledgeConceptSpec[] {
  const out: KnowledgeConceptSpec[] = [];
  const domains = Object.keys(DOMAIN_TOPICS) as KnowledgeDomain[];
  let i = 0;
  while (out.length < target) {
    const domain = domains[i % domains.length];
    const topic = DOMAIN_TOPICS[domain][Math.floor(i / domains.length) % DOMAIN_TOPICS[domain].length];
    const aspect = ASPECTS[i % ASPECTS.length];
    const id = `concept::generated::${domain}::${topic.replace(/\s+/g, '-') }::${aspect}::${i}`;
    out.push({
      id,
      name: `${topic} — ${aspect}`,
      domain,
      nodeType: 'concept',
      description: `Generated knowledge entry for ${topic} (${aspect}) in ${domain}. Synthetic scaffold requiring curation.`,
      aliases: [topic],
    });
    i++;
  }
  return out;
}
