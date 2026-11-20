import { describe, it, expect } from 'vitest';
import { buildConsciousnessGraph, resetGraphCache } from '@/data/graph';
import { GraphEngine, getEngine } from '@/lib/graph/engine';
import { buildGraphContextForQuery, buildAnatomyReport } from '@/lib/graph/contextBuilder';

describe('Consciousness Graph', () => {
  beforeEach(() => {
    resetGraphCache();
  });

  it('builds graph with 1000+ nodes', () => {
    const graph = buildConsciousnessGraph();
    expect(graph.nodes.size).toBeGreaterThan(1000);
  });

  it('builds graph with 500+ edges', () => {
    const graph = buildConsciousnessGraph();
    expect(graph.edges.length).toBeGreaterThan(500);
  });

  it('includes all major node types', () => {
    const graph = buildConsciousnessGraph();
    const types = new Set<string>();
    for (const node of graph.nodes.values()) types.add(node.type);

    expect(types.has('loop')).toBe(true);
    expect(types.has('practice')).toBe(true);
    expect(types.has('dimension')).toBe(true);
    expect(types.has('chakra')).toBe(true);
    expect(types.has('band')).toBe(true);
    expect(types.has('task-domain')).toBe(true);
    expect(types.has('bridge')).toBe(true);
    expect(types.has('course-day')).toBe(true);
    expect(types.has('course-phase')).toBe(true);
    expect(types.has('observation-level')).toBe(true);
  });

  it('finds VAL001 validation loop node', () => {
    const engine = new GraphEngine();
    const node = engine.getNode('loop::VAL001');
    expect(node).toBeDefined();
    expect(node?.label).toBe('People-Pleasing');
    expect(node?.type).toBe('loop');
  });

  it('finds VAL001 → chakra edge', () => {
    const engine = new GraphEngine();
    const loopNode = engine.getNode('loop::VAL001');
    expect(loopNode).toBeDefined();

    const chakras = engine.outgoing(loopNode!.id, ['LOOP_RELATED_TO_CHAKRA']);
    expect(chakras.length).toBeGreaterThan(0);
  });

  it('finds VAL001 → dimension edge', () => {
    const engine = new GraphEngine();
    const loopNode = engine.getNode('loop::VAL001');
    expect(loopNode).toBeDefined();

    const dims = engine.outgoing(loopNode!.id, ['LOOP_RELATED_TO_DIMENSION']);
    expect(dims.length).toBeGreaterThan(0);
    expect(dims.some(d => d.id === 'dimension::consciousness::emotion')).toBe(true);
  });

  it('finds VAL002 → practice edges (dissolution)', () => {
    const engine = new GraphEngine();
    const loopNode = engine.getNode('loop::VAL002');
    expect(loopNode).toBeDefined();

    const practices = engine.outgoing(loopNode!.id, ['LOOP_DISSOLVES_VIA']);
    expect(practices.length).toBeGreaterThan(0);
  });

  it('finds band common loops', () => {
    const engine = new GraphEngine();
    const loops = engine.loopsForBand(2);
    expect(loops.length).toBeGreaterThan(0);
  });

  it('finds practices for dimension', () => {
    const engine = new GraphEngine();
    const practices = engine.practicesForDimension('emotion');
    expect(practices.length).toBeGreaterThan(0);
  });

  it('finds path between loop and practice', () => {
    const engine = new GraphEngine();
    const path = engine.path('loop::VAL002', 'practice::observation');
    expect(path.length).toBeGreaterThan(0);
  });

  it('builds subgraph around VAL001', () => {
    const engine = new GraphEngine();
    const subgraph = engine.subgraph('loop::VAL001', 2);
    expect(subgraph.nodes.size).toBeGreaterThan(5);
    expect(subgraph.edges.length).toBeGreaterThan(0);
  });

  it('searches nodes by query', () => {
    const engine = new GraphEngine();
    const results = engine.search('people-pleasing');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(n => n.id === 'loop::VAL001')).toBe(true);
  });

  it('builds graph context for query', () => {
    const context = buildGraphContextForQuery('validation');
    expect(context.relevantNodes.length).toBeGreaterThan(0);
    expect(context.graphStats).toBeDefined();
    expect(context.graphStats!.nodeCount).toBeGreaterThan(1000);
  });

  it('builds anatomy report for loop', () => {
    const report = buildAnatomyReport('loop::VAL001');
    expect(report).toBeDefined();
    expect(report!.center.label).toBe('People-Pleasing');
    expect(report!.neighbors.length).toBeGreaterThan(0);
    expect(report!.suggestions.length).toBeGreaterThan(0);
  });

  it('includes BAND_GUIDEBOOK loops as edges', () => {
    const engine = new GraphEngine();
    const band2Loops = engine.loopsForBand(2);
    expect(band2Loops.length).toBeGreaterThan(0);
  });

  it('includes DIMENSION_IMPACT_MATRIX as edges', () => {
    const engine = new GraphEngine();
    const emotionPractices = engine.practicesForDimension('emotion');
    expect(emotionPractices.length).toBeGreaterThan(0);
  });

  it('includes CROSS_POLLINATION_MAP as edges', () => {
    const graph = buildConsciousnessGraph();
    const crossPollinationEdges = graph.edges.filter(e => e.type === 'CROSS_POLLINATION_ROUTE');
    expect(crossPollinationEdges.length).toBeGreaterThan(0);
  });

  it('includes COURSE_PHASES and COURSE_DAYS', () => {
    const graph = buildConsciousnessGraph();
    const phaseNodes = Array.from(graph.nodes.values()).filter(n => n.type === 'course-phase');
    const dayNodes = Array.from(graph.nodes.values()).filter(n => n.type === 'course-day');
    expect(phaseNodes.length).toBeGreaterThan(0);
    expect(dayNodes.length).toBeGreaterThan(100);
  });

  it('includes OBSERVATION_LADDER', () => {
    const graph = buildConsciousnessGraph();
    const obsNodes = Array.from(graph.nodes.values()).filter(n => n.type === 'observation-level');
    expect(obsNodes.length).toBeGreaterThan(0);
  });

  it('includes PATHS and PATH_LEVELS', () => {
    const graph = buildConsciousnessGraph();
    const pathNodes = Array.from(graph.nodes.values()).filter(n => n.type === 'path');
    const pathLevelNodes = Array.from(graph.nodes.values()).filter(n => n.type === 'path-level');
    expect(pathNodes.length).toBe(6);
    expect(pathLevelNodes.length).toBeGreaterThan(30);
  });

  it('includes SKILLS and SKILL_LEVELS', () => {
    const graph = buildConsciousnessGraph();
    const skillNodes = Array.from(graph.nodes.values()).filter(n => n.type === 'skill');
    const skillLevelNodes = Array.from(graph.nodes.values()).filter(n => n.type === 'skill-level');
    expect(skillNodes.length).toBe(9);
    expect(skillLevelNodes.length).toBeGreaterThan(50);
  });

  it('includes BRIDGES', () => {
    const graph = buildConsciousnessGraph();
    const bridgeNodes = Array.from(graph.nodes.values()).filter(n => n.type === 'bridge');
    expect(bridgeNodes.length).toBeGreaterThan(0);
  });

  it('returns graph stats', () => {
    const engine = new GraphEngine();
    const stats = engine.getStats();
    expect(stats.nodeCount).toBeGreaterThan(1000);
    expect(stats.edgeCount).toBeGreaterThan(500);
    expect(Object.keys(stats.nodeTypes).length).toBeGreaterThan(10);
  });

  it('engine is a singleton via getEngine', () => {
    const e1 = getEngine();
    const e2 = getEngine();
    expect(e1).toBe(e2);
  });
});
