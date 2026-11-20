// ============================================================
// The Empty Room — flagship world-class rebuild.
// ============================================================
// A black screen that breathes. Nothing to do. Nothing to fix.
// You stay until you say "enough" — or until 5 minutes pass.
// The room measures: how long you lasted, whether the mind
// reached for stimulation, whether the body settled or agitated.
//
// Senses: mic (envelope + STT), TTS (framing), haptics,
//         sound design, ambient particles, breath-sync visuals.
// ============================================================
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
const MAX_SECONDS = 300; // 5 min
const SETTLE_MS = 8000;

function Play({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [phase, setPhase] = useState<"settle" | "room" | "exit">("settle");
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number }>>([]);
  const [settled, setSettled] = useState(false);

  const startRef = useRef(Date.now());
  const envSamplesRef = useRef<number[]>([]);
  const exitReasonRef = useRef<string>("timeout");
  const transcriptRef = useRef("");
  const phaseRef = useRef(phase);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Ambient bed
  useEffect(() => {
    sd.bed("drone", 0.04);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Mic sampling
  useEffect(() => {
    if (phase !== "room") return;
    envSamplesRef.current.push(breath.envelope);
    // Detect settling: envelope variance drops
    if (envSamplesRef.current.length > 20) {
      const recent = envSamplesRef.current.slice(-20);
      const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
      const variance = recent.reduce((a, b) => a + (b - mean) ** 2, 0) / recent.length;
      if (variance < 0.005 && !settled) {
        setSettled(true);
        sd.chime("rise", 0.04);
      }
    }
  }, [breath.envelope, phase, settled, sd]);

  // Settle phase
  useEffect(() => {
    if (phase !== "settle") return;
    (async () => {
      await say("the room is empty. stay. nothing needs to happen.", "guru");
      await new Promise(r => setTimeout(r, 1000));
      setPhase("room");
      startRef.current = Date.now();
      try { await transcribe.start(); setListening(true); } catch {}
    })();
  }, [phase, say, transcribe]);

  // Timer
  useEffect(() => {
    if (phase !== "room") return;
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      setSeconds(elapsed);
      if (elapsed >= MAX_SECONDS) {
        finish("timeout");
      }
    }, 250);
    return () => clearInterval(id);
  }, [phase]);

  // STT listener
  useEffect(() => {
    if (!transcript) return;
    transcriptRef.current = transcript;
    if (/enough|done|stop|exit|leave/i.test(transcript)) {
      exitReasonRef.current = "voiced";
      finish("voiced");
    }
  }, [transcript]);

  // Particle system (very subtle)
  useEffect(() => {
    if (phase !== "room") return;
    const interval = setInterval(() => {
      setParticles(prev => {
        const next = [...prev];
        if (next.length < 8) {
          next.push({
            id: Date.now(),
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 1 + Math.random() * 2,
            opacity: 0.05 + Math.random() * 0.1,
          });
        }
        // Remove old particles
        return next.filter(p => Date.now() - p.id < 8000);
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [phase]);

  const finish = useCallback((reason: string) => {
    exitReasonRef.current = reason;
    setPhase("exit");
    if (listening) {
      transcribe.stop().catch(() => {});
      setListening(false);
    }
    stopVoice();
    sd.stopBed();
    
    const durationMs = Date.now() - startRef.current;
    const envMean = envSamplesRef.current.length
      ? envSamplesRef.current.reduce((a, b) => a + b, 0) / envSamplesRef.current.length
      : 0;
    const envVar = envSamplesRef.current.length
      ? envSamplesRef.current.reduce((a, b) => a + (b - envMean) ** 2, 0) / envSamplesRef.current.length
      : 0;

    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: durationMs,
        exit_reason: reason,
        settled: settled,
        env_mean: +envMean.toFixed(5),
        env_var: +envVar.toFixed(5),
        transcript: transcriptRef.current.slice(0, 200),
        mic_ready: breath.ready,
      },
    });
  }, [onEnd, listening, transcribe, stopVoice, sd, breath.ready, settled]);

  const progress = seconds / MAX_SECONDS;

  return (
    <div className="absolute inset-0 bg-black overflow-hidden" onDoubleClick={() => phase === "room" && finish("tapped")}>
      <CinematicOverlay tint="cool" />
      
      {/* Breathing gradient */}
      <motion.div
        animate={{ 
          opacity: [0.03, 0.08, 0.03],
          scale: [1, 1.02, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-slate-900/30 pointer-events-none"
      />
      
      {/* Subtle particles */}
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: p.opacity, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 3 }}
            className="absolute rounded-full bg-white/20 pointer-events-none"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
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
            <p className="text-2xl italic text-white/60" style={SERIF}>emptying…</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Room phase */}
      <AnimatePresence>
        {phase === "room" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-between py-12"
          >
            {/* Top - subtle status */}
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-white/25">
              <motion.span
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-1 h-1 rounded-full bg-white/40"
              />
              {settled ? "settled" : "settling"}
            </div>

            {/* Center - breathing circle */}
            <div className="flex flex-col items-center gap-6">
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.15, 0.3, 0.15],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-32 h-32 rounded-full bg-indigo-400/20 blur-2xl"
              />
              <div className="text-center space-y-2">
                <p className="text-[10px] uppercase tracking-[0.5em] text-white/15">
                  {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, "0")}
                </p>
                <p className="text-xs text-white/20 italic" style={SERIF}>
                  {settled ? "the room is holding you" : "letting go of the noise"}
                </p>
              </div>
            </div>

            {/* Bottom - instructions */}
            <div className="text-center space-y-1">
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/15">
                say "enough" · double-tap to exit
              </p>
              {listening && (
                <motion.div
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center justify-center gap-1 text-[9px] text-white/20"
                >
                  <span className="w-1 h-1 rounded-full bg-emerald-400/60" />
                  listening
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit phase */}
      <AnimatePresence>
        {phase === "exit" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 flex items-center justify-center z-20"
          >
            <p className="text-xl italic text-white/60" style={SERIF}>resting…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function EmptyRoom() {
  const g = getLabGame("empty-room")!;
  return <ConsciousGameShell game={labToMeta(g)}>{({ onEnd }) => <Play onEnd={onEnd} />}</ConsciousGameShell>;
}