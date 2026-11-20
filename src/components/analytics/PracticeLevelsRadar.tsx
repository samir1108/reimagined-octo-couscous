import { motion } from "framer-motion";
import { usePracticeLevels } from "@/hooks/usePracticeMatrix";

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

const PRACTICES = [
  { key: "observation", label: "Observe", max: 7 },
  { key: "self_inquiry", label: "Inquiry", max: 6 },
  { key: "breath", label: "Breath", max: 5 },
  { key: "witnessing", label: "Witness", max: 5 },
  { key: "body", label: "Body", max: 5 },
  { key: "bhakti", label: "Bhakti", max: 5 },
  { key: "karma", label: "Karma", max: 5 },
  { key: "jnana", label: "Jnana", max: 5 },
  { key: "raja", label: "Raja", max: 5 },
  { key: "kriya", label: "Kriya", max: 5 },
  { key: "tantra", label: "Tantra", max: 5 },
  { key: "neuroscience", label: "Neuro", max: 5 },
];

export function PracticeLevelsRadar() {
  const { data: levels } = usePracticeLevels();

  if (!levels) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center">
        <p className="text-sm text-muted-foreground font-body">No practice data yet. Complete your first session!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-display tracking-[0.2em] uppercase text-primary font-semibold">
        Practice Levels (12 Skills)
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {PRACTICES.map((p, i) => {
          const level = (levels as any)[p.key] || 0;
          const pct = Math.round((level / p.max) * 100);
          const isCore = ["observation", "self_inquiry", "breath", "witnessing", "body"].includes(p.key);

          return (
            <motion.div
              key={p.key}
              className={`p-3 rounded-xl ${isCore ? "bg-primary/5 border border-primary/10" : "bg-muted/10 border border-border/10"}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-display text-foreground">{p.label}</span>
                <span className={`text-[10px] font-display font-bold ${isCore ? "text-primary" : "text-muted-foreground"}`}>
                  L{level}/{p.max}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted/20 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${isCore ? "bg-primary/60" : "bg-muted-foreground/30"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, delay: i * 0.03 }}
                />
              </div>
              {isCore && (
                <p className="text-[8px] text-primary/50 font-display mt-1 uppercase tracking-wider">Core</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
