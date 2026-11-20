import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Layers, Sparkles } from "lucide-react";

type Kosha = {
  id: "annamaya" | "pranamaya" | "manomaya" | "vijnanamaya" | "anandamaya";
  name: string;
  score: number;
  state: "starved" | "constricted" | "steady" | "flowing" | "radiant";
  reading: string;
  one_practice: { name: string; duration_minutes: number; steps: string[] };
};
type Reading = {
  overall: string;
  koshas: Kosha[];
  priority_kosha: Kosha["id"];
  closing_line: string;
};

const KOSHA_COLOR: Record<Kosha["id"], string> = {
  annamaya:    "from-rose-400/60 to-rose-600/20",
  pranamaya:   "from-amber-300/60 to-amber-600/20",
  manomaya:    "from-emerald-300/60 to-emerald-600/20",
  vijnanamaya: "from-sky-300/60 to-sky-600/20",
  anandamaya:  "from-violet-300/60 to-violet-600/20",
};
const RING_STROKE: Record<Kosha["id"], string> = {
  annamaya: "#fb7185",
  pranamaya: "#fbbf24",
  manomaya: "#34d399",
  vijnanamaya: "#38bdf8",
  anandamaya: "#a78bfa",
};

function Ring({ score, color }: { score: number; color: string }) {
  const r = 34, c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="shrink-0">
      <circle cx="44" cy="44" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
      <circle
        cx="44" cy="44" r={r} stroke={color} strokeWidth="6" fill="none"
        strokeLinecap="round" strokeDasharray={c}
        strokeDashoffset={c - (pct / 100) * c}
        transform="rotate(-90 44 44)"
      />
      <text x="44" y="49" textAnchor="middle" fill="white" fontSize="18" fontWeight="600">
        {pct}
      </text>
    </svg>
  );
}

export default function KoshaScanner() {
  const [loading, setLoading] = useState(false);
  const [reading, setReading] = useState<Reading | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function scan() {
    setLoading(true);
    setError(null);
    setReading(null);
    try {
      const { data, error } = await supabase.functions.invoke("kosha-scanner", { body: {} });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setReading(data as Reading);
    } catch (e: any) {
      setError(e?.message ?? "The scan went quiet. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white/90 pb-24">
      <div className="max-w-2xl mx-auto px-5 pt-10">
        <div className="flex items-center gap-2 text-amber-300/80 text-xs uppercase tracking-[0.2em] mb-3">
          <Layers className="w-3.5 h-3.5" />
          Kosha Scanner
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
          Five sheaths.<br />
          <span className="text-white/60">One honest reading.</span>
        </h1>
        <p className="text-white/50 text-sm mt-3 leading-relaxed">
          Body, breath, mind, wisdom, being — scored from your actual signals in the app.
          Not a quiz. A mirror.
        </p>

        {!reading && (
          <button
            onClick={scan}
            disabled={loading}
            className="mt-8 bg-amber-300 text-black font-medium text-sm rounded-full px-5 py-2.5 disabled:opacity-40 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Scanning your sheaths…" : "Scan me"}
          </button>
        )}

        {error && (
          <div className="mt-6 text-sm text-red-300/80 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {reading && (
          <div className="mt-8 space-y-6 animate-in fade-in duration-500">
            <div className="border-l-2 border-amber-300/50 pl-4">
              <div className="text-[11px] uppercase tracking-[0.2em] text-amber-300/70 mb-1">
                overall
              </div>
              <div className="text-lg leading-snug italic text-white/90">{reading.overall}</div>
            </div>

            <div className="space-y-3">
              {reading.koshas?.map((k) => {
                const isPriority = k.id === reading.priority_kosha;
                return (
                  <div
                    key={k.id}
                    className={`rounded-2xl border p-5 bg-gradient-to-br ${KOSHA_COLOR[k.id]} ${
                      isPriority ? "border-amber-300/40 ring-1 ring-amber-300/20" : "border-white/10"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <Ring score={k.score} color={RING_STROKE[k.id]} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-[15px] font-medium">{k.name}</div>
                          <div className="text-[10px] uppercase tracking-[0.18em] text-white/70 bg-white/10 rounded-full px-2 py-0.5">
                            {k.state}
                          </div>
                          {isPriority && (
                            <div className="text-[10px] uppercase tracking-[0.18em] text-amber-300 bg-amber-300/10 rounded-full px-2 py-0.5">
                              start here
                            </div>
                          )}
                        </div>
                        <p className="text-[13px] leading-relaxed text-white/80 mt-2">{k.reading}</p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl bg-black/30 border border-white/10 p-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-white/50 mb-1">
                        {k.one_practice.duration_minutes} min practice
                      </div>
                      <div className="text-sm font-medium mb-2">{k.one_practice.name}</div>
                      <ol className="space-y-1">
                        {k.one_practice.steps?.map((s, i) => (
                          <li key={i} className="text-[12px] leading-relaxed text-white/70 flex gap-2">
                            <span className="text-amber-300/70 shrink-0">{i + 1}.</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                );
              })}
            </div>

            {reading.closing_line && (
              <div className="text-center py-4 border-t border-white/5">
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-2">
                  hold this today
                </div>
                <div className="text-lg italic text-white/80">{reading.closing_line}</div>
              </div>
            )}

            <button
              onClick={scan}
              disabled={loading}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-5 py-2.5 text-sm transition disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Re-scan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
