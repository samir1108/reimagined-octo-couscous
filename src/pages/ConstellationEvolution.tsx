/**
 * ConstellationEvolution — timeline of how the user's 12-practice fingerprint
 * has shifted over time. Reads user_practice_constellation_history.
 *
 * Shows the most recent N snapshots as a sparkline-style list, with the
 * current top-3 practices and any practice that crossed in or out of "primary".
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Moon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PRACTICES, PRACTICE_META, type Practice } from "@/lib/sutra/practices";
import { getModesByPractice } from "@/lib/sutra/modeRegistry";

interface Snapshot {
  id: string;
  snapshot_at: string;
  computation_source: string;
  snapshot: { weights?: Record<Practice, number>; trigger_practice?: Practice; kind?: string };
}

function topThree(weights: Record<string, number> | undefined): Array<[Practice, number]> {
  if (!weights) return [];
  return PRACTICES
    .map((p) => [p, Number(weights[p] ?? 0)] as [Practice, number])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function ConstellationEvolution() {
  const navigate = useNavigate();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("user_practice_constellation_history")
        .select("id, snapshot_at, computation_source, snapshot")
        .eq("user_id", user.id)
        .order("snapshot_at", { ascending: false })
        .limit(40);
      setSnapshots((data as any) || []);
      setLoading(false);
    })();
  }, []);

  const current = snapshots[0];
  const currentTop = topThree(current?.snapshot?.weights);

  return (
    <div className="min-h-screen bg-background text-foreground px-5 pt-6 pb-24 max-w-2xl mx-auto">
      {/* header */}
      <div className="flex items-center justify-between mb-7">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full text-muted-foreground hover:text-foreground transition"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Evolution</div>
        <div className="w-9" />
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] uppercase tracking-[0.2em] mb-3">
          <Sparkles className="w-3 h-3" />
          <span>Constellation over time</span>
        </div>
        <h1 className="text-3xl font-light text-foreground mb-2">How you've moved</h1>
        <p className="text-sm text-muted-foreground leading-relaxed px-3">
          Each session reshapes the fingerprint. Here's the trail.
        </p>
      </div>

      {/* current top */}
      {current && currentTop.length > 0 && (
        <div className="mb-7 p-4 rounded-2xl bg-card border border-border">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
            Right now · {fmtDate(current.snapshot_at)}
          </div>
          <div className="space-y-2">
            {currentTop.map(([p, w]) => {
              const meta = PRACTICE_META[p];
              return (
                <div key={p} className="flex items-center gap-3">
                  <div className="text-base">{meta?.emoji ?? "✦"}</div>
                  <div className="flex-1">
                    <div className="text-sm text-foreground">{meta?.label ?? p}</div>
                    <div className="h-1 mt-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${Math.round(w * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground tabular-nums w-10 text-right">
                    {Math.round(w * 100)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* dormant practices — 2-min primer launcher */}
      {current?.snapshot?.weights && (() => {
        const dormant = PRACTICES
          .map((p) => [p, Number(current.snapshot!.weights![p] ?? 0)] as [Practice, number])
          .filter(([, w]) => w < 0.04)
          .sort((a, b) => a[1] - b[1])
          .slice(0, 4);
        if (dormant.length === 0) return null;
        return (
          <div className="mb-7">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
              Sleeping practices · tap for a 2-min primer
            </div>
            <div className="grid grid-cols-2 gap-2">
              {dormant.map(([p, w]) => {
                const meta = PRACTICE_META[p];
                const modes = getModesByPractice(p);
                // Pick the shortest mode as the primer
                const primer = modes.sort((a, b) => a.defaultDurationSec - b.defaultDurationSec)[0];
                return (
                  <button
                    key={p}
                    onClick={() => primer && navigate(primer.route({}))}
                    disabled={!primer}
                    className="flex items-center gap-2 p-3 rounded-xl bg-card/50 border border-border/60 hover:border-primary/40 hover:bg-card transition text-left disabled:opacity-50"
                  >
                    <Moon className="w-3.5 h-3.5 text-muted-foreground/70" />
                    <span className="text-base">{meta?.emoji ?? "✦"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-foreground truncate">{meta?.label ?? p}</div>
                      <div className="text-[10px] text-muted-foreground tabular-nums">
                        {Math.round(w * 100)}% · {primer ? `${Math.round(primer.defaultDurationSec / 60)}m primer` : "—"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* timeline */}
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
        Trail · {snapshots.length} snapshots
      </div>

      {loading && (
        <div className="text-sm text-muted-foreground text-center py-12">Reading the trail…</div>
      )}

      {!loading && snapshots.length === 0 && (
        <div className="text-sm text-muted-foreground text-center py-12 px-4 leading-relaxed">
          No snapshots yet. Complete a session and the constellation will start tracking how you move.
        </div>
      )}

      <div className="space-y-2">
        {snapshots.map((s, i) => {
          const top = topThree(s.snapshot?.weights);
          const trigger = s.snapshot?.trigger_practice;
          const triggerMeta = trigger ? PRACTICE_META[trigger] : null;
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.4) }}
              className="p-3 rounded-xl bg-card/50 border border-border/60"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {fmtDate(s.snapshot_at)}
                </span>
                <span className="text-[10px] text-muted-foreground/70">
                  {s.computation_source.replace("feedback:", "")}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {top.map(([p, w]) => {
                  const meta = PRACTICE_META[p];
                  return (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/60 text-[11px] text-foreground"
                    >
                      <span>{meta?.emoji ?? "✦"}</span>
                      <span>{meta?.label ?? p}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {Math.round(w * 100)}%
                      </span>
                    </span>
                  );
                })}
                {triggerMeta && (
                  <span className="text-[10px] text-muted-foreground italic ml-auto">
                    via {triggerMeta.label}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
