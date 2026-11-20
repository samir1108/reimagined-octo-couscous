import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Sparkles, Loader2, Quote } from "lucide-react";

type Verse = {
  tradition: string;
  source: string;
  reference: string;
  original?: string;
  translation: string;
  why_this: string;
};
type Reading = {
  reading: string;
  verses: Verse[];
  neuroscience: string;
  practice: { name: string; duration_minutes: number; steps: string[] };
  closing_koan: string;
};

const EXAMPLES = [
  "I keep going back to someone who hurts me.",
  "I can't stop refreshing my phone even when nothing is there.",
  "I feel numb in a room full of people I love.",
  "I am tired of pretending I am okay.",
];

export default function DharmaOracle() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Reading | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ask(q?: string) {
    const text = (q ?? query).trim();
    if (text.length < 4) return;
    setQuery(text);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("dharma-retrieval", {
        body: { query: text },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult(data as Reading);
    } catch (e: any) {
      setError(e?.message ?? "Something went quiet. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white/90 pb-24">
      <div className="max-w-2xl mx-auto px-5 pt-10">
        <div className="flex items-center gap-2 text-amber-300/80 text-xs uppercase tracking-[0.2em] mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Dharma Retrieval Engine
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
          Say one sentence.<br />
          <span className="text-white/60">The whole corpus answers.</span>
        </h1>
        <p className="text-white/50 text-sm mt-3 leading-relaxed">
          Vedas, Upanishads, Gita, Tantras, Bhakti, Zen, Sufi, Christian mystics — plus modern
          contemplative neuroscience — reduced to the exact three verses for your exact state.
        </p>

        <div className="mt-8">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="One honest sentence about what is happening inside…"
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-[15px] leading-relaxed placeholder:text-white/30 focus:outline-none focus:border-amber-300/40 resize-none"
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => ask(ex)}
                  className="text-[11px] text-white/50 hover:text-white/80 bg-white/5 hover:bg-white/10 rounded-full px-2.5 py-1 transition"
                >
                  {ex.length > 34 ? ex.slice(0, 32) + "…" : ex}
                </button>
              ))}
            </div>
            <button
              onClick={() => ask()}
              disabled={loading || query.trim().length < 4}
              className="bg-amber-300 text-black font-medium text-sm rounded-full px-5 py-2 disabled:opacity-40 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Ask
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-8 text-sm text-red-300/80 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-10 space-y-8 animate-in fade-in duration-500">
            <div className="border-l-2 border-amber-300/50 pl-4">
              <div className="text-[11px] uppercase tracking-[0.2em] text-amber-300/70 mb-1">
                what was heard
              </div>
              <div className="text-lg leading-snug italic text-white/90">{result.reading}</div>
            </div>

            <div className="space-y-5">
              {result.verses?.map((v, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-5"
                >
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/50 mb-2">
                    <span className="text-amber-300/80">{v.tradition}</span>
                    <span className="text-white/20">·</span>
                    <span>{v.source} {v.reference}</span>
                  </div>
                  {v.original && (
                    <div className="text-amber-100/80 italic text-[13px] leading-relaxed mb-2">
                      {v.original}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Quote className="w-4 h-4 shrink-0 text-white/30 mt-1" />
                    <div className="text-[15px] leading-relaxed text-white/90">{v.translation}</div>
                  </div>
                  <div className="text-[13px] leading-relaxed text-white/55 mt-3 pl-6">
                    {v.why_this}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-2">
                Modern frame
              </div>
              <p className="text-sm leading-relaxed text-white/80">{result.neuroscience}</p>
            </div>

            <div className="rounded-2xl bg-amber-300/[0.06] border border-amber-300/20 p-5">
              <div className="text-[11px] uppercase tracking-[0.2em] text-amber-300/80 mb-2">
                {result.practice.duration_minutes}-minute practice
              </div>
              <div className="text-lg font-medium mb-3">{result.practice.name}</div>
              <ol className="space-y-2">
                {result.practice.steps?.map((s, i) => (
                  <li key={i} className="text-sm leading-relaxed text-white/80 flex gap-3">
                    <span className="text-amber-300/70 shrink-0">{i + 1}.</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            {result.closing_koan && (
              <div className="text-center py-4 border-t border-white/5">
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-2">
                  Sit with this
                </div>
                <div className="text-lg italic text-white/80">{result.closing_koan}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
