// BHAKTI FLAME — Flagship Grade
// Nārada Bhakti Sūtra 2: sā tv asmin parama-prema-rūpā.
// Bhakti is love turned toward the highest — chosen, not forced.
// Pick your iṣṭa (the form love flows toward most easily today).
// Sit 90s. Let the warmth locate itself in the body.
// Then name what love is asking of you.
// Multi-sensor: mic (breath/STT), TTS (guru), STT (spoken entries), haptics, sound design
// Canvas: animated flame with warmth visualization and locus mapping
// XState: intro → pick → sit (90s) → locate → ask → integrate

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
import BhaktiFlameCanvas from "./BhaktiFlameCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };
const SIT_SECONDS = 90;

type Ishta = "form" | "guru" | "beloved" | "nature" | "nameless";
type Phase = "intro" | "pick" | "sit" | "locate" | "ask" | "integrate";

type Ctx = { ishta: Ishta | null; locus: string; asking: string };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "SET_ISHTA"; value: Ishta }
      | { type: "SET_LOCUS"; value: string }
      | { type: "SET_ASKING"; value: string }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    setIshta: assign(({ context, event }) => ({ ...context, ishta: event.value })),
    setLocus: assign(({ context, event }) => ({ ...context, locus: event.value })),
    setAsking: assign(({ context, event }) => ({ ...context, asking: event.value })),
  },
}).createMachine({
  id: "bhaktiFlame",
  initial: "intro",
  context: { ishta: null, locus: "", asking: "" },
  states: {
    intro: { on: { ADVANCE: "pick" } },
    pick: { on: { SET_ISHTA: { actions: "setIshta", target: "sit" } } },
    sit: { on: { ADVANCE: "locate" } },
    locate: { on: { SET_LOCUS: { actions: "setLocus", target: "ask" } } },
    ask: { on: { SET_ASKING: { actions: "setAsking", target: "integrate" } } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

const ISHTA_OPTIONS = [
  { id: "form" as const, label: "a form", note: "a face, a mūrti, a photograph — a shape love recognizes" },
  { id: "guru" as const, label: "the teacher", note: "the one who first cracked you open" },
  { id: "beloved" as const, label: "the beloved", note: "a person, alive or gone, love flows to without asking" },
  { id: "nature" as const, label: "the vast", note: "sea · sky · mountain — the impersonal that still holds you" },
  { id: "nameless" as const, label: "the nameless", note: "no form. only the warmth itself" },
];

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { ishta, locus, asking } = state.context;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [remain, setRemain] = useState(SIT_SECONDS);
  const [listeningLocus, setListeningLocus] = useState(false);
  const [listeningAsking, setListeningAsking] = useState(false);

  const startRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const endedRef = useRef(false);

  useEffect(() => {
    sd.bed("temple", 0.05);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Timer effect
  useEffect(() => {
    if (phase !== "sit") return;
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
      if (phase === "intro") {
        sd.chime("rise", 0.06);
        await say("bhakti is love turned toward the highest — chosen, not forced. pick your iṣṭa. sit ninety seconds. let the warmth locate itself.", "guru");
      } else if (phase === "sit") {
        sd.chime("rise", 0.08);
        await say("let the warmth find you. don't chase it. let it land where it lands.", "guru");
      } else if (phase === "locate") {
        sd.chime("drop", 0.08);
        await say("where in the body did it land? chest · throat · eyes · belly · behind the ribs. speak it.", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setListeningLocus(true); } catch {}
        }
      } else if (phase === "ask") {
        sd.chime("drop", 0.1);
        await say("what is love asking of you today? one act. small enough to actually do.", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setListeningAsking(true); } catch {}
        }
      } else if (phase === "integrate") {
        if (listeningAsking) {
          setListeningAsking(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) send({ type: "SET_ASKING", value: r.transcript.trim() });
        }
        sd.chime("drop", 0.12);
        stopVoice();
        await say("carry it. the warmth was not the point. the action it asks for is.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase, locus, asking]);

  // STT for locus
  useEffect(() => {
    if (phase !== "locate") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setLocus(t);
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  // STT for asking
  useEffect(() => {
    if (phase !== "ask") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setAsking(t);
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
      outcome: locus.trim().length >= 3 && asking.trim().length >= 6 ? "completed" : "abandoned",
      signals: {
        ishta: ishta ?? "",
        locus_in_body: locus.trim(),
        love_is_asking: asking.trim(),
        total_ms: Date.now() - startRef.current,
      },
    });
  }, [onEnd, ishta, locus, asking, stopVoice, sd]);

  const handleSpokenLocus = async () => {
    try { await transcribe.start(); setListeningLocus(true); } catch {}
  };
  const stopSpokenLocus = async () => {
    setListeningLocus(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) send({ type: "SET_LOCUS", value: r.transcript.trim() });
  };

  const handleSpokenAsking = async () => {
    try { await transcribe.start(); setListeningAsking(true); } catch {}
  };
  const stopSpokenAsking = async () => {
    setListeningAsking(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) send({ type: "SET_ASKING", value: r.transcript.trim() });
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.10, 0.24, 0.10] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-black to-rose-900/20 pointer-events-none"
      />
      {/* Aurora — amber/rose */}
      <motion.div
        animate={{ opacity: [0.04, 0.12, 0.04], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-amber-400/15 via-transparent to-rose-400/10 pointer-events-none mix-blend-screen"
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
          <span className="text-[10px] uppercase tracking-[0.42em] text-amber-200/70 font-light" style={SERIF}>bhakti · {phase === "sit" ? `${remain}s` : phase === "locate" ? "locate" : phase === "ask" ? "ask" : "flame"}</span>
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
        <BhaktiFlameCanvas
          phase={phase}
          ishta={ishta}
          remain={remain}
          locus={locus}
          asking={asking}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-lg space-y-8 pointer-events-auto">
              <h2 className="text-3xl italic mb-6" style={SERIF}>bhakti · flame</h2>
              <p className="text-base italic text-white/80 leading-relaxed mb-10 max-w-md mx-auto" style={SERIF}>
                bhakti is love turned toward the highest — chosen, not forced. pick your iṣṭa. sit ninety seconds. let the warmth locate itself. then name what love is asking of you.
              </p>
              <motion.button
                onClick={() => { startRef.current = Date.now(); send({ type: "ADVANCE" }); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-amber-400/60 bg-amber-500/10 text-amber-100 text-sm uppercase tracking-wide hover:bg-amber-500/20 transition shadow-[0_0_24px_rgba(251,191,36,0.2)]"
              >
                begin
              </motion.button>
            </motion.div>
          )}

          {phase === "pick" && (
            <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-lg space-y-8 pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.4em] text-amber-200/60 mb-3 text-center" style={SERIF}>where does love flow easily today?</div>
              <p className="text-lg italic text-center leading-relaxed mb-6" style={SERIF}>don't pick what's holy. pick what's warm.</p>
              <div className="flex flex-col gap-3">
                {ISHTA_OPTIONS.map((o) => (
                  <motion.button
                    key={o.id}
                    onClick={() => { send({ type: "SET_ISHTA", value: o.id }); buzz("tap"); }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="text-left px-5 py-4 border border-white/15 rounded-xl hover:bg-white/[0.04] transition"
                  >
                    <div className="text-white/90 text-base italic" style={SERIF}>{o.label}</div>
                    <div className="text-white/45 text-xs italic mt-1" style={SERIF}>{o.note}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === "sit" && (
            <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-28 h-28 mx-auto mb-8 rounded-full bg-gradient-radial from-amber-300/70 via-amber-500/30 to-transparent blur-sm"
              />
              <p className="text-xs uppercase tracking-[0.42em] text-white/40 mb-4" style={SERIF}>let the warmth find you</p>
              <div className="text-6xl italic text-white/85" style={SERIF}>{remain}</div>
            </motion.div>
          )}

          {phase === "locate" && (
            <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <p className="text-2xl italic text-white/90 mb-3" style={SERIF}>where in the body did it land?</p>
              <p className="text-sm text-white/50 italic mb-6" style={SERIF}>chest · throat · eyes · belly · behind the ribs.</p>
              <textarea
                value={locus}
                onChange={(e) => send({ type: "SET_LOCUS", value: e.target.value })}
                placeholder="the locus…"
                rows={2}
                className="w-full bg-white/[0.03] border border-white/15 rounded-xl px-4 py-3 text-white/95 placeholder:text-white/25 italic resize-none focus:outline-none focus:border-amber-300/40 mb-6"
                style={SERIF}
              />
              <div className="space-y-3">
                <button
                  onClick={handleSpokenLocus}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    listeningLocus ? "border-amber-400/60 bg-amber-500/15 text-amber-100 animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.2)]" : "border-white/15 text-white/40 hover:border-amber-300/50"
                  }`}
                >
                  {listeningLocus ? "● listening — tap to finish" : "speak locus"}
                </button>
              </div>
              <motion.button
                disabled={locus.trim().length < 3}
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-6 py-3 rounded-full border text-xs uppercase tracking-[0.4em] ${
                  locus.trim().length >= 3 ? "border-amber-400/60 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                what does it ask?
              </motion.button>
            </motion.div>
          )}

          {phase === "ask" && (
            <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <p className="text-2xl italic text-white/90 mb-3" style={SERIF}>what is love asking of you today?</p>
              <p className="text-sm text-white/50 italic mb-6" style={SERIF}>one act. small enough to actually do.</p>
              <textarea
                value={asking}
                onChange={(e) => send({ type: "SET_ASKING", value: e.target.value })}
                placeholder="the one act…"
                rows={3}
                className="w-full bg-white/[0.03] border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-base italic focus:outline-none focus:border-amber-300/40 mb-4 resize-none"
                style={SERIF}
              />
              <div className="space-y-3">
                <button
                  onClick={handleSpokenAsking}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    listeningAsking ? "border-amber-400/60 bg-amber-500/15 text-amber-100 animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.2)]" : "border-white/15 text-white/40 hover:border-amber-300/50"
                  }`}
                >
                  {listeningAsking ? "● listening — tap to finish" : "speak asking"}
                </button>
              </div>
              <motion.button
                disabled={asking.trim().length < 6}
                onClick={finish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-8 py-3 rounded-full border text-xs uppercase tracking-[0.4em] ${
                  asking.trim().length >= 6 ? "border-amber-400/60 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                carry it
              </motion.button>
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="int" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg text-center space-y-6">
              <p className="text-2xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>rest</p>
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-amber-400/20 to-rose-400/15 blur-xl"
              />
              {asking && (
                <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>"{asking}"</p>
              )}
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                the warmth was not the point. the action it asks for is.
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

export default function BhaktiFlame() {
  const g = getLabGame("bhakti-flame")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}