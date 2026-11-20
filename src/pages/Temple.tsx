import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowLeft, Volume2, VolumeX, Sparkles,
} from "lucide-react";
import Seo from "@/components/seo/Seo";

import visionHero from "@/assets/showroom/vision-hero.jpg";
// vision video removed — using animated cosmic gradient instead
import { WORLDS, WORLDS_BY_ID, type World, type WorldId } from "./temple/worldData";
import CustomCursor from "./temple/CustomCursor";
import EmberParticles from "./temple/EmberParticles";
// SamBranching removed per user request
import WorldDeepDive from "./temple/WorldDeepDive";
import EcosystemMandala from "./temple/EcosystemMandala";
import LineageIntro, { hasSeenLineageIntro, markLineageIntroSeen } from "@/components/temple/LineageIntro";

/* ─────────────────────────────────────────────────────────────────────────────
   ConsciousOS Temple — cinematic walk-through, Awwwards register.
   Phases: vision → sam (branching) → grid → world (deep-dive)
   ──────────────────────────────────────────────────────────────────────── */

type Phase = "vision" | "sam" | "grid" | "world";

/* ────────────────────────────  GLOBAL AMBIENT  ───────────────────────────── */

function StarField() {
  const stars = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.4,
        delay: Math.random() * 6,
        dur: Math.random() * 4 + 3,
      })),
    [],
  );
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden>
      {stars.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-amber-200/70"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animation: `temple-twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes temple-twinkle {
          0%,100% { opacity: .2; transform: scale(1) }
          50%     { opacity: 1;  transform: scale(1.4) }
        }
      `}</style>
    </div>
  );
}

/* ──────────────  VISION PHASE  ───────────── */

function VisionPhase({ onNext }: { onNext: () => void }) {
  return (
    <motion.section
      key="vision"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.4 }}
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
    >
      {/* Animated cosmic background instead of video */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, hsl(var(--primary) / 0.20) 0%, transparent 55%), " +
              "radial-gradient(ellipse at 70% 60%, hsl(var(--accent) / 0.14) 0%, transparent 50%), " +
              "radial-gradient(ellipse at 50% 80%, hsl(var(--secondary) / 0.12) 0%, transparent 55%), " +
              "linear-gradient(to bottom, hsl(var(--background) / 0.85), hsl(var(--background) / 0.95))",
          }}
        />
        {/* Floating light orbs */}
        {[
          { left: "25%", top: "30%", dur: 14, delay: 0, color: "var(--primary)", size: "35vmin" },
          { left: "65%", top: "55%", dur: 18, delay: 3, color: "var(--accent)", size: "28vmin" },
          { left: "45%", top: "70%", dur: 12, delay: 6, color: "var(--secondary)", size: "22vmin" },
        ].map((orb, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-30"
            style={{
              left: orb.left,
              top: orb.top,
              width: orb.size,
              height: orb.size,
              background: `radial-gradient(circle, hsl(${orb.color} / 0.28) 0%, transparent 70%)`,
              filter: "blur(50px)",
              animation: `vision-orb-${i} ${orb.dur}s ease-in-out ${orb.delay}s infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes vision-orb-0 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(3vw, -2vh) scale(1.1); }
        }
        @keyframes vision-orb-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-2vw, 2vh) scale(1.08); }
        }
        @keyframes vision-orb-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(1.5vw, -1.5vh) scale(1.12); }
        }
      `}</style>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/80" />

      <div className="relative z-10 max-w-3xl text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1.2 }}
          className="text-xs uppercase tracking-[0.4em] text-amber-200/80 mb-6"
        >
          A 60-second vision
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 1.4 }}
          className="text-4xl md:text-6xl lg:text-7xl font-serif text-amber-50 leading-[1.05] tracking-tight"
        >
          We are not building<br />
          another app.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.6, duration: 1.4 }}
          className="mt-8 text-lg md:text-xl text-amber-100/80 max-w-xl mx-auto leading-relaxed"
        >
          We are building a temple for the inner life — a place you walk through,
          touch things, feel what's possible, and decide who you want to become.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4, duration: 1 }}
          className="mt-12 flex justify-center"
        >
          <button
            onClick={onNext}
            className="group inline-flex items-center justify-center gap-3 rounded-full bg-amber-100 text-black px-10 py-5 text-base font-semibold hover:bg-amber-200 hover:scale-105 transition-all shadow-[0_0_40px_rgba(251,191,36,0.25)]"
          >
            Go to Temple
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
}

/* ──────────────  GRID PHASE — living portal doors  ───────────── */

function TiltDoor({
  world, index, onOpen,
}: { world: World; index: number; onOpen: (w: World) => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50 });

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setTilt({ rx: (0.5 - y) * 10, ry: (x - 0.5) * 14, mx: x * 100, my: y * 100 });
  };
  const reset = () => setTilt({ rx: 0, ry: 0, mx: 50, my: 50 });

  return (
    <motion.button
      ref={ref}
      onClick={() => onOpen(world)}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.15 * index, duration: 0.8 }}
      whileHover={{ y: -6 }}
      className="group relative text-left overflow-hidden rounded-3xl border border-amber-100/10 bg-black/40 aspect-[4/3] md:aspect-[16/10] will-change-transform"
      style={{
        perspective: 1200,
        transform: `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: "transform 200ms ease-out",
      }}
    >
      {/* Static base image */}
      <img
        src={world.image}
        alt={world.title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Hover visual: animated gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${tilt.mx}% ${tilt.my}%, hsl(${world.accent} / .35), transparent 55%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none mix-blend-overlay"
        style={{ background: `radial-gradient(180px circle at ${tilt.mx}% ${tilt.my}%, hsl(${world.accent} / .5), transparent 70%)` }}
      />

      {/* Living portal motif overlay — varies per world */}
      <LivingMotif motif={world.motif} accent={world.accent} />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      <div
        className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end"
        style={{ transform: "translateZ(40px)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span
            className="inline-flex items-center justify-center w-9 h-9 rounded-full"
            style={{ background: `hsl(${world.accent} / .2)`, color: `hsl(${world.accent})` }}
          >
            <world.Icon className="w-4 h-4" />
          </span>
          <span className="text-[11px] uppercase tracking-[0.25em] text-amber-100/60">
            Enter the world
          </span>
        </div>
        <h3 className="text-2xl md:text-3xl font-serif text-amber-50 mb-1">{world.title}</h3>
        <p className="text-amber-100/70 text-sm md:text-base">{world.tagline}</p>
        <div className="mt-4 inline-flex items-center gap-2 text-amber-100 text-sm opacity-70 group-hover:opacity-100 transition">
          Open <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
        </div>
      </div>
    </motion.button>
  );
}

function LivingMotif({ motif, accent }: { motif: World["motif"]; accent: string }) {
  if (motif === "grid") {
    return (
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(${accent} / .35) 1px, transparent 1px), linear-gradient(90deg, hsl(${accent} / .35) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          animation: "temple-grid-shift 14s linear infinite",
        }}
      />
    );
  }
  if (motif === "mandala") {
    return (
      <div
        className="absolute inset-0 opacity-25 pointer-events-none mix-blend-screen"
        style={{
          background: `radial-gradient(circle at 50% 60%, hsl(${accent} / .8), transparent 35%), conic-gradient(from 0deg at 50% 60%, hsl(${accent} / .3), transparent 30%, hsl(${accent} / .3) 60%, transparent 90%)`,
          animation: "temple-mandala-rotate 60s linear infinite",
          transformOrigin: "50% 60%",
        }}
      />
    );
  }
  if (motif === "ink") {
    return (
      <div
        className="absolute inset-0 opacity-40 pointer-events-none mix-blend-overlay"
        style={{
          background: `radial-gradient(60% 40% at 30% 70%, hsl(${accent} / .55), transparent 70%), radial-gradient(40% 30% at 70% 30%, hsl(${accent} / .4), transparent 70%)`,
          filter: "blur(4px)",
          animation: "temple-ink-drift 18s ease-in-out infinite alternate",
        }}
      />
    );
  }
  // pulse
  return (
    <div
      className="absolute inset-0 pointer-events-none mix-blend-screen"
      style={{
        background: `radial-gradient(circle at 50% 60%, hsl(${accent} / .35), transparent 50%)`,
        animation: "temple-pulse 5s ease-in-out infinite",
      }}
    />
  );
}

function GridPhase({ onOpen, onBack }: { onOpen: (w: World) => void; onBack: () => void }) {
  return (
    <motion.section
      key="grid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="relative min-h-[100dvh] px-4 md:px-10 py-16"
    >
      <style>{`
        @keyframes temple-grid-shift {
          to { background-position: 32px 32px }
        }
        @keyframes temple-mandala-rotate {
          to { transform: rotate(360deg) }
        }
        @keyframes temple-ink-drift {
          0%   { transform: scale(1) translateX(0) }
          100% { transform: scale(1.15) translateX(20px) }
        }
        @keyframes temple-pulse {
          0%,100% { opacity: .4 }
          50%     { opacity: .9 }
        }
      `}</style>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-amber-100/70 hover:text-amber-100 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Sam
          </button>
          <div className="text-xs uppercase tracking-[0.3em] text-amber-200/60">
            The Temple
          </div>
        </div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-6xl font-serif text-amber-50 leading-tight mb-4 max-w-3xl"
        >
          Four doors.<br />
          <span className="text-amber-200/80">Pick the one your body recognizes.</span>
        </motion.h2>
        <p className="text-amber-100/60 max-w-xl mb-14">
          Each door opens into a full world — programs, practices, masters, mirrors and games built
          specifically for that life.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6" style={{ perspective: 1400 }}>
          {WORLDS.map((w, i) => (
            <TiltDoor key={w.id} world={w} index={i} onOpen={onOpen} />
          ))}
        </div>

        <EcosystemMandala />

        <CatalogShelf />
      </div>
    </motion.section>
  );
}

/* ──────────────  BROWSE THE FULL CATALOG  ───────────── */

function CatalogShelf() {
  const navigate = useNavigate();
  const items = [
    { title: "Programs",  count: "80+ structured journeys",  blurb: "From 7-day resets to 90-day arcs — built around real lives.",            to: "/auth?redirect=/app/library",  accent: "38 95% 55%" },
    { title: "Masters",   count: "118 living teachers",       blurb: "Chat with Adi Shankara, Ramana, Lao Tzu, Krishnamurti — and 114 more.", to: "/auth?redirect=/app/masters",   accent: "32 90% 60%" },
    { title: "Practices", count: "400+ daily practices",      blurb: "Witness, breath, kriya, self-inquiry. Tuned to where you actually are.", to: "/auth?redirect=/app/practice",  accent: "44 80% 60%" },
    { title: "Games",     count: "Conscious games",           blurb: "Train attention, breath, and presence — through play.",                  to: "/auth?redirect=/app/library?tab=games", accent: "20 90% 60%" },
    { title: "The Mirror",count: "11-layer analytics",        blurb: "See your inner life as data — without flattening it.",                  to: "/auth?redirect=/app/analytics", accent: "48 90% 65%" },
    { title: "Council",   count: "Multi-master synthesis",    blurb: "Bring 3-7 masters into one room. Ask one question.",                     to: "/auth?redirect=/app/council",   accent: "36 85% 58%" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1 }}
      className="mt-24"
    >
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-amber-200/60 mb-3">
            Or — if you'd rather wander
          </div>
          <h3 className="text-3xl md:text-4xl font-serif text-amber-50 leading-tight max-w-2xl">
            Browse the full catalog.
          </h3>
          <p className="text-amber-100/60 mt-2 max-w-xl text-sm md:text-base">
            Everything inside the temple — masters, programs, practices, games, the mirror — open to look around.
          </p>
        </div>
        <button
          onClick={() => navigate("/auth")}
          className="hidden md:inline-flex items-center gap-2 rounded-full border border-amber-100/30 text-amber-100/90 px-5 py-3 text-sm hover:bg-amber-100/10 transition"
        >
          Step inside <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it, i) => (
          <motion.button
            key={it.title}
            onClick={() => navigate(it.to)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 * i, duration: 0.6 }}
            whileHover={{ y: -4 }}
            className="group relative text-left overflow-hidden rounded-2xl border border-amber-100/10 bg-black/50 backdrop-blur-sm p-6 transition hover:border-amber-200/40"
          >
            <div
              className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition duration-700 blur-3xl pointer-events-none"
              style={{ background: `hsl(${it.accent} / .45)` }}
            />
            <div className="relative">
              <div className="text-[10px] uppercase tracking-[0.25em] text-amber-200/60 mb-3">
                {it.count}
              </div>
              <div className="text-xl md:text-2xl font-serif text-amber-50 mb-2">{it.title}</div>
              <p className="text-sm text-amber-100/65 leading-relaxed mb-5">{it.blurb}</p>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-amber-100/80 group-hover:text-amber-100 transition">
                Open <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

/* ──────────────  PAGE TRANSITION MASK  ───────────── */

function PhaseMask({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="mask"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          exit={{ scaleY: 0 }}
          transition={{ duration: 0.5, ease: [0.83, 0, 0.17, 1] }}
          style={{ transformOrigin: "bottom" }}
          className="fixed inset-0 z-[55] bg-gradient-to-b from-amber-950 via-black to-black pointer-events-none"
        />
      )}
    </AnimatePresence>
  );
}

/* ────────────────────────────  ROOT  ──────────────────────────────────── */

export default function Temple() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("vision");
  const [currentWorld, setCurrentWorld] = useState<World | null>(null);
  const [muted, setMuted] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [showLineage, setShowLineage] = useState<boolean>(() => !hasSeenLineageIntro());
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<{ gain: GainNode; oscs: OscillatorNode[]; baseFreqs: number[] } | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Smoothly switch phases with a curtain mask
  const goPhase = (next: Phase) => {
    setTransitioning(true);
    window.setTimeout(() => {
      setPhase(next);
      window.setTimeout(() => setTransitioning(false), 300);
    }, 280);
  };

  // Ambient drone synth — root frequency adapts per world
  const droneRoot = currentWorld?.droneRoot ?? 110;
  useEffect(() => {
    if (muted) {
      const nodes = audioNodesRef.current;
      if (nodes && audioCtxRef.current) {
        nodes.gain.gain.cancelScheduledValues(audioCtxRef.current.currentTime);
        nodes.gain.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 0.6);
      }
      return;
    }
    try {
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new Ctx();
      }
      const ctx = audioCtxRef.current!;
      if (ctx.state === "suspended") void ctx.resume();

      if (!audioNodesRef.current) {
        const gain = ctx.createGain();
        gain.gain.value = 0;
        gain.connect(ctx.destination);

        const ratios = [1, 1.5, 2, 2.5198]; // root, 5th, oct, ~minor 3rd above oct
        const baseFreqs = ratios.map((r) => droneRoot * r);
        const oscs = baseFreqs.map((f, i) => {
          const o = ctx.createOscillator();
          o.type = i === 0 ? "sine" : "triangle";
          o.frequency.value = f;
          const og = ctx.createGain();
          og.gain.value = i === 0 ? 0.35 : 0.08;
          o.connect(og).connect(gain);
          o.start();
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.value = 0.05 + i * 0.03;
          lfoGain.gain.value = 1.5;
          lfo.connect(lfoGain).connect(o.detune);
          lfo.start();
          return o;
        });
        audioNodesRef.current = { gain, oscs, baseFreqs };
      }

      // Retune oscillators to current world's root
      const ratios = [1, 1.5, 2, 2.5198];
      audioNodesRef.current.oscs.forEach((o, i) => {
        o.frequency.cancelScheduledValues(ctx.currentTime);
        o.frequency.linearRampToValueAtTime(droneRoot * ratios[i], ctx.currentTime + 1.5);
      });

      const g = audioNodesRef.current.gain;
      g.gain.cancelScheduledValues(ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 1.2);
    } catch {
      /* audio unavailable — fail silently */
    }
  }, [muted, droneRoot]);

  return (
    <div className="relative min-h-[100dvh] bg-black text-amber-50 selection:bg-amber-200 selection:text-black">
      <Seo
        title="The ConsciousOS Temple — A walk-through of the inner life"
        description="A cinematic walk-through of ConsciousOS — masters, programs, practices, games and mirrors. Pick the door your life recognizes."
        canonicalPath="/temple"
      />

      <CustomCursor />
      <StarField />
      <EmberParticles count={36} />
      <PhaseMask show={transitioning} />

      {/* Top utility bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 md:px-8 py-4">
        <button
          onClick={() => navigate("/")}
          className="text-xs uppercase tracking-[0.3em] text-amber-100/70 hover:text-amber-100"
        >
          ← ConsciousOS
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/bience")}
            className="inline-flex items-center gap-2 rounded-full border border-amber-100/25 bg-amber-100/[0.06] px-3.5 py-2 text-[10px] uppercase tracking-[0.26em] text-amber-100/80 backdrop-blur transition hover:border-amber-100/45 hover:bg-amber-100/10 hover:text-amber-50"
            aria-label="Open Bience ambient worlds"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Bience
          </button>
          <button
            onClick={() => setMuted((m) => !m)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-amber-100/20 text-amber-100/70 hover:bg-amber-100/10 bg-black/30 backdrop-blur"
            aria-label={muted ? "Unmute" : "Mute"}
            title={muted ? "Sound off" : "Sound on"}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === "vision" && (
          <VisionPhase
            key="vision"
            onNext={() => goPhase("grid")}
          />
        )}
        {phase === "sam" && (
          <GridPhase
            key="sam-redirect"
            onOpen={(w) => {
              setCurrentWorld(w);
              goPhase("world");
            }}
            onBack={() => goPhase("vision")}
          />
        )}
        {phase === "grid" && (
          <GridPhase
            key="grid"
            onOpen={(w) => {
              setCurrentWorld(w);
              goPhase("world");
            }}
            onBack={() => goPhase("vision")}
          />
        )}

        {phase === "world" && currentWorld && (
          <WorldDeepDive
            key={`world-${currentWorld.id}`}
            world={currentWorld}
            onClose={() => {
              setCurrentWorld(null);
              goPhase("grid");
            }}
          />
        )}
      </AnimatePresence>

      {showLineage && (
        <LineageIntro
          onComplete={() => {
            markLineageIntroSeen();
            setShowLineage(false);
          }}
        />
      )}
    </div>
  );
}
