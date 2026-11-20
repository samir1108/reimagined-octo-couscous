// Game Insights — a quiet mirror of what the games have heard.
// Reads consciousness_signals (source_type='game'), groups by game_id,
// and shows minimal aggregates: count, last played, top signals.
// Intentionally NOT gamified — no scores, no badges. Reflection only.

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { LAB_GAMES } from "@/games/shell/labRegistry";

interface SignalRow {
  game_id: string | null;
  game_signals: Record<string, unknown> | null;
  witness_signals: Record<string, unknown> | null;
  created_at: string;
}

export default function GameInsights() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<SignalRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) {
          if (alive) { setRows([]); setLoading(false); }
          return;
        }
        const { data, error } = await supabase
          .from("consciousness_signals")
          .select("game_id,game_signals,witness_signals,created_at")
          .eq("user_id", auth.user.id)
          .eq("source_type", "game")
          .order("created_at", { ascending: false })
          .limit(500);
        if (error) throw error;
        if (alive) { setRows((data as any) ?? []); setLoading(false); }
      } catch (e) {
        console.warn("[GameInsights] load failed", e);
        if (alive) { setRows([]); setLoading(false); }
      }
    })();
    return () => { alive = false; };
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, { count: number; lastAt: string; totalMs: number; sample: Record<string, unknown> }>();
    (rows ?? []).forEach((r) => {
      if (!r.game_id) return;
      const cur = map.get(r.game_id) ?? { count: 0, lastAt: r.created_at, totalMs: 0, sample: r.game_signals ?? {} };
      cur.count += 1;
      if (r.created_at > cur.lastAt) cur.lastAt = r.created_at;
      const dur = (r.witness_signals as any)?.duration_ms;
      if (typeof dur === "number") cur.totalMs += dur;
      map.set(r.game_id, cur);
    });
    return Array.from(map.entries())
      .map(([id, v]) => ({ id, ...v, game: LAB_GAMES.find((g) => g.id === id) }))
      .sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1));
  }, [rows]);

  const totalSessions = grouped.reduce((s, g) => s + g.count, 0);
  const totalMin = Math.round(grouped.reduce((s, g) => s + g.totalMs, 0) / 60000);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">

      <div className="relative z-10 max-w-2xl mx-auto px-6 pt-12 pb-32">
        <button
          onClick={() => navigate("/app/games")}
          className="text-[11px] uppercase tracking-[0.3em] text-white/40 hover:text-white/70 mb-10"
        >
          ← games
        </button>

        <h1 className="text-3xl font-light mb-2">What the games heard</h1>
        <p className="text-sm text-white/55 mb-10">
          Quiet aggregates. No scores. The signals each game read in you.
        </p>

        {loading && <p className="text-white/40 text-sm">listening…</p>}

        {!loading && grouped.length === 0 && (
          <div className="border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-white/55 text-sm mb-4">No game signals yet.</p>
            <button
              onClick={() => navigate("/app/games")}
              className="text-xs uppercase tracking-[0.3em] text-white/70 hover:text-white"
            >
              play one →
            </button>
          </div>
        )}

        {!loading && grouped.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-10">
              <div className="border border-white/10 rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">sessions</p>
                <p className="text-2xl font-light mt-1">{totalSessions}</p>
              </div>
              <div className="border border-white/10 rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">minutes</p>
                <p className="text-2xl font-light mt-1">{totalMin}</p>
              </div>
            </div>

            <div className="space-y-3">
              {grouped.map((g, i) => (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border border-white/10 rounded-xl p-4 hover:bg-white/5 transition cursor-pointer"
                  onClick={() => navigate(`/app/games/${g.id}`)}
                >
                  <div className="flex items-baseline justify-between mb-1">
                    <p className="text-base text-white/90">{g.game?.name ?? g.id}</p>
                    <p className="text-[10px] uppercase tracking-wider text-white/35">
                      {new Date(g.lastAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-[11px] text-white/45 mb-2">{g.game?.signal ?? "—"}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/50">
                    <span>{g.count}× played</span>
                    {g.totalMs > 0 && <span>{Math.round(g.totalMs / 1000)}s total</span>}
                    {Object.entries(g.sample).slice(0, 3).map(([k, v]) => (
                      <span key={k} className="text-white/35">
                        {k}: {String(v).slice(0, 14)}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
