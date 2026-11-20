/**
 * ElderAnalyzing — cinematic, screen-by-screen analysis interstitial.
 *
 * Instead of a single stage list, the Elder walks the seeker through five
 * short scenes — each scene reveals one layer of what was just heard:
 *
 *   1. Silence       — breathing orb, "I'm sitting with what you said…"
 *   2. Three Centers — Head / Heart / Gut nodes light up with live values
 *   3. Six Dimensions — radial bars fill in to reading.bands
 *   4. Active Loops  — the dominant loops surface as glowing tags
 *   5. The Path      — Karma / Bhakti / Jnana / Raja, one crystallizes
 *   6. Archetype     — full cinematic reveal + "Reveal full reading →"
 *
 * Each scene auto-advances. The final archetype scene waits for `reading`
 * to arrive, then exposes the continue button. Pure presentation, no DB.
 */
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Heart, Flame, Sparkles } from "lucide-react";
import type { ElderReading as Reading } from "./ElderDialogue";
import { getLoopName } from "@/lib/onboarding/getLoopName";

interface Props {
  reading: Reading | null;
  name: string;
  onContinue: () => void;
}

type Scene = "silence" | "centers" | "dimensions" | "loops" | "archetype";

const SCENE_ORDER: Scene[] = ["silence", "centers", "dimensions", "loops", "archetype"];
const SCENE_MS: Record<Scene, number> = {
  silence: 2200,
  centers: 2800,
  dimensions: 2800,
  loops: 2600,
  archetype: 99999, // waits for user
};

export default function ElderAnalyzing({ reading, name, onContinue }: Props) {
  const [sceneIdx, setSceneIdx] = useState(0);
  const scene = SCENE_ORDER[sceneIdx];

  useEffect(() => {
    if (scene === "archetype") return;
    const t = setTimeout(() => setSceneIdx((i) => Math.min(i + 1, SCENE_ORDER.length - 1)), SCENE_MS[scene]);
    return () => clearTimeout(t);
  }, [scene]);

  // Soft particle field — stable positions
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => ({
        left: (i * 37) % 100,
        top: (i * 53) % 100,
        delay: (i % 7) * 0.25,
        dur: 4 + (i % 5),
      })),
    []
  );

  return (
    <div className="fixed inset-0 z-[120] bg-background overflow-hidden flex flex-col items-center justify-center px-6">
      {/* Cosmic backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, hsl(var(--primary) / 0.22), transparent 60%), radial-gradient(circle at 50% 85%, hsl(var(--primary) / 0.10), transparent 70%)",
        }}
      />
      {/* Drifting particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p, i) => (
          <motion.span
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/50"
            style={{ left: `${p.left}%`, top: `${p.top}%` }}
            animate={{ opacity: [0.1, 0.7, 0.1], scale: [0.6, 1.4, 0.6] }}
            transition={{ duration: p.dur, repeat: Infinity, delay: p.delay }}
          />
        ))}
      </div>

      {/* Scene progress dots */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {SCENE_ORDER.map((s, i) => (
          <span
            key={s}
            className={`h-[3px] rounded-full transition-all duration-500 ${
              i <= sceneIdx ? "w-6 bg-primary" : "w-3 bg-border/40"
            }`}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* SCENE 1 — Silence */}
          {scene === "silence" && (
            <Frame key="silence">
              <div className="mx-auto mb-10 flex justify-center">
                
              </div>
              <Eyebrow>The Elder is listening</Eyebrow>
              <Title>
                {name ? `Sitting with what ${name} shared…` : "Sitting with what you shared…"}
              </Title>
            </Frame>
          )}

          {/* SCENE 2 — Three Centers */}
          {scene === "centers" && (
            <Frame key="centers">
              <Eyebrow>Three centers</Eyebrow>
              <Title>Head, heart, gut — each one speaking</Title>
              <div className="mt-8 grid grid-cols-3 gap-3">
                <CenterNode Icon={Brain}  label="Head"  value={reading?.headHeartGut?.head}  delay={0.1} color="primary" />
                <CenterNode Icon={Heart}  label="Heart" value={reading?.headHeartGut?.heart} delay={0.4} color="primary" />
                <CenterNode Icon={Flame}  label="Gut"   value={reading?.headHeartGut?.gut}   delay={0.7} color="primary" />
              </div>
            </Frame>
          )}

          {/* SCENE 3 — Six dimensions */}
          {scene === "dimensions" && (
            <Frame key="dimensions">
              <Eyebrow>Six inner dimensions</Eyebrow>
              <Title>Mapping the shape of you…</Title>
              <div className="mt-8 space-y-2.5">
                {[
                  { k: "thought",    label: "Thought",    v: reading?.bands?.thought },
                  { k: "emotion",    label: "Emotion",    v: reading?.bands?.emotion },
                  { k: "body",       label: "Body",       v: reading?.bands?.body },
                  { k: "awareness",  label: "Awareness",  v: reading?.bands?.awareness },
                  { k: "action",     label: "Action",     v: reading?.bands?.action },
                  { k: "connection", label: "Connection", v: reading?.bands?.connection },
                ].map((d, i) => (
                  <DimensionBar key={d.k} label={d.label} value={d.v ?? 4} delay={i * 0.18} />
                ))}
              </div>
            </Frame>
          )}

          {/* SCENE 4 — Active loops */}
          {scene === "loops" && (
            <Frame key="loops">
              <Eyebrow>Active loops</Eyebrow>
              <Title>What's quietly running underneath…</Title>
              <div className="mt-10 flex flex-wrap justify-center gap-2.5">
                {(reading?.topLoops ?? ["Self-doubt", "Avoidance", "Over-thinking"]).slice(0, 5).map((loop, i) => (
                  <motion.span
                    key={loop + i}
                    initial={{ opacity: 0, scale: 0.7, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="px-3.5 py-2 rounded-full bg-primary/15 border border-primary/40 text-primary text-sm"
                    style={{ boxShadow: "0 0 24px hsl(var(--primary) / 0.25)" }}
                  >
                    {getLoopName(loop)}
                  </motion.span>
                ))}
              </div>
            </Frame>
          )}

          {/* SCENE 6 — Archetype reveal */}
          {scene === "archetype" && (
            <Frame key="archetype">
              <motion.div
                className="mx-auto mb-6"
                animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-12 h-12 text-primary mx-auto" />
              </motion.div>

              <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-4 text-center">
                The Elder sees you as
              </p>

              {reading ? (
                <>
                  <motion.h1
                    initial={{ opacity: 0, y: 12, letterSpacing: "0.25em" }}
                    animate={{ opacity: 1, y: 0, letterSpacing: "0em" }}
                    transition={{ duration: 1.6, ease: "easeOut" }}
                    className="font-display text-3xl md:text-4xl text-foreground text-center leading-tight"
                  >
                    {reading.archetype}
                  </motion.h1>
                  {reading.archetypeDescription && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2, duration: 1.2 }}
                      className="mt-4 text-sm text-muted-foreground italic max-w-xs text-center mx-auto"
                    >
                      {reading.archetypeDescription}
                    </motion.p>
                  )}
                  <div className="text-center">
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2.2, duration: 0.8 }}
                      onClick={onContinue}
                      className="mt-10 text-xs uppercase tracking-[0.3em] text-primary/80 hover:text-primary transition"
                    >
                      Reveal full reading →
                    </motion.button>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-sm text-center">Sealing the reading…</p>
              )}
            </Frame>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── small presentational helpers ─── */

const Frame = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -14 }}
    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground text-center">
    {children}
  </p>
);

const Title = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-3 text-foreground/90 font-display text-lg text-center">{children}</p>
);

const CenterNode = ({
  Icon, label, value, delay,
}: { Icon: typeof Brain; label: string; value?: number; delay: number; color?: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.85, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    className="flex flex-col items-center gap-2 px-3 py-4 rounded-2xl border border-primary/30 bg-card/30 backdrop-blur-sm"
    style={{ boxShadow: "0 0 30px hsl(var(--primary) / 0.18)" }}
  >
    <motion.div
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 2.4, repeat: Infinity, delay }}
      className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary"
    >
      <Icon className="w-5 h-5" />
    </motion.div>
    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
    <p className="text-lg font-display text-primary">
      {value != null ? value.toFixed(1) : "—"}
    </p>
  </motion.div>
);

const DimensionBar = ({ label, value, delay }: { label: string; value: number; delay: number }) => {
  const pct = Math.max(4, Math.min(100, (value / 10) * 100));
  return (
    <div className="flex items-center gap-3">
      <p className="text-xs text-muted-foreground w-24 shrink-0">{label}</p>
      <div className="flex-1 h-[6px] rounded-full bg-border/30 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
          style={{ boxShadow: "0 0 12px hsl(var(--primary) / 0.5)" }}
        />
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.5 }}
        className="text-[11px] text-primary w-8 text-right tabular-nums"
      >
        {value.toFixed(1)}
      </motion.p>
    </div>
  );
};
