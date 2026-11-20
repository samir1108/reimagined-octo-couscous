// THE SIGH v2 — flagship #5, fully sensorial.
//
// Senses used:
//   - Microphone (breath envelope, exhale length, sigh detection)
//   - TTS (guru voice coaches each phase + adaptive feedback per round)
//   - STT (closing reflection)
//   - Sound design (soft bed + chimes per beat)
//   - Haptics (the two inhale taps + long exhale dwell)
//
// Phases:
//   1. SETTLE   (8s)
//   2. DEMO     (12s) — TTS explains the cyclic sigh
//   3. PRACTICE (3 × 16s = 48s) — guided double-inhale + long exhale
//   4. SOLO     (40s) — user does it on their own; mic counts sighs
//   5. REFLECT  (≤14s) — STT
//   6. INTEGRATE(8s)
//
// Reference: Balban / Huberman 2023 — Cyclic Sighing.

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
import TheSighWave from "./TheSighWave";

type Phase = "settle" | "demo" | "practice" | "solo" | "reflect" | "integrate";

const PHASE_MS: Record<Phase, number> = {
  settle: 8000,
  demo: 12000,
  practice: 48000,
  solo: 40000,
  reflect: 14000,
  integrate: 8000,
};
const ORDER: Phase[] = ["settle", "demo", "practice", "solo", "reflect", "integrate"];
const ROUND_MS = 16000;
const TOTAL_ROUNDS = 3;
// Beat windows inside a round (ms): inhale1, hold, inhale2, exhale start
const BEAT_INHALE1 = 0;
const BEAT_INHALE2 = 1800;
const BEAT_EXHALE  = 3000;
const BEAT_REST    = 12000;

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [phase, setPhase] = useState<Phase>("settle");
  const [round, setRound] = useState(0);
  const [cycleProgress, setCycleProgress] = useState(0);
  const [reflection, setReflection] = useState("");
  const [reflectionListening, setReflectionListening] = useState(false);
  const [sighPulse, setSighPulse] = useState(0);
  const [beat, setBeat] = useState<"in1" | "hold" | "in2" | "out" | "rest">("rest");

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const phaseStartRef = useRef<number>(Date.now());
  const sessionStartRef = useRef<number>(Date.now());
  const endedRef = useRef(false);
  const lastBeatRef = useRef<string>("");
  const exhaleSamplesRef = useRef<number[]>([]);
  const sighsTotalRef = useRef(0);
  const lastSighCountRef = useRef(0);
  const midCoachedRef = useRef(false);

  // Soft ambient bed
  useEffect(() => {
    sd.bed("temple", 0.18);
    return () => sd.stopBed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phase advance
  useEffect(() => {
    const id = setInterval(() => {
      if (endedRef.current) return;
      const elapsed = Date.now() - phaseStartRef.current;
      if (elapsed < PHASE_MS[phase]) return;
      const idx = ORDER.indexOf(phase);
      if (idx < ORDER.length - 1) {
        setPhase(ORDER[idx + 1]);
        phaseStartRef.current = Date.now();
      } else {
        finish();
      }
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Phase entry
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.16);
        await say("welcome. one of the fastest known ways to calm the body.", "guru");
        if (cancelled) return;
        await say("the cyclic sigh.", "guru");
      } else if (phase === "demo") {
        await say("two inhales through the nose. then one long exhale through the mouth.", "guru");
        if (cancelled) return;
        await say("we'll do it together three times.", "guru");
      } else if (phase === "practice") {
        sd.chime("rise", 0.18);
        midCoachedRef.current = false;
      } else if (phase === "solo") {
        sd.chime("rise", 0.16);
        await say("now on your own. stay with the rhythm. we'll listen.", "guru");
        sighsTotalRef.current = breath.sighs;
        lastSighCountRef.current = breath.sighs;
      } else if (phase === "reflect") {
        sd.chime("drop", 0.18);
        await say("what shifted? speak softly when you're ready.", "guru");
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
        await say("the body remembers. carry it with you.", "guru");
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Practice loop — drive beats, haptics, TTS cues, cycle progress
  useEffect(() => {
    if (phase !== "practice") return;
    const id = setInterval(() => {
      const elapsed = Date.now() - phaseStartRef.current;
      const r = Math.min(TOTAL_ROUNDS, Math.floor(elapsed / ROUND_MS) + 1);
      const tInRound = elapsed % ROUND_MS;
      setCycleProgress(tInRound / ROUND_MS);

      let b: typeof beat = "rest";
      if (tInRound < 1200) b = "in1";
      else if (tInRound < BEAT_INHALE2) b = "hold";
      else if (tInRound < BEAT_EXHALE) b = "in2";
      else if (tInRound < BEAT_REST) b = "out";
      else b = "rest";
      if (b !== beat) setBeat(b);

      if (r !== round) {
        setRound(r);
        if (r <= TOTAL_ROUNDS) {
          if (r === 1) say("first inhale.", "guru");
        }
      }

      const beatKey = `${r}:${b}`;
      if (beatKey !== lastBeatRef.current) {
        lastBeatRef.current = beatKey;
        if (b === "in1")  { buzz("inhale"); sd.chime("rise", 0.12); }
        if (b === "in2")  { buzz("inhale"); sd.chime("rise", 0.14); }
        if (b === "out")  { buzz("exhale"); say("long exhale.", "guru"); }
      }

      // Mid-practice coaching
      if (!midCoachedRef.current && r === 2 && b === "rest") {
        midCoachedRef.current = true;
        if (breath.lastExhaleMs > 4000) say("beautiful. let the exhale grow even longer.", "guru");
        else say("don't force it. small and slow is enough.", "guru");
      }
    }, 80);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round, beat]);

  // Solo loop — count sighs, pulse on detection
  useEffect(() => {
    if (phase !== "solo") return;
    const elapsed = Date.now() - phaseStartRef.current;
    setCycleProgress((elapsed % 12000) / 12000);
  }, [phase, breath.envelope]);

  useEffect(() => {
    if (phase !== "solo") return;
    if (breath.sighs > lastSighCountRef.current) {
      lastSighCountRef.current = breath.sighs;
      setSighPulse((p) => p + 1);
      sd.chime("rise", 0.14);
      buzz("exhale");
    }
  }, [breath.sighs, phase]);

  // Track exhale samples through practice & solo
  useEffect(() => {
    if (phase !== "practice" && phase !== "solo") return;
    if (breath.lastExhaleMs > 1500) {
      exhaleSamplesRef.current.push(breath.lastExhaleMs);
      if (exhaleSamplesRef.current.length > 24) exhaleSamplesRef.current.shift();
    }
  }, [breath.lastExhaleMs, phase]);

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    const exhales = exhaleSamplesRef.current;
    const avgExhale = exhales.length
      ? Math.round(exhales.reduce((a, b) => a + b, 0) / exhales.length)
      : null;
    const longestExhale = exhales.length ? Math.max(...exhales) : null;
    const soloSighs = Math.max(0, breath.sighs - sighsTotalRef.current);
    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        spoken_reflection: reflection || null,
        mic_ready: breath.ready,
        practice_rounds: Math.min(TOTAL_ROUNDS, round),
        solo_sighs_detected: soloSighs,
        total_sighs_detected: breath.sighs,
        avg_exhale_ms: avgExhale,
        longest_exhale_ms: longestExhale,
        cycles_detected: breath.cycles,
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

  const showWave = phase === "demo" || phase === "practice" || phase === "solo";
  const soloProgress = phase === "solo" ? Math.min(1, (Date.now() - phaseStartRef.current) / PHASE_MS.solo) : 0;

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Dual aurora — warm amber above, cool rose below, slow-drift */}
      <motion.div
        animate={{ opacity: [0.10, 0.22, 0.10], y: [0, -8, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-amber-900/25 via-transparent to-amber-950/30 pointer-events-none"
      />
      <motion.div
        animate={{ opacity: [0.05, 0.14, 0.05], y: [0, 8, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-t from-rose-950/35 via-transparent to-transparent pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85" />
      {/* Cinematic radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.55) 82%, rgba(0,0,0,0.92) 100%)" }}
      />
      {/* Film grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Wave canvas */}
      {showWave && (
        <TheSighWave
          envelope={breath.envelope}
          cycleProgress={phase === "solo" ? soloProgress : cycleProgress}
          showTarget={phase === "demo" || phase === "practice"}
          pulse={sighPulse}
        />
      )}

      {/* Top-left: phase pill */}
      <div className="absolute top-6 left-6 z-10">
        <motion.div
          key={phase}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 0.9, x: 0 }}
          transition={{ duration: 0.7 }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-amber-200/75"
        >
          <motion.span
            className="inline-block w-1 h-1 rounded-full bg-amber-300/85"
            animate={{ opacity: [0.35, 1, 0.35], scale: [0.9, 1.25, 0.9] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          {phase === "settle" && "settling"}
          {phase === "demo" && "the pattern"}
          {phase === "practice" && `round ${round} of ${TOTAL_ROUNDS}`}
          {phase === "solo" && "your turn"}
          {phase === "reflect" && "speak"}
          {phase === "integrate" && "rest"}
        </motion.div>
      </div>

      {/* Top-right signals */}
      <div className="absolute top-6 right-6 z-10 text-right space-y-1.5">
        <div className="flex items-center justify-end gap-1.5">
          {breath.ready ? <Mic className="w-3 h-3 text-amber-200/70" /> : <MicOff className="w-3 h-3 text-white/30" />}
          <span className="text-[10px] uppercase tracking-widest text-white/50">{breath.ready ? "mic" : "no mic"}</span>
        </div>
        {(phase === "practice" || phase === "solo" || phase === "reflect" || phase === "integrate") && (
          <>
            <p className="text-[10px] uppercase tracking-widest text-white/40">sighs · {Math.max(0, breath.sighs)}</p>
            {breath.lastExhaleMs > 0 && (
              <p className="text-[10px] uppercase tracking-widest text-amber-200/65">
                exhale · {(breath.lastExhaleMs / 1000).toFixed(1)}s
              </p>
            )}
          </>
        )}
      </div>

      {/* Center beat indicator during practice */}
      {phase === "practice" && (
        <div className="absolute inset-x-0 top-[18%] flex items-center justify-center pointer-events-none z-10">
          <motion.div
            key={`${round}-${beat}`}
            initial={{ opacity: 0, scale: 0.94, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.55 }}
            className="text-4xl sm:text-5xl italic tracking-[0.08em]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
          >
            {beat === "in1"  && <span className="text-amber-100/95">inhale</span>}
            {beat === "hold" && <span className="text-amber-100/60">hold</span>}
            {beat === "in2"  && <span className="text-amber-100/95">+ inhale</span>}
            {beat === "out"  && <span className="text-rose-200/95">exhale ─────</span>}
            {beat === "rest" && <span className="text-white/45">rest</span>}
          </motion.div>
        </div>
      )}

      {/* Bottom phase content */}
      <div className="absolute inset-x-0 bottom-24 z-10 flex flex-col items-center px-8 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "settle" && (
            <motion.div key="settle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1.6 }} className="text-center">
              <p
                className="text-4xl sm:text-5xl text-amber-50/90 italic tracking-wide"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
              >
                the sigh
              </p>
              <div className="mt-5 h-px w-16 bg-amber-100/25 mx-auto" />
              <p className="mt-4 text-[11px] uppercase tracking-[0.4em] text-amber-100/55 max-w-xs mx-auto">
                two inhales · one long release
              </p>
            </motion.div>
          )}

          {phase === "demo" && (
            <motion.div key="demo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} className="text-center">
              <p
                className="text-2xl text-amber-50/85 italic tracking-[0.1em]"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
              >
                in · in · out ─────
              </p>
              <p className="mt-3 text-[10px] uppercase tracking-[0.4em] text-amber-100/50">watch the curve</p>
            </motion.div>
          )}

          {phase === "practice" && (
            <motion.div key={`p-${round}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center">
              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
                  <motion.span
                    key={i}
                    className={`block h-[3px] rounded-full transition-all duration-700 ${
                      i < round
                        ? "w-10 bg-gradient-to-r from-amber-300/90 to-rose-200/70"
                        : i === round
                        ? "w-5 bg-amber-300/60"
                        : "w-2 bg-white/15"
                    }`}
                    animate={i === round ? { opacity: [0.55, 1, 0.55] } : { opacity: 1 }}
                    transition={i === round ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {phase === "solo" && (
            <motion.p
              key="solo"
              initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 1.4 }}
              className="text-xl italic text-amber-50/75 text-center tracking-wide"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
            >
              your own rhythm
            </motion.p>
          )}

          {phase === "reflect" && (
            <motion.div key="reflect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} className="text-center pointer-events-auto">
              <p
                className="text-2xl text-amber-50/90 italic mb-5 tracking-wide"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
              >
                what shifted?
              </p>
              {reflection ? (
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-lg text-amber-100/90 italic max-w-md leading-relaxed"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
                >"{reflection}"</motion.p>
              ) : reflectionListening ? (
                <button onClick={finalizeReflection} className="px-5 py-2.5 rounded-full border border-amber-200/40 text-amber-100 text-[11px] uppercase tracking-[0.3em] bg-amber-500/10 backdrop-blur-sm animate-pulse">
                  ● listening · tap when done
                </button>
              ) : (
                <p className="text-xs text-white/40">preparing…</p>
              )}
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="integrate" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 1.6 }} className="text-center">
              <p className="text-[11px] font-light text-amber-100/65 tracking-[0.5em] uppercase">rest</p>
              <div className="mt-5 h-px w-12 bg-amber-100/20 mx-auto" />
              {reflection && (
                <p
                  className="mt-6 text-lg italic text-amber-50/70 max-w-sm leading-relaxed"
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

export default function TheSigh() {
  const g = getLabGame("the-sigh")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}
