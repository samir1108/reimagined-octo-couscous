// WHO IS THINKING? v2 — flagship #16, Atma Vichara (self-inquiry).
//
// Driven by an XState v5 phase machine.
//
// Senses used:
//   - Microphone (envelope variance during dwell = ground-truth somatic charge)
//   - TTS (guru asks each Ramana question)
//   - STT (spoken answer to each question + final reflection)
//   - Sound design (warm temple bed)
//   - Haptics (inquiry pulse on each new question)
//
// Phases (XState):
//   1. settle    (TTS frames the practice)
//   2. seed      (user names one thought; STT)
//   3. q1        ("who is thinking it?")  — TTS asks → dwell → STT answer
//   4. q2        ("where does that 'who' live in the body?")
//   5. q3        ("when that 'who' is gone, what remains?")
//   6. reveal    (TTS reads back somatic + dwell calibration)
//   7. reflect   (STT — what surprised you)
//   8. integrate (rest)

import { useEffect, useMemo, useRef, useState } from "react";
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
import WhoIsThinkingCanvas from "./WhoIsThinkingCanvas";
import CinematicOverlay from "../shell/CinematicOverlay";

const SERIF: React.CSSProperties = { fontFamily: '"Cormorant Garamond", Georgia, serif' };

const QUESTIONS = [
  { key: "q1", text: "who is thinking it?" },
  { key: "q2", text: "where does that 'who' live in the body?" },
  { key: "q3", text: "when that 'who' is gone, what remains?" },
] as const;

type Ctx = { answers: Record<string, string>; seed: string };

const machine = setup({
  types: {} as {
    context: Ctx;
    events:
      | { type: "ADVANCE" }
      | { type: "ANSWER"; key: string; text: string }
      | { type: "SEED"; text: string }
      | { type: "FINALIZE" };
  },
  actions: {
    saveSeed: assign(({ event }) =>
      event.type === "SEED" ? { seed: event.text } : {},
    ),
    saveAnswer: assign(({ context, event }) => {
      if (event.type !== "ANSWER") return {};
      return { answers: { ...context.answers, [event.key]: event.text } };
    }),
  },
}).createMachine({
  id: "whoIsThinking",
  initial: "settle",
  context: { answers: {}, seed: "" },
  states: {
    settle:    { on: { ADVANCE: "seed" } },
    seed:      { on: { SEED: { target: "q1", actions: "saveSeed" } } },
    q1:        { on: { ANSWER: { target: "q2", actions: "saveAnswer" } } },
    q2:        { on: { ANSWER: { target: "q3", actions: "saveAnswer" } } },
    q3:        { on: { ANSWER: { target: "reveal", actions: "saveAnswer" } } },
    reveal:    { on: { ADVANCE: "reflect" } },
    reflect:   { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done:      { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as
    | "settle" | "seed" | "q1" | "q2" | "q3" | "reveal" | "reflect" | "integrate" | "done";

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [listening, setListening] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [seed, setSeed] = useState("");
  const [reflection, setReflection] = useState("");
  const [revealLine, setRevealLine] = useState("");
  const [inquiryPulse, setInquiryPulse] = useState(0);

  const sessionStartRef = useRef<number>(Date.now());
  const phaseStartRef = useRef<number>(Date.now());
  const dwellsRef = useRef<Record<string, number>>({});
  const envByPhaseRef = useRef<Record<string, number[]>>({});
  const endedRef = useRef(false);

  // Soft warm bed
  useEffect(() => { sd.bed("temple", 0.1); return () => sd.stopBed(); /* eslint-disable-next-line */ }, []);

  // Phase narration & STT orchestration
  useEffect(() => {
    let cancelled = false;
    phaseStartRef.current = Date.now();
    setCurrentAnswer("");

    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.12);
        await say("one thought. then we ask, who is thinking it?", "guru");
        if (cancelled) return;
        setTimeout(() => { if (!cancelled) send({ type: "ADVANCE" }); }, 1200);
      } else if (phase === "seed") {
        await say("name one thought, out loud. just a few words.", "guru");
        if (cancelled) return;
        setInquiryPulse((n) => n + 1);
        buzz("tap");
        try { await transcribe.start(); setListening(true); } catch {}
      } else if (phase === "q1" || phase === "q2" || phase === "q3") {
        const q = QUESTIONS.find((x) => x.key === phase)!;
        envByPhaseRef.current[phase] = [];
        sd.chime("drop", 0.12);
        await say(q.text, "guru");
        if (cancelled) return;
        setInquiryPulse((n) => n + 1);
        buzz("tap");
        try { await transcribe.start(); setListening(true); } catch {}
      } else if (phase === "reveal") {
        if (listening) {
          setListening(false);
          await transcribe.stop().catch(() => null);
        }
        sd.chime("drop", 0.14);
        const line = buildRevealLine();
        await say(line, "guru");
      } else if (phase === "reflect") {
        sd.chime("drop", 0.12);
        await say("what surprised you about your own answers?", "guru");
        if (cancelled) return;
        try { await transcribe.start(); setListening(true); } catch {}
      } else if (phase === "integrate") {
        if (listening) {
          setListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setReflection(r.transcript.trim().slice(0, 240));
        }
        sd.chime("drop", 0.16);
        stopVoice();
        await say("you found something quieter than the thinker. let it stay.", "guru");
      } else if (phase === "done") {
        finish();
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Sample mic envelope during inquiry phases
  useEffect(() => {
    if (phase !== "q1" && phase !== "q2" && phase !== "q3") return;
    const arr = envByPhaseRef.current[phase];
    if (!arr) return;
    arr.push(breath.envelope);
    if (arr.length > 1500) arr.shift();
  }, [breath.envelope, phase]);

  // Auto-finalize reflect after 16s
  useEffect(() => {
    if (phase !== "reflect") return;
    const t = setTimeout(() => send({ type: "ADVANCE" }), 16_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Reveal → reflect after 11s
  useEffect(() => {
    if (phase !== "reveal") return;
    const t = setTimeout(() => send({ type: "ADVANCE" }), 11_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Integrate → done
  useEffect(() => {
    if (phase !== "integrate") return;
    const t = setTimeout(() => send({ type: "FINALIZE" }), 7_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ---- Per-phase metrics ----
  const metrics = useMemo(() => {
    const phases = ["q1", "q2", "q3"] as const;
    const out: Record<string, { meanEnv: number; varEnv: number }> = {};
    let totalVar = 0; let n = 0;
    for (const p of phases) {
      const arr = envByPhaseRef.current[p] || [];
      if (!arr.length) { out[p] = { meanEnv: 0, varEnv: 0 }; continue; }
      const m = arr.reduce((a, b) => a + b, 0) / arr.length;
      const v = arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length;
      out[p] = { meanEnv: m, varEnv: v };
      totalVar += v; n++;
    }
    const avgVar = n ? totalVar / n : 0;
    return { perPhase: out, avgVar };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const buildRevealLine = () => {
    const dwell3 = dwellsRef.current["q3"] || 0;
    const charge = Math.sqrt(metrics.avgVar);
    let line: string;
    if (!breath.ready) {
      line = "you sat with three impossible questions. that's the whole practice.";
    } else if (dwell3 > 8000 && charge < 0.04) {
      line = "the third question slowed you down — and the body went quiet. something underneath the thinker was found.";
    } else if (dwell3 > 8000) {
      line = "you stayed with the last question. the body still hummed. the seeker is still seeking.";
    } else if (charge > 0.06) {
      line = "you answered fast, but the body was loud. the thinker spoke for the silence.";
    } else {
      line = "honest, brief, and still. the inquiry will keep working in you.";
    }
    setRevealLine(line);
    return line;
  };

  const finalizeAnswer = async () => {
    if (!listening) return;
    setListening(false);
    const r = await transcribe.stop().catch(() => null);
    const text = r?.transcript ? r.transcript.trim().slice(0, 200) : "";
    setCurrentAnswer(text);
    const dwell = Date.now() - phaseStartRef.current;

    if (phase === "seed") {
      setSeed(text);
      send({ type: "SEED", text });
    } else if (phase === "q1" || phase === "q2" || phase === "q3") {
      dwellsRef.current[phase] = dwell;
      send({ type: "ANSWER", key: phase, text });
    } else if (phase === "reflect") {
      if (text) setReflection(text);
      send({ type: "ADVANCE" });
    }
  };

  const skipAnswer = () => {
    const dwell = Date.now() - phaseStartRef.current;
    if (listening) { setListening(false); transcribe.cancel(); }
    if (phase === "seed") {
      send({ type: "SEED", text: "" });
    } else if (phase === "q1" || phase === "q2" || phase === "q3") {
      dwellsRef.current[phase] = dwell;
      send({ type: "ANSWER", key: phase, text: "" });
    } else if (phase === "reflect") {
      send({ type: "ADVANCE" });
    }
  };

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    const charge = Math.sqrt(metrics.avgVar);
    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        seed_thought: seed || null,
        answer_q1: state.context.answers.q1 || null,
        answer_q2: state.context.answers.q2 || null,
        answer_q3: state.context.answers.q3 || null,
        dwell_ms_q1: dwellsRef.current.q1 || 0,
        dwell_ms_q2: dwellsRef.current.q2 || 0,
        dwell_ms_q3: dwellsRef.current.q3 || 0,
        deepest_dwell_ms: Math.max(0, ...Object.values(dwellsRef.current)),
        avg_env_variance: +metrics.avgVar.toFixed(4),
        somatic_charge: +charge.toFixed(3),
        env_variance_q1: +(metrics.perPhase.q1?.varEnv || 0).toFixed(4),
        env_variance_q2: +(metrics.perPhase.q2?.varEnv || 0).toFixed(4),
        env_variance_q3: +(metrics.perPhase.q3?.varEnv || 0).toFixed(4),
        reveal_line: revealLine,
        spoken_reflection: reflection || null,
        mic_ready: breath.ready,
      },
    });
  };

  const stepIndex =
    phase === "seed" ? 0 :
    phase === "q1" ? 1 : phase === "q2" ? 2 : phase === "q3" ? 3 :
    phase === "reveal" ? 4 : phase === "reflect" ? 5 : phase === "integrate" ? 6 : -1;

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <WhoIsThinkingCanvas envelope={breath.envelope} inquiryPulse={inquiryPulse} />
      <CinematicOverlay tint="amber" />

      {/* Top-left phase pill */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <motion.div key={phase} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 0.9, x: 0 }} transition={{ duration: 0.6 }} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-amber-100/75">
          <span className="w-1 h-1 rounded-full bg-amber-200/85 animate-pulse" />
          <span>{phase === "settle" && "atma vichara"}
          {phase === "seed" && "name a thought"}
          {(phase === "q1" || phase === "q2" || phase === "q3") && `inquiry ${stepIndex} of 3`}
          {phase === "reveal" && "calibration"}
          {phase === "reflect" && "speak"}
          {phase === "integrate" && "rest"}</span>
        </motion.div>
      </div>

      {/* Top-right mic */}
      <div className="absolute top-6 right-6 z-30 text-right space-y-1.5 pointer-events-none">
        <div className="flex items-center justify-end gap-1.5">
          {breath.ready ? <Mic className="w-3 h-3 text-amber-200/70" /> : <MicOff className="w-3 h-3 text-white/30" />}
          <span className="text-[10px] uppercase tracking-widest text-white/50">{breath.ready ? "mic" : "no mic"}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === "settle" && (
          <motion.div key="settle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none px-8 text-center">
            <p style={SERIF} className="text-3xl italic font-light text-amber-50/90" >who is thinking?</p>
            <p className="mt-4 text-[11px] uppercase tracking-[0.4em] text-white/45 max-w-xs">a Ramana inquiry · three questions · one source</p>
          </motion.div>
        )}

        {(phase === "seed" || phase === "q1" || phase === "q2" || phase === "q3" || phase === "reflect") && (
          <motion.div key={`q-${phase}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.7 }} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center max-w-md mx-auto gap-6">
            <p style={SERIF} className="text-xl sm:text-2xl italic font-light text-amber-50/95 leading-relaxed max-w-sm">
              {phase === "seed" && "name one thought."}
              {phase === "q1" && QUESTIONS[0].text}
              {phase === "q2" && QUESTIONS[1].text}
              {phase === "q3" && QUESTIONS[2].text}
              {phase === "reflect" && "what surprised you about your own answers?"}
            </p>

            {currentAnswer ? (
              <p style={SERIF} className="text-base text-amber-100/90 italic max-w-sm">"{currentAnswer}"</p>
            ) : listening ? (
              <button
                onClick={finalizeAnswer}
                className="px-6 py-2.5 rounded-full border border-amber-200/45 text-amber-100 text-sm bg-amber-500/10 backdrop-blur-sm animate-pulse shadow-[0_0_30px_rgba(255,190,120,0.15)]"
              >
                ● listening — tap when done
              </button>
            ) : (
              <p className="text-xs text-white/40">preparing…</p>
            )}

            <button
              onClick={skipAnswer}
              className="mt-1 text-[10px] uppercase tracking-[0.3em] text-white/30 hover:text-white/60 transition"
            >
              sit silently · continue
            </button>
          </motion.div>
        )}

        {phase === "reveal" && (
          <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none">
            <p className="text-[10px] uppercase tracking-[0.42em] text-amber-200/75 mb-6">calibration</p>
            <p style={SERIF} className="text-xl sm:text-2xl font-light text-amber-50/95 italic leading-relaxed max-w-md" >"{revealLine || "…"}"</p>
          </motion.div>
        )}

        {phase === "integrate" && (
          <motion.div key="integrate" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 1.6 }} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none">
            <p className="text-sm font-light text-white/65 tracking-[0.3em] uppercase">rest</p>
            {reflection && <p className="mt-4 text-xs italic text-white/45 max-w-sm">"{reflection}"</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step dots */}
      <div className="absolute bottom-8 inset-x-0 z-30 flex justify-center gap-2 pointer-events-none">
        {Array.from({ length: 7 }).map((_, k) => (
          <div key={k} className={`h-[2px] w-6 rounded-full transition-all ${k <= stepIndex ? "bg-amber-200/70" : "bg-white/10"}`} />
        ))}
      </div>

      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-40 text-[10px] uppercase tracking-widest text-white/30 hover:text-white/70 transition"
      >
        end · save
      </button>
    </div>
  );
}

export default function WhoIsThinking() {
  const g = getLabGame("who-is-thinking")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}
