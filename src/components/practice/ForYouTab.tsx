import { motion } from "framer-motion";
import { Loader2, Sparkles, Clock } from "lucide-react";
import { TASK_DOMAINS } from "@/data/taskDomains";
import { useForYouPractices, type ForYouPractice } from "@/hooks/useForYouPractices";

const domainLabel = (id: string) =>
  TASK_DOMAINS.find((d) => d.id === id)?.label ?? id.replace(/_/g, " ");

export default function ForYouTab() {
  const { data, isLoading } = useForYouPractices();
  const practices: ForYouPractice[] = data?.practices ?? [];
  const goal = data?.goal ?? null;

  // Only show loading state if no cached data at all
  if (isLoading && !data) {
    return (
      <div className="rounded-2xl border border-border/30 bg-card/30 p-12 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span className="ml-3 text-sm font-body text-muted-foreground">
          Composing practices for your domains…
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="px-1">
        <p className="text-[10px] font-display tracking-[0.25em] uppercase text-primary/80 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" /> For You
        </p>
        <p className="text-xs font-body text-muted-foreground mt-1">
          Drawn from your chosen domains{goal ? ` · aligned with ${goal}` : ""}
        </p>
      </div>

      {practices.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-2xl border border-border/30 bg-card/40 p-4 hover:border-primary/30 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl shrink-0">{p.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-display tracking-[0.18em] uppercase text-primary/70">
                  {domainLabel(p.domain)}
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Clock className="w-3 h-3" /> {p.duration_min}m
                </span>
              </div>
              <h4 className="font-display text-sm text-foreground leading-snug">
                {p.title}
              </h4>
              <p className="text-xs text-muted-foreground font-body mt-1 leading-relaxed">
                {p.why}
              </p>
            </div>
          </div>
        </motion.div>
      ))}

      {practices.length === 0 && !isLoading && (
        <p className="text-center text-sm text-muted-foreground py-12">
          No practices yet. Pick your domains in Settings to personalize this.
        </p>
      )}
    </div>
  );
}
