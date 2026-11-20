import { motion } from "framer-motion";
import { Sun, CloudSun, Moon, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/design-system";
import type { RevealData } from "./types";
import { BrandName } from "@/components/BrandName";

interface Props {
  data: RevealData;
}

const TIME_ICONS: Record<string, typeof Sun> = {
  Morning: Sun,
  Midday: CloudSun,
  Evening: Moon,
};

const TIME_COLORS: Record<string, string> = {
  Morning: "text-amber-400",
  Midday: "text-orange-400",
  Evening: "text-indigo-400",
};

const MirrorPractices = ({ data }: Props) => {
  const loopMap = Object.fromEntries(data.loops.map((l) => [l.id, l.name]));

  return (
    <div className="h-full overflow-y-auto px-6 py-6 space-y-6">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-xs font-body text-primary/70 tracking-widest uppercase mb-2">
          Your Prescription
        </p>
        <h3 className="text-2xl font-display font-bold text-foreground mb-2">
          Daily Micro-Practices
        </h3>
        <p className="text-sm font-body text-muted-foreground max-w-sm mx-auto">
          Specific practices to dissolve your detected patterns.
          This is what your Day 1 on <BrandName /> would look like.
        </p>
      </motion.div>

      {/* Practice Cards */}
      <div className="space-y-4">
        {data.practices.map((practice, i) => {
          const Icon = TIME_ICONS[practice.time_of_day] || Sun;
          const colorClass = TIME_COLORS[practice.time_of_day] || "text-primary";
          const targetName = loopMap[practice.loop_target] || practice.loop_target;

          return (
            <motion.div
              key={i}
              className="bg-card/80 border border-border/30 rounded-2xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.2, duration: 0.5 }}
            >
              {/* Time & Duration */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${colorClass}`} />
                  <span className="text-xs font-display font-semibold text-foreground uppercase tracking-wide">
                    {practice.time_of_day}
                  </span>
                </div>
                <span className="text-xs font-body text-muted-foreground/50 bg-muted/20 px-2.5 py-1 rounded-full">
                  {practice.duration}
                </span>
              </div>

              {/* Title */}
              <h4 className="text-base font-display font-semibold text-foreground mb-2">
                {practice.title}
              </h4>

              {/* Description */}
              <p className="text-sm font-body text-muted-foreground leading-relaxed mb-3">
                {practice.description}
              </p>

              {/* Loop target */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-body text-primary/50">Targets:</span>
                <span className="text-[10px] font-mono text-primary/70 bg-primary/5 px-2 py-0.5 rounded-full">
                  {targetName}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Band context */}
      <motion.div
        className="bg-primary/5 border border-primary/15 rounded-2xl px-5 py-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-sm font-body text-foreground/90 mb-1">
          You're at <strong className="text-primary">Band {data.v_band}</strong> — {data.band_name}
        </p>
        <p className="text-xs font-body text-muted-foreground/60">
          Users who started here typically reach Band {Math.min(data.v_band + 2, 8)} within 60 days.
        </p>
      </motion.div>

      {/* Final CTA */}
      <motion.div
        className="text-center pb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
      >
        <Button
          asChild
          size="lg"
          className="px-10 py-7 text-base font-display font-semibold rounded-2xl bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:shadow-[var(--shadow-glow-strong)] transition-all duration-500"
        >
          <a href="/auth">
            <Sparkles className="w-5 h-5 mr-2" />
            Begin Your Journey — Free
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </Button>
        <p className="text-[10px] font-body text-muted-foreground/30 mt-3">
          ₹11 free credits included • No card required
        </p>
      </motion.div>
    </div>
  );
};

export default MirrorPractices;
