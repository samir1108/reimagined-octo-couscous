// GRATITUDE STORM — Flagship Grade
// Ninety seconds. Type one thing you are grateful for and hit enter.
// Do it as fast as your fingers can find truth. The counter climbs.
// Multi-sensor: mic (breath/STT), TTS (guru), STT (spoken entries), haptics, sound design
// Canvas: animated storm visualization with word particles
// XState: intro → storm (90s) → reveal → integrate

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
import GratitudeStormCanvas from "./GratitudeStormCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };
const DURATION_S = 90;

type Phase = "intro" | "storm" | "reveal" | "integrate";

type Ctx = { items: Array<{ text: string; t: number; spoken: boolean }> };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "START" }
      | { type: "LOG"; text: string; spoken: boolean }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    start: assign(() => ({ items: [] })),
    log: assign(({ context, event }) => ({ items: [...context.items, { text: event.text, t: Date.now(), spoken: event.spoken }] })),
  },
}).createMachine({
  id: "gratitudeStorm",
  initial: "intro",
  context: { items: [] },
  states: {
    intro: { on: { START: { target: "storm", actions: "start" } } },
    storm: { on: { LOG: { actions: "log" }, ADVANCE: "reveal" } },
    reveal: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { items } = state.context;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [remaining, setRemaining] = useState(DURATION_S);
  const [entry, setEntry] = useState("");
  const [listeningEntry, setListeningEntry] = useState(false);

  const startRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const endedRef = useRef(false);

  useEffect(() => {
    sd.bed("temple", 0.05);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Timer effect
  useEffect(() => {
    if (phase !== "storm") return;
    timerRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const left = Math.max(0, DURATION_S - elapsed);
      setRemaining(left);
      if (left <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        send({ type: "ADVANCE" });
      }
    }, 200);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "intro") {
        sd.chime("rise", 0.06);
        await say("ninety seconds. one thing you are grateful for. enter. another. enter. do not curate. do not repeat. fast, small, true.", "guru");
      } else if (phase === "reveal" && !cancelled) {
        sd.chime("drop", 0.1);
        const avg = items.length ? Math.round(items.reduce((a, r) => a + r.text.length, 0) / items.length) : 0;
        let longestGap = 0;
        for (let i = 1; i < items.length; i++) {
          const gap = items[i].t - items[i - 1].t;
          if (gap > longestGap) longestGap = gap;
        }
        await say(`${items.length} things named in ninety seconds. longest pause: ${Math.round(longestGap / 1000)}s. every one of these was already here. you were just not looking.`, "guru");
      } else if (phase === "integrate") {
        sd.chime("drop", 0.12);
        stopVoice();
        await say("every one of these was already here. you were just not looking.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase, items]);

  // STT for spoken entry
  useEffect(() => {
    if (phase !== "storm") return;
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

    const avg = items.length ? Math.round(items.reduce((a, r) => a + r.text.length, 0) / items.length) : 0;
    let longestGap = 0;
    for (let i = 1; i < items.length; i++) {
      const gap = items[i].t - items[i - 1].t;
      if (gap > longestGap) longestGap = gap;
    }

    onEnd({
      outcome: items.length >= 5 ? "completed" : "abandoned",
      signals: {
        items: items.length,
        avg_chars: avg,
        longest_pause_ms: longestGap,
        total_ms: DURATION_S * 1000,
      },
    });
  }, [onEnd, items, stopVoice, sd]);

  const handleCommit = useCallback(() => {
    const v = entry.trim();
    if (v.length < 2) return;
    send({ type: "LOG", text: v, spoken: false });
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

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.04, 0.12, 0.04], y: [0, -12, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-emerald-950/15 via-black to-black pointer-events-none"
      />
      {/* Aurora — emerald */}
      <motion.div
        animate={{ opacity: [0.03, 0.1, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-emerald-400/15 via-transparent to-transparent pointer-events-none mix-blend-screen"
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
            className="w-1.5 h-1.5 rounded-full bg-emerald-300/80 shadow-[0_0_10px_rgba(110,231,183,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.42em] text-emerald-200/70 font-light" style={SERIF}>
            gratitude storm{phase === "storm" ? ` · ${remaining}s · ${state.context.items.length}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-emerald-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
        </div>
      </div>

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <GratitudeStormCanvas
          phase={phase}
          items={state.context.items}
          remaining={remaining}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-md space-y-8 pointer-events-auto">
              <h2 className="text-3xl italic mb-6" style={SERIF}>ninety seconds</h2>
              <p className="text-base italic text-white/80 leading-relaxed mb-10 max-w-md mx-auto" style={SERIF}>
                one thing you are grateful for. enter. another. enter. do not curate. do not repeat. fast, small, true.
              </p>
              <motion.button
                onClick={() => { startRef.current = Date.now(); send({ type: "START" }); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-emerald-400/60 bg-emerald-500/10 text-emerald-100 text-sm uppercase tracking-wide hover:bg-emerald-500/20 transition shadow-[0_0_24px_rgba(110,231,183,0.2)]"
              >
                begin the storm
              </motion.button>
            </motion.div>
          )}

          {phase === "storm" && (
            <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-lg space-y-8 pointer-events-auto">
              <div className="mb-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  animate={{ width: `${(remaining / DURATION_S) * 100}%` }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-emerald-400/70"
                />
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCommit(); } }}
                    placeholder="one thing… then enter"
                    className="w-full bg-white/[0.03] border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-lg italic focus:outline-none focus:border-emerald-300/40"
                    style={SERIF}
                    autoFocus
                  />
                  <button
                    onClick={handleSpokenEntry}
                    className={`px-4 py-3 rounded-xl border text-xs uppercase tracking-wide ${
                      listeningEntry ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-100 animate-pulse shadow-[0_0_20px_rgba(110,231,183,0.2)]" : "border-white/15 text-white/40 hover:border-emerald-300/50"
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
                  entry.trim().length >= 2 ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                add
              </motion.button>

              <div className="max-h-72 overflow-y-auto pr-1">
                <ul className="flex flex-wrap gap-2 justify-center">
                  {state.context.items.map((it, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-3 py-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-100 text-sm italic"
                      style={SERIF}
                    >
                      {it.text}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {phase === "reveal" && (
            <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-lg text-center space-y-8 pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.5em] text-slate-200/60 mb-4" style={SERIF}>the storm has passed</div>
              <p className="text-4xl italic mb-2" style={SERIF}>{state.context.items.length}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-6" style={SERIF}>things named in {DURATION_S}s</p>
              <div className="max-h-64 overflow-y-auto pr-1 mb-6">
                <ul className="flex flex-wrap gap-2 justify-center">
                  {state.context.items.map((it, i) => (
                    <li key={i} className="px-3 py-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-100 text-sm italic" style={SERIF}>
                      {it.text}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-base italic text-slate-300/80 leading-relaxed mb-8" style={SERIF}>
                Every one of these was already here. You were just not looking.
              </p>
              <motion.button
                onClick={finish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-emerald-400/60 bg-emerald-500/10 text-emerald-100 text-sm uppercase tracking-wide hover:bg-emerald-500/20 transition shadow-[0_0_24px_rgba(110,231,183,0.2)]"
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
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-b from-emerald-400/20 to-transparent blur-xl"
              />
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                Every one of these was already here. You were just not looking.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-emerald-200/70 transition-all duration-500"
      >
        end · save
      </button>
    </div>
  );
}

export default function GratitudeStorm() {
  const g = getLabGame("gratitude-storm")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}