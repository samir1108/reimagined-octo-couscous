import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import MasterMirrorRunner from "@/components/humanMap/MasterMirrorRunner";
import { useHumanMapDims, useMirrorProgress } from "@/hooks/useHumanMap";
import { DIMENSIONS } from "@/data/humanMap/dimensions";

// 9 categories × ~11 dimensions = ~100 dimensions
const DIMENSION_CATEGORIES: Record<string, { label: string; emoji: string; dimensions: string[] }> = {
  cognitive: {
    label: "Cognitive", emoji: "🧠",
    dimensions: ["analytical_thinking", "creative_thinking", "meta_cognition", "pattern_recognition", "learning_speed", "cognitive_flexibility", "abstract_reasoning", "decision_quality", "memory_integration", "conceptual_depth", "intuitive_knowing"],
  },
  emotional: {
    label: "Emotional", emoji: "💖",
    dimensions: ["emotional_awareness", "emotional_regulation", "empathy", "compassion", "emotional_resilience", "vulnerability_capacity", "emotional_expression", "grief_processing", "joy_capacity", "anger_integration", "fear_relationship"],
  },
  physical: {
    label: "Physical", emoji: "🏃",
    dimensions: ["body_awareness", "energy_management", "sleep_quality", "movement_practice", "breath_awareness", "pain_relationship", "sensory_sensitivity", "appetite_awareness", "tension_patterns", "physical_resilience", "somatic_intelligence"],
  },
  relational: {
    label: "Relational", emoji: "🤝",
    dimensions: ["attachment_style", "communication_depth", "boundary_setting", "conflict_navigation", "intimacy_capacity", "community_engagement", "leadership_presence", "listening_depth", "forgiveness_practice", "trust_capacity", "social_awareness"],
  },
  existential: {
    label: "Existential", emoji: "✨",
    dimensions: ["meaning_making", "death_awareness", "purpose_clarity", "values_alignment", "spiritual_connection", "awe_capacity", "gratitude_depth", "acceptance_level", "surrender_capacity", "faith_quality", "mystery_tolerance"],
  },
  creative: {
    label: "Creative", emoji: "🎨",
    dimensions: ["creative_expression", "imagination_access", "flow_state_frequency", "aesthetic_sensitivity", "innovation_capacity", "playfulness", "dream_richness", "symbolic_thinking", "artistic_skill", "creative_courage", "vision_clarity"],
  },
  professional: {
    label: "Professional", emoji: "💼",
    dimensions: ["work_engagement", "skill_mastery", "career_alignment", "financial_wisdom", "productivity_quality", "collaboration_skill", "mentoring_capacity", "ethical_standards", "stress_management", "growth_orientation", "service_attitude"],
  },
  ecological: {
    label: "Ecological", emoji: "🌿",
    dimensions: ["nature_connection", "environmental_awareness", "consumption_consciousness", "place_attachment", "seasonal_attunement", "animal_connection", "plant_awareness", "weather_sensitivity", "ecological_responsibility", "wilderness_comfort", "earth_gratitude"],
  },
  integrative: {
    label: "Integrative", emoji: "🔮",
    dimensions: ["mind_body_coherence", "shadow_integration", "paradox_tolerance", "wholeness_sense", "flow_between_states", "inner_outer_balance", "masculine_feminine_balance", "tradition_innovation_balance", "solitude_community_balance", "action_stillness_balance", "knowing_unknowing_balance"],
  },
};

const trendIcon = (trend: string) => {
  if (trend === "improving") return <TrendingUp className="w-3 h-3 text-emerald-500" />;
  if (trend === "declining") return <TrendingDown className="w-3 h-3 text-destructive" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
};

const formatDimName = (name: string) => name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

export default function DimensionHumanMap() {
  const [scores, setScores] = useState<Record<string, Record<string, { score: number; trend: string; signal_count: number; evidence?: string | null }>>>({});
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mirrorOpen, setMirrorOpen] = useState(false);

  const { data: hmDims } = useHumanMapDims();
  const { data: mirrorProgress } = useMirrorProgress();

  // Lookup raw legacy key from new dimension_id (e.g. cog_pattern_recognition -> pattern_recognition)
  const idToRaw = (id: string) => DIMENSIONS.find(d => d.id === id)?.raw ?? id;

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("dimension_map_scores" as any)
        .select("*")
        .eq("user_id", user.id);

      const grouped: typeof scores = {};
      for (const row of (data || []) as any[]) {
        if (!grouped[row.category]) grouped[row.category] = {};
        grouped[row.category][row.dimension_name] = {
          score: row.score || 0,
          trend: row.trend || "stable",
          signal_count: row.signal_count || 0,
        };
      }
      setScores(grouped);
    } catch (err) {
      console.error("dimension map load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Merge in human_map_dimensions (new mirror-driven data takes precedence)
  const merged: typeof scores = (() => {
    const base: typeof scores = JSON.parse(JSON.stringify(scores));
    for (const d of (hmDims ?? [])) {
      if (!d.discovered) continue;
      if (!base[d.category]) base[d.category] = {};
      base[d.category][idToRaw(d.dimension_id)] = {
        score: Math.round((d.score ?? 0) / 10), // 0-100 -> 0-10 scale used by existing UI
        trend: "stable",
        signal_count: 1,
        evidence: d.evidence,
      };
    }
    return base;
  })();

  const getCategoryAvg = (catKey: string) => {
    const catScores = merged[catKey];
    if (!catScores) return 0;
    const vals = Object.values(catScores).map(v => v.score);
    if (vals.length === 0) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const totalDiscovered = Object.values(merged).reduce(
    (acc, cat) => acc + Object.keys(cat).length, 0
  );

  const ctaLabel = mirrorProgress?.master_mirror_completed
    ? "Refine Mirror"
    : (mirrorProgress?.master_mirror_index ?? 0) > 0
    ? "Resume Mirror"
    : "Begin Master Mirror";

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-5 border-primary/10"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-primary/70" />
          <span className="text-xs font-display tracking-widest uppercase text-primary font-semibold">Human Map</span>
        </div>
        <span className="text-[10px] text-muted-foreground">{totalDiscovered}/99 discovered</span>
      </div>

      {/* Master Mirror CTA */}
      <button
        onClick={() => setMirrorOpen(true)}
        className="w-full flex items-center justify-between rounded-xl bg-gradient-to-r from-primary/15 via-primary/8 to-transparent border border-primary/20 px-4 py-3 mb-4 hover:from-primary/20 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-primary" />
          <div className="text-left">
            <div className="text-xs font-display text-foreground">{ctaLabel}</div>
            <div className="text-[10px] text-muted-foreground">
              Discover dimensions through reflection
            </div>
          </div>
        </div>
        <ChevronDown className="w-3 h-3 text-primary/60 -rotate-90" />
      </button>

      {loading ? (
        <div className="text-xs text-muted-foreground text-center py-4">Loading your map...</div>
      ) : (
        <div className="space-y-2">
          {Object.entries(DIMENSION_CATEGORIES).map(([key, cat]) => {
            const avg = getCategoryAvg(key);
            const discovered = Object.keys(merged[key] || {}).length;
            const isExpanded = expandedCat === key;

            return (
              <div key={key}>
                <button
                  onClick={() => setExpandedCat(isExpanded ? null : key)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cat.emoji}</span>
                    <span className="text-xs font-medium text-foreground">{cat.label}</span>
                    <span className="text-[10px] text-muted-foreground">{discovered}/{cat.dimensions.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {avg > 0 && (
                      <div className="w-16 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <div className="h-full bg-primary/60 rounded-full" style={{ width: `${Math.min(100, avg * 10)}%` }} />
                      </div>
                    )}
                    {isExpanded ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-8 pr-2 pb-2 space-y-1.5">
                        {cat.dimensions.map(dim => {
                          const dimData = merged[key]?.[dim];
                          return (
                            <div key={dim} className="py-1">
                              <div className="flex items-center justify-between">
                                <span className={`text-[11px] ${dimData ? "text-foreground/80" : "text-muted-foreground/40"}`}>
                                  {formatDimName(dim)}
                                </span>
                                {dimData ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-10 h-1 bg-muted/30 rounded-full overflow-hidden">
                                      <div className="h-full bg-primary/50 rounded-full" style={{ width: `${Math.min(100, dimData.score * 10)}%` }} />
                                    </div>
                                    {trendIcon(dimData.trend)}
                                  </div>
                                ) : (
                                  <span className="text-[9px] text-muted-foreground/30">undiscovered</span>
                                )}
                              </div>
                              {dimData?.evidence && (
                                <div className="mt-0.5 text-[10px] text-muted-foreground/70 italic leading-snug">
                                  {dimData.evidence}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/50 mt-3 text-center">
        Dimensions deepen with the Master Mirror and your daily practice
      </p>
    </motion.div>

    <AnimatePresence>
      {mirrorOpen && <MasterMirrorRunner onClose={() => setMirrorOpen(false)} />}
    </AnimatePresence>
    </>
  );
}
