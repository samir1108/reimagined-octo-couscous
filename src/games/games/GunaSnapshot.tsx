// GUNA SNAPSHOT — Flagship Grade
// Rate the current mix of tamas (heavy/inert), rajas (agitated/driven),
// and sattva (clear/steady) across three domains: body, mind, relationships.
// Multi-sensor: mic (breath), TTS (guru), STT (spoken shift), haptics, sound design
// Canvas: animated triadic guna visualization with particle flow
// XState: intro → rate (3 domains) → shift → verdict → integrate

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
import GunaSnapshotCanvas from "./GunaSnapshotCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };

const DOMAINS = ["body", "mind", "relationships"] as const;
type Domain = typeof DOMAINS[number];
type Reading = Record<Domain, { tamas: number; rajas: number; sattva: number }>;

type Phase = "intro" | "rate" | "shift" | "verdict" | "integrate";

const empty: Reading = {
  body: { tamas: 33, rajas: 33, sattva: 34 },
  mind: { tamas: 33, rajas: 33, sattva: 34 },
  relationships: { tamas: 33, rajas: 33, sattva: 34 },
};

function normalize(r: { tamas: number; rajas: number; sattva: number }) {
  const total = r.tamas + r.rajas + r.sattva;
  if (total === 0) return { tamas: 33, rajas: 33, sattva: 34 };
  return {
    tamas: Math.round((r.tamas / total) * 100),
    rajas: Math.round((r.rajas / total) * 100),
    sattva: Math.round((r.sattva / total) * 100),
  };
}

type Ctx = { reading: Reading; shift: string; domainIdx: number };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "SET_GUNA"; guna: "tamas" | "rajas" | "sattva"; value: number }
      | { type: "NEXT_DOMAIN" }
      | { type: "SET_SHIFT"; value: string }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    setGuna: assign(({ context, event }) => ({
      reading: { ...context.reading, [DOMAINS[context.domainIdx]]: { ...context.reading[DOMAINS[context.domainIdx]], [event.guna]: event.value } },
    })),
    nextDomain: assign(({ context }) => ({ domainIdx: context.domainIdx + 1 })),
    setShift: assign(({ context, event }) => ({ shift: event.value })),
  },
}).createMachine({
  id: "gunaSnapshot",
  initial: "intro",
  context: { reading: empty, shift: "", domainIdx: 0 },
  states: {
    intro: { on: { ADVANCE: "rate" } },
    rate: { on: { SET_GUNA: { actions: "setGuna" }, NEXT_DOMAIN: { actions: "nextDomain", target: "rate" }, ADVANCE: { target: "shift", guard: ({ context }) => context.domainIdx >= DOMAINS.length - 1 } } },
    shift: { on: { SET_SHIFT: { actions: "setShift" }, ADVANCE: "verdict" } },
    verdict: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { reading, shift, domainIdx } = state.context;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [shiftListening, setShiftListening] = useState(false);
  const [verdictText, setVerdictText] = useState("");

  const sessionStartRef = useRef(Date.now());
  const endedRef = useRef(false);
  const envSamplesRef = useRef<number[]>([]);

  useEffect(() => {
    sd.bed("temple", 0.05);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  useEffect(() => {
    if (phase === "rate" || phase === "shift") {
      envSamplesRef.current.push(breath.envelope);
    }
  }, [breath.envelope, phase]);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "intro") {
        sd.chime("rise", 0.06);
        await say("the three currents. tamas — heavy, dull, stuck. rajas — agitated, driven, scattered. sattva — clear, steady, awake. take a reading of body, mind, and relationships.", "guru");
      } else if (phase === "shift" && !cancelled) {
        sd.chime("drop", 0.08);
        await say("the mix is seen. now name the one smallest sattva-shift available in the next hour. speak it.", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setShiftListening(true); } catch {}
        }
      } else if (phase === "verdict" && !cancelled) {
        sd.chime("rise", 0.1);
        const norm: Reading = {
          body: normalize(reading.body),
          mind: normalize(reading.mind),
          relationships: normalize(reading.relationships),
        };
        const overallSattva = Math.round((norm.body.sattva + norm.mind.sattva + norm.relationships.sattva) / 3);
        const overallTamas = Math.round((norm.body.tamas + norm.mind.tamas + norm.relationships.tamas) / 3);
        const overallRajas = Math.round((norm.body.rajas + norm.mind.rajas + norm.relationships.rajas) / 3);
        const dominant = overallSattva >= overallRajas && overallSattva >= overallTamas ? "sattva" : overallRajas >= overallTamas ? "rajas" : "tamas";
        const line = `the mix reads ${dominant}. ${shift ? "your shift: " + shift : "no shift named."}`;
        await say(line, "guru");
      } else if (phase === "integrate") {
        if (shiftListening) {
          setShiftListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) send({ type: "SET_SHIFT", value: r.transcript.trim().slice(0, 200) });
        }
        sd.chime("drop", 0.12);
        stopVoice();
        await say("the snapshot is taken. the currents keep moving. the practice is to notice.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  const cur = reading[DOMAINS[domainIdx]];
  const norm = normalize(cur);

  const handleGuna = (guna: "tamas" | "rajas" | "sattva", value: number) => {
    send({ type: "SET_GUNA", guna, value });
    buzz("tap");
  };

  const handleNextDomain = () => {
    send({ type: "NEXT_DOMAIN" });
    buzz("tap");
  };

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    sd.stopBed();
    stopVoice();

    const normRead: Reading = {
      body: normalize(reading.body),
      mind: normalize(reading.mind),
      relationships: normalize(reading.relationships),
    };
    const overallSattva = Math.round((normRead.body.sattva + normRead.mind.sattva + normRead.relationships.sattva) / 3);
    const overallRajas = Math.round((normRead.body.rajas + normRead.mind.rajas + normRead.relationships.rajas) / 3);
    const overallTamas = Math.round((normRead.body.tamas + normRead.mind.tamas + normRead.relationships.tamas) / 3);
    const dominant = overallSattva >= overallRajas && overallSattva >= overallTamas ? "sattva" : overallRajas >= overallTamas ? "rajas" : "tamas";
    const envMean = envSamplesRef.current.length ? envSamplesRef.current.reduce((a, b) => a + b, 0) / envSamplesRef.current.length : 0;

    onEnd({
      outcome: shift.trim().length > 3 ? "completed" : "abandoned",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        overall_sattva: overallSattva,
        overall_rajas: overallRajas,
        overall_tamas: overallTamas,
        dominant,
        shift_named: shift.trim().length > 3,
        shift_text: shift || null,
        body_tamas: normRead.body.tamas,
        body_rajas: normRead.body.rajas,
        body_sattva: normRead.body.sattva,
        mind_tamas: normRead.mind.tamas,
        mind_rajas: normRead.mind.rajas,
        mind_sattva: normRead.mind.sattva,
        rel_tamas: normRead.relationships.tamas,
        rel_rajas: normRead.relationships.rajas,
        rel_sattva: normRead.relationships.sattva,
        avg_mic_envelope: +envMean.toFixed(4),
        env_samples: envSamplesRef.current.length,
        mic_ready: breath.ready,
        mic_cycles: breath.cycles,
      },
    });
  }, [onEnd, reading, shift, stopVoice, sd, breath]);

  const handleShiftSpoken = async () => {
    try { await transcribe.start(); setShiftListening(true); } catch {}
  };
  const stopShiftSpoken = async () => {
    setShiftListening(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) send({ type: "SET_SHIFT", value: r.transcript.trim().slice(0, 200) });
  };

  const gunaColors = {
    tamas: { border: "border-slate-400/60", bg: "bg-slate-500/15", text: "text-slate-100", name: "TAMAS" },
    rajas: { border: "border-orange-400/60", bg: "bg-orange-500/15", text: "text-orange-100", name: "RAJAS" },
    sattva: { border: "border-emerald-400/60", bg: "bg-emerald-500/15", text: "text-emerald-100", name: "SATTVA" },
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.04, 0.14, 0.04], y: [0, -12, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-emerald-950/25 via-black to-slate-950/25 pointer-events-none"
      />
      {/* Aurora — emerald/slate */}
      <motion.div
        animate={{ opacity: [0.03, 0.12, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-emerald-400/15 via-transparent to-slate-400/10 pointer-events-none mix-blend-screen"
      />
      {/* Aurora — amber offset */}
      <motion.div
        animate={{ opacity: [0.02, 0.08, 0.02], scale: [1, 1.05, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute inset-0 bg-gradient-to-t from-amber-500/12 via-transparent to-transparent pointer-events-none mix-blend-screen"
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
          <span className="text-[10px] uppercase tracking-[0.5em] text-emerald-200/70 font-light" style={SERIF}>guna snapshot{phase === "rate" ? ` · ${domainIdx + 1}/${DOMAINS.length}` : ""}</span>
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
        <GunaSnapshotCanvas
          phase={phase}
          reading={reading}
          domainIdx={domainIdx}
          norm={norm}
          shift={shift}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="i" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center max-w-lg space-y-8 pointer-events-auto">
              <p className="text-4xl font-extralight text-white/95 tracking-[0.02em]" style={SERIF}>the three currents · right now</p>
              <p className="text-base italic text-white/80 leading-relaxed max-w-md mx-auto" style={SERIF}>
                tamas — heavy, dull, stuck. rajas — agitated, driven, scattered. sattva — clear, steady, awake.
              </p>
              <motion.button
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-emerald-400/60 bg-emerald-500/10 text-emerald-100 text-sm uppercase tracking-wide hover:bg-emerald-500/20 transition shadow-[0_0_24px_rgba(110,231,183,0.2)]"
              >
                take the reading
              </motion.button>
            </motion.div>
          )}

          {phase === "rate" && (
            <motion.div key={`d-${domainIdx}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-2xl space-y-8 pointer-events-auto">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-[0.5em] text-emerald-200/60" style={SERIF}>domain</p>
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/50 tabular-nums">{domainIdx + 1} / {DOMAINS.length}</p>
              </div>
              <p className="text-3xl italic text-center" style={SERIF}>{DOMAINS[domainIdx]}</p>

              {(["tamas", "rajas", "sattva"] as const).map((g) => {
                const c = gunaColors[g];
                return (
                  <motion.div
                    key={g}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (["tamas", "rajas", "sattva"].indexOf(g)) * 0.1 }}
                    className="mb-6"
                  >
                    <div className="flex justify-between text-xs uppercase tracking-[0.3em] text-white/60 mb-1" style={SERIF}>
                      <span>{gunaColors[g].name}</span>
                      <span className={c.text} tabular-nums>{norm[g]}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={cur[g]}
                      onChange={(e) => handleGuna(g, parseInt(e.target.value))}
                      className={`w-full ${g === "sattva" ? "accent-emerald-400" : g === "rajas" ? "accent-orange-400" : "accent-slate-400"}`}
                    />
                  </motion.div>
                );
              })}

              <motion.button
                onClick={handleNextDomain}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3 rounded-full border-2 border-emerald-400/60 bg-emerald-500/10 text-emerald-100 text-sm uppercase tracking-wide hover:bg-emerald-500/20 transition shadow-[0_0_24px_rgba(110,231,183,0.2)]"
              >
                {domainIdx + 1 === DOMAINS.length ? "read the mix" : "next domain"}
              </motion.button>
            </motion.div>
          )}

          {phase === "shift" && (
            <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl text-center space-y-8 pointer-events-auto">
              <p className="text-xl italic text-white/90 max-w-md mx-auto" style={SERIF}>
                the one smallest sattva-shift available in the next hour?
              </p>

              {shift ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 max-w-md mx-auto"
                >
                  <p className="text-lg italic text-emerald-100/95" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", textShadow: "0 0 16px rgba(110,231,183,0.3)" }}>"{shift}"</p>
                </motion.div>
              ) : shiftListening ? (
                <motion.button
                  onClick={stopShiftSpoken}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 rounded-full border-2 border-emerald-400/60 bg-emerald-500/15 text-emerald-100 text-sm uppercase tracking-wide animate-pulse shadow-[0_0_24px_rgba(110,231,183,0.25)]"
                >
                  ● listening — tap when done
                </motion.button>
              ) : (
                <p className="text-white/40">preparing…</p>
              )}

              <motion.button
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-white/30 text-sm uppercase tracking-wide hover:bg-white/5 transition"
              >
                seal
              </motion.button>
            </motion.div>
          )}

          {phase === "verdict" && (
            <motion.div key="v" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl text-center space-y-8 pointer-events-auto">
              <p className="text-[10px] uppercase tracking-[0.5em] text-white/40 mb-6" style={SERIF}>your reading</p>

              <div className="space-y-4">
                {DOMAINS.map((d) => {
                  const n = normalize(reading[d]);
                  return (
                    <motion.div
                      key={d}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: DOMAINS.indexOf(d) * 0.1 }}
                      className="px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-left"
                    >
                      <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-2 italic" style={SERIF}>{d}</p>
                      <div className="flex h-3 rounded-full overflow-hidden bg-white/5">
                        <div style={{ width: `${n.tamas}%` }} className="bg-slate-400/70" />
                        <div style={{ width: `${n.rajas}%` }} className="bg-orange-400/70" />
                        <div style={{ width: `${n.sattva}%` }} className="bg-emerald-400/70" />
                      </div>
                      <div className="flex justify-between text-[10px] uppercase tracking-[0.3em] text-white/50 mt-2">
                        <span>t {n.tamas}</span><span>r {n.rajas}</span><span>s {n.sattva}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {shift && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 max-w-md mx-auto mt-4"
                >
                  <p className="text-lg italic text-emerald-100/95" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", textShadow: "0 0 16px rgba(110,231,183,0.3)" }}>
                    the shift: {shift}
                  </p>
                </motion.div>
              )}

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
            <motion.div key="int" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl text-center space-y-6">
              <p className="text-2xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>rest</p>
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400/20 to-slate-400/15 blur-xl"
              />
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                the snapshot is taken. the currents keep moving. the practice is to notice.
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

export default function GunaSnapshot() {
  const g = getLabGame("guna-snapshot")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}

const gunaColors = {
  tamas: { border: "border-slate-400/60", bg: "bg-slate-500/15", text: "text-slate-100", name: "TAMAS" },
  rajas: { border: "border-orange-400/60", bg: "bg-orange-500/15", text: "text-orange-100", name: "RAJAS" },
  sattva: { border: "border-emerald-400/60", bg: "bg-emerald-500/15", text: "text-emerald-100", name: "SATTVA" },
};

function handleGuna(g: "tamas" | "rajas" | "sattva", value: number) {
  send({ type: "SET_GUNA", guna: g, value });
  buzz("tap");
}

function handleNextDomain() {
  send({ type: "NEXT_DOMAIN" });
  buzz("tap");
}