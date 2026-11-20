import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, X } from "lucide-react";
import { Button } from "@/design-system";
import { WORKPLACE_LOOPS, WORKPLACE_LOOP_CATEGORIES, type WorkplaceLoop } from "@/data/workplaceLoops";
import { useLogWorkplaceLoop } from "@/hooks/useOrgIntelligence";
import { toast } from "sonner";

export default function WorkplaceLoopsLibrary({ orgId, teamId, department }: { orgId?: string; teamId?: string; department?: string }) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selected, setSelected] = useState<WorkplaceLoop | null>(null);
  const log = useLogWorkplaceLoop(orgId);

  const filtered = activeCategory === "all"
    ? WORKPLACE_LOOPS
    : WORKPLACE_LOOPS.filter((l) => l.category === activeCategory);

  const onLog = async (intensity: number) => {
    if (!selected) return;
    try {
      await log.mutateAsync({ loopId: selected.id, intensity, teamId, department });
      toast.success("Logged privately. Aggregated only at n≥5.");
      setSelected(null);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not log");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {[{ id: "all", label: "All" }, ...WORKPLACE_LOOP_CATEGORIES].map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-body border transition-all ${
              activeCategory === c.id
                ? "bg-primary/15 border-primary/40 text-primary"
                : "bg-muted/10 border-border/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((loop) => (
          <motion.button
            key={loop.id}
            onClick={() => setSelected(loop)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="text-left glass-card rounded-2xl p-4 border border-border/20 hover:border-primary/30 transition-all"
          >
            <div className="flex items-start gap-3">
              <Brain className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold text-foreground">{loop.name}</p>
                <p className="text-xs text-muted-foreground font-body mt-1 line-clamp-2">{loop.description}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="glass-card rounded-3xl p-6 border border-border/30 max-w-md w-full"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-body">Workplace Loop</p>
                  <h3 className="font-display text-xl font-bold text-foreground mt-1">{selected.name}</h3>
                </div>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground font-body">{selected.description}</p>
              <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-[11px] uppercase tracking-wider text-primary font-body mb-1">60s Practice</p>
                <p className="text-sm text-foreground font-body">{selected.micropractice}</p>
              </div>
              <p className="text-[11px] text-muted-foreground font-body mt-4 mb-2">How strong right now? (private — only aggregated at n≥5)</p>
              <div className="grid grid-cols-5 gap-2">
                {[1,2,3,4,5].map((n) => (
                  <Button key={n} size="sm" variant="outline" onClick={() => onLog(n)} disabled={log.isPending}>{n}</Button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
