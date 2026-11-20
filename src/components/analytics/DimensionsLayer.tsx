import { motion } from "framer-motion";
import { Reveal } from "@/components/animation/Reveal";
import { ProgressRing } from "./ProgressRing";
import { RadarChart } from "./RadarChart";
import type { ConsciousnessProfile, EnginePlan } from "@/hooks/useConsciousnessEngine";

const spring = { type: "spring", stiffness: 300, damping: 30 } as const;

const DIMS: { key: string; label: string; color: string; hsl: string; poetic: string }[] = [
  { key: "thought", label: "Thought", color: "hsl(210 80% 60%)", hsl: "210 80% 60%", poetic: "Clarity of mind, discernment, the inner philosopher" },
  { key: "emotion", label: "Emotion", color: "hsl(330 70% 60%)", hsl: "330 70% 60%", poetic: "Depth of feeling, empathy, the inner poet" },
  { key: "body", label: "Body", color: "hsl(150 60% 50%)", hsl: "150 60% 50%", poetic: "Grounded presence, vitality, the inner warrior" },
  { key: "awareness", label: "Awareness", color: "hsl(270 70% 60%)", hsl: "270 70% 60%", poetic: "The witness itself, pure seeing, the inner sage" },
];

interface Props {
  profile?: ConsciousnessProfile;
  plan?: EnginePlan;
}

export function DimensionsLayer({ profile, plan }: Props) {
  const bands = profile?.dimension_bands as unknown as Record<string, number> | undefined;
  const focusDim = plan?.focusDimension;

  const dimValues = DIMS.map(d => ({
    ...d,
    value: (bands?.[d.key] as number) ?? 0,
  }));

  const sorted = [...dimValues].sort((a, b) => b.value - a.value);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  return (
    <div className="space-y-6">
      {/* Title */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring}>
        <h2 className="text-lg font-display font-bold text-foreground">The Four Bodies</h2>
        <p className="text-sm text-muted-foreground font-body">Your inner landscape across thought, emotion, body, and awareness</p>
      </motion.div>

      {/* 4 Dimension Rings */}
      <div className="grid grid-cols-2 gap-4">
        {dimValues.map((d, i) => (
          <motion.div
            key={d.key}
            className={`glass-card rounded-2xl p-4 flex flex-col items-center gap-3 ${focusDim === d.key ? 'ring-1 ring-primary/30' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: i * 0.08 }}
          >
            <ProgressRing value={d.value} max={10} size={70} strokeWidth={5} color={d.color}>
              <span className="text-sm font-display font-bold text-foreground tabular-nums">{d.value.toFixed(1)}</span>
            </ProgressRing>
            <span className="text-xs font-display font-medium text-foreground">{d.label}</span>
            {focusDim === d.key && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-body">Current Focus</span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Radar Chart */}
      <Reveal className="glass-card rounded-2xl p-5 flex justify-center">
        <RadarChart
          points={dimValues.map(d => ({ label: d.label, value: d.value, color: d.color }))}
          size={220}
        />
      </Reveal>

      {/* Strongest vs Weakest */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          className="glass-card rounded-2xl p-4 space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...spring, delay: 0.4 }}
        >
          <span className="text-[10px] font-body uppercase tracking-wider text-muted-foreground">Strongest</span>
          <p className="text-base font-display font-bold" style={{ color: strongest?.color }}>{strongest?.label}</p>
          <p className="text-[10px] text-muted-foreground font-body italic">{strongest?.poetic}</p>
        </motion.div>
        <motion.div
          className="glass-card rounded-2xl p-4 space-y-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...spring, delay: 0.45 }}
        >
          <span className="text-[10px] font-body uppercase tracking-wider text-muted-foreground">Needs Attention</span>
          <p className="text-base font-display font-bold" style={{ color: weakest?.color }}>{weakest?.label}</p>
          <p className="text-[10px] text-muted-foreground font-body italic">{weakest?.poetic}</p>
        </motion.div>
      </div>
    </div>
  );
}
