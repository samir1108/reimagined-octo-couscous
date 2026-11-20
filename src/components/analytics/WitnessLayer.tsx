import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { ProgressRing } from "./ProgressRing";
import type { ConsciousnessProfile } from "@/hooks/useConsciousnessEngine";

const spring = { type: "spring", stiffness: 300, damping: 30 } as const;

const CHITTA_VRITTI: Record<string, { label: string; description: string; color: string }> = {
  mudha: { label: "Mūḍha", description: "Dull, inert — the mind is heavy, clouded. The first step is simply noticing.", color: "hsl(0 30% 50%)" },
  kshipta: { label: "Kṣipta", description: "Scattered, restless — the monkey mind. Energy without direction.", color: "hsl(30 70% 55%)" },
  vikshipta: { label: "Vikṣipta", description: "Occasionally focused — glimpses of clarity between distraction.", color: "hsl(43 96% 56%)" },
  ekagra: { label: "Ekāgra", description: "One-pointed — deep concentration, the witness steady and unwavering.", color: "hsl(150 60% 50%)" },
  niruddha: { label: "Niruddha", description: "Completely stilled — thoughts cease, pure awareness remains.", color: "hsl(270 70% 60%)" },
};

interface Props {
  profile?: ConsciousnessProfile;
}

export function WitnessLayer({ profile }: Props) {
  const witnessGap = profile?.witness_gap ?? 0;
  const witnessStability = profile?.witness_stability ?? 0;
  const witnessDepth = profile?.witness_depth ?? 0;
  const chitVrit = profile?.chitta_vritti || "vikshipta";
  const cvConfig = CHITTA_VRITTI[chitVrit] || CHITTA_VRITTI.vikshipta;

  // Flame size based on average witness quality
  const witnessQuality = (witnessGap + witnessStability + witnessDepth) / 3;
  const flameScale = 0.5 + (witnessQuality / 10) * 1.5;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring}>
        <h2 className="text-lg font-display font-bold text-foreground">The Observer</h2>
        <p className="text-sm text-muted-foreground font-body">The quality of your witnessing consciousness</p>
      </motion.div>

      {/* Witness Flame */}
      <motion.div
        className="glass-card rounded-2xl p-8 flex flex-col items-center gap-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...spring, delay: 0.05 }}
      >
        <motion.div
          className="relative"
          animate={{
            scale: [flameScale, flameScale * 1.08, flameScale],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="text-6xl" style={{ filter: `drop-shadow(0 0 ${witnessQuality * 3}px hsl(var(--primary) / 0.5))` }}>
            🔥
          </div>
        </motion.div>
        <div className="text-center space-y-1">
          <p className="text-sm font-display font-semibold text-foreground">Witness Quality</p>
          <p className="text-2xl font-display font-bold text-primary">{witnessQuality.toFixed(1)}<span className="text-sm text-muted-foreground">/10</span></p>
        </div>
      </motion.div>

      {/* 3 Metrics */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Gap", value: witnessGap, desc: "Space between stimulus & reaction" },
          { label: "Stability", value: witnessStability, desc: "Consistency over time" },
          { label: "Depth", value: witnessDepth, desc: "How deep the seeing goes" },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.15 + i * 0.08 }}
          >
            <ProgressRing value={m.value} max={10} size={56} strokeWidth={4}>
              <span className="text-xs font-display font-bold text-foreground">{m.value.toFixed(1)}</span>
            </ProgressRing>
            <span className="text-[10px] font-display font-medium text-foreground">{m.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Chitta Vritti State */}
      <motion.div
        className="glass-card rounded-2xl p-5 space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.35 }}
      >
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground text-sm">Mental Fluctuation State</h3>
        </div>

        {/* State progression */}
        <div className="flex gap-1">
          {Object.entries(CHITTA_VRITTI).map(([key, conf]) => (
            <div
              key={key}
              className={`flex-1 h-2 rounded-full transition-all ${key === chitVrit ? 'opacity-100' : 'opacity-20'}`}
              style={{ backgroundColor: conf.color }}
            />
          ))}
        </div>

        <div className="space-y-1">
          <p className="text-base font-display font-bold" style={{ color: cvConfig.color }}>{cvConfig.label}</p>
          <p className="text-xs text-muted-foreground font-body italic">{cvConfig.description}</p>
        </div>
      </motion.div>
    </div>
  );
}
