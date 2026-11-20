import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  buildKnowledgeGraphFromBatches,
  clearBatchCache,
  getBatchStats,
  loadAllBatches,
  loadBatchManifest,
  searchBatches,
} from '@/lib/knowledgeGraph';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

function readPublicJson(url: string): unknown | null {
  const relative = url.replace(/^\/+/, '').split('?')[0];
  const file = path.join(PUBLIC_DIR, relative);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

beforeEach(() => {
  clearBatchCache();
  vi.stubGlobal('fetch', async (input: unknown) => {
    const body = readPublicJson(String(input));
    if (body === null) {
      return { ok: false, status: 404, json: async () => ({}) } as unknown as Response;
    }
    return { ok: true, status: 200, json: async () => body } as unknown as Response;
  });
});

afterEach(() => {
  clearBatchCache();
  vi.unstubAllGlobals();
});

describe('knowledge batches', () => {
  it('loads a manifest that indexes the shipped batches', async () => {
    const manifest = await loadBatchManifest();
    expect(manifest).not.toBeNull();
    expect(manifest!.batches.length).toBeGreaterThan(0);
    expect(manifest!.totals.nodes).toBeGreaterThan(1000);
  });

  it(
    'merges batches into a graph',
    async () => {
      const graph = await buildKnowledgeGraphFromBatches();
      expect(graph.nodes.size).toBeGreaterThan(1000);
      expect(graph.edges.length).toBeGreaterThan(1000);
      const dangling = graph.edges.filter(
        (edge) => !graph.nodes.has(edge.sourceId) || !graph.nodes.has(edge.targetId)
      );
      expect(dangling).toHaveLength(0);
    },
    30000
  );

  it('searches loaded batches', async () => {
    const hits = await searchBatches('witness', 10);
    expect(hits.length).toBeGreaterThan(0);
  });

  it('reports stats for the loaded graph', async () => {
    const stats = await getBatchStats();
    expect(stats.batches).toBeGreaterThan(0);
    expect(stats.nodes).toBeGreaterThan(0);
    expect(Object.keys(stats.domains).length).toBeGreaterThan(0);
  });
});
