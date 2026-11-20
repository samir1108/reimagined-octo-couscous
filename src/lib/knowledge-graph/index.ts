// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE GRAPH — Blog/Content Engine
// Builds and navigates the content knowledge graph from blogs, essays, loops, etc.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  KnowledgeNode,
  KnowledgeEdge,
  KnowledgeGraph,
  NodeType,
  EdgeType,
  GraphQuery,
  SearchResult,
  RelatedContent,
  ContentCluster,
  TraversalOptions,
} from './types';
import { loadBlogPosts } from '@/data/blogPosts';
import { KNOWLEDGE_ESSAYS, KNOWLEDGE_CATEGORIES } from '@/data/knowledgeEssays';
import { LOOPS } from '@/data/loops';
import { LOOP_FAMILIES } from '@/data/handbook/loopFamilies';
import { LOOP_ESSAYS } from '@/data/loopsAtlas';
import { breakthroughsAsBlogPosts } from '@/data/breakthroughBlogPosts';
import { BREAKTHROUGH_TYPES } from '@/data/breakthroughs';
import { ALL_PRACTICES } from '@/types/practices';
import { BAND_ARCHETYPES } from '@/types/consciousness';
import { PATHS } from '@/data/handbook/paths';
import { SAPTARISHI } from '@/data/lineageTree';
import { DIMENSIONS as CONSCIOUSNESS_DIMS } from '@/types/consciousness';
import { WISDOM_DECK } from '@/data/wisdomDeck';
import { SHOWROOM_PROGRAMS } from '@/data/showroomPrograms';
import { FOUNDATION_CURRICULUM, COURSE_PHASES } from '@/data/foundation-course';
import { SKILLS } from '@/data/handbook/skills';
import { CHAKRA_URIS, DIMENSION_URIS, PRACTICE_URIS, PATH_URIS, BAND_URIS, TASK_DOMAIN_URIS } from '@/data/graph/concepts';

let cachedGraph: KnowledgeGraph | null = null;
let edgeCounter = 0;

function nextEdgeId(): string {
  return `edge::${++edgeCounter}`;
}

function ensureEdge(
  edges: KnowledgeEdge[],
  type: EdgeType,
  from: string,
  to: string,
  weight: number,
  metadata?: Record<string, unknown>
): void {
  if (from === to) return;
  const exists = edges.some((e) => e.type === type && e.from === from && e.to === to);
  if (!exists) {
    edges.push({ id: nextEdgeId(), type, from, to, weight, metadata });
  }
}

function getNode(nodes: Map<string, KnowledgeNode>, id: string): KnowledgeNode | undefined {
  return nodes.get(id);
}

function addNode(
  nodes: Map<string, KnowledgeNode>,
  id: string,
  type: NodeType,
  label: string,
  uri: string,
  data: Record<string, unknown>,
  aliases: string[] = [],
  weight?: number
): void {
  if (!nodes.has(id)) {
    nodes.set(id, { id, type, label, uri, data, aliases, weight });
  }
}

// ─── Main Build Function ────────────────────────────────────────────────────

export async function buildContentGraph(): Promise<KnowledgeGraph> {
  if (cachedGraph) return cachedGraph;

  const nodes = new Map<string, KnowledgeNode>();
  const edges: KnowledgeEdge[] = [];

  // Load all blog posts
  const blogPosts = await loadBlogPosts();

  // ─── 1. Blog Posts & Knowledge Essays ────────────────────────────────────
  for (const post of blogPosts) {
    const nodeType: NodeType = post.isKnowledgeEssay ? 'knowledge-essay' : 'blog-post';
    const nodeId = `post::${post.slug}`;

    addNode(nodes, nodeId, nodeType, post.title, `post::${post.slug}`, {
      slug: post.slug,
      pillar: post.pillar,
      keyword: post.keyword,
      metaDescription: post.metaDescription,
      publishedAt: post.publishedAt,
      subtitle: post.subtitle,
      citations: post.citations,
      practiceLinks: post.practiceLinks,
      isKnowledgeEssay: post.isKnowledgeEssay,
      content: post.content,
    }, [post.title, post.keyword, post.pillar]);

    // Pillar edges
    const pillarId = `pillar::${post.pillar.toLowerCase().replace(/\s+/g, '-')}`;
    addNode(nodes, pillarId, 'pillar', post.pillar, `pillar::${post.pillar}`, {
      label: post.pillar,
    }, [post.pillar]);
    ensureEdge(edges, 'BELONGS_TO_PILLAR', nodeId, pillarId, 1.0);

    // Category edges (from knowledge essays categories)
    if (post.isKnowledgeEssay) {
      const essay = KNOWLEDGE_ESSAYS.find((e) => e.slug === post.slug);
      if (essay) {
        const catId = `category::${essay.category}`;
        addNode(nodes, catId, 'category', essay.categoryLabel, `category::${essay.category}`, {
          slug: essay.category,
          label: essay.categoryLabel,
          description: KNOWLEDGE_CATEGORIES.find((c) => c.slug === essay.category)?.description,
        }, [essay.categoryLabel, essay.category]);
        ensureEdge(edges, 'BELONGS_TO_CATEGORY', nodeId, catId, 1.0);
      }
    }
  }

  // ─── 2. Knowledge Categories ──────────────────────────────────────────────
  for (const cat of KNOWLEDGE_CATEGORIES) {
    const catId = `category::${cat.slug}`;
    addNode(nodes, catId, 'category', cat.label, `category::${cat.slug}`, {
      slug: cat.slug,
      label: cat.label,
      tagline: cat.tagline,
      description: cat.description,
      plannedCount: cat.plannedCount,
      order: cat.order,
    }, [cat.label, cat.slug]);
  }

  // ─── 3. Loops ─────────────────────────────────────────────────────────────
  for (const loop of LOOPS) {
    const loopId = `loop::${loop.id}`;
    addNode(nodes, loopId, 'loop', loop.name, `loop::${loop.id}`, {
      ...loop,
    }, [loop.name, ...loop.keywords, ...loop.triggers, loop.category]);

    // Loop family
    const family = LOOP_FAMILIES.find((f) => f.exampleIds.includes(loop.id));
    if (family) {
      const familyId = `loop-family::${family.slug}`;
      addNode(nodes, familyId, 'loop-family', family.name, `loop-family::${family.slug}`, {
        ...family,
      }, [family.name, family.slug]);
      ensureEdge(edges, 'BELONGS_TO_CATEGORY', loopId, familyId, 0.9);
    }
  }

  // ─── 4. Loop Essays ───────────────────────────────────────────────────────
  for (const essay of LOOP_ESSAYS) {
    const essayId = `loop-essay::${essay.slug}`;
    addNode(nodes, essayId, 'loop-essay', essay.name, `loop-essay::${essay.slug}`, {
      ...essay,
    }, [essay.name, essay.ancientName, essay.slug]);

    if (essay.loopId) {
      const loopId = `loop::${essay.loopId}`;
      ensureEdge(edges, 'RELATED_TO', essayId, loopId, 1.0);
    }
  }

  // ─── 5. Breakthrough Essays ───────────────────────────────────────────────
  const breakthroughPosts = breakthroughsAsBlogPosts();
  for (const post of breakthroughPosts) {
    const nodeId = `breakthrough-essay::${post.slug}`;
    addNode(nodes, nodeId, 'breakthrough-essay', post.title, `breakthrough-essay::${post.slug}`, {
      ...post,
    }, [post.title, post.keyword, post.pillar]);

    // Link to breakthrough type
    const bt = BREAKTHROUGH_TYPES.find((b) => b.id === post.slug?.replace('breakthrough-', ''));
    if (bt) {
      const btId = `breakthrough::${bt.id}`;
      addNode(nodes, btId, 'breakthrough', bt.name, `breakthrough::${bt.id}`, {
        ...bt,
      }, [bt.name, bt.category, bt.rarity, ...bt.keywords]);
      ensureEdge(edges, 'RELATED_TO', nodeId, btId, 0.8);
    }
  }

  // ─── 6. Practices ─────────────────────────────────────────────────────────
  for (const practice of ALL_PRACTICES) {
    const practiceId = `practice::${practice.id}`;
    addNode(nodes, practiceId, 'practice', practice.label, PRACTICE_URIS[practice.id] || `practice::${practice.id}`, {
      ...practice,
    }, [practice.label, practice.id, ...practice.keywords]);
  }

  // ─── 7. Bands ─────────────────────────────────────────────────────────────
  for (const band of BAND_ARCHETYPES) {
    const bandId = `band::${band.band}`;
    addNode(nodes, bandId, 'band', band.name, BAND_URIS[band.band] || `band::${band.band}`, {
      ...band,
    }, [band.name, band.title, band.band.toString()]);
  }

  // ─── 8. Paths ─────────────────────────────────────────────────────────────
  for (const path of PATHS) {
    const pathId = `path::${path.slug}`;
    addNode(nodes, pathId, 'path', path.name, PATH_URIS[path.slug] || `path::${path.slug}`, {
      ...path,
    }, [path.name, path.slug]);
  }

  // ─── 9. Gurus / Lineage ───────────────────────────────────────────────────
  for (const branch of SAPTARISHI) {
    const lineageId = `lineage::${branch.rishi.toLowerCase()}`;
    addNode(nodes, lineageId, 'guru', `${branch.rishi} — ${branch.stream}`, `lineage::${branch.rishi.toLowerCase()}`, {
      ...branch,
    }, [branch.rishi, branch.stream, branch.oneLine]);

    for (const master of branch.masters) {
      const guruId = `guru::${master.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      addNode(nodes, guruId, 'guru', master.name, `guru::${master.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, {
        ...master,
        lineage: branch.rishi,
        stream: branch.stream,
      }, [master.name, master.era, branch.rishi]);
      ensureEdge(edges, 'AUTHORED_BY', guruId, lineageId, 0.9);
    }
  }

  // ─── 10. Dimensions ───────────────────────────────────────────────────────
  for (const dim of CONSCIOUSNESS_DIMS) {
    const dimId = `dimension::consciousness::${dim.id}`;
    addNode(nodes, dimId, 'dimension', dim.label, DIMENSION_URIS[dim.id] || `dimension::consciousness::${dim.id}`, {
      ...dim,
    }, [dim.label, dim.id]);
  }

  // ─── 11. Chakras ──────────────────────────────────────────────────────────
  const chakras = [
    { id: 'muladhara', name: 'Muladhara', sanskrit: 'Root', color: 'Red', location: 'Base of spine', element: 'Earth', mantra: 'LAM' },
    { id: 'svadhisthana', name: 'Svadhisthana', sanskrit: 'Sacral', color: 'Orange', location: 'Below navel', element: 'Water', mantra: 'VAM' },
    { id: 'manipura', name: 'Manipura', sanskrit: 'Solar Plexus', color: 'Yellow', location: 'Upper abdomen', element: 'Fire', mantra: 'RAM' },
    { id: 'anahata', name: 'Anahata', sanskrit: 'Heart', color: 'Green', location: 'Center of chest', element: 'Air', mantra: 'YAM' },
    { id: 'vishuddha', name: 'Vishuddha', sanskrit: 'Throat', color: 'Blue', location: 'Throat', element: 'Ether', mantra: 'HAM' },
    { id: 'ajna', name: 'Ajna', sanskrit: 'Third Eye', color: 'Indigo', location: 'Between eyebrows', element: 'Mind', mantra: 'OM' },
    { id: 'sahasrara', name: 'Sahasrara', sanskrit: 'Crown', color: 'Violet', location: 'Top of head', element: 'Consciousness', mantra: 'Silence' },
  ];
  for (const chakra of chakras) {
    const chakraId = `chakra::${chakra.id}`;
    addNode(nodes, chakraId, 'chakra', chakra.name, CHAKRA_URIS[chakra.id] || `chakra::${chakra.id}`, {
      ...chakra,
    }, [chakra.name, chakra.sanskrit, chakra.id]);
  }

  // ─── 12. Wisdom Cards ─────────────────────────────────────────────────────
  for (const card of WISDOM_DECK) {
    const cardId = `wisdom-card::${card.id}`;
    addNode(nodes, cardId, 'wisdom-card', `${card.source}: ${card.text.slice(0, 50)}...`, `wisdom-card::${card.id}`, {
      ...card,
    }, [card.source, card.tradition, card.text.slice(0, 30)]);
  }

  // ─── 13. Programs ─────────────────────────────────────────────────────────
  for (const program of SHOWROOM_PROGRAMS) {
    const programId = `program::${program.slug}`;
    addNode(nodes, programId, 'program', program.title, `program::${program.slug}`, {
      ...program,
    }, [program.title, program.guru, program.theme]);
  }

  // ─── 14. Course Days & Phases ─────────────────────────────────────────────
  for (const day of FOUNDATION_CURRICULUM) {
    const dayId = `course-day::${day.day}`;
    addNode(nodes, dayId, 'course-day', `Day ${day.day}: ${day.title}`, `course-day::${day.day}`, {
      ...day,
    }, [day.title, `day ${day.day}`]);
  }
  for (const phase of COURSE_PHASES) {
    const phaseId = `course-phase::${phase.id}`;
    addNode(nodes, phaseId, 'course-phase', phase.name, `course-phase::${phase.id}`, {
      ...phase,
    }, [phase.name, phase.id]);
  }

  // ─── 15. Skills ───────────────────────────────────────────────────────────
  for (const skill of SKILLS) {
    const skillId = `skill::${skill.slug}`;
    addNode(nodes, skillId, 'skill', skill.name, `skill::${skill.slug}`, {
      ...skill,
    }, [skill.name, skill.slug]);
  }

  // ─── BUILD EDGES ──────────────────────────────────────────────────────────

  // Blog post → concepts (extract from content/keywords)
  const conceptKeywords: Record<string, string> = {
    'witness': 'practice::witnessing',
    'self-inquiry': 'practice::self-inquiry',
    'breath': 'practice::breath',
    'observation': 'practice::observation',
    'body': 'practice::body',
    'karma': 'path::karma',
    'bhakti': 'path::bhakti',
    'jnana': 'path::jnana',
    'raja': 'path::raja',
    'kriya': 'practice::kriya',
    'tantra': 'practice::tantra',
    'band 0': 'band::0',
    'band 1': 'band::1',
    'band 2': 'band::2',
    'band 3': 'band::3',
    'band 4': 'band::4',
    'band 5': 'band::5',
    'band 6': 'band::6',
    'band 7': 'band::7',
    'band 8': 'band::8',
    'band 9': 'band::9',
    'band 10': 'band::10',
    'chakra': 'concept::chakra',
    'muladhara': 'chakra::muladhara',
    'svadhisthana': 'chakra::svadhisthana',
    'manipura': 'chakra::manipura',
    'anahata': 'chakra::anahata',
    'vishuddha': 'chakra::vishuddha',
    'ajna': 'chakra::ajna',
    'sahasrara': 'chakra::sahasrara',
    'dimension': 'concept::dimension',
    'thought': 'dimension::consciousness::thought',
    'emotion': 'dimension::consciousness::emotion',
    'body-dimension': 'dimension::consciousness::body',
    'awareness': 'dimension::consciousness::awareness',
    'loop': 'concept::loop',
    'guru': 'concept::guru',
    'ramana': 'guru::ramana-maharshi',
    'krishnamurti': 'guru::j-krishnamurti',
    'sadhguru': 'guru::sadhguru',
    'vivekananda': 'guru::swami-vivekananda',
    'yogananda': 'guru::paramahansa-yogananda',
    'buddha': 'guru::buddha',
    'patanjali': 'guru::patanjali',
    'osho': 'guru::osho',
    'rumi': 'guru::rumi',
    'dogen': 'guru::dogen',
  };

  for (const post of blogPosts) {
    const postId = `post::${post.slug}`;
    const postNode = getNode(nodes, postId);
    if (!postNode) continue;

    // Extract concepts from title, keyword, pillar, content
    const searchText = `${post.title} ${post.keyword} ${post.pillar} ${post.content}`.toLowerCase();

    for (const [keyword, targetId] of Object.entries(conceptKeywords)) {
      if (searchText.includes(keyword)) {
        const targetNode = getNode(nodes, targetId);
        if (targetNode) {
          const edgeType = targetId.startsWith('practice::') ? 'REFERENCES_PRACTICE' :
                           targetId.startsWith('loop::') ? 'REFERENCES_LOOP' :
                           targetId.startsWith('band::') ? 'REFERENCES_BAND' :
                           targetId.startsWith('path::') ? 'REFERENCES_PATH' :
                           targetId.startsWith('guru::') ? 'REFERENCES_GURU' :
                           targetId.startsWith('dimension::') ? 'REFERENCES_DIMENSION' :
                           targetId.startsWith('chakra::') ? 'REFERENCES_CHAKRA' :
                           'MENTIONS_CONCEPT';
          ensureEdge(edges, edgeType, postId, targetId, 0.6, { keyword });
        }
      }
    }

    // Related posts (same pillar)
    for (const otherPost of blogPosts) {
      if (otherPost.slug !== post.slug && otherPost.pillar === post.pillar) {
        const otherId = `post::${otherPost.slug}`;
        ensureEdge(edges, 'SHARED_KEYWORD', postId, otherId, 0.5, { pillar: post.pillar });
      }
    }

    // Citations → concepts
    if (post.citations) {
      for (const citation of post.citations) {
        const citationId = `citation::${citation.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        addNode(nodes, citationId, 'concept', citation.label, `citation::${citation.label}`, {
          label: citation.label,
          url: citation.url,
          note: citation.note,
        }, [citation.label]);
        ensureEdge(edges, 'CITES', postId, citationId, 0.7);
      }
    }
  }

  // Loop → Practice (dissolution path)
  const dissolutionPracticeKeywords: Record<string, string[]> = {
    'karma': ['karma', 'service', 'selfless', 'anonymous', 'help someone'],
    'bhakti': ['bhakti', 'devotion', 'gratitude', 'grateful', 'surrender', 'love'],
    'observation': ['observation', 'observe', 'notice', 'witness', 'watch'],
    'breath': ['breath', 'breathing', 'pranayama', 'box breath'],
    'body': ['body', 'somatic', 'walk', 'movement'],
    'jnana': ['jnana', 'inquiry', 'question', 'who am i', 'discrimination'],
    'raja': ['raja', 'discipline', 'structure', 'routine', 'meditation'],
    'kriya': ['kriya', 'cleansing', 'purification'],
    'tantra': ['tantra', 'energy', 'presence', 'embodied'],
  };

  for (const loop of LOOPS) {
    const loopNode = getNode(nodes, `loop::${loop.id}`);
    if (!loopNode) continue;
    const text = `${loop.dissolution_path} ${loop.name} ${loop.category}`.toLowerCase();

    for (const [practiceId, keywords] of Object.entries(dissolutionPracticeKeywords)) {
      if (keywords.some((kw) => text.includes(kw))) {
        const practiceNode = getNode(nodes, `practice::${practiceId}`);
        if (practiceNode) {
          ensureEdge(edges, 'REFERENCES_PRACTICE', loopNode.id, practiceNode.id, 0.6, {
            source: 'dissolution-path',
          });
        }
      }
    }
  }

  // Band → Loop (common loops)
  for (const loop of LOOPS) {
    const loopNode = getNode(nodes, `loop::${loop.id}`);
    if (!loopNode) continue;
    // Use the same affinity logic as the consciousness graph
    const bands = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((b) => {
      // Simplified: all loops relate to multiple bands
      return true;
    });
    for (const band of bands) {
      const bandNode = getNode(nodes, `band::${band}`);
      if (bandNode) {
        ensureEdge(edges, 'REFERENCES_LOOP', bandNode.id, loopNode.id, 0.4, {
          source: 'category-affinity',
        });
      }
    }
  }

  // Path → Practice pairs
  for (const path of PATHS) {
    const pathNode = getNode(nodes, `path::${path.slug}`);
    if (!pathNode) continue;
    for (const pairedSlug of path.pairsWellWith) {
      const pairedNode = getNode(nodes, `path::${pairedSlug}`);
      if (pairedNode) {
        ensureEdge(edges, 'RELATED_TO', pathNode.id, pairedNode.id, 0.8);
      }
    }
  }

  // Skill → Dimension
  for (const skill of SKILLS) {
    const skillNode = getNode(nodes, `skill::${skill.slug}`);
    const dimNode = getNode(nodes, `dimension::consciousness::${skill.dimension.toLowerCase()}`);
    if (skillNode && dimNode) {
      ensureEdge(edges, 'DEVELOPS_SKILL', dimNode.id, skillNode.id, 0.8);
    }
  }

  // Course phase → Day
  for (const phase of COURSE_PHASES) {
    const phaseNode = getNode(nodes, `course-phase::${phase.id}`);
    if (!phaseNode) continue;
    const [startDay, endDay] = phase.days;
    for (let d = startDay; d <= endDay; d++) {
      const dayNode = getNode(nodes, `course-day::${d}`);
      if (dayNode) {
        ensureEdge(edges, 'PART_OF_COURSE', phaseNode.id, dayNode.id, 1.0);
      }
    }
  }

  // Program → Days
  for (const program of SHOWROOM_PROGRAMS) {
    const programNode = getNode(nodes, `program::${program.slug}`);
    if (!programNode) continue;
    for (const day of program.days) {
      const dayNode = getNode(nodes, `course-day::${day.day}`);
      if (dayNode) {
        ensureEdge(edges, 'APPLIES_TO_PROGRAM', dayNode.id, programNode.id, 0.9);
      }
    }
  }

  // Wisdom cards → concepts
  const wisdomThemeMap: Record<number, string[]> = {
    1: ['witness', 'self-inquiry'],
    2: ['mind', 'observation'],
    3: ['witness', 'raja'],
    4: ['chitta-vritti', 'raja'],
    5: ['samskara', 'thought'],
    6: ['wound', 'healing'],
    7: ['self-inquiry', 'witness'],
    8: ['impermanence', 'change'],
    9: ['tao', 'neti-neti'],
    10: ['thought', 'mind'],
    11: ['silence', 'witness'],
    12: ['suffering', 'impermanence'],
    13: ['cave', 'shadow'],
    14: ['thought', 'speech'],
    15: ['witness', 'self-inquiry'],
    16: ['self-inquiry', 'jnana'],
    17: ['silence', 'witness'],
    18: ['sky', 'witness'],
    19: ['sufi', 'bhakti'],
    20: ['tao', 'surrender'],
    21: ['freedom', 'action'],
    22: ['surrender', 'emptiness'],
    23: ['truth', 'surrender'],
    24: ['karma', 'action'],
    25: ['sufi', 'surrender'],
  };

  for (const [cardId, themeIds] of Object.entries(wisdomThemeMap)) {
    const cardNode = getNode(nodes, `wisdom-card::${cardId}`);
    if (!cardNode) continue;
    for (const themeId of themeIds) {
      const targetId = conceptKeywords[themeId];
      if (targetId) {
        const targetNode = getNode(nodes, targetId);
        if (targetNode) {
          ensureEdge(edges, 'MENTIONS_CONCEPT', cardNode.id, targetId, 0.6);
        }
      }
    }
  }

  // Loop essays → loops
  for (const essay of LOOP_ESSAYS) {
    if (!essay.loopId) continue;
    const essayNode = getNode(nodes, `loop-essay::${essay.slug}`);
    const loopNode = getNode(nodes, `loop::${essay.loopId}`);
    if (essayNode && loopNode) {
      ensureEdge(edges, 'RELATED_TO', essayNode.id, loopNode.id, 1.0);
    }
  }

  // Knowledge essays cross-links
  for (const essay of KNOWLEDGE_ESSAYS) {
    const essayNode = getNode(nodes, `post::${essay.slug}`);
    if (!essayNode) continue;
    for (const relatedSlug of essay.related) {
      const relatedNode = getNode(nodes, `post::${relatedSlug}`);
      if (relatedNode) {
        ensureEdge(edges, 'RELATED_TO', essayNode.id, relatedNode.id, 0.9, {
          source: 'manual-crosslink',
        });
      }
    }
  }

  cachedGraph = { nodes, edges };
  return cachedGraph;
}

export function getContentGraph(): KnowledgeGraph {
  if (!cachedGraph) {
    // This will be called after buildContentGraph() in async context
    throw new Error('Graph not built yet. Call buildContentGraph() first.');
  }
  return cachedGraph;
}

export function resetContentGraphCache(): void {
  cachedGraph = null;
  edgeCounter = 0;
}

// ─── Query Functions ────────────────────────────────────────────────────────

export function getNodeById(id: string): KnowledgeNode | undefined {
  const graph = getContentGraph();
  return graph.nodes.get(id);
}

export function getNodesByType(type: NodeType): KnowledgeNode[] {
  const graph = getContentGraph();
  return Array.from(graph.nodes.values()).filter((n) => n.type === type);
}

export function getEdges(
  nodeId: string,
  direction: 'outgoing' | 'incoming' | 'both' = 'both',
  edgeTypes?: EdgeType[]
): KnowledgeEdge[] {
  const graph = getContentGraph();
  return graph.edges.filter((e) => {
    if (direction === 'outgoing' && e.from !== nodeId) return false;
    if (direction === 'incoming' && e.to !== nodeId) return false;
    if (direction === 'both' && e.from !== nodeId && e.to !== nodeId) return false;
    if (edgeTypes && !edgeTypes.includes(e.type)) return false;
    return true;
  });
}

export function getNeighbors(nodeId: string, edgeTypes?: EdgeType[]): KnowledgeNode[] {
  const graph = getContentGraph();
  const edges = getEdges(nodeId, 'outgoing', edgeTypes);
  return edges.map((e) => graph.nodes.get(e.to)).filter(Boolean) as KnowledgeNode[];
}

export function findPath(
  fromId: string,
  toId: string,
  maxDepth: number = 5
): string[] {
  const graph = getContentGraph();
  const visited = new Set<string>();
  const queue: { id: string; path: string[] }[] = [{ id: fromId, path: [fromId] }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.id === toId) return current.path;
    if (current.path.length >= maxDepth) continue;
    if (visited.has(current.id)) continue;
    visited.add(current.id);

    const edges = getEdges(current.id, 'outgoing');
    for (const edge of edges) {
      if (!visited.has(edge.to)) {
        queue.push({ id: edge.to, path: [...current.path, edge.to] });
      }
    }
  }
  return [];
}

export function searchContent(query: string, limit: number = 20): SearchResult[] {
  const graph = getContentGraph();
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const node of graph.nodes.values()) {
    let score = 0;
    const matchedFields: string[] = [];

    if (node.label.toLowerCase().includes(q)) {
      score += 10;
      matchedFields.push('label');
    }
    if (node.aliases.some((a) => a.toLowerCase().includes(q))) {
      score += 5;
      matchedFields.push('alias');
    }
    for (const [key, value] of Object.entries(node.data)) {
      if (String(value).toLowerCase().includes(q)) {
        score += 2;
        matchedFields.push(key);
      }
    }

    if (score > 0) {
      results.push({ node, score, matchedFields: [...new Set(matchedFields)] });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function getRelatedContent(
  nodeId: string,
  options: Partial<TraversalOptions> = {}
): RelatedContent[] {
  const graph = getContentGraph();
  const opts: TraversalOptions = {
    maxDepth: options.maxDepth ?? 2,
    maxNodes: options.maxNodes ?? 20,
    edgeTypes: options.edgeTypes,
    nodeTypes: options.nodeTypes,
    direction: options.direction ?? 'both',
  };

  const visited = new Set<string>();
  const results: RelatedContent[] = [];
  const queue: { nodeId: string; distance: number; path: string[] }[] = [
    { nodeId, distance: 0, path: [nodeId] },
  ];

  while (queue.length > 0 && results.length < opts.maxNodes) {
    const current = queue.shift()!;
    if (visited.has(current.nodeId)) continue;
    visited.add(current.nodeId);

    if (current.distance > 0) {
      const node = graph.nodes.get(current.nodeId);
      if (node && (!opts.nodeTypes || opts.nodeTypes.includes(node.type))) {
        results.push({
          node,
          relationship: graph.edges.find((e) => e.to === current.nodeId || e.from === current.nodeId)?.type || 'RELATED_TO',
          distance: current.distance,
          path: current.path,
        });
      }
    }

    if (current.distance >= opts.maxDepth) continue;

    const edges = getEdges(current.nodeId, opts.direction, opts.edgeTypes);
    for (const edge of edges) {
      const nextId = opts.direction === 'incoming' ? edge.from : edge.to;
      if (!visited.has(nextId)) {
        queue.push({
          nodeId: nextId,
          distance: current.distance + 1,
          path: [...current.path, nextId],
        });
      }
    }
  }

  return results;
}

export function getContentCluster(nodeId: string, radius: number = 2): ContentCluster {
  const graph = getContentGraph();
  const centerNode = graph.nodes.get(nodeId);
  if (!centerNode) {
    return { id: nodeId, label: 'Unknown', nodes: [], edges: [] };
  }

  const clusterNodes = new Map<string, KnowledgeNode>();
  const clusterEdges: KnowledgeEdge[] = [];
  const visited = new Set<string>();
  const queue: { id: string; depth: number }[] = [{ id: nodeId, depth: 0 }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.id) || current.depth > radius) continue;
    visited.add(current.id);

    const node = graph.nodes.get(current.id);
    if (node) clusterNodes.set(node.id, node);

    if (current.depth < radius) {
      const edges = getEdges(current.id, 'both');
      for (const edge of edges) {
        clusterEdges.push(edge);
        const nextId = edge.from === current.id ? edge.to : edge.from;
        if (!visited.has(nextId)) {
          queue.push({ id: nextId, depth: current.depth + 1 });
        }
      }
    }
  }

  return {
    id: `cluster-${nodeId}`,
    label: `${centerNode.label} Cluster`,
    nodes: Array.from(clusterNodes.values()),
    edges: clusterEdges,
    centralNode: centerNode,
  };
}

export function getStats(): {
  nodeCount: number;
  edgeCount: number;
  nodesByType: Record<string, number>;
  edgesByType: Record<string, number>;
} {
  const graph = getContentGraph();
  const nodesByType: Record<string, number> = {};
  const edgesByType: Record<string, number> = {};

  for (const node of graph.nodes.values()) {
    nodesByType[node.type] = (nodesByType[node.type] || 0) + 1;
  }
  for (const edge of graph.edges) {
    edgesByType[edge.type] = (edgesByType[edge.type] || 0) + 1;
  }

  return {
    nodeCount: graph.nodes.size,
    edgeCount: graph.edges.length,
    nodesByType,
    edgesByType,
  };
}