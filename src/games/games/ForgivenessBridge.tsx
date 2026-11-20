// FORGIVENESS BRIDGE — Flagship Grade
// Three passes at the same letter to someone you resent.
// Pass 1: full anger, unfiltered. Pass 2: what they may have carried.
// Pass 3: what you release. Never sent.
// Multi-sensor: mic (breath/STT), TTS (guru), STT (spoken drafts), haptics, sound design
// Canvas: animated bridge visualization with three pass visualization
// XState: intro → who → write (3 passes) → rate → verdict → integrate

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
import ForgivenessBridgeCanvas from "./ForgivenessBridgeCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };

const PASSES = [
  { key: "anger", label: "the anger", prompt: "Write it exactly as it lives in you. No editing. What did they do, and what did it cost." },
  { key: "their_carry", label: "what they carried", prompt: "Now write what they may have been carrying that made them capable of this. Not an excuse. A wider frame." },
  { key: "release", label: "what you release", prompt: "Finally: what part of this you are willing to set down today. Not forever. Today." },
];

type Phase = "intro" | "who" | "write" | "rate" | "verdict" | "integrate";

type Ctx = { who: string; before: number; after: number; drafts: Record<string, string>; currentPass: number };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "SET_WHO"; value: string }
      | { type: "SET_BEFORE"; value: number }
      | { type: "START_WRITE" }
      | { type: "SET_DRAFT"; key: string; value: string }
      | { type: "NEXT_PASS" }
      | { type: "SET_AFTER"; value: number }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    setWho: assign(({ context, event }) => ({ ...context, who: event.value })),
    setBefore: assign(({ context, event }) => ({ ...context, before: event.value })),
    startWrite: assign(({ context }) => ({ ...context, currentPass: 0 })),
    setDraft: assign(({ context, event }) => ({
      ...context,
      drafts: { ...context.drafts, [event.key]: event.value },
    })),
    nextPass: assign(({ context }) => ({ ...context, currentPass: context.currentPass + 1 })),
    setAfter: assign(({ context, event }) => ({ ...context, after: event.value })),
  },
}).createMachine({
  id: "forgivenessBridge",
  initial: "intro",
  context: { who: "", before: 7, after: 7, drafts: {}, currentPass: 0 },
  states: {
    intro: { on: { ADVANCE: "who" } },
    who: { on: { SET_WHO: { actions: "setWho" }, SET_BEFORE: { actions: "setBefore" }, ADVANCE: { target: "write", actions: "startWrite" } } },
    write: { on: { SET_DRAFT: { actions: "setDraft" }, NEXT_PASS: { actions: "nextPass", target: "write" }, ADVANCE: "rate" } },
    rate: { on: { SET_AFTER: { actions: "setAfter" }, ADVANCE: "verdict" } },
    verdict: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { who, before, after, drafts, currentPass } = state.context;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [entry, setEntry] = useState("");
  const [listeningEntry, setListeningEntry] = useState(false);

  const startedAt = useRef(Date.now());
  const endedRef = useRef(false);

  useEffect(() => {
    sd.bed("temple", 0.05);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "intro") {
        sd.chime("rise", 0.06);
        await say("three passes at a letter to someone you resent. anger. their carry. your release. never sent.", "guru");
      } else if (phase === "who" && !cancelled) {
        sd.chime("rise", 0.08);
        await say("who is this letter for? name them. then rate how tight the grip is right now.", "guru");
      } else if (phase === "write" && !cancelled) {
        sd.chime("rise", 0.08);
        await say(`pass ${currentPass + 1} of 3. ${PASSES[currentPass].prompt}`, "guru");
        if (!cancelled) {
          await new Promise(r => setTimeout(r, 500));
          if (!cancelled) {
            try { await transcribe.start(); setListeningEntry(true); } catch {}
          }
        }
      } else if (phase === "rate" && !cancelled) {
        sd.chime("drop", 0.08);
        await say("and now? the grip? rate it one to ten.", "guru");
      } else if (phase === "verdict" && !cancelled) {
        sd.chime("drop", 0.1);
        const shift = after < before ? "something moved. not the story — the grip." : "the grip did not move today. that is data, not failure.";
        await say(shift, "guru");
      } else if (phase === "integrate") {
        sd.chime("drop", 0.12);
        stopVoice();
        await say("the letter was never sent. it was read by the part of you still holding on.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase, currentPass]);

  // STT for spoken draft
  useEffect(() => {
    if (phase !== "write") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setEntry(t);
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    sd.stopBed();
    stopVoice();

    const total = Object.values(drafts).reduce((s, v) => s + v.length, 0);

    onEnd({
      outcome: Object.keys(drafts).length >= 3 ? "completed" : "abandoned",
      signals: {
        duration_ms: Date.now() - startedAt.current,
        target_named: who.trim().length > 0,
        passes: Object.keys(drafts).length,
        total_chars: total,
        grip_before: before,
        grip_after: after,
        delta: before - after,
      },
    });
  }, [onEnd, drafts, who, before, after, stopVoice, sd]);

  const handleSpokenEntry = async () => {
    try { await transcribe.start(); setListeningEntry(true); } catch {}
  };
  const stopSpokenEntry = async () => {
    setListeningEntry(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) setEntry(r.transcript.trim());
  };

  const handleSubmitWho = useCallback(() => {
    if (who.trim().length < 2) return;
    send({ type: "SET_WHO", value: who });
    send({ type: "SET_BEFORE", value: before });
    send({ type: "ADVANCE" });
    buzz("tap");
  }, [who, before]);

  const handleNextPass = useCallback(() => {
    const v = entry.trim();
    if (v.length < 10) return;
    const key = PASSES[state.context.currentPass].key;
    send({ type: "SET_DRAFT", key, value: v });
    send({ type: "NEXT_PASS" });
    setEntry("");
    buzz("tap");
  }, [entry]);

  const handleFinish = useCallback(() => {
    if (after < before) {
      finish();
    } else {
      finish();
    }
  }, [after, before, finish]);

  const cur = PASSES[state.context.currentPass];

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.04, 0.14, 0.04], y: [0, -12, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-blue-950/25 via-black to-slate-950/25 pointer-events-none"
      />
      {/* Aurora — blue/slate */}
      <motion.div
        animate={{ opacity: [0.03, 0.12, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-blue-400/15 via-transparent to-slate-400/10 pointer-events-none mix-blend-screen"
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
            className="w-1.5 h-1.5 rounded-full bg-blue-300/80 shadow-[0_0_10px_rgba(125,211,252,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.5em] text-blue-200/70 font-light" style={SERIF}>
            forgiveness bridge{phase === "write" ? ` · pass ${state.context.currentPass + 1} / 3` : ""}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-blue-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
        </div>
      </div>

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <ForgivenessBridgeCanvas
          phase={phase}
          who={who}
          before={before}
          after={after}
          currentPass={state.context.currentPass}
          drafts={state.context.drafts}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="i" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center max-w-lg space-y-8 pointer-events-auto">
              <h2 className="text-3xl italic mb-6" style={SERIF}>three passes · one person</h2>
              <p className="text-base italic text-white/80 leading-relaxed max-w-md mx-auto mb-10" style={SERIF}>
                pick one person you still resent. you will write them a letter in three passes — anger, their carry, your release. never sent. only read by the part of you still holding on.
              </p>
              <motion.button
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2.5 rounded-full border border-white/30 text-xs uppercase tracking-[0.4em] hover:bg-white/5"
                style={SERIF}
              >
                begin
              </motion.button>
            </motion.div>
          )}

          {phase === "who" && (
            <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <p className="text-xl italic mb-6" style={SERIF}>who is this letter for?</p>
              <input
                value={who}
                onChange={(e) => send({ type: "SET_WHO", value: e.target.value })}
                placeholder="a name or initials — private"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-base italic focus:outline-none focus:border-blue-300/40 mb-6 text-center"
                style={SERIF}
                autoFocus
              />
              <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-6" style={SERIF}>how tight is the grip right now?</p>
              <input type="range" min={1} max={10} value={before} onChange={(e) => send({ type: "SET_BEFORE", value: parseInt(e.target.value) })} className="w-full accent-blue-400 mb-2" />
              <div className="text-2xl italic mb-8" style={SERIF}>{before}<span className="text-sm text-white/40">/10</span></div>
              <motion.button
                onClick={() => { send({ type: "SET_WHO", value: who }); send({ type: "SET_BEFORE", value: before }); send({ type: "ADVANCE" }); buzz("tap"); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2.5 rounded-full border border-white/30 text-xs uppercase tracking-[0.4em] hover:bg-white/5"
                style={SERIF}
              >
                cross the bridge
              </motion.button>
            </motion.div>
          )}

          {phase === "write" && (
            <motion.div key={`p-${state.context.currentPass}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-2xl pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.5em] text-blue-200/60 mb-2" style={SERIF}>pass {state.context.currentPass + 1} · {PASSES[state.context.currentPass].label}</div>
              <p className="text-lg italic mb-4 leading-snug text-slate-200/90" style={SERIF}>{PASSES[state.context.currentPass].prompt}</p>
              <textarea
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder={`writing to ${who || "them"}…`}
                rows={10}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-base italic focus:outline-none focus:border-blue-300/40 mb-4"
                style={SERIF}
                autoFocus
              />
              <div className="space-y-3 mb-4">
                <button
                  onClick={handleSpokenEntry}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    listeningEntry ? "border-blue-400/60 bg-blue-500/15 text-blue-100 animate-pulse shadow-[0_0_20px_rgba(125,211,252,0.2)]" : "border-white/15 text-white/40 hover:border-blue-300/50"
                  }`}
                >
                  {listeningEntry ? "● listening — tap to finish" : "speak draft"}
                </button>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-2xl"
              >
                <div className="flex justify-end">
                  <motion.button
                    onClick={() => {
                      const v = entry.trim();
                      if (v.length >= 10) {
                        const key = PASSES[state.context.currentPass].key;
                        send({ type: "SET_DRAFT", key, value: v });
                        send({ type: "NEXT_PASS" });
                        setEntry("");
                        buzz("tap");
                      }
                    }}
                    className="px-6 py-2.5 rounded-full border border-white/30 text-xs uppercase tracking-[0.4em] hover:bg-white/5"
                    style={SERIF}
                  >
                    {state.context.currentPass + 1 === 3 ? "finish the bridge" : "next pass"}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {phase === "rate" && (
            <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md text-center pointer-events-auto">
              <p className="text-xl italic mb-6" style={SERIF}>and now? the grip?</p>
              <input type="range" min={1} max={10} value={after} onChange={(e) => send({ type: "SET_AFTER", value: parseInt(e.target.value) })} className="w-full accent-blue-400 mb-2" />
              <div className="text-3xl italic mb-8" style={SERIF}>{after}<span className="text-sm text-white/40">/10</span></div>
              <motion.button
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2.5 rounded-full border border-white/30 text-xs uppercase tracking-[0.4em] hover:bg-white/5"
                style={SERIF}
              >
                see the shift
              </motion.button>
            </motion.div>
          )}

          {phase === "verdict" && (
            <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-lg text-center pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.5em] text-slate-200/60 mb-4" style={SERIF}>the bridge</div>
              <p className="text-5xl italic mb-2" style={SERIF}>{before} → {after}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-6" style={SERIF}>grip moved</p>
              <p className="text-base italic text-white/85 leading-relaxed max-w-md mx-auto mb-8" style={SERIF}>
                {after < before
                  ? "something moved. not the story — the grip. return to this letter in a week and read only pass three."
                  : "the grip did not move today. that is data, not failure. some resentments need many crossings."}
              </p>
              <motion.button
                onClick={finish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2.5 rounded-full border border-white/30 text-xs uppercase tracking-[0.4em] hover:bg-white/5"
                style={SERIF}
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
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-blue-400/20 to-slate-400/15 blur-xl"
              />
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                the letter was never sent. it was read by the part of you still holding on.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-blue-200/70 transition-all duration-500"
      >
        end · save
      </button>
    </div>
  );
}

export default function ForgivenessBridge() {
  const g = getLabGame("forgiveness-bridge")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}