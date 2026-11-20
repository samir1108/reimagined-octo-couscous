// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE GRAPH — Page Component
// Explore the full content knowledge graph
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, RefreshCw } from 'lucide-react';
import Seo, { SITE_URL } from '@/components/seo/Seo';
import { KnowledgeGraphViz } from '@/components/knowledge-graph';
import { useContentGraph, useSearch, useNodesByType, useNode } from '@/lib/knowledge-graph/hooks';
import { getBatchStats } from '@/lib/knowledgeGraph';
import type { KBatchStats } from '@/types/knowledgeBatch';
import type { NodeType, KnowledgeNode } from '@/lib/knowledge-graph/types';

const KnowledgeGraphPage = () => {
  const navigate = useNavigate();
  const { graph, loading, stats } = useContentGraph();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [filterType, setFilterType] = useState<NodeType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'graph' | 'list' | 'stats'>('graph');

  const { results: searchResults } = useSearch(searchQuery, 50);
  const [corpus, setCorpus] = useState<KBatchStats | null>(null);

  useEffect(() => {
    let alive = true;
    getBatchStats()
      .then((stats) => {
        if (alive) setCorpus(stats);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);
  const allTypes = useMemo(() => {
    if (!graph) return [] as NodeType[];
    return Array.from(new Set(Array.from(graph.nodes.values()).map((n) => n.type)));
  }, [graph]);

  const nodesByType = useNodesByType(filterType === 'all' ? 'knowledge-essay' : filterType);

  const handleNodeClick = (node: KnowledgeNode) => {
    setSelectedNode(node);
  };

  const handleNodeNavigate = (node: KnowledgeNode) => {
    if (node.slug && (node.type === 'blog-post' || node.type === 'knowledge-essay' || node.type === 'loop-essay' || node.type === 'breakthrough-essay')) {
      navigate(`/blog/${node.slug}`);
    } else if (node.type === 'loop') {
      navigate(`/loops/${node.data.id || node.slug}`);
    } else if (node.type === 'practice') {
      navigate(`/practice/${node.data.id || node.slug}`);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-3 border-amber-500/50 border-t-amber-500 rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Building knowledge graph...</p>
        </div>
      </main>
    );
  }

  const totalPlanned = stats?.nodesByType
    ? Object.values(stats.nodesByType).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <>
      <Seo
        title="Knowledge Graph — ConsciousOS Content Network"
        description="Explore the interconnected knowledge graph of ConsciousOS: essays, loops, practices, bands, paths, and more. Visualize relationships between 500+ concepts."
        canonicalPath="/knowledge-graph"
        keywords="knowledge graph, consciousness, content network, graph visualization, connected essays"
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <header className="mb-8">
            <button
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-4"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-4xl md:text-5xl font-light tracking-tight">Knowledge Graph</h1>
                <p className="mt-2 text-base md:text-lg text-muted-foreground max-w-2xl">
                  Explore the interconnected network of {totalPlanned}+ concepts: canonical essays, loops, practices,
                  bands, paths, gurus, and the wisdom that connects them all.
                </p>
              </div>
            </div>
          </header>

          {/* Controls */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search nodes…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as NodeType | 'all')}
                className="bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
              >
                <option value="all">All Types</option>
                {allTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace('-', ' ')}
                  </option>
                ))}
              </select>

              <div className="flex gap-1 border border-border rounded-lg p-1 bg-background/50">
                {(['graph', 'list', 'stats'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1.5 text-sm rounded-md transition ${
                      viewMode === mode
                        ? 'bg-amber-500/20 text-amber-200'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>

              <button
                onClick={() => window.location.reload()}
                className="p-2.5 bg-background border border-border rounded-lg hover:border-amber-500/40 transition"
                aria-label="Refresh graph"
              >
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-4">
              {/* Stats Cards */}
              {stats && (
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-medium text-foreground">Graph Statistics</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Nodes</span>
                      <span className="font-medium text-foreground">{stats.nodeCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Edges</span>
                      <span className="font-medium text-foreground">{stats.edgeCount}</span>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground block mb-2">Top Node Types</span>
                      <div className="space-y-1">
                        {Object.entries(stats.nodesByType)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 8)
                          .map(([type, count]) => (
                            <div key={type} className="flex justify-between text-xs">
                              <span className="text-muted-foreground capitalize">{type.replace('-', ' ')}</span>
                              <span className="font-medium text-foreground">{count}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground block mb-2">Top Edge Types</span>
                      <div className="space-y-1">
                        {Object.entries(stats.edgesByType)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 8)
                          .map(([type, count]) => (
                            <div key={type} className="flex justify-between text-xs">
                              <span className="text-muted-foreground">{type.replace(/_/g, ' ').toLowerCase()}</span>
                              <span className="font-medium text-foreground">{count}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Batched Corpus */}
              {corpus && (
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-medium text-foreground">Batched Corpus</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Batches</span>
                      <span className="font-medium text-foreground">{corpus.batches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nodes</span>
                      <span className="font-medium text-foreground">{corpus.nodes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Edges</span>
                      <span className="font-medium text-foreground">{corpus.edges}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Passages</span>
                      <span className="font-medium text-foreground">{corpus.passages}</span>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground block mb-2">Domains</span>
                      <div className="space-y-1">
                        {Object.entries(corpus.domains)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 6)
                          .map(([domain, count]) => (
                            <div key={domain} className="flex justify-between text-xs">
                              <span className="text-muted-foreground capitalize">{domain}</span>
                              <span className="font-medium text-foreground">{count}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Type Filter List */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="text-sm font-medium text-foreground mb-3">Content Types</h3>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {allTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center gap-2 ${
                        filterType === type
                          ? 'bg-amber-500/10 text-amber-200'
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: {
                            'knowledge-essay': '#f59e0b',
                            'blog-post': '#64748b',
                            'loop-essay': '#8b5cf6',
                            'breakthrough-essay': '#ec4899',
                            'category': '#06b6d4',
                            'pillar': '#10b981',
                            'practice': '#22c55e',
                            'loop': '#f97316',
                            'band': '#3b82f6',
                            'path': '#a855f7',
                            'guru': '#f59e0b',
                            'dimension': '#06b6d4',
                            'chakra': '#ec4899',
                            'wisdom-card': '#84cc16',
                            'program': '#6366f1',
                            'course-day': '#f97316',
                            'skill': '#14b8a6',
                          }[type]
                        }}
                      />
                      <span className="capitalize">{type.replace('-', ' ')}</span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {viewMode === 'graph' && (
                <KnowledgeGraphViz
                  centerNodeId={selectedNode?.id}
                  maxNodes={50}
                  maxDepth={2}
                  showControls={true}
                  className="h-[600px]"
                  onNodeClick={handleNodeClick}
                />
              )}

              {viewMode === 'list' && (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="text-lg font-medium text-foreground">
                      {filterType === 'all' ? 'All Nodes' : filterType.replace('-', ' ')} ({nodesByType.length})
                    </h3>
                    {searchQuery && (
                      <span className="text-sm text-muted-foreground">{searchResults.length} search results</span>
                    )}
                  </div>
                  <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                    {(() => {
                      const items = searchQuery ? searchResults : nodesByType;
                      return items.slice(0, 100).map((node) => (
                      <button
                        key={node.id}
                        onClick={() => handleNodeClick(node)}
                        className="w-full p-4 text-left hover:bg-background/50 transition flex items-center gap-3 border-b border-border/50 last:border-0"
                      >
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: {
                              'knowledge-essay': '#f59e0b',
                              'blog-post': '#64748b',
                              'loop-essay': '#8b5cf6',
                              'breakthrough-essay': '#ec4899',
                              'category': '#06b6d4',
                              'pillar': '#10b981',
                              'practice': '#22c55e',
                              'loop': '#f97316',
                              'band': '#3b82f6',
                              'path': '#a855f7',
                              'guru': '#f59e0b',
                              'dimension': '#06b6d4',
                              'chakra': '#ec4899',
                              'wisdom-card': '#84cc16',
                              'program': '#6366f1',
                              'course-day': '#f97316',
                              'skill': '#14b8a6',
                            }[node.type]
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">{node.label}</div>
                          <div className="text-xs text-muted-foreground capitalize">{node.type.replace('-', ' ')}</div>
                        </div>
                        {node.slug && (
                          <span className="text-xs text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded">
                            View
                          </span>
                        )}
</button>
                      ))}
                    )()}
                  </div>
                </div>
              )}

              {viewMode === 'stats' && stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(stats.nodesByType)
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, count]) => (
                      <div key={type} className="bg-card border border-border rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className="w-4 h-4 rounded-full"
                            style={{
                              backgroundColor: {
                                'knowledge-essay': '#f59e0b',
                                'blog-post': '#64748b',
                                'loop-essay': '#8b5cf6',
                                'breakthrough-essay': '#ec4899',
                                'category': '#06b6d4',
                                'pillar': '#10b981',
                                'practice': '#22c55e',
                                'loop': '#f97316',
                                'band': '#3b82f6',
                                'path': '#a855f7',
                                'guru': '#f59e0b',
                                'dimension': '#06b6d4',
                                'chakra': '#ec4899',
                                'wisdom-card': '#84cc16',
                                'program': '#6366f1',
                                'course-day': '#f97316',
                                'skill': '#14b8a6',
                              }[type as NodeType]
                            }}
                          />
                          <span className="font-medium text-foreground capitalize">{type.replace('-', ' ')}</span>
                        </div>
                        <div className="text-3xl font-light text-foreground">{count}</div>
                        <div className="text-xs text-muted-foreground">nodes</div>
                      </div>
                    ))}
                </div>
              )}

              {/* Selected Node Detail */}
              {selectedNode && (
                <div className="bg-card border border-amber-500/30 rounded-xl p-5 animate-in slide-in-from-bottom">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: {
                            'knowledge-essay': '#f59e0b',
                            'blog-post': '#64748b',
                            'loop-essay': '#8b5cf6',
                            'breakthrough-essay': '#ec4899',
                            'category': '#06b6d4',
                            'pillar': '#10b981',
                            'practice': '#22c55e',
                            'loop': '#f97316',
                            'band': '#3b82f6',
                            'path': '#a855f7',
                            'guru': '#f59e0b',
                            'dimension': '#06b6d4',
                            'chakra': '#ec4899',
                            'wisdom-card': '#84cc16',
                            'program': '#6366f1',
                            'course-day': '#f97316',
                            'skill': '#14b8a6',
                          }[selectedNode.type]
                        }}
                      />
                      <div>
                        <h4 className="text-lg font-medium text-foreground">{selectedNode.label}</h4>
                        <div className="text-sm text-muted-foreground capitalize">{selectedNode.type.replace('-', ' ')}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="p-1 text-muted-foreground hover:text-foreground transition"
                    >
                      ×
                    </button>
                  </div>

                  {selectedNode.slug && (
                    <button
                      onClick={() => handleNodeNavigate(selectedNode)}
                      className="mt-3 text-sm text-amber-300 hover:text-amber-200 underline-offset-2 hover:underline"
                    >
                      View full content →
                    </button>
                  )}

                  <div className="mt-3 text-xs text-muted-foreground">
                    ID: <code className="font-mono">{selectedNode.id}</code>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default KnowledgeGraphPage;