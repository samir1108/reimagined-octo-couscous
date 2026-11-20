import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, X, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

/**
 * CURIOSITY HISTORY DRAWER (Batch 11)
 * Shows past curious-engine Q&A and skip stats.
 */

interface AnswerEntry {
  key?: string;
  question?: string;
  answer?: string;
  answered_at?: string;
  skipped?: boolean;
}

interface CuriosityRow {
  total_questions_asked: number;
  total_questions_answered: number;
  total_questions_skipped: number;
  answer_history: AnswerEntry[] | null;
  confidence_scores: Record<string, number> | null;
  cooldown_until: string | null;
}

export default function CuriosityHistoryDrawer() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<CuriosityRow | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: row } = await supabase
        .from("curiosity_queue")
        .select("total_questions_asked,total_questions_answered,total_questions_skipped,answer_history,confidence_scores,cooldown_until")
        .eq("user_id", user.id)
        .maybeSingle();
      if (row) setData(row as unknown as CuriosityRow);
    })();
  }, [open]);

  const history = (data?.answer_history ?? []).filter(Boolean).slice(-30).reverse();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="glass-card rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-display text-muted-foreground hover:text-foreground transition-colors"
      >
        <History className="w-3.5 h-3.5" />
        Curiosity History
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="glass-card rounded-2xl p-5 w-full max-w-lg max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display font-semibold text-foreground">Curiosity Loop</h3>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {data && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <Stat label="Asked" value={data.total_questions_asked} />
                  <Stat label="Answered" value={data.total_questions_answered} />
                  <Stat label="Skipped" value={data.total_questions_skipped} />
                </div>
              )}

              {data?.cooldown_until && new Date(data.cooldown_until) > new Date() && (
                <p className="text-[10px] text-muted-foreground/70 font-body mb-3 italic">
                  Next question available {new Date(data.cooldown_until).toLocaleString()}
                </p>
              )}

              <div className="space-y-2">
                {history.length === 0 && (
                  <p className="text-sm text-muted-foreground font-body text-center py-8">
                    No history yet. Answer a question to begin.
                  </p>
                )}
                {history.map((h, i) => (
                  <div key={i} className="rounded-xl border border-border/20 bg-muted/20 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground/60 mb-1 flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {h.skipped ? "Skipped" : (h.key ?? "Question")}
                    </p>
                    {h.question && <p className="text-sm font-display text-foreground mb-1">{h.question}</p>}
                    {h.answer && <p className="text-xs font-body text-muted-foreground italic">"{h.answer}"</p>}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-muted/30 p-3 text-center">
      <p className="text-2xl font-display font-bold text-foreground">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
