import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { useLifeDomainScores } from "@/hooks/useSpiritualDNA";

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

const DOMAIN_EMOJIS: Record<string, string> = {
  relationship: "💛",
  work: "💼",
  finance: "💰",
  health: "🏃",
  creativity: "🎨",
  spirituality: "🪷",
};

const TREND_ICONS = {
  improving: { icon: TrendingUp, color: "text-green-500" },
  declining: { icon: TrendingDown, color: "text-destructive" },
  stable: { icon: Minus, color: "text-muted-foreground" },
};

export function LifeDomainPanel() {
  const { data: domains } = useLifeDomainScores();

  if (!domains || domains.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center">
        <p className="text-sm text-muted-foreground font-body">Life domains will appear as you engage more</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-display tracking-[0.2em] uppercase text-primary font-semibold flex items-center gap-2">
        <BarChart3 className="w-3.5 h-3.5" /> Life Domains
      </h3>

      <div className="space-y-2">
        {domains.map((d: any, i: number) => {
          const emoji = DOMAIN_EMOJIS[d.domain] || "🔹";
          const trend = TREND_ICONS[d.trend as keyof typeof TREND_ICONS] || TREND_ICONS.stable;
          const TrendIcon = trend.icon;
          const pct = Math.round((d.score / 10) * 100);

          return (
            <motion.div
              key={d.domain}
              className="glass-card rounded-xl p-3"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span>{emoji}</span>
                  <span className="text-sm font-display text-foreground capitalize">{d.domain}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendIcon className={`w-3.5 h-3.5 ${trend.color}`} />
                  <span className="text-sm font-display font-bold text-foreground">{d.score}</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-muted/20 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${d.trend === "declining" ? "bg-destructive/50" : "bg-primary/50"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                />
              </div>
              {d.stressors?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {d.stressors.slice(0, 3).map((s: string) => (
                    <span key={s} className="text-[9px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive/70 font-body">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
