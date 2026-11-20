import { motion } from "framer-motion";
import { Dna, Brain, Clock, Heart, Compass, TreePine, Sparkles } from "lucide-react";
import { useSpiritualDNA, APP_RELATIONSHIP_PHASES, LIFE_STAGE_FOCUS } from "@/hooks/useSpiritualDNA";
import { useSpeedProfile } from "@/hooks/usePracticeMatrix";

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

const BRAIN_ICONS: Record<string, { icon: typeof Brain; label: string }> = {
  head: { icon: Brain, label: "Head Dominant" },
  heart: { icon: Heart, label: "Heart Dominant" },
  gut: { icon: Compass, label: "Gut Dominant" },
  balanced: { icon: Sparkles, label: "Balanced" },
};

export function SpiritualDNAPanel() {
  const { data: dna } = useSpiritualDNA();
  const { data: speed } = useSpeedProfile();

  if (!dna) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center">
        <p className="text-sm text-muted-foreground font-body">Complete onboarding to see your Spiritual DNA</p>
      </div>
    );
  }

  const brainInfo = BRAIN_ICONS[dna.brain_dominance] || BRAIN_ICONS.balanced;
  const BrainIcon = brainInfo.icon;
  const relationshipPhase = APP_RELATIONSHIP_PHASES[dna.app_relationship_phase];
  const lifeStageInfo = LIFE_STAGE_FOCUS[dna.life_stage];

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-display tracking-[0.2em] uppercase text-primary font-semibold flex items-center gap-2">
        <Dna className="w-3.5 h-3.5" /> Spiritual DNA
      </h3>

      {/* Core paths */}
      <div className="grid grid-cols-2 gap-2">
        <div className="glass-card rounded-xl p-3">
          <p className="text-[9px] text-muted-foreground/60 font-display uppercase tracking-wider mb-1">Anchor Path</p>
          <p className="text-sm font-display font-semibold text-foreground capitalize">{dna.anchor_path}</p>
          <p className="text-[10px] text-primary/60 font-body">Your strongest</p>
        </div>
        <div className="glass-card rounded-xl p-3">
          <p className="text-[9px] text-muted-foreground/60 font-display uppercase tracking-wider mb-1">Growth Path</p>
          <p className="text-sm font-display font-semibold text-foreground capitalize">{dna.growth_path}</p>
          <p className="text-[10px] text-primary/60 font-body">Your edge</p>
        </div>
      </div>

      {/* Brain + Life Stage + Speed */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-card rounded-xl p-3 text-center">
          <BrainIcon className="w-5 h-5 mx-auto mb-1 text-primary/70" />
          <p className="text-[10px] font-display text-foreground">{brainInfo.label}</p>
          <p className="text-[8px] text-muted-foreground/50 font-display uppercase">3-Brain</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <TreePine className="w-5 h-5 mx-auto mb-1 text-primary/70" />
          <p className="text-[10px] font-display text-foreground capitalize">{dna.life_stage}</p>
          <p className="text-[8px] text-muted-foreground/50 font-display uppercase">Life Stage</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <Clock className="w-5 h-5 mx-auto mb-1 text-primary/70" />
          <p className="text-[10px] font-display text-foreground capitalize">{speed?.speed_type || "steady"}</p>
          <p className="text-[8px] text-muted-foreground/50 font-display uppercase">Speed</p>
        </div>
      </div>

      {/* App Relationship Phase */}
      {relationshipPhase && (
        <div className="glass-card rounded-xl p-3">
          <p className="text-[9px] text-muted-foreground/60 font-display uppercase tracking-wider mb-1">
            App Relationship · Day {dna.app_relationship_day}
          </p>
          <p className="text-sm font-display font-semibold text-foreground">{relationshipPhase.label}</p>
          <p className="text-[11px] text-muted-foreground font-body">{relationshipPhase.description}</p>
        </div>
      )}

      {/* Life Stage Focus */}
      {lifeStageInfo && dna.life_stage !== "unknown" && (
        <div className="glass-card rounded-xl p-3">
          <p className="text-[9px] text-muted-foreground/60 font-display uppercase tracking-wider mb-1">
            Content Focus ({dna.life_stage})
          </p>
          <p className="text-[11px] text-foreground/80 font-body">{lifeStageInfo.contentFocus}</p>
          <p className="text-[10px] text-primary/60 font-body mt-1">Tone: {lifeStageInfo.guruTone}</p>
        </div>
      )}

      {/* Lifetime Phase */}
      <div className="glass-card rounded-xl p-3">
        <p className="text-[9px] text-muted-foreground/60 font-display uppercase tracking-wider mb-1">
          Lifetime Phase · Day {dna.lifetime_phase_day}
        </p>
        <p className="text-sm font-display font-semibold text-foreground capitalize">{dna.lifetime_phase}</p>
        <p className="text-[10px] text-muted-foreground/60 font-body">
          Identity Band: {dna.identity_band_name} ({dna.identity_band})
        </p>
      </div>

      {/* Guru Resonance */}
      {dna.guru_resonance && Object.keys(dna.guru_resonance).length > 0 && (
        <div className="glass-card rounded-xl p-3">
          <p className="text-[9px] text-muted-foreground/60 font-display uppercase tracking-wider mb-2">
            Guru Resonance ({dna.total_gurus_encountered} masters)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(dna.guru_resonance)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .slice(0, 6)
              .map(([guru, score]) => (
                <span key={guru} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-display capitalize">
                  {guru.replace(/_/g, " ")} · {Math.round((score as number) * 100)}%
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
