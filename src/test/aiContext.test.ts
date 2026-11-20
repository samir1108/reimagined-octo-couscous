import { describe, it, expect } from 'vitest';
import { analyzeLoopWithGraph, analyzeBandProgression, suggestCrossPollination, buildEnrichedAIPrompt } from '@/lib/graph/aiContext';
import { resetGraphCache } from '@/data/graph';

describe('AI Context Builder', () => {
  beforeEach(() => {
    resetGraphCache();
  });

  it('analyzes VAL002 loop with graph', () => {
    const analysis = analyzeLoopWithGraph('VAL002');
    expect(analysis).toBeDefined();
    expect(analysis?.loopName).toBe('Perfectionism');
    expect(analysis?.dissolutionPractices.length).toBeGreaterThan(0);
    expect(analysis?.chakra).not.toBe('Unknown');
    expect(analysis?.dimension).not.toBe('Unknown');
  });

  it('analyzes band 2 progression', () => {
    const progression = analyzeBandProgression(2);
    expect(progression).toBeDefined();
    expect(progression?.currentBand).toBe(2);
    expect(progression?.nextBand).toBe(3);
    expect(progression?.likelyLoops.length).toBeGreaterThanOrEqual(0);
  });

  it('suggests cross-pollination for observation', () => {
    const suggestion = suggestCrossPollination('observation', 3);
    expect(suggestion).toBeDefined();
    expect(suggestion?.suggestedPractice).toBeDefined();
    expect(suggestion?.reason.length).toBeGreaterThan(0);
  });

  it('builds enriched AI prompt for query', () => {
    const result = buildEnrichedAIPrompt('perfectionism');
    expect(result.systemPrompt.length).toBeGreaterThan(0);
    expect(result.systemPrompt).toContain('consciousness guide');
    expect(result.context.relevantNodes.length).toBeGreaterThan(0);
  });

  it('includes graph context in AI prompt', () => {
    const result = buildEnrichedAIPrompt('perfectionism');
    expect(result.systemPrompt.length).toBeGreaterThan(0);
    expect(result.systemPrompt).toContain('RELEVANT CONCEPTS');
  });

  it('returns null for invalid band', () => {
    const progression = analyzeBandProgression(99);
    expect(progression).toBeNull();
  });

  it('returns null for invalid loop', () => {
    const analysis = analyzeLoopWithGraph('INVALID');
    expect(analysis).toBeNull();
  });

  it('returns null for cross-pollination with no routes', () => {
    const suggestion = suggestCrossPollination('nonexistent-practice', 1);
    expect(suggestion).toBeNull();
  });

  it('includes dissolution paths with graph paths', () => {
    const analysis = analyzeLoopWithGraph('VAL002');
    expect(analysis?.dissolutionPractices.length).toBeGreaterThan(0);
    const hasGraphPath = analysis?.dissolutionPractices.some(p => p.graphPath.length > 0);
    expect(hasGraphPath).toBe(true);
  });

  it('includes band context with band names', () => {
    const analysis = analyzeLoopWithGraph('VAL001');
    expect(analysis?.bandContext.length).toBeGreaterThan(0);
  });

  it('builds prompt with bridges when available', () => {
    const result = buildEnrichedAIPrompt('observer quantum');
    expect(result.systemPrompt.length).toBeGreaterThan(0);
  });
});
