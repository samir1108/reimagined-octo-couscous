import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { BREAKTHROUGH_TYPES } from "@/data/breakthroughs";

const rarityColors: Record<string, string> = {
  common: "text-muted-foreground border-border/30",
  uncommon: "text-chart-2 border-chart-2/30",
  rare: "text-chart-4 border-chart-4/30",
  epic: "text-purple-400 border-purple-400/30",
  legendary: "text-primary border-primary/30",
};

const rarityLabels: Record<string, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "✨ Legendary",
};

export default function BreakthroughsHistory() {
  const { data: breakthroughs } = useQuery({
    queryKey: ["user-breakthroughs"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", "milestone")
        .order("created_at", { ascending: false })
        .limit(50);
      return (data || []).filter((n: any) => {
        const meta = n.metadata as any;
        return meta?.breakthrough_id;
      });
    },
  });

  if (!breakthroughs || breakthroughs.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-3xl mb-2">🌱</p>
        <p className="text-sm text-muted-foreground font-body">No breakthroughs yet — keep practicing!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-display font-semibold text-foreground text-sm">Breakthroughs</h3>
      <p className="text-xs text-muted-foreground font-body mb-3">
        Consciousness shifts detected by AI ({breakthroughs.length} total)
      </p>
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        <AnimatePresence>
          {breakthroughs.map((b: any, i: number) => {
            const meta = b.metadata as any;
            const bt = BREAKTHROUGH_TYPES.find(t => t.id === meta.breakthrough_id);
            if (!bt) return null;
            const color = rarityColors[bt.rarity] || rarityColors.common;

            return (
              <motion.div
                key={b.id}
                className={`flex items-center gap-3 p-3 rounded-xl glass-subtle border ${color}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <span className="text-xl shrink-0">{bt.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-display font-medium text-foreground truncate">{bt.name}</p>
                  <p className="text-[10px] text-muted-foreground font-body">{bt.description}</p>
                </div>
                <span className={`text-[9px] font-display font-medium uppercase tracking-wider ${color}`}>
                  {rarityLabels[bt.rarity]}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
