// WILL FORGE v2 — flagship #11, fully sensorial.
//
// Senses used:
//   - Microphone (envelope = sub-vocal stress; sigh detection = release events)
//   - TTS (guru voice solemnizes the intention; reveal at end)
//   - STT (closing reflection)
//   - Sound design (forge bed + chimes)
//   - Haptics (declare, deviations, completion)
//
// Phases:
//   1. SETTLE   (5s)
//   2. DECLARE  (gated) — type "I will not …"
//   3. FORGE    (4s)   — TTS solemnizes
//   4. HOLD     (180s) — ember grows; deviations (blur/touch/visibility) flare red
//   5. REVEAL   (10s)  — TTS names the pattern
//   6. REFLECT  (≤14s) — STT reflection
//   7. INTEGRATE(7s)
//
// Sankalpa / Yoga Nidra + Hare 2009 vmPFC top-down inhibition.

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useBreathMic } from "../shell/useBreathMic";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import WillForgeCanvas from "./WillForgeCanvas";
import CinematicOverlay from "../shell/CinematicOverlay";

const SERIF: React.CSSProperties = { fontFamily: '"Cormorant Garamond", Georgia, serif' };

type Phase = "settle" | "declare" | "forge" | "hold" | "reveal" | "reflect" | "integrate";

const HOLD_MS = 180_000;

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [phase, setPhase] = useState<Phase>("settle");
  const [intention, setIntention] = useState("");
  const [reflection, setReflection] = useState("");
  const [reflectionListening, setReflectionListening] = useState(false);
  const [revealLine, setRevealLine] = useState("");
  const [progress, setProgress] = useState(0);
  const [deviationPulse, setDeviationPulse] = useState(0);

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const sessionStartRef = useRef<number>(Date.now());
  const phaseStartRef = useRef<number>(Date.now());
  const holdStartRef = useRef<number>(0);
  const endedRef = useRef(false);
  const blursRef = useRef(0);
  const tapsRef = useRef(0);
  const visHidesRef = useRef(0);
  const envSamplesRef = useRef<number[]>([]);
  const sighsAtStartRef = useRef(0);

  // Soft forge bed
  useEffect(() => { sd.bed("temple", 0.18); return () => sd.stopBed(); /* eslint-disable-next-line */ }, []);

  // Phase entry narration
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.14);
        await say("the forge is hot. one intention will be hammered.", "guru");
        if (cancelled) return;
        setTimeout(() => { if (!cancelled) setPhase("declare"); phaseStartRef.current = Date.now(); }, 1500);
      } else if (phase === "forge") {
        sd.chime("rise", 0.22);
        await say(`for the next three minutes, ${intention.trim()}.`, "guru");
        if (cancelled) return;
        setPhase("hold");
        phaseStartRef.current = Date.now();
        holdStartRef.current = Date.now();
        sighsAtStartRef.current = breath.sighs;
      } else if (phase === "reveal") {
        sd.chime("drop", 0.18);
        const dev = blursRef.current + tapsRef.current + visHidesRef.current;
        const avgEnv = envSamplesRef.current.length
          ? envSamplesRef.current.reduce((a, b) => a + b, 0) / envSamplesRef.current.length : 0;
        const sighs = Math.max(0, breath.sighs - sighsAtStartRef.current);
        let line = "you held. unbroken.";
        if (dev >= 6 && avgEnv > 0.18) line = "the body fought you. and the mind kept reaching. notice where the urge lived.";
        else if (dev >= 4) line = "the urge tested you several times. each refusal carved a deeper line.";
        else if (avgEnv > 0.18) line = "outside you stayed still. inside the storm was loud. that's still discipline.";
        else if (sighs >= 2) line = "you sighed it out instead of acting it out. that is the technology.";
        else if (dev <= 1) line = "barely a flicker. the will is already remembering itself.";
        setRevealLine(line);
        await say(line, "guru");
      } else if (phase === "reflect") {
        sd.chime("drop", 0.16);
        await say("what did the urge feel like, when it came?", "guru");
        if (cancelled) return;
        try { await transcribe.start(); setReflectionListening(true); } catch {}
      } else if (phase === "integrate") {
        if (reflectionListening) {
          setReflectionListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setReflection(r.transcript.trim().slice(0, 240));
        }
        sd.chime("drop", 0.18);
        stopVoice();
        await say("the intention is forged. carry it like a small hot stone.", "guru");
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // HOLD progress + auto advance + deviation listeners
  useEffect(() => {
    if (phase !== "hold") return;
    const onBlur = () => { blursRef.current += 1; setDeviationPulse(p => p + 1); buzz("tap"); };
    const onTouch = () => { tapsRef.current += 1; setDeviationPulse(p => p + 1); };
    const onVis = () => { if (document.hidden) { visHidesRef.current += 1; setDeviationPulse(p => p + 1); } };
    window.addEventListener("blur", onBlur);
    window.addEventListener("touchstart", onTouch, { passive: true });
    document.addEventListener("visibilitychange", onVis);

    const id = setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current;
      const p = Math.min(1, elapsed / HOLD_MS);
      setProgress(p);
      if (p >= 1) {
        clearInterval(id);
        setPhase("reveal");
        phaseStartRef.current = Date.now();
        sd.chime("rise", 0.3);
        buzz("exhale");
      }
    }, 200);
    return () => {
      clearInterval(id);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("touchstart", onTouch);
      document.removeEventListener("visibilitychange", onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Sample mic envelope during hold
  useEffect(() => {
    if (phase !== "hold") return;
    envSamplesRef.current.push(breath.envelope);
    if (envSamplesRef.current.length > 1200) envSamplesRef.current.shift();
  }, [breath.envelope, phase]);

  // Auto advance reveal → reflect
  useEffect(() => {
    if (phase !== "reveal") return;
    const t = setTimeout(() => { setPhase("reflect"); phaseStartRef.current = Date.now(); }, 10_000);
    return () => clearTimeout(t);
  }, [phase]);

  // Auto advance reflect → integrate
  useEffect(() => {
    if (phase !== "reflect") return;
    const t = setTimeout(() => { setPhase("integrate"); phaseStartRef.current = Date.now(); }, 14_000);
    return () => clearTimeout(t);
  }, [phase]);

  // Auto end after integrate
  useEffect(() => {
    if (phase !== "integrate") return;
    const t = setTimeout(() => finish(), 7_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    const avgEnv = envSamplesRef.current.length
      ? envSamplesRef.current.reduce((a, b) => a + b, 0) / envSamplesRef.current.length : 0;
    const sighs = Math.max(0, breath.sighs - sighsAtStartRef.current);
    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        intention: intention.trim(),
        spoken_reflection: reflection || null,
        hold_ms: holdStartRef.current ? Date.now() - holdStartRef.current : 0,
        hold_progress: +progress.toFixed(3),
        deviations_total: blursRef.current + tapsRef.current + visHidesRef.current,
        deviations_blur: blursRef.current,
        deviations_touch: tapsRef.current,
        deviations_vis_hide: visHidesRef.current,
        avg_mic_envelope: +avgEnv.toFixed(3),
        sighs_during_hold: sighs,
        reveal_line: revealLine,
        mic_ready: breath.ready,
      },
    });
  };

  const finalizeReflection = async () => {
    if (!reflectionListening) return;
    setReflectionListening(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) setReflection(r.transcript.trim().slice(0, 240));
    if (phase === "reflect") { setPhase("integrate"); phaseStartRef.current = Date.now(); }
  };

  const remainingHold = phase === "hold" ? Math.max(0, HOLD_MS - (Date.now() - holdStartRef.current)) : 0;
  const totalDeviations = blursRef.current + tapsRef.current + visHidesRef.current;

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <WillForgeCanvas progress={progress} envelope={breath.envelope} deviationPulse={deviationPulse} />
      <CinematicOverlay tint="amber" />

      {/* Top-left phase pill */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <motion.div key={phase} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 0.9, x: 0 }} transition={{ duration: 0.6 }} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-amber-200/80 drop-shadow-[0_0_10px_rgba(255,190,120,0.25)]">
          <span className="w-1 h-1 rounded-full bg-amber-200/85 animate-pulse" />
          {phase === "settle" && "the forge"}
          {phase === "declare" && "declare"}
          {phase === "forge" && "forging"}
          {phase === "hold" && "hold"}
          {phase === "reveal" && "what was forged"}
          {phase === "reflect" && "speak"}
          {phase === "integrate" && "rest"}
        </motion.div>
      </div>

      {/* Top-right signals */}
      <div className="absolute top-6 right-6 z-30 text-right space-y-1.5 pointer-events-none">
        <div className="flex items-center justify-end gap-1.5">
          {breath.ready ? <Mic className="w-3 h-3 text-amber-200/70" /> : <MicOff className="w-3 h-3 text-white/30" />}
          <span className="text-[10px] uppercase tracking-widest text-white/50">{breath.ready ? "mic" : "no mic"}</span>
        </div>
        {phase === "hold" && (
          <>
            <p className="text-[10px] uppercase tracking-widest text-amber-200/70">{Math.ceil(remainingHold / 1000)}s</p>
            {totalDeviations > 0 && (
              <p className="text-[10px] uppercase tracking-widest text-rose-300/80">{totalDeviations} ripple{totalDeviations !== 1 ? "s" : ""}</p>
            )}
          </>
        )}
      </div>

      {/* Phase content */}
      <AnimatePresence mode="wait">
        {phase === "settle" && (
          <motion.div key="settle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none px-8 text-center">
            <p style={SERIF} className="text-2xl sm:text-3xl text-amber-50/90 tracking-wide drop-shadow-[0_0_20px_rgba(255,190,120,0.25)]">will forge</p>
            <p style={SERIF} className="mt-3 text-sm text-amber-50/60 italic max-w-xs">one intention. three minutes. unmoved.</p>
          </motion.div>
        )}

        {phase === "declare" && (
          <motion.div key="declare" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center max-w-md mx-auto">
            <p className="text-[10px] uppercase tracking-[0.42em] text-amber-200/80 mb-4">for the next 3 minutes…</p>
            <input
              autoFocus
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="i will not…"
              maxLength={120}
              style={SERIF}
              className="w-full bg-white/5 border border-amber-300/20 rounded-xl px-5 py-4 text-amber-50/95 italic text-center text-xl placeholder:text-amber-100/30 focus:outline-none focus:border-amber-300/60 transition"
            />
            <button
              disabled={intention.trim().length < 5}
              onClick={() => { setPhase("forge"); phaseStartRef.current = Date.now(); buzz("inhale"); }}
              style={SERIF}
              className={`mt-6 px-8 py-3 rounded-full text-base italic tracking-wide transition ${
                intention.trim().length >= 5
                  ? "bg-amber-500/20 border border-amber-300/40 text-amber-100 hover:bg-amber-500/30 shadow-[0_0_25px_rgba(255,190,120,0.2)]"
                  : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
              }`}
            >
              forge it
            </button>
          </motion.div>
        )}

        {phase === "forge" && (
          <motion.div key="forge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none">
            <p style={SERIF} className="text-2xl text-amber-50/95 italic max-w-md leading-relaxed drop-shadow-[0_0_20px_rgba(255,190,120,0.25)]">"{intention.trim()}"</p>
          </motion.div>
        )}

        {phase === "hold" && (
          <motion.div key="hold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} className="absolute inset-x-0 bottom-24 z-20 flex flex-col items-center px-8 text-center pointer-events-none">
            <p style={SERIF} className="text-lg text-amber-100/90 italic max-w-md leading-relaxed">{intention.trim()}</p>
          </motion.div>
        )}

        {phase === "reveal" && (
          <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none">
            <p className="text-[10px] uppercase tracking-[0.42em] text-amber-200/80 mb-6">what was forged</p>
            <p style={SERIF} className="text-xl sm:text-2xl text-amber-50/95 italic leading-relaxed max-w-md mb-8 drop-shadow-[0_0_20px_rgba(255,190,120,0.2)]">"{revealLine || "…"}"</p>
            <div className="space-y-2 max-w-xs w-full text-xs text-white/60">
              <div className="flex justify-between"><span>deviations</span><span className="text-rose-200">{totalDeviations}</span></div>
              <div className="flex justify-between"><span>sighs released</span><span className="text-amber-200">{Math.max(0, breath.sighs - sighsAtStartRef.current)}</span></div>
            </div>
          </motion.div>
        )}

        {phase === "reflect" && (
          <motion.div key="reflect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center">
            <p style={SERIF} className="text-xl sm:text-2xl text-amber-50/90 mb-6">what did the urge feel like?</p>
            {reflection ? (
              <p style={SERIF} className="text-lg text-amber-50/90 italic max-w-md">"{reflection}"</p>
            ) : reflectionListening ? (
              <button onClick={finalizeReflection} style={SERIF} className="px-5 py-2 rounded-full border border-amber-200/40 text-amber-100 italic text-sm bg-amber-500/10 backdrop-blur-sm animate-pulse shadow-[0_0_25px_rgba(255,190,120,0.15)]">
                ● listening — tap when done
              </button>
            ) : (
              <p className="text-xs text-white/40">preparing…</p>
            )}
          </motion.div>
        )}

        {phase === "integrate" && (
          <motion.div key="integrate" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 1.6 }} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none">
            <p className="text-sm text-amber-100/70 tracking-[0.42em] uppercase">forged</p>
            {reflection && <p style={SERIF} className="mt-4 text-sm italic text-amber-50/60 max-w-sm">"{reflection}"</p>}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-40 text-[10px] uppercase tracking-widest text-white/30 hover:text-white/70 transition"
      >
        end · save
      </button>
    </div>
  );
}

export default function WillForge() {
  const g = getLabGame("will-forge")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}
