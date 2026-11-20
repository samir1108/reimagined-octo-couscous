import { motion } from "framer-motion";
import { Brain, Lightbulb, Shield, Target, Compass, AlertTriangle } from "lucide-react";
import { Progress } from "@/design-system";

const spring = { type: "spring", stiffness: 300, damping: 30 } as const;

const THINKING_TRAP_ICONS: Record<string, string> = {
  catastrophizing: "🌪️", black_white: "⬛⬜", overgeneralization: "🔄",
  mind_reading: "🧠", fortune_telling: "🔮", personalization: "👤",
  emotional_reasoning: "💭", should_statements: "📋", labeling: "🏷️",
  magnification: "🔍", filtering: "🎯", discounting: "❌",
};

interface Props {
  psycheData: any;
}

export function PsycheLayer({ psycheData }: Props) {
  const beliefs = psycheData?.beliefs || { core_beliefs: [], limiting_beliefs: [], empowering_beliefs: [], belief_origins: {} };
  const values = psycheData?.values_profile || { detected_values: [], stated_values: [], alignment_score: 0, value_conflicts: [] };
  const purpose = psycheData?.purpose || { clarity_score: 0, ikigai: { love: [], good_at: [], world_needs: [], paid_for: [] }, meaning_patterns: [], life_direction: null };
  const cognitive = psycheData?.cognitive_patterns || { thinking_traps: [], flexibility_score: 0, rumination_ratio: 0, dominant_cognitive_style: null };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring}>
        <h2 className="text-lg font-display font-bold text-foreground">The Inner Landscape</h2>
        <p className="text-sm text-muted-foreground font-body">Beliefs, values, purpose, and cognitive patterns that shape your reality</p>
      </motion.div>

      {/* Beliefs System */}
      <motion.div
        className="glass-card rounded-2xl p-5 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.05 }}
      >
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground text-sm">Belief System</h3>
        </div>

        {beliefs.core_beliefs?.length > 0 ? (
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-body uppercase tracking-wider text-muted-foreground">Core Beliefs</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {beliefs.core_beliefs.map((b: string, i: number) => (
                  <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-muted text-foreground font-body">{b}</span>
                ))}
              </div>
            </div>

            {beliefs.limiting_beliefs?.length > 0 && (
              <div>
                <span className="text-[10px] font-body uppercase tracking-wider text-destructive/70">Limiting Beliefs</span>
                <div className="space-y-1 mt-1">
                  {beliefs.limiting_beliefs.map((b: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs font-body text-foreground">
                      <AlertTriangle className="w-3 h-3 text-destructive shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {beliefs.empowering_beliefs?.length > 0 && (
              <div>
                <span className="text-[10px] font-body uppercase tracking-wider text-emerald-400">Empowering Beliefs</span>
                <div className="space-y-1 mt-1">
                  {beliefs.empowering_beliefs.map((b: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs font-body text-foreground">
                      <Lightbulb className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <EmptyState text="Your belief system will be mapped as the AI Guide learns about you through conversations and journal entries." />
        )}
      </motion.div>

      {/* Values & Alignment */}
      <motion.div
        className="glass-card rounded-2xl p-5 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.15 }}
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground text-sm">Values & Alignment</h3>
        </div>

        {values.detected_values?.length > 0 ? (
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-body uppercase tracking-wider text-muted-foreground">Lived Values (detected from behavior)</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {values.detected_values.map((v: string, i: number) => (
                  <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-body capitalize">{v}</span>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-body text-muted-foreground">
                <span>Values Alignment (what you say vs what you do)</span>
                <span>{Math.round(Number(values.alignment_score) * 100)}%</span>
              </div>
              <Progress value={Number(values.alignment_score) * 100} className="h-1.5" />
            </div>
            {values.value_conflicts?.length > 0 && (
              <div>
                <span className="text-[10px] font-body uppercase tracking-wider text-orange-400">Active Conflicts</span>
                {values.value_conflicts.map((c: string, i: number) => (
                  <p key={i} className="text-xs font-body text-foreground mt-1">⚡ {c}</p>
                ))}
              </div>
            )}
          </div>
        ) : (
          <EmptyState text="Your values will emerge from your choices and conversations over time." />
        )}
      </motion.div>

      {/* Purpose & Ikigai */}
      <motion.div
        className="glass-card rounded-2xl p-5 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.25 }}
      >
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground text-sm">Purpose & Meaning</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🧭</div>
            <div>
              <p className="text-xs text-muted-foreground font-body">Purpose Clarity</p>
              <p className="text-2xl font-display font-bold text-foreground">{Math.round(Number(purpose.clarity_score) * 100)}%</p>
            </div>
          </div>
          {purpose.life_direction && (
            <p className="text-xs font-body text-foreground italic border-l-2 border-primary/30 pl-3">"{purpose.life_direction}"</p>
          )}

          {/* Ikigai Grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "love", label: "What you love", emoji: "❤️", items: purpose.ikigai?.love },
              { key: "good_at", label: "What you're good at", emoji: "⭐", items: purpose.ikigai?.good_at },
              { key: "world_needs", label: "What the world needs", emoji: "🌍", items: purpose.ikigai?.world_needs },
              { key: "paid_for", label: "What you're paid for", emoji: "💰", items: purpose.ikigai?.paid_for },
            ].map((section) => (
              <div key={section.key} className="glass-card rounded-xl p-3 space-y-1">
                <span className="text-[9px] font-body text-muted-foreground">{section.emoji} {section.label}</span>
                {section.items?.length > 0 ? (
                  section.items.map((item: string, i: number) => (
                    <p key={i} className="text-[10px] font-body text-foreground">{item}</p>
                  ))
                ) : (
                  <p className="text-[10px] font-body text-muted-foreground italic">Discovering...</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Cognitive Patterns */}
      <motion.div
        className="glass-card rounded-2xl p-5 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.35 }}
      >
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground text-sm">Cognitive Patterns</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-body text-muted-foreground">Flexibility</span>
            <p className="text-lg font-display font-bold text-foreground">{Math.round(Number(cognitive.flexibility_score) * 100)}%</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-body text-muted-foreground">Rumination vs Reflection</span>
            <p className="text-lg font-display font-bold text-foreground">{Math.round(Number(cognitive.rumination_ratio) * 100)}%</p>
          </div>
        </div>

        {cognitive.thinking_traps?.length > 0 ? (
          <div>
            <span className="text-[10px] font-body uppercase tracking-wider text-muted-foreground">Active Thinking Traps</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {cognitive.thinking_traps.map((trap: string, i: number) => (
                <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-orange-500/10 text-orange-300 font-body capitalize">
                  {THINKING_TRAP_ICONS[trap] || "🧠"} {trap.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground font-body italic">Cognitive patterns will be identified through your interactions.</p>
        )}
      </motion.div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-4 text-center">
      <p className="text-xs text-muted-foreground font-body italic">{text}</p>
    </div>
  );
}
