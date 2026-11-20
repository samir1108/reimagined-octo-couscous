// Knowledge ingestion pipeline scaffold
// Upload text -> extract entities/relations -> resolve -> store with source attribution.

export interface IngestionInput {
  title: string;
  text: string;
  sourceType: 'text' | 'research' | 'assessment' | 'practice' | 'framework' | 'blog';
  tradition?: string;
  author?: string;
}

export interface ExtractedEntity {
  name: string;
  type: string;
  domain: string;
  description?: string;
}

export interface ExtractedRelation {
  source: string;
  target: string;
  relationshipType: string;
  evidence?: string;
}

export interface IngestionResult {
  entities: ExtractedEntity[];
  relations: ExtractedRelation[];
  chunks: string[];
}

export function chunkText(text: string, maxChars = 1200): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);
  let current = '';
  for (const p of paragraphs) {
    if (current.length + p.length + 2 > maxChars && current) {
      chunks.push(current.trim());
      current = '';
    }
    current += (current ? '\n\n' : '') + p;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

// Placeholder extraction: real implementation calls LLM gateway
export async function extractEntitiesAndRelations(chunk: string): Promise<{ entities: ExtractedEntity[]; relations: ExtractedRelation[] }> {
  const endpoint = (import.meta as { env?: Record<string, string> }).env?.VITE_KNOWLEDGE_LLM_ENDPOINT;
  if (!endpoint) return { entities: [], relations: [] };
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: chunk }),
    });
    if (!res.ok) return { entities: [], relations: [] };
    const data = await res.json();
    return { entities: data.entities || [], relations: data.relations || [] };
  } catch {
    return { entities: [], relations: [] };
  }
}

export async function ingestDocument(input: IngestionInput): Promise<IngestionResult> {
  const chunks = chunkText(input.text);
  const entities: ExtractedEntity[] = [];
  const relations: ExtractedRelation[] = [];
  for (const chunk of chunks) {
    const res = await extractEntitiesAndRelations(chunk);
    entities.push(...res.entities);
    relations.push(...res.relations);
  }
  return { entities, relations, chunks };
}

export async function ingestBlog(input: IngestionInput & { slug: string }): Promise<IngestionResult & { slug: string }> {
  const result = await ingestDocument({ ...input, sourceType: 'blog' });
  return { ...result, slug: input.slug };
}

// Entity resolution: merge by normalized name + domain; never merge across traditions without review
// Deduplicate entities by normalized name + domain
export function deduplicateEntities(entities: ExtractedEntity[]): ExtractedEntity[] {
  const seen = new Set<string>();
  const out: ExtractedEntity[] = [];
  for (const e of entities) {
    const key = `${e.domain}::${normalizeName(e.name)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}

// Simple quality score based on description length and aliases
export function scoreQuality(entity: ExtractedEntity): number {
  let score = 0.5;
  if (entity.description && entity.description.length > 40) score += 0.2;
  if (entity.description && entity.description.length > 120) score += 0.1;
  return Math.min(1, score);
}
