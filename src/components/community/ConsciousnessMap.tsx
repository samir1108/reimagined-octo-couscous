import { motion } from "framer-motion";
import { Globe, TrendingUp } from "lucide-react";
import { useConsciousnessMap } from "@/hooks/useCommunity";

const tagEmojis: Record<string, string> = {
  fear: "😨", comparison: "⚖️", gratitude: "🙏", presence: "🧘",
  anxiety: "😰", anger: "🔥", joy: "✨", loneliness: "🌑",
  validation: "👁", attachment: "🔗", peace: "☮️", love: "💛",
  ego: "🪞", acceptance: "🌊", resistance: "🛡️", awareness: "👁‍🗨",
};

export default function ConsciousnessMap() {
  const { data: tags = [] } = useConsciousnessMap();
  const totalObservations = tags.reduce((sum, t) => sum + t.count, 0);

  return (
    <motion.div
      className="rounded-3xl glass-card p-6 md:p-8 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground tracking-tight">
              Collective Consciousness
            </h3>
            <p className="text-xs text-muted-foreground font-body">
              What the community is observing today
            </p>
          </div>
        </div>

        {tags.length === 0 ? (
          <p className="text-sm text-muted-foreground/60 font-body text-center py-8">
            No observations shared today yet. Be the first to share what you're noticing.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {tags.slice(0, 6).map((item, i) => {
                const maxCount = tags[0]?.count || 1;
                const pct = Math.round((item.count / maxCount) * 100);
                return (
                  <motion.div
                    key={item.tag}
                    className="glass-subtle rounded-xl p-3 relative overflow-hidden"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-primary/8 rounded-xl"
                      style={{ width: `${pct}%` }}
                    />
                    <div className="relative z-10 flex items-center gap-2">
                      <span className="text-lg">{tagEmojis[item.tag] || "🔵"}</span>
                      <div>
                        <p className="text-xs font-display font-semibold text-foreground capitalize">
                          {item.tag}
                        </p>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-primary/60" />
                          <span className="text-[10px] text-primary/70 font-display">{item.count}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <p className="text-[11px] text-muted-foreground/40 font-body text-center">
              {totalObservations} observations today — Human mind ka pattern same hai.
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
}
