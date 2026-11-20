/**
 * Batch loader — the runtime side of the knowledge graph.
 *
 * The graph ships as immutable JSON batches under public/knowledge/batches/,
 * indexed by a manifest. Nothing is imported into the bundle: the app fetches
 * the manifest once, then fetches individual batches on demand and caches them.
 * Batches are self-contained, so any single batch is a usable subgraph.
 */

import { publicAssetUrl } from '@/lib/media/publicAssets';
import type {
  KnowledgeEdge,
  KnowledgeGraph,
  KnowledgeNode,
} from '@/types/knowledgeGraph';
import type {
  KBatch,
  KBatchManifest,
  KBatchManifestEntry,
  KBatchNode,
  KBatchStats,
} from '@/types/knowledgeBatch';

const MANIFEST_PATH = '/knowledge/batches/manifest.json';
const BATCH_BASE = '/knowledge/batches/';
const FETCH_CONCURRENCY = 4;

const batchCache = new Map<string, KBatch>();
let manifestCache: KBatchManifest | null = null;
let manifestInflight: Promise<KBatchManifest | null> | null = null;

function batchUrl(file: string): string {
  return publicAssetUrl(`${BATCH_BASE}${file}`);
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { cache: 'force-cache' });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function loadBatchManifest(): Promise<KBatchManifest | null> {
  if (manifestCache) return manifestCache;
  if (manifestInflight) return manifestInflight;
  manifestInflight = fetchJson<KBatchManifest>(publicAssetUrl(MANIFEST_PATH))
    .then((manifest) => {
      manifestCache = manifest;
      manifestInflight = null;
      return manifest;
    })
    .catch(() => {
      manifestInflight = null;
      return null;
    });
  return manifestInflight;
}

export async function loadBatch(id: string): Promise<KBatch | null> {
  const cached = batchCache.get(id);
  if (cached) return cached;
  const manifest = await loadBatchManifest();
  const entry = manifest?.batches.find((b) => b.id === id);
  if (!entry) return null;
  const batch = await fetchJson<KBatch>(batchUrl(entry.file));
  if (batch) batchCache.set(id, batch);
  return batch;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index]);
    }
  });
  await Promise.all(runners);
  return results;
}

export async function loadAllBatches(): Promise<KBatch[]> {
  const manifest = await loadBatchManifest();
  if (!manifest) return [];
  const missing: KBatchManifestEntry[] = manifest.batches.filter((entry) => !batchCache.has(entry.id));
  await mapWithConcurrency(missing, FETCH_CONCURRENCY, async (entry) => {
    const batch = await fetchJson<KBatch>(batchUrl(entry.file));
    if (batch) batchCache.set(entry.id, batch);
    return batch;
  });
  return manifest.batches
    .map((entry) => batchCache.get(entry.id))
    .filter((batch): batch is KBatch => Boolean(batch));
}

export function clearBatchCache(): void {
  batchCache.clear();
  manifestCache = null;
  manifestInflight = null;
}

function toKnowledgeNode(node: KBatchNode): KnowledgeNode {
  return {
    id: node.id,
    slug: node.slug,
    name: node.name,
    description: node.description,
    nodeType: node.nodeType,
    domain: node.domain,
    aliases: node.aliases,
    metadata: {
      qualityScore: node.qualityScore,
      provenance: node.provenance,
      batch: true,
    },
    qualityScore: node.qualityScore,
    translations: node.translations,
    sourceIds: [node.provenance.sourceId],
  };
}

/**
 * Merge loaded batches into the graph shape the existing engines consume.
 * Node and edge ids are stable across batches, so repeated term nodes collapse.
 */
export function mergeBatches(batches: KBatch[]): KnowledgeGraph {
  const nodes = new Map<string, KnowledgeNode>();
  const edgeMap = new Map<string, KnowledgeEdge>();

  for (const batch of batches) {
    for (const node of batch.nodes) {
      if (!nodes.has(node.id)) nodes.set(node.id, toKnowledgeNode(node));
    }
    for (const edge of batch.edges) {
      const key = `${edge.relationshipType}:${edge.sourceId}:${edge.targetId}`;
      if (edgeMap.has(key)) continue;
      edgeMap.set(key, {
        id: edge.id,
        sourceId: edge.sourceId,
        targetId: edge.targetId,
        relationshipType: edge.relationshipType,
        weight: edge.weight,
        confidence: edge.confidence,
        metadata: { provenance: edge.provenance },
        sourceIds: [edge.provenance.sourceId],
      });
    }
  }

  const edges = Array.from(edgeMap.values()).filter(
    (edge) => nodes.has(edge.sourceId) && nodes.has(edge.targetId)
  );
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    const list = adjacency.get(edge.sourceId);
    if (list) list.push(edge.targetId);
    else adjacency.set(edge.sourceId, [edge.targetId]);
  }

  return { nodes, edges, adjacency };
}

export async function buildKnowledgeGraphFromBatches(): Promise<KnowledgeGraph> {
  return mergeBatches(await loadAllBatches());
}

export interface BatchSearchHit {
  node: KnowledgeNode;
  score: number;
  batchId: string;
}

export async function searchBatches(query: string, limit = 20): Promise<BatchSearchHit[]> {
  const term = query.toLowerCase().trim();
  if (!term) return [];
  const batches = await loadAllBatches();
  const hits: BatchSearchHit[] = [];
  const seen = new Set<string>();

  for (const batch of batches) {
    for (const node of batch.nodes) {
      if (seen.has(node.id)) continue;
      let score = 0;
      if (node.name.toLowerCase().includes(term)) score += 10;
      if (node.slug.toLowerCase().includes(term)) score += 6;
      for (const alias of node.aliases) {
        if (alias.toLowerCase().includes(term)) score += 4;
      }
      if (node.description.toLowerCase().includes(term)) score += 2;
      if (score === 0) continue;
      seen.add(node.id);
      hits.push({ node: toKnowledgeNode(node), score, batchId: batch.id });
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export async function getBatchStats(): Promise<KBatchStats> {
  const batches = await loadAllBatches();
  const stats: KBatchStats = {
    batches: batches.length,
    nodes: 0,
    edges: 0,
    passages: 0,
    domains: {},
    nodeTypes: {},
  };
  const seenNodes = new Set<string>();

  for (const batch of batches) {
    stats.edges += batch.edges.length;
    stats.passages += batch.passages.length;
    for (const node of batch.nodes) {
      if (seenNodes.has(node.id)) continue;
      seenNodes.add(node.id);
      stats.nodes += 1;
      stats.domains[node.domain] = (stats.domains[node.domain] ?? 0) + 1;
      stats.nodeTypes[node.nodeType] = (stats.nodeTypes[node.nodeType] ?? 0) + 1;
    }
  }
  return stats;
}
