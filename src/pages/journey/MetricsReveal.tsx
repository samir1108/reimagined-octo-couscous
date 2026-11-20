/**
 * MetricsReveal — animated dashboard showing the 25 computed metrics
 * after the cinematic journey completes.
 *
 * Layout:
 *  - Hero section with overall band + V-Level
 *  - Grid of metric cards with animated counters
 *  - Continue button to personalization phase
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Activity, Brain, Zap, Shield, Heart } from "lucide-react";
import type { ComputedMetrics } from "@/machines/journeyMachine";

interface MetricsRevealProps {
  metrics: ComputedMetrics;
  onContinue: () => void;
}

const DIMENSION_ICONS: Record<string, string> = {
  thought: "🧠",
  emotion: "💙",
  body: "🏃",
  awareness: "👁️",
};

const DIMENSION_LABELS: Record<string, string> = {
  thought: "Thought",
  emotion: "Emotion",
  body: "Body",
  awareness: "Awareness",
};

export default function MetricsReveal({ metrics, onContinue }: MetricsRevealProps) {
  const [revealed, setRevealed] = useState(false);

  // Trigger reveal sequence on mount
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 500);
    return () => clearTimeout(t);
  }, []);

  const MetricCard = ({
    label,
    value,
    max = 10,
    delay = 0,
    color = "text-white/70",
    barColor = "bg-gradient-to-r from-indigo-400 to-purple-400",
    size = "md",
  }: {
    label: string;
    value: number;
    max?: number;
    delay?: number;
    color?: string;
    barColor?: string;
    size?: "sm" | "md";
  }) => {
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    return (
      <motion.div
        className="space-y-1.5"
        initial={{ opacity: 0, y: 10 }}
        animate={revealed ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay }}
      >
        <div className="flex justify-between items-baseline">
          <span className="text-white/40 text-[11px] font-body uppercase tracking-wider">{label}</span>
          <span className={`font-display font-bold ${color} ${size === "md" ? "text-lg" : "text-sm"}`}>
            {value.toFixed(1)}
          </span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${barColor}`}
            initial={{ width: 0 }}
            animate={revealed ? { width: `${pct}%` } : {}}
            transition={{ duration: 1.2, delay: delay + 0.3, ease: "easeOut" }}
          />
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      className="absolute inset-0 z-50 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Hero */}
        <motion.div
          className="text-center space-y-4 pt-8"
          initial={{ opacity: 0, y: 30 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
        >
          <span className="text-indigo-300/70 text-xs tracking-[0.4em] uppercase font-body">
            Your Metrics
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
            {metrics.overallBand.toFixed(1)}
          </h1>
          <p className="text-white/50 font-body text-sm">Overall Band</p>
        </motion.div>

        {/* V-Level + Integration */}
        <motion.div
          className="grid grid-cols-3 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <MetricCard label="V-Level Base" value={metrics.vLevelBaseline} delay={0.4} />
          <MetricCard label="V-Level Now" value={metrics.vLevelCurrent} delay={0.5} />
          <MetricCard label="Integration" value={metrics.integrationScore} delay={0.6} />
        </motion.div>

        {/* Dimensions */}
        <motion.div
          className="glass-card rounded-2xl p-5 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h3 className="text-white/70 text-xs font-body tracking-wider uppercase flex items-center gap-2">
            <Brain className="w-3.5 h-3.5" /> Dimensions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {(Object.keys(metrics.dimensionBands) as Array<keyof typeof metrics.dimensionBands>)
              .filter((d) => metrics.dimensionBands[d] !== undefined)
              .map((dim, i) => (
                <MetricCard
                  key={dim}
                  label={`${DIMENSION_LABELS[dim] || dim}`}
                  value={metrics.dimensionBands[dim]}
                  delay={0.7 + i * 0.1}
                  color="text-white/80"
                  barColor={
                    dim === "thought" ? "bg-gradient-to-r from-blue-400 to-cyan-400"
                    : dim === "emotion" ? "bg-gradient-to-r from-pink-400 to-rose-400"
                    : dim === "body" ? "bg-gradient-to-r from-emerald-400 to-green-400"
                    : "bg-gradient-to-r from-amber-400 to-orange-400"
                  }
                />
              ))}
          </div>
        </motion.div>

        {/* Witness */}
        <motion.div
          className="glass-card rounded-2xl p-5 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <h3 className="text-white/70 text-xs font-body tracking-wider uppercase flex items-center gap-2">
            <Eye className="w-3.5 h-3.5" /> Witness Quality
          </h3>
          <MetricCard label="Witness Gap" value={metrics.witnessGap} delay={0.9} color="text-amber-300" />
          <MetricCard label="Witness Stability" value={metrics.witnessStability} delay={1.0} color="text-emerald-300" />
          <MetricCard label="Witness Depth" value={metrics.witnessDepth} delay={1.1} color="text-cyan-300" />
        </motion.div>

        {/* Paths + Archetype */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="glass-card rounded-2xl p-5 space-y-2">
            <h3 className="text-white/70 text-xs font-body tracking-wider uppercase flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" /> Primary Path
            </h3>
            <p className="text-white font-display font-bold text-xl capitalize">{metrics.primaryPath}</p>
            <p className="text-white/40 text-xs font-body capitalize">+ {metrics.secondaryPath}</p>
          </div>
          <div className="glass-card rounded-2xl p-5 space-y-2">
            <h3 className="text-white/70 text-xs font-body tracking-wider uppercase flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" /> Archetype
            </h3>
            <p className="text-white font-display font-bold text-xl capitalize">{metrics.archetypePrimary}</p>
            <p className="text-white/40 text-xs font-body capitalize">shadow: {metrics.archetypeShadow}</p>
          </div>
        </motion.div>

        {/* Emotional + Somatic */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <MetricCard label="Emotional Maturity" value={metrics.emotionMaturity} delay={1.1} />
          <MetricCard label="Somatic Awareness" value={metrics.somaticAwareness} delay={1.2} />
        </motion.div>

        {/* Purpose + Critic + Shadow */}
        <motion.div
          className="grid grid-cols-3 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <MetricCard label="Purpose Clarity" value={metrics.purposeClarity} delay={1.3} />
          <MetricCard label="Inner Critic" value={metrics.criticVolume} delay={1.4} color="text-red-300" />
          <MetricCard label="Shadow Owned" value={metrics.shadowOwned} delay={1.5} color="text-purple-300" />
        </motion.div>

        {/* Chitta-Vritti + Belief + Circadian */}
        <motion.div
          className="grid grid-cols-3 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <MetricCard label="Chitta-Vritti" value={metrics.chittaVritti} delay={1.6} />
          <div className="glass-card rounded-2xl p-4 flex flex-col justify-center">
            <span className="text-white/40 text-[10px] uppercase tracking-wider">Belief Level</span>
            <span className="text-white font-display font-bold capitalize text-sm">{metrics.beliefLevel}</span>
          </div>
          <div className="glass-card rounded-2xl p-4 flex flex-col justify-center">
            <span className="text-white/40 text-[10px] uppercase tracking-wider">Circadian Peak</span>
            <span className="text-white font-display font-bold capitalize text-sm">{metrics.circadianPeak}</span>
          </div>
        </motion.div>

        {/* Loops */}
        {metrics.topLoops.length > 0 && (
          <motion.div
            className="glass-card rounded-2xl p-5 space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={revealed ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <h3 className="text-white/70 text-xs font-body tracking-wider uppercase flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> Top Loops Detected
            </h3>
            <div className="flex flex-wrap gap-2">
              {metrics.topLoops.map((loop) => (
                <span
                  key={loop}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs font-body"
                >
                  {loop}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* H-Capacities */}
        {Object.keys(metrics.hCapacities).length > 0 && (
          <motion.div
            className="glass-card rounded-2xl p-5 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={revealed ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.3 }}
          >
            <h3 className="text-white/70 text-xs font-body tracking-wider uppercase">H-Capacities</h3>
            {Object.entries(metrics.hCapacities).map(([k, v], i) => (
              <MetricCard
                key={k}
                label={k.replace(/_/g, " ")}
                value={v}
                delay={1.4 + i * 0.1}
                color="text-amber-200"
              />
            ))}
          </motion.div>
        )}

        {/* Continue */}
        <motion.div
          className="pt-4 pb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <button
            onClick={onContinue}
            className="group flex items-center gap-2 mx-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all"
          >
            <span className="font-display text-white/80 text-sm">Continue — Personalise</span>
            <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

function Eye({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}
