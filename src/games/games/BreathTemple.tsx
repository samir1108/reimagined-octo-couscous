// BREATH TEMPLE v2 — flagship #1, fully sensorial.
//
// Senses used:
//   - Microphone (breath cadence, sigh detection)
//   - Front camera (face presence + stillness)
//   - TTS (guru voice narration each phase + adaptive mid-round encouragement)
//   - STT (spoken intention + spoken closing reflection)
//   - Sound design (temple bed + chimes per phase)
//   - Haptics (inhale/exhale buzzes synced with the pacer)
//
// Six phases:
//   1. SETTLE     (8s)
//   2. INTENTION  (≤12s) — user can speak one word
//   3. CALIBRATE  (12s)  — mic listens to natural breath
//   4. ROUNDS     (66s)  — 6 × 11s resonance cycles (5.5 bpm)
//   5. REFLECT    (≤14s) — user speaks "what is here now?"
//   6. INTEGRATE  (8s)
//
// Visuals: ambient video backdrop (heavily darkened) + CosmicOrbWebGL canvas
// in the center. Optional tiny self-camera vignette in a corner if face cam ready.

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Camera } from "lucide-react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useBreathMic } from "../shell/useBreathMic";
import { useFaceCam } from "../shell/useFaceCam";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import templeVideoAsset from "@/assets/videos/hero-temple-sunrise.mp4.asset.json";

type Phase = "settle" | "intention" | "calibrate" | "rounds" | "reflect" | "integrate";

const PHASE_MS: Record<Phase, number> = {
  settle: 8000,
  intention: 12000,
  calibrate: 12000,
  rounds: 66000,
  reflect: 14000,
  integrate: 8000,
};
const HALF_CYCLE = 5500;
const TOTAL_ROUNDS = 6;
const TARGET_CYCLE_MS = HALF_CYCLE * 2;

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [phase, setPhase] = useState<Phase>("settle");
  const [pacer, setPacer] = useState(0);
  const [round, setRound] = useState(0);
  const [coherence, setCoherence] = useState(0);
  const [intention, setIntention] = useState("");
  const [reflection, setReflection] = useState("");
  const [intentionListening, setIntentionListening] = useState(false);
  const [reflectionListening, setReflectionListening] = useState(false);

  const breath = useBreathMic(true);
  const cam = useFaceCam(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const phaseStartRef = useRef<number>(Date.now());
  const sessionStartRef = useRef<number>(Date.now());
  const endedRef = useRef(false);
  const cycleHistoryRef = useRef<number[]>([]);
  const motionSamplesRef = useRef<number[]>([]);
  const facePresenceSamplesRef = useRef<number[]>([]);
  const lastBreatheCueRef = useRef<"in" | "out" | "">("");
  const midRoundEncouragedRef = useRef(false);

  // Ambient bed for the whole journey
  useEffect(() => {
    sd.bed("temple", 0.25);
    return () => sd.stopBed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phase advance tick
  useEffect(() => {
    const id = setInterval(() => {
      if (endedRef.current) return;
      const elapsed = Date.now() - phaseStartRef.current;
      const max = PHASE_MS[phase];
      if (elapsed < max) return;
      const order: Phase[] = ["settle", "intention", "calibrate", "rounds", "reflect", "integrate"];
      const idx = order.indexOf(phase);
      if (idx < order.length - 1) {
        setPhase(order[idx + 1]);
        phaseStartRef.current = Date.now();
      } else {
        finish();
      }
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Phase entry side effects: TTS narration, chimes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.18);
        await say("welcome to the temple of breath", "guru");
        if (cancelled) return;
        await say("let the body soften. the eyes can close, or rest low.", "guru");
      } else if (phase === "intention") {
        await say("if you wish, speak one word for this practice. or stay silent.", "guru");
      } else if (phase === "calibrate") {
        sd.chime("rise", 0.16);
        await say("breathe naturally. we are listening.", "guru");
      } else if (phase === "rounds") {
        sd.chime("rise", 0.2);
        midRoundEncouragedRef.current = false;
        await say("now follow the orb. in for five and a half. out for five and a half.", "guru");
      } else if (phase === "reflect") {
        sd.chime("drop", 0.18);
        await say("what is here, now? speak softly when you're ready.", "guru");
        if (cancelled) return;
        try {
          await transcribe.start();
          setReflectionListening(true);
        } catch { /* silent */ }
      } else if (phase === "integrate") {
        if (reflectionListening) {
          setReflectionListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setReflection(r.transcript.trim().slice(0, 240));
        }
        sd.chime("drop", 0.18);
        stopVoice();
        await say("rest. carry this softness with you.", "guru");
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Pacer + per-cycle cue + haptic, only during rounds
  useEffect(() => {
    if (phase !== "rounds") return;
    const id = setInterval(() => {
      const elapsed = Date.now() - phaseStartRef.current;
      const cyclePos = (elapsed % (HALF_CYCLE * 2)) / (HALF_CYCLE * 2);
      const v = 0.5 - 0.5 * Math.cos(cyclePos * Math.PI * 2);
      setPacer(v);
      const r = Math.min(TOTAL_ROUNDS, Math.floor(elapsed / (HALF_CYCLE * 2)) + 1);
      if (r !== round) {
        setRound(r);
        sd.chime("rise", 0.12);
      }
      const cue: "in" | "out" = v > 0.5 ? "in" : "out";
      if (cue !== lastBreatheCueRef.current) {
        lastBreatheCueRef.current = cue;
        buzz(cue === "in" ? "inhale" : "exhale");
      }
      // Mid-round adaptive encouragement (once)
      if (!midRoundEncouragedRef.current && r === Math.ceil(TOTAL_ROUNDS / 2)) {
        midRoundEncouragedRef.current = true;
        if (coherence > 0.7) say("beautiful. the body has found the rhythm.", "guru");
        else if (coherence > 0.4) say("good. let the exhale grow longer than the thought.", "guru");
        else say("no need to perfect it. just stay with the orb.", "guru");
      }
    }, 60);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round, coherence]);

  // Coherence score from breath cycle deviation vs target
  useEffect(() => {
    if (phase !== "rounds" && phase !== "integrate" && phase !== "reflect") return;
    if (breath.lastCycleMs > 2000) {
      cycleHistoryRef.current.push(breath.lastCycleMs);
      if (cycleHistoryRef.current.length > 8) cycleHistoryRef.current.shift();
      const hist = cycleHistoryRef.current;
      const meanDev = hist.reduce((s, ms) => s + Math.abs(ms - TARGET_CYCLE_MS), 0) / hist.length;
      setCoherence(Math.max(0, Math.min(1, 1 - meanDev / 6000)));
    }
  }, [breath.lastCycleMs, phase]);

  // Sample face cam motion + presence during rounds → presence_score
  useEffect(() => {
    if (phase !== "rounds" || !cam.ready) return;
    motionSamplesRef.current.push(cam.motion);
    facePresenceSamplesRef.current.push(cam.faceLikely);
  }, [cam.motion, cam.faceLikely, cam.ready, phase]);

  // Idle pacer for non-round phases
  useEffect(() => {
    if (phase === "calibrate") {
      setPacer(Math.min(1, breath.envelope * 3));
      return;
    }
    if (phase === "rounds") return;
    const id = setInterval(() => {
      const e = (Date.now() - phaseStartRef.current) / 1000;
      setPacer(0.5 - 0.5 * Math.cos(e * 0.7));
    }, 80);
    return () => clearInterval(id);
  }, [phase, breath.envelope]);

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    const motionSamples = motionSamplesRef.current;
    const presenceSamples = facePresenceSamplesRef.current;
    const avgMotion = motionSamples.length
      ? motionSamples.reduce((a, b) => a + b, 0) / motionSamples.length
      : null;
    const avgPresence = presenceSamples.length
      ? presenceSamples.reduce((a, b) => a + b, 0) / presenceSamples.length
      : null;
    const stillnessScore = avgMotion === null ? null : Math.max(0, Math.min(1, 1 - avgMotion * 4));
    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        intention: intention || null,
        reflection: reflection || null,
        mic_ready: breath.ready,
        cam_ready: cam.ready,
        cycles_detected: breath.cycles,
        sighs_detected: breath.sighs,
        avg_inhale_ms: breath.lastInhaleMs,
        avg_exhale_ms: breath.lastExhaleMs,
        avg_cycle_ms: breath.lastCycleMs,
        coherence_score: Math.round(coherence * 100),
        stillness_score: stillnessScore === null ? null : Math.round(stillnessScore * 100),
        presence_score: avgPresence === null ? null : Math.round(avgPresence * 100),
        rounds_completed: round,
        target_cycle_ms: TARGET_CYCLE_MS,
      },
    });
  };

  // Intention STT controls
  const startIntention = async () => {
    try { await transcribe.start(); setIntentionListening(true); } catch { /* silent */ }
  };
  const stopIntention = async () => {
    setIntentionListening(false);
    const r = await transcribe.stop();
    if (r?.transcript) setIntention(r.transcript.trim().slice(0, 64));
  };

  // Reflection — let user end early
  const finalizeReflection = async () => {
    if (!reflectionListening) return;
    setReflectionListening(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) setReflection(r.transcript.trim().slice(0, 240));
    // jump to integrate immediately
    if (phase === "reflect") {
      setPhase("integrate");
      phaseStartRef.current = Date.now();
    }
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Ambient temple video — cinematic slow zoom + subtle drift */}
      <motion.video
        src={templeVideoAsset.url}
        autoPlay
        loop
        muted
        playsInline
        initial={{ opacity: 0, scale: 1.12 }}
        animate={{ opacity: 0.42, scale: 1.02 }}
        transition={{ duration: 8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Twin depth wash — top vignette + bottom lift */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/55 to-black/90 pointer-events-none" />
      {/* Radial vignette — pulls focus to the orb */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0.9) 100%)"
      }} />
      {/* Aurora wave — amber, slow */}
      <motion.div
        animate={{ opacity: [0.05, 0.16, 0.05], y: [0, -8, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-amber-400/15 via-transparent to-transparent pointer-events-none mix-blend-screen"
      />
      {/* Aurora wave — rose, slower + offset */}
      <motion.div
        animate={{ opacity: [0.04, 0.12, 0.04], y: [0, 10, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute inset-0 bg-gradient-to-t from-rose-500/12 via-transparent to-transparent pointer-events-none mix-blend-screen"
      />
      {/* Fine grain — barely-there film texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 0.9  0 0 0 0 0.7  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Orb canvas */}
      

      {/* Top-left: phase label — serif refinement */}
      <div className="absolute top-6 left-6 z-10">
        <motion.div
          key={phase}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 0.85, x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2.5"
        >
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
            className="block w-1 h-1 rounded-full bg-amber-200/80 shadow-[0_0_8px_rgba(253,224,71,0.9)]"
          />
          <span className="text-[10px] uppercase tracking-[0.5em] text-amber-100/75 font-light">
            {phase === "settle" && "settling"}
            {phase === "intention" && "intention"}
            {phase === "calibrate" && "listening"}
            {phase === "rounds" && `round ${round} · ${TOTAL_ROUNDS}`}
            {phase === "reflect" && "speak"}
            {phase === "integrate" && "rest"}
          </span>
        </motion.div>
      </div>

      {/* Top-right: live signals */}
      <div className="absolute top-6 right-6 z-10 text-right space-y-1.5">
        <div className="flex items-center justify-end gap-1.5">
          {breath.ready ? <Mic className="w-3 h-3 text-amber-200/70" /> : <MicOff className="w-3 h-3 text-white/30" />}
          <span className="text-[10px] uppercase tracking-[0.35em] text-white/50">{breath.ready ? "mic" : "no mic"}</span>
        </div>
        {cam.ready && (
          <div className="flex items-center justify-end gap-1.5">
            <Camera className="w-3 h-3 text-amber-200/60" />
            <span className="text-[10px] uppercase tracking-[0.35em] text-white/40">cam</span>
          </div>
        )}
        {(phase === "rounds" || phase === "reflect" || phase === "integrate") && (
          <>
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">cycles · {breath.cycles}</p>
            <p className="text-[10px] uppercase tracking-[0.35em] text-amber-200/70" style={{ textShadow: "0 0 12px rgba(253,224,71,0.35)" }}>
              coherence · {Math.round(coherence * 100)}
            </p>
          </>
        )}
      </div>

      {/* Bottom phase content */}
      <div className="absolute inset-x-0 bottom-24 z-10 flex flex-col items-center px-8 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "settle" && (
            <motion.div key="settle" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }} className="text-center">
              <p className="text-xl font-extralight text-white/85 tracking-[0.08em]" style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}>
                breath temple
              </p>
              <p className="mt-4 text-xs text-white/50 max-w-xs mx-auto tracking-[0.15em] font-light">soften the body · let the eyes rest</p>
            </motion.div>
          )}

          {phase === "intention" && (
            <motion.div key="intention" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} className="text-center pointer-events-auto">
              <p className="text-base font-extralight text-white/85 mb-5 tracking-wide">speak one word for this practice</p>
              {intention ? (
                <motion.p initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} className="text-3xl font-light text-amber-100 italic" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", textShadow: "0 0 24px rgba(253,224,71,0.35)" }}>
                  "{intention}"
                </motion.p>
              ) : intentionListening ? (
                <button onClick={stopIntention} className="px-6 py-2.5 rounded-full border border-amber-200/50 text-amber-100 text-sm bg-amber-500/10 backdrop-blur-md animate-pulse shadow-[0_0_24px_rgba(253,224,71,0.25)] tracking-widest uppercase text-[11px]">
                  ● listening — tap to finish
                </button>
              ) : (
                <button onClick={startIntention} className="px-7 py-2.5 rounded-full border border-white/30 text-white/85 text-[11px] uppercase tracking-[0.35em] hover:bg-white/5 hover:border-amber-200/40 hover:text-amber-100 transition-all backdrop-blur-md">
                  speak
                </button>
              )}
            </motion.div>
          )}

          {phase === "calibrate" && (
            <motion.p key="calibrate" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 1.4 }} className="text-[13px] font-extralight text-white/70 text-center tracking-[0.3em] uppercase">
              breathe naturally
            </motion.p>
          )}

          {phase === "rounds" && (
            <motion.div key={`rounds`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="text-center">
              <motion.p
                key={pacer > 0.5 ? "in" : "out"}
                initial={{ opacity: 0, y: 6, letterSpacing: "0.2em" }}
                animate={{ opacity: 0.95, y: 0, letterSpacing: "0.45em" }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="text-sm uppercase text-amber-100/90 font-extralight"
                style={{ textShadow: "0 0 18px rgba(253,224,71,0.4)" }}
              >
                {pacer > 0.5 ? "breathe in" : "let it go"}
              </motion.p>
              <div className="mt-6 flex items-center justify-center gap-2">
                {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => {
                  const filled = i < round;
                  const active = i === round;
                  return (
                    <motion.span
                      key={i}
                      animate={active ? { opacity: [0.4, 0.9, 0.4] } : {}}
                      transition={active ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" } : {}}
                      className={`block h-[3px] rounded-full transition-all duration-1000 ${
                        filled
                          ? "w-8 bg-amber-300/90 shadow-[0_0_8px_rgba(253,224,71,0.6)]"
                          : active
                          ? "w-5 bg-amber-300/60"
                          : "w-2 bg-white/15"
                      }`}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}

          {phase === "reflect" && (
            <motion.div key="reflect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} className="text-center pointer-events-auto">
              <p className="text-lg font-extralight text-white/90 mb-5" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>what is here, now?</p>
              {reflection ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }} className="text-lg text-amber-100/95 italic max-w-md font-light" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", textShadow: "0 0 20px rgba(253,224,71,0.3)" }}>"{reflection}"</motion.p>
              ) : reflectionListening ? (
                <button onClick={finalizeReflection} className="px-6 py-2.5 rounded-full border border-amber-200/50 text-amber-100 text-[11px] uppercase tracking-[0.3em] bg-amber-500/10 backdrop-blur-md animate-pulse shadow-[0_0_24px_rgba(253,224,71,0.25)]">
                  ● listening — tap when done
                </button>
              ) : (
                <p className="text-xs text-white/40">preparing…</p>
              )}
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="integrate" initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} exit={{ opacity: 0 }} transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }} className="text-center">
              <p className="text-sm font-extralight text-white/70 tracking-[0.5em] uppercase">rest</p>
              {reflection && <p className="mt-5 text-sm italic text-white/55 max-w-sm font-light" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>"{reflection}"</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip / safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-amber-100/70 transition-all duration-500"
      >
        complete →
      </button>
    </div>
  );
}

export default function BreathTemple() {
  const g = getLabGame("breath-temple")!;
  const meta = useMemo(() => labToMeta(g), [g]);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}
