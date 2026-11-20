// COLD WATER v2 — flagship #7, fully sensorial.
//
// Senses used:
//   - Camera (front cam brightness — detects lighting drop when hands cover face)
//   - Microphone (gasp / splash detection on level peak)
//   - TTS (guru voice paces prep → splash → integrate)
//   - STT (closing reflection)
//   - Sound design (subtle water bed + chime on splash)
//   - Haptics (countdown + splash burst)
//
// Phases:
//   1. SETTLE   (8s)  — guru greets, ambient water bed
//   2. PREP     (∞)   — user taps "I'm at the sink", calibrates baseline
//   3. COUNTDOWN(6s)  — guru counts down 3·2·1
//   4. SPLASH   (16s) — listen for gasp + brightness drop, register splash
//   5. AFTER    (12s) — body integration window, breath observation
//   6. REFLECT  (≤14s)— spoken reflection
//   7. INTEGRATE(8s)  — guru closes
//
// Reference: Mammalian diving reflex — trigeminal-vagal arc. Bracing cold on the
// face triggers immediate parasympathetic dominance and bradycardia.

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CameraOff, Mic, MicOff } from "lucide-react";
import CinematicOverlay from "../shell/CinematicOverlay";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useFaceCam } from "../shell/useFaceCam";
import { useBreathMic } from "../shell/useBreathMic";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import ColdWaterCanvas from "./ColdWaterCanvas";

type Phase = "settle" | "prep" | "countdown" | "splash" | "after" | "reflect" | "integrate";

const PHASE_MS: Record<Phase, number> = {
  settle: 8000,
  prep: 0, // user-gated
  countdown: 6000,
  splash: 16000,
  after: 12000,
  reflect: 14000,
  integrate: 8000,
};

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [phase, setPhase] = useState<Phase>("settle");
  const [reflection, setReflection] = useState("");
  const [reflectionListening, setReflectionListening] = useState(false);
  const [splashCount, setSplashCount] = useState(0);
  const [countdownN, setCountdownN] = useState(3);
  const [splashPulse, setSplashPulse] = useState(0);

  const cam = useFaceCam(true);
  const mic = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const phaseStartRef = useRef<number>(Date.now());
  const sessionStartRef = useRef<number>(Date.now());
  const endedRef = useRef(false);
  const baselineBrightRef = useRef<number | null>(null);
  const baselineLevelRef = useRef<number>(0);
  const minBrightRef = useRef<number>(1);
  const maxLevelRef = useRef<number>(0);
  const lastSplashAtRef = useRef<number>(0);
  const lastCountdownTickRef = useRef<number>(-1);
  const breathCyclesAtSplashRef = useRef<number>(0);

  // Ambient water bed
  useEffect(() => {
    sd.bed("temple", 0.14);
    return () => sd.stopBed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phase auto-advance (skip prep — user-gated)
  useEffect(() => {
    if (phase === "prep") return;
    const id = setInterval(() => {
      if (endedRef.current) return;
      const elapsed = Date.now() - phaseStartRef.current;
      if (elapsed < PHASE_MS[phase]) return;
      const order: Phase[] = ["settle", "prep", "countdown", "splash", "after", "reflect", "integrate"];
      const idx = order.indexOf(phase);
      if (phase === "settle") {
        setPhase("prep"); phaseStartRef.current = Date.now();
      } else if (idx < order.length - 1) {
        setPhase(order[idx + 1]); phaseStartRef.current = Date.now();
      } else {
        finish();
      }
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Phase entry effects
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.16);
        await say("we'll wake the body with cold water.", "guru");
        if (cancelled) return;
        await say("the oldest reset known to the nervous system.", "guru");
      } else if (phase === "prep") {
        await say("walk to the sink. cup cold water in your palms. tell me when you're ready.", "guru");
      } else if (phase === "countdown") {
        // Calibrate baseline at countdown start
        baselineBrightRef.current = cam.brightness ?? null;
        baselineLevelRef.current = mic.envelope;
        breathCyclesAtSplashRef.current = mic.cycles;
        sd.chime("rise", 0.18);
        await say("on three. splash and stay with the cold.", "guru");
      } else if (phase === "splash") {
        sd.chime("drop", 0.2);
        buzz("exhale");
        await say("now. splash.", "guru");
      } else if (phase === "after") {
        sd.chime("rise", 0.16);
        await say("good. let the body settle. notice the breath find itself.", "guru");
      } else if (phase === "reflect") {
        sd.chime("drop", 0.18);
        await say("what's different now?", "guru");
        if (cancelled) return;
        try { await transcribe.start(); setReflectionListening(true); } catch {}
      } else if (phase === "integrate") {
        if (reflectionListening) {
          setReflectionListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setReflection(r.transcript.trim().slice(0, 240));
        }
        sd.chime("drop", 0.16);
        stopVoice();
        await say("the body remembers being awake.", "guru");
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Countdown ticker
  useEffect(() => {
    if (phase !== "countdown") return;
    const id = setInterval(() => {
      const elapsed = Date.now() - phaseStartRef.current;
      const n = Math.max(0, 3 - Math.floor(elapsed / 1500));
      if (n !== countdownN) setCountdownN(n);
      if (n !== lastCountdownTickRef.current && n > 0) {
        lastCountdownTickRef.current = n;
        buzz("inhale");
        sd.chime("rise", 0.14);
        say(`${n}.`, "guru");
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, countdownN]);

  // Splash detection — track brightness drop & mic peak
  useEffect(() => {
    if (phase !== "splash") return;
    if (cam.brightness != null && cam.brightness < minBrightRef.current) {
      minBrightRef.current = cam.brightness;
    }
    if (mic.level > maxLevelRef.current) maxLevelRef.current = mic.level;

    const baseB = baselineBrightRef.current ?? 1;
    const baseL = baselineLevelRef.current;
    const brightDrop = baseB - (cam.brightness ?? baseB);
    const micSpike = mic.level - baseL;
    const now = Date.now();

    // Splash event: brightness drops > 0.18 OR mic spike > 0.35, debounced 1.4s
    if ((brightDrop > 0.18 || micSpike > 0.35) && now - lastSplashAtRef.current > 1400) {
      lastSplashAtRef.current = now;
      setSplashCount(c => c + 1);
      setSplashPulse(p => p + 1);
      sd.chime("drop", 0.22);
      buzz("exhale");
    }
  }, [phase, cam.brightness, mic.level, mic.envelope, sd, buzz]);

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    const baseB = baselineBrightRef.current;
    const brightDelta = baseB != null ? Math.max(0, baseB - minBrightRef.current) : null;
    const micPeakDelta = Math.max(0, maxLevelRef.current - baselineLevelRef.current);
    const breathCyclesAfter = mic.cycles - breathCyclesAtSplashRef.current;
    onEnd({
      outcome: splashCount > 0 ? "completed" : "abandoned",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        splash_events: splashCount,
        brightness_drop: brightDelta != null ? Number(brightDelta.toFixed(3)) : null,
        mic_peak_delta: Number(micPeakDelta.toFixed(3)),
        baseline_brightness: baseB != null ? Number(baseB.toFixed(3)) : null,
        breath_cycles_after_splash: breathCyclesAfter,
        spoken_reflection: reflection || null,
        cam_ready: cam.ready,
        mic_ready: mic.ready,
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

  const intensity = phase === "countdown" ? 0.4 + (Date.now() - phaseStartRef.current) / 6000 : phase === "splash" ? 0.9 : 0.2;

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Dual aurora — cyan above, indigo below, slow drift */}
      <motion.div
        animate={{ opacity: [0.12, 0.26, 0.12], y: [0, -6, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-cyan-900/35 via-blue-950/10 to-slate-950/50 pointer-events-none"
      />
      <motion.div
        animate={{ opacity: [0.06, 0.15, 0.06], y: [0, 6, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-t from-indigo-950/40 via-transparent to-transparent pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85" />
      <CinematicOverlay tint="cool" />

      {/* Water canvas */}
      <ColdWaterCanvas
        micLevel={mic.envelope}
        brightness={cam.brightness}
        splashPulse={splashPulse}
        intensity={Math.min(1, intensity)}
      />

      {/* Top-left: phase pill */}
      <div className="absolute top-6 left-6 z-10">
        <motion.div
          key={phase}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 0.9, x: 0 }}
          transition={{ duration: 0.7 }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-cyan-200/75"
        >
          <motion.span
            className="inline-block w-1 h-1 rounded-full bg-cyan-300/85"
            animate={{ opacity: [0.35, 1, 0.35], scale: [0.9, 1.25, 0.9] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          {phase === "settle" && "settling"}
          {phase === "prep" && "prepare"}
          {phase === "countdown" && "ready"}
          {phase === "splash" && "splash · stay"}
          {phase === "after" && "integrate"}
          {phase === "reflect" && "speak"}
          {phase === "integrate" && "rest"}
        </motion.div>
      </div>

      {/* Top-right: signals */}
      <div className="absolute top-6 right-6 z-10 text-right space-y-1.5">
        <div className="flex items-center justify-end gap-1.5">
          {cam.ready ? <Camera className="w-3 h-3 text-cyan-200/70" /> : <CameraOff className="w-3 h-3 text-white/30" />}
          <span className="text-[10px] uppercase tracking-widest text-white/50">{cam.ready ? "cam" : "no cam"}</span>
        </div>
        <div className="flex items-center justify-end gap-1.5">
          {mic.ready ? <Mic className="w-3 h-3 text-cyan-200/70" /> : <MicOff className="w-3 h-3 text-white/30" />}
          <span className="text-[10px] uppercase tracking-widest text-white/50">{mic.ready ? "mic" : "no mic"}</span>
        </div>
        {(phase === "splash" || phase === "after") && (
          <p className="text-[10px] uppercase tracking-widest text-cyan-100/70">splashes · {splashCount}</p>
        )}
      </div>

      {/* Center content */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
        <AnimatePresence mode="wait">
          {phase === "countdown" && countdownN > 0 && (
            <motion.div
              key={`cd-${countdownN}`}
              initial={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.7, filter: "blur(8px)" }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="text-8xl text-cyan-50/95 tabular-nums italic"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                textShadow: "0 0 40px rgba(180,220,255,0.35), 0 0 12px rgba(180,220,255,0.5)",
              }}
            >
              {countdownN}
            </motion.div>
          )}
          {phase === "splash" && (
            <motion.div
              key="splash-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.55, 1, 0.55], letterSpacing: ["0.25em", "0.32em", "0.25em"] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="text-4xl sm:text-5xl uppercase text-cyan-100/95"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                textShadow: "0 0 30px rgba(180,220,255,0.4)",
              }}
            >
              splash
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom phase content */}
      <div className="absolute inset-x-0 bottom-24 z-10 flex flex-col items-center px-8">
        <AnimatePresence mode="wait">
          {phase === "settle" && (
            <motion.div key="settle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1.4 }} className="text-center pointer-events-none">
              <p
                className="text-4xl sm:text-5xl text-cyan-50/90 italic tracking-wide"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
              >
                cold water
              </p>
              <div className="mt-5 h-px w-16 bg-cyan-100/25 mx-auto" />
              <p className="mt-4 text-[11px] uppercase tracking-[0.4em] text-cyan-100/55 max-w-xs mx-auto">
                the diving reflex
              </p>
              <p className="mt-2 text-xs text-white/40 italic max-w-xs mx-auto">
                one of the body's hidden gates
              </p>
            </motion.div>
          )}

          {phase === "prep" && (
            <motion.div key="prep" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="text-center">
              <p
                className="text-xl text-cyan-50/85 italic max-w-md mb-6 leading-relaxed"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
              >
                cup cold water in both palms<br/>bring the device close enough to hear
              </p>
              <button
                onClick={() => { setPhase("countdown"); phaseStartRef.current = Date.now(); }}
                className="px-8 py-3 rounded-full border border-cyan-200/40 text-cyan-100 text-[11px] uppercase tracking-[0.35em] bg-cyan-500/10 backdrop-blur-sm hover:bg-cyan-500/20 transition"
                style={{ boxShadow: "0 0 30px rgba(103,232,249,0.15), inset 0 0 20px rgba(103,232,249,0.05)" }}
              >
                i'm at the sink
              </button>
            </motion.div>
          )}

          {phase === "countdown" && (
            <motion.p key="cd-sub" initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} className="text-xs uppercase tracking-widest text-white/50 pointer-events-none">
              hands · ready
            </motion.p>
          )}

          {phase === "splash" && (
            <motion.p key="splash-sub" initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} className="text-xs uppercase tracking-widest text-cyan-200/60 pointer-events-none">
              stay with the cold · don't wipe
            </motion.p>
          )}

          {phase === "after" && (
            <motion.div key="after" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} className="text-center pointer-events-none">
              <p
                className="text-2xl text-cyan-50/85 italic tracking-wide"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
              >
                notice the slowing
              </p>
              <p className="mt-3 text-[10px] uppercase tracking-[0.4em] text-cyan-100/50">heart · breath · jaw</p>
            </motion.div>
          )}

          {phase === "reflect" && (
            <motion.div key="reflect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} className="text-center">
              <p
                className="text-2xl text-cyan-50/90 italic mb-5 tracking-wide"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
              >
                what's different now?
              </p>
              {reflection ? (
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-lg text-cyan-100/90 italic max-w-md leading-relaxed"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
                >"{reflection}"</motion.p>
              ) : reflectionListening ? (
                <button onClick={finalizeReflection} className="px-5 py-2.5 rounded-full border border-cyan-200/40 text-cyan-100 text-[11px] uppercase tracking-[0.3em] bg-cyan-500/10 backdrop-blur-sm animate-pulse">
                  ● listening · tap when done
                </button>
              ) : (
                <p className="text-xs text-white/40">preparing…</p>
              )}
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="integrate" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 1.6 }} className="text-center pointer-events-none">
              <p className="text-[11px] font-light text-cyan-100/65 tracking-[0.5em] uppercase">awake</p>
              <div className="mt-5 h-px w-12 bg-cyan-100/20 mx-auto" />
              {reflection && (
                <p
                  className="mt-6 text-lg italic text-cyan-50/70 max-w-sm leading-relaxed"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
                >"{reflection}"</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-20 text-[10px] uppercase tracking-widest text-white/30 hover:text-white/70 transition"
      >
        end · save
      </button>
    </div>
  );
}

export default function ColdWater() {
  const g = getLabGame("cold-water")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}
