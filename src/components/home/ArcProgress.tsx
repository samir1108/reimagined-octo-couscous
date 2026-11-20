import { motion } from "framer-motion";
import { BookOpen, Crown, Sparkles } from "lucide-react";

interface Props {
  theme: any;
  arc: any;
  gateColor: string;
}

export default function ArcProgress({ theme, arc, gateColor }: Props) {
  const t = theme as any;
  const a = arc as any;

  if (!t && !a) return null;

  const sequenceNo = t?.sequence_no ?? 1;
  const maxDepth = t?.max_depth ?? 5;
  const currentDepth = t?.current_depth ?? 0;
  const arcDay = a?.current_day ?? 1;
  const arcPhase = a?.current_phase ?? "opening";
  const arcTitle = a?.title ?? "Current Arc";

  const phaseLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    opening: { label: "Opening", icon: <Sparkles className="h-3 w-3" /> },
    deepening: { label: "Deepening", icon: <BookOpen className="h-3 w-3" /> },
    harvest: { label: "Harvest", icon: <Crown className="h-3 w-3" /> },
    rest: { label: "Rest", icon: <Sparkles className="h-3 w-3" /> },
    breakthrough: { label: "Breakthrough", icon: <Crown className="h-3 w-3" /> },
    completed: { label: "Completed", icon: <Crown className="h-3 w-3" /> },
  };

  const phaseInfo = phaseLabels[arcPhase] || phaseLabels.opening;
  const progress = maxDepth > 0 ? Math.min(100, (currentDepth / maxDepth) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      className="relative rounded-2xl border border-border/30 bg-card/40 backdrop-blur-xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary/80">
            {phaseInfo.icon}
          </div>
          <div>
            <p className="text-[10px] font-display tracking-[0.18em] uppercase text-muted-foreground/50">Arc Progress</p>
            <p className="text-sm font-medium text-foreground/90">{arcTitle}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-display tracking-[0.18em] uppercase text-primary/70">
            {phaseInfo.label}
          </p>
          <p className="text-[11px] font-mono text-foreground/50">
            Day {arcDay} · Thread {sequenceNo} / {maxDepth}
          </p>
        </div>
      </div>

      <div className="h-[4px] rounded-full bg-card/40 overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full relative"
          style={{ background: `linear-gradient(90deg, hsl(${gateColor} / 0.3), hsl(${gateColor}), hsl(${gateColor} / 0.3))` }}
        >
          {/* Thread markers */}
          {Array.from({ length: maxDepth }, (_, i) => i + 1).map((d) => (
            <motion.div
              key={d}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + d * 0.08, duration: 0.3 }}
              className="absolute top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full bg-background border-2 border-primary/60"
              style={{
                left: `${Math.min(100, (d / maxDepth) * 100)}%`,
                transform: `translate(-50%, -50%)`,
                boxShadow: d <= currentDepth ? `0 0 8px hsl(${gateColor})` : "none",
                background: d <= currentDepth ? `hsl(${gateColor})` : "transparent",
              }}
            />
          ))}
        </motion.div>

        {/* Current position glow */}
        <motion.div
          animate={{
            boxShadow: [`0 0 12px hsl(${gateColor} / 0.6)`, `0 0 24px hsl(${gateColor} / 0.3)`, `0 0 12px hsl(${gateColor} / 0.6)`],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 -translate-y-1/2 w-[12px] h-[12px] rounded-full -translate-x-1/2 pointer-events-none"
          style={{
            left: `${progress}%`,
            background: `hsl(${gateColor})`,
            opacity: 0.8,
          }}
        />
      </div>

      {/* Depth labels */}
      <div className="flex justify-between mt-2 text-[9px] text-muted-foreground/50 font-display tracking-wider uppercase">
        <span>Start</span>
        <span>Depth {currentDepth}</span>
        <span>Complete</span>
      </div>
    </motion.div>
  );
}