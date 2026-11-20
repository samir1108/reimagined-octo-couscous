/**
 * DimensionPulse — NEW compact energy readout for Home.
 * Shows the 4 consciousness dimensions (thought / emotion / body / awareness)
 * as animated bars, marks the engine's focus dimension, and the witness level.
 * Pure frontend — reads engineData.profile.dimension_bands +
 * plan.dimensionBandLabels + plan.focusDimension (existing infra).
 */
import { motion } from "framer-motion";
import { Brain, Heart, Activity, Eye, Zap } from "lucide-react";

interface Props {
  profile: any;
  plan: any;
  gateColor: string;
}

const DIMENSIONS: Array<{ key: string; label: string; icon: React.ReactNode }> = [
  { key: "thought", label: "Thought", icon: <Brain className="h-3 w-3" /> },
  { key: "emotion", label: "Emotion", icon: <Heart className="h-3 w-3" /> },
  { key: "body", label: "Body", icon: <Activity className="h-3 w-3" /> },
  { key: "awareness", label: "Awareness", icon: <Eye className="h-3 w-3" /> },
];

const MAX_BAND = 8;

export default function DimensionPulse({ profile, plan, gateColor }: Props) {
  const bands = profile?.dimension_bands;
  if (!bands) return null;

  const labels = (plan?.dimensionBandLabels ?? {}) as Record<string, { level: number; name: string; icon: string }>;
  const focusDim = String(plan?.focusDimension || "").toLowerCase();

  // Weakest dimension — where today's practice lands hardest
  const entries = DIMENSIONS.map((d) => ({ ...d, value: Number(bands[d.key] ?? 0) }));
  const weakest = [...entries].sort((a, b) => a.value - b.value)[0];
  const witnessLevel = labels?.[focusDim]?.level ?? plan?.band ?? 0;
  const witnessName = labels?.[focusDim]?.name ?? plan?.bandName ?? "Awakening";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      className="relative rounded-2xl border border-border/30 bg-card/40 backdrop-blur-xl p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-[10px] font-display tracking-[0.18em] uppercase text-primary/70">
          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary/80">
            <Zap className="h-3.5 w-3.5" />
          </span>
          <span>Your Energy</span>
        </div>
        <p className="text-[9px] text-foreground/40 font-body italic">
          focus: <span className="text-foreground/60">{weakest?.label || "—"}</span>
        </p>
      </div>

      {/* Dimension bars */}
      <div className="space-y-2.5">
        {entries.map((dim, i) => {
          const value = dim.value;
          const pct = Math.min(100, (value / MAX_BAND) * 100);
          const isFocus = focusDim === dim.key || (!focusDim && weakest?.key === dim.key);
          const levelName = labels?.[dim.key]?.name;
          return (
            <div key={dim.key} className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center h-6 w-6 rounded-lg flex-shrink-0 ${
                  isFocus ? "bg-primary/20 text-primary" : "bg-muted/40 text-foreground/50"
                }`}
              >
                {dim.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-display tracking-wider uppercase text-foreground/55">
                    {dim.label}
                    {isFocus && <span className="ml-1.5 text-primary/70">· today</span>}
                  </span>
                  <span className="text-[9px] text-foreground/40 tabular-nums">
                    {value.toFixed(1)}{levelName ? ` · ${levelName}` : ""}
                  </span>
                </div>
                <div className="h-[3px] rounded-full bg-muted/40 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full"
                    style={{
                      background: isFocus
                        ? `hsl(${gateColor})`
                        : "hsl(var(--primary) / 0.35)",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Witness footer */}
      <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between text-[9px]">
        <span className="font-display tracking-[0.18em] uppercase text-muted-foreground/50">
          Witness · Level {witnessLevel}
        </span>
        <span className="font-body italic text-foreground/45">{witnessName}</span>
      </div>
    </motion.div>
  );
}