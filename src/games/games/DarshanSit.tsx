// DARSHAN SIT — Flagship Grade
// Darśana: not seeing an image. Being seen by it. Pick a
// face — a teacher, a mother, a mūrti, the sky. Look at
// its imagined eyes for 60s without arranging yourself for
// its gaze. Then reverse: let it look at you. Notice which
// direction is harder.
// Multi-sensor: mic (breath/STT), TTS (guru), STT (spoken reflection), haptics, sound design
// Canvas: animated gaze visualization with dual-direction tracking
// XState: intro → pick → look (60s) → beseen (60s) → compare → integrate

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
import DarshanSitCanvas from "./DarshanSitCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };
const GAZE_SECONDS = 60;

type Phase = "intro" | "pick" | "look" | "beseen" | "compare" | "integrate";

type Ctx = { face: string; harder: "looking" | "beseen" | "same" | null; note: string };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "SET_FACE"; value: string }
      | { type: "SET_HARDER"; value: "looking" | "beseen" | "same" }
      | { type: "SET_NOTE"; value: string }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    setFace: assign(({ context, event }) => ({ ...context, face: event.value })),
    setHarder: assign(({ context, event }) => ({ ...context, harder: event.value })),
    setNote: assign(({ context, event }) => ({ ...context, note: event.value })),
  },
}).createMachine({
  id: "darshanSit",
  initial: "intro",
  context: { face: "", harder: null, note: "" },
  states: {
    intro: { on: { ADVANCE: "pick" } },
    pick: { on: { SET_FACE: { actions: "setFace" }, ADVANCE: { target: "look", guard: ({ context }) => context.face.trim().length >= 3 } } },
    look: { on: { ADVANCE: "beseen" } },
    beseen: { on: { ADVANCE: "compare" } },
    compare: { on: { SET_HARDER: { actions: "setHarder" }, SET_NOTE: { actions: "setNote" }, ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { face, harder, note } = state.context;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [remain, setRemain] = useState(GAZE_SECONDS);
  const [noteListening, setNoteListening] = useState(false);
  const [reflection, setReflection] = useState("");

  const timerRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const endedRef = useRef(false);

  useEffect(() => {
    sd.bed("temple", 0.05);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Timer effect
  useEffect(() => {
    if (phase !== "look" && phase !== "beseen") return;
    timerRef.current = window.setInterval(() => {
      setRemain((r) => {
        if (r <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          send({ type: "ADVANCE" });
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "pick") {
        sd.chime("rise", 0.06);
        await say("pick a face — a teacher, a mother, a mūrti, the sky. look at its imagined eyes for sixty seconds. don't arrange yourself for its gaze.", "guru");
      } else if (phase === "look") {
        sd.chime("rise", 0.08);
        await say("you look at them. rest your gaze on their imagined eyes. don't perform. don't look away.", "guru");
      } else if (phase === "beseen") {
        sd.chime("drop", 0.08);
        await say("now — they look at you. let them see you as you are, unarranged.", "guru");
      } else if (phase === "compare") {
        sd.chime("drop", 0.1);
        await say("which direction was harder — looking at them, or being seen by them? speak it.", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setNoteListening(true); } catch {}
        }
      } else if (phase === "integrate") {
        if (noteListening) {
          setNoteListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setReflection(r.transcript.trim().slice(0, 200));
        }
        sd.chime("drop", 0.12);
        stopVoice();
        await say("the gaze goes both ways. the one who sees and the one who is seen — neither is the master.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  // STT for reflection
  useEffect(() => {
    if (phase !== "compare") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setNote(t);
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
      outcome: harder && note.trim().length >= 4 ? "completed" : "abandoned",
      signals: {
        face: face.trim(),
        harderDirection: harder ?? "",
        reflection: reflection.trim(),
        total_ms: Date.now() - startRef.current,
      },
    });
  }, [onEnd, face, harder, reflection, stopVoice, sd]);

  const handleSpokenNote = async () => {
    try { await transcribe.start(); setNoteListening(true); } catch {}
  };
  const stopSpokenNote = async () => {
    setNoteListening(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) send({ type: "SET_NOTE", value: r.transcript.trim().slice(0, 200) });
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-rose-900/15 via-black to-amber-900/15 pointer-events-none"
      />
      {/* Aurora — rose/amber */}
      <motion.div
        animate={{ opacity: [0.03, 0.1, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-rose-400/15 via-transparent to-amber-400/10 pointer-events-none mix-blend-screen"
      />
      {/* Aurora — cyan offset */}
      <motion.div
        animate={{ opacity: [0.02, 0.08, 0.02], scale: [1, 1.05, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 via-transparent to-transparent pointer-events-none mix-blend-screen"
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
            className="w-1.5 h-1.5 rounded-full bg-rose-300/80 shadow-[0_0_10px_rgba(251,113,133,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.42em] text-rose-200/70 font-light" style={SERIF}>darśana{phase === "look" || phase === "beseen" ? ` · ${remain}s` : ""}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-rose-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
        </div>
      </div>

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <DarshanSitCanvas
          phase={phase}
          face={face}
          remain={remain}
          harder={harder}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-md space-y-8 pointer-events-auto">
              <h2 className="text-3xl italic mb-6" style={SERIF}>darśana</h2>
              <p className="text-base italic text-white/80 leading-relaxed mb-10 max-w-md mx-auto" style={SERIF}>
                not seeing an image. being seen by it. pick a face — a teacher, a mother, a mūrti, the sky. look at its imagined eyes for 60s without arranging yourself for its gaze. then reverse: let it look at you. notice which direction is harder.
              </p>
              <motion.button
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-rose-400/60 bg-rose-500/10 text-rose-100 text-sm uppercase tracking-wide hover:bg-rose-500/20 transition shadow-[0_0_24px_rgba(251,113,133,0.2)]"
              >
                begin
              </motion.button>
            </motion.div>
          )}

          {phase === "pick" && (
            <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-md pointer-events-auto">
              <p className="text-2xl italic text-white/90 mb-3" style={SERIF}>whose face — real or imagined — will hold the seat?</p>
              <p className="text-sm text-white/50 italic mb-6" style={SERIF}>a teacher · a grandmother · a mūrti · the moon · a friend who saw you clearly.</p>
              <input value={face} onChange={(e) => send({ type: "SET_FACE", value: e.target.value })}
                placeholder="the face…"
                className="w-full mb-8 bg-white/[0.03] border border-white/15 rounded-xl p-4 text-white/95 placeholder:text-white/25 italic focus:outline-none focus:border-rose-300/40 text-center" style={SERIF} />
              <motion.button
                disabled={face.trim().length < 3}
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-rose-400/60 bg-rose-500/10 text-rose-100 text-sm uppercase tracking-wide hover:bg-rose-500/20 transition shadow-[0_0_24px_rgba(251,113,133,0.2)]"
              >
                begin
              </motion.button>
            </motion.div>
          )}

          {phase === "look" && (
            <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <p className="text-xs uppercase tracking-[0.42em] text-white/40 mb-6" style={SERIF}>you look — at them</p>
              <motion.div
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-radial from-rose-200/40 via-rose-500/10 to-transparent"
              />
              <div className="text-6xl italic text-white/85 mb-2" style={SERIF}>{remain}</div>
              <p className="text-sm text-white/50 italic mt-4" style={SERIF}>rest your gaze on their imagined eyes. don't perform.</p>
            </motion.div>
          )}

          {phase === "beseen" && (
            <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <p className="text-xs uppercase tracking-[0.42em] text-white/40 mb-6" style={SERIF}>now — they look at you</p>
              <motion.div
                animate={{ opacity: [0.5, 0.95, 0.5], scale: [1, 1.08, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-radial from-amber-200/60 via-amber-500/20 to-transparent"
              />
              <div className="text-6xl italic text-white/85 mb-2" style={SERIF}>{remain}</div>
              <p className="text-sm text-white/50 italic mt-4" style={SERIF}>let them see you — as you are, unarranged.</p>
            </motion.div>
          )}

          {phase === "compare" && (
            <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <p className="text-2xl italic text-white/90 mb-6" style={SERIF}>which direction was harder?</p>
              <div className="flex flex-col gap-3 mb-6">
                {([["looking","looking at them"],["beseen","being seen by them"],["same","the same"]] as const).map(([id,label]) => (
                  <button key={id} onClick={() => { send({ type: "SET_HARDER", value: id }); buzz("tap"); }}
                    className={`px-5 py-4 rounded-xl border italic text-white/90 transition ${harder===id ? "border-white/60 bg-white/5" : "border-white/15 hover:bg-white/[0.04]"}`} style={SERIF}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleSpokenNote}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    noteListening ? "border-rose-400/60 bg-rose-500/15 text-rose-100 animate-pulse shadow-[0_0_20px_rgba(251,113,133,0.2)]" : "border-white/15 text-white/40 hover:border-rose-300/50"
                  }`}
                >
                  {noteListening ? "● listening — tap to finish" : "speak reflection"}
                </button>
              </div>
              <motion.button
                disabled={!harder || note.trim().length < 4}
                onClick={finish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-rose-400/60 bg-rose-500/10 text-rose-100 text-sm uppercase tracking-wide hover:bg-rose-500/20 transition shadow-[0_0_24px_rgba(251,113,133,0.2)]"
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
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-rose-400/20 to-amber-400/15 blur-xl"
              />
              {reflection && (
                <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>"{reflection}"</p>
              )}
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                the gaze goes both ways. the one who sees and the one who is seen — neither is the master.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-rose-200/70 transition-all duration-500"
      >
        end · save
      </button>
    </div>
  );
}

export default function DarshanSit() {
  const g = getLabGame("darshan-sit")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}