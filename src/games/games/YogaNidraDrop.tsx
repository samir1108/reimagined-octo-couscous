// YOGA NIDRA DROP — World-Class Rebuild
// 10-min guided body scan. Tap each chime if still awake. Measures hypnagogic depth.
// Senses: TTS (elder voice body scan), sound design (chimes + void bed + binaural),
//         haptics (chime buzz + body-part pulse), particles (dissolving body),
//         CinematicOverlay, adaptive chime timing, wake-detection.
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Moon, Sparkles, User } from "lucide-react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import CinematicOverlay from "../shell/CinematicOverlay";

const SERIF = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

const BODY_PARTS = [
  { id: "right-hand", label: "right hand", duration: 8000, x: 70, y: 55 },
  { id: "left-hand", label: "left hand", duration: 8000, x: 30, y: 55 },
  { id: "right-foot", label: "right foot", duration: 8000, x: 60, y: 85 },
  { id: "left-foot", label: "left foot", duration: 8000, x: 40, y: 85 },
  { id: "chest", label: "the chest", duration: 10000, x: 50, y: 45 },
  { id: "belly", label: "the belly", duration: 10000, x: 50, y: 60 },
  { id: "throat", label: "the throat", duration: 8000, x: 50, y: 38 },
  { id: "whole-body", label: "the whole body, dissolving into the floor", duration: 12000, x: 50, y: 50 },
  { id: "dissolved", label: "you are no longer doing anything", duration: 10000, x: 50, y: 50 },
];

const CHIME_INTERVAL = 90000; // chime every 90s to check wakefulness

function Play({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const { say, stop: stopVoice } = useGuruVoice();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [partIdx, setPartIdx] = useState(0);
  const [phase, setPhase] = useState<"settle" | "scan" | "dissolve" | "chime-check" | "integrate">("settle");
  const [taps, setTaps] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number; color: string }>>([]);
  const [chimeCount, setChimeCount] = useState(0);
  const [awakeAtChime, setAwakeAtChime] = useState<number[]>([]);
  const lastChimeTime = useRef(0);

  const part = BODY_PARTS[partIdx];
  const sessionStartRef = useRef(Date.now());
  const partStartRef = useRef(Date.now());
  const chimeTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const endedRef = useRef(false);
  const mountedRef = useRef(true);

  // Void bed
  useEffect(() => {
    sd.bed("void", 0.12);
    return () => sd.stopBed();
  }, []);

  // Dissolving particles
  useEffect(() => {
    if (phase !== "scan" && phase !== "dissolve") return;
    const interval = setInterval(() => {
      setParticles(prev => {
        const next = [...prev];
        const intensity = phase === "dissolve" ? 2 : 1;
        if (next.length < 30 * intensity) {
          for (let i = 0; i < intensity; i++) {
            next.push({
              id: Date.now() + i,
              x: 30 + Math.random() * 40,
              y: 30 + Math.random() * 40,
              size: 2 + Math.random() * 4,
              opacity: 0.15 + Math.random() * 0.25,
              color: phase === "dissolve" ? "#a5b4fc" : "#64748b",
            });
          }
        }
        return next.filter(p => Date.now() - p.id < (phase === "dissolve" ? 8000 : 6000));
      });
    }, phase === "dissolve" ? 200 : 500);
    return () => clearInterval(interval);
  }, [phase]);

  // Body scan progression
  useEffect(() => {
    if (phase !== "scan") return;
    if (!part) return;

    partStartRef.current = Date.now();
    let cancelled = false;
    (async () => {
      await say(part.label, "elder");
      if (cancelled) return;
      await new Promise(r => setTimeout(r, part.duration));
      if (cancelled) return;
      if (partIdx < BODY_PARTS.length - 1) {
        setPartIdx(i => i + 1);
      } else {
        setPhase("dissolve");
        sd.chime("rise", 0.15);
        await say("the whole body, dissolving into the floor", "elder");
        await new Promise(r => setTimeout(r, 6000));
        if (cancelled) return;
        setPhase("chime-check");
        lastChimeTime.current = Date.now();
        startChimeCycle();
      }
    })();
    return () => { cancelled = true; };
  }, [partIdx, phase]);

  // Chime cycle for wake detection
  const startChimeCycle = () => {
    if (endedRef.current) return;
    chimeTimerRef.current = setTimeout(async () => {
      if (endedRef.current) return;
      setChimeCount(c => c + 1);
      lastChimeTime.current = Date.now();
      sd.chime("bell", 0.35);
      buzz("heavy");
      setPhase("chime-check");
      // Wait 4s for tap
      await new Promise(r => setTimeout(r, 4000));
      if (endedRef.current) return;
      setPhase("dissolve");
      startChimeCycle();
    }, CHIME_INTERVAL);
  };

  // Settle phase
  useEffect(() => {
    if (phase !== "settle") return;
    let cancelled = false;
    (async () => {
      sd.chime("rise", 0.1);
      await say("lying down. eyes closed. the body will be scanned.", "elder");
      await new Promise(r => setTimeout(r, 4000));
      if (cancelled) return;
      setPhase("scan");
      partStartRef.current = Date.now();
    })();
    return () => { cancelled = true; };
  }, [phase]);

  // Tap handler
  const handleTap = () => {
    if (phase === "chime-check") {
      const timeSinceChime = Date.now() - lastChimeTime.current;
      setTaps(t => t + 1);
      setAwakeAtChime(prev => [...prev, chimeCount]);
      buzz("tap");
      sd.chime("drop", 0.15);
    }
  };

  // Integrate phase
  useEffect(() => {
    if (phase !== "integrate") return;
    let cancelled = false;
    (async () => {
      sd.chime("drop", 0.18);
      stopVoice();
      await say("the practice ends. carry the stillness.", "elder");
      if (cancelled) return;
      finish();
    })();
    return () => { cancelled = true; };
  }, [phase]);

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    if (chimeTimerRef.current) clearTimeout(chimeTimerRef.current);
    sd.stopBed();
    stopVoice();
    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        body_parts_scanned: BODY_PARTS.length,
        chimes_played: chimeCount,
        taps_at_chime: taps,
        awake_at_chimes: awakeAtChime,
        hypnagogic_depth: Math.max(0, 100 - (taps / Math.max(1, chimeCount)) * 100),
      },
    });
  };

  // Auto-end after ~10 min if no chime response
  useEffect(() => {
    if (phase !== "chime-check" && phase !== "dissolve") return;
    const timer = setTimeout(() => {
      if (!endedRef.current && chimeCount >= 5) {
        setPhase("integrate");
      }
    }, 10 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [phase, chimeCount]);

  return (
    <div className="absolute inset-0 bg-black overflow-hidden" onClick={handleTap}>
      {/* Deep void gradient */}
      <motion.div
        animate={{ opacity: [0.04, 0.1, 0.04] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-b from-indigo-950/15 via-black to-slate-950/20 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85" />
      <CinematicOverlay tint="cool" />

      {/* Dissolving body particles */}
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: p.opacity, scale: 1, y: -30 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: phase === "dissolve" ? 6 : 4, ease: "easeOut" }}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              filter: "blur(1px)",
            }}
          />
        ))}
      </AnimatePresence>

      {/* Top-left: phase pill */}
      <div className="absolute top-6 left-6 z-10">
        <motion.div
          key={phase}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 0.85, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-indigo-200/75"
        >
          <span className="w-1 h-1 rounded-full bg-indigo-200/80 animate-pulse" />
          {phase === "settle" && "settling"}
          {phase === "scan" && `scan · ${part?.label}`}
          {phase === "dissolve" && "dissolving"}
          {phase === "chime-check" && "chime · awake?"}
          {phase === "integrate" && "rest"}
        </motion.div>
      </div>

      {/* Top-right: stats */}
      <div className="absolute top-6 right-6 z-10 text-right space-y-1.5">
        {phase === "scan" && part && (
          <p className="text-[10px] uppercase tracking-widest text-white/40">{partIdx + 1} / {BODY_PARTS.length}</p>
        )}
        {phase === "chime-check" && (
          <>
            <p className="text-[10px] uppercase tracking-widest text-indigo-200/60">chime · {chimeCount}</p>
            <p className="text-[10px] uppercase tracking-widest text-amber-200/65">taps · {taps}</p>
          </>
        )}
        {phase === "integrate" && (
          <p className="text-[10px] uppercase tracking-widest text-indigo-200/60">
            depth · {Math.max(0, 100 - (taps / Math.max(1, chimeCount)) * 100)}%
          </p>
        )}
      </div>

      {/* Center body silhouette */}
      <div className="absolute inset-0 flex items-center justify-center z-5">
        <motion.div
          animate={{
            scale: phase === "dissolve" ? [1, 0.95, 1] : [1, 1.005, 1],
            opacity: phase === "dissolve" ? [0.6, 0.3, 0.6] : [0.4, 0.6, 0.4],
          }}
          transition={{ duration: phase === "dissolve" ? 3 : 8, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <User className="w-64 h-64 text-indigo-200/20" />
          
          {/* Current body part highlight */}
          {phase === "scan" && part && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute rounded-full bg-indigo-300/40 blur-lg pointer-events-none"
              style={{
                left: `${part.x}%`,
                top: `${part.y}%`,
                width: "60px",
                height: "60px",
                transform: "translate(-50%, -50%)",
              }}
            />
          )}

          {/* Chime check pulse */}
          {phase === "chime-check" && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 0.8, 0], scale: [0, 2, 3] }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 rounded-full border-4 border-amber-300/60 pointer-events-none"
            />
          )}
        </motion.div>
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-20 z-10 flex flex-col items-center px-8 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "settle" && (
            <motion.div key="settle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1.6 }} className="text-center">
              <p className="text-3xl sm:text-4xl italic text-indigo-50/90" style={{ fontFamily: "'Cormorant Garamond', serif" }}>yoga nidra drop</p>
              <p className="mt-4 text-sm text-white/55 max-w-xs mx-auto leading-relaxed">guided body scan. tap the chime if you're still here.</p>
            </motion.div>
          )}

          {phase === "scan" && part && (
            <motion.div key={`scan-${part.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="text-center">
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl sm:text-3xl italic text-indigo-50/90 mb-2" style={SERIF}
              >
                feel the {part.label}
              </motion.p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">tap anywhere if the chime sounds</p>
            </motion.div>
          )}

          {phase === "dissolve" && (
            <motion.div key="dissolve" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} className="text-center">
              <p className="text-2xl italic text-indigo-50/90 mb-2" style={SERIF}>the whole body, dissolving</p>
              <p className="text-white/40 text-sm">into the floor</p>
            </motion.div>
          )}

          {phase === "chime-check" && (
            <motion.div key="chime" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5 }} className="text-center">
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1, repeat: 3 }}
                className="mb-6"
              >
                <Bell className="w-16 h-16 mx-auto text-amber-300/80" />
              </motion.div>
              <p className="text-xl italic text-amber-100/90" style={SERIF}>still here? tap.</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mt-2">chime {chimeCount} · tap to confirm</p>
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="integrate" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 1.6 }} className="text-center">
              <p className="text-[10px] uppercase tracking-[0.42em] text-indigo-200/70">rest</p>
              <p className="mt-5 text-lg italic text-indigo-100/50 max-w-sm leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                the practice ends. carry the stillness.
              </p>
              <div className="mt-8 flex items-center justify-center gap-6 text-[10px] uppercase tracking-[0.3em] text-white/40">
                <div>
                  <p className="text-2xl font-light text-amber-200/80">{taps}</p>
                  <p>taps</p>
                </div>
                <div>
                  <p className="text-2xl font-light text-indigo-200/80">{chimeCount}</p>
                  <p>chimes</p>
                </div>
                <div>
                  <p className="text-2xl font-light text-emerald-200/80">{Math.max(0, 100 - (taps / Math.max(1, chimeCount)) * 100)}%</p>
                  <p>depth</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip / safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-20 text-[10px] uppercase tracking-[0.3em] text-white/25 hover:text-indigo-200/70 transition"
      >
        end · save
      </button>
    </div>
  );
}

export default function YogaNidraDrop() {
  const g = getLabGame("yoga-nidra-drop")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <Play onEnd={onEnd} />}
    </ConsciousGameShell>
  );
};
//ok