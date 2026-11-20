// THE PAUSE v2 — flagship #29, willpower as restraint, not action.
//
// A red urge-orb pulses in the void. The user must NOT press it for 90 seconds.
// We measure the *shape* of the restraint: hover count, hover dwell, near-miss
// proximity, somatic agitation (mic envelope variance), and the whispered
// confession of what almost broke them.
//
// We track:
//   - survived_ms (time held without pressing)
//   - pressed (boolean) + press_at_ms
//   - hover_count, total_hover_ms
//   - near_misses (proximity peaks above 0.7 without press)
//   - max_proximity, mean_proximity
//   - env_var (mic agitation during the hold)
//   - confession (whispered "what almost made me press") via STT
//
// Senses used:
//   - TTS (framing, calibration, integration)
//   - Pointer proximity to the orb (urge geometry)
//   - Microphone envelope (somatic restraint signal)
//   - STT (the confession)
//   - Sound design + haptics
//
// XState phases:
//   1. settle    — opening line
//   2. hold      — 90s, the orb is live, all instruments recording
//   3. reveal    — calibration based on shape of restraint
//   4. words     — STT, "what almost made you press?"
//   5. integrate — closing line, then end

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { setup, assign } from "xstate";
import { useMachine } from "@xstate/react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useBreathMic } from "../shell/useBreathMic";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import ThePauseCanvas from "./ThePauseCanvas";

const HOLD_SECONDS = 90;
const NEAR_MISS_THRESHOLD = 0.7;
const PROX_RADIUS_PX = 220; // distance at which proximity = 1

type Ctx = { pressed: boolean };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: { type: "ADVANCE" } | { type: "PRESS" } | { type: "FINALIZE" };
  },
  actions: {
    markPressed: assign({ pressed: () => true }),
  },
}).createMachine({
  id: "thePause",
  initial: "settle",
  context: { pressed: false },
  states: {
    settle: { on: { ADVANCE: "hold" } },
    hold: {
      on: {
        ADVANCE: "reveal",
        PRESS: { target: "reveal", actions: "markPressed" },
      },
    },
    reveal:    { on: { ADVANCE: "words" } },
    words:     { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done:      { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as "settle" | "hold" | "reveal" | "words" | "integrate" | "done";
  const pressed = state.context.pressed;

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [survivedSec, setSurvivedSec] = useState(0);
  const [proximity, setProximity] = useState(0);
  const [flashKey, setFlashKey] = useState(0);
  const [revealLine, setRevealLine] = useState("");
  const [whispered, setWhispered] = useState("");
  const [listeningFinal, setListeningFinal] = useState(false);

  const orbRef = useRef<HTMLButtonElement | null>(null);
  const holdStartRef = useRef(0);
  const sessionStartRef = useRef(Date.now());
  const hoverStartRef = useRef<number | null>(null);
  const proxSamplesRef = useRef<number[]>([]);
  const envSamplesRef = useRef<number[]>([]);
  const hoverCountRef = useRef(0);
  const totalHoverMsRef = useRef(0);
  const nearMissesRef = useRef(0);
  const lastNearMissAtRef = useRef(0);
  const wasNearRef = useRef(false);
  const phaseRef = useRef(phase);
  const endedRef = useRef(false);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Bed
  useEffect(() => {
    sd.bed("temple", 0.05);
    return () => { sd.stopBed(); stopVoice(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sample mic during hold
  useEffect(() => {
    if (phase !== "hold") return;
    envSamplesRef.current.push(breath.envelope);
  }, [breath.envelope, phase]);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.08);
        await say("a red orb. ninety seconds. don't press it. notice everything that wants to.", "guru");
        if (cancelled) return;
        setTimeout(() => { if (!cancelled) send({ type: "ADVANCE" }); }, 700);
      } else if (phase === "hold") {
        holdStartRef.current = performance.now();
      } else if (phase === "reveal") {
        sd.chime("drop", 0.1);
        const line = buildRevealLine();
        await say(line, "guru");
      } else if (phase === "words") {
        sd.chime("drop", 0.08);
        await say(pressed
          ? "you pressed. say it — what was the thought just before your hand moved?"
          : "you held. say it — what almost made you press?", "guru");
        if (cancelled) return;
        try { await transcribe.start(); setListeningFinal(true); } catch {}
      } else if (phase === "integrate") {
        if (listeningFinal) {
          setListeningFinal(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setWhispered(r.transcript.trim().slice(0, 280));
        }
        sd.chime("drop", 0.12);
        stopVoice();
        await say("the practice was never the orb. the practice was the not-doing. that is where the will lives.", "guru");
      } else if (phase === "done") {
        finish();
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Survived ticker + auto-end at HOLD_SECONDS
  useEffect(() => {
    if (phase !== "hold") return;
    const tick = setInterval(() => {
      const elapsed = (performance.now() - holdStartRef.current) / 1000;
      setSurvivedSec(elapsed);
      if (elapsed >= HOLD_SECONDS) {
        clearInterval(tick);
        send({ type: "ADVANCE" });
      }
    }, 100);
    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Pointer proximity tracker
  useEffect(() => {
    if (phase !== "hold") return;
    const onMove = (e: PointerEvent) => {
      const orb = orbRef.current; if (!orb) return;
      const r = orb.getBoundingClientRect();
      const ox = r.left + r.width / 2;
      const oy = r.top + r.height / 2;
      const d = Math.hypot(e.clientX - ox, e.clientY - oy);
      const p = Math.max(0, Math.min(1, 1 - d / PROX_RADIUS_PX));
      setProximity(p);
      proxSamplesRef.current.push(p);
      // Near-miss: proximity peaks above threshold but no press
      if (p >= NEAR_MISS_THRESHOLD && !wasNearRef.current) {
        wasNearRef.current = true;
        const now = performance.now();
        if (now - lastNearMissAtRef.current > 600) {
          nearMissesRef.current += 1;
          lastNearMissAtRef.current = now;
          setFlashKey((k) => k + 1);
          buzz("tap");
          sd.chime("drop", 0.05);
        }
      } else if (p < NEAR_MISS_THRESHOLD - 0.15) {
        wasNearRef.current = false;
      }
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const onOrbEnter = () => {
    if (phaseRef.current !== "hold") return;
    hoverCountRef.current += 1;
    hoverStartRef.current = performance.now();
  };
  const onOrbLeave = () => {
    if (hoverStartRef.current) {
      totalHoverMsRef.current += performance.now() - hoverStartRef.current;
      hoverStartRef.current = null;
    }
  };
  const onOrbPress = () => {
    if (phaseRef.current !== "hold") return;
    if (hoverStartRef.current) {
      totalHoverMsRef.current += performance.now() - hoverStartRef.current;
      hoverStartRef.current = null;
    }
    sd.chime("drop", 0.18);
    buzz("tap");
    send({ type: "PRESS" });
  };

  const variance = (arr: number[]) => {
    if (!arr.length) return 0;
    const m = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length;
  };

  const buildRevealLine = (): string => {
    const dwellMs = performance.now() - holdStartRef.current;
    const dwellSec = dwellMs / 1000;
    const survivedFrac = Math.min(1, dwellSec / HOLD_SECONDS);
    const hovers = hoverCountRef.current;
    const totalHover = totalHoverMsRef.current;
    const nearMisses = nearMissesRef.current;
    const proxMean = proxSamplesRef.current.length
      ? proxSamplesRef.current.reduce((a, b) => a + b, 0) / proxSamplesRef.current.length
      : 0;
    const proxMax = proxSamplesRef.current.length ? Math.max(...proxSamplesRef.current) : 0;
    const envVar = variance(envSamplesRef.current);

    let line: string;
    if (pressed && dwellSec < 15) {
      line = `you pressed at ${dwellSec.toFixed(1)} seconds. the urge was already in motion before the instruction landed. notice that — the body moved before you chose.`;
    } else if (pressed) {
      line = `you held ${Math.round(dwellSec)} seconds, then pressed. somewhere in that window the not-doing got expensive. that exact moment is where the practice begins.`;
    } else if (survivedFrac >= 1 && nearMisses === 0 && hovers === 0) {
      line = `ninety seconds. no hovers. no approaches. either the urge was absent — or you went very still inside it. either way, that stillness is rare.`;
    } else if (survivedFrac >= 1 && nearMisses >= 3) {
      line = `you reached ${nearMisses} times — and didn't press. the will isn't the absence of urge. it is the gap between urge and action. you found it.`;
    } else if (survivedFrac >= 1 && totalHover > 8000) {
      line = `you survived, but you stayed close. ${Math.round(totalHover/1000)} seconds hovering over the red. the restraint cost something. notice the cost.`;
    } else if (survivedFrac >= 1 && envVar > 0.012) {
      line = `you didn't press — but the breath got busy. the body fought the orb even when the hand didn't. that agitation is the will at work.`;
    } else if (survivedFrac >= 1) {
      line = `you held the full ninety. quietly. that quiet holding is the rarest kind of strength.`;
    } else {
      line = `the session ended early. that exit itself is information — was it boredom, restlessness, or release? notice which.`;
    }
    setRevealLine(line);
    return line;
  };

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();

    const dwellMs = holdStartRef.current ? performance.now() - holdStartRef.current : 0;
    const proxMean = proxSamplesRef.current.length
      ? proxSamplesRef.current.reduce((a, b) => a + b, 0) / proxSamplesRef.current.length
      : 0;
    const proxMax = proxSamplesRef.current.length ? Math.max(...proxSamplesRef.current) : 0;
    const envMean = envSamplesRef.current.length
      ? envSamplesRef.current.reduce((a, b) => a + b, 0) / envSamplesRef.current.length
      : 0;
    const envVar = variance(envSamplesRef.current);

    onEnd({
      outcome: !pressed && dwellMs >= HOLD_SECONDS * 1000 * 0.95 ? "completed" : pressed ? "interrupted" : "abandoned",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        target_ms: HOLD_SECONDS * 1000,
        survived_ms: Math.round(dwellMs),
        survived_frac: +Math.min(1, dwellMs / (HOLD_SECONDS * 1000)).toFixed(3),
        pressed,
        press_at_ms: pressed ? Math.round(dwellMs) : null,
        hover_count: hoverCountRef.current,
        total_hover_ms: Math.round(totalHoverMsRef.current),
        near_misses: nearMissesRef.current,
        proximity_mean: +proxMean.toFixed(3),
        proximity_max: +proxMax.toFixed(3),
        env_mean: +envMean.toFixed(5),
        env_var: +envVar.toFixed(5),
        reveal_line: revealLine,
        confession: whispered || null,
        mic_ready: breath.ready,
      },
    });
  };

  const survivedFrac = Math.min(1, survivedSec / HOLD_SECONDS);

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <ThePauseCanvas
        envelope={breath.envelope}
        proximity={phase === "hold" ? proximity : 0}
        survivedFrac={survivedFrac}
        flashKey={flashKey}
      />

      {/* Cinematic vignette */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0.9) 100%)" }}
      />
      {/* Film grain */}
      <div
        className="absolute inset-0 z-10 pointer-events-none opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Top-left phase pill */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <motion.div
          key={String(phase)}
          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 0.9, x: 0 }} transition={{ duration: 0.7 }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-rose-100/70"
        >
          <motion.span
            className="inline-block w-1 h-1 rounded-full bg-rose-300/80"
            animate={{ opacity: [0.35, 1, 0.35], scale: [0.9, 1.25, 0.9] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          {phase === "settle" && "the pause"}
          {phase === "hold" && `holding · ${Math.floor(survivedSec)}s / ${HOLD_SECONDS}s`}
          {phase === "reveal" && "calibration"}
          {phase === "words" && "the confession"}
          {phase === "integrate" && "rest"}
        </motion.div>
      </div>

      {/* Top-right mic + near-miss counter */}
      <div className="absolute top-6 right-6 z-30 text-right space-y-1.5 pointer-events-none">
        <div className="flex items-center justify-end gap-1.5">
          {breath.ready ? <Mic className="w-3 h-3 text-rose-100/60" /> : <MicOff className="w-3 h-3 text-white/30" />}
          <span className="text-[10px] uppercase tracking-widest text-white/50">{breath.ready ? "mic" : "no mic"}</span>
        </div>
        {phase === "hold" && (
          <div className="text-[10px] tracking-widest text-white/40">near · {nearMissesRef.current}</div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {phase === "settle" && (
          <motion.div
            key="settle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.6 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none px-8 text-center"
          >
            <p
              className="text-4xl sm:text-5xl text-rose-50/90 italic tracking-wide"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
            >
              the pause
            </p>
            <div className="mt-5 h-px w-16 bg-rose-100/25" />
            <p className="mt-5 text-[11px] uppercase tracking-[0.4em] text-rose-100/55 max-w-xs leading-relaxed">
              don't press the red
            </p>
            <p className="mt-2 text-xs text-white/45 max-w-xs leading-relaxed italic">
              notice everything that wants to
            </p>
          </motion.div>
        )}

        {phase === "hold" && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <motion.button
              ref={orbRef}
              onPointerEnter={onOrbEnter}
              onPointerLeave={onOrbLeave}
              onClick={onOrbPress}
              animate={{
                scale: [1, 1.06 + proximity * 0.06, 1],
              }}
              transition={{ duration: Math.max(0.6, 1.6 - proximity * 0.9), repeat: Infinity, ease: "easeInOut" }}
              className="w-32 h-32 sm:w-36 sm:h-36 rounded-full text-rose-50/90 text-[10px] tracking-[0.35em] uppercase font-light backdrop-blur-sm relative"
              style={{
                background: `
                  radial-gradient(circle at 32% 26%, rgba(255,${180 + proximity * 55},${170 + proximity * 55},0.98) 0%, rgba(255,${110 + proximity * 50},${90 + proximity * 40},0.92) 28%, rgba(${170 - proximity * 40},22,26,0.9) 62%, rgba(${90 - proximity * 30},8,12,0.95) 100%)
                `,
                boxShadow: `
                  0 0 ${30 + proximity * 70}px rgba(220,38,38,${0.35 + proximity * 0.45}),
                  0 0 ${8 + proximity * 20}px rgba(255,180,160,${0.25 + proximity * 0.35}) inset,
                  0 0 1px rgba(255,220,210,0.6) inset
                `,
              }}
              aria-label="Don't press"
            >
              <span className="opacity-80">press me</span>
            </motion.button>
          </div>
        )}

        {phase === "reveal" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.4 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none"
          >
            <p className="text-[10px] uppercase tracking-[0.45em] text-rose-100/60 mb-6">calibration</p>
            <div className="h-px w-10 bg-rose-100/25 mb-6" />
            <p
              className="text-xl sm:text-2xl text-rose-50/90 italic leading-[1.55] max-w-md"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
            >
              "{revealLine || "…"}"
            </p>
          </motion.div>
        )}

        {phase === "words" && (
          <motion.div
            key="words"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.9 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center max-w-md mx-auto gap-6"
          >
            <p className="text-[10px] uppercase tracking-[0.42em] text-rose-100/55">the confession</p>
            <p
              className="text-xl sm:text-2xl text-rose-50/90 italic leading-[1.55] max-w-sm"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
            >
              {pressed ? "what was the thought before your hand moved?" : "what almost made you press?"}
            </p>
            {listeningFinal ? (
              <button
                onClick={() => send({ type: "ADVANCE" })}
                className="px-5 py-2.5 rounded-full border border-rose-100/30 text-rose-50/85 text-[11px] uppercase tracking-[0.3em] bg-rose-500/5 backdrop-blur-sm animate-pulse"
              >
                ● listening · tap when done
              </button>
            ) : (
              <p className="text-xs text-white/40">preparing…</p>
            )}
          </motion.div>
        )}

        {phase === "integrate" && (
          <motion.div
            key="integrate"
            initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.8 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none"
          >
            <p className="text-[11px] font-light text-rose-100/65 tracking-[0.5em] uppercase">rest</p>
            <div className="mt-5 h-px w-12 bg-rose-100/20" />
            {whispered && (
              <p
                className="mt-6 text-lg italic text-rose-50/70 max-w-sm leading-relaxed"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
              >
                "{whispered}"
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-advance integrate */}
      <PhaseTimers phase={phase} send={send as any} />

      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-40 text-[10px] uppercase tracking-widest text-white/25 hover:text-white/65 transition"
      >
        end · save
      </button>
    </div>
  );
}

function PhaseTimers({ phase, send }: { phase: string; send: (e: any) => void }) {
  // reveal -> words
  useEffect(() => {
    if (phase !== "reveal") return;
    const t = setTimeout(() => send({ type: "ADVANCE" }), 11_000);
    return () => clearTimeout(t);
  }, [phase, send]);
  // words -> integrate (cap 22s)
  useEffect(() => {
    if (phase !== "words") return;
    const t = setTimeout(() => send({ type: "ADVANCE" }), 22_000);
    return () => clearTimeout(t);
  }, [phase, send]);
  // integrate -> done
  useEffect(() => {
    if (phase !== "integrate") return;
    const t = setTimeout(() => send({ type: "FINALIZE" }), 8_000);
    return () => clearTimeout(t);
  }, [phase, send]);
  return null;
}

export default function ThePause() {
  const g = getLabGame("the-pause")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}
