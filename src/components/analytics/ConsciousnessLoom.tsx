import { motion } from "framer-motion";
import { useMemo } from "react";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { usePracticeLevels } from "@/hooks/usePracticeMatrix";

const PRACTICE_DISPLAY: Array<{ key: keyof import("@/hooks/usePracticeMatrix").PracticeLevels; label: string }> = [
  { key: "observation", label: "Observation" },
  { key: "self_inquiry", label: "Inquiry" },
  { key: "breath", label: "Breath" },
  { key: "witnessing", label: "Witnessing" },
  { key: "body", label: "Body" },
  { key: "bhakti", label: "Bhakti" },
  { key: "karma", label: "Karma" },
  { key: "jnana", label: "Jnana" },
  { key: "raja", label: "Raja" },
  { key: "kriya", label: "Kriya" },
  { key: "tantra", label: "Tantra" },
  { key: "neuroscience", label: "Neuro" },
];

/**
 * CONSCIOUSNESS LOOM (Batch 12)
 * Weaves the user's journey as overlapping threads:
 * each thread = one dimension over time, woven into a single fabric.
 */

const MAX_LEVEL = 7;

// One color per practice — semantic tokens only.
const COLORS = [
  "hsl(var(--primary) / 0.95)",
  "hsl(var(--primary) / 0.8)",
  "hsl(var(--primary) / 0.65)",
  "hsl(var(--accent-foreground) / 0.75)",
  "hsl(var(--accent-foreground) / 0.6)",
  "hsl(var(--secondary-foreground) / 0.7)",
  "hsl(var(--secondary-foreground) / 0.55)",
  "hsl(var(--primary) / 0.55)",
  "hsl(var(--primary) / 0.45)",
  "hsl(var(--accent-foreground) / 0.45)",
  "hsl(var(--secondary-foreground) / 0.4)",
  "hsl(var(--primary) / 0.35)",
];

export default function ConsciousnessLoom() {
  const data = useAnalyticsData();
  const { data: levels } = usePracticeLevels();

  const insight = useMemo(() => {
    if (!levels) return "Each strand below is one dimension of you, woven together over time.";
    const entries = PRACTICE_DISPLAY.map((p) => ({ label: p.label, lvl: (levels as any)[p.key] ?? 0 }));
    const active = entries.filter((e) => e.lvl > 0);
    if (active.length === 0) return "Your loom is just beginning. Every thread starts at zero — and that is sacred.";
    const weakest = active.reduce((a, b) => (a.lvl <= b.lvl ? a : b));
    const strongest = active.reduce((a, b) => (a.lvl >= b.lvl ? a : b));
    return `Your ${strongest.label} (L${strongest.lvl}) anchors you. Today's practice leans on ${weakest.label} (L${weakest.lvl}) — the thread asking to be woven.`;
  }, [levels]);

  // Each thread = one practice, drawn as a horizontal strand whose vertical
  // position reflects its real level (higher level → higher up the loom).
  // x-axis is session index; thread amplitude grows with level so stronger
  // practices "ripple" more visibly. Locked (L0) practices are hidden.
  const threads = useMemo(() => {
    if (!levels) return [];
    const sessionCount = (data.sessions ?? []).length;
    const len = Math.max(sessionCount, 8);
    const active = PRACTICE_DISPLAY
      .map((p, i) => ({ ...p, lvl: (levels as any)[p.key] ?? 0, color: COLORS[i % COLORS.length] }))
      .filter((p) => p.lvl > 0);
    if (active.length === 0) return [];
    return active.map((p, idx) => {
      const norm = p.lvl / MAX_LEVEL; // 0..1
      // Higher level → closer to top. Spread strands across the band.
      const baseY = 90 - norm * 70 - (idx % 3) * 4;
      const amp = 2 + norm * 6;
      const phase = idx * 0.6;
      const points = Array.from({ length: len }, (_, i) => {
        const t = i / (len - 1 || 1);
        const x = t * 100;
        const y = baseY + Math.sin(t * Math.PI * 2 + phase) * amp;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      });
      return {
        d: `M ${points.join(" L ")}`,
        color: p.color,
        width: 0.4 + norm * 1.0,
        label: p.label,
        lvl: p.lvl,
      };
    });
  }, [data.sessions, levels]);

  const sessionCount = data.sessions?.length ?? 0;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-display font-semibold text-foreground mb-1">Consciousness Loom</h3>
        <p className="text-xs text-muted-foreground font-body">
          Your journey as woven threads. Each strand is one dimension; together they make you.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-4">
        {threads.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-center px-4">
            <p className="text-xs text-muted-foreground/70 font-body italic">
              No threads woven yet. Complete a session to begin your loom.
            </p>
          </div>
        ) : (
          <svg viewBox="0 0 100 100" className="w-full h-48" preserveAspectRatio="none">
            {threads.map((t, i) => (
              <motion.path
                key={i}
                d={t.d}
                stroke={t.color}
                strokeWidth={t.width}
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.4, delay: i * 0.08 }}
              />
            ))}
          </svg>
        )}
        <p className="text-[10px] text-muted-foreground/60 font-body text-center mt-2">
          {threads.length} {threads.length === 1 ? "thread" : "threads"} · {sessionCount} {sessionCount === 1 ? "session" : "sessions"} woven
        </p>

        {levels && (
          <div className="mt-4 pt-4 border-t border-border/10">
            <p className="text-[10px] font-display tracking-[0.2em] uppercase text-muted-foreground mb-3">Your Tools</p>
            <div className="grid grid-cols-3 gap-x-3 gap-y-1.5">
              {PRACTICE_DISPLAY.map((p) => {
                const lvl = (levels as any)[p.key] ?? 0;
                const locked = lvl === 0;
                return (
                  <div key={p.key} className="flex items-center justify-between text-[11px]">
                    <span className={`font-body ${locked ? "text-muted-foreground/40" : "text-foreground/80"}`}>{p.label}</span>
                    <span className={`font-display tabular-nums ${locked ? "text-muted-foreground/30" : "text-primary/80"}`}>
                      {locked ? "—" : `L${lvl}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-border/10">
          <p className="text-[10px] font-display tracking-[0.2em] uppercase text-primary/70 mb-1.5">Engine Insight</p>
          <p className="text-xs text-foreground/75 font-body leading-relaxed italic">{insight}</p>
        </div>
      </div>
    </div>
  );
}
