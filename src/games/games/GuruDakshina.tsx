// GURU DAKSHINA — Flagship Grade
// Traditional student's offering after teaching. Here: what will
// you give — not to a person, to the practice itself — in
// exchange for what it has revealed? Pick a teaching. Name what
// you received. Name the offering. Set the date.
// Multi-sensor: mic (breath/STT), TTS (guru), STT (spoken entries), haptics, sound design
// Canvas: animated offering visualization with seal animation
// XState: intro → received → offering → when → seal → integrate

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
import GuruDakshinaCanvas from "./GuruDakshinaCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };

const WINDOWS = [
  { key: "24h",   label: "within 24 hours" },
  { key: "week",  label: "this week" },
  { key: "month", label: "this month" },
] as const;
type WindowKey = typeof WINDOWS[number]["key"];

type Phase = "intro" | "received" | "offering" | "when" | "seal" | "integrate";

type Ctx = { received: string; offering: string; when: WindowKey };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "SET_RECEIVED"; value: string }
      | { type: "SET_OFFERING"; value: string }
      | { type: "SET_WHEN"; value: WindowKey }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    setReceived: assign(({ context, event }) => ({ ...context, received: event.value })),
    setOffering: assign(({ context, event }) => ({ ...context, offering: event.value })),
    setWhen: assign(({ context, event }) => ({ ...context, when: event.value })),
  },
}).createMachine({
  id: "guruDakshina",
  initial: "intro",
  context: { received: "", offering: "", when: "week" },
  states: {
    intro: { on: { ADVANCE: "received" } },
    received: { on: { SET_RECEIVED: { actions: "setReceived" }, ADVANCE: { target: "offering", guard: ({ context }) => context.received.trim().length >= 6 } } },
    offering: { on: { SET_OFFERING: { actions: "setOffering" }, ADVANCE: { target: "when", guard: ({ context }) => context.offering.trim().length >= 6 } } },
    when: { on: { SET_WHEN: { actions: "setWhen" }, ADVANCE: "seal" } },
    seal: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { received, offering, when } = state.context;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [listeningReceived, setListeningReceived] = useState(false);
  const [listeningOffering, setListeningOffering] = useState(false);

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
        await say("guru dakṣiṇā — the student's offering to the practice. what did you receive? what will you give back?", "guru");
      } else if (phase === "offering" && !cancelled) {
        sd.chime("drop", 0.08);
        await say("what will you give back? an act. small, specific, costly enough to feel. speak it.", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setListeningOffering(true); } catch {}
        }
      } else if (phase === "when" && !cancelled) {
        sd.chime("drop", 0.08);
        await say("by when? this month, this week, today. the deadline is the discipline.", "guru");
      } else if (phase === "seal" && !cancelled) {
        sd.chime("drop", 0.1);
        await say(`sealed. your offering: ${offering}. by ${WINDOWS.find(w => w.key === when)?.label}. the practice remembers.`, "guru");
      } else if (phase === "integrate") {
        sd.chime("drop", 0.12);
        stopVoice();
        await say("the offering was never for the guru. it was for the part of you that needed to give.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase, offering, when]);

  // STT for offering
  useEffect(() => {
    if (phase !== "offering") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setOffering(t);
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
      outcome: received.trim().length >= 6 && offering.trim().length >= 6 ? "completed" : "abandoned",
      signals: {
        received: received.trim(),
        offering: offering.trim(),
        window: when,
        sealed_at: new Date().toISOString(),
        total_ms: Date.now() - startedAt.current,
      },
    });
  }, [onEnd, received, offering, when, stopVoice, sd]);

  const handleSpokenOffering = async () => {
    try { await transcribe.start(); setListeningOffering(true); } catch {}
  };
  const stopSpokenOffering = async () => {
    setListeningOffering(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) setOffering(r.transcript.trim());
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.14, 0.24, 0.14] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-amber-900/25 via-black to-black pointer-events-none"
      />
      {/* Aurora — amber */}
      <motion.div
        animate={{ opacity: [0.04, 0.12, 0.04], scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-amber-400/15 via-transparent to-transparent pointer-events-none mix-blend-screen"
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
          <span className="text-[10px] uppercase tracking-[0.42em] text-amber-200/70 font-light" style={SERIF}>dakshina · {phase === "received" ? "received" : phase === "offering" ? "offering" : phase === "when" ? "deadline" : "sealed"}</span>
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
        <GuruDakshinaCanvas
          phase={phase}
          received={received}
          offering={offering}
          when={when}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-md space-y-8 pointer-events-auto">
              <h2 className="text-3xl italic mb-6" style={SERIF}>dakṣiṇā</h2>
              <p className="text-base italic text-white/80 leading-relaxed mb-10 max-w-md mx-auto" style={SERIF}>
                guru dakṣiṇā — the student's offering to the practice. what did you receive? what will you give back?
              </p>
              <motion.button
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-amber-400/60 bg-amber-500/10 text-amber-100 text-sm uppercase tracking-wide hover:bg-amber-500/20 transition shadow-[0_0_24px_rgba(251,191,36,0.2)]"
              >
                begin
              </motion.button>
            </motion.div>
          )}

          {phase === "received" && (
            <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <p className="text-2xl italic text-white/95 mb-3" style={SERIF}>what did the practice give you?</p>
              <p className="text-sm text-white/50 italic mb-6" style={SERIF}>not what you wanted — what actually arrived.</p>
              <textarea
                value={received}
                onChange={(e) => send({ type: "SET_RECEIVED", value: e.target.value })}
                placeholder="a shift, a seeing, a rest…"
                rows={4}
                className="w-full bg-white/[0.03] border border-white/15 rounded-xl p-4 text-white/95 placeholder:text-white/25 italic resize-none focus:outline-none focus:border-amber-300/40 mb-6"
                style={SERIF}
                autoFocus
              />
              <button disabled={received.trim().length < 6} onClick={() => send({ type: "ADVANCE" })}
                className="px-8 py-3 rounded-full border-2 border-amber-400/60 bg-amber-500/10 text-amber-100 text-sm uppercase tracking-wide hover:bg-amber-500/20 transition shadow-[0_0_24px_rgba(251,191,36,0.2)]"
              >
                offer in return
              </button>
            </motion.div>
          )}

          {phase === "offering" && (
            <motion.div key="o" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.4em] text-amber-200/60 mb-3 text-center" style={SERIF}>what will you give back?</div>
              <p className="text-lg italic text-center leading-relaxed mb-6" style={SERIF}>an act. small, specific, costly enough to feel.</p>
              <textarea
                value={offering}
                onChange={(e) => send({ type: "SET_OFFERING", value: e.target.value })}
                placeholder="a kindness, an honesty, a refusal, a service…"
                rows={4}
                className="w-full bg-white/[0.03] border border-white/15 rounded-xl p-4 text-white/95 placeholder:text-white/25 italic resize-none focus:outline-none focus:border-amber-300/40 mb-6"
                style={SERIF}
              />
              <div className="space-y-3">
                <button
                  onClick={handleSpokenOffering}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    listeningOffering ? "border-amber-400/60 bg-amber-500/15 text-amber-100 animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.2)]" : "border-white/15 text-white/40 hover:border-amber-300/50"
                  }`}
                >
                  {listeningOffering ? "● listening — tap to finish" : "speak offering"}
                </button>
              </div>
              <button disabled={offering.trim().length < 6} onClick={() => send({ type: "ADVANCE" })}
                className="px-8 py-3 rounded-full border border-white/25 rounded-full text-sm tracking-wide hover:bg-white/5 transition disabled:opacity-30"
                style={SERIF}
              >
                by when
              </button>
            </motion.div>
          )}

          {phase === "when" && (
            <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <p className="text-2xl italic text-white/95 mb-8" style={SERIF}>by when will it be done?</p>
              <div className="flex flex-col gap-3 mb-8">
                {WINDOWS.map((w) => (
                  <button key={w.key} onClick={() => send({ type: "SET_WHEN", value: w.key })}
                    className={`px-6 py-3 rounded-full border text-sm italic transition ${when === w.key ? "border-amber-200/60 bg-amber-500/10 text-amber-100/95" : "border-white/20 text-white/70 hover:bg-white/5"}`}
                    style={SERIF}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
              <button onClick={() => send({ type: "ADVANCE" })}
                className="px-8 py-3 rounded-full border border-amber-200/40 rounded-full text-sm tracking-wide hover:bg-amber-100/10 transition"
                style={SERIF}
              >
                seal
              </button>
            </motion.div>
          )}

          {phase === "seal" && (
            <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md text-center">
              <p className="text-xs uppercase tracking-[0.42em] text-amber-100/60 mb-6" style={SERIF}>sealed</p>
              <p className="text-xl italic text-white/90 mb-2" style={SERIF}>"{offering.trim()}"</p>
              <p className="text-sm text-white/55 italic mb-10" style={SERIF}>{WINDOWS.find((w) => w.key === when)?.label}</p>
              <button onClick={finish}
                className="px-8 py-3 border border-amber-200/40 rounded-full text-sm tracking-wide hover:bg-amber-100/10 transition">
                complete
              </button>
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="int" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg text-center space-y-6">
              <p className="text-2xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>rest</p>
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-b from-amber-400/20 to-transparent blur-xl"
              />
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                the offering was never for the guru. it was for the part of you that needed to give.
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

export default function GuruDakshina() {
  const g = getLabGame("guru-dakshina")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}