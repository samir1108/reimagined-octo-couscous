import { useEffect, useState } from "react";
import { Sparkles, Eye, History, Compass, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AnimatePresence, motion } from "framer-motion";

interface Insight {
  why?: string;
  active_loops?: Array<{ loop_id: string; loop_name?: string; evidence?: string }>;
  past_echoes?: Array<{ when?: string; what?: string }>;
  next_move?: string;
}

interface Props {
  /** Conversation snapshot at the moment the assistant finished its reply. */
  messages: Array<{ role: string; content: string }>;
  /** Unique key per assistant turn — prevents re-fetch on re-renders. */
  turnKey: string | number;
}

/**
 * GuideInsightCard — the "curious mirror" panel that appears under each
 * assistant reply. Explains *why* the user may be saying what they're
 * saying, surfaces active loops, and offers a soft forward-looking nudge.
 * Collapsed by default to keep the chat clean.
 */
export function GuideInsightCard({ messages, turnKey }: Props) {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setInsight(null);
    setError(null);
    setOpen(false);

    // Only fetch if user has spoken in this turn
    const hasUser = messages.some((m) => m.role === "user");
    if (!hasUser) return;

    setLoading(true);
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("guide-insight", {
          body: { messages: messages.slice(-8) },
        });
        if (cancelled) return;
        if (error) {
          setError("quiet");
          return;
        }
        const ins = (data as any)?.insight as Insight | null;
        if (ins && (ins.why || (ins.active_loops?.length ?? 0) > 0 || ins.next_move)) {
          setInsight(ins);
        }
      } catch {
        if (!cancelled) setError("quiet");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnKey]);

  if (loading || error || !insight) {
    if (loading) {
      return (
        <button
          disabled
          className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground/70"
        >
          <Sparkles className="w-3 h-3 animate-pulse" />
          reading between the lines…
        </button>
      );
    }
    return null;
  }

  return (
    <div className="mt-2 max-w-[85%]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-[11.5px] text-primary/80 hover:text-primary transition-colors"
      >
        <Sparkles className="w-3 h-3" />
        Why am I saying this?
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-2xl border border-primary/20 bg-primary/5 px-3.5 py-3 space-y-3">
              {insight.why && (
                <div className="flex gap-2">
                  <Eye className="w-3.5 h-3.5 text-primary/80 mt-0.5 flex-shrink-0" />
                  <p className="text-[12.5px] leading-relaxed text-foreground/90">{insight.why}</p>
                </div>
              )}

              {!!insight.active_loops?.length && (
                <div className="flex gap-2">
                  <Compass className="w-3.5 h-3.5 text-violet-400/90 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground/80">
                      Loops you may be living right now
                    </p>
                    <ul className="space-y-1">
                      {insight.active_loops.slice(0, 2).map((l, i) => (
                        <li key={i} className="text-[12.5px] leading-relaxed">
                          <span className="font-medium text-foreground/95">{l.loop_name ?? l.loop_id}</span>
                          {l.evidence && (
                            <span className="text-muted-foreground"> — “{l.evidence}”</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {!!insight.past_echoes?.length && (
                <div className="flex gap-2">
                  <History className="w-3.5 h-3.5 text-sky-400/90 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground/80">
                      Past echoes
                    </p>
                    <ul className="space-y-1">
                      {insight.past_echoes.slice(0, 2).map((e, i) => (
                        <li key={i} className="text-[12.5px] leading-relaxed text-foreground/90">
                          {e.when && <span className="text-muted-foreground/80">{e.when}: </span>}
                          {e.what}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {insight.next_move && (
                <div className="flex gap-2 pt-1 border-t border-primary/15">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400/90 mt-0.5 flex-shrink-0" />
                  <p className="text-[12.5px] leading-relaxed text-foreground/90 italic">
                    {insight.next_move}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
