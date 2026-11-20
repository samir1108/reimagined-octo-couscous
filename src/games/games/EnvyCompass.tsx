// ENVY COMPASS — Flagship Grade
// List up to five people you envy. For each, name the specific
// quality and the unlived desire it points to in you.
// Envy is data, not sin — it points at the unlived life.
// Multi-sensor: mic (breath/STT), TTS (guru), STT (spoken entries), haptics, sound design
// Canvas: animated compass with direction needles
// XState: intro → reading (5 entries) → verdict → integrate

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
import EnvyCompassCanvas from "./EnvyCompassCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };

type Row = { who: string; quality: string; unlived: string };
type Phase = "intro" | "row" | "verdict" | "integrate";

type Ctx = { rows: Row[] };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "ADD_ROW"; row: Row }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    addRow: assign(({ context, event }) => ({ rows: [...context.rows, event.row] })),
  },
}).createMachine({
  id: "envyCompass",
  initial: "intro",
  context: { rows: [] },
  states: {
    intro: { on: { ADVANCE: "row" } },
    row: { on: { ADD_ROW: [
          { actions: "addRow", target: "row", guard: ({ context }) => context.rows.length < 4 },
          { actions: "addRow", target: "verdict", guard: ({ context }) => context.rows.length >= 4 },
        ] } },
    verdict: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { rows } = state.context;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [who, setWho] = useState("");
  const [quality, setQuality] = useState("");
  const [unlived, setUnlived] = useState("");
  const [listeningWho, setListeningWho] = useState(false);
  const [listeningQuality, setListeningQuality] = useState(false);
  const [listeningUnlived, setListeningUnlived] = useState(false);

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
        await say("envy is a compass. it always points at your unlived life. name up to five people you envy. for each, name the quality and the desire it exposes in you.", "guru");
      } else if (phase === "verdict" && !cancelled) {
        sd.chime("drop", 0.1);
        await say(`${rows.length} compass readings taken. pick the one unlived line that stings most. one small step toward it, this week.`, "guru");
      } else if (phase === "integrate") {
        sd.chime("drop", 0.12);
        stopVoice();
        await say("envy is not sin. it is data. follow the needle.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  // STT for spoken fields
  useEffect(() => {
    if (phase !== "row") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") {
        // We can't easily separate who/quality/unlived from a single transcript
        // This is a simplified approach - in practice you'd want separate STT sessions
      }
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  const handleAddRow = useCallback(() => {
    if (who.trim().length < 1 || quality.trim().length < 2 || unlived.trim().length < 2) return;
    const row = { who: who.trim(), quality: quality.trim(), unlived: unlived.trim() };
    send({ type: "ADD_ROW", row });
    setWho(""); setQuality(""); setUnlived("");
    buzz("tap");
  }, [who, quality, unlived]);

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    sd.stopBed();
    stopVoice();

    const avgUnlived = rows.length ? Math.round(rows.reduce((s, r) => s + r.unlived.length, 0) / rows.length) : 0;

    onEnd({
      outcome: rows.length >= 3 ? "completed" : "abandoned",
      signals: {
        readings: rows.length,
        avg_unlived_len: avgUnlived,
        first_target: rows[0]?.who || null,
        readings_detail: rows,
      },
    });
  }, [onEnd, rows, stopVoice, sd]);

  const handleSpokenWho = async () => {
    try { await transcribe.start(); setListeningWho(true); } catch {}
  };
  const stopSpokenWho = async () => {
    setListeningWho(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) setWho(r.transcript.trim());
  };

  const handleSpokenQuality = async () => {
    try { await transcribe.start(); setListeningQuality(true); } catch {}
  };
  const stopSpokenQuality = async () => {
    setListeningQuality(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) setQuality(r.transcript.trim());
  };

  const handleSpokenUnlived = async () => {
    try { await transcribe.start(); setListeningUnlived(true); } catch {}
  };
  const stopSpokenUnlived = async () => {
    setListeningUnlived(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) setUnlived(r.transcript.trim());
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.05, 0.14, 0.05], y: [0, -12, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-teal-950/25 via-black to-black pointer-events-none"
      />
      {/* Aurora — teal */}
      <motion.div
        animate={{ opacity: [0.03, 0.1, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-teal-400/15 via-transparent to-transparent pointer-events-none mix-blend-screen"
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
            className="w-1.5 h-1.5 rounded-full bg-teal-300/80 shadow-[0_0_10px_rgba(45,212,191,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.42em] text-teal-200/70 font-light" style={SERIF}>envy compass · {rows.length} / 5</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-teal-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
        </div>
      </div>

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <EnvyCompassCanvas
          phase={phase}
          rows={rows}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-lg space-y-8 pointer-events-auto">
              <h2 className="text-3xl italic mb-6" style={SERIF}>envy is a compass</h2>
              <p className="text-base italic text-white/80 leading-relaxed mb-10 max-w-md mx-auto" style={SERIF}>
                envy is not sin. it is data. it always points at your unlived life.
              </p>
              <motion.button
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-teal-400/60 bg-teal-500/10 text-teal-100 text-sm uppercase tracking-wide hover:bg-teal-500/20 transition shadow-[0_0_24px_rgba(45,212,191,0.2)]"
              >
                take the reading
              </motion.button>
            </motion.div>
          )}

          {phase === "row" && (
            <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-xl space-y-8 pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.5em] text-teal-200/60 mb-2 text-center" style={SERIF}>reading {rows.length + 1} / 5</div>
              
              <input
                value={who}
                onChange={(e) => setWho(e.target.value)}
                placeholder="who — a name or initials"
                className="w-full bg-white/[0.03] border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-base italic focus:outline-none focus:border-teal-300/40 mb-3"
                style={SERIF}
                autoFocus
              />
              <div className="space-y-3">
                <input
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  placeholder="the specific quality you envy…"
                  className="w-full bg-white/[0.03] border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-base italic focus:outline-none focus:border-teal-300/40 mb-3"
                  style={SERIF}
                />
                <div className="space-y-3">
                  <textarea
                    value={unlived}
                    onChange={(e) => setUnlived(e.target.value)}
                    placeholder="what unlived life does this point to in me?"
                    rows={3}
                    className="w-full bg-white/[0.03] border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-base italic focus:outline-none focus:border-teal-300/40 mb-4"
                    style={SERIF}
                  />
                  <div className="space-y-3">
                    <button
                      onClick={handleSpokenWho}
                      className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                        listeningWho ? "border-teal-400/60 bg-teal-500/15 text-teal-100 animate-pulse shadow-[0_0_20px_rgba(45,212,191,0.2)]" : "border-white/15 text-white/40 hover:border-teal-300/50"
                      }`}
                    >
                      {listeningWho ? "● listening — tap to finish" : "speak who"}
                    </button>
                    <button
                      onClick={handleSpokenQuality}
                      className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                        listeningQuality ? "border-teal-400/60 bg-teal-500/15 text-teal-100 animate-pulse shadow-[0_0_20px_rgba(45,212,191,0.2)]" : "border-white/15 text-white/40 hover:border-teal-300/50"
                      }`}
                    >
                      {listeningQuality ? "● listening — tap to finish" : "speak quality"}
                    </button>
                    <button
                      onClick={handleSpokenUnlived}
                      className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                        listeningUnlived ? "border-teal-400/60 bg-teal-500/15 text-teal-100 animate-pulse shadow-[0_0_20px_rgba(45,212,191,0.2)]" : "border-white/15 text-white/40 hover:border-teal-300/50"
                      }`}
                    >
                      {listeningUnlived ? "● listening — tap to finish" : "speak unlived"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => { if (rows.length >= 3) send({ type: "ADVANCE" }); }}
                  disabled={rows.length < 3}
                  className="text-xs uppercase tracking-[0.3em] text-white/50 hover:text-white/80 disabled:opacity-30"
                  style={SERIF}
                >
                  finish ({rows.length}/5)
                </button>
                <motion.button
                  onClick={handleAddRow}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2.5 rounded-full border border-white/30 text-xs uppercase tracking-[0.4em] hover:bg-white/5"
                  style={SERIF}
                >
                  save reading
                </motion.button>
              </div>

              {rows.length > 0 && (
                <ul className="mt-6 space-y-2 max-h-40 overflow-y-auto pr-1">
                  {rows.map((r, i) => (
                    <li key={i} className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-sm italic text-slate-300/90" style={SERIF}>
                      <span className="text-teal-200/90">{r.who}</span> — {r.quality}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}

          {phase === "verdict" && (
            <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-lg text-center">
              <div className="text-[10px] uppercase tracking-[0.5em] text-slate-200/60 mb-4" style={SERIF}>your compass readings</div>
              <ul className="text-left max-h-72 overflow-y-auto pr-1 mb-8 space-y-3">
                {rows.map((r, i) => (
                  <li key={i} className="px-4 py-3 rounded-xl border border-teal-300/20 bg-teal-300/5 italic" style={SERIF}>
                    <div className="text-xs uppercase tracking-[0.3em] text-teal-200/70 mb-1">{r.who} · {r.quality}</div>
                    <div className="text-slate-200/90 text-sm">{r.unlived}</div>
                  </li>
                ))}
              </ul>
              <p className="text-base italic text-slate-300/85 leading-relaxed mb-8" style={SERIF}>
                Pick the one unlived line that stings most. One small step toward it, this week.
              </p>
              <motion.button
                onClick={finish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-teal-400/60 bg-teal-500/10 text-teal-100 text-sm uppercase tracking-wide hover:bg-teal-500/20 transition shadow-[0_0_24px_rgba(45,212,191,0.2)]"
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
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-b from-teal-400/20 to-transparent blur-xl"
              />
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                envy is not sin. it is data. follow the needle.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-teal-200/70 transition-all duration-500"
      >
        end · save
      </button>
    </div>
  );
}

export default function EnvyCompass() {
  const g = getLabGame("envy-compass")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}