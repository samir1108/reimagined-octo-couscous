import { motion } from "framer-motion";
import { Brain, Heart, Zap, Eye, ArrowRight } from "lucide-react";
import { Button } from "@/design-system";
import type { RevealData } from "./types";

interface Props {
  data: RevealData;
  onShowPractices: () => void;
}

const DIMENSION_ICONS = {
  mind: Brain,
  emotion: Heart,
  body: Zap,
  awareness: Eye,
};

const DIMENSION_LABELS: Record<string, string> = {
  mind: "Mind",
  emotion: "Emotion",
  body: "Body & Energy",
  awareness: "Awareness",
};

const MirrorReveal = ({ data, onShowPractices }: Props) => {
  return (
    <div className="h-full overflow-y-auto px-6 py-6 space-y-8">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-xs font-body text-primary/70 tracking-widest uppercase mb-2">
          Your Mirror Reading
        </p>
        <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-1">
          {data.band_name}
        </h3>
        <p className="text-sm font-body text-muted-foreground">
          Consciousness Band {data.v_band} of 8
        </p>
      </motion.div>

      {/* V-Level Band Indicator */}
      <motion.div
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${(data.v_band / 8) * 100}%` }}
            transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] font-body text-muted-foreground/30">Unconscious</span>
          <span className="text-[10px] font-body text-muted-foreground/30">Luminous</span>
        </div>
      </motion.div>

      {/* Witness Assessment */}
      <motion.div
        className="bg-primary/5 border border-primary/15 rounded-2xl px-5 py-4 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Eye className="w-3.5 h-3.5 text-primary/70" />
          <span className="text-xs font-body text-primary/70 uppercase tracking-wide">Witness Level</span>
        </div>
        <p className="text-sm font-body text-foreground/90 italic">
          "{data.witness_assessment}"
        </p>
      </motion.div>

      {/* Detected Loops */}
      <div className="space-y-3">
        <p className="text-xs font-body text-muted-foreground/50 uppercase tracking-wide">
          Unconscious Patterns Detected
        </p>
        {data.loops.map((loop, i) => (
          <motion.div
            key={loop.id}
            className="bg-card/80 border border-border/30 rounded-2xl px-5 py-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + i * 0.2, duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-primary/60">{loop.id}</span>
              <span className="text-sm font-display font-semibold text-foreground">{loop.name}</span>
            </div>
            <p className="text-sm font-body text-muted-foreground leading-relaxed">
              {loop.insight}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Dimension Bars */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
      >
        <p className="text-xs font-body text-muted-foreground/50 uppercase tracking-wide">
          Dimension Balance
        </p>
        {(Object.entries(data.dimensions) as [keyof typeof DIMENSION_ICONS, number][]).map(
          ([key, value], i) => {
            const Icon = DIMENSION_ICONS[key];
            return (
              <div key={key} className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                <span className="text-xs font-body text-muted-foreground w-20 shrink-0">
                  {DIMENSION_LABELS[key]}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-muted/20 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary/70"
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ delay: 1.5 + i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground/40 w-8 text-right">
                  {value}
                </span>
              </div>
            );
          }
        )}
      </motion.div>

      {/* Pattern Map */}
      <motion.div
        className="grid grid-cols-2 gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
      >
        {Object.entries(data.pattern_map).map(([key, insight]) => (
          <div
            key={key}
            className="bg-muted/10 border border-border/20 rounded-xl px-4 py-3"
          >
            <p className="text-[10px] font-body text-muted-foreground/40 uppercase tracking-wide mb-1">
              {key === "mind" ? "🧠 Mind" : key === "emotion" ? "💛 Emotion" : key === "energy" ? "⚡ Energy" : "🫁 Body"}
            </p>
            <p className="text-xs font-body text-foreground/70 leading-snug">{insight}</p>
          </div>
        ))}
      </motion.div>

      {/* CTA: Show Practices */}
      <motion.div
        className="text-center pt-2 pb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
      >
        <p className="text-xs font-body text-muted-foreground/40 mb-4">
          These patterns have dissolution paths — specific practices that rewire them.
        </p>
        <Button
          onClick={onShowPractices}
          size="lg"
          className="px-8 py-6 text-base font-display font-semibold rounded-2xl bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:shadow-[var(--shadow-glow)] transition-all duration-500"
        >
          Show My Daily Practices
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
};

export default MirrorReveal;
