// ============================================================
// Bell in the Wind — World-Class Rebuild
// ============================================================
// A bell in a void. Don't look away.
// The game measures sustained attention through tab-blur,
// cursor-leave, and bell detection events. The longer you
// stay present, the more the world reveals itself.
//
// Senses: TTS (framing), sound design (bell tone), haptics,
//         ambient particles, breath-synced visuals.
// ============================================================
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import CinematicOverlay from "../shell/CinematicOverlay";

const SERIF = { fontFamily: "'Cormorant Garamond', Georgia, serif" };
const GAME_DURATION_MS = 3 * 60 * 1000; // 3 min
const MIN_INTERVAL = 8000;
const MAX_INTERVAL = 22000;

type Phase = "settle" | "listen" | "reveal";

function Play({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const { say, stop: stopVoice } = useGuruVoice();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [phase, setPhase] = useState<Phase>("settle");
  const [bellOn, setBellOn] = useState(false);
  const [bellCount, setBellCount] = useState(0);
  const [attention, setAttention] = useState(1);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; opacity: number }>>([]);
  
  const startRef = useRef(Date.now());
  const blurCountRef = useRef(0);
  const cursorLeaveRef = useRef(0);
  const bellsRef = useRef(0);
  const bellTimerRef = useRef<number | undefined>(undefined);
  const endedRef = useRef(false);
  const phaseRef = useRef(phase);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Ambient bed
  useEffect(() => {
    sd.bed("temple", 0.05);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Settle phase
  useEffect(() => {
    if (phase !== "settle") return;
    (async () => {
      await say("a bell in the void. don't look away. notice when attention leaves.", "guru");
      await new Promise(r => setTimeout(r, 1200));
      setPhase("listen");
      startRef.current = Date.now();
    })();
  }, [phase, say]);

  // Attention tracking
  useEffect(() => {
    if (phase !== "listen") return;
    
    const onBlur = () => { blurCountRef.current += 1; setAttention(a => Math.max(0, a - 0.15)); buzz("tap"); };
    const onLeave = () => { cursorLeaveRef.current += 1; setAttention(a => Math.max(0, a - 0.1)); };
    const onFocus = () => { setAttention(a => Math.min(1, a + 0.05)); };
    const onEnter = () => { setAttention(a => Math.min(1, a + 0.05)); };
    
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    // Bell scheduler
    const scheduleBell = () => {
      const wait = MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
      bellTimerRef.current = window.setTimeout(() => {
        bellsRef.current += 1;
        setBellCount(bellsRef.current);
        setBellOn(true);
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.frequency.value = 528;
          o.type = "sine";
          g.gain.setValueAtTime(0.0001, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.05);
          g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.4);
          o.connect(g).connect(ctx.destination);
          o.start();
          o.stop(ctx.currentTime + 2.5);
        } catch {}
        window.setTimeout(() => setBellOn(false), 1800);
        scheduleBell();
      }, wait);
    };
    scheduleBell();

    // End timer
    const endTimer = window.setTimeout(() => {
      if (!endedRef.current) {
        endedRef.current = true;
        finish();
      }
    }, GAME_DURATION_MS);

    // Attention recovery
    const recoveryInterval = setInterval(() => {
      setAttention(a => Math.min(1, a + 0.02));
    }, 1000);

    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      if (bellTimerRef.current) clearTimeout(bellTimerRef.current);
      clearTimeout(endTimer);
      clearInterval(recoveryInterval);
    };
  }, [phase]);

  // Particle system
  useEffect(() => {
    if (phase !== "listen") return;
    const interval = setInterval(() => {
      setParticles(prev => {
        const next = [...prev];
        if (next.length < 12) {
          next.push({
            id: Date.now(),
            x: Math.random() * 100,
            y: Math.random() * 100,
            opacity: 0.1 + Math.random() * 0.2,
          });
        }
        return next.filter(p => Date.now() - p.id < 6000);
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [phase]);

  const finish = useCallback(() => {
    setPhase("reveal");
    sd.stopBed();
    stopVoice();
    
    const durationMs = Date.now() - startRef.current;
    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: durationMs,
        bells: bellsRef.current,
        tab_blur_count: blurCountRef.current,
        cursor_leave_count: cursorLeaveRef.current,
        attention_score: +attention.toFixed(3),
        revealed_count: bellsRef.current,
      },
    });
  }, [onEnd, sd, stopVoice, attention]);

  // Reveal phase auto-end
  useEffect(() => {
    if (phase !== "reveal") return;
    const t = setTimeout(() => {
      // Already ended, just wait for reflection
    }, 1000);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <CinematicOverlay tint="warm" />
      
      {/* Ambient gradient */}
      <motion.div
        animate={{ opacity: [0.05, 0.12, 0.05] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-black to-slate-950/30 pointer-events-none"
      />

      {/* Particles */}
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: p.opacity, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 2 }}
            className="absolute rounded-full bg-amber-200/30 pointer-events-none"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: "2px",
              height: "2px",
            }}
          />
        ))}
      </AnimatePresence>

      {/* Settle phase */}
      <AnimatePresence>
        {phase === "settle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 flex items-center justify-center z-20"
          >
            <p className="text-2xl italic text-white/60" style={SERIF}>settling…</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listen phase */}
      <AnimatePresence>
        {phase === "listen" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-between py-12"
          >
            {/* Top status */}
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-amber-200/60">
              <motion.span
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-1 h-1 rounded-full bg-amber-200/80"
              />
              listening · {bellCount} bells
            </div>

            {/* Center - bell visualization */}
            <div className="flex flex-col items-center gap-8">
              <motion.div
                animate={{
                  scale: bellOn ? [1, 1.4, 1] : [1, 1.02, 1],
                  opacity: bellOn ? [0.6, 1, 0.6] : [0.3, 0.4, 0.3],
                }}
                transition={{ duration: bellOn ? 1.8 : 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div
                  className="w-24 h-24 rounded-full bg-amber-200/20 blur-xl"
                  style={{ boxShadow: bellOn ? "0 0 60px rgba(253,224,71,0.5)" : "0 0 20px rgba(253,224,71,0.15)" }}
                />
                <motion.div
                  animate={{ rotate: bellOn ? [0, 15, -15, 0] : 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 flex items-center justify-center text-4xl"
                >
                  🔔
                </motion.div>
              </motion.div>

              {/* Attention meter */}
              <div className="w-48 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-white/40">
                  <span>attention</span>
                  <span>{Math.round(attention * 100)}%</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${attention * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-amber-400"
                  />
                </div>
              </div>

              <p className="text-sm text-white/40 italic" style={SERIF}>
                {bellOn ? "the bell rang — did you hear it?" : "waiting for the bell…"}
              </p>
            </div>

            {/* Bottom - time */}
            <div className="text-center space-y-1">
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/15">
                {Math.floor((Date.now() - startRef.current) / 1000)}s · {Math.round((GAME_DURATION_MS - (Date.now() - startRef.current)) / 1000)}s remaining
              </p>
              {blurCountRef.current > 0 && (
                <p className="text-[9px] text-amber-200/40">
                  attention left {blurCountRef.current} time{blurCountRef.current > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reveal phase */}
      <AnimatePresence>
        {phase === "reveal" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center"
          >
            <p className="text-[10px] uppercase tracking-[0.45em] text-amber-100/60 mb-6">calibration</p>
            <div className="h-px w-10 bg-amber-100/25 mb-6" />
            <p
              className="text-xl sm:text-2xl text-amber-50/90 italic leading-[1.55] max-w-md"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
            >
              "{bellCount > 0 ? `you heard ${bellCount} bells. ${blurCountRef.current > 0 ? "attention left the room " + blurCountRef.current + " time(s)." : "you kept the room."}` : "no bells rang. the void was quiet."}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BellInTheWind() {
  const g = getLabGame("bell-in-the-wind")!;
  return <ConsciousGameShell game={labToMeta(g)}>{({ onEnd }) => <Play onEnd={onEnd} />}</ConsciousGameShell>;
}