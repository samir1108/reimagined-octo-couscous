// IṢṬA-DEVATĀ CHOOSE — Flagship Grade
// Iṣṭa-devatā = chosen form of the infinite. Not the "true" god
// nor the "right" one — the one that answers when you are honest.
// We name three candidates, sit with each 30s, and let the body
// vote. Then: what does the chosen one ask of us today?
// Multi-sensor: mic (breath), TTS (guru), STT (spoken entries), haptics, sound design
// Canvas: animated form visualization with body vote visualization
// XState: intro → three → sit × 3 → choose → ask → integrate

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
import IstaDevataChooseCanvas from "./IstaDevataChooseCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };
const SIT_PER_FORM = 30;

type Phase = "intro" | "three" | "sit" | "choose" | "ask" | "integrate";

type Ctx = { candidates: string[]; chosen: string; ask: string; sitIdx: number };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "SET_CANDIDATES"; value: string[] }
      | { type: "SET_CHOSEN"; value: string }
      | { type: "SET_ASK"; value: string }
      | { type: "ADVANCE" }
      | { type: "NEXT_FORM" }
      | { type: "FINALIZE" };
  },
  actions: {
    setCandidates: assign(({ context, event }) => ({ ...context, candidates: event.value })),
    setChosen: assign(({ context, event }) => ({ ...context, chosen: event.value })),
    setAsk: assign(({ context, event }) => ({ ...context, ask: event.value })),
  },
}).createMachine({
  id: "istaDevataChoose",
  initial: "intro",
  context: { candidates: ["", "", ""], chosen: "", ask: "", sitIdx: 0 },
  states: {
    intro: { on: { ADVANCE: "three" } },
    three: { on: { SET_CANDIDATES: { actions: "setCandidates" }, ADVANCE: { target: "sit", guard: ({ context }) => context.candidates.filter(Boolean).length >= 3 } } },
    sit: { on: { ADVANCE: [{ target: "sit", guard: ({ context }) => context.sitIdx < 2 }, { target: "choose" }] } },
    choose: { on: { SET_CHOSEN: { actions: "setChosen" }, ADVANCE: "ask" } },
    ask: { on: { SET_ASK: { actions: "setAsk" }, ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

const ISHTA_PROMPTS = [
  "name a form, a face, a photograph — a shape love recognizes",
  "the teacher, the one who first cracked you open",
  "the beloved, a person alive or gone, love flows to without asking",
  "the vast — sea, sky, mountain, the impersonal that still holds you",
  "the nameless — no form, only the warmth itself",
  "a teacher, a lineage, a name that carries you",
  "a mountain, a river, the ground beneath your feet",
];

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { candidates, chosen, ask, sitIdx } = state.context;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [sitLeft, setSitLeft] = useState(30);
  const [listening, setListening] = useState(false);

  const startRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const endedRef = useRef(false);

  useEffect(() => {
    sd.bed("temple", 0.05);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Timer effect
  useEffect(() => {
    if (phase !== "sit") return;
    timerRef.current = window.setInterval(() => {
      setSitLeft((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (sitIdx < 2) {
            send({ type: "NEXT_FORM" });
          } else {
            clearInterval(timerRef.current!);
            send({ type: "ADVANCE" });
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, sitIdx]);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "intro") {
        sd.chime("rise", 0.06);
        await say("three forms of the infinite that you actually feel. name them. sit with each thirty seconds. let the body vote.", "guru");
      } else if (phase === "sit") {
        sd.chime("rise", 0.08);
        await say(`form ${sitIdx + 1} of 3. ${candidates[sitIdx]}. thirty seconds. let the body listen. does something warm? tighten? soften?`, "guru");
      } else if (phase === "choose") {
        sd.chime("drop", 0.08);
        await say("which one answered? the body knows before the mind.", "guru");
      } else if (phase === "ask") {
        sd.chime("drop", 0.1);
        await say("what does it ask of you today? one line. one turn of the day toward this form.", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setListening(true); } catch {}
        }
      } else if (phase === "integrate") {
        if (listening) {
          setListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) send({ type: "SET_ASK", value: r.transcript.trim().slice(0, 200) });
        }
        sd.chime("drop", 0.12);
        stopVoice();
        await say("the chosen form asked. the answer is not words — it's the turn of the day.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase, sitIdx]);

  // STT for ask
  useEffect(() => {
    if (phase !== "ask") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setAsk(t);
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    transcribe.cancel();
    sd.stopBed();
    stopVoice();

    onEnd({
      outcome: chosen.trim().length >= 2 && ask.trim().length >= 6 ? "completed" : "abandoned",
      signals: {
        candidates: candidates.map(c => c.trim()).filter(Boolean),
        chosen_form: chosen.trim(),
        todays_ask: ask.trim(),
        total_ms: Date.now() - startRef.current,
      },
    });
  }, [onEnd, candidates, chosen, ask, stopVoice, sd]);

  const handleSpokenAsk = async () => {
    try { await transcribe.start(); setListening(true); } catch {}
  };
  const stopSpokenAsk = async () => {
    setListening(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) send({ type: "SET_ASK", value: r.transcript.trim() });
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.08, 0.2, 0.08] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-amber-900/15 via-black to-rose-900/15 pointer-events-none"
      />
      {/* Aurora — amber/rose */}
      <motion.div
        animate={{ opacity: [0.03, 0.1, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-amber-400/15 via-transparent to-rose-400/10 pointer-events-none mix-blend-screen"
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
            className="w-1.5 h-1.5 rounded-full bg-amber-300/80 shadow-[0_0_10px_rgba(251,191,36,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.42em] text-amber-200/70 font-light" style={SERIF}>iṣṭa · chosen form{phase === "sit" ? ` · ${sitLeft}s` : phase === "choose" ? " · choose" : phase === "ask" ? " · ask" : ""}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-amber-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
        </div>
      </div>

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <IstaDevataChooseCanvas
          phase={phase}
          candidates={candidates}
          sitIdx={sitIdx}
          sitLeft={sitLeft}
          chosen={chosen}
          ask={ask}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-lg space-y-8 pointer-events-auto">
              <h2 className="text-3xl italic mb-6" style={SERIF}>iṣṭa · chosen form</h2>
              <p className="text-base italic text-white/80 leading-relaxed mb-10 max-w-md mx-auto" style={SERIF}>
                iṣṭa-devatā = chosen form of the infinite. not the "true" god nor the "right" one — the one that answers when you are honest.
              </p>
              <motion.button
                onClick={() => { startRef.current = Date.now(); send({ type: "ADVANCE" }); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-amber-400/60 bg-amber-500/10 text-amber-100 text-sm uppercase tracking-wide hover:bg-amber-500/20 transition shadow-[0_0_24px_rgba(251,191,36,0.2)]"
              >
                begin
              </motion.button>
            </motion.div>
          )}

          {phase === "three" && (
            <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <p className="text-2xl italic text-white/90 mb-3" style={SERIF}>three forms of the infinite — that you actually feel</p>
              <p className="text-sm text-white/50 italic mb-6" style={SERIF}>a deity · a teacher · a face · a mountain · silence itself. no "right" list.</p>
              {[0, 1, 2].map((i) => (
                <input key={i} value={candidates[i]}
                  onChange={(e) => send({ type: "SET_CANDIDATES", value: candidates.map((v, j) => j === i ? e.target.value : v) })}
                  placeholder={ISHTA_PROMPTS[i] || `form ${i + 1}…`}
                  style={SERIF}
                  className="w-full mb-3 bg-white/[0.03] border border-white/15 rounded-xl p-3 text-white/95 placeholder:text-white/25 italic text-center focus:outline-none focus:border-amber-300/40"
                />
              ))}
              <motion.button
                disabled={cleanCount < 3}
                onClick={() => { setSitIdx(0); send({ type: "ADVANCE" }); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-amber-400/60 bg-amber-500/10 text-amber-100 text-sm uppercase tracking-wide hover:bg-amber-500/20 transition shadow-[0_0_24px_rgba(251,191,36,0.2)]"
              >
                sit with each · 30s
              </motion.button>
            </motion.div>
          )}

          {phase === "sit" && (
            <motion.div key={`s-${sitIdx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.35em] text-amber-200/60 mb-3 text-center" style={SERIF}>form {sitIdx + 1} of 3</div>
              <motion.p
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-4xl italic text-white/95 mb-8"
                style={SERIF}
              >
                {candidates[sitIdx]}
              </motion.p>
              <p className="text-sm text-white/45 italic mb-6" style={SERIF}>let the body listen. does something warm? tighten? soften?</p>
              <div className="text-white/70 tabular-nums" style={SERIF}>{sitLeft}s</div>
            </motion.div>
          )}

          {phase === "choose" && (
            <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <p className="text-2xl italic text-white/90 mb-6" style={SERIF}>which one answered?</p>
              <div className="flex flex-col gap-3 mb-8">
                {candidates.map((c) => (
                  <motion.button
                    key={c}
                    onClick={() => { setChosen(c); buzz("tap"); }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-5 py-4 rounded-xl border italic transition text-white/90 ${chosen === c ? "border-white/70 bg-white/10" : "border-white/15 hover:bg-white/5"}`}
                    style={SERIF}
                  >
                    {c}
                  </motion.button>
                ))}
              </div>
              <motion.button
                disabled={!chosen}
                onClick={() => { send({ type: "ADVANCE" }); buzz("tap"); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border border-white/25 rounded-full text-sm tracking-wide hover:bg-white/5 transition disabled:opacity-30"
                style={SERIF}
              >
                what does it ask today
              </motion.button>
            </motion.div>
          )}

          {phase === "ask" && (
            <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <p className="text-2xl italic text-white/90 mb-3" style={SERIF}>{chosen} — asks of you today:</p>
              <p className="text-sm text-white/50 italic mb-6" style={SERIF}>one line. not a vow. one turn of the day toward this form.</p>
              <textarea
                value={ask}
                onChange={(e) => send({ type: "SET_ASK", value: e.target.value })}
                placeholder="today it asks me to…"
                rows={3}
                className="w-full bg-white/[0.03] border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-base italic focus:outline-none focus:border-white/40 mb-4 resize-none"
                style={SERIF}
              />
              <div className="space-y-3">
                <button
                  onClick={handleSpokenAsk}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    listening ? "border-amber-400/60 bg-amber-500/15 text-amber-100 animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.2)]" : "border-white/15 text-white/40 hover:border-amber-300/50"
                  }`}
                >
                  {listening ? "● listening — tap to finish" : "speak ask"}
                </button>
              </div>
              <motion.button
                disabled={ask.trim().length < 6}
                onClick={finish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-8 py-3 rounded-full border text-xs uppercase tracking-[0.4em] ${
                  ask.trim().length >= 6 ? "border-amber-400/60 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                close
              </motion.button>
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="int" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg text-center space-y-6">
              <p className="text-2xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>rest</p>
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-amber-400/20 to-rose-400/15 blur-xl"
              />
              {ask && (
                <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>"{ask}"</p>
              )}
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                the chosen form asked. the answer is not words — it's the turn of the day.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-amber-200/70 transition-all duration-500"
      >
        end · save
      </button>
    </div>
  );
}

export default function IstaDevataChoose() {
  const g = getLabGame("ista-devata-choose")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}