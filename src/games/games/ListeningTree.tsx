// LISTENING TREE — World-Class Rebuild
// Ambient mic listens for 60s. AI describes what your environment said about you.
// Senses: mic (envelope, breath), TTS (guru framing), STT (spoken reflection),
//         sound design (ambient bed, chimes), haptics (envelope buzz),
//         particles (sound visualization), CinematicOverlay.
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, TreePine, Ear } from "lucide-react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useBreathMic } from "../shell/useBreathMic";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import CinematicOverlay from "../shell/CinematicOverlay";

const SERIF = { fontFamily: "'Cormorant Garamond', Georgia, serif" };
const LISTEN_DURATION_MS = 60_000;

type Phase = "settle" | "listen" | "reflect" | "read" | "integrate";

function Play({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [phase, setPhase] = useState<Phase>("settle");
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number; color: string }>>([]);
  const [reading, setReading] = useState("");
  const [reflection, setReflection] = useState("");
  const [listening, setListening] = useState(false);
  const [envelopeHistory, setEnvelopeHistory] = useState<number[]>([]);
  
  const peakRef = useRef(0);
  const avgRef = useRef(0);
  const countRef = useRef(0);
  const sessionStartRef = useRef(Date.now());
  const phaseStartRef = useRef(Date.now());
  const endedRef = useRef(false);

  // Ambient bed — forest night
  useEffect(() => {
    sd.bed("forest", 0.08);
    return () => sd.stopBed();
  }, []);

  // Phase transitions
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.15);
        await say("a tree that listens. the world speaks through sound.", "guru");
        await new Promise(r => setTimeout(r, 1000));
        await say("sit still. let the microphone hear what you cannot.", "guru");
        setPhase("listen");
        phaseStartRef.current = Date.now();
      } else if (phase === "listen") {
        // Auto-advance after listen duration
      } else if (phase === "reflect") {
        sd.chime("drop", 0.18);
        await say("what did the world say about you? speak when ready.", "guru");
        try { await transcribe.start(); setListening(true); } catch {}
      } else if (phase === "read") {
        if (listening) {
          setListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setReflection(r.transcript.trim().slice(0, 300));
        }
        // Call AI reflection
        try {
          const { data } = await supabase.functions.invoke("reflect-game", {
            body: { 
              gameId: "listening-tree", 
              signals: { 
                peak_env: peakRef.current, 
                avg_env: avgRef.current, 
                envelope_samples: envelopeHistory.slice(-20),
                cycles: breath.cycles,
                sighs: breath.sighs,
                spoken_reflection: reflection 
              }, 
              durationMs: Date.now() - sessionStartRef.current, 
              outcome: "completed" 
            },
          });
          setReading((data?.reflection || "the world spoke quietly today. you listened.") + "");
        } catch {
          setReading("the world spoke quietly today. you listened.");
        }
        setPhase("integrate");
        phaseStartRef.current = Date.now();
      } else if (phase === "integrate") {
        sd.chime("drop", 0.15);
        stopVoice();
        await say("the tree remembers. carry the listening forward.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  // Listen phase — envelope tracking + particles + haptics
  useEffect(() => {
    if (phase !== "listen") return;
    
    const watch = setInterval(() => {
      if (breath.envelope > peakRef.current) peakRef.current = breath.envelope;
      countRef.current += 1;
      avgRef.current = (avgRef.current * (countRef.current - 1) + breath.envelope) / countRef.current;
      setEnvelopeHistory(prev => [...prev.slice(-49), breath.envelope]);
    }, 200);

    const particleInterval = setInterval(() => {
      const intensity = breath.envelope * 3;
      if (intensity > 0.1) {
        setParticles(prev => {
          const next = [...prev];
          next.push({
            id: Date.now(),
            x: 20 + Math.random() * 60,
            y: 40 + Math.random() * 40,
            size: 2 + intensity * 8,
            opacity: 0.15 + intensity * 0.3,
            color: intensity > 0.5 ? "#fbbf24" : intensity > 0.2 ? "#fcd34d" : "#a3a3a3",
          });
          return next.filter(p => Date.now() - p.id < 4000);
        });
      }
      if (breath.envelope > 0.3) buzz("tap");
    }, 300);

    const endTimer = setTimeout(() => {
      setPhase("reflect");
    }, LISTEN_DURATION_MS);

    return () => {
      clearInterval(watch);
      clearInterval(particleInterval);
      clearTimeout(endTimer);
    };
  }, [phase, buzz, breath.envelope]);

  // Idle particles during other phases
  useEffect(() => {
    if (phase === "listen") return;
    const interval = setInterval(() => {
      setParticles(prev => {
        const next = [...prev];
        if (next.length < 8) {
          next.push({
            id: Date.now(),
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 1.5,
            opacity: 0.08,
            color: "#737373",
          });
        }
        return next.filter(p => Date.now() - p.id < 8000);
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [phase]);

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    sd.stopBed();
    stopVoice();
    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        listen_duration_ms: LISTEN_DURATION_MS,
        peak_envelope: +peakRef.current.toFixed(4),
        avg_envelope: +avgRef.current.toFixed(4),
        envelope_samples: envelopeHistory.slice(-20),
        cycles_detected: breath.cycles,
        sighs_detected: breath.sighs,
        spoken_reflection: reflection || null,
        ai_reading: reading || null,
      },
    });
  };

  const startReflection = async () => { try { await transcribe.start(); setListening(true); } catch {} };
  const stopReflection = async () => {
    setListening(false);
    const r = await transcribe.stop();
    if (r?.transcript) setReflection(r.transcript.trim().slice(0, 300));
    setPhase("read");
  };

  const elapsed = phase === "listen" ? Date.now() - phaseStartRef.current : 0;
  const progress = phase === "listen" ? Math.min(1, elapsed / LISTEN_DURATION_MS) : 1;

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Forest night gradient */}
      <motion.div
        animate={{ opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 14, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-b from-emerald-950/25 via-black to-slate-950/40 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
      <CinematicOverlay tint="cool" />

      {/* Sound visualization particles */}
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: p.opacity, scale: 1, y: -20 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
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
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-emerald-200/75"
        >
          <span className="w-1 h-1 rounded-full bg-emerald-200/80 animate-pulse" />
          {phase === "settle" && "settling"}
          {phase === "listen" && `listening · ${Math.round((1 - progress) * 60)}s`}
          {phase === "reflect" && "speak"}
          {phase === "read" && "reading"}
          {phase === "integrate" && "rest"}
        </motion.div>
      </div>

      {/* Top-right: mic status */}
      <div className="absolute top-6 right-6 z-10 text-right space-y-1.5">
        <div className="flex items-center justify-end gap-1.5">
          {breath.ready ? <Mic className="w-3 h-3 text-emerald-200/70" /> : <MicOff className="w-3 h-3 text-white/30" />}
          <span className="text-[10px] uppercase tracking-widest text-white/50">{breath.ready ? "mic active" : "no mic"}</span>
        </div>
        {phase === "listen" && (
          <>
            <p className="text-[10px] uppercase tracking-widest text-white/40">peak · {peakRef.current.toFixed(3)}</p>
            <p className="text-[10px] uppercase tracking-widest text-emerald-200/65">avg · {avgRef.current.toFixed(3)}</p>
          </>
        )}
      </div>

      {/* Center tree visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5">
        <motion.div
          animate={{
            scale: [1, 1.005, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="text-8xl opacity-15 text-emerald-300/30"
        >
          <TreePine />
        </motion.div>
      </div>

      {/* Bottom phase content */}
      <div className="absolute inset-x-0 bottom-20 z-10 flex flex-col items-center px-8 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "settle" && (
            <motion.div key="settle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1.6 }} className="text-center">
              <p className="text-3xl sm:text-4xl italic text-emerald-50/90" style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.02em" }}>the listening tree</p>
              <p className="mt-4 text-sm text-white/55 max-w-xs mx-auto leading-relaxed">it hears what you miss.</p>
            </motion.div>
          )}

          {phase === "listen" && (
            <motion.div key="listen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="text-center w-full max-w-md">
              <motion.div
                animate={{ scale: [1, 1.02, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center justify-center gap-3 mb-6"
              >
                <Ear className="w-6 h-6 text-emerald-200/60" />
                <motion.span
                  animate={{ opacity: [0.3, 0.9, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-emerald-200/80"
                />
                <span className="text-[10px] uppercase tracking-[0.4em] text-emerald-200/70">listening</span>
              </motion.div>

              {/* Progress ring */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="64" cy="64" r="58"
                    fill="none" stroke="white" strokeWidth="2" opacity="0.08"
                  />
                  <motion.circle
                    cx="64" cy="64" r="58"
                    fill="none" stroke="#fcd34d" strokeWidth="3" opacity="0.85"
                    strokeDasharray="364.4"
                    initial={{ strokeDashoffset: 364.4 }}
                    animate={{ strokeDashoffset: 364.4 * (1 - progress) }}
                    transition={{ duration: 0.3, ease: "linear" }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-xl font-light text-white/90" style={SERIF}>
                    {Math.round((1 - progress) * 60)}s
                  </p>
                </div>
              </div>

              {/* Live envelope bars */}
              <div className="flex items-end justify-center gap-1 h-20 mb-4" style={{ width: "100%", maxWidth: "280px" }}>
                {envelopeHistory.slice(-20).map((env, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(4, env * 100)}%` }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 rounded-t bg-gradient-to-t from-emerald-300/90 to-emerald-500/40"
                  />
                ))}
              </div>

              <p className="text-[11px] uppercase tracking-[0.3em] text-white/30">
                {breath.envelope > 0.3 ? "sound rising…" : breath.envelope > 0.1 ? "faint murmur" : "silence"}
              </p>
            </motion.div>
          )}

          {phase === "reflect" && (
            <motion.div key="reflect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} className="text-center pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-emerald-50/90 mb-6 leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>what did the world say?</p>
              {reflection ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg italic text-emerald-100/85 max-w-md leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>"{reflection}"</motion.p>
              ) : listening ? (
                <button onClick={stopReflection} className="px-6 py-2.5 rounded-full border border-emerald-200/40 text-emerald-100 text-[11px] uppercase tracking-[0.3em] bg-emerald-500/10 backdrop-blur-sm animate-pulse" style={{ boxShadow: "0 0 30px rgba(16,185,129,0.2)" }}>
                  ● listening · tap when done
                </button>
              ) : (
                <button onClick={startReflection} className="px-6 py-2.5 rounded-full border border-white/25 text-white/80 text-[11px] uppercase tracking-[0.3em] hover:bg-white/5 backdrop-blur-sm">
                  speak your reflection
                </button>
              )}
            </motion.div>
          )}

          {phase === "read" && (
            <motion.div key="read" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} className="text-center max-w-lg">
              <p className="text-[10px] uppercase tracking-[0.45em] text-emerald-100/60 mb-4">the reading</p>
              <div className="h-px w-12 bg-emerald-300/30 mx-auto mb-4" />
              <p
                className="text-lg sm:text-xl text-white/85 italic leading-relaxed"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
              >
                "{reading}"
              </p>
              {reflection && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-2">your words</p>
                  <p className="text-sm italic text-emerald-200/70" style={SERIF}>"{reflection}"</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="integrate" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 1.6 }} className="text-center">
              <p className="text-[10px] uppercase tracking-[0.42em] text-emerald-200/70">rest</p>
              <p className="mt-5 text-lg italic text-emerald-100/50 max-w-sm leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                the tree remembers. carry the listening forward.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip / safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-20 text-[10px] uppercase tracking-[0.3em] text-white/25 hover:text-emerald-200/70 transition"
      >
        end · save
      </button>
    </div>
  );
}

export default function ListeningTree() {
  const g = getLabGame("listening-tree")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <Play onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}