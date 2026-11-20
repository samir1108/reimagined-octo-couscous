import type { KnowledgeDomain } from '@/types/knowledgeGraph';

export interface KnowledgeDomainSpec {
  id: KnowledgeDomain;
  name: string;
  description: string;
}

export const KNOWLEDGE_DOMAIN_SPECS: KnowledgeDomainSpec[] = [
  { id: 'consciousness', name: 'Consciousness', description: 'Awareness, witness, presence, self-awareness, attention and identification.' },
  { id: 'mind', name: 'Mind', description: 'Thoughts, beliefs, memories, imagination and cognition.' },
  { id: 'psychology', name: 'Psychology', description: 'Emotions, personality, attachment, shadow and behaviour.' },
  { id: 'yoga', name: 'Yoga', description: 'Raja, Jnana, Bhakti, Karma and Hatha Yoga traditions and practices.' },
  { id: 'spirituality', name: 'Spirituality', description: 'Vedanta, Upanishads, Buddhist philosophy and Sankhya.' },
  { id: 'neuroscience', name: 'Neuroscience', description: 'Attention, neuroplasticity, nervous system and cognition.' },
  { id: 'body', name: 'Human Body', description: 'Breath, movement, sleep, energy and physiology.' },
  { id: 'behaviour', name: 'Behaviour', description: 'Habits, loops, conditioning, decisions and actions.' },
  { id: 'life', name: 'Life Domains', description: 'Relationships, career, health, finance and purpose.' },
  { id: 'transformation', name: 'Transformation', description: 'Practices, interventions, journeys, integration and progression.' },
];
