import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMirrorReadings, type MirrorReadingRow } from "@/hooks/useMirrorReadings";
import { MIRROR_TOTAL } from "@/data/pre-journey/mirrors";
import { Sparkles, Lock } from "lucide-react";

const MODULES = [
  "Welcome", "Engines", "Observation", "12 Skills",
  "Patanjali", "4 Yogas", "Levels", "Loops", "Heart", "Launch",
];

const BAND_COLOR: Record<string, string> = {
  read:        "stroke-emerald-400",
  inferred:    "stroke-amber-300",
  preliminary: "stroke-white/60",
  locked:      "stroke-white/15",
};

function Ring({ row, onClick }: { row: MirrorReadingRow; onClick: () => void }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const filled = row.band === "locked" ? 0 : Math.max(4, row.score);
  const offset = c - (filled / 100) * c;
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-1 focus:outline-none"
      aria-label={`Mirror ${row.mirror_number}: ${row.title}`}
    >
      <div className="relative">
        <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
          <circle cx="28" cy="28" r={r} className="stroke-white/10" strokeWidth="3" fill="none" />
          <circle
            cx="28"
            cy="28"
            r={r}
            className={`${BAND_COLOR[row.band]} transition-all`}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-medium text-white/80">
          {row.band === "locked" ? <Lock className="w-3 h-3 text-white/30" /> : row.score}
        </div>
      </div>
      <div className="text-[10px] text-white/50 leading-tight text-center w-16 truncate group-hover:text-white/80">
        M{row.mirror_number}
      </div>
    </button>
  );
}

export default function MirrorRingsLayer() {
  const { data, isLoading } = useMirrorReadings();
  const [selected, setSelected] = useState<MirrorReadingRow | null>(null);

  const grouped = useMemo(() => {
    const byModule: Record<string, MirrorReadingRow[]> = {};
    for (const m of MODULES) byModule[m] = [];
    for (const row of data || []) {
      (byModule[row.module] ||= []).push(row);
    }
    return byModule;
  }, [data]);

  const stats = useMemo(() => {
    const rows = data || [];
    const read = rows.filter((r) => r.band === "read").length;
    const inferred = rows.filter((r) => r.band === "inferred").length;
    const preliminary = rows.filter((r) => r.band === "preliminary").length;
    const locked = rows.filter((r) => r.band === "locked").length;
    const avg = rows.length
      ? Math.round(rows.reduce((s, r) => s + (r.band === "locked" ? 0 : r.score), 0) / Math.max(1, rows.length - locked))
      : 0;
    return { read, inferred, preliminary, locked, avg };
  }, [data]);

  if (isLoading) {
    return <div className="p-6 text-center text-white/50 text-sm">Reading the {MIRROR_TOTAL} mirrors…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
        <div className="flex items-center gap-2 text-white/80 text-xs uppercase tracking-widest mb-2">
          <Sparkles className="w-4 h-4" />
          The {MIRROR_TOTAL} Mirrors
        </div>
        <div className="text-white text-lg font-medium mb-1">
          What the app already sees about you
        </div>
        <div className="text-white/60 text-sm leading-relaxed">
          {MIRROR_TOTAL} checkpoints across 10 modules. The Elder read{" "}
          {stats.read + stats.inferred + stats.preliminary} of them
          during onboarding — {stats.read} directly, {stats.inferred} inferred, {stats.preliminary} preliminary.
          {stats.locked > 0 && ` ${stats.locked} unlock as you move through the Foundation.`}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Read {stats.read}</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-300" /> Inferred {stats.inferred}</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-white/60" /> Preliminary {stats.preliminary}</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-white/15" /> Locked {stats.locked}</span>
          <span className="ml-auto text-white/50">Day-0 avg {stats.avg}</span>
        </div>
      </div>

      {/* Grid by module */}
      {MODULES.map((mod) => {
        const rows = grouped[mod] || [];
        if (!rows.length) return null;
        return (
          <div key={mod} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="text-white/70 text-xs uppercase tracking-wider mb-3">{mod}</div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {rows.map((row) => (
                <Ring key={row.mirror_number} row={row} onClick={() => setSelected(row)} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Detail sheet */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-white/50 text-xs uppercase tracking-widest mb-1">
              Mirror {selected.mirror_number} · {selected.module}
            </div>
            <div className="text-white text-xl font-medium mb-3">{selected.title}</div>
            {selected.band === "locked" ? (
              <div className="text-white/60 text-sm">
                This mirror unlocks with the matching Foundation session.
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-4xl font-light text-white tabular-nums">{selected.score}</div>
                  <div className="text-xs text-white/50">
                    <div>Confidence {Math.round(selected.confidence * 100)}%</div>
                    <div className="capitalize">Band: {selected.band}</div>
                  </div>
                </div>
                {selected.reading_note && (
                  <div className="text-white/80 text-sm leading-relaxed mb-3">
                    {selected.reading_note}
                  </div>
                )}
                {selected.evidence && (
                  <div className="text-white/50 text-xs italic border-l-2 border-white/20 pl-3">
                    "{selected.evidence}"
                  </div>
                )}
              </>
            )}
            <button
              onClick={() => setSelected(null)}
              className="mt-6 w-full rounded-full bg-white/10 hover:bg-white/15 text-white text-sm py-2.5"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
