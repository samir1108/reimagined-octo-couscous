// IMPERMANENCE WALK — Flagship Grade
// Five minutes. Every 30 seconds, log one thing that just changed — in your body, breath, or the room.
// At the end, see the flow you were part of, not separate from.
// Multi-sensor: mic (breath/STT), TTS (guru), STT (spoken entries), haptics, sound design
// Canvas: animated flow visualization with chime particles
// XState: intro → walk (5 min, 10 chimes) → reveal → integrate

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
import ImpermanenceWalkCanvas from "./ImpermanenceWalkCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };
const DURATION_S = 5 * 60;
const CHIME_EVERY_S = 30;
const TOTAL_CHIMES = DURATION_S / CHIME_EVERY_S; // 10

type Phase = "intro" | "walk" | "reveal" | "integrate";

type Ctx = { chimes: number; entries: Array<{ t: number; text: string; spoken: boolean }> };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "START" }
      | { type: "CHIME"; elapsed: number }
      | { type: "LOG_ENTRY"; text: string; spoken: boolean }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    start: assign(() => ({ chimes: 0, entries: [] })),
    chime: assign(({ context, event }) => ({ chimes: context.chimes + 1, lastChimeAt: event.elapsed })),
    logEntry: assign(({ context, event }) => ({ entries: [...context.entries, { t: event.t, text: event.text, spoken: event.spoken }] })),
  },
}).createMachine({
  id: "impermanenceWalk",
  initial: "intro",
  context: { chimes: 0, entries: [] },
  states: {
    intro: { on: { START: { target: "walk", actions: "start" } } },
    walk: { on: { CHIME: { actions: "chime" }, LOG_ENTRY: { actions: "logEntry" }, ADVANCE: "reveal" } },
    reveal: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { chimes, entries } = state.context;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [remaining, setRemaining] = useState(DURATION_S);
  const [entry, setEntry] = useState("");
  const [listeningEntry, setListeningEntry] = useState(false);
  const [lastChimeTime, setLastChimeTime] = useState(0);

  const startRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const endedRef = useRef(false);
  const lastChimeRef = useRef(0);

  useEffect(() => {
    sd.bed("temple", 0.04);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Timer effect
  useEffect(() => {
    if (phase !== "walk") return;
    timerRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const left = Math.max(0, DURATION_S - elapsed);
      setRemaining(left);
      const chimesShouldHave = Math.floor(elapsed / CHIME_EVERY_S);
      if (chimesShouldHave > lastChimeRef.current) {
        lastChimeRef.current = chimesShouldHave;
        send({ type: "CHIME", elapsed });
        setLastChimeTime(Date.now());
        sd.chime("rise", 0.12);
        buzz("tap");
      }
      if (left <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        send({ type: "ADVANCE" });
      }
    }, 250);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "intro") {
        sd.chime("rise", 0.06);
        await say("five minutes. every thirty seconds — what changed? sit or walk slowly. every half-minute a chime. type one thing that just changed — the breath, a sensation, a sound, the light. not a thought. a change.", "guru");
      } else if (phase === "reveal" && !cancelled) {
        sd.chime("drop", 0.1);
        await say(`the walk ends. ${entries.length} changes noticed. ${TOTAL_CHIMES} chimes. nothing you noticed is still here. neither is the you who noticed it. that is the whole teaching.`, "guru");
      } else if (phase === "integrate") {
        sd.chime("drop", 0.12);
        stopVoice();
        await say("nothing you noticed is still here. neither is the you who noticed it. that is the whole teaching.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase, entries.length]);

  // STT for spoken entry
  useEffect(() => {
    if (phase !== "walk") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setEntry(t);
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
      outcome: entries.length >= 5 ? "completed" : "abandoned",
      signals: {
        duration_s: DURATION_S,
        chimes: state.context.chimes,
        entries: entries.length,
        capture_ratio: state.context.chimes > 0 ? Math.round((entries.length / state.context.chimes) * 100) : 0,
        total_ms: Date.now() - startRef.current,
      },
    });
  }, [onEnd, entries.length, stopVoice, sd]);

  const handleCommit = useCallback(() => {
    const v = entry.trim();
    if (v.length < 2) return;
    send({ type: "LOG_ENTRY", t: Math.round((Date.now() - startRef.current) / 1000), text: v, spoken: false });
    setEntry("");
    buzz("tap");
  }, [entry]);

  const handleSpokenEntry = async () => {
    try { await transcribe.start(); setListeningEntry(true); } catch {}
  };
  const stopSpokenEntry = async () => {
    setListeningEntry(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) setEntry(r.transcript.trim());
  };

  const secs = Math.ceil(remaining);
  const mm = Math.floor(secs / 60);
  const ss = secs % 60;

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.04, 0.12, 0.04], y: [0, -12, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-sky-950/25 via-black to-black pointer-events-none"
      />
      {/* Aurora — sky */}
      <motion.div
        animate={{ opacity: [0.03, 0.12, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-sky-400/15 via-transparent to-transparent pointer-events-none mix-blend-screen"
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
            className="w-1.5 h-1.5 rounded-full bg-sky-300/80 shadow-[0_0_10px_rgba(125,211,252,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.42em] text-sky-200/60" style={SERIF}>
            impermanence walk{phase === "walk" ? ` · ${mm}:${String(ss).padStart(2, "0")} · ${entries.length}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-sky-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
        </div>
      </div>

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <ImpermanenceWalkCanvas
          phase={phase}
          chimes={state.context.chimes}
          entries={entries}
          remaining={remaining}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-lg space-y-8 pointer-events-auto">
              <h2 className="text-3xl italic mb-6" style={SERIF}>five minutes. every thirty seconds — what changed?</h2>
              <p className="text-base italic text-white/80 leading-relaxed mb-10 max-w-md mx-auto" style={SERIF}>
                sit or walk slowly. every half-minute a chime. type one thing that just changed — the breath, a sensation, a sound, the light. not a thought. a change.
              </p>
              <motion.button
                onClick={() => { startRef.current = Date.now(); send({ type: "START" }); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-sky-400/60 bg-sky-500/10 text-sky-100 text-sm uppercase tracking-wide hover:bg-sky-500/20 transition shadow-[0_0_24px_rgba(125,211,252,0.2)]"
              >
                begin the walk
              </motion.button>
            </motion.div>
          )}

          {phase === "walk" && (
            <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-lg space-y-8 pointer-events-auto">
              <div className="mb-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  animate={{ width: `${(remaining / DURATION_S) * 100}%` }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-sky-400/70"
                />
              </div>
              <div className="text-center text-[10px] uppercase tracking-[0.4em] text-sky-200/60 mb-4" style={SERIF}>
                chimes rung: {state.context.chimes} · logged: {entries.length}
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCommit(); } }}
                    placeholder="what just changed…"
                    className="w-full bg-white/[0.03] border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-lg italic focus:outline-none focus:border-sky-300/40"
                    style={SERIF}
                    autoFocus
                  />
                  <button
                    onClick={handleSpokenEntry}
                    className={`px-4 py-3 rounded-xl border text-xs uppercase tracking-wide ${
                      listeningEntry ? "border-sky-400/60 bg-sky-500/15 text-sky-100 animate-pulse shadow-[0_0_20px_rgba(125,211,252,0.2)]" : "border-white/15 text-white/40 hover:border-sky-300/50"
                    }`}
                  >
                    {listeningEntry ? "● listening — tap to finish" : "speak entry"}
                  </button>
                </div>
              </div>

              <motion.button
                onClick={handleCommit}
                disabled={entry.trim().length < 2}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-6 py-3 rounded-full border text-xs uppercase tracking-[0.4em] ${
                  entry.trim().length >= 2 ? "border-sky-400/60 bg-sky-500/10 text-sky-100 hover:bg-sky-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                log change
              </motion.button>

              <ul className="max-h-72 overflow-y-auto pr-1 space-y-1.5">
                {entries.map((e, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="text-sm italic text-slate-300/85 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10"
                    style={SERIF}
                  >
                    <span className="text-sky-200/60 mr-2 text-xs">
                      {String(Math.floor(e.t / 60)).padStart(2, "0")}:{String(e.t % 60).padStart(2, "0")}
                    </span>
                    {e.text}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          {phase === "reveal" && (
            <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-lg text-center space-y-8 pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.5em] text-slate-200/60 mb-4" style={SERIF}>changes noticed</div>
              <p className="text-5xl italic mb-2" style={SERIF}>{entries.length}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-6" style={SERIF}>in five minutes</p>
              <ul className="max-h-64 overflow-y-auto pr-1 mb-6 text-left space-y-1.5">
                {entries.map((e, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="text-sm italic text-slate-300/85 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10"
                    style={SERIF}
                  >
                    <span className="text-sky-200/60 mr-2 text-xs">
                      {String(Math.floor(e.t / 60)).padStart(2, "0")}:{String(e.t % 60).padStart(2, "0")}
                    </span>
                    {e.text}
                  </motion.li>
                ))}
              </ul>
              <p className="text-base italic text-slate-300/85 leading-relaxed mb-8" style={SERIF}>
                Nothing you noticed is still here. Neither is the you who noticed it. That is the whole teaching.
              </p>
              <motion.button
                onClick={finish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-sky-400/60 bg-sky-500/10 text-sky-100 text-sm uppercase tracking-wide hover:bg-sky-500/20 transition shadow-[0_0_24px_rgba(125,211,252,0.2)]"
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
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-b from-sky-400/20 to-transparent blur-xl"
              />
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                nothing you noticed is still here. neither is the you who noticed it. that is the whole teaching.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-sky-200/70 transition-all duration-500"
      >
        end · save
      </button>
    </div>
  );
}

export default function ImpermanenceWalk() {
  const g = getLabGame("impermanence-walk")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}