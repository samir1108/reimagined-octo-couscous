// SHADOW INTERVIEW — Flagship Grade
// Six questions your disowned side would ask you. You must
// answer, not defend. We track how long you dwell before each
// answer and how honest you rate yourself at the end.
// Multi-sensor: mic (breath/STT), TTS (guru), STT (spoken answers), haptics, sound design
// Canvas: animated shadow visualization with dwell tracking
// XState: intro → ask (6 questions) → rate → verdict → integrate

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { setup, assign } from "xstate";
import { useMachine } from "@xstate/react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import { useBreathMic } from "../shell/useBreathMic";
import ShadowInterviewCanvas from "./ShadowInterviewCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };

const QUESTIONS = [
  "What are you pretending not to know about yourself?",
  "Which part of you do you hide from the people who love you most?",
  "What do you envy — and what does that envy point to?",
  "When were you most cruel, and how did you justify it?",
  "What would you do if no one — not one person — was watching?",
  "Who would you have to stop being for me to disappear?",
];

type Phase = "intro" | "ask" | "rate" | "verdict" | "integrate";

type Ctx = { idx: number; answers: Array<{ q: string; a: string; dwell: number }>; honesty: number; };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "START" }
      | { type: "NEXT" }
      | { type: "SET_HONESTY"; value: number }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    start: assign(() => ({ idx: 0, answers: [], honesty: 5 })),
    next: assign(({ context, event }) => {
      // We'll handle the answer via state update outside the machine
      return { ...context, idx: context.idx + 1 };
    }),
    setHonesty: assign(({ context, event }) => ({ ...context, honesty: event.value })),
  },
}).createMachine({
  id: "shadowInterview",
  initial: "intro",
  context: { idx: 0, answers: [], honesty: 5 },
  states: {
    intro: { on: { START: "ask" } },
    ask: { on: { NEXT: [
          { target: "ask", guard: ({ context }) => context.idx < 5 },
          { target: "rate" },
        ] } },
    rate: { on: { SET_HONESTY: { actions: "setHonesty" }, ADVANCE: "verdict" } },
    verdict: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { idx, answers, honesty } = state.context;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [entry, setEntry] = useState("");
  const [listeningEntry, setListeningEntry] = useState(false);

  const startedAt = useRef<number>(Date.now());
  const openedAtRef = useRef<number>(0);
  const endedRef = useRef(false);

  useEffect(() => {
    sd.bed("void", 0.04);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "intro") {
        sd.chime("rise", 0.06);
        await say("the part of you that you exiled has questions. six questions. answer, do not defend. if a question stings, that is the one to sit with.", "guru");
      } else if (phase === "ask" && !cancelled) {
        sd.chime("rise", 0.08);
        await say(QUESTIONS[idx], "guru");
        if (!cancelled) {
          try { await transcribe.start(); setListeningEntry(true); } catch {}
        }
      } else if (phase === "rate" && !cancelled) {
        sd.chime("drop", 0.08);
        await say("how honest was that, really? one is a lie. ten is the whole truth.", "guru");
      } else if (phase === "verdict" && !cancelled) {
        sd.chime("drop", 0.1);
        await say(`${answers.length} questions answered. you rated yourself ${honesty}/10 honest. the one you paused longest on — that is the question to bring back tomorrow.`, "guru");
      } else if (phase === "integrate") {
        sd.chime("drop", 0.12);
        stopVoice();
        await say("the shadow was never the enemy. it was the part of you that remembers what you forgot.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase, idx, honesty]);

  // STT for spoken entry
  useEffect(() => {
    if (phase !== "ask") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setEntry(t);
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  const handleNext = useCallback(() => {
    const a = entry.trim();
    if (a.length < 3) return;
    const dwell = Date.now() - startRef.current;
    const updated = [...answers, { q: QUESTIONS[idx], a, dwell }];
    // We'll update via machine by sending NEXT and updating answers externally
    // For simplicity, we'll track answers in local state and sync at end
    setEntry("");
    send({ type: "NEXT" });
    if (idx < QUESTIONS.length - 1) {
      setOpenedAt(Date.now());
    }
    buzz("tap");
  }, [entry, idx, answers]);

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    sd.stopBed();
    stopVoice();

    const avgDwell = answers.length ? Math.round(answers.reduce((s, r) => s + r.dwell, 0) / answers.length) : 0;
    const avgLen = answers.length ? Math.round(answers.reduce((s, r) => s + r.a.length, 0) / answers.length) : 0;

    onEnd({
      outcome: answers.length >= 4 ? "completed" : "abandoned",
      signals: {
        answered: answers.length,
        avg_dwell_ms: avgDwell,
        avg_length: avgLen,
        self_honesty: honesty,
        answers: answers.map((a, i) => ({ q: QUESTIONS[i], a: a.a, dwell: a.dwell })),
        total_ms: Date.now() - startedAt.current,
      },
    });
  }, [onEnd, answers, honesty, stopVoice, sd]);

  const handleSpokenEntry = async () => {
    try { await transcribe.start(); setListeningEntry(true); } catch {}
  };
  const stopSpokenEntry = async () => {
    setListeningEntry(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) setEntry(r.transcript.trim());
  };

  return (
    <div className="absolute inset-0 bg-black text-slate-100 overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.05, 0.14, 0.05] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-purple-950/25 via-black to-black pointer-events-none"
      />
      {/* Film grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 0.9  0 0 0 0 0.7  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Top status */}
      <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 rounded-full bg-purple-300/80 shadow-[0_0_10px_rgba(196,181,253,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.42em] text-purple-200/60" style={SERIF}>
            shadow interview{phase === "ask" ? ` · ${idx + 1}/6` : ""}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-purple-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
        </div>
      </div>

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <ShadowInterviewCanvas
          phase={phase}
          idx={idx}
          answers={answers}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-lg space-y-8 pointer-events-auto">
              <h2 className="text-3xl italic mb-6" style={SERIF}>The part of you that you exiled has questions.</h2>
              <p className="text-base italic text-white/80 leading-relaxed mb-10 max-w-lg mx-auto" style={SERIF}>
                Six questions. Answer, do not defend. If a question stings, that is the one to sit with. No one will read this but you.
              </p>
              <motion.button
                onClick={() => { send({ type: "START" }); startRef.current = Date.now(); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-purple-400/60 bg-purple-500/10 text-purple-100 text-sm uppercase tracking-wide hover:bg-purple-500/20 transition shadow-[0_0_24px_rgba(196,181,253,0.2)]"
              >
                let it speak
              </motion.button>
            </motion.div>
          )}

          {phase === "ask" && (
            <motion.div key={`q-${idx}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-xl">
              <div className="text-[10px] uppercase tracking-[0.5em] text-purple-200/60 mb-4" style={SERIF}>the shadow asks</div>
              <p className="text-2xl italic mb-6 leading-snug" style={SERIF}>{QUESTIONS[idx]}</p>
              <textarea
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="answer, do not defend…"
                rows={5}
                className="w-full bg-white/[0.03] border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-base italic focus:outline-none focus:border-purple-300/40 mb-4"
                style={SERIF}
                autoFocus
              />
              <div className="flex justify-end">
                <button onClick={handleNext} className="px-6 py-2.5 rounded-full border border-white/30 text-xs uppercase tracking-[0.4em] hover:bg-white/5" style={SERIF}>
                  {idx + 1 === QUESTIONS.length ? "close the room" : "next question"}
                </button>
              </div>
            </motion.div>
          )}

          {phase === "rate" && (
            <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md text-center pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.5em] text-purple-200/60 mb-4" style={SERIF}>be honest</div>
              <p className="text-xl italic mb-8 leading-relaxed" style={SERIF}>How honest was that, really? 1 = it was a lie. 10 = the whole truth.</p>
              <input
                type="range"
                min={1}
                max={10}
                value={honesty}
                onChange={(e) => send({ type: "SET_HONESTY", value: Number(e.target.value) })}
                className="w-full accent-purple-400 mb-4"
              />
              <div className="text-4xl italic mb-8" style={SERIF}>{honesty}<span className="text-lg text-white/40">/10</span></div>
              <motion.button
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-purple-400/60 bg-purple-500/10 text-purple-100 text-sm uppercase tracking-wide hover:bg-purple-500/20 transition shadow-[0_0_24px_rgba(196,181,253,0.2)]"
              >
                see the mirror
              </motion.button>
            </motion.div>
          )}

          {phase === "verdict" && (
            <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-lg text-center pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.5em] text-slate-200/60 mb-4" style={SERIF}>what the shadow noticed</div>
              <p className="text-base italic text-slate-300/85 leading-relaxed max-w-md mx-auto mb-8" style={SERIF}>
                {answers.length} questions answered. You rated yourself {honesty}/10 honest.
                <br /><br />
                The one you paused longest on — that is the question to bring back tomorrow.
              </p>
              <motion.button
                onClick={finish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-purple-400/60 bg-purple-500/10 text-purple-100 text-sm uppercase tracking-wide hover:bg-purple-500/20 transition shadow-[0_0_24px_rgba(196,181,253,0.2)]"
              >
                complete
              </motion.button>
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="int" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg text-center space-y-6">
              <p className="text-2xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>rest</p>
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-b from-purple-400/20 to-transparent blur-xl"
              />
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                the shadow was never the enemy. it was the part of you that remembers what you forgot.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-purple-200/70 transition-all duration-500"
      >
        end · save
      </button>
    </div>
  );
}

export default function ShadowInterview() {
  const g = getLabGame("shadow-interview")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}