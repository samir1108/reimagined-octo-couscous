// SPEECH FAST — Flagship Grade
// Choose a window (30 / 60 / 120 min). Commit to no unnecessary speech.
// Log each urge to speak, and whether you spoke. The gap between urge and utterance is where freedom lives.
// Multi-sensor: mic (breath/STT), TTS (guru), STT (spoken notes), haptics, sound design
// Canvas: animated fast visualization with urge tracking
// XState: choose → fasting → verdict → integrate

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
import SpeechFastCanvas from "./SpeechFastCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };

type Phase = "choose" | "fasting" | "verdict" | "integrate";

type Urge = { t: number; spoke: boolean; note: string; spoken: boolean };

type Ctx = { durMins: number; urges: Urge[]; note: string };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "BEGIN"; mins: number }
      | { type: "LOG_URGE"; spoke: boolean; note: string }
      | { type: "END_EARLY" }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    begin: assign(({ context, event }) => ({ ...context, durMins: event.mins, urges: [], note: "" })),
    logUrge: assign(({ context, event }) => ({
      ...context,
      urges: [...context.urges, { t: Date.now(), spoke: event.spoke, note: event.note, spoken: false }],
    })),
    endEarly: assign({}),
  },
}).createMachine({
  id: "speechFast",
  initial: "choose",
  context: { durMins: 30, urges: [], note: "" },
  states: {
    choose: { on: { BEGIN: { target: "fasting", actions: "begin" } } },
    fasting: { on: { LOG_URGE: { actions: "logUrge" }, END_EARLY: "verdict", ADVANCE: "verdict" } },
    verdict: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

const OPTIONS = [
  { mins: 30, label: "30 min" },
  { mins: 60, label: "1 hour" },
  { mins: 120, label: "2 hours" },
];

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { durMins, urges, note } = state.context;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [remaining, setRemaining] = useState(0);
  const [localNote, setLocalNote] = useState("");
  const [listeningNote, setListeningNote] = useState(false);
  const [urgeNote, setUrgeNote] = useState("");

  const startRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const endedRef = useRef(false);

  useEffect(() => {
    sd.bed("temple", 0.05);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Timer effect
  useEffect(() => {
    if (phase !== "fasting") return;
    timerRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const left = Math.max(0, durMins * 60 - elapsed);
      setRemaining(left);
      if (left <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        send({ type: "ADVANCE" });
      }
    }, 500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, durMins]);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "choose") {
        sd.chime("rise", 0.06);
        await say("choose a window. no unnecessary speech. safety words are fine. everything else — hold.", "guru");
      } else if (phase === "fasting" && !cancelled) {
        sd.chime("rise", 0.08);
        await say(`you chose ${durMins} minutes. when the urge to speak arises, tap it. notice: was this needed, or was it fear filling silence?`, "guru");
      } else if (phase === "verdict" && !cancelled) {
        sd.chime("drop", 0.1);
        const held = urges.filter(u => !u.spoke).length;
        const spoke = urges.filter(u => u.spoke).length;
        const restraint = urges.length > 0 ? Math.round((held / urges.length) * 100) : 100;
        await say(`the fast ends. ${urges.length} urges. ${held} held. ${spoke} spoke. restraint: ${restraint} percent.`, "guru");
      } else if (phase === "integrate") {
        sd.chime("drop", 0.12);
        stopVoice();
        await say("every held urge was a spot where you saw the impulse before it became action. that gap — impulse to action — is the whole practice. it widens every time you notice it.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase, urges]);

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    transcribe.cancel();
    sd.stopBed();
    stopVoice();

    const held = urges.filter(u => !u.spoke).length;
    const spoke = urges.filter(u => u.spoke).length;
    const total = urges.length;
    const restraint = total > 0 ? Math.round((held / total) * 100) : 100;
    const completedMins = Math.round((durMins * 60 - remaining) / 60);

    onEnd({
      outcome: remaining <= 0 ? "completed" : "abandoned",
      signals: {
        window_mins: durMins,
        completed_mins: completedMins,
        urges: total,
        held,
        spoke,
        restraint_pct: restraint,
      },
    });
  }, [onEnd, urges, durMins, remaining, stopVoice, sd]);

  const begin = useCallback((mins: number) => {
    send({ type: "BEGIN", mins });
    startRef.current = Date.now();
    setRemaining(mins * 60);
    buzz("tap");
  }, []);

  const logUrge = useCallback((spoke: boolean) => {
    const n = urgeNote.trim() || note.trim();
    send({ type: "LOG_URGE", spoke, note: n });
    setUrgeNote("");
    setLocalNote("");
    buzz("tap");
  }, []);

  const handleEndEarly = useCallback(() => {
    send({ type: "END_EARLY" });
    buzz("tap");
  }, []);

  const handleSpokenNote = async () => {
    try { await transcribe.start(); setListeningNote(true); } catch {}
  };
  const stopSpokenNote = async () => {
    setListeningNote(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) setUrgeNote(r.transcript.trim());
  };

  const secs = Math.ceil(remaining);
  const mm = Math.floor(secs / 60);
  const ss = secs % 60;
  const held = urges.filter(u => !u.spoke).length;
  const spoke = urges.filter(u => u.spoke).length;
  const restraint = urges.length > 0 ? Math.round((held / urges.length) * 100) : 100;

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.04, 0.14, 0.04], y: [0, -12, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-indigo-950/25 via-black to-slate-950/25 pointer-events-none"
      />
      {/* Aurora — indigo/slate */}
      <motion.div
        animate={{ opacity: [0.03, 0.12, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-indigo-400/15 via-transparent to-slate-400/10 pointer-events-none mix-blend-screen"
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
            className="w-1.5 h-1.5 rounded-full bg-indigo-300/80 shadow-[0_0_10px_rgba(125,211,252,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.5em] text-indigo-200/70 font-light" style={SERIF}>
            speech fast{phase === "fasting" ? ` · ${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-indigo-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
        </div>
      </div>

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <SpeechFastCanvas
          phase={phase}
          urges={urges}
          remaining={remaining}
          durMins={durMins}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "choose" && (
            <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-lg space-y-8 pointer-events-auto">
              <h2 className="text-3xl italic mb-6" style={SERIF}>choose a window · no unnecessary speech</h2>
              <p className="text-base italic text-white/80 leading-relaxed max-w-md mx-auto mb-10" style={SERIF}>
                safety words are fine. everything else — hold. when the urge to speak arises, tap it. notice: was this needed, or was it fear filling silence?
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                {OPTIONS.map((o) => (
                  <motion.button
                    key={o.mins}
                    onClick={() => { send({ type: "BEGIN", mins: o.mins }); startRef.current = Date.now(); setRemaining(o.mins * 60); buzz("tap"); }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 rounded-full border border-white/25 text-sm uppercase tracking-[0.3em] hover:bg-white/5 hover:border-indigo-300/60"
                    style={SERIF}
                  >
                    {o.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === "fasting" && (
            <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-2xl space-y-8 pointer-events-auto">
              <div className="mb-6 h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  animate={{ width: `${(remaining / (durMins * 60)) * 100}%` }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-indigo-400/70"
                />
              </div>
              <p className="text-5xl italic tabular-nums mb-2" style={SERIF}>
                {String(Math.floor(remaining / 60)).padStart(2, "0")}:{String(remaining % 60).padStart(2, "0")}
              </p>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40 mb-8" style={SERIF}>
                held: {urges.filter(u => !u.spoke).length} · spoke: {urges.filter(u => u.spoke).length}
              </p>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    value={urgeNote}
                    onChange={(e) => setUrgeNote(e.target.value)}
                    placeholder="what wanted to be said?"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-base italic focus:outline-none focus:border-indigo-300/40"
                    style={SERIF}
                  />
                  <button
                    onClick={handleSpokenNote}
                    className={`px-4 py-3 rounded-xl border text-xs uppercase tracking-wide ${
                      listeningNote ? "border-indigo-400/60 bg-indigo-500/15 text-indigo-100 animate-pulse shadow-[0_0_20px_rgba(125,211,252,0.2)]" : "border-white/15 text-white/40 hover:border-indigo-300/50"
                    }`}
                  >
                    {listeningNote ? "● listening — tap to finish" : "speak note"}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 justify-center mb-4">
                <motion.button
                  onClick={() => { send({ type: "LOG_URGE", spoke: false, note: urgeNote.trim() || note.trim() }); setUrgeNote(""); setLocalNote(""); buzz("tap"); }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 rounded-full border border-emerald-300/40 text-xs uppercase tracking-[0.3em] hover:bg-emerald-400/10 text-emerald-100/90"
                  style={SERIF}
                >
                  urge · held
                </motion.button>
                <motion.button
                  onClick={() => { send({ type: "LOG_URGE", spoke: true, note: urgeNote.trim() || note.trim() }); setUrgeNote(""); setLocalNote(""); buzz("tap"); }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 rounded-full border border-rose-300/40 text-xs uppercase tracking-[0.3em] hover:bg-rose-400/10 text-rose-100/90"
                  style={SERIF}
                >
                  urge · spoke
                </motion.button>
              </div>

              <ul className="max-h-48 overflow-y-auto text-left space-y-1.5 mb-4">
                {urges.slice().reverse().map((u, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`text-sm italic px-3 py-1.5 rounded-lg border ${u.spoke ? "text-rose-100/80 border-rose-300/20 bg-rose-400/10" : "text-emerald-100/80 border-emerald-300/20 bg-emerald-400/10"}`}
                    style={SERIF}
                  >
                    <span className="text-xs text-white/40 mr-2">{String(Math.floor(u.t / 60)).padStart(2, "0")}:{String(u.t % 60).padStart(2, "0")}</span>
                    {u.spoke ? "spoke" : "held"}{u.note ? ` — ${u.note}` : ""}
                  </motion.li>
                ))}
              </ul>

              <motion.button
                onClick={() => { send({ type: "END_EARLY" }); buzz("tap"); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-[10px] uppercase tracking-[0.4em] text-white/40 hover:text-white/70"
                style={SERIF}
              >
                end early
              </motion.button>
            </motion.div>
          )}

          {phase === "verdict" && (
            <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-lg text-center space-y-8 pointer-events-auto">
              <p className="text-[10px] uppercase tracking-[0.5em] text-indigo-200/60 mb-4" style={SERIF}>restraint</p>
              <p className="text-6xl italic mb-2" style={SERIF}>{urges.length > 0 ? Math.round((urges.filter(u => !u.spoke).length / urges.length) * 100) : 100}<span className="text-2xl">%</span></p>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-8" style={SERIF}>
                {urges.length} urges · {urges.filter(u => !u.spoke).length} held · {urges.filter(u => u.spoke).length} spoke
              </p>
              <p className="text-base italic text-white/85 leading-relaxed max-w-md mx-auto mb-8" style={SERIF}>
                every held urge was a spot where you saw the impulse before it became action. that gap — impulse to action — is the whole practice. it widens every time you notice it.
              </p>
              <motion.button
                onClick={finish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-indigo-400/60 bg-indigo-500/10 text-indigo-100 text-sm uppercase tracking-wide hover:bg-indigo-500/20 transition shadow-[0_0_24px_rgba(125,211,252,0.2)]"
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
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-indigo-400/20 to-slate-400/15 blur-xl"
              />
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                every held urge was a spot where you saw the impulse before it became action. that gap — impulse to action — is the whole practice. it widens every time you notice it.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-indigo-200/70 transition-all duration-500"
      >
        end · save
      </button>
    </div>
  );
}

export default function SpeechFast() {
  const g = getLabGame("speech-fast")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}