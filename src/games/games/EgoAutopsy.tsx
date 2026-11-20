// EGO AUTOPSY — Flagship Grade
// The obituary of the "you" who will not survive the next decade.
// Five prompts. Each cuts one attachment. Read back — mark what still grips.
// Multi-sensor: mic (breath/STT), TTS (guru), STT (spoken drafts), haptics, sound design
// Canvas: animated autopsy visualization with cutting metaphor
// XState: intro → write (5 cuts) → read → verdict → integrate

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
import EgoAutopsyCanvas from "./EgoAutopsyCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };

const PROMPTS = [
  "Name one identity you cling to. (father, founder, seeker, victim…)",
  "Name one achievement you still quote to yourself in the dark.",
  "Name one grudge you rehearse when alone.",
  "Name one fear that has shaped a decade of your choices.",
  "Name one story about yourself that is no longer true — but you still tell it.",
];

type Phase = "intro" | "write" | "read" | "verdict" | "integrate";

type Ctx = { entries: string[]; grips: boolean[]; round: number };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "SUBMIT"; value: string }
      | { type: "TOGGLE_GRIP"; index: number }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    submit: assign(({ context, event }) => ({
      entries: [...context.entries, event.value],
      round: context.round + 1,
    })),
    toggleGrip: assign(({ context, event }) => ({
      ...context,
      grips: context.grips.map((v, i) => i === event.index ? !v : v),
    })),
  },
}).createMachine({
  id: "egoAutopsy",
  initial: "intro",
  context: { entries: [], grips: [], round: 0 },
  states: {
    intro: { on: { ADVANCE: "write" } },
    write: { on: { SUBMIT: [
          { actions: "submit", target: "write", guard: ({ context }) => context.round < 4 },
          { actions: "submit", target: "read", guard: ({ context }) => context.round >= 4 },
        ] } },
    read: { on: { TOGGLE_GRIP: { actions: "toggleGrip" }, ADVANCE: "verdict" } },
    verdict: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { entries, grips, round } = state.context;

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
    sd.bed("void", 0.04);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // STT for spoken entry
  useEffect(() => {
    if (phase !== "write") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setEntry(t);
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "intro") {
        sd.chime("rise", 0.06);
        await say("the autopsy begins. the you writing this will not survive the next decade unchanged. five cuts. name what you still cling to.", "guru");
      } else if (phase === "write" && !cancelled) {
        sd.chime("rise", 0.08);
        await say(`cut ${round + 1} of 5. ${PROMPTS[round]}`, "guru");
        if (!cancelled) {
          await new Promise(r => setTimeout(r, 500));
          if (!cancelled) {
            try { await transcribe.start(); setListeningEntry(true); } catch {}
          }
        }
      } else if (phase === "read" && !cancelled) {
        sd.chime("drop", 0.08);
        await say("read your own obituary. tap the lines that still grip. those are the ones that will write the next decade — unless you meet them again, awake.", "guru");
      } else if (phase === "verdict" && !cancelled) {
        sd.chime("drop", 0.1);
        const gripCount = state.context.grips.filter(Boolean).length;
        await say(`five attachments named. ${gripCount} still grip. those are the ones that will write the next decade — unless you meet them again, awake.`, "guru");
      } else if (phase === "integrate") {
        sd.chime("drop", 0.12);
        stopVoice();
        await say("the autopsy was never about death. it was about the living who witness what dies.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase, round]);

  // STT for spoken entry
  useEffect(() => {
    if (phase !== "write") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setEntry(t);
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  const handleSubmit = useCallback(() => {
    const v = entry.trim();
    if (v.length < 3) return;
    send({ type: "SUBMIT", value: v });
    setEntry("");
    buzz("tap");
  }, [entry]);

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    sd.stopBed();
    stopVoice();

    const gripCount = state.context.grips.filter(Boolean).length;
    const avgLen = state.context.entries.length
      ? Math.round(state.context.entries.reduce((a, r) => a + r.length, 0) / state.context.entries.length)
      : 0;

    onEnd({
      outcome: state.context.entries.length >= 5 ? "completed" : "abandoned",
      signals: {
        duration_ms: Date.now() - startedAt.current,
        attachments_named: state.context.entries.length,
        still_gripping: gripCount,
        avg_line_chars: avgLen,
        total_ms: Date.now() - startedAt.current,
      },
    });
  }, [onEnd, stopVoice, sd]);

  const handleSpokenEntry = async () => {
    try { await transcribe.start(); setListeningEntry(true); } catch {}
  };
  const stopSpokenEntry = async () => {
    setListeningEntry(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) setEntry(r.transcript.trim());
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.04, 0.12, 0.04], y: [0, -12, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-slate-950/30 via-black to-neutral-950/30 pointer-events-none"
      />
      {/* Aurora — slate */}
      <motion.div
        animate={{ opacity: [0.03, 0.12, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-slate-400/15 via-transparent to-neutral-400/10 pointer-events-none mix-blend-screen"
      />
      {/* Aurora — rose offset */}
      <motion.div
        animate={{ opacity: [0.02, 0.08, 0.02], scale: [1, 1.05, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
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
          <span className="text-[10px] uppercase tracking-[0.5em] text-slate-200/70 font-light" style={SERIF}>ego autopsy · {phase === "write" ? `${state.context.round + 1} / 5` : "the reading"}</span>
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
        <EgoAutopsyCanvas
          phase={phase}
          round={state.context.round}
          entries={state.context.entries}
          grips={state.context.grips}
          breathEnvelope={0}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="i" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center max-w-lg space-y-8 pointer-events-auto">
              <h2 className="text-3xl italic mb-6" style={SERIF}>the autopsy</h2>
              <p className="text-base italic text-white/80 leading-relaxed max-w-md mx-auto mb-10" style={SERIF}>
                the you writing this will not survive the next decade unchanged. something has to die for the next one to arrive.
                <br /><br />
                five prompts. name what you still cling to. then read your own obituary back — and see what still grips.
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

          {phase === "write" && (
            <motion.div key={`w-${state.context.round}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-2xl space-y-8 pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.4em] text-slate-200/60 mb-3 text-center" style={SERIF}>cut {state.context.round + 1} of 5</div>
              <p className="text-lg italic text-center leading-relaxed mb-8" style={SERIF}>{PROMPTS[state.context.round]}</p>
              <textarea
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                rows={3}
                placeholder="one line, honest…"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-base italic focus:outline-none focus:border-slate-300/40 mb-4 resize-none"
                style={SERIF}
              />
              <div className="space-y-3">
                <button
                  onClick={handleSpokenEntry}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    listeningEntry ? "border-slate-400/60 bg-slate-500/15 text-slate-100 animate-pulse shadow-[0_0_20px_rgba(148,163,184,0.2)]" : "border-white/15 text-white/40 hover:border-slate-300/50"
                  }`}
                >
                  {listeningEntry ? "● listening — tap to finish" : "speak entry"}
                </button>
              </div>
              <motion.button
                disabled={entry.trim().length < 3}
                onClick={() => { send({ type: "SUBMIT", value: entry }); setEntry(""); buzz("tap"); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-6 py-3 rounded-full border text-xs uppercase tracking-[0.4em] ${
                  entry.trim().length >= 3 ? "border-slate-400/60 bg-slate-500/10 text-slate-100 hover:bg-slate-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                {state.context.round >= 4 ? "read the obituary" : "next cut"}
              </motion.button>
            </motion.div>
          )}

          {phase === "read" && (
            <motion.div key="rd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-lg space-y-8 pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.4em] text-slate-200/60 mb-6 text-center" style={SERIF}>read each line. tap the ones that still grip.</div>
              <ul className="space-y-3 mb-8">
                {state.context.entries.map((r, i) => (
                  <li key={i}>
                    <button
                      onClick={() => send({ type: "TOGGLE_GRIP", index: i })}
                      className={`w-full text-left px-4 py-3 rounded-xl border italic text-base leading-relaxed ${
                        grips[i]
                          ? "border-amber-400/50 bg-amber-400/10 text-amber-100"
                          : "border-white/15 bg-white/5 hover:border-white/30"
                      }`}
                      style={SERIF}
                    >
                      <span className="text-white/40 text-xs mr-2">{i + 1}.</span>{state.context.entries[i]}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="text-center">
                <motion.button
                  onClick={() => send({ type: "ADVANCE" })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 rounded-full border-2 border-slate-400/60 bg-slate-500/10 text-slate-100 text-sm uppercase tracking-wide hover:bg-slate-500/20 transition shadow-[0_0_24px_rgba(148,163,184,0.2)]"
                >
                  close the autopsy
                </motion.button>
              </div>
            </motion.div>
          )}

          {phase === "verdict" && (
            <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-lg text-center">
              <div className="text-[10px] uppercase tracking-[0.5em] text-slate-200/60 mb-4" style={SERIF}>the verdict</div>
              <p className="text-xl italic leading-relaxed mb-8" style={SERIF}>
                five attachments named. {grips.filter(Boolean).length} still grip. those are the ones that will write the next decade — unless you meet them again, awake.
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
            <motion.div key="int" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg text-center space-y-6">
              <p className="text-2xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>rest</p>
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-slate-400/20 to-neutral-400/15 blur-xl"
              />
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                the autopsy was never about death. it was about the living who witness what dies.
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

export default function EgoAutopsy() {
  const g = getLabGame("ego-autopsy")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}