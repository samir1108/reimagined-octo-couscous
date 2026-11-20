/**
 * ElderReading — analysis screen shown after the Elder dialogue finalizes.
 * User reviews bands / archetype / loops / head-heart-gut / path levels,
 * then chooses (or accepts) a path → triggers onAccept.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import type { ElderReading as Reading } from "./ElderDialogue";
import { getLoopName } from "@/lib/onboarding/getLoopName";

interface Props {
  reading: Reading;
  name: string;
  onAccept: (chosenPath: Reading["recommendedPath"]) => void;
  saving?: boolean;
}

const PATHS: Record<string, { name: string; tagline: string }> = {
  karma:  { name: "Karma",  tagline: "Path of right action and service." },
  bhakti: { name: "Bhakti", tagline: "Path of devotion and the open heart." },
  jnana:  { name: "Jnana",  tagline: "Path of self-inquiry and witnessing." },
  raja:   { name: "Raja",   tagline: "Path of breath, meditation, discipline." },
};

const DIM_LABELS: Record<string, string> = {
  thought: "Thought", emotion: "Emotion", body: "Body",
  awareness: "Awareness", action: "Action", connection: "Connection",
};

export default function ElderReading({ reading, name, onAccept, saving }: Props) {
  const [path, setPath] = useState<Reading["recommendedPath"]>(reading.recommendedPath);
  const [confirming, setConfirming] = useState(false);

  const total = reading.headHeartGut.head + reading.headHeartGut.heart + reading.headHeartGut.gut || 1;
  const hhg = {
    head: reading.headHeartGut.head / total,
    heart: reading.headHeartGut.heart / total,
    gut: reading.headHeartGut.gut / total,
  };

  return (
    <div className="min-h-[100dvh] w-full bg-background overflow-y-auto">
      <div className="max-w-2xl mx-auto px-5 py-10 pb-32">
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
          className="text-[10px] uppercase tracking-[0.4em] text-primary/70 text-center mb-3"
        >
          Your Reading
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}
          className="font-display text-3xl text-foreground text-center leading-tight"
        >
          {reading.archetype}
        </motion.h1>
        {reading.archetypeDescription && (
          <p className="text-muted-foreground text-sm text-center mt-2 italic">{reading.archetypeDescription}</p>
        )}

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}
          className="text-foreground/80 text-base leading-relaxed mt-6 px-2"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {reading.summary}
        </motion.p>

        {/* Starting band */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-8 grid grid-cols-2 gap-3"
        >
          <div className="rounded-2xl border border-border/40 bg-card/40 p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Starting band</p>
            <p className="font-display text-2xl text-foreground mt-1">{Math.max(1, Math.min(11, Math.round(reading.startingBand)))}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Phase {reading.startingPhase} · {reading.startingPhaseName}</p>
          </div>
          <div className="rounded-2xl border border-border/40 bg-card/40 p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Your guide</p>
            <p className="font-display text-2xl text-foreground mt-1 capitalize">{reading.recommendedGuruName}</p>
            {reading.recommendedGuruWhy && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{reading.recommendedGuruWhy}</p>
            )}
          </div>
        </motion.div>

        {/* Dimensions */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-6 rounded-2xl border border-border/40 bg-card/40 p-4"
        >
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Dimension bands</p>
          <div className="space-y-2">
            {Object.entries(reading.bands).map(([k, v]) => (
              <div key={k} className="flex items-center gap-3 text-xs">
                <span className="w-24 text-muted-foreground">{DIM_LABELS[k] ?? k}</span>
                <div className="flex-1 h-1.5 rounded-full bg-border/50 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${Math.min(100, (v / 6) * 100)}%` }} />
                </div>
                <span className="w-8 text-right tabular-nums text-foreground">{v.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Head / Heart / Gut */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="mt-6 rounded-2xl border border-border/40 bg-card/40 p-4"
        >
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Center dominance</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            {(["head", "heart", "gut"] as const).map((k) => (
              <div key={k} className="rounded-xl bg-background/40 py-3">
                <p className="font-display text-2xl text-foreground tabular-nums">{Math.round(hhg[k] * 100)}%</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground capitalize mt-1">{k}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top loops */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="mt-6 rounded-2xl border border-border/40 bg-card/40 p-4"
        >
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Active loops we noticed</p>
          <div className="flex flex-wrap gap-2">
            {reading.topLoops.map((id) => (
              <span key={id} className="px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                {getLoopName(id)}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Inner weather — gunas, energy, body, witness */}
        {(reading.gunas || reading.energy || reading.body || reading.observation) && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
            className="mt-6 rounded-2xl border border-border/40 bg-card/40 p-4 space-y-4"
          >
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Inner weather right now</p>

            {reading.gunas && (
              <div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                  <span>Gunas</span>
                  <span className="tabular-nums">
                    tamas {Math.round(reading.gunas.tamas * 100)}% · rajas {Math.round(reading.gunas.rajas * 100)}% · sattva {Math.round(reading.gunas.sattva * 100)}%
                  </span>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden bg-border/30">
                  <div className="bg-muted-foreground/60" style={{ width: `${reading.gunas.tamas * 100}%` }} />
                  <div className="bg-primary/70" style={{ width: `${reading.gunas.rajas * 100}%` }} />
                  <div className="bg-primary" style={{ width: `${reading.gunas.sattva * 100}%` }} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              {reading.energy && (
                <div className="rounded-lg bg-background/40 border border-border/30 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Energy</p>
                  <p className="text-foreground capitalize">{reading.energy.level}</p>
                  <p className="text-[10px] text-muted-foreground capitalize mt-0.5">center · {reading.energy.primaryCenter.replace("_", " ")}</p>
                </div>
              )}
              {reading.body && (
                <div className="rounded-lg bg-background/40 border border-border/30 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Body</p>
                  <p className="text-foreground">awareness {reading.body.awarenessLevel}/5</p>
                  {reading.body.breathQuality && (
                    <p className="text-[10px] text-muted-foreground capitalize mt-0.5">breath · {reading.body.breathQuality}</p>
                  )}
                </div>
              )}
              {reading.observation && (
                <div className="rounded-lg bg-background/40 border border-border/30 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Witness</p>
                  <p className="text-foreground">{reading.observation.witnessLevel}/5</p>
                  {reading.observation.metacognition && (
                    <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{reading.observation.metacognition}</p>
                  )}
                </div>
              )}
              {reading.body?.primaryHoldings && reading.body.primaryHoldings.length > 0 && (
                <div className="rounded-lg bg-background/40 border border-border/30 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Holding</p>
                  <p className="text-foreground capitalize text-[11px] leading-snug">
                    {reading.body.primaryHoldings.slice(0, 3).join(", ")}
                  </p>
                </div>
              )}
            </div>

            {reading.shadowPatterns && reading.shadowPatterns.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Shadow patterns</p>
                <div className="flex flex-wrap gap-1.5">
                  {reading.shadowPatterns.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-[11px] bg-foreground/[0.04] text-foreground/80 border border-border/40">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {reading.lifeDomainHeat && Object.keys(reading.lifeDomainHeat).length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Where life is hot</p>
                <div className="space-y-1.5">
                  {Object.entries(reading.lifeDomainHeat)
                    .sort((a, b) => (b[1] as number) - (a[1] as number))
                    .slice(0, 5)
                    .map(([k, v]) => (
                      <div key={k} className="flex items-center gap-2 text-[11px]">
                        <span className="w-20 capitalize text-muted-foreground">{k}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-border/30 overflow-hidden">
                          <div className="h-full bg-primary/70" style={{ width: `${(Number(v) / 5) * 100}%` }} />
                        </div>
                        <span className="tabular-nums text-muted-foreground w-6 text-right">{v}/5</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {reading.firstPractice && (
              <div className="mt-2 rounded-lg border border-primary/30 bg-primary/[0.06] px-3 py-2">
                <p className="text-[10px] uppercase tracking-widest text-primary/80 mb-1">First practice</p>
                <p className="text-sm text-foreground/90 italic leading-snug">{reading.firstPractice}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Practice levels — observation, self-inquiry, neti-neti, etc. */}
        {reading.practiceLevels && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.87 }}
            className="mt-6 rounded-2xl border border-border/40 bg-card/40 p-4"
          >
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Practice levels (0–5)</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {Object.entries(reading.practiceLevels).map(([k, v]) => {
                const label = k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
                const lvl = Number(v) || 0;
                return (
                  <div key={k} className="flex items-center gap-2 text-[11px]">
                    <span className="w-24 text-muted-foreground truncate">{label}</span>
                    <div className="flex-1 flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= lvl ? "bg-primary" : "bg-border/40"}`} />
                      ))}
                    </div>
                    <span className="w-4 text-right tabular-nums text-foreground/70">{lvl}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Inner faculties + life context */}
        {(reading.inner || reading.context) && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.88 }}
            className="mt-6 rounded-2xl border border-border/40 bg-card/40 p-4 space-y-4"
          >
            {reading.inner && Object.keys(reading.inner).length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Inner faculties</p>
                <div className="space-y-1.5">
                  {Object.entries(reading.inner).map(([k, v]) => {
                    if (v == null) return null;
                    const label = k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
                    return (
                      <div key={k} className="flex items-center gap-2 text-[11px]">
                        <span className="w-32 text-muted-foreground">{label}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-border/30 overflow-hidden">
                          <div className="h-full bg-primary/70" style={{ width: `${(Number(v) / 5) * 100}%` }} />
                        </div>
                        <span className="tabular-nums text-muted-foreground w-6 text-right">{v}/5</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {reading.context && (
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {reading.context.lifeStage && (
                  <div className="rounded-lg bg-background/40 border border-border/30 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Life stage</p>
                    <p className="text-foreground capitalize">{reading.context.lifeStage.replace(/_/g, " ")}</p>
                  </div>
                )}
                {reading.context.supportSystem && (
                  <div className="rounded-lg bg-background/40 border border-border/30 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Support</p>
                    <p className="text-foreground capitalize">{reading.context.supportSystem}</p>
                  </div>
                )}
                {reading.context.priorExperienceYears != null && (
                  <div className="rounded-lg bg-background/40 border border-border/30 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Prior practice</p>
                    <p className="text-foreground">{reading.context.priorExperienceYears} yr{reading.context.priorExperienceYears === 1 ? "" : "s"}</p>
                  </div>
                )}
                {reading.context.availableSlotsPerDay != null && (
                  <div className="rounded-lg bg-background/40 border border-border/30 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Daily slots</p>
                    <p className="text-foreground">{reading.context.availableSlotsPerDay}/4</p>
                  </div>
                )}
                {reading.context.traditionsExplored && reading.context.traditionsExplored.length > 0 && (
                  <div className="col-span-2 rounded-lg bg-background/40 border border-border/30 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Traditions touched</p>
                    <div className="flex flex-wrap gap-1">
                      {reading.context.traditionsExplored.map((t, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-foreground/[0.05] text-foreground/80 border border-border/40 capitalize">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Roadmap note — engine handles path selection silently */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          className="mt-6 rounded-2xl border border-primary/20 bg-primary/[0.04] p-4"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary/70 mb-2">On your roadmap</p>
          <p className="text-sm text-foreground/85 leading-relaxed">
            The engine has already chosen your starting orientation — <span className="text-primary capitalize">{reading.recommendedPath}</span> — and will weave the other paths (Karma, Bhakti, Jnana, Raja) in as your bands shift. Nothing to pick here.
          </p>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            We recalibrate continuously — every session, every loop, every regression — so your path stays alive, never fixed.
          </p>
        </motion.div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-sm border-t border-border/40 p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setConfirming(true)}
            disabled={saving}
            className="w-full px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-display tracking-wide disabled:opacity-50 hover:bg-primary/90 transition"
          >
            {saving ? "Beginning…" : "Begin"}
          </button>
        </div>
      </div>

      {/* Begin confirmation */}
      {confirming && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm rounded-3xl border border-primary/30 bg-card/80 p-6 text-center"
          >
            <p className="text-[10px] uppercase tracking-[0.4em] text-primary/70 mb-3">Ready</p>
            <h2 className="font-display text-2xl text-foreground">Your journey begins</h2>
            <p className="text-sm text-muted-foreground mt-2 italic leading-relaxed">
              The engine takes it from here — sessions, gurus, and practices will shape themselves around you, and recalibrate as you grow.
            </p>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setConfirming(false)}
                disabled={saving}
                className="flex-1 px-4 py-3 rounded-full border border-border/50 text-foreground/80 hover:bg-foreground/[0.04] transition text-sm"
              >
                Wait
              </button>
              <button
                onClick={() => onAccept(path)}
                disabled={saving}
                className="flex-1 px-4 py-3 rounded-full bg-primary text-primary-foreground font-display tracking-wide disabled:opacity-50 hover:bg-primary/90 transition text-sm"
              >
                {saving ? "Beginning…" : "Yes, begin"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
