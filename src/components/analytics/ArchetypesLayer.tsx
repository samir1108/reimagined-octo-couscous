import { motion } from "framer-motion";
import { Crown, Moon, Sparkles, Users } from "lucide-react";
import { Progress } from "@/design-system";

const spring = { type: "spring", stiffness: 300, damping: 30 } as const;

const ARCHETYPE_INFO: Record<string, { emoji: string; desc: string }> = {
  warrior: { emoji: "⚔️", desc: "The protector. Courage, discipline, boundaries." },
  lover: { emoji: "💗", desc: "The connector. Passion, empathy, intimacy." },
  sage: { emoji: "📜", desc: "The seeker of truth. Wisdom, reflection, knowledge." },
  magician: { emoji: "🔮", desc: "The transformer. Vision, intuition, manifestation." },
  king: { emoji: "👑", desc: "The sovereign. Order, blessing, purpose." },
  queen: { emoji: "👸", desc: "The nurturer. Abundance, compassion, creation." },
  explorer: { emoji: "🧭", desc: "The adventurer. Freedom, discovery, authenticity." },
  creator: { emoji: "🎨", desc: "The maker. Innovation, vision, expression." },
  caregiver: { emoji: "🤲", desc: "The healer. Service, generosity, protection." },
  rebel: { emoji: "🔥", desc: "The revolutionary. Liberation, truth, disruption." },
  jester: { emoji: "🃏", desc: "The trickster. Joy, lightness, perspective." },
  innocent: { emoji: "🕊️", desc: "The pure one. Faith, optimism, simplicity." },
};

interface Props {
  psycheData: any;
}

export function ArchetypesLayer({ psycheData }: Props) {
  const archetypes = psycheData?.archetypes || { dominant: null, shadow: null, aspirational: null, active_archetypes: [], evolution_timeline: [] };
  const shadow = psycheData?.shadow || { disowned_parts: [], projection_patterns: [], integration_progress: 0, shadow_triggers: [] };
  const innerVoices = psycheData?.inner_voices || {
    inner_critic: { strength: 0, frequency: 0, common_messages: [] },
    inner_child: { state: null, needs: [] },
    saboteur: { patterns: [], strength: 0 },
    wise_self: { access_frequency: 0, messages: [] },
  };

  const dominantInfo = ARCHETYPE_INFO[archetypes.dominant] || null;
  const shadowArchInfo = ARCHETYPE_INFO[archetypes.shadow] || null;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring}>
        <h2 className="text-lg font-display font-bold text-foreground">Archetypes & Shadow</h2>
        <p className="text-sm text-muted-foreground font-body">The mythic patterns and hidden parts that drive your behavior</p>
      </motion.div>

      {/* Dominant Archetype */}
      <motion.div
        className="glass-card rounded-2xl p-6 space-y-3 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.05 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-foreground text-sm">Your Archetype</h3>
          </div>
          {archetypes.dominant ? (
            <div className="flex items-center gap-4">
              <span className="text-5xl">{dominantInfo?.emoji || "🎭"}</span>
              <div>
                <p className="text-xl font-display font-bold text-foreground capitalize">{archetypes.dominant}</p>
                <p className="text-xs text-muted-foreground font-body italic">{dominantInfo?.desc || "A unique archetype emerging from your journey"}</p>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <span className="text-4xl">🎭</span>
              <p className="text-xs text-muted-foreground font-body italic mt-2">Your dominant archetype will emerge through your journey</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Active Archetypes */}
      {archetypes.active_archetypes?.length > 0 && (
        <motion.div
          className="glass-card rounded-2xl p-5 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
        >
          <span className="text-[10px] font-body uppercase tracking-wider text-muted-foreground">Active Archetypes</span>
          <div className="grid grid-cols-2 gap-2">
            {archetypes.active_archetypes.map((arch: string, i: number) => {
              const info = ARCHETYPE_INFO[arch];
              return (
                <div key={i} className="glass-card rounded-xl p-3 flex items-center gap-2">
                  <span className="text-lg">{info?.emoji || "🎭"}</span>
                  <span className="text-xs font-display font-medium text-foreground capitalize">{arch}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Shadow Profile */}
      <motion.div
        className="glass-card rounded-2xl p-5 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.15 }}
      >
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4 text-violet-400" />
          <h3 className="font-display font-semibold text-foreground text-sm">Shadow Profile</h3>
        </div>

        {archetypes.shadow && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-500/5 border border-violet-500/10">
            <span className="text-2xl">{shadowArchInfo?.emoji || "🌑"}</span>
            <div>
              <p className="text-sm font-display font-medium text-foreground capitalize">Shadow: {archetypes.shadow}</p>
              <p className="text-[10px] text-muted-foreground font-body">{shadowArchInfo?.desc || "The unconscious counterpart"}</p>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-body text-muted-foreground">
            <span>Shadow Integration</span>
            <span>{Math.round(Number(shadow.integration_progress) * 100)}%</span>
          </div>
          <Progress value={Number(shadow.integration_progress) * 100} className="h-1.5" />
        </div>

        {shadow.disowned_parts?.length > 0 && (
          <div>
            <span className="text-[10px] font-body uppercase tracking-wider text-muted-foreground">Disowned Parts</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {shadow.disowned_parts.map((p: string, i: number) => (
                <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-violet-500/10 text-violet-300 font-body capitalize">{p}</span>
              ))}
            </div>
          </div>
        )}

        {shadow.projection_patterns?.length > 0 && (
          <div>
            <span className="text-[10px] font-body uppercase tracking-wider text-muted-foreground">Projection Patterns</span>
            {shadow.projection_patterns.map((p: string, i: number) => (
              <p key={i} className="text-xs font-body text-foreground mt-1">🪞 {p}</p>
            ))}
          </div>
        )}

        {!archetypes.shadow && shadow.disowned_parts?.length === 0 && (
          <p className="text-xs text-muted-foreground font-body italic text-center py-2">Your shadow will be revealed through deeper self-inquiry.</p>
        )}
      </motion.div>

      {/* Inner Voices */}
      <motion.div
        className="glass-card rounded-2xl p-5 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.25 }}
      >
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground text-sm">Inner Voices</h3>
        </div>
        <p className="text-[10px] text-muted-foreground font-body">The sub-personalities that speak within you</p>

        <div className="space-y-3">
          {/* Inner Critic */}
          <VoiceCard
            emoji="👹"
            name="Inner Critic"
            strength={innerVoices.inner_critic?.strength}
            detail={innerVoices.inner_critic?.common_messages?.length > 0
              ? `"${innerVoices.inner_critic.common_messages[0]}"`
              : "Not yet detected"}
            color="text-red-400"
          />

          {/* Inner Child */}
          <VoiceCard
            emoji="👶"
            name="Inner Child"
            strength={innerVoices.inner_child?.needs?.length > 0 ? 5 : 0}
            detail={innerVoices.inner_child?.state
              ? `State: ${innerVoices.inner_child.state}`
              : "Listening..."}
            color="text-blue-400"
          />

          {/* Saboteur */}
          <VoiceCard
            emoji="🎭"
            name="Saboteur"
            strength={innerVoices.saboteur?.strength}
            detail={innerVoices.saboteur?.patterns?.length > 0
              ? innerVoices.saboteur.patterns[0]
              : "Patterns emerging..."}
            color="text-orange-400"
          />

          {/* Wise Self */}
          <VoiceCard
            emoji="✨"
            name="Wise Self"
            strength={innerVoices.wise_self?.access_frequency}
            detail={innerVoices.wise_self?.messages?.length > 0
              ? `"${innerVoices.wise_self.messages[0]}"`
              : "Cultivating connection..."}
            color="text-emerald-400"
          />
        </div>
      </motion.div>
    </div>
  );
}

function VoiceCard({ emoji, name, strength, detail, color }: {
  emoji: string; name: string; strength: number; detail: string; color: string;
}) {
  const val = Number(strength) || 0;
  return (
    <div className="glass-card rounded-xl p-3 flex items-start gap-3">
      <span className="text-xl">{emoji}</span>
      <div className="flex-1 space-y-1">
        <div className="flex justify-between items-center">
          <span className={`text-xs font-display font-medium ${color}`}>{name}</span>
          <span className="text-[9px] text-muted-foreground font-body">{val.toFixed(1)}/10</span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(3, val * 10)}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground font-body italic">{detail}</p>
      </div>
    </div>
  );
}
