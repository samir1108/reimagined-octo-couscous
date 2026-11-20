// SANNYĀSA REHEARSAL — Flagship Grade
// Not the robe. Not the leaving. The inner move: naming
// something you have carried as "mine" — and setting it
// down, just symbolically, just for a week. What was it
// for? What will its absence teach?
// Multi-sensor: mic (breath/STT), TTS (guru), STT (spoken entries), haptics, sound design
// Canvas: animated letting-go visualization with particle flow
// XState: intro → name → for → setdown → watch → integrate

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
import SannyasaRehearsalCanvas from "./SannyasaRehearsalCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };

type Phase = "intro" | "name" | "for" | "setdown" | "watch" | "integrate";

type Ctx = { carried: string; wasFor: string; duration: 1 | 3 | 7 | null; absenceTeaches: string };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "SET_CARRIED"; value: string }
      | { type: "SET_FOR"; value: string }
      | { type: "SET_DURATION"; value: 1 | 3 | 7 }
      | { type: "SET_ABSENCE"; value: string }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    setCarried: assign(({ context, event }) => ({ ...context, carried: event.value })),
    setFor: assign(({ context, event }) => ({ ...context, wasFor: event.value })),
    setDuration: assign(({ context, event }) => ({ ...context, duration: event.value })),
    setAbsence: assign(({ context, event }) => ({ ...context, absenceTeaches: event.value })),
  },
}).createMachine({
  id: "sannyasaRehearsal",
  initial: "intro",
  context: { carried: "", wasFor: "", duration: null, absenceTeaches: "" },
  states: {
    intro: { on: { ADVANCE: "name" } },
    name: { on: { SET_CARRIED: { actions: "setCarried", target: "for", guard: ({ context }) => context.carried.trim().length >= 5 } } },
    for: { on: { SET_FOR: { actions: "setFor", target: "setdown", guard: ({ context }) => context.wasFor.trim().length >= 4 } } },
    setdown: { on: { SET_DURATION: { actions: "setDuration", target: "watch", guard: ({ context }) => context.duration !== null } } },
    watch: { on: { SET_ABSENCE: { actions: "setAbsence", target: "integrate", guard: ({ context }) => context.absenceTeaches.trim().length >= 6 } } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { carried, wasFor, duration, absenceTeaches } = state.context;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [listeningCarried, setListeningCarried] = useState(false);
  const [listeningFor, setListeningFor] = useState(false);
  const [listeningAbsence, setListeningAbsence] = useState(false);

  const startedAt = useRef(Date.now());
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
        await say("not the robe. not the leaving. the inner move: name something you've carried as \"mine\" — and set it down, just for a week. what was it for? what will its absence teach?", "guru");
      } else if (phase === "name" && !cancelled) {
        sd.chime("rise", 0.08);
        await say("name one thing you've carried as \"mine\". a role, a resentment, a title, a habit, an old story, a plan you no longer believe in.", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setListeningCarried(true); } catch {}
        }
      } else if (phase === "for" && !cancelled) {
        sd.chime("drop", 0.08);
        await say("what has it been protecting — or providing? identity, income, belonging, a way to feel worthy, a way to stay busy.", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setListeningFor(true); } catch {}
        }
      } else if (phase === "setdown" && !cancelled) {
        sd.chime("rise", 0.1);
        await say("set it down — for how long? not renounced. rehearsed. one day, three, or seven.", "guru");
      } else if (phase === "watch" && !cancelled) {
        sd.chime("drop", 0.08);
        await say("what do you expect to learn from the gap it leaves? speak the hypothesis.", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setListeningAbsence(true); } catch {}
        }
      } else if (phase === "integrate") {
        if (listeningAbsence) {
          setListeningAbsence(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) send({ type: "SET_ABSENCE", value: r.transcript.trim() });
        }
        sd.chime("drop", 0.12);
        stopVoice();
        await say("the thing you carried was never the thing. the practice was the setting down.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  // STT listeners
  useEffect(() => {
    if (phase !== "name") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setCarried(t);
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  useEffect(() => {
    if (phase !== "for") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setWasFor(t);
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  useEffect(() => {
    if (phase !== "watch") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setAbsenceTeaches(t);
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    sd.stopBed();
    stopVoice();

    onEnd({
      outcome: carried.trim().length >= 5 && wasFor.trim().length >= 4 && duration !== null && absenceTeaches.trim().length >= 6 ? "completed" : "abandoned",
      signals: {
        carried: carried.trim(),
        its_purpose: wasFor.trim(),
        days_set_down: duration,
        absence_hypothesis: absenceTeaches.trim(),
        total_ms: Date.now() - startedAt.current,
      },
    });
  }, [onEnd, carried, wasFor, duration, absenceTeaches, stopVoice, sd]);

  const handleSpokenCarried = async () => {
    try { await transcribe.start(); setListeningCarried(true); } catch {}
  };
  const stopSpokenCarried = async () => {
    setListeningCarried(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) send({ type: "SET_CARRIED", value: r.transcript.trim() });
  };

  const handleSpokenFor = async () => {
    try { await transcribe.start(); setListeningFor(true); } catch {}
  };
  const stopSpokenFor = async () => {
    setListeningFor(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) send({ type: "SET_FOR", value: r.transcript.trim() });
  };

  const handleSpokenAbsence = async () => {
    try { await transcribe.start(); setListeningAbsence(true); } catch {}
  };
  const stopSpokenAbsence = async () => {
    setListeningAbsence(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) send({ type: "SET_ABSENCE", value: r.transcript.trim() });
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.05, 0.13, 0.05] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-stone-900/25 via-black to-slate-900/25 pointer-events-none"
      />
      {/* Aurora — stone/slate */}
      <motion.div
        animate={{ opacity: [0.03, 0.1, 0.03], scale: [1, 1.05, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-stone-400/10 via-transparent to-slate-400/10 pointer-events-none mix-blend-screen"
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
            className="w-1.5 h-1.5 rounded-full bg-stone-300/80 shadow-[0_0_10px_rgba(148,163,184,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.42em] text-stone-200/70 font-light" style={SERIF}>sannyāsa{phase === "name" ? " · name" : phase === "for" ? " · purpose" : phase === "setdown" ? " · set down" : phase === "watch" ? " · watch" : ""}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-stone-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
        </div>
      </div>

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <SannyasaRehearsalCanvas
          phase={phase}
          carried={carried}
          wasFor={wasFor}
          duration={duration}
          absenceTeaches={absenceTeaches}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-md space-y-8 pointer-events-auto">
              <h2 className="text-3xl italic mb-6" style={SERIF}>sannyāsa rehearsal</h2>
              <p className="text-base italic text-white/80 leading-relaxed mb-10 max-w-md mx-auto" style={SERIF}>
                not the robe. not the leaving. the inner move: name something you've carried as "mine" — and set it down, just for a week. what was it for? what will its absence teach?
              </p>
              <motion.button
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-stone-400/60 bg-stone-500/10 text-stone-100 text-sm uppercase tracking-wide hover:bg-stone-500/20 transition shadow-[0_0_24px_rgba(148,163,184,0.2)]"
              >
                begin
              </motion.button>
            </motion.div>
          )}

          {phase === "name" && (
            <motion.div key="n" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.4em] text-stone-200/60 mb-3 text-center" style={SERIF}>name it</div>
              <p className="text-lg italic text-center leading-relaxed mb-6" style={SERIF}>a role · a resentment · a title · a habit · an old story · a plan you no longer believe in.</p>
              <textarea
                value={carried}
                onChange={(e) => send({ type: "SET_CARRIED", value: e.target.value })}
                placeholder="what you've carried…"
                rows={2}
                className="w-full mb-8 bg-white/[0.03] border border-white/15 rounded-xl p-4 text-white/95 placeholder:text-white/25 italic resize-none focus:outline-none focus:border-stone-300/40"
                style={SERIF}
                autoFocus
              />
              <div className="space-y-3">
                <button
                  onClick={handleSpokenCarried}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    listeningCarried ? "border-stone-400/60 bg-stone-500/15 text-stone-100 animate-pulse shadow-[0_0_20px_rgba(148,163,184,0.2)]" : "border-white/15 text-white/40 hover:border-stone-300/50"
                  }`}
                >
                  {listeningCarried ? "● listening — tap to finish" : "speak carried"}
                </button>
              </div>
              <motion.button
                disabled={carried.trim().length < 5}
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-8 py-3 rounded-full border text-sm tracking-wide ${
                  carried.trim().length >= 5 ? "border-stone-400/60 bg-stone-500/10 text-stone-100 hover:bg-stone-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                what has it been for?
              </motion.button>
            </motion.div>
          )}

          {phase === "for" && (
            <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.4em] text-stone-200/60 mb-3 text-center" style={SERIF}>what has it been for?</div>
              <p className="text-lg italic text-center leading-relaxed mb-6" style={SERIF}>identity · income · belonging · a way to feel worthy · a way to stay busy.</p>
              <textarea
                value={wasFor}
                onChange={(e) => send({ type: "SET_FOR", value: e.target.value })}
                placeholder="its function…"
                rows={2}
                className="w-full mb-8 bg-white/[0.03] border border-white/15 rounded-xl p-4 text-white/95 placeholder:text-white/25 italic resize-none focus:outline-none focus:border-stone-300/40"
                style={SERIF}
              />
              <div className="space-y-3">
                <button
                  onClick={handleSpokenFor}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    listeningFor ? "border-stone-400/60 bg-stone-500/15 text-stone-100 animate-pulse shadow-[0_0_20px_rgba(148,163,184,0.2)]" : "border-white/15 text-white/40 hover:border-stone-300/50"
                  }`}
                >
                  {listeningFor ? "● listening — tap to finish" : "speak purpose"}
                </button>
              </div>
              <motion.button
                disabled={wasFor.trim().length < 4}
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-8 py-3 rounded-full border text-sm tracking-wide ${
                  wasFor.trim().length >= 4 ? "border-stone-400/60 bg-stone-500/10 text-stone-100 hover:bg-stone-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                set it down
              </motion.button>
            </motion.div>
          )}

          {phase === "setdown" && (
            <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <p className="text-2xl italic text-white/90 mb-3" style={SERIF}>set it down — for how long?</p>
              <p className="text-sm text-white/50 italic mb-6" style={SERIF}>not renounced. rehearsed. one day, three, or seven.</p>
              <div className="flex justify-center gap-3 mb-8">
                {([1, 3, 7] as const).map((d) => (
                  <button key={d} onClick={() => send({ type: "SET_DURATION", value: d })}
                    className={`px-5 py-3 rounded-full text-sm italic transition ${duration === d ? "bg-white/10 border border-white/60 text-white" : "border border-white/15 text-white/60 hover:bg-white/[0.04]"}`} style={SERIF}>
                    {d} day{d > 1 ? "s" : ""}
                  </button>
                ))}
              </div>
              <motion.button
                disabled={!duration}
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 border border-white/25 rounded-full text-sm tracking-wide hover:bg-white/5 transition disabled:opacity-30"
                style={SERIF}
              >
                what will its absence show?
              </motion.button>
            </motion.div>
          )}

          {phase === "watch" && (
            <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <p className="text-2xl italic text-white/90 mb-3" style={SERIF}>what will the gap teach?</p>
              <textarea
                value={absenceTeaches}
                onChange={(e) => send({ type: "SET_ABSENCE", value: e.target.value })}
                placeholder="the hypothesis…"
                rows={3}
                className="w-full mb-8 bg-white/[0.03] border border-white/15 rounded-xl p-4 text-white/95 placeholder:text-white/25 italic resize-none focus:outline-none focus:border-stone-300/40"
                style={SERIF}
              />
              <div className="space-y-3">
                <button
                  onClick={handleSpokenAbsence}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    listeningAbsence ? "border-stone-400/60 bg-stone-500/15 text-stone-100 animate-pulse shadow-[0_0_20px_rgba(148,163,184,0.2)]" : "border-white/15 text-white/40 hover:border-stone-300/50"
                  }`}
                >
                  {listeningAbsence ? "● listening — tap to finish" : "speak absence"}
                </button>
              </div>
              <motion.button
                disabled={absenceTeaches.trim().length < 6}
                onClick={finish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-8 py-3 rounded-full border text-sm tracking-wide ${
                  absenceTeaches.trim().length >= 6 ? "border-stone-400/60 bg-stone-500/10 text-stone-100 hover:bg-stone-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                seal it
              </motion.button>
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="int" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg text-center space-y-6">
              <p className="text-2xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>rest</p>
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-stone-400/20 to-slate-400/15 blur-xl"
              />
              {absenceTeaches && (
                <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>"{absenceTeaches}"</p>
              )}
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                the thing you carried was never the thing. the practice was the setting down.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-stone-200/70 transition-all duration-500"
      >
        end · save
      </button>
    </div>
  );
}

export default function SannyasaRehearsal() {
  const g = getLabGame("sannyasa-rehearsal")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}