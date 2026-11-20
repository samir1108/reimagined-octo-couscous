// "Since last session" — forensic dissection panel.
// Reads consciousness_signals + recent reflections client-side and surfaces
// 3-4 specific receipts so the user feels witnessed by the engine.

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Eye } from "lucide-react";

interface Receipt { text: string; }

function deriveReceipts(rows: any[]): Receipt[] {
  if (!rows?.length) return [];
  const out: Receipt[] = [];

  // 1. Late-night journaling pattern
  const hours = rows
    .map((r) => new Date(r.created_at).getHours())
    .filter((h) => !isNaN(h));
  const nightCount = hours.filter((h) => h >= 22 || h <= 4).length;
  if (nightCount >= 2) {
    out.push({ text: `You wrote ${nightCount} entries between 10pm–4am — the night Validation loop is active.` });
  }

  // 2. Loop frequency
  const loopIds: string[] = [];
  for (const r of rows) {
    const ld = Array.isArray(r.loops_detected) ? r.loops_detected : [];
    for (const l of ld) {
      const id = typeof l === "string" ? l : l?.id || l?.loop_id || l?.name;
      if (id) loopIds.push(String(id));
    }
  }
  if (loopIds.length) {
    const counts: Record<string, number> = {};
    loopIds.forEach((id) => { counts[id] = (counts[id] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (top && top[1] >= 2) {
      out.push({ text: `The ${top[0]} loop fired ${top[1]}× since last session — it's still asking to be seen.` });
    }
  }

  // 3. "Should" / control language
  let shouldCount = 0;
  for (const r of rows) {
    const txt = String(r.chitta_vritti || r.summary || "");
    shouldCount += (txt.match(/\bshould\b/gi) || []).length;
  }
  if (shouldCount >= 3) {
    out.push({ text: `Your reflections used "should" ${shouldCount} times — Control pattern rising.` });
  }

  // 4. Witness signals weakness
  const weakWitness = rows.filter((r) => {
    const w = r.witness_signals;
    if (!w) return false;
    if (typeof w === "object" && (w.duration_seconds ?? 999) < 30) return true;
    return false;
  }).length;
  if (weakWitness >= 1) {
    out.push({ text: `Witness time dropped under 30s — that's why this session goes back to ground.` });
  }

  // 5. Engagement count fallback
  if (out.length < 2 && rows.length) {
    out.push({ text: `${rows.length} signals captured since last session — the engine is watching.` });
  }

  return out.slice(0, 4);
}

export function AgendaDissectionPanel() {
  const { data: receipts, isLoading } = useQuery({
    queryKey: ["agenda-dissection"],
    queryFn: async (): Promise<Receipt[]> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];
      const since = new Date(Date.now() - 7 * 86400_000).toISOString();
      const { data } = await supabase
        .from("consciousness_signals")
        .select("created_at, loops_detected, chitta_vritti, witness_signals")
        .eq("user_id", session.user.id)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(40);
      return deriveReceipts(data || []);
    },
    staleTime: 5 * 60_000,
  });

  if (isLoading || !receipts || receipts.length === 0) return null;

  return (
    <div className="mb-6 rounded-2xl border border-border/40 bg-background/40 backdrop-blur-md p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Eye className="h-3.5 w-3.5 text-primary/70" />
        <p className="text-[10px] font-display tracking-[0.25em] uppercase text-primary/70">
          Since last session
        </p>
      </div>
      <ul className="space-y-2">
        {receipts.map((r, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-foreground/85 leading-relaxed">
            <span className="text-primary/60 mt-0.5">•</span>
            <span>{r.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
