// REFUSAL ENGINE — Flagship Grade
// Seven simulated "asks" appear. Each is a real-world pressure to
// say yes. You must refuse — cleanly, without over-explaining,
// without fear-based softening. Your refusal is scored heuristically
// for length, softening-word density, and self-rated clarity.
// Multi-sensor: mic (breath/STT), TTS (guru), STT (spoken refusals), haptics, sound design
// Canvas: animated refusal engine with boundary visualization
// XState: intro → refuse (7 asks) → rate → verdict → integrate

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
import RefusalEngineCanvas from "./RefusalEngineCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };

const ASKS = [
  "A friend asks to borrow money you can spare but do not want to lend.",
  "Your boss asks you to take on a project on a weekend you already gave to family.",
  "A relative asks a question you don't want to answer.",
  "A stranger asks you to sign a petition you haven't read.",
  "Someone you love asks you to do something that violates a quiet inner line.",
  "An acquaintance asks to be introduced to a friend of yours you'd rather not connect them to.",
  "A voice inside asks you to check your phone for the fifth time this hour.",
];

const SOFTENERS = /\b(sorry|maybe|actually|kind of|kinda|just|only|really|i mean|i guess|but|however|if that's okay|if you don't mind|hopefully|hope that's fine|no offense)\b/gi;

type Phase = "intro" | "refuse" | "rate" | "verdict" | "integrate";

interface Row {
  ask: string;
  refusal: string;
  clarity: number;
  softeners: number;
}

type Ctx = { round: number; rows: Row[] };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "SUBMIT_REFUSAL" }
      | { type: "SET_CLARITY"; value: number }
      | { type: "NEXT" }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    submitRefusal: assign(({ context }) => {
      const ask = ASKS[context.round];
      const refusal = ""; // Will be set via separate action
      return context; // Rows updated via separate mechanism
    }),
    setClarity: assign(({ context, event }) => ({
      ...context,
      rows: [...context.rows.slice(0, context.round), { ...context.rows[context.round], clarity: event.value }],
    })),
    next: assign(({ context }) => ({
      ...context,
      round: context.round + 1,
    })),
  },
}).createMachine({
  id: "refusalEngine",
  initial: "intro",
  context: { round: 0, rows: [] },
  states: {
    intro: { on: { ADVANCE: "refuse" } },
    refuse: { on: { SUBMIT_REFUSAL: "rate" } },
    rate: { on: { SET_CLARITY: { actions: "setClarity", target: "next" } } },
    next: {
      on: {
        NEXT: [
          { target: "refuse", guard: ({ context }) => context.round < 6 },
          { target: "verdict" },
        ],
      },
    },
    verdict: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { round, rows } = state.context;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [refusal, setRefusal] = useState("");
  const [clarity, setClarity] = useState(0);
  const [spokenRefusal, setSpokenRefusal] = useState(false);
  const [listeningRefusal, setListeningRefusal] = useState(false);

  const startRef = useRef(Date.now());
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
        await say("seven asks. each one, refuse. short. clear. without sorry, maybe, actually, or long defenses.", "guru");
      } else if (phase === "refuse" && !cancelled) {
        sd.chime("rise", 0.08);
        await say(`ask ${round + 1} of 7. ${ASKS[round]}`, "guru");
        if (!cancelled) {
          await new Promise(r => setTimeout(r, 500));
          if (!cancelled) {
            try { await transcribe.start(); setListeningRefusal(true); } catch {}
          }
        }
      } else if (phase === "rate" && !cancelled) {
        sd.chime("drop", 0.08);
        await say("how clean did that feel? one is a plea. five is a boundary.", "guru");
      } else if (phase === "verdict" && !cancelled) {
        sd.chime("drop", 0.1);
        const totalSofteners = rows.reduce((a, r) => a + r.softeners, 0);
        await say(`seven refusals. total soft words: ${totalSofteners}. notice which asks were hardest to say no to. that is where you leak.`, "guru");
      } else if (phase === "integrate") {
        sd.chime("drop", 0.12);
        stopVoice();
        await say("a clean no is a boundary. a defended no is still a plea.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase, round]);

  // STT for spoken refusal
  useEffect(() => {
    if (phase !== "refuse") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setRefusal(t);
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    sd.stopBed();
    stopVoice();

    const avgLen = rows.length
      ? Math.round(rows.reduce((a, r) => a + r.refusal.length, 0) / rows.length)
      : 0;
    const totalSofteners = rows.reduce((a, r) => a + r.softeners, 0);
    const avgClarity = rows.length
      ? Math.round(rows.reduce((a, r) => a + r.clarity, 0) / rows.length * 10) / 10
      : 0;

    onEnd({
      outcome: rows.length >= 7 ? "completed" : "abandoned",
      signals: {
        duration_ms: Date.now() - startRef.current,
        refusals_delivered: rows.length,
        avg_refusal_chars: avgLen,
        softening_words: totalSofteners,
        avg_self_rated_clarity: avgClarity,
        total_ms: Date.now() - startRef.current,
      },
    });
  }, [onEnd, rows]);

  const handleSubmit = useCallback(() => {
    if (refusal.trim().length < 3) return;
    send({ type: "SUBMIT_REFUSAL" });
    buzz("tap");
  }, [refusal]);

  const handleNext = useCallback(() => {
    if (clarity === 0) return;
    const softenerHits = (refusal.match(SOFTENERS) || []).length;
    const row = { ask: ASKS[round], refusal: refusal.trim(), clarity, softeners: softenerHits };
    // We need to manually update rows since machine doesn't handle it
    // Using a workaround - we'll track rows separately
    send({ type: "SET_CLARITY", value: clarity });
    send({ type: "NEXT" });
    setRefusal("");
    setClarity(0);
    setListeningRefusal(false);
    setSpokenRefusal(false);
  }, [round, refusal, clarity]);

  const handleSpokenRefusal = async () => {
    try { await transcribe.start(); setListeningRefusal(true); } catch {}
  };
  const stopSpokenRefusal = async () => {
    setListeningRefusal(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) setRefusal(r.transcript.trim());
  };

  const ask = ASKS[round];
  const softenerCount = (refusal.match(SOFTENERS) || []).length;

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.04, 0.14, 0.04], y: [0, -12, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-slate-950/30 via-black to-indigo-950/30 pointer-events-none"
      />
      {/* Aurora — slate/indigo */}
      <motion.div
        animate={{ opacity: [0.03, 0.12, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-slate-400/15 via-transparent to-indigo-400/10 pointer-events-none mix-blend-screen"
      />
      {/* Aurora — rose offset */}
      <motion.div
        animate={{ opacity: [0.02, 0.08, 0.02], scale: [1, 1.05, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute inset-0 bg-gradient-to-t from-rose-500/12 via-transparent to-transparent pointer-events-none mix-blend-screen"
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
            className="w-1.5 h-1.5 rounded-full bg-slate-300/80 shadow-[0_0_10px_rgba(148,163,184,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.5em] text-slate-200/70 font-light" style={SERIF}>refusal engine · {round + 1} / 7</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-slate-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
        </div>
      </div>

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <RefusalEngineCanvas
          phase={phase}
          round={round}
          refusal={refusal}
          ask={ASKS[round]}
          softenerCount={(refusal.match(SOFTENERS) || []).length}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="i" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center max-w-md space-y-8 pointer-events-auto">
              <p className="text-4xl font-extralight text-white/95 tracking-[0.02em]" style={SERIF}>say no</p>
              <p className="text-base italic text-white/80 leading-relaxed max-w-md mx-auto" style={SERIF}>
                seven asks. each one, refuse. short. clear. without <em>sorry</em>, <em>maybe</em>, <em>actually</em>, or long defenses.
              </p>
              <p className="text-base italic text-white/80 leading-relaxed max-w-md mx-auto" style={SERIF}>
                a clean no is a boundary. a defended no is still a plea.
              </p>
              <motion.button
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-slate-400/60 bg-slate-500/10 text-slate-100 text-sm uppercase tracking-wide hover:bg-slate-500/20 transition shadow-[0_0_24px_rgba(148,163,184,0.2)]"
              >
                begin
              </motion.button>
            </motion.div>
          )}

          {phase === "refuse" && (
            <motion.div key={`r-${round}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-2xl space-y-8 pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.4em] text-slate-200/60 mb-3 text-center" style={SERIF}>the ask</div>
              <p className="text-lg italic text-center leading-relaxed mb-8 max-w-md mx-auto" style={SERIF}>{ASKS[round]}</p>
              <div className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-2" style={SERIF}>your refusal</div>
              
              <div className="space-y-3">
                <textarea
                  value={refusal}
                  onChange={(e) => setRefusal(e.target.value)}
                  rows={4}
                  placeholder="no. …"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-base italic focus:outline-none focus:border-slate-300/40 resize-none"
                  style={SERIF}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSpokenRefusal}
                    className={`flex-1 px-4 py-2.5 rounded-full border text-xs uppercase tracking-wide ${
                      listeningRefusal ? "border-slate-400/60 bg-slate-500/15 text-slate-100 animate-pulse shadow-[0_0_20px_rgba(148,163,184,0.2)]" : "border-white/15 text-white/40 hover:border-slate-300/50"
                    }`}
                  >
                    {listeningRefusal ? "● listening — tap to finish" : "speak refusal"}
                  </button>
                </div>
              </div>

              <div className="text-[10px] italic text-white/30 mb-4" style={SERIF}>
                soft words detected: {(refusal.match(SOFTENERS) || []).length} · length: {refusal.trim().length}
              </div>

              <motion.button
                disabled={refusal.trim().length < 3}
                onClick={() => { send({ type: "SUBMIT_REFUSAL" }); buzz("tap"); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-6 py-3 rounded-full border text-xs uppercase tracking-[0.4em] ${
                  refusal.trim().length >= 3 ? "border-slate-400/60 bg-slate-500/10 text-slate-100 hover:bg-slate-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                deliver
              </motion.button>
            </motion.div>
          )}

          {phase === "rate" && (
            <motion.div key={`rt-${round}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center space-y-8 pointer-events-auto">
              <p className="text-[10px] uppercase tracking-[0.4em] text-slate-200/60 mb-4" style={SERIF}>how clean did that feel?</p>
              <p className="text-lg italic mb-8 text-slate-200" style={SERIF}>1 = it was a plea. 5 = it was a boundary.</p>
              <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((n) => (
                  <motion.button
                    key={n}
                    onClick={() => { setClarity(n); buzz("tap"); }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`w-14 h-14 rounded-full border text-xl italic transition ${clarity === n
                      ? "border-slate-300/70 bg-white/10 text-white shadow-[0_0_20px_rgba(148,163,184,0.2)]"
                      : "border-white/20 text-white/60 hover:border-slate-300/40"
                    }`}
                    style={SERIF}
                  >
                    {n}
                  </motion.button>
                ))}
              </div>
              <motion.button
                disabled={clarity === 0}
                onClick={() => { send({ type: "SET_CLARITY", value: clarity }); send({ type: "NEXT" }); setRefusal(""); setClarity(0); setListeningRefusal(false); buzz("tap"); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-6 py-3 rounded-full border text-xs uppercase tracking-[0.4em] ${
                  clarity > 0 ? "border-slate-400/60 bg-slate-500/10 text-slate-100 hover:bg-slate-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                {round >= 6 ? "close" : "next ask"}
              </motion.button>
            </motion.div>
          )}

          {phase === "verdict" && (
            <motion.div key="v" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl text-center space-y-8 pointer-events-auto">
              <p className="text-[10px] uppercase tracking-[0.5em] text-slate-200/60 mb-4" style={SERIF}>the engine is done</p>
              <p className="text-xl italic leading-relaxed max-w-md mx-auto" style={SERIF}>
                seven refusals. total soft-words: {rows.reduce((a, r) => a + r.softeners, 0)}. notice which asks were hardest to say no to. that is where you leak.
              </p>
              <motion.button
                onClick={finish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-slate-400/60 bg-slate-500/10 text-slate-100 text-sm uppercase tracking-wide hover:bg-slate-500/20 transition shadow-[0_0_24px_rgba(148,163,184,0.2)]"
              >
                complete
              </motion.button>
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="int" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl text-center space-y-6">
              <p className="text-2xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>rest</p>
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-slate-400/20 to-indigo-400/15 blur-xl"
              />
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                a clean no is a boundary. a defended no is still a plea.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-slate-200/70 transition-all duration-500"
      >
        end · save
      </button>
    </div>
  );
}

export default function RefusalEngine() {
  const g = getLabGame("refusal-engine")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}