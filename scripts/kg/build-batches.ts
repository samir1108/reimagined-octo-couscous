/**
 * kg:build — deterministic knowledge-batch builder.
 *
 * Reads the app's curated sources (essays, loops, practices, breakthroughs and
 * the concept catalog) and emits immutable batch files plus a manifest. No LLM
 * call is involved: extraction is token-matching against the in-app vocabulary,
 * so the same input always produces byte-identical output.
 *
 * Usage:
 *   vite-node scripts/kg/build-batches.ts
 *   vite-node scripts/kg/build-batches.ts --source=essays --batch-size=1500
 *   vite-node scripts/kg/build-batches.ts --out=public/knowledge/batches --dry
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { KNOWLEDGE_ESSAYS } from '@/data/knowledgeEssays';
import { LOOPS } from '@/data/loops';
import { ALL_PRACTICES } from '@/types/practices';
import { BREAKTHROUGH_TYPES } from '@/data/breakthroughs';
import { KNOWLEDGE_CONCEPTS } from '@/data/knowledge/concepts';
import { CURATED_CONCEPTS } from '@/data/knowledge/curatedConcepts';
import { GLOSSARY } from '@/data/handbook/glossary';
import { GURUS } from '@/data/handbook/gurus';
import { LOOP_FAMILIES } from '@/data/handbook/loopFamilies';
import { PATHS } from '@/data/handbook/paths';
import { SKILLS } from '@/data/handbook/skills';
import { KNOWLEDGE_CARDS } from '@/data/knowledgeCards';
import { WISDOM_DECK } from '@/data/wisdomDeck';
import { SHOWROOM_PROGRAMS } from '@/data/showroomPrograms';
import { FOUNDATION_CURRICULUM } from '@/data/foundation-course';
import { SESSION_STEP_CATALOG } from '@/data/sessionStepCatalog';
import { DEMO_SESSIONS } from '@/data/demoSessions';
import { OBS_SEEDS } from '@/data/observationSessions';
import { DEEP_CONCEPTS } from '@/data/knowledge/deepConcepts';
import { validateDeepConcepts } from '@/lib/knowledge/deepConceptGate';
import { DEEP_CONCEPT_FAMILY_NODE_TYPE } from '@/types/knowledgeConcept';
import type { KnowledgeDomain, KnowledgeEdgeType, KnowledgeNodeType } from '@/types/knowledgeGraph';
import type {
  KBatch,
  KBatchEdge,
  KBatchManifest,
  KBatchManifestEntry,
  KBatchNode,
  KBatchPassage,
  KBatchProvenance,
} from '@/types/knowledgeBatch';

const ROOT = process.cwd();
const DEFAULT_OUT = 'public/knowledge/batches';
const DEFAULT_BATCH_SIZE = 300;
const BATCH_VERSION = 1;
const LOOP_IDS = new Set(LOOPS.map((loop) => loop.id));

const args = new Map<string, string>();
const flags = new Set<string>();
for (const raw of process.argv.slice(2)) {
  if (raw.startsWith('--')) {
    const [k, v] = raw.slice(2).split('=');
    if (v === undefined) flags.add(k);
    else args.set(k, v);
  }
}
const OUT_DIR = path.resolve(ROOT, args.get('out') ?? DEFAULT_OUT);
const BATCH_SIZE = Math.max(200, Number(args.get('batch-size') ?? DEFAULT_BATCH_SIZE));
const SOURCE_FILTER = (args.get('source') ?? 'all').split(',').map((s) => s.trim());
const BLOG_FILE = path.resolve(ROOT, args.get('blog-file') ?? 'public/blog-posts.json');
const DRY = flags.has('dry');
const enabled = (name: string) => SOURCE_FILTER.includes('all') || SOURCE_FILTER.includes(name);

// ── Vocabulary ──────────────────────────────────────────────────────────────

interface VocabEntry {
  termId: string;
  alias: string;
  words: string[];
}

const MIN_ALIAS = 4;
const STOPLIST = new Set(['the', 'and', 'with', 'this', 'that', 'from', 'what', 'when', 'your', 'you']);

function termSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function termIdFor(name: string, domain: KnowledgeDomain): string {
  return `kb::term::${domain}::${termSlug(name)}`;
}

function glossaryDomain(domain: string): KnowledgeDomain {
  if (domain === 'neuroscience') return 'neuroscience';
  if (domain === 'psychology') return 'psychology';
  if (domain === 'practice') return 'transformation';
  return 'spirituality';
}

function buildVocabulary(): { entries: VocabEntry[]; nodes: Map<string, KBatchNode> } {
  const nodes = new Map<string, KBatchNode>();
  const entries: VocabEntry[] = [];
  const seenAlias = new Set<string>();

  const add = (name: string, domain: KnowledgeDomain, aliases: string[], description: string) => {
    const id = termIdFor(name, domain);
    if (!nodes.has(id)) {
      nodes.set(id, {
        id,
        slug: id.replace(/::/g, '-'),
        name,
        description: description.slice(0, 400),
        nodeType: 'concept',
        domain,
        aliases: aliases.slice(0, 12),
        qualityScore: 0.6,
        provenance: { source: 'vocabulary', sourceId: id, license: 'proprietary' },
      });
    }
    for (const alias of [name, ...aliases]) {
      const normalized = alias.toLowerCase().trim();
      if (normalized.length < MIN_ALIAS || STOPLIST.has(normalized)) continue;
      if (seenAlias.has(normalized)) continue;
      seenAlias.add(normalized);
      entries.push({ termId: id, alias: normalized, words: normalized.split(/\s+/) });
    }
  };

  for (const concept of [...CURATED_CONCEPTS, ...KNOWLEDGE_CONCEPTS]) {
    add(concept.name, concept.domain, concept.aliases ?? [], concept.description);
  }
  for (const loop of LOOPS) {
    add(loop.name, 'behaviour', loop.keywords ?? [], loop.description);
  }
  for (const practice of ALL_PRACTICES) {
    add(practice.label, 'transformation', [], practice.levels.map((l) => l.description).join(' '));
  }
  for (const term of GLOSSARY) {
    add(term.term, glossaryDomain(term.domain), term.seeAlso ?? [], `${term.shortDef} ${term.longDef}`);
  }
  for (const guru of GURUS) {
    add(guru.name, 'spirituality', [guru.lineage], `${guru.oneLine} ${guru.story}`);
  }
  for (const family of LOOP_FAMILIES) {
    add(family.name, 'behaviour', [], family.feels);
  }
  for (const path of PATHS) {
    add(path.name, 'yoga', [path.slug], `${path.essence} ${path.origin}`);
  }
  for (const skill of SKILLS) {
    add(skill.name, 'transformation', [], skill.essence);
  }

  entries.sort((a, b) => b.words.length - a.words.length || a.alias.localeCompare(b.alias));
  return { entries, nodes };
}

interface VocabularyIndex {
  byFirstWord: Map<string, VocabEntry[]>;
  nodes: Map<string, KBatchNode>;
}

function indexVocabulary(entries: VocabEntry[], nodes: Map<string, KBatchNode>): VocabularyIndex {
  const byFirstWord = new Map<string, VocabEntry[]>();
  for (const entry of entries) {
    const list = byFirstWord.get(entry.words[0]) ?? [];
    list.push(entry);
    byFirstWord.set(entry.words[0], list);
  }
  return { byFirstWord, nodes };
}

const TOKEN_RE = /[a-z][a-z'-]{1,}/g;

function matchTerms(text: string, index: VocabularyIndex): Map<string, number> {
  const tokens = text.toLowerCase().match(TOKEN_RE) ?? [];
  const counts = new Map<string, number>();
  for (let i = 0; i < tokens.length; i++) {
    const candidates = index.byFirstWord.get(tokens[i]);
    if (!candidates) continue;
    for (const candidate of candidates) {
      const span = candidate.words.length;
      if (i + span > tokens.length) continue;
      let hit = true;
      for (let w = 1; w < span; w++) {
        if (tokens[i + w] !== candidate.words[w]) {
          hit = false;
          break;
        }
      }
      if (hit) counts.set(candidate.termId, (counts.get(candidate.termId) ?? 0) + 1);
    }
  }
  return counts;
}

// ── Text helpers ────────────────────────────────────────────────────────────

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~>]/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function sentenceCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function quality(text: string, termHits: number, citations: number): number {
  let score = 0.4;
  if (text.length > 2000) score += 0.2;
  else if (text.length > 500) score += 0.1;
  if (termHits >= 5) score += 0.25;
  else if (termHits >= 2) score += 0.15;
  else if (termHits >= 1) score += 0.05;
  if (citations > 0) score += 0.1;
  return Math.min(1, Number(score.toFixed(2)));
}

function topTerms(hits: Map<string, number>, max: number, minCount = 1): Array<[string, number]> {
  return Array.from(hits.entries())
    .filter(([, count]) => count >= minCount)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, max);
}

function chunkParagraphs(text: string, maxChars = 1200): string[] {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = '';
  for (const paragraph of paragraphs) {
    if (current && current.length + paragraph.length + 2 > maxChars) {
      chunks.push(current);
      current = '';
    }
    current += (current ? '\n\n' : '') + paragraph;
  }
  if (current) chunks.push(current);
  return chunks;
}

// ── Source → bundle ─────────────────────────────────────────────────────────

interface Bundle {
  nodes: KBatchNode[];
  edges: KBatchEdge[];
  passages: KBatchPassage[];
}

const ESSAY_DOMAIN: Record<string, KnowledgeDomain> = {
  bands: 'consciousness',
  paths: 'yoga',
  lineage: 'spirituality',
  loops: 'behaviour',
  neuroscience: 'neuroscience',
  religion: 'spirituality',
  suffering: 'psychology',
  witness: 'consciousness',
  death: 'spirituality',
  letters: 'transformation',
  future: 'transformation',
  gurus: 'spirituality',
};

const LOOP_DOMAIN: Record<string, KnowledgeDomain> = {
  validation: 'psychology',
  control: 'behaviour',
  avoidance: 'behaviour',
  attachment: 'psychology',
  comparison: 'psychology',
  narrative: 'mind',
  survival: 'psychology',
  body: 'body',
  energy: 'body',
  emotional: 'psychology',
  mental: 'mind',
  behavioral: 'behaviour',
  habit: 'behaviour',
  social: 'life',
  relationship: 'life',
  identity: 'mind',
  ego: 'consciousness',
  belief: 'mind',
  cognitive_bias: 'mind',
  attention: 'consciousness',
  motivation: 'transformation',
  decision: 'behaviour',
  learning: 'mind',
  productivity: 'behaviour',
  creativity: 'transformation',
  purpose: 'life',
  spiritual: 'spirituality',
  scarcity: 'life',
};

function essayBundles(index: VocabularyIndex): Bundle[] {
  const bundles: Bundle[] = [];
  for (const essay of KNOWLEDGE_ESSAYS) {
    const domain = ESSAY_DOMAIN[essay.category] ?? 'transformation';
    const docId = `kb::doc::essay::${essay.slug}`;
    const provenance: KBatchProvenance = {
      source: 'knowledge_essay',
      sourceId: essay.slug,
      url: `/blog/${essay.slug}`,
      license: 'proprietary',
    };
    const body = stripMarkdown(essay.content);
    const hits = matchTerms(`${essay.title} ${essay.metaDescription} ${body}`, index);
    const docNode: KBatchNode = {
      id: docId,
      slug: essay.slug,
      name: essay.title,
      description: essay.metaDescription || essay.subtitle,
      nodeType: 'article',
      domain,
      aliases: essay.keywords.split(',').map((k) => k.trim()).filter(Boolean),
      qualityScore: quality(body, hits.size, essay.citations.length),
      provenance,
    };

    const nodes: KBatchNode[] = [docNode];
    const edges: KBatchEdge[] = [];
    const passages: KBatchPassage[] = [];

    const collectionId = `kb::collection::essay::${essay.category}`;
    nodes.push({
      id: collectionId,
      slug: collectionId.replace(/::/g, '-'),
      name: essay.categoryLabel,
      description: `Canonical essay collection: ${essay.categoryLabel}.`,
      nodeType: 'source',
      domain,
      aliases: [],
      qualityScore: 0.7,
      provenance: { source: 'collection', sourceId: essay.category, license: 'proprietary' },
    });
    edges.push({
      id: `kb::edge::${docId}::part_of::${collectionId}`,
      sourceId: docId,
      targetId: collectionId,
      relationshipType: 'PART_OF',
      weight: 1,
      confidence: 1,
      provenance,
    });

    // Sections become their own nodes and passages, so retrieval can cite a
    // specific h2 instead of returning the whole essay.
    const sections = essay.content.split(/\n##\s+/).slice(1);
    sections.forEach((section, sectionIndex) => {
      const [headingLine, ...rest] = section.split('\n');
      const heading = headingLine.trim();
      const sectionBody = stripMarkdown(rest.join('\n'));
      if (sectionBody.length < 80) return;
      const sectionId = `kb::section::essay::${essay.slug}::${sectionIndex}`;
      nodes.push({
        id: sectionId,
        slug: sectionId.replace(/::/g, '-'),
        name: heading || `${essay.title} — section ${sectionIndex + 1}`,
        description: sectionBody.slice(0, 300),
        nodeType: 'article',
        domain,
        aliases: [],
        qualityScore: quality(sectionBody, matchTerms(sectionBody, index).size, 0),
        provenance,
      });
      edges.push({
        id: `kb::edge::${sectionId}::part_of::${docId}`,
        sourceId: sectionId,
        targetId: docId,
        relationshipType: 'PART_OF',
        weight: 1,
        confidence: 1,
        provenance,
      });
      chunkParagraphs(sectionBody).forEach((chunk, chunkIndex) => {
        passages.push({
          id: `kb::passage::${sectionId}::${chunkIndex}`,
          nodeId: sectionId,
          heading,
          text: chunk,
          charCount: chunk.length,
          order: sectionIndex * 100 + chunkIndex,
          provenance,
        });
      });
    });

    for (const [termId, count] of topTerms(hits, 40, 2)) {
      const termNode = index.nodes.get(termId);
      if (!termNode) continue;
      nodes.push(termNode);
      edges.push({
        id: `kb::edge::${termId}::described_in::${docId}`,
        sourceId: termId,
        targetId: docId,
        relationshipType: 'DESCRIBED_IN',
        weight: Math.min(1, Number((count / 10).toFixed(2))),
        confidence: Math.min(0.95, 0.55 + count * 0.05),
        provenance,
      });
    }

    for (const related of essay.related ?? []) {
      const targetId = `kb::doc::essay::${related}`;
      edges.push({
        id: `kb::edge::${docId}::relates_to::${targetId}`,
        sourceId: docId,
        targetId,
        relationshipType: 'RELATES_TO',
        weight: 0.8,
        confidence: 0.9,
        provenance,
      });
    }

    essay.citations.forEach((citation, citationIndex) => {
      const sourceId = `kb::source::${termSlug(citation.label)}`;
      nodes.push({
        id: sourceId,
        slug: sourceId.replace(/::/g, '-'),
        name: citation.label,
        description: citation.note ?? `Cited source for ${essay.title}.`,
        nodeType: 'source',
        domain,
        aliases: [],
        qualityScore: 0.7,
        provenance: {
          source: 'citation',
          sourceId: `${essay.slug}#${citationIndex}`,
          url: citation.url,
          license: 'citation',
        },
      });
      edges.push({
        id: `kb::edge::${docId}::derived_from::${sourceId}`,
        sourceId: docId,
        targetId: sourceId,
        relationshipType: 'DERIVED_FROM',
        weight: 0.6,
        confidence: 0.85,
        provenance,
      });
    });

    bundles.push({ nodes, edges, passages });
  }
  return bundles;
}

function loopBundles(index: VocabularyIndex): Bundle[] {
  const bundles: Bundle[] = [];
  for (const loop of LOOPS) {
    const domain = LOOP_DOMAIN[loop.category] ?? 'behaviour';
    const docId = `kb::loop::${loop.id}`;
    const provenance: KBatchProvenance = {
      source: 'loop',
      sourceId: loop.id,
      license: 'proprietary',
    };
    const text = [
      loop.name,
      loop.description,
      loop.triggers.join(' '),
      loop.manifestations.join(' '),
      loop.awareness_markers.join(' '),
      loop.dissolution_path,
      loop.keywords.join(' '),
    ].join(' ');
    const hits = matchTerms(text, index);
    const nodes: KBatchNode[] = [
      {
        id: docId,
        slug: docId.replace(/::/g, '-'),
        name: loop.name,
        description: loop.description,
        nodeType: 'behaviour',
        domain,
        aliases: loop.keywords.slice(0, 12),
        qualityScore: quality(text, hits.size, 1),
        provenance,
      },
    ];
    const edges: KBatchEdge[] = [];
    for (const [termId, count] of topTerms(hits, 30, 1)) {
      const termNode = index.nodes.get(termId);
      if (!termNode) continue;
      nodes.push(termNode);
      edges.push({
        id: `kb::edge::${termId}::associated_with::${docId}`,
        sourceId: termId,
        targetId: docId,
        relationshipType: 'ASSOCIATED_WITH',
        weight: Math.min(1, Number((count / 6).toFixed(2))),
        confidence: Math.min(0.9, 0.5 + count * 0.06),
        provenance,
      });
    }
    const passages: KBatchPassage[] = [
      {
        id: `kb::passage::${docId}::0`,
        nodeId: docId,
        heading: 'Dissolution path',
        text: loop.dissolution_path,
        charCount: loop.dissolution_path.length,
        order: 0,
        provenance,
      },
    ];
    bundles.push({ nodes, edges, passages });
  }
  return bundles;
}

function practiceBundles(index: VocabularyIndex): Bundle[] {
  return ALL_PRACTICES.map((practice) => {
    const docId = `kb::practice::${practice.id}`;
    const provenance: KBatchProvenance = {
      source: 'practice',
      sourceId: practice.id,
      license: 'proprietary',
    };
    const levelText = practice.levels.map((level) => `${level.name}: ${level.description}`).join(' ');
    const hits = matchTerms(`${practice.label} ${levelText}`, index);
    const nodes: KBatchNode[] = [
      {
        id: docId,
        slug: docId.replace(/::/g, '-'),
        name: practice.label,
        description: practice.levels[0]?.description ?? practice.label,
        nodeType: 'practice',
        domain: 'transformation',
        aliases: practice.levels.map((level) => level.name),
        qualityScore: quality(levelText, hits.size, 0),
        provenance,
      },
    ];
    const edges: KBatchEdge[] = [];
    for (const [termId] of topTerms(hits, 20, 1)) {
      const termNode = index.nodes.get(termId);
      if (!termNode) continue;
      nodes.push(termNode);
      edges.push({
        id: `kb::edge::${docId}::practiced_through::${termId}`,
        sourceId: docId,
        targetId: termId,
        relationshipType: 'PRACTICED_THROUGH',
        weight: 0.7,
        confidence: 0.7,
        provenance,
      });
    }
    const passages: KBatchPassage[] = practice.levels.map((level, i) => ({
      id: `kb::passage::${docId}::${i}`,
      nodeId: docId,
      heading: `Level ${level.level} — ${level.name}`,
      text: level.description,
      charCount: level.description.length,
      order: i,
      provenance,
    }));
    return { nodes, edges, passages };
  });
}

interface RawBlogPost {
  slug: string;
  title: string;
  keyword?: string;
  pillar?: string;
  metaDescription?: string;
  content?: string;
  publishedAt?: string;
}

function blogDomain(pillar: string): KnowledgeDomain {
  const p = pillar.toLowerCase();
  if (/(neuro|brain)/.test(p)) return 'neuroscience';
  if (/(body|breath|sleep|health)/.test(p)) return 'body';
  if (/(yoga|practice|sadhana)/.test(p)) return 'yoga';
  if (/(loop|habit|behaviour|behavior)/.test(p)) return 'behaviour';
  if (/(mind|thought|belief)/.test(p)) return 'mind';
  if (/(psych|emotion|anxiety|burnout|suffer)/.test(p)) return 'psychology';
  if (/(spirit|vedanta|upanishad|guru|lineage|death)/.test(p)) return 'spirituality';
  if (/(life|career|money|relationship)/.test(p)) return 'life';
  return 'transformation';
}

function blogBundles(index: VocabularyIndex): Bundle[] {
  if (!fs.existsSync(BLOG_FILE)) {
    console.log(`blogs: ${path.relative(ROOT, BLOG_FILE)} not found — skipped`);
    return [];
  }
  let posts: RawBlogPost[];
  try {
    posts = JSON.parse(fs.readFileSync(BLOG_FILE, 'utf8')) as RawBlogPost[];
  } catch (error) {
    console.log(`blogs: could not parse ${path.relative(ROOT, BLOG_FILE)} — skipped (${String(error)})`);
    return [];
  }
  if (!Array.isArray(posts)) return [];

  const bundles: Bundle[] = [];
  const seen = new Set<string>();
  for (const post of posts) {
    if (!post.slug || !post.title || seen.has(post.slug)) continue;
    seen.add(post.slug);
    const domain = blogDomain(post.pillar ?? '');
    const docId = `kb::doc::blog::${post.slug}`;
    const provenance: KBatchProvenance = {
      source: 'blog_post',
      sourceId: post.slug,
      url: `/blog/${post.slug}`,
      license: 'proprietary',
    };
    const body = stripMarkdown(post.content ?? '');
    const hits = matchTerms(`${post.title} ${post.metaDescription ?? ''} ${body}`, index);
    const nodes: KBatchNode[] = [
      {
        id: docId,
        slug: post.slug,
        name: post.title,
        description: post.metaDescription ?? post.title,
        nodeType: 'article',
        domain,
        aliases: (post.keyword ?? '').split(',').map((k) => k.trim()).filter(Boolean),
        qualityScore: quality(body, hits.size, 0),
        provenance,
      },
    ];
    const edges: KBatchEdge[] = [];
    for (const [termId, count] of topTerms(hits, 40, 2)) {
      const termNode = index.nodes.get(termId);
      if (!termNode) continue;
      nodes.push(termNode);
      edges.push({
        id: `kb::edge::${termId}::described_in::${docId}`,
        sourceId: termId,
        targetId: docId,
        relationshipType: 'DESCRIBED_IN',
        weight: Math.min(1, Number((count / 8).toFixed(2))),
        confidence: Math.min(0.9, 0.5 + count * 0.05),
        provenance,
      });
    }
    const passages: KBatchPassage[] = chunkParagraphs(body).map((chunk, chunkIndex) => ({
      id: `kb::passage::${docId}::${chunkIndex}`,
      nodeId: docId,
      text: chunk,
      charCount: chunk.length,
      order: chunkIndex,
      provenance,
    }));
    bundles.push({ nodes, edges, passages });
  }
  return bundles;
}

function breakthroughBundles(index: VocabularyIndex): Bundle[] {
  return BREAKTHROUGH_TYPES.map((bt) => {
    const docId = `kb::breakthrough::${bt.id}`;
    const provenance: KBatchProvenance = {
      source: 'breakthrough',
      sourceId: bt.id,
      license: 'proprietary',
    };
    const text = `${bt.name} ${bt.description} ${bt.keywords.join(' ')}`;
    const hits = matchTerms(text, index);
    const nodes: KBatchNode[] = [
      {
        id: docId,
        slug: docId.replace(/::/g, '-'),
        name: bt.name,
        description: bt.description,
        nodeType: 'milestone',
        domain: 'transformation',
        aliases: bt.keywords.slice(0, 12),
        qualityScore: quality(text, hits.size, 0),
        provenance,
      },
    ];
    const edges: KBatchEdge[] = [];
    for (const [termId] of topTerms(hits, 20, 1)) {
      const termNode = index.nodes.get(termId);
      if (!termNode) continue;
      nodes.push(termNode);
      edges.push({
        id: `kb::edge::${docId}::associated_with::${termId}`,
        sourceId: docId,
        targetId: termId,
        relationshipType: 'ASSOCIATED_WITH',
        weight: 0.6,
        confidence: 0.65,
        provenance,
      });
    }
    return { nodes, edges, passages: [] };
  });
}

// ── Generic mention bundle ──────────────────────────────────────────────────

interface MentionSpec {
  id: string;
  slug: string;
  name: string;
  description: string;
  text: string;
  nodeType: KnowledgeNodeType;
  domain: KnowledgeDomain;
  aliases: string[];
  provenance: KBatchProvenance;
  passages?: KBatchPassage[];
  maxTerms?: number;
}

function mentionBundle(spec: MentionSpec, index: VocabularyIndex): Bundle {
  const hits = matchTerms(spec.text, index);
  const nodes: KBatchNode[] = [
    {
      id: spec.id,
      slug: spec.slug,
      name: spec.name,
      description: spec.description.slice(0, 400),
      nodeType: spec.nodeType,
      domain: spec.domain,
      aliases: spec.aliases.slice(0, 12),
      qualityScore: quality(spec.text, hits.size, 0),
      provenance: spec.provenance,
    },
  ];
  const edges: KBatchEdge[] = [];
  for (const [termId, count] of topTerms(hits, spec.maxTerms ?? 30, 1)) {
    const termNode = index.nodes.get(termId);
    if (!termNode) continue;
    nodes.push(termNode);
    edges.push({
      id: `kb::edge::${termId}::described_in::${spec.id}`,
      sourceId: termId,
      targetId: spec.id,
      relationshipType: 'DESCRIBED_IN',
      weight: Math.min(1, Number((count / 8).toFixed(2))),
      confidence: Math.min(0.9, 0.5 + count * 0.05),
      provenance: spec.provenance,
    });
  }
  return { nodes, edges, passages: spec.passages ?? [] };
}

function passageFor(spec: { id: string; heading?: string; text: string; order?: number; provenance: KBatchProvenance }): KBatchPassage {
  return {
    id: `kb::passage::${spec.id}::${spec.order ?? 0}`,
    nodeId: spec.id,
    heading: spec.heading,
    text: spec.text,
    charCount: spec.text.length,
    order: spec.order ?? 0,
    provenance: spec.provenance,
  };
}

function handbookBundles(index: VocabularyIndex): Bundle[] {
  const bundles: Bundle[] = [];

  for (const term of GLOSSARY) {
    const id = `kb::glossary::${termSlug(term.term)}`;
    const provenance: KBatchProvenance = { source: 'glossary', sourceId: term.term, license: 'proprietary' };
    bundles.push(
      mentionBundle(
        {
          id,
          slug: id.replace(/::/g, '-'),
          name: term.term,
          description: term.longDef || term.shortDef,
          text: `${term.term} ${term.shortDef} ${term.longDef} ${(term.seeAlso ?? []).join(' ')}`,
          nodeType: 'concept',
          domain: glossaryDomain(term.domain),
          aliases: [term.pronunciation ?? '', ...(term.seeAlso ?? [])].filter(Boolean),
          provenance,
          maxTerms: 12,
          passages: [passageFor({ id, heading: term.term, text: term.longDef || term.shortDef, provenance })],
        },
        index
      )
    );
  }

  for (const guru of GURUS) {
    const id = `kb::guru::${guru.slug}`;
    const provenance: KBatchProvenance = { source: 'guru', sourceId: guru.slug, license: 'proprietary' };
    bundles.push(
      mentionBundle(
        {
          id,
          slug: guru.slug,
          name: guru.name,
          description: guru.oneLine,
          text: `${guru.name} ${guru.lineage} ${guru.oneLine} ${guru.story} ${guru.signature} ${guru.oneSutra.text}`,
          nodeType: 'teacher',
          domain: 'spirituality',
          aliases: [guru.lineage, guru.era],
          provenance,
          maxTerms: 20,
          passages: [
            passageFor({ id, heading: 'Story', text: guru.story, order: 0, provenance }),
            passageFor({ id, heading: 'Sutra', text: `${guru.oneSutra.text} — ${guru.oneSutra.source}`, order: 1, provenance }),
          ],
        },
        index
      )
    );
  }

  for (const family of LOOP_FAMILIES) {
    const id = `kb::loopfamily::${family.slug}`;
    const provenance: KBatchProvenance = { source: 'loop_family', sourceId: family.slug, license: 'proprietary' };
    const bundle = mentionBundle(
      {
        id,
        slug: `loopfamily-${family.slug}`,
        name: family.name,
        description: family.feels,
        text: `${family.name} ${family.feels} ${family.neuroscience} ${family.origin} ${family.wayOut} ${family.pairedPath}`,
        nodeType: 'model',
        domain: 'behaviour',
        aliases: [family.slug],
        provenance,
        maxTerms: 25,
        passages: [
          passageFor({ id, heading: 'Feels like', text: family.feels, order: 0, provenance }),
          passageFor({ id, heading: 'Way out', text: family.wayOut, order: 1, provenance }),
        ],
      },
      index
    );
    for (const loopId of family.exampleIds) {
      if (!LOOP_IDS.has(loopId)) continue;
      bundle.edges.push({
        id: `kb::edge::${id}::relates_to::kb::loop::${loopId}`,
        sourceId: id,
        targetId: `kb::loop::${loopId}`,
        relationshipType: 'RELATES_TO',
        weight: 0.9,
        confidence: 0.95,
        provenance,
      });
    }
    bundles.push(bundle);
  }

  for (const path of PATHS) {
    const id = `kb::path::${path.slug}`;
    const provenance: KBatchProvenance = { source: 'path', sourceId: path.slug, license: 'proprietary' };
    const levelsText = path.levels.map((level) => `${level.name} ${level.markers.join(' ')} ${level.practice}`).join(' ');
    const bundle = mentionBundle(
      {
        id,
        slug: `path-${path.slug}`,
        name: path.name,
        description: path.essence,
        text: `${path.name} ${path.essence} ${path.origin} ${path.forWhom} ${path.traps.join(' ')} ${path.oneSutra.text} ${levelsText}`,
        nodeType: 'tradition',
        domain: 'yoga',
        aliases: [path.sanskrit, path.slug],
        provenance,
        maxTerms: 30,
        passages: [
          passageFor({ id, heading: 'Origin', text: path.origin, order: 0, provenance }),
          passageFor({ id, heading: 'For whom', text: path.forWhom, order: 1, provenance }),
        ],
      },
      index
    );
    for (const paired of path.pairsWellWith) {
      bundle.edges.push({
        id: `kb::edge::${id}::similar_to::kb::path::${paired}`,
        sourceId: id,
        targetId: `kb::path::${paired}`,
        relationshipType: 'SIMILAR_TO',
        weight: 0.8,
        confidence: 0.9,
        provenance,
      });
    }
    bundles.push(bundle);
  }

  for (const skill of SKILLS) {
    const id = `kb::skill::${skill.slug}`;
    const provenance: KBatchProvenance = { source: 'skill', sourceId: skill.slug, license: 'proprietary' };
    const levelsText = skill.levels
      .map((level) => `${level.name} ${level.markers.join(' ')} ${level.microPractice}`)
      .join(' ');
    bundles.push(
      mentionBundle(
        {
          id,
          slug: `skill-${skill.slug}`,
          name: skill.name,
          description: skill.essence,
          text: `${skill.name} ${skill.essence} ${skill.dimension} ${skill.pairedPath} ${levelsText}`,
          nodeType: 'skill',
          domain: 'transformation',
          aliases: [skill.slug, skill.dimension],
          provenance,
          maxTerms: 25,
          passages: skill.levels.map((level, i) =>
            passageFor({
              id,
              heading: `Level ${level.level} — ${level.name}`,
              text: `${level.markers.join(' ')} ${level.microPractice}`,
              order: i,
              provenance,
            })
          ),
        },
        index
      )
    );
  }

  return bundles;
}

const CARD_DOMAIN: Record<string, KnowledgeDomain> = {
  observation: 'consciousness',
  neuroscience: 'neuroscience',
  psychology: 'psychology',
  vedanta: 'spirituality',
  modern: 'transformation',
};

function cardBundles(index: VocabularyIndex): Bundle[] {
  return KNOWLEDGE_CARDS.map((card) => {
    const id = `kb::card::${card.id}`;
    const provenance: KBatchProvenance = { source: 'knowledge_card', sourceId: String(card.id), license: 'proprietary' };
    return mentionBundle(
      {
        id,
        slug: `card-${card.id}`,
        name: card.title,
        description: card.content.slice(0, 300),
        text: `${card.title} ${card.content} ${card.source}`,
        nodeType: 'article',
        domain: CARD_DOMAIN[card.category] ?? 'transformation',
        aliases: [card.category, card.source],
        provenance,
        maxTerms: 20,
        passages: [passageFor({ id, heading: card.title, text: card.content, provenance })],
      },
      index
    );
  });
}

function wisdomBundles(index: VocabularyIndex): Bundle[] {
  return WISDOM_DECK.map((card) => {
    const id = `kb::wisdom::${card.id}`;
    const provenance: KBatchProvenance = {
      source: 'wisdom_card',
      sourceId: String(card.id),
      license: 'citation',
    };
    return mentionBundle(
      {
        id,
        slug: `wisdom-${card.id}`,
        name: card.text,
        description: `${card.source} — ${card.tradition}`,
        text: `${card.text} ${card.source} ${card.tradition}`,
        nodeType: 'text',
        domain: 'spirituality',
        aliases: [card.source, card.tradition],
        provenance,
        maxTerms: 10,
      },
      index
    );
  });
}

const PROGRAM_DOMAIN: Record<string, KnowledgeDomain> = {
  decision: 'behaviour',
  willpower: 'behaviour',
  love: 'life',
  knowledge: 'consciousness',
  purpose: 'life',
  nervous: 'body',
  art: 'transformation',
  'self-inquiry': 'consciousness',
  attention: 'consciousness',
  shadow: 'psychology',
};

function programBundles(index: VocabularyIndex): Bundle[] {
  const bundles: Bundle[] = [];
  for (const program of SHOWROOM_PROGRAMS) {
    const id = `kb::program::${program.slug}`;
    const provenance: KBatchProvenance = { source: 'program', sourceId: program.slug, license: 'proprietary' };
    const dayText = program.days
      .map((day) => `${day.title} ${day.oneLine} ${day.reading} ${day.practice.instructions} ${day.reflection}`)
      .join(' ');
    const bundle = mentionBundle(
      {
        id,
        slug: `program-${program.slug}`,
        name: program.title,
        description: program.promise,
        text: `${program.title} ${program.subtitle} ${program.guru} ${program.promise} ${dayText}`,
        nodeType: 'journey',
        domain: PROGRAM_DOMAIN[program.category] ?? 'transformation',
        aliases: [program.guru, program.theme, program.category],
        provenance,
        maxTerms: 35,
        passages: program.days.map((day, i) =>
          passageFor({
            id,
            heading: `Day ${day.day} — ${day.title}`,
            text: `${day.oneLine} ${day.reading}`,
            order: i,
            provenance,
          })
        ),
      },
      index
    );
    for (const day of program.days) {
      const dayId = `kb::programday::${program.slug}::${day.day}`;
      bundle.nodes.push({
        id: dayId,
        slug: dayId.replace(/::/g, '-'),
        name: day.title,
        description: day.oneLine,
        nodeType: 'session',
        domain: PROGRAM_DOMAIN[program.category] ?? 'transformation',
        aliases: [],
        qualityScore: quality(day.reading, 0, 0),
        provenance,
      });
      bundle.edges.push({
        id: `kb::edge::${dayId}::part_of::${id}`,
        sourceId: dayId,
        targetId: id,
        relationshipType: 'PART_OF',
        weight: 1,
        confidence: 1,
        provenance,
      });
      bundle.passages.push(
        passageFor({ id: dayId, heading: day.practice.name, text: day.practice.instructions, order: 0, provenance })
      );
    }
    bundles.push(bundle);
  }
  return bundles;
}

const PHASE_DOMAIN: Record<string, KnowledgeDomain> = {
  awakening: 'consciousness',
  mind: 'mind',
  heart: 'psychology',
  body: 'body',
  patterns: 'behaviour',
  inquiry: 'consciousness',
  energy: 'body',
  integration: 'transformation',
};

function courseBundles(index: VocabularyIndex): Bundle[] {
  return FOUNDATION_CURRICULUM.map((day) => {
    const id = `kb::course::day::${day.day}`;
    const provenance: KBatchProvenance = {
      source: 'foundation_course',
      sourceId: String(day.day),
      license: 'proprietary',
    };
    const text = [
      day.title,
      day.subtitle,
      day.morningTeaching.concept,
      day.morningTeaching.keyPoints.join(' '),
      day.morningTeaching.metaphor ?? '',
      day.morningTeaching.scienceNote ?? '',
      day.dayPractice.instruction,
      day.eveningIntegration.prompt,
      day.eveningIntegration.deeperPrompt,
      day.eveningIntegration.closingWisdom,
      day.relatedConcepts.join(' '),
    ].join(' ');
    return mentionBundle(
      {
        id,
        slug: id.replace(/::/g, '-'),
        name: `Day ${day.day} — ${day.title}`,
        description: day.subtitle,
        text,
        nodeType: 'session',
        domain: PHASE_DOMAIN[day.phase] ?? 'transformation',
        aliases: day.relatedConcepts,
        provenance,
        maxTerms: 20,
        passages: [
          passageFor({ id, heading: 'Teaching', text: `${day.morningTeaching.concept} ${day.morningTeaching.keyPoints.join(' ')}`, order: 0, provenance }),
          passageFor({ id, heading: 'Practice', text: day.dayPractice.instruction, order: 1, provenance }),
          passageFor({ id, heading: 'Evening', text: `${day.eveningIntegration.prompt} ${day.eveningIntegration.closingWisdom}`, order: 2, provenance }),
        ],
      },
      index
    );
  });
}

// ── Sessions ────────────────────────────────────────────────────────────────

const STEP_DOMAIN: Record<string, KnowledgeDomain> = {
  opening_preparation: 'transformation',
  attention_concentration: 'consciousness',
  observation_witnessing: 'consciousness',
  self_inquiry: 'consciousness',
  breath_regulation: 'body',
  body_awareness: 'body',
  emotion_shadow: 'psychology',
  karma_habits: 'behaviour',
  wisdom_knowledge: 'spirituality',
  jap_mantra: 'yoga',
  intention_willpower: 'transformation',
  relationships_life: 'life',
  creativity_visualization: 'transformation',
  silence_open_awareness: 'consciousness',
  reflection_journaling: 'transformation',
  session_closing: 'transformation',
};

function sessionBundles(index: VocabularyIndex): Bundle[] {
  const bundles: Bundle[] = [];

  for (const step of SESSION_STEP_CATALOG) {
    const id = `kb::sessionstep::${step.key}`;
    const provenance: KBatchProvenance = {
      source: 'session_step',
      sourceId: String(step.id),
      license: 'proprietary',
    };
    bundles.push(
      mentionBundle(
        {
          id,
          slug: `step-${step.key.replace(/_/g, '-')}`,
          name: step.title,
          description: step.description,
          text: `${step.title} ${step.categoryLabel} ${step.description}`,
          nodeType: 'technique',
          domain: STEP_DOMAIN[step.category] ?? 'transformation',
          aliases: [step.key.replace(/_/g, ' '), step.categoryLabel],
          provenance,
          maxTerms: 10,
          passages: [passageFor({ id, heading: step.categoryLabel, text: step.description, provenance })],
        },
        index
      )
    );
  }

  for (const session of DEMO_SESSIONS) {
    const id = `kb::demo::${session.id}`;
    const provenance: KBatchProvenance = { source: 'demo_session', sourceId: session.id, license: 'proprietary' };
    bundles.push(
      mentionBundle(
        {
          id,
          slug: session.id,
          name: session.title,
          description: session.description,
          text: `${session.title} ${session.subtitle} ${session.description} ${session.category} ${session.tags.join(' ')}`,
          nodeType: 'session',
          domain: 'transformation',
          aliases: [session.category, ...session.tags],
          provenance,
          maxTerms: 15,
          passages: [passageFor({ id, heading: session.subtitle, text: session.description, provenance })],
        },
        index
      )
    );
  }

  for (const seed of OBS_SEEDS) {
    const id = `kb::obs::${seed.id}`;
    const provenance: KBatchProvenance = { source: 'observation_seed', sourceId: seed.id, license: 'proprietary' };
    const explorationText = seed.exploration.map((beat) => `${beat.title}: ${beat.body}`).join(' ');
    bundles.push(
      mentionBundle(
        {
          id,
          slug: seed.id,
          name: `Observation · Level ${seed.level} · ${seed.lens}`,
          description: seed.exploration[0]?.title ?? seed.integration,
          text: `${seed.lens} ${seed.method} ${explorationText} ${seed.integration} ${seed.journalPrompt} ${seed.carryTask}`,
          nodeType: 'session',
          domain: 'consciousness',
          aliases: [seed.lens, seed.method],
          provenance,
          maxTerms: 20,
          passages: seed.exploration.map((beat, i) =>
            passageFor({ id, heading: beat.title, text: beat.body, order: i, provenance })
          ),
        },
        index
      )
    );
  }

  return bundles;
}

// ── Markdown corpus ─────────────────────────────────────────────────────────

interface MarkdownSource {
  file: string;
  domain: KnowledgeDomain;
  slug: string;
  title: string;
}

const MARKDOWN_SOURCES: MarkdownSource[] = [
  { file: 'temple.md', slug: 'temple', domain: 'spirituality', title: 'The Temple' },
  { file: 'THE_FIRST_ELEVEN_v2.md', slug: 'first-eleven', domain: 'consciousness', title: 'The First Eleven' },
  { file: 'THE_LIVING_SITTING_v4.md', slug: 'living-sitting', domain: 'transformation', title: 'The Living Sitting' },
  {
    file: 'THE_CINEMATIC_WORLD_ENGINE_v3.md',
    slug: 'cinematic-world-engine',
    domain: 'transformation',
    title: 'The Cinematic World Engine',
  },
  { file: 'PLATFORM_OVERVIEW.md', slug: 'platform-overview', domain: 'transformation', title: 'Platform Overview' },
  { file: 'APP_DESCRIPTION.md', slug: 'app-description', domain: 'transformation', title: 'App Description' },
  { file: 'ABOUT_THIS_APP.md', slug: 'about-this-app', domain: 'transformation', title: 'About This App' },
  { file: 'ig-content.md', slug: 'ig-content', domain: 'transformation', title: 'Channel Content' },
  { file: 'content.md', slug: 'channel-bible', domain: 'transformation', title: 'Channel Bible' },
  {
    file: 'PROMPT_10K_LIBRARY.md',
    slug: 'content-library-brief',
    domain: 'transformation',
    title: 'Content Library Brief',
  },
];

function markdownBundles(index: VocabularyIndex): Bundle[] {
  const bundles: Bundle[] = [];

  for (const source of MARKDOWN_SOURCES) {
    const filePath = path.resolve(ROOT, source.file);
    if (!fs.existsSync(filePath)) {
      console.log(`docs: ${source.file} not found — skipped`);
      continue;
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    const docId = `kb::doc::md::${source.slug}`;
    const provenance: KBatchProvenance = {
      source: 'markdown',
      sourceId: source.file,
      license: 'proprietary',
    };
    const plain = stripMarkdown(raw);
    const hits = matchTerms(`${source.title} ${plain}`, index);
    const nodes: KBatchNode[] = [
      {
        id: docId,
        slug: source.slug,
        name: source.title,
        description: plain.slice(0, 250),
        nodeType: 'article',
        domain: source.domain,
        aliases: [source.file],
        qualityScore: quality(plain, hits.size, 0),
        provenance,
      },
    ];
    const edges: KBatchEdge[] = [];
    const passages: KBatchPassage[] = [];

    for (const [termId, count] of topTerms(hits, 60, 2)) {
      const termNode = index.nodes.get(termId);
      if (!termNode) continue;
      nodes.push(termNode);
      edges.push({
        id: `kb::edge::${termId}::described_in::${docId}`,
        sourceId: termId,
        targetId: docId,
        relationshipType: 'DESCRIBED_IN',
        weight: Math.min(1, Number((count / 12).toFixed(2))),
        confidence: Math.min(0.9, 0.5 + count * 0.04),
        provenance,
      });
    }

    const sections = raw.split(/\n(?=#{1,3}\s)/);
    let sectionIndex = 0;
    for (const section of sections) {
      const lines = section.trim().split('\n');
      const heading = (lines[0] ?? '').replace(/^#{1,6}\s*/, '').trim();
      const body = stripMarkdown(lines.slice(1).join('\n'));
      if (body.length < 120) continue;
      const sectionId = `kb::section::md::${source.slug}::${sectionIndex}`;
      sectionIndex += 1;
      nodes.push({
        id: sectionId,
        slug: sectionId.replace(/::/g, '-'),
        name: heading || `${source.title} — section ${sectionIndex}`,
        description: body.slice(0, 300),
        nodeType: 'text',
        domain: source.domain,
        aliases: [],
        qualityScore: quality(body, matchTerms(body, index).size, 0),
        provenance,
      });
      edges.push({
        id: `kb::edge::${sectionId}::part_of::${docId}`,
        sourceId: sectionId,
        targetId: docId,
        relationshipType: 'PART_OF',
        weight: 1,
        confidence: 1,
        provenance,
      });
      chunkParagraphs(body).forEach((chunk, chunkIndex) => {
        passages.push({
          id: `kb::passage::${sectionId}::${chunkIndex}`,
          nodeId: sectionId,
          heading,
          text: chunk,
          charCount: chunk.length,
          order: sectionIndex * 100 + chunkIndex,
          provenance,
        });
      });
    }

    bundles.push({ nodes, edges, passages });
  }

  return bundles;
}

// ── Deep concepts ───────────────────────────────────────────────────────────

function resolveTarget(target: string): string {
  return target.startsWith('deep:') ? `kb::${target.replace(/^deep:/, 'deep::')}` : target;
}

function deepBundles(): Bundle[] {
  const validation = validateDeepConcepts(DEEP_CONCEPTS);
  if (!validation.ok) {
    throw new Error(`deep concepts failed the gate:\n${validation.errors.join('\n')}`);
  }

  return DEEP_CONCEPTS.map((concept) => {
    const slug = concept.id.replace(/^deep:/, '');
    const id = `kb::deep::${slug}`;
    const provenance: KBatchProvenance = { source: 'deep_concept', sourceId: concept.id, license: 'proprietary' };
    const mechanismText = concept.mechanism.map((step, i) => `${i + 1}. ${step}`).join(' ');
    const text = [
      concept.name,
      concept.definition,
      mechanismText,
      concept.whyItHappens,
      concept.signs.join(' '),
      concept.counterExample,
      concept.practice.instructions,
      concept.measure,
    ].join(' ');

    const nodes: KBatchNode[] = [
      {
        id,
        slug: `deep-${slug}`,
        name: concept.name,
        description: concept.definition,
        nodeType: DEEP_CONCEPT_FAMILY_NODE_TYPE[concept.family],
        domain: concept.domain,
        aliases: concept.aliases,
        qualityScore: concept.reviewStatus === 'verified' ? 0.95 : 0.85,
        provenance,
      },
    ];
    const edges: KBatchEdge[] = [];
    const passages: KBatchPassage[] = [];
    const addPassage = (heading: string, body: string, order: number) => {
      if (!body.trim()) return;
      passages.push({
        id: `kb::passage::${id}::${order}`,
        nodeId: id,
        heading,
        text: body,
        charCount: body.length,
        order,
        provenance,
      });
    };
    addPassage('Definition', concept.definition, 0);
    addPassage('Mechanism', mechanismText, 1);
    addPassage('Why it happens', concept.whyItHappens, 2);
    addPassage('Signs', concept.signs.map((s) => `• ${s}`).join('\n'), 3);
    addPassage('What it is not', concept.counterExample, 4);
    addPassage(`Practice: ${concept.practice.name} (${concept.practice.dose})`, concept.practice.instructions, 5);
    addPassage('How to measure', concept.measure, 6);
    if (concept.caution) addPassage('Caution', concept.caution, 7);

    for (const relation of concept.relations) {
      edges.push({
        id: `kb::edge::${id}::${relation.type.toLowerCase()}::${resolveTarget(relation.target)}`,
        sourceId: id,
        targetId: resolveTarget(relation.target),
        relationshipType: relation.type,
        weight: 0.85,
        confidence: concept.confidence,
        provenance,
      });
    }

    concept.citations.forEach((citation, index) => {
      const sourceId = `kb::citation::${termSlug(citation.label)}`;
      nodes.push({
        id: sourceId,
        slug: sourceId.replace(/::/g, '-'),
        name: citation.label,
        description: citation.note ?? `Citation for ${concept.name}.`,
        nodeType: citation.kind === 'research' ? 'research' : citation.kind === 'tradition' ? 'text' : 'source',
        domain: concept.domain,
        aliases: [],
        qualityScore: 0.8,
        provenance: {
          source: 'citation',
          sourceId: `${concept.id}#${index}`,
          url: citation.url,
          license: citation.kind === 'tradition' ? 'public-domain' : 'citation',
        },
      });
      edges.push({
        id: `kb::edge::${id}::derived_from::${sourceId}`,
        sourceId: id,
        targetId: sourceId,
        relationshipType: 'DERIVED_FROM',
        weight: 0.7,
        confidence: concept.confidence,
        provenance,
      });
    });

    return { nodes, edges, passages };
  });
}

// ── Packing ─────────────────────────────────────────────────────────────────

function packBundles(bundles: Bundle[], batchSize: number): KBatch[] {
  const batches: KBatch[] = [];
  let current: { nodes: Map<string, KBatchNode>; edges: KBatchEdge[]; passages: KBatchPassage[] } | null = null;

  const flush = () => {
    if (!current || current.nodes.size === 0) return;
    const nodes = Array.from(current.nodes.values()).sort((a, b) => a.id.localeCompare(b.id));
    const edges = dedupeEdges(current.edges);
    const passages = current.passages;
    const payload = {
      version: BATCH_VERSION,
      nodes,
      edges,
      passages,
    };
    const hash = crypto.createHash('sha1').update(JSON.stringify(payload)).digest('hex');
    batches.push({
      id: `batch-${String(batches.length + 1).padStart(4, '0')}`,
      createdAt: new Date().toISOString(),
      hash,
      ...payload,
    });
    current = null;
  };

  for (const bundle of bundles) {
    if (!current) current = { nodes: new Map(), edges: [], passages: [] };
    if (current.nodes.size >= batchSize) flush();
    if (!current) current = { nodes: new Map(), edges: [], passages: [] };
    for (const node of bundle.nodes) {
      // Term nodes repeat across batches on purpose: every batch stays
      // self-contained, and the loader dedupes by id when merging.
      if (!current.nodes.has(node.id)) current.nodes.set(node.id, node);
    }
    current.edges.push(...bundle.edges);
    current.passages.push(...bundle.passages);
  }
  flush();
  return batches;
}

function dedupeEdges(edges: KBatchEdge[]): KBatchEdge[] {
  const seen = new Set<string>();
  const out: KBatchEdge[] = [];
  for (const edge of edges) {
    const key = `${edge.relationshipType}:${edge.sourceId}:${edge.targetId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(edge);
  }
  return out;
}

// ── Run ─────────────────────────────────────────────────────────────────────

function main() {
  console.log(`kg:build — source=${SOURCE_FILTER.join(',')} batchSize=${BATCH_SIZE}`);
  const vocabulary = buildVocabulary();
  const index = indexVocabulary(vocabulary.entries, vocabulary.nodes);
  console.log(`vocabulary: ${index.nodes.size} terms, ${vocabulary.entries.length} aliases`);

  const bundles: Bundle[] = [];
  if (enabled('essays')) bundles.push(...essayBundles(index));
  if (enabled('loops')) bundles.push(...loopBundles(index));
  if (enabled('practices')) bundles.push(...practiceBundles(index));
  if (enabled('blogs')) bundles.push(...blogBundles(index));
  if (enabled('handbook')) bundles.push(...handbookBundles(index));
  if (enabled('cards')) bundles.push(...cardBundles(index));
  if (enabled('wisdom')) bundles.push(...wisdomBundles(index));
  if (enabled('programs')) bundles.push(...programBundles(index));
  if (enabled('curriculum')) bundles.push(...courseBundles(index));
  if (enabled('sessions')) bundles.push(...sessionBundles(index));
  if (enabled('deep')) bundles.push(...deepBundles());
  if (enabled('docs')) bundles.push(...markdownBundles(index));
  if (enabled('breakthroughs')) bundles.push(...breakthroughBundles(index));

  const batches = packBundles(bundles, BATCH_SIZE);
  const entries: KBatchManifestEntry[] = [];
  let totalNodes = 0;
  let totalEdges = 0;
  let totalPassages = 0;

  if (!DRY) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    // Regeneration is idempotent: drop stale batch files so the manifest and
    // the directory can never disagree.
    for (const name of fs.readdirSync(OUT_DIR)) {
      if (/^batch-\d+\.json$/.test(name) || name === 'manifest.json') {
        fs.rmSync(path.join(OUT_DIR, name));
      }
    }
  }

  for (const batch of batches) {
    const file = `${batch.id}.json`;
    const json = JSON.stringify(batch);
    const bytes = Buffer.byteLength(json, 'utf8');
    const domainCounts: Partial<Record<KnowledgeDomain, number>> = {};
    for (const node of batch.nodes) {
      domainCounts[node.domain] = (domainCounts[node.domain] ?? 0) + 1;
    }
    entries.push({
      id: batch.id,
      file,
      source: 'curated',
      nodeCount: batch.nodes.length,
      edgeCount: batch.edges.length,
      passageCount: batch.passages.length,
      domainCounts,
      bytes,
      hash: batch.hash,
    });
    totalNodes += batch.nodes.length;
    totalEdges += batch.edges.length;
    totalPassages += batch.passages.length;
    if (!DRY) fs.writeFileSync(path.join(OUT_DIR, file), json);
  }

  const manifest: KBatchManifest = {
    version: BATCH_VERSION,
    generatedAt: new Date().toISOString(),
    targetNodesPerBatch: BATCH_SIZE,
    totals: {
      batches: batches.length,
      nodes: totalNodes,
      edges: totalEdges,
      passages: totalPassages,
    },
    batches: entries,
  };
  if (!DRY) {
    fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  }

  console.log(
    `wrote ${batches.length} batch(es): ${totalNodes} nodes, ${totalEdges} edges, ${totalPassages} passages${
      DRY ? ' (dry run)' : ` → ${path.relative(ROOT, OUT_DIR)}`
    }`
  );
}

main();
