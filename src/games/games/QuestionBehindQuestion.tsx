// THE QUESTION BEHIND THE QUESTION v2 — flagship #27, 5 Whys × Ramana.
//
// Five voiced prompts descend from symptom toward root. For each layer the
// user can either type or speak the answer. We measure semantic compression
// (length contracting toward terseness), per-layer dwell time, hesitation,
// somatic charge via mic envelope, and which modality they preferred.
//
// We track:
//   - layers: { q, answer, len, dwell_ms, modality, env_var }
//   - length_compression (first → last)
//   - dwell trajectory (rushed vs slowing)
//   - env_var (somatic charge as the descent lands)
//   - one final spoken "real question" via STT
//
// Senses used:
//   - TTS (each prompt, framing, calibration)
//   - Microphone envelope (somatic resonance during descent)
//   - STT (per-layer voice answer + final root)
//   - Sound design + haptics
//
// XState phases:
//   1. settle    — opening line
//   2. layer     — voice the prompt → answer (loops 5)
//   3. reveal    — calibration line on compression / dwell / charge
//   4. words     — STT, "what is the real question?"
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
import QuestionBehindQuestionCanvas from "./QuestionBehindQuestionCanvas";

const PROMPTS = [
  "what is bothering you, right now?",
  "and why does that bother you?",
  "and underneath that — why?",
  "why does that matter so much?",
  "and at the very bottom — what is the real question?",
];

interface LayerData {
  q: string;
  answer: string;
  len: number;
  dwell_ms: number;
  modality: "spoken" | "typed" | "skipped";
  env_var: number;
}

const empty = (q: string): LayerData => ({ q, answer: "", len: 0, dwell_ms: 0, modality: "skipped", env_var: 0 });

type Ctx = { idx: number };

const machine = setup({
  types: {} as {
    context: Ctx;
    events:
      | { type: "ADVANCE" }
      | { type: "COMMIT_LAYER" }
      | { type: "FINALIZE" };
  },
  actions: {
    nextIdx: assign({ idx: ({ context }) => context.idx + 1 }),
  },
  guards: {
    moreLayers: ({ context }) => context.idx + 1 < PROMPTS.length,
  },
}).createMachine({
  id: "questionBehindQuestion",
  initial: "settle",
  context: { idx: 0 },
  states: {
    settle: { on: { ADVANCE: "layer" } },
    layer: {
      on: {
        COMMIT_LAYER: [
          { target: "layer", guard: "moreLayers", actions: "nextIdx", reenter: true },
          { target: "reveal" },
        ],
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
  const phase = state.value as "settle" | "layer" | "reveal" | "words" | "integrate" | "done";
  const idx = state.context.idx;

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [text, setText] = useState("");
  const [revealLine, setRevealLine] = useState("");
  const [whispered, setWhispered] = useState("");
  const [listeningFinal, setListeningFinal] = useState(false);
  const [layerListening, setLayerListening] = useState(false);
  const [promptDelivered, setPromptDelivered] = useState(false);

  const layerStartRef = useRef(performance.now());
  const sessionStartRef = useRef(Date.now());
  const dataRef = useRef<LayerData[]>(PROMPTS.map(empty));
  const layerEnvRef = useRef<number[]>([]);
  const phaseRef = useRef(phase);
  const endedRef = useRef(false);

  // Bed
  useEffect(() => {
    sd.bed("temple", 0.06);
    return () => { sd.stopBed(); stopVoice(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Sample mic envelope per layer
  useEffect(() => {
    if (phase !== "layer") return;
    layerEnvRef.current.push(breath.envelope);
  }, [breath.envelope, phase]);

  // Reset per-layer UI on entry
  useEffect(() => {
    if (phase !== "layer") return;
    setText("");
    setLayerListening(false);
    setPromptDelivered(false);
    layerEnvRef.current = [];
    layerStartRef.current = performance.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx]);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.08);
        await say("five questions. each one goes deeper than the last. type or speak — whichever lets the truth out.", "guru");
        if (cancelled) return;
        setTimeout(() => { if (!cancelled) send({ type: "ADVANCE" }); }, 700);
      } else if (phase === "layer") {
        sd.chime("drop", 0.05);
        await say(PROMPTS[idx], "guru");
        if (cancelled) return;
        layerStartRef.current = performance.now();
        setPromptDelivered(true);
      } else if (phase === "reveal") {
        sd.chime("drop", 0.1);
        const line = buildRevealLine();
        await say(line, "guru");
      } else if (phase === "words") {
        sd.chime("drop", 0.08);
        await say("now — say it out loud. what is the question you actually carry?", "guru");
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
        await say("the answer was never the point. living with the right question is the whole practice.", "guru");
      } else if (phase === "done") {
        finish();
      }
    })();
    return () => { cancelled = true; };
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

  const commitLayer = (modality: "typed" | "spoken", answer: string) => {
    if (phaseRef.current !== "layer") return;
    const trimmed = answer.trim().slice(0, 600);
    if (trimmed.length < 2) return;
    const dwell = performance.now() - layerStartRef.current;
    dataRef.current[idx] = {
      q: PROMPTS[idx],
      answer: trimmed,
      len: trimmed.length,
      dwell_ms: Math.round(dwell),
      modality,
      env_var: +variance(layerEnvRef.current).toFixed(5),
    };
    buzz("tap");
    send({ type: "COMMIT_LAYER" });
  };

  const submitTyped = () => commitLayer("typed", text);

  const startLayerVoice = async () => {
    if (!promptDelivered) return;
    try { await transcribe.start(); setLayerListening(true); } catch {}
  };
  const stopLayerVoice = async () => {
    if (!layerListening) return;
    setLayerListening(false);
    const r = await transcribe.stop().catch(() => null);
    const t = (r?.transcript ?? "").trim();
    if (t.length >= 2) commitLayer("spoken", t);
    else setText(""); // fall back to type
  };

  const buildRevealLine = (): string => {
    const ds = dataRef.current.filter((d) => d.len > 0);
    if (ds.length < 2) {
      const fb = "the descent stopped early. that hesitation itself is the answer worth listening to.";
      setRevealLine(fb); return fb;
    }
    const lens = ds.map((d) => d.len);
    const dwells = ds.map((d) => d.dwell_ms);
    const compression = (lens[0] - lens[lens.length - 1]) / lens[0];
    const meanDwell = dwells.reduce((a, b) => a + b, 0) / dwells.length;
    const lateDwell = dwells[dwells.length - 1];
    const allEnv = ds.flatMap(() => []); // placeholder; per-layer var below
    void allEnv;
    const totalEnvVar = ds.reduce((s, d) => s + d.env_var, 0) / ds.length;
    const spokenCount = ds.filter((d) => d.modality === "spoken").length;

    let line: string;
    if (compression > 0.5 && lateDwell > meanDwell * 1.5) {
      line = `the words shortened, but the silence at the bottom got longer. the root is closer than the language.`;
    } else if (compression > 0.4) {
      line = `you started with a paragraph and ended with a sentence. that contraction is the mind finding the actual edge.`;
    } else if (lens[lens.length - 1] > lens[0]) {
      line = `the answers grew, not shrank. notice — the mind may be defending, not descending. the next question lives there.`;
    } else if (totalEnvVar > 0.012) {
      line = `the body carried what the words could not. notice the breath catching as you neared the root — that is heat.`;
    } else if (spokenCount >= 3) {
      line = `you spoke more than you typed. the voice goes deeper than the keyboard. trust that.`;
    } else if (meanDwell < 4500) {
      line = `the descent moved fast. the mind already knows. the practice is to slow down enough to feel the answer, not just say it.`;
    } else {
      line = `you stayed with each layer. that staying is the real inquiry. answers come and go — the willingness is what changes you.`;
    }
    setRevealLine(line);
    return line;
  };

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();

    const ds = dataRef.current;
    const lens = ds.filter((d) => d.len > 0).map((d) => d.len);
    const compression = lens.length >= 2 ? (lens[0] - lens[lens.length - 1]) / lens[0] : 0;
    const dwells = ds.map((d) => d.dwell_ms).filter((n) => n > 0);
    const meanDwell = dwells.length ? dwells.reduce((a, b) => a + b, 0) / dwells.length : 0;
    const reached = ds.filter((d) => d.len > 0).length;

    onEnd({
      outcome: reached === PROMPTS.length ? "completed" : "abandoned",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        layers: ds,
        layers_reached: reached,
        length_compression: +compression.toFixed(3),
        mean_dwell_ms: Math.round(meanDwell),
        spoken_layers: ds.filter((d) => d.modality === "spoken").length,
        typed_layers: ds.filter((d) => d.modality === "typed").length,
        avg_env_var: +(ds.reduce((s, d) => s + d.env_var, 0) / Math.max(1, ds.length)).toFixed(5),
        reveal_line: revealLine,
        real_question: whispered || null,
        mic_ready: breath.ready,
      },
    });
  };

  const reached = dataRef.current.filter((d) => d.len > 0).length;
  const intensity = Math.min(1, reached / PROMPTS.length);

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950/25 via-black to-indigo-950/25 pointer-events-none" />
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

      <QuestionBehindQuestionCanvas
        envelope={breath.envelope}
        layer={phase === "layer" ? idx : Math.max(0, reached - 1)}
        total={PROMPTS.length}
        intensity={intensity}
      />

      {/* Top-left phase pill */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <motion.div
          key={String(phase) + idx}
          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 0.9, x: 0 }} transition={{ duration: 0.7 }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-amber-100/70"
        >
          <motion.span
            className="inline-block w-1 h-1 rounded-full bg-amber-200/85"
            animate={{ opacity: [0.35, 1, 0.35], scale: [0.9, 1.25, 0.9] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          {phase === "settle" && "the question behind the question"}
          {phase === "layer" && `layer ${idx + 1} / ${PROMPTS.length}`}
          {phase === "reveal" && "calibration"}
          {phase === "words" && "the real question"}
          {phase === "integrate" && "rest"}
        </motion.div>
      </div>

      {/* Top-right mic */}
      <div className="absolute top-6 right-6 z-30 text-right space-y-1.5 pointer-events-none">
        <div className="flex items-center justify-end gap-1.5">
          {breath.ready ? <Mic className="w-3 h-3 text-amber-100/60" /> : <MicOff className="w-3 h-3 text-white/30" />}
          <span className="text-[10px] uppercase tracking-widest text-white/50">{breath.ready ? "mic" : "no mic"}</span>
        </div>
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
              className="text-4xl sm:text-5xl italic text-amber-50/90 tracking-wide max-w-lg"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
            >
              the question behind the question
            </p>
            <div className="mt-5 h-px w-16 bg-amber-100/25 mx-auto" />
            <p className="mt-4 text-[11px] uppercase tracking-[0.4em] text-amber-100/55 max-w-xs mx-auto">five layers down · type or speak</p>
          </motion.div>
        )}

        {phase === "layer" && (
          <motion.div
            key={`layer-${idx}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6 max-w-md mx-auto gap-5"
          >
            <p
              className="text-2xl sm:text-3xl italic text-amber-50/95 text-center leading-relaxed tracking-wide"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, textShadow: "0 0 30px rgba(255,220,180,0.28)" }}
            >
              {PROMPTS[idx]}
            </p>

            {!layerListening ? (
              <>
                <textarea
                  autoFocus
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={!promptDelivered}
                  placeholder={promptDelivered ? "type, or hold the mic to speak…" : "listening to the question…"}
                  className="w-full h-28 bg-white/[0.04] border border-white/10 rounded-xl p-4 text-white/85 text-sm leading-relaxed focus:outline-none focus:border-amber-100/30 resize-none placeholder:text-white/25"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={startLayerVoice}
                    disabled={!promptDelivered}
                    className={`px-4 py-2 rounded-full text-xs tracking-wider border transition flex items-center gap-2 ${
                      promptDelivered
                        ? "border-amber-100/30 text-amber-50/85 hover:bg-amber-500/5"
                        : "border-white/10 text-white/25"
                    }`}
                  >
                    <Mic className="w-3 h-3" /> speak instead
                  </button>
                  <button
                    onClick={submitTyped}
                    disabled={text.trim().length < 2}
                    className={`px-5 py-2 rounded-full text-xs tracking-wider border transition ${
                      text.trim().length < 2
                        ? "border-white/10 text-white/25"
                        : "border-amber-100/40 text-amber-50/90 bg-amber-500/5 hover:bg-amber-500/15"
                    }`}
                  >
                    {idx + 1 >= PROMPTS.length ? "find the root" : "deeper"}
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={stopLayerVoice}
                className="px-5 py-3 rounded-full border border-amber-100/40 text-amber-50/90 text-sm bg-amber-500/10 backdrop-blur-sm animate-pulse flex items-center gap-2"
              >
                ● listening — tap when done
              </button>
            )}
          </motion.div>
        )}

        {phase === "reveal" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.4 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none"
          >
            <p className="text-[10px] uppercase tracking-[0.42em] text-amber-100/70 mb-6">calibration</p>
            <p
              className="text-2xl sm:text-3xl italic text-amber-50/95 leading-relaxed max-w-md"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, textShadow: "0 0 30px rgba(255,220,180,0.3)" }}
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
            <p className="text-base sm:text-lg font-light text-amber-50/85 leading-relaxed max-w-sm">
              what is the question you actually carry?
            </p>
            {listeningFinal ? (
              <button
                onClick={() => send({ type: "ADVANCE" })}
                className="px-5 py-2 rounded-full border border-amber-100/30 text-amber-50/85 text-sm bg-amber-500/5 backdrop-blur-sm animate-pulse"
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

export default function QuestionBehindQuestion() {
  const g = getLabGame("question-behind-question")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}
