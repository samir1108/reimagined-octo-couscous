import { describe, it, expect } from 'vitest';
import { getKnowledgeGraph, resetKnowledgeGraphCache } from '@/data/knowledge';
import { getKnowledgeEngine } from '@/lib/knowledgeGraph';

describe('Knowledge Graph', () => {
  it('has many nodes', () => {
    resetKnowledgeGraphCache();
    const g = getKnowledgeGraph();
    expect(g.nodes.size).toBeGreaterThan(100000);
  }, 120000);

  it('search returns results', () => {
    const engine = getKnowledgeEngine();
    const res = engine.search('awareness', 5);
    expect(res.length).toBeGreaterThan(0);
  }, 120000);
});
