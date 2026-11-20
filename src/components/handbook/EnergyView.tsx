/**
 * EnergyView — the ki layer: prana and nadi dominance, behaviorally.
 * ──────────────────────────────────────────────────────────────────
 * Five pranas, three nadis, each with an observable behavioral signature, the
 * loops its imbalance gets mistaken for, and the practice that re-balances it.
 * The Sushumna entry is shown apart: it is a consequence of balance, not a
 * channel to force open.
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getEngine } from "@/lib/graph/engine";
import type { EnergyMarker } from "@/data/energyMarkers";

const CHANNEL_GLYPH: Record<string, string> = {
  prana: "↑", apana: "↓", samana: "◎", udana: "↗", vyana: "◯",
  ida: "☾", pingala: "☀", sushumna: "│",
};

export default function EnergyView() {
  const profile = useMemo(() => getEngine().energyProfile(), []);
  const [open, setOpen] = useState<string | null>(null);

  const groups: Array<{ title: string; blurb: string; nodes: EnergyMarker[] }> = [
    {
      title: "The five pranas",
      blurb: "Five currents of vital breath. Dominance is not morality — each has a signature you can observe in a Tuesday.",
      nodes: profile.prana.map(n => n.data as EnergyMarker),
    },
    {
      title: "The three nadis",
      blurb: "Most people run one channel hot. Sushumna — the central channel — opens only when the other two balance.",
      nodes: profile.nadi.map(n => n.data as EnergyMarker),
    },
  ];

  return (
    <div className="space-y-12">
      {profile.sushumna && (
        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl text-primary/80">{CHANNEL_GLYPH.sushumna}</span>
            <h3 className="font-display text-2xl">{(profile.sushumna.data as EnergyMarker).label}</h3>
          </div>
          <p className="text-foreground/85 leading-relaxed mb-4">{(profile.sushumna.data as EnergyMarker).signature}</p>
          <p className="text-sm text-foreground/60 italic">{(profile.sushumna.data as EnergyMarker).balancing}</p>
        </div>
      )}

      {groups.map((group) => (
        <div key={group.title}>
          <h3 className="font-display text-2xl mb-1">{group.title}</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-2xl leading-snug">{group.blurb}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {group.nodes.map((marker) => (
              <motion.button
                key={marker.id}
                onClick={() => setOpen(open === marker.id ? null : marker.id)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`text-left rounded-2xl border px-5 py-4 transition ${
                  open === marker.id ? "border-primary/50 bg-primary/5" : "border-border/40 hover:border-primary/30 bg-foreground/[0.02]"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg text-primary/70 w-5 text-center">{CHANNEL_GLYPH[marker.channel]}</span>
                  <span className="font-display text-base">{marker.label}</span>
                </div>
                <p className="text-sm text-foreground/80 leading-snug">{marker.signature}</p>

                {open === marker.id && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-3 border-t border-border/30 pt-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/45 mb-1">From the inside</p>
                      <p className="text-sm text-foreground/75 italic">{marker.feltSense}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/45 mb-1">Mistaken for</p>
                      <div className="flex flex-wrap gap-1.5">
                        {marker.misreadAsLoops.length === 0 && marker.misreadAsFamilies.length === 0 && (
                          <span className="text-sm text-foreground/50">Rarely confused with a behavioral loop</span>
                        )}
                        {marker.misreadAsLoops.map((loopId) => (
                          <span key={loopId} className="rounded-full border border-border/40 px-2.5 py-0.5 text-xs text-foreground/70">
                            {loopId}
                          </span>
                        ))}
                        {marker.misreadAsFamilies.map((fam) => (
                          <span key={fam} className="rounded-full border border-border/30 px-2.5 py-0.5 text-xs text-foreground/50">
                            {fam} family
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/45 mb-1">Re-balance</p>
                      <p className="text-sm text-foreground/85 leading-snug">{marker.balancing}</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground/70 italic">{marker.source}</p>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
