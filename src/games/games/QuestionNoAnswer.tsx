// THE QUESTION WITH NO ANSWER v2 — flagship #28, Mumonkan kōan sitting.
//
// One kōan. No resolution. The practice is to sit with cognitive dissonance
// without collapsing it into an answer. We measure how the system reacts to
// being denied closure.
//
// We track:
//   - dwell_ms (how long the user sat)
//   - urge_taps (each "i need to answer" impulse the user honestly marks)
//   - urge_curve (urge taps over time — does the grasp soften?)
//   - env_var (mic envelope variance — somatic agitation)
//   - non_answer (whispered, non-rational response via STT — pointing not solving)
//
// Senses used:
//   - TTS (kōan recitation, calibration, integration)
//   - Microphone envelope (somatic agitation as the mind tries to solve)
//   - STT (the whispered "non-answer")
//   - Sound design + haptics
//
// XState phases:
//   1. settle    — opening line + the kōan is voiced
//   2. sit       — single still frame; user sits N seconds; can mark urges
//   3. reveal    — calibration on dwell / urges / agitation
//   4. words     — STT, "say something that points, not solves"
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
import QuestionNoAnswerCanvas from "./QuestionNoAnswerCanvas";

const KOANS = [
  "what is the sound of one hand clapping?",
  "what was your face before your parents were born?",
  "where does the fist go when you open your hand?",
  "if you meet the buddha on the road — kill him. why?",
  "the wind is moving. the flag is moving. but what is it that moves?",
];

const SIT_SECONDS = 90;
const MIN_SIT_TO_REVEAL = 25;

type Ctx = { koan: string };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: { type: "ADVANCE" } | { type: "FINALIZE" };
  },
  actions: {
    pickKoan: assign({ koan: () => KOANS[Math.floor(Math.random() * KOANS.length)] }),
  },
}).createMachine({
  id: "questionNoAnswer",
  initial: "settle",
  context: { koan: KOANS[0] },
  entry: "pickKoan",
  states: {
    settle:    { on: { ADVANCE: "sit" } },
    sit:       { on: { ADVANCE: "reveal" } },
    reveal:    { on: { ADVANCE: "words" } },
    words:     { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done:      { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as "settle" | "sit" | "reveal" | "words" | "integrate" | "done";
  const koan = state.context.koan;

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [dwellSec, setDwellSec] = useState(0);
  const [urgeCount, setUrgeCount] = useState(0);
  const [revealLine, setRevealLine] = useState("");
  const [whispered, setWhispered] = useState("");
  const [listeningFinal, setListeningFinal] = useState(false);
  const [koanRevealed, setKoanRevealed] = useState(false);

  const sitStartRef = useRef<number>(0);
  const sessionStartRef = useRef(Date.now());
  const urgeTimesRef = useRef<number[]>([]);
  const envSamplesRef = useRef<number[]>([]);
  const endedRef = useRef(false);
  const phaseRef = useRef(phase);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Bed
  useEffect(() => {
    sd.bed("temple", 0.05);
    return () => { sd.stopBed(); stopVoice(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sample mic envelope during sit
  useEffect(() => {
    if (phase !== "sit") return;
    envSamplesRef.current.push(breath.envelope);
  }, [breath.envelope, phase]);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.08);
        await say("a question with no answer. don't try to solve it. just sit. when the urge to answer comes, mark it.", "guru");
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, 600));
        if (cancelled) return;
        sd.chime("drop", 0.06);
        await say(koan, "guru");
        if (cancelled) return;
        setKoanRevealed(true);
        setTimeout(() => { if (!cancelled) send({ type: "ADVANCE" }); }, 800);
      } else if (phase === "sit") {
        sitStartRef.current = performance.now();
      } else if (phase === "reveal") {
        sd.chime("drop", 0.1);
        const line = buildRevealLine();
        await say(line, "guru");
      } else if (phase === "words") {
        sd.chime("drop", 0.08);
        await say("now — say something. not an answer. a gesture. a sound. a word that points, not solves.", "guru");
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
        await say("the kōan is not the question. the kōan is what you became while sitting with it.", "guru");
      } else if (phase === "done") {
        finish();
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Dwell ticker during sit
  useEffect(() => {
    if (phase !== "sit") return;
    const t = setInterval(() => {
      setDwellSec((performance.now() - sitStartRef.current) / 1000);
    }, 250);
    return () => clearInterval(t);
  }, [phase]);

  // Auto-end sit at SIT_SECONDS
  useEffect(() => {
    if (phase !== "sit") return;
    const t = setTimeout(() => send({ type: "ADVANCE" }), SIT_SECONDS * 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Auto-advance reveal → words
  useEffect(() => {
    if (phase !== "reveal") return;
    const t = setTimeout(() => send({ type: "ADVANCE" }), 11_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Cap final whisper at 22s
  useEffect(() => {
    if (phase !== "words") return;
    const t = setTimeout(() => send({ type: "ADVANCE" }), 22_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Integrate → done
  useEffect(() => {
    if (phase !== "integrate") return;
    const t = setTimeout(() => send({ type: "FINALIZE" }), 8_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const variance = (arr: number[]) => {
    if (!arr.length) return 0;
    const m = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length;
  };

  const markUrge = () => {
    if (phaseRef.current !== "sit") return;
    urgeTimesRef.current.push(performance.now() - sitStartRef.current);
    setUrgeCount((c) => c + 1);
    buzz("tap");
    sd.chime("drop", 0.04);
  };

  const earlyClose = () => {
    if (phaseRef.current === "sit" && dwellSec >= MIN_SIT_TO_REVEAL) {
      send({ type: "ADVANCE" });
    }
  };

  const buildRevealLine = (): string => {
    const dwell = (performance.now() - sitStartRef.current) / 1000;
    const urges = urgeTimesRef.current;
    const envVar = variance(envSamplesRef.current);
    const envMean = envSamplesRef.current.length
      ? envSamplesRef.current.reduce((a, b) => a + b, 0) / envSamplesRef.current.length
      : 0;

    // urge curve — first vs second half of sit
    const half = dwell / 2;
    const earlyUrges = urges.filter((t) => t / 1000 < half).length;
    const lateUrges  = urges.filter((t) => t / 1000 >= half).length;
    const grip_softened = earlyUrges > 0 && lateUrges < earlyUrges;

    let line: string;
    if (urges.length === 0 && dwell > SIT_SECONDS * 0.7) {
      line = `you sat ${Math.round(dwell)} seconds without once reaching for an answer. that is rare. the mind found nothing to grip — and stayed.`;
    } else if (grip_softened) {
      line = `the urge came ${earlyUrges} times early, then only ${lateUrges} late. the grip is softening. that is the practice.`;
    } else if (urges.length >= 6) {
      line = `${urges.length} urges in ${Math.round(dwell)} seconds. the mind is hungry for resolution. notice the hunger itself — that is the kōan working.`;
    } else if (envVar > 0.012) {
      line = `the breath got busy where the mind couldn't. the body carries what the words refused. that agitation is the unanswer arriving.`;
    } else if (envMean < 0.04 && dwell > SIT_SECONDS * 0.6) {
      line = `you went very quiet. the system stopped trying. the kōan didn't dissolve — you did, a little.`;
    } else if (dwell < MIN_SIT_TO_REVEAL + 5) {
      line = `you left early. the question was just starting to land. that exit itself is information — notice where it came from.`;
    } else {
      line = `you sat. you marked the urges. you didn't pretend. that honesty is more useful than any answer would have been.`;
    }
    setRevealLine(line);
    return line;
  };

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();

    const dwellMs = sitStartRef.current ? performance.now() - sitStartRef.current : 0;
    const envVar = variance(envSamplesRef.current);
    const envMean = envSamplesRef.current.length
      ? envSamplesRef.current.reduce((a, b) => a + b, 0) / envSamplesRef.current.length
      : 0;
    const half = dwellMs / 2;
    const urges = urgeTimesRef.current;
    const earlyUrges = urges.filter((t) => t < half).length;
    const lateUrges = urges.filter((t) => t >= half).length;

    onEnd({
      outcome: dwellMs >= SIT_SECONDS * 1000 * 0.85 ? "completed" : "abandoned",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        koan,
        dwell_ms: Math.round(dwellMs),
        target_ms: SIT_SECONDS * 1000,
        urge_taps: urges.length,
        urge_times_ms: urges.map((n) => Math.round(n)),
        urges_early: earlyUrges,
        urges_late: lateUrges,
        grip_softened: earlyUrges > 0 && lateUrges < earlyUrges,
        env_mean: +envMean.toFixed(5),
        env_var: +envVar.toFixed(5),
        reveal_line: revealLine,
        non_answer: whispered || null,
        mic_ready: breath.ready,
      },
    });
  };

  const intensity = Math.min(1, dwellSec / SIT_SECONDS);

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/30 via-black to-indigo-950/25 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0.94) 100%)" }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />

      <QuestionNoAnswerCanvas
        envelope={breath.envelope}
        dwellSec={dwellSec}
        totalSec={SIT_SECONDS}
        urgePulse={urgeCount}
        intensity={intensity}
      />

      {/* Top-left phase pill */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <motion.div
          key={String(phase)}
          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 0.9, x: 0 }} transition={{ duration: 0.7 }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-violet-100/70"
        >
          <motion.span
            className="inline-block w-1 h-1 rounded-full bg-violet-200/85"
            animate={{ opacity: [0.35, 1, 0.35], scale: [0.9, 1.25, 0.9] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          {phase === "settle" && "the question with no answer"}
          {phase === "sit" && `sitting · ${Math.floor(dwellSec)}s / ${SIT_SECONDS}s`}
          {phase === "reveal" && "calibration"}
          {phase === "words" && "point, don't solve"}
          {phase === "integrate" && "rest"}
        </motion.div>
      </div>

      {/* Top-right mic + urge counter */}
      <div className="absolute top-6 right-6 z-30 text-right space-y-1.5 pointer-events-none">
        <div className="flex items-center justify-end gap-1.5">
          {breath.ready ? <Mic className="w-3 h-3 text-violet-100/60" /> : <MicOff className="w-3 h-3 text-white/30" />}
          <span className="text-[10px] uppercase tracking-widest text-white/50">{breath.ready ? "mic" : "no mic"}</span>
        </div>
        {phase === "sit" && (
          <div className="text-[10px] tracking-widest text-white/40">urges · {urgeCount}</div>
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
              className="text-4xl sm:text-5xl italic text-violet-50/90 tracking-wide"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
            >
              a question with no answer
            </p>
            <div className="mt-5 h-px w-16 bg-violet-100/25 mx-auto" />
            <AnimatePresence>
              {koanRevealed && (
                <motion.p
                  key="koan-line"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4 }}
                  className="mt-6 text-xl sm:text-2xl italic text-violet-50/90 max-w-md leading-relaxed"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, textShadow: "0 0 30px rgba(200,180,255,0.3)" }}
                >
                  "{koan}"
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {phase === "sit" && (
          <motion.div
            key="sit"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.4 }}
            className="absolute inset-0 z-20 px-6 flex flex-col items-center justify-end pb-16 pointer-events-none"
          >
            <p
              className="text-xl sm:text-2xl italic text-violet-50/90 max-w-md text-center leading-relaxed mb-10 pointer-events-none tracking-wide"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, textShadow: "0 0 30px rgba(200,180,255,0.28)" }}
            >
              "{koan}"
            </p>

            <div className="pointer-events-auto flex flex-col items-center gap-3">
              <button
                onClick={markUrge}
                className="px-6 py-2.5 rounded-full border border-violet-100/30 text-violet-50/85 text-[11px] uppercase tracking-[0.3em] bg-white/[0.03] hover:bg-violet-500/10 transition"
                style={{ boxShadow: "0 0 30px rgba(167,139,250,0.15)" }}
              >
                ◐ mark the urge to answer
              </button>
              <button
                onClick={earlyClose}
                disabled={dwellSec < MIN_SIT_TO_REVEAL}
                className={`text-[10px] uppercase tracking-[0.3em] transition ${
                  dwellSec < MIN_SIT_TO_REVEAL
                    ? "text-white/15"
                    : "text-white/35 hover:text-white/70"
                }`}
              >
                {dwellSec < MIN_SIT_TO_REVEAL
                  ? `sit ${Math.max(0, Math.ceil(MIN_SIT_TO_REVEAL - dwellSec))}s more`
                  : "enough · close"}
              </button>
            </div>
          </motion.div>
        )}

        {phase === "reveal" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.4 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none"
          >
            <p className="text-[10px] uppercase tracking-[0.42em] text-violet-100/70 mb-6">calibration</p>
            <p
              className="text-2xl sm:text-3xl italic text-violet-50/95 leading-relaxed max-w-md"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, textShadow: "0 0 30px rgba(200,180,255,0.3)" }}
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
            <p className="text-base sm:text-lg font-light text-violet-50/85 leading-relaxed max-w-sm">
              point. don't solve.
            </p>
            {listeningFinal ? (
              <button
                onClick={() => send({ type: "ADVANCE" })}
                className="px-5 py-2 rounded-full border border-violet-100/30 text-violet-50/85 text-sm bg-violet-500/5 backdrop-blur-sm animate-pulse"
              >
                ● listening — tap when done
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
            <p className="text-sm font-light text-white/65 tracking-[0.3em] uppercase">rest</p>
            {whispered && <p className="mt-4 text-xs italic text-white/45 max-w-sm">"{whispered}"</p>}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-40 text-[10px] uppercase tracking-widest text-white/25 hover:text-white/65 transition"
      >
        end · save
      </button>
    </div>
  );
}

export default function QuestionNoAnswer() {
  const g = getLabGame("question-no-answer")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}
