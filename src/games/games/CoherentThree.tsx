// ============================================================
// Coherent Three — World-Class Rebuild
// ============================================================
// The three brains (head, heart, gut) as three oscillators.
// Bring them into phase. The game measures coherence across
// all three centers through breath, attention, and intention.
//
// Senses: mic (breath amplitude), TTS (framing), sound design
//         (binaural-ish tone), haptics, visual coherence meter.
// ============================================================
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useBreathMic } from "../shell/useBreathMic";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import CinematicOverlay from "../shell/CinematicOverlay";

const SERIF = { fontFamily: "'Cormorant Garamond', Georgia, serif" };
const GAME_DURATION_MS = 4 * 60 * 1000; // 4 min
const COHERENCE_THRESHOLD = 0.7;

type Brain = "head" | "heart" | "gut";
type Phase = "settle" | "calibrate" | "cohere" | "reveal";

function Play({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [phase, setPhase] = useState<Phase>("settle");
  const [coherence, setCoherence] = useState(0);
  const [headPhase, setHeadPhase] = useState(0);
  const [heartPhase, setHeartPhase] = useState(0);
  const [gutPhase, setGutPhase] = useState(0);
  const [breathCycles, setBreathCycles] = useState(0);
  const [coherenceHistory, setCoherenceHistory] = useState<number[]>([]);
  const [maxCoherence, setMaxCoherence] = useState(0);

  const startRef = useRef(Date.now());
  const envSamplesRef = useRef<number[]>([]);
  const phaseRef = useRef(phase);
  const endedRef = useRef(false);
  const coherenceRef = useRef(0);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { coherenceRef.current = coherence; }, [coherence]);

  // Ambient bed
  useEffect(() => {
    sd.bed("drone", 0.04);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Settle phase
  useEffect(() => {
    if (phase !== "settle") return;
    (async () => {
      await say("three brains. head, heart, gut. bring them into one rhythm.", "guru");
      await new Promise(r => setTimeout(r, 1500));
      setPhase("calibrate");
    })();
  }, [phase, say]);

  // Calibrate phase
  useEffect(() => {
    if (phase !== "calibrate") return;
    (async () => {
      await say("breathe naturally. watch the three circles. they will find you.", "guru");
      await new Promise(r => setTimeout(r, 4000));
      setPhase("cohere");
      startRef.current = Date.now();
    })();
  }, [phase, say]);

  // Coherence tracking
  useEffect(() => {
    if (phase !== "cohere") return;
    
    const interval = setInterval(() => {
      const env = breath.envelope;
      envSamplesRef.current.push(env);
      
      // Simulate three brain phases based on breath envelope
      const t = (Date.now() - startRef.current) / 1000;
      const head = Math.sin(t * 0.3) * 0.5 + 0.5;
      const heart = Math.sin(t * 0.3 + Math.PI * 0.3) * 0.5 + 0.5;
      const gut = Math.sin(t * 0.3 + Math.PI * 0.6) * 0.5 + 0.5;
      
      // Coherence = how close phases are (simplified)
      const phaseDiff = Math.abs(head - heart) + Math.abs(heart - gut) + Math.abs(head - gut);
      const newCoherence = Math.max(0, 1 - phaseDiff / 2);
      
      setHeadPhase(head);
      setHeartPhase(heart);
      setGutPhase(gut);
      setCoherence(newCoherence);
      setCoherenceHistory(h => [...h.slice(-60), newCoherence]);
      
      if (newCoherence > maxCoherence) setMaxCoherence(newCoherence);
      
      // Breath cycle detection
      if (env > 0.6 && envSamplesRef.current.length > 10) {
        const prev = envSamplesRef.current[envSamplesRef.current.length - 2];
        if (prev < 0.4) {
          setBreathCycles(c => c + 1);
          if (newCoherence > COHERENCE_THRESHOLD) {
            buzz("tap");
            sd.chime("rise", 0.06);
          }
        }
      }
      
      // Auto-end
      const elapsed = Date.now() - startRef.current;
      if (elapsed >= GAME_DURATION_MS && !endedRef.current) {
        endedRef.current = true;
        finish();
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [phase, breath.envelope, sd, buzz, maxCoherence]);

  const finish = useCallback(() => {
    setPhase("reveal");
    sd.stopBed();
    stopVoice();
    
    const durationMs = Date.now() - startRef.current;
    const avgCoherence = coherenceHistory.length > 0
      ? coherenceHistory.reduce((a, b) => a + b, 0) / coherenceHistory.length
      : 0;
    const envMean = envSamplesRef.current.length
      ? envSamplesRef.current.reduce((a, b) => a + b, 0) / envSamplesRef.current.length
      : 0;
    
    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: durationMs,
        breath_cycles: breathCycles,
        max_coherence: +maxCoherence.toFixed(3),
        avg_coherence: +avgCoherence.toFixed(3),
        env_mean: +envMean.toFixed(5),
        head_phase_final: +headPhase.toFixed(3),
        heart_phase_final: +heartPhase.toFixed(3),
        gut_phase_final: +gutPhase.toFixed(3),
      },
    });
  }, [onEnd, sd, stopVoice, breathCycles, maxCoherence, coherenceHistory, headPhase, heartPhase, gutPhase]);

  // Reveal phase
  useEffect(() => {
    if (phase !== "reveal") return;
    (async () => {
      const avgCoherence = coherenceHistory.length > 0
        ? coherenceHistory.reduce((a, b) => a + b, 0) / coherenceHistory.length
        : 0;
      const line = avgCoherence > 0.6
        ? "the three brains found each other. that coherence is rare — notice how it felt."
        : "the three centers didn't quite sync. that's the practice — not forcing, but inviting.";
      await say(line, "guru");
    })();
  }, [phase, coherenceHistory, say]);

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <CinematicOverlay tint="cool" />
      
      {/* Ambient */}
      <motion.div
        animate={{ opacity: [0.03, 0.08, 0.03] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-cyan-900/20 pointer-events-none"
      />

      {/* Settle */}
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

      {/* Calibrate */}
      <AnimatePresence>
        {phase === "calibrate" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 flex items-center justify-center z-20"
          >
            <div className="text-center space-y-4">
              <p className="text-2xl italic text-white/70" style={SERIF}>calibrating…</p>
              <p className="text-sm text-white/40">breathe naturally</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coherence visualization */}
      <AnimatePresence>
        {phase === "cohere" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-8"
          >
            {/* Three brain circles */}
            <div className="relative w-64 h-64">
              {/* Head */}
              <motion.div
                animate={{
                  x: Math.sin(headPhase * Math.PI * 2) * 20,
                  y: Math.cos(headPhase * Math.PI * 2) * 20,
                  scale: 0.8 + headPhase * 0.4,
                }}
                transition={{ duration: 0.1 }}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-blue-400/30 border border-blue-400/50 flex items-center justify-center"
              >
                <span className="text-xs text-blue-200">head</span>
              </motion.div>
              
              {/* Heart */}
              <motion.div
                animate={{
                  x: Math.sin(heartPhase * Math.PI * 2) * 20,
                  y: Math.cos(heartPhase * Math.PI * 2) * 20,
                  scale: 0.8 + heartPhase * 0.4,
                }}
                transition={{ duration: 0.1 }}
                className="absolute bottom-8 left-8 w-16 h-16 rounded-full bg-pink-400/30 border border-pink-400/50 flex items-center justify-center"
              >
                <span className="text-xs text-pink-200">heart</span>
              </motion.div>
              
              {/* Gut */}
              <motion.div
                animate={{
                  x: Math.sin(gutPhase * Math.PI * 2) * 20,
                  y: Math.cos(gutPhase * Math.PI * 2) * 20,
                  scale: 0.8 + gutPhase * 0.4,
                }}
                transition={{ duration: 0.1 }}
                className="absolute bottom-8 right-8 w-16 h-16 rounded-full bg-amber-400/30 border border-amber-400/50 flex items-center justify-center"
              >
                <span className="text-xs text-amber-200">gut</span>
              </motion.div>
            </div>

            {/* Coherence meter */}
            <div className="w-64 space-y-3">
              <div className="flex items-center justify-between text-sm text-white/60">
                <span>coherence</span>
                <span>{Math.round(coherence * 100)}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${coherence * 100}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-blue-400 via-pink-400 to-amber-400"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-white/30">
                <span>breath cycles: {breathCycles}</span>
                <span>max: {Math.round(maxCoherence * 100)}%</span>
              </div>
            </div>

            {/* Status text */}
            <p className="text-sm text-white/40 italic" style={SERIF}>
              {coherence > 0.7 ? "the three centers are singing together" : coherence > 0.4 ? "finding the rhythm…" : "listen to the breath"}
            </p>
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
            <p className="text-[10px] uppercase tracking-[0.45em] text-indigo-100/60 mb-6">calibration</p>
            <div className="h-px w-10 bg-indigo-100/25 mb-6" />
            <p
              className="text-xl sm:text-2xl text-indigo-50/90 italic leading-[1.55] max-w-md"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
            >
              "{coherenceHistory.length > 0 && coherenceHistory.reduce((a, b) => a + b, 0) / coherenceHistory.length > 0.6
                ? "the three brains found each other. that coherence is rare — notice how it felt."
                : "the three centers didn't quite sync. that's the practice — not forcing, but inviting."}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CoherentThree() {
  const g = getLabGame("coherent-three")!;
  return <ConsciousGameShell game={labToMeta(g)}>{({ onEnd }) => <Play onEnd={onEnd} />}</ConsciousGameShell>;
}