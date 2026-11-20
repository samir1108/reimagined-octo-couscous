import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import { STAGE_HANDBOOK, type PathFit } from "@/data/stageHandbook";
import BandGraphLayer from "./BandGraphLayer";

const BAND_ACCENTS = [
  "from-slate-500/30 to-slate-700/10",
  "from-indigo-500/30 to-indigo-700/10",
  "from-sky-500/30 to-sky-700/10",
  "from-emerald-500/30 to-emerald-700/10",
  "from-amber-500/30 to-amber-700/10",
  "from-orange-500/30 to-orange-700/10",
  "from-rose-500/30 to-rose-700/10",
  "from-yellow-300/30 to-amber-500/10",
];

const FIT_STYLES: Record<PathFit["fit"], string> = {
  primary: "border-primary/40 bg-primary/10 text-primary",
  supporting: "border-foreground/20 bg-foreground/5 text-foreground/85",
  avoid: "border-destructive/30 bg-destructive/5 text-destructive/90",
};
const FIT_LABEL: Record<PathFit["fit"], string> = {
  primary: "Primary", supporting: "Supporting", avoid: "Avoid for now",
};

export default function BandsView() {
  const [params, setParams] = useSearchParams();
  const initial = Number(params.get("band") ?? "0");
  const [activeBand, setActiveBand] = useState<number>(
    Number.isFinite(initial) && initial >= 0 && initial <= 7 ? initial : 0,
  );

  useEffect(() => {
    const next = new URLSearchParams(params);
    next.set("band", String(activeBand));
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBand]);

  const stage = useMemo(() => STAGE_HANDBOOK[activeBand] ?? STAGE_HANDBOOK[0], [activeBand]);

  return (
    <div>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-10">
        {STAGE_HANDBOOK.map((s) => (
          <button
            key={s.band}
            onClick={() => setActiveBand(s.band)}
            className={[
              "rounded-xl py-3 px-2 text-center border transition bg-gradient-to-br",
              BAND_ACCENTS[s.band],
              activeBand === s.band ? "border-primary/60 ring-1 ring-primary/40" : "border-border/40 hover:border-primary/30",
            ].join(" ")}
          >
            <div className="font-display text-base md:text-lg">{s.band}</div>
            <div className="text-[10px] md:text-xs text-foreground/70 leading-tight mt-0.5">{s.name.replace("The ", "")}</div>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={stage.slug}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.35 }}
          className="rounded-3xl border border-border/40 overflow-hidden"
        >
          <div className={`bg-gradient-to-br ${BAND_ACCENTS[stage.band]} px-6 md:px-10 py-10`}>
            <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/60 mb-2">Band {stage.band}</p>
            <h2 className="font-display text-3xl md:text-4xl mb-3">{stage.name}</h2>
            <p className="text-lg md:text-xl text-foreground/85 italic mb-6">"{stage.tagline}"</p>
            <p className="text-foreground/80 leading-relaxed max-w-3xl mb-4">{stage.identity}</p>
            <p className="text-foreground/65 leading-relaxed max-w-3xl text-sm">
              <span className="text-foreground/40 uppercase tracking-[0.2em] text-[10px] mr-2">Inner experience</span>
              {stage.innerExperience}
            </p>
          </div>

          <div className="px-6 md:px-10 py-10 space-y-12">
            <Block title={`Markers (${stage.markers.length}+)`} subtitle="Specific, observable behaviours that reveal this stage.">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-[15px] text-foreground/85">
                {stage.markers.map((m, i) => (
                  <li key={i} className="flex gap-3 leading-snug"><span className="text-primary/60 mt-1">·</span><span>{m}</span></li>
                ))}
              </ul>
            </Block>

            <BandGraphLayer band={stage.band} />

            <Block title="Yoga paths that fit" subtitle="Which classical path actually works at this stage — and which will backfire.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stage.paths.map((p) => (
                  <div key={p.path} className={`rounded-xl border px-4 py-3 ${FIT_STYLES[p.fit]}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-display text-base">{p.path} Yoga</span>
                      <span className="text-[10px] uppercase tracking-[0.2em] opacity-80">{FIT_LABEL[p.fit]}</span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-snug">{p.why}</p>
                  </div>
                ))}
              </div>
            </Block>

            <Block title="Start here" subtitle="Small, doable. Do these before anything ambitious.">
              <ul className="space-y-2 text-[15px] text-foreground/85">
                {stage.startHere.map((p, i) => (
                  <li key={i} className="flex gap-3 leading-snug">
                    <span className="text-primary/70 font-display w-5 shrink-0">{i + 1}.</span><span>{p}</span>
                  </li>
                ))}
              </ul>
            </Block>

            <Block title="Traps" subtitle="Common ways this stage gets stuck.">
              <ul className="space-y-2 text-[15px] text-foreground/80">
                {stage.traps.map((t, i) => (
                  <li key={i} className="flex gap-3 leading-snug"><span className="text-destructive/70 mt-1">×</span><span>{t}</span></li>
                ))}
              </ul>
            </Block>

            <Block title="Bridge to the next stage" subtitle="What actually moves a person from here to the next band.">
              <p className="text-[15px] text-foreground/85 leading-relaxed">{stage.bridge}</p>
            </Block>

            {stage.scripture && (
              <p className="text-center text-foreground/55 italic text-sm border-t border-border/30 pt-6">{stage.scripture}</p>
            )}

            <div className="flex items-center justify-between pt-4">
              <button onClick={() => setActiveBand(Math.max(0, stage.band - 1))} disabled={stage.band === 0}
                className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 flex items-center gap-1">
                <ChevronRight className="w-4 h-4 rotate-180" /> Previous
              </button>
              <button onClick={() => setActiveBand(Math.min(7, stage.band + 1))} disabled={stage.band === 7}
                className="text-sm text-primary hover:text-primary/80 disabled:opacity-30 flex items-center gap-1">
                Next band <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.section>
      </AnimatePresence>
    </div>
  );
}

function Block({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <section>
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-start justify-between gap-4 text-left mb-4">
        <div>
          <h3 className="font-display text-xl md:text-2xl">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground mt-1 leading-snug">{subtitle}</p>}
        </div>
        <ChevronDown className={`w-5 h-5 mt-1 text-muted-foreground transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && <div>{children}</div>}
    </section>
  );
}
