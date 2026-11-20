// KARMA LEDGER — Flagship Grade
// You log the last 24 hours as a ledger. Each entry: an action,
// tagged skillful / unskillful / neutral, with a one-line reason.
// Multi-sensor: mic (breath/voice), TTS (guru), STT (spoken entries), haptics, sound design
// Canvas: animated karma balance visualization with particle flow
// XState: intro → log (add entries) → review → verdict → integrate

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, BookOpen, Scale, X } from "lucide-react";
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
import KarmaLedgerCanvas from "./KarmaLedgerCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };

type Tag = "skillful" | "unskillful" | "neutral";
interface Entry { text: string; tag: Tag; reason: string; ts: number; spoken: boolean; }
type Phase = "intro" | "log" | "review" | "verdict" | "integrate";

type Ctx = { entries: Entry[]; totals: Record<Tag, number> };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "ADD_ENTRY"; entry: Entry }
      | { type: "REMOVE_ENTRY"; index: number }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    addEntry: assign(({ context, event }) => {
      const newEntries = [...context.entries, event.entry];
      const totals = { ...context.totals, [event.entry.tag]: context.totals[event.entry.tag] + 1 };
      return { entries: newEntries, totals };
    }),
    removeEntry: assign(({ context, event }) => {
      const removed = context.entries[event.index];
      if (!removed) return context;
      const newEntries = context.entries.filter((_, i) => i !== event.index);
      const totals = { ...context.totals, [removed.tag]: context.totals[removed.tag] - 1 };
      return { entries: newEntries, totals };
    }),
  },
}).createMachine({
  id: "karmaLedger",
  initial: "intro",
  context: { entries: [], totals: { skillful: 0, unskillful: 0, neutral: 0 } },
  states: {
    intro: { on: { ADVANCE: "log" } },
    log: { on: { ADD_ENTRY: { actions: "addEntry" }, REMOVE_ENTRY: { actions: "removeEntry" }, ADVANCE: "review" } },
    review: { on: { ADVANCE: "verdict" } },
    verdict: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

const KEY = () => {
  const d = new Date();
  return `cos.karma-ledger.${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const tagColors: Record<Tag, { border: string; bg: string; text: string; glow: string }> = {
  skillful: { border: "border-emerald-400/60", bg: "bg-emerald-500/15", text: "text-emerald-100", glow: "rgba(110,231,183," },
  unskillful: { border: "border-rose-400/60", bg: "bg-rose-500/15", text: "text-rose-100", glow: "rgba(251,113,133," },
  neutral: { border: "border-white/20", bg: "bg-white/5", text: "text-white/70", glow: "rgba(255,255,255," },
};

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { entries, totals } = state.context;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [text, setText] = useState("");
  const [tag, setTag] = useState<Tag>("neutral");
  const [reason, setReason] = useState("");
  const [verdictText, setVerdictText] = useState("");
  const [verdictListening, setVerdictListening] = useState(false);
  const [spokenEntry, setSpokenEntry] = useState(false);
  const [spokenReason, setSpokenReason] = useState(false);

  const sessionStartRef = useRef(Date.now());
  const endedRef = useRef(false);
  const envSamplesRef = useRef<number[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY());
      if (raw) {
        const saved = JSON.parse(raw);
        send({ type: "ADD_ENTRY", entry: { text: "", tag: "neutral", reason: "", ts: 0, spoken: false } }); // reset
        saved.forEach((e: Entry) => send({ type: "ADD_ENTRY", entry: e }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(KEY(), JSON.stringify(entries)); } catch {}
  }, [entries]);

  useEffect(() => {
    sd.bed("temple", 0.05);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  useEffect(() => {
    if (phase === "log" || phase === "review") {
      envSamplesRef.current.push(breath.envelope);
    }
  }, [breath.envelope, phase]);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "intro") {
        sd.chime("rise", 0.06);
        await say("karma is not mystical. it is what you actually did today, and what it planted.", "guru");
      } else if (phase === "review" && !cancelled) {
        sd.chime("drop", 0.08);
        await say("the shape of the day reveals. notice which category is heaviest — that is what tomorrow will be built on.", "guru");
      } else if (phase === "verdict" && !cancelled) {
        sd.chime("rise", 0.1);
        await say("speak your verdict. what does this ledger teach you?", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setVerdictListening(true); } catch {}
        }
      } else if (phase === "integrate") {
        if (verdictListening) {
          setVerdictListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setVerdictText(r.transcript.trim().slice(0, 300));
        }
        sd.chime("drop", 0.12);
        stopVoice();
        await say("the ledger closes. the accounting continues in every action.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  const handleAddEntry = useCallback(() => {
    if (text.trim().length < 3) return;
    const entry: Entry = { text: text.trim(), tag, reason: reason.trim(), ts: Date.now(), spoken: false };
    send({ type: "ADD_ENTRY", entry });
    sd.chime("rise", 0.04);
    buzz("tap");
    setText(""); setReason(""); setTag("neutral");
  }, [text, tag, reason]);

  const handleRemoveEntry = useCallback((index: number) => {
    send({ type: "REMOVE_ENTRY", index });
    sd.chime("drop", 0.03);
    buzz("tap");
  }, []);

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    sd.stopBed();
    stopVoice();

    const s = totals.skillful;
    const u = totals.unskillful;
    const n = totals.neutral;
    const total = entries.length;
    const skillfulRatio = total ? +(s / total).toFixed(3) : 0;
    const unskillfulRatio = total ? +(u / total).toFixed(3) : 0;
    const envMean = envSamplesRef.current.length ? envSamplesRef.current.reduce((a, b) => a + b, 0) / envSamplesRef.current.length : 0;

    onEnd({
      outcome: total >= 3 ? "completed" : "abandoned",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        entries: total,
        skillful: s,
        unskillful: u,
        neutral: n,
        skillful_ratio: skillfulRatio,
        unskillful_ratio: unskillfulRatio,
        verdict: verdictText || null,
        avg_mic_envelope: +envMean.toFixed(4),
        env_samples: envSamplesRef.current.length,
        mic_ready: breath.ready,
        mic_cycles: breath.cycles,
      },
    });
  }, [onEnd, totals, entries.length, verdictText, stopVoice, sd, breath]);

  const handleSpokenEntry = async () => {
    try { await transcribe.start(); setSpokenEntry(true); } catch {}
  };
  const stopSpokenEntry = async () => {
    setSpokenEntry(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) { setText(r.transcript.trim()); }
  };

  const handleSpokenReason = async () => {
    try { await transcribe.start(); setSpokenReason(true); } catch {}
  };
  const stopSpokenReason = async () => {
    setSpokenReason(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) { setReason(r.transcript.trim()); }
  };

  const stopVerdict = async () => {
    setVerdictListening(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) setVerdictText(r.transcript.trim().slice(0, 300));
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.04, 0.14, 0.04], y: [0, -12, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-amber-950/25 via-black to-rose-950/25 pointer-events-none"
      />
      {/* Aurora — amber/rose */}
      <motion.div
        animate={{ opacity: [0.03, 0.12, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-amber-400/15 via-transparent to-rose-400/10 pointer-events-none mix-blend-screen"
      />
      {/* Aurora — orange offset */}
      <motion.div
        animate={{ opacity: [0.02, 0.08, 0.02], scale: [1, 1.05, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute inset-0 bg-gradient-to-t from-orange-500/12 via-transparent to-transparent pointer-events-none mix-blend-screen"
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
          <span className="text-[10px] uppercase tracking-[0.5em] text-amber-200/70 font-light" style={SERIF}>karma ledger · today</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-amber-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
          {(phase === "log" || phase === "review") && entries.length > 0 && (
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">{entries.length} entries</span>
          )}
        </div>
      </div>

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <KarmaLedgerCanvas
          phase={phase}
          totals={totals}
          entries={entries}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="i" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center max-w-md space-y-8 pointer-events-auto">
              <p className="text-4xl font-extralight text-white/95 tracking-[0.02em]" style={SERIF}>the day's ledger</p>
              <p className="text-base italic text-white/80 leading-relaxed max-w-md mx-auto" style={SERIF}>
                karma is not mystical. it is what you actually did today, and what it planted.
              </p>
              <motion.button
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-amber-400/60 bg-amber-500/10 text-amber-100 text-sm uppercase tracking-wide hover:bg-amber-500/20 transition shadow-[0_0_24px_rgba(251,191,36,0.2)]"
              >
                open the ledger
              </motion.button>
            </motion.div>
          )}

          {phase === "log" && (
            <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-2xl space-y-8 pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-3" style={SERIF}>what did you do?</div>
              
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. snapped at a colleague on slack"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-base italic focus:outline-none focus:border-amber-300/40 mb-3"
                style={SERIF}
              />

              <div className="flex gap-2 mb-3">
                {(["skillful", "neutral", "unskillful"] as Tag[]).map((t) => {
                  const c = tagColors[t];
                  return (
                    <button
                      key={t}
                      onClick={() => setTag(t)}
                      className={`flex-1 py-2 rounded-full border text-[11px] uppercase tracking-[0.3em] ${
                        tag === t ? `${c.border} ${c.bg} ${c.text} shadow-[0_0_16px_${c.glow}0.4)]` : "border-white/15 text-white/40 hover:border-white/30 hover:text-white/70"
                      }`}
                      style={SERIF}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="one-line reason (optional)"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-sm italic focus:outline-none focus:border-amber-300/40"
                  style={SERIF}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSpokenEntry}
                    className={`flex-1 px-4 py-2.5 rounded-full border text-xs uppercase tracking-wide ${
                      spokenEntry ? "border-amber-400/60 bg-amber-500/15 text-amber-100 animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.2)]" : "border-white/15 text-white/40 hover:border-amber-300/50"
                    }`}
                  >
                    {spokenEntry ? "● listening — tap to finish" : "speak entry"}
                  </button>
                  <button
                    onClick={handleSpokenReason}
                    className={`flex-1 px-4 py-2.5 rounded-full border text-xs uppercase tracking-wide ${
                      spokenReason ? "border-amber-400/60 bg-amber-500/15 text-amber-100 animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.2)]" : "border-white/15 text-white/40 hover:border-amber-300/50"
                    }`}
                  >
                    {spokenReason ? "● listening — tap to finish" : "speak reason"}
                  </button>
                </div>
              </div>

              <motion.button
                disabled={text.trim().length < 3}
                onClick={handleAddEntry}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full px-6 py-3 rounded-full border text-xs uppercase tracking-[0.4em] ${
                  text.trim().length >= 3 ? "border-amber-400/60 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                add to ledger
              </motion.button>

              {entries.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-white/40" style={SERIF}>today · {entries.length} entries</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-200/70 tabular-nums">{totals.skillful}</span>
                      <span className="text-[10px] uppercase tracking-[0.3em] text-white/50 tabular-nums">{totals.neutral}</span>
                      <span className="text-[10px] uppercase tracking-[0.3em] text-rose-200/70 tabular-nums">{totals.unskillful}</span>
                    </div>
                  </div>
                  <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {entries.map((e, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`px-4 py-3 rounded-xl border text-base italic ${tagColors[e.tag].border} ${tagColors[e.tag].bg} ${tagColors[e.tag].text}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div>{e.text}</div>
                            {e.reason && <div className="text-sm opacity-70 mt-1">— {e.reason}</div>}
                          </div>
                          <button onClick={() => handleRemoveEntry(i)} className="text-sm opacity-60 hover:opacity-100">×</button>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                  <div className="mt-6 text-center">
                    <motion.button
                      onClick={() => send({ type: "ADVANCE" })}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-3 rounded-full border-2 border-white/30 text-sm uppercase tracking-wide hover:bg-white/5 transition"
                      style={SERIF}
                    >
                      close the day
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {phase === "review" && (
            <motion.div key="r" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl text-center space-y-8 pointer-events-auto">
              <p className="text-[10px] uppercase tracking-[0.5em] text-white/40 mb-6" style={SERIF}>the shape of the day</p>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {(["skillful", "neutral", "unskillful"] as Tag[]).map((t) => {
                  const c = tagColors[t];
                  return (
                    <motion.div
                      key={t}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (["skillful", "neutral", "unskillful"].indexOf(t)) * 0.1 }}
                      className={`px-4 py-6 rounded-2xl border ${c.border} ${c.bg} ${c.text}`}
                    >
                      <p className="text-4xl font-extralight tabular-nums" style={SERIF}>{totals[t]}</p>
                      <p className="text-[10px] uppercase tracking-[0.3em] mt-2" style={SERIF}>{t}</p>
                    </motion.div>
                  );
                })}
              </div>
              <p className="text-base italic text-white/80 leading-relaxed max-w-md mx-auto mb-8" style={SERIF}>
                karma is not a scoreboard. it is a direction. notice which category is heaviest — that is what tomorrow will be built on.
              </p>
              <motion.button
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-amber-400/60 bg-amber-500/10 text-amber-100 text-sm uppercase tracking-wide hover:bg-amber-500/20 transition shadow-[0_0_24px_rgba(251,191,36,0.2)]"
                style={SERIF}
              >
                render verdict
              </motion.button>
            </motion.div>
          )}

          {phase === "verdict" && (
            <motion.div key="v" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl text-center space-y-8 pointer-events-auto">
              <p className="text-[10px] uppercase tracking-[0.5em] text-white/40 mb-6" style={SERIF}>your verdict</p>

              {verdictText ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 max-w-md mx-auto"
                >
                  <p className="text-lg italic text-amber-100/95" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", textShadow: "0 0 16px rgba(251,191,36,0.3)" }}>"{verdictText}"</p>
                </motion.div>
              ) : verdictListening ? (
                <motion.button
                  onClick={stopVerdict}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 rounded-full border-2 border-amber-400/60 bg-amber-500/15 text-amber-100 text-sm uppercase tracking-wide animate-pulse shadow-[0_0_24px_rgba(251,191,36,0.25)]"
                >
                  ● listening — tap when done
                </motion.button>
              ) : (
                <p className="text-white/40">preparing…</p>
              )}
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="int" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl text-center space-y-6">
              <p className="text-2xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>rest</p>
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-amber-400/20 to-rose-400/15 blur-xl"
              />
              {verdictText && (
                <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>"{verdictText}"</p>
              )}
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                the ledger closes. the accounting continues in every action.
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

export default function KarmaLedger() {
  const g = getLabGame("karma-ledger")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}