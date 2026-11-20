import type { KnowledgeSource } from '@/types/knowledgeGraph';

export const KNOWLEDGE_SOURCES: KnowledgeSource[] = [
  { id: 'source::yoga-sutras', title: 'Yoga Sutras of Patanjali', author: 'Patanjali', tradition: 'Classical Yoga', sourceType: 'text' },
  { id: 'source::bhagavad-gita', title: 'Bhagavad Gita', tradition: 'Hindu', sourceType: 'text' },
  { id: 'source::upanishads', title: 'Principal Upanishads', tradition: 'Vedanta', sourceType: 'text' },
  { id: 'source::dhammapada', title: 'Dhammapada', tradition: 'Buddhism', sourceType: 'text' },
  { id: 'source::vivekachudamani', title: 'Vivekachudamani', author: 'Shankaracharya', tradition: 'Advaita Vedanta', sourceType: 'text' },
  { id: 'source::kabat-zinn', title: 'Full Catastrophe Living', author: 'Jon Kabat-Zinn', sourceType: 'text', publicationYear: 1990 },
  { id: 'source::neuroplasticity-research', title: 'Neuroplasticity Research', sourceType: 'research' },
  { id: 'source::polyvagal', title: 'Polyvagal Theory', author: 'Stephen Porges', sourceType: 'research' },
  { id: 'source::consciousos-framework', title: 'ConsciousOS Framework', sourceType: 'framework' },
  { id: 'source::consciousos-blog-1', title: 'ConsciousOS Blog: Understanding Witness Consciousness', sourceType: 'blog', author: 'ConsciousOS', publicationYear: 2026 },
  { id: 'source::consciousos-blog-2', title: 'ConsciousOS Blog: Focus and Attention Training', sourceType: 'blog', author: 'ConsciousOS', publicationYear: 2026 },
];
