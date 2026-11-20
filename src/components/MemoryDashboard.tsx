import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, Trash2, RefreshCw, Search, Filter, TrendingUp, AlertTriangle, Lightbulb, Target, Zap, Heart, Dna, Orbit, Footprints, Activity } from "lucide-react";
import { useMemories, useMemoryPatterns, useDeleteMemory, useConsolidateMemories } from "@/hooks/useMemory";
import type { Memory, MemoryPattern } from "@/hooks/useMemory";
import { format } from "date-fns";
import { toast } from "sonner";
import { conscious, consciousFromError } from "@/lib/consciousToast";

const spring = { type: "spring", stiffness: 300, damping: 30 } as const;

const CATEGORY_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  breakthrough: { icon: Sparkles, color: "text-yellow-400", label: "Breakthrough" },
  pattern: { icon: TrendingUp, color: "text-blue-400", label: "Pattern" },
  trigger: { icon: AlertTriangle, color: "text-red-400", label: "Trigger" },
  milestone: { icon: Target, color: "text-green-400", label: "Milestone" },
  insight: { icon: Lightbulb, color: "text-purple-400", label: "Insight" },
  struggle: { icon: Heart, color: "text-orange-400", label: "Struggle" },
};

const MEMORY_LAYERS = [
  { id: "all", label: "All", icon: Brain, description: "All memories" },
  { id: "surface", label: "Surface", icon: Lightbulb, description: "Daily insights & observations" },
  { id: "karmic", label: "Karmic", icon: Orbit, description: "Repeating life patterns & cycles" },
  { id: "ancestral", label: "Ancestral", icon: Dna, description: "Family patterns & inherited beliefs" },
  { id: "evolutionary", label: "Growth", icon: TrendingUp, description: "Breakthroughs & evolution timeline" },
  { id: "somatic", label: "Somatic", icon: Activity, description: "Body-stored memories & tension patterns" },
] as const;

type MemoryLayerType = typeof MEMORY_LAYERS[number]["id"];

const SIGNIFICANCE_COLORS: Record<string, string> = {
  emerging: "bg-blue-500/20 text-blue-300",
  established: "bg-yellow-500/20 text-yellow-300",
  critical: "bg-red-500/20 text-red-300",
  resolving: "bg-green-500/20 text-green-300",
};

function MemoryCard({ memory, onDelete }: { memory: Memory; onDelete: (id: string) => void }) {
  const config = CATEGORY_CONFIG[memory.category] || CATEGORY_CONFIG.insight;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card rounded-xl p-4 space-y-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${config.color}`} />
          <span className={`text-xs font-display font-medium ${config.color}`}>{config.label}</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground font-body">
            {format(new Date(memory.created_at), "MMM d")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Importance indicator */}
          <div className="flex gap-0.5">
            {Array.from({ length: Math.min(5, Math.ceil(memory.importance / 2)) }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  i < Math.ceil(memory.importance / 2) ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => onDelete(memory.id)}
            className="p-1 rounded-lg hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>

      <p className="text-sm font-body text-foreground leading-relaxed">{memory.content}</p>

      <div className="flex flex-wrap gap-1.5">
        {memory.dimension_relevant && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-body">
            {memory.dimension_relevant}
          </span>
        )}
        {memory.emotional_tone && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/30 text-accent-foreground font-body">
            {memory.emotional_tone}
          </span>
        )}
        {(memory.tags || []).slice(0, 3).map((tag) => (
          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-body">
            {tag}
          </span>
        ))}
      </div>

      {memory.decay_factor < 0.7 && (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
          <span>Fading</span>
          <div className="w-12 h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-muted-foreground/40"
              style={{ width: `${memory.decay_factor * 100}%` }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

function PatternCard({ pattern }: { pattern: MemoryPattern }) {
  const sigClass = SIGNIFICANCE_COLORS[pattern.significance] || SIGNIFICANCE_COLORS.emerging;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-4 space-y-3 border-l-2 border-primary/50"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm font-display font-semibold text-foreground">{pattern.pattern_name}</span>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-body ${sigClass}`}>
          {pattern.significance}
        </span>
      </div>

      <p className="text-xs font-body text-muted-foreground leading-relaxed">{pattern.description}</p>

      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3" /> {pattern.frequency}x detected
        </span>
        {pattern.dimension && (
          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary">{pattern.dimension}</span>
        )}
        {pattern.emotional_trend && (
          <span className={`px-1.5 py-0.5 rounded ${
            pattern.emotional_trend === "improving" ? "bg-green-500/10 text-green-400" :
            pattern.emotional_trend === "worsening" ? "bg-red-500/10 text-red-400" :
            "bg-muted text-muted-foreground"
          }`}>
            {pattern.emotional_trend}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function MemoryDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedLayer, setSelectedLayer] = useState<MemoryLayerType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"memories" | "patterns" | "layers">("memories");

  const { data: memories, isLoading: memoriesLoading } = useMemories(selectedCategory);
  const { data: patterns, isLoading: patternsLoading } = useMemoryPatterns();
  const deleteMemory = useDeleteMemory();
  const consolidate = useConsolidateMemories();

  const filteredMemories = (memories || []).filter((m) => {
    const matchesSearch = !searchQuery || m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLayer = selectedLayer === "all" || (m as any).memory_layer === selectedLayer;
    return matchesSearch && matchesLayer;
  });

  // Count memories per layer
  const layerCounts = (memories || []).reduce((acc: Record<string, number>, m: any) => {
    const layer = m.memory_layer || "surface";
    acc[layer] = (acc[layer] || 0) + 1;
    return acc;
  }, {});

  const handleDelete = (id: string) => {
    deleteMemory.mutate(id, {
      onSuccess: () => conscious("noted", { kind: "success" }),
      onError: (e) => consciousFromError(e, "actionMissed"),
    });
  };

  const handleConsolidate = () => {
    consolidate.mutate(undefined, {
      onSuccess: (data: any) => {
        toast.success("Memories woven", {
          description: `${data.consolidated} threads joined · ${data.patterns} patterns surfaced.`,
        });
      },
      onError: (e) => consciousFromError(e, "somethingSlipped"),
    });
  };

  const categories = ["breakthrough", "pattern", "trigger", "milestone", "insight", "struggle"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">Memory System</h2>
            <p className="text-xs text-muted-foreground font-body">
              {memories?.length || 0} memories • {patterns?.length || 0} patterns
            </p>
          </div>
        </div>
        <button
          onClick={handleConsolidate}
          disabled={consolidate.isPending}
          className="flex items-center gap-2 px-3 py-2 rounded-xl glass-card text-xs font-display text-primary hover:scale-105 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${consolidate.isPending ? "animate-spin" : ""}`} />
          {consolidate.isPending ? "Analyzing..." : "Consolidate"}
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["memories", "layers", "patterns"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-display transition-all ${
              activeTab === tab
                ? "bg-primary/10 text-primary border border-primary/20"
                : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "memories" ? "Memories" : tab === "layers" ? "Deep Layers" : "Patterns"}
          </button>
        ))}
      </div>

      {activeTab === "memories" && (
        <>
          {/* Search + Filter */}
          <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search memories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-card text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 bg-transparent"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCategory(undefined)}
                className={`px-3 py-1 rounded-lg text-[11px] font-body whitespace-nowrap transition-all ${
                  !selectedCategory ? "bg-primary/20 text-primary" : "glass-subtle text-muted-foreground"
                }`}
              >
                All
              </button>
              {categories.map((cat) => {
                const config = CATEGORY_CONFIG[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? undefined : cat)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-body whitespace-nowrap transition-all ${
                      selectedCategory === cat ? "bg-primary/20 text-primary" : "glass-subtle text-muted-foreground"
                    }`}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Memory List */}
          {memoriesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-xl p-4 h-24 animate-pulse" />
              ))}
            </div>
          ) : filteredMemories.length === 0 ? (
            <motion.div
              className="glass-card rounded-2xl p-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Brain className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-body">
                {searchQuery ? "No memories match your search" : "No memories yet. Start a Guide session or write a journal entry!"}
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-3">
                {filteredMemories.map((memory) => (
                  <MemoryCard key={memory.id} memory={memory} onDelete={handleDelete} />
                ))}
              </div>
            </AnimatePresence>
          )}
        </>
      )}

      {activeTab === "layers" && (
        <div className="space-y-4">
          {/* Layer selector */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {MEMORY_LAYERS.map((layer) => {
              const Icon = layer.icon;
              const count = layer.id === "all"
                ? (memories || []).length
                : layerCounts[layer.id] || 0;
              return (
                <button
                  key={layer.id}
                  onClick={() => setSelectedLayer(layer.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-display whitespace-nowrap transition-all shrink-0 ${
                    selectedLayer === layer.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "glass-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {layer.label}
                  <span className="text-[10px] opacity-60">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Layer description */}
          {selectedLayer !== "all" && (
            <motion.div
              className="glass-card rounded-xl p-4 border-l-2 border-primary/40"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-xs text-muted-foreground font-body">
                {MEMORY_LAYERS.find(l => l.id === selectedLayer)?.description}
              </p>
              {selectedLayer === "karmic" && (
                <p className="text-[10px] text-muted-foreground/60 font-body mt-1">
                  Repeating relationship cycles, life themes, recurring dreams, déjà vu moments
                </p>
              )}
              {selectedLayer === "ancestral" && (
                <p className="text-[10px] text-muted-foreground/60 font-body mt-1">
                  Family belief systems, generational trauma, inherited emotional patterns
                </p>
              )}
              {selectedLayer === "evolutionary" && (
                <p className="text-[10px] text-muted-foreground/60 font-body mt-1">
                  Before/after snapshots, breakthrough moments, consciousness level shifts
                </p>
              )}
              {selectedLayer === "somatic" && (
                <p className="text-[10px] text-muted-foreground/60 font-body mt-1">
                  Chronic tension areas, emotion-body map, breath patterns, trauma stored in the body
                </p>
              )}
            </motion.div>
          )}

          {/* Filtered memories for this layer */}
          {filteredMemories.length === 0 ? (
            <motion.div
              className="glass-card rounded-2xl p-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Orbit className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-body">
                No {selectedLayer === "all" ? "" : selectedLayer} memories yet. The AI will detect and categorize these as you use the Guide and Journal.
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-3">
                {filteredMemories.map((memory) => (
                  <MemoryCard key={memory.id} memory={memory} onDelete={handleDelete} />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      )}

      {activeTab === "patterns" && (
        <>
          {patternsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="glass-card rounded-xl p-4 h-20 animate-pulse" />
              ))}
            </div>
          ) : (patterns || []).length === 0 ? (
            <motion.div
              className="glass-card rounded-2xl p-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <TrendingUp className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-body">
                No patterns detected yet. Use the app for a few days, then hit "Consolidate" to discover patterns.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {(patterns || []).map((pattern) => (
                <PatternCard key={pattern.id} pattern={pattern} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
