// HEART COHERENCE BRIDGE v2 — flagship #4, fully sensorial.
//
// Senses used:
//   - Microphone (breath cadence → 5.5 bpm coherence)
//   - TTS (guru voice narration each phase + adaptive mid-rounds line)
//   - STT (spoken "name" of the person you build the bridge to + closing reflection)
//   - Sound design (heartbeat bed + chimes per phase)
//   - Haptics (inhale/exhale buzz + "send" pulse)
//
// Seven phases:
//   1. SETTLE   (8s)
//   2. NAME     (≤14s) — speak the name
//   3. CALIBRATE(10s)  — listen to natural breath
//   4. ROUNDS   (88s)  — 8 × 11s resonance cycles, bridge solidifies with coherence
//   5. SEND     (12s)  — final exhale "send" — bursts cross to the other shore
//   6. REFLECT  (≤14s) — STT
//   7. INTEGRATE(8s)

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Heart } from "lucide-react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useBreathMic } from "../shell/useBreathMic";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import HeartCoherenceBridgeCanvas from "./HeartCoherenceBridgeCanvas";
import CinematicOverlay from "../shell/CinematicOverlay";

type Phase = "settle" | "name" | "calibrate" | "rounds" | "send" | "reflect" | "integrate";

const PHASE_MS: Record<Phase, number> = {
  settle: 8000,
  name: 14000,
  calibrate: 10000,
  rounds: 88000,
  send: 12000,
  reflect: 14000,
  integrate: 8000,
};
const HALF_CYCLE = 5500;
const TOTAL_ROUNDS = 8;
const TARGET_CYCLE_MS = HALF_CYCLE * 2;
const ORDER: Phase[] = ["settle", "name", "calibrate", "rounds", "send", "reflect", "integrate"];

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [phase, setPhase] = useState<Phase>("settle");
  const [pacer, setPacer] = useState(0);
  const [round, setRound] = useState(0);
  const [coherence, setCoherence] = useState(0);
  const [name, setName] = useState("");
  const [reflection, setReflection] = useState("");
  const [nameListening, setNameListening] = useState(false);
  const [reflectionListening, setReflectionListening] = useState(false);
  const [sendPulse, setSendPulse] = useState(0);

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const phaseStartRef = useRef<number>(Date.now());
  const sessionStartRef = useRef<number>(Date.now());
  const endedRef = useRef(false);
  const cycleHistoryRef = useRef<number[]>([]);
  const lastCueRef = useRef<"in" | "out" | "">("");
  const midEncouragedRef = useRef(false);

  // Heartbeat bed
  useEffect(() => {
    sd.bed("heartbeat", 0.22);
    return () => sd.stopBed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phase advance tick
  useEffect(() => {
    const id = setInterval(() => {
      if (endedRef.current) return;
      const elapsed = Date.now() - phaseStartRef.current;
      if (elapsed < PHASE_MS[phase]) return;
      const idx = ORDER.indexOf(phase);
      if (idx < ORDER.length - 1) {
        setPhase(ORDER[idx + 1]);
        phaseStartRef.current = Date.now();
      } else {
        finish();
      }
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Phase entry side effects
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.18);
        await say("welcome to the heart bridge", "guru");
        if (cancelled) return;
        await say("this practice builds a bridge of breath, from your heart to another.", "guru");
      } else if (phase === "name") {
        await say("speak the name of one person you wish to send love to.", "guru");
      } else if (phase === "calibrate") {
        sd.chime("rise", 0.16);
        await say("breathe naturally. we are listening.", "guru");
      } else if (phase === "rounds") {
        sd.chime("rise", 0.2);
        midEncouragedRef.current = false;
        const who = name ? `for ${name}.` : `for the one you hold in mind.`;
        await say(`now follow the bridge. inhale for five and a half, exhale for five and a half. ${who}`, "guru");
      } else if (phase === "send") {
        sd.chime("rise", 0.24);
        setSendPulse((p) => p + 1);
        buzz("exhale");
        const who = name ? name : "them";
        await say(`one full exhale. send it across to ${who}.`, "guru");
      } else if (phase === "reflect") {
        sd.chime("drop", 0.18);
        await say("what crossed the bridge? speak softly when you're ready.", "guru");
        if (cancelled) return;
        try { await transcribe.start(); setReflectionListening(true); } catch {}
      } else if (phase === "integrate") {
        if (reflectionListening) {
          setReflectionListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setReflection(r.transcript.trim().slice(0, 240));
        }
        sd.chime("drop", 0.18);
        stopVoice();
        await say("the bridge remains. carry it with you.", "guru");
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Pacer + cycle counting + haptics during rounds
  useEffect(() => {
    if (phase !== "rounds") return;
    const id = setInterval(() => {
      const elapsed = Date.now() - phaseStartRef.current;
      const cyclePos = (elapsed % (HALF_CYCLE * 2)) / (HALF_CYCLE * 2);
      const v = 0.5 - 0.5 * Math.cos(cyclePos * Math.PI * 2);
      setPacer(v);
      const r = Math.min(TOTAL_ROUNDS, Math.floor(elapsed / (HALF_CYCLE * 2)) + 1);
      if (r !== round) { setRound(r); sd.chime("rise", 0.1); }
      const cue: "in" | "out" = v > 0.5 ? "in" : "out";
      if (cue !== lastCueRef.current) {
        lastCueRef.current = cue;
        buzz(cue === "in" ? "inhale" : "exhale");
      }
      if (!midEncouragedRef.current && r === Math.ceil(TOTAL_ROUNDS / 2)) {
        midEncouragedRef.current = true;
        if (coherence > 0.7) say("the bridge is strong. let it carry the feeling.", "guru");
        else if (coherence > 0.4) say("good. let the exhale soften, longer than the thought.", "guru");
        else say("don't strive. just keep the breath kind.", "guru");
      }
    }, 60);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round, coherence]);

  // Send phase pacer — one long exhale
  useEffect(() => {
    if (phase !== "send") return;
    const id = setInterval(() => {
      const elapsed = Date.now() - phaseStartRef.current;
      // one big inhale (3s) then long exhale (9s) then 0
      let v;
      if (elapsed < 3000) v = elapsed / 3000;
      else if (elapsed < 12000) v = 1 - (elapsed - 3000) / 9000;
      else v = 0;
      setPacer(Math.max(0, Math.min(1, v)));
    }, 60);
    return () => clearInterval(id);
  }, [phase]);

  // Coherence score
  useEffect(() => {
    if (phase !== "rounds" && phase !== "send" && phase !== "integrate" && phase !== "reflect") return;
    if (breath.lastCycleMs > 2000) {
      cycleHistoryRef.current.push(breath.lastCycleMs);
      if (cycleHistoryRef.current.length > 8) cycleHistoryRef.current.shift();
      const hist = cycleHistoryRef.current;
      const meanDev = hist.reduce((s, ms) => s + Math.abs(ms - TARGET_CYCLE_MS), 0) / hist.length;
      setCoherence(Math.max(0, Math.min(1, 1 - meanDev / 6000)));
    }
  }, [breath.lastCycleMs, phase]);

  // Idle pacer for non-active phases
  useEffect(() => {
    if (phase === "rounds" || phase === "send") return;
    if (phase === "calibrate") {
      setPacer(Math.min(1, breath.envelope * 3));
      return;
    }
    const id = setInterval(() => {
      const e = (Date.now() - phaseStartRef.current) / 1000;
      setPacer(0.5 - 0.5 * Math.cos(e * 0.7));
    }, 80);
    return () => clearInterval(id);
  }, [phase, breath.envelope]);

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        bridged_to: name || null,
        spoken_reflection: reflection || null,
        mic_ready: breath.ready,
        cycles_detected: breath.cycles,
        sighs_detected: breath.sighs,
        avg_inhale_ms: breath.lastInhaleMs,
        avg_exhale_ms: breath.lastExhaleMs,
        avg_cycle_ms: breath.lastCycleMs,
        coherence_score: Math.round(coherence * 100),
        rounds_completed: round,
        target_cycle_ms: TARGET_CYCLE_MS,
      },
    });
  };

  // Name STT
  const startName = async () => { try { await transcribe.start(); setNameListening(true); } catch {} };
  const stopName = async () => {
    setNameListening(false);
    const r = await transcribe.stop();
    if (r?.transcript) setName(r.transcript.trim().slice(0, 48));
  };
  const finalizeReflection = async () => {
    if (!reflectionListening) return;
    setReflectionListening(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) setReflection(r.transcript.trim().slice(0, 240));
    if (phase === "reflect") { setPhase("integrate"); phaseStartRef.current = Date.now(); }
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Aurora wash — rose to gold */}
      <motion.div
        animate={{ opacity: [0.10, 0.20, 0.10] }}
        transition={{ duration: 11, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-r from-rose-900/30 via-black to-amber-900/30 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85" />
      <CinematicOverlay tint="warm" />

      {/* Bridge canvas */}
      <HeartCoherenceBridgeCanvas
        pacer={pacer}
        envelope={breath.envelope}
        coherence={coherence}
        phase={phase === "name" ? "settle" : phase === "reflect" ? "integrate" : phase}
        sendPulse={sendPulse}
      />

      {/* Top-left: phase pill */}
      <div className="absolute top-6 left-6 z-10">
        <motion.div
          key={phase}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 0.8, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-rose-200/75"
        >
          <span className="w-1 h-1 rounded-full bg-rose-200/80 animate-pulse" />
          {phase === "settle" && "settling"}
          {phase === "name" && "name"}
          {phase === "calibrate" && "listening"}
          {phase === "rounds" && `round ${round} of ${TOTAL_ROUNDS}`}
          {phase === "send" && "send"}
          {phase === "reflect" && "speak"}
          {phase === "integrate" && "rest"}
        </motion.div>
      </div>

      {/* Top-right: live signals */}
      <div className="absolute top-6 right-6 z-10 text-right space-y-1.5">
        <div className="flex items-center justify-end gap-1.5">
          {breath.ready ? <Mic className="w-3 h-3 text-rose-200/70" /> : <MicOff className="w-3 h-3 text-white/30" />}
          <span className="text-[10px] uppercase tracking-widest text-white/50">{breath.ready ? "mic" : "no mic"}</span>
        </div>
        {(phase === "rounds" || phase === "send" || phase === "reflect" || phase === "integrate") && (
          <>
            <p className="text-[10px] uppercase tracking-widest text-white/40">cycles · {breath.cycles}</p>
            <p className="text-[10px] uppercase tracking-widest text-amber-200/65">coherence · {Math.round(coherence * 100)}</p>
          </>
        )}
      </div>

      {/* Center label between shores during rounds */}
      {(phase === "rounds" || phase === "send") && name && (
        <div className="absolute inset-x-0 top-[20%] flex items-center justify-center pointer-events-none z-10">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 0.6 }}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-amber-100/70"
          >
            <Heart className="w-3 h-3" /> for {name}
          </motion.div>
        </div>
      )}

      {/* Shore labels */}
      {(phase === "rounds" || phase === "send" || phase === "integrate") && (
        <>
          <div className="absolute left-[10%] top-[68%] text-[9px] uppercase tracking-[0.3em] text-rose-200/50 pointer-events-none">you</div>
          <div className="absolute right-[10%] top-[68%] text-[9px] uppercase tracking-[0.3em] text-amber-200/55 pointer-events-none">{name || "them"}</div>
        </>
      )}

      {/* Bottom phase content */}
      <div className="absolute inset-x-0 bottom-24 z-10 flex flex-col items-center px-8 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "settle" && (
            <motion.div key="settle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1.6 }} className="text-center">
              <p className="text-4xl sm:text-5xl italic text-rose-50/90" style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.02em", textShadow: "0 0 40px rgba(253,224,71,0.3)" }}>heart coherence bridge</p>
              <p className="mt-6 text-sm text-white/55 max-w-xs mx-auto leading-relaxed tracking-wide">a span of breath, from one heart to another.</p>
            </motion.div>
          )}

          {phase === "name" && (
            <motion.div key="name" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} className="text-center pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-rose-50/90 mb-6 leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>whose face is on the other shore?</p>
              {name ? (
                <motion.p initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-4xl italic text-amber-200" style={{ fontFamily: "'Cormorant Garamond', serif", textShadow: "0 0 30px rgba(253,224,71,0.5)" }}>{name}</motion.p>
              ) : nameListening ? (
                <button onClick={stopName} className="px-6 py-2.5 rounded-full border border-rose-200/40 text-rose-100 text-[11px] uppercase tracking-[0.3em] bg-rose-500/10 backdrop-blur-sm animate-pulse" style={{ boxShadow: "0 0 30px rgba(244,114,182,0.2)" }}>
                  ● listening · tap to finish
                </button>
              ) : (
                <button onClick={startName} className="px-6 py-2.5 rounded-full border border-white/25 text-white/80 text-[11px] uppercase tracking-[0.3em] hover:bg-white/5 backdrop-blur-sm">
                  speak a name
                </button>
              )}
            </motion.div>
          )}

          {phase === "calibrate" && (
            <motion.p key="calibrate" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} className="text-2xl italic text-rose-50/80 text-center" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              breathe naturally
            </motion.p>
          )}

          {phase === "rounds" && (
            <motion.div key={`rounds-${round}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center">
              <motion.p key={pacer > 0.5 ? "in" : "out"} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 0.9, y: 0 }} transition={{ duration: 0.4 }} className="text-xs uppercase tracking-[0.42em] text-amber-100/85">
                {pacer > 0.5 ? "breathe in" : "let it cross"}
              </motion.p>
              <div className="mt-4 flex items-center justify-center gap-1.5">
                {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
                  <span
                    key={i}
                    className={`block h-1 rounded-full transition-all duration-700 ${
                      i < round ? "w-6 bg-amber-300/85" : i === round ? "w-3 bg-amber-300/45" : "w-1.5 bg-white/15"
                    }`}
                    style={i < round ? { boxShadow: "0 0 8px rgba(253,224,71,0.6)" } : undefined}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {phase === "send" && (
            <motion.div key="send" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} className="text-center">
              <p className="text-xs uppercase tracking-[0.42em] text-amber-100/85">{pacer > 0.5 ? "fill" : "send"}</p>
              {name && <p className="mt-4 text-2xl italic text-rose-200/80" style={{ fontFamily: "'Cormorant Garamond', serif" }}>to {name}</p>}
            </motion.div>
          )}

          {phase === "reflect" && (
            <motion.div key="reflect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} className="text-center pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-rose-50/90 mb-6 leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>what crossed the bridge?</p>
              {reflection ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg italic text-amber-100/85 max-w-md leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>"{reflection}"</motion.p>
              ) : reflectionListening ? (
                <button onClick={finalizeReflection} className="px-6 py-2.5 rounded-full border border-amber-200/40 text-amber-100 text-[11px] uppercase tracking-[0.3em] bg-amber-500/10 backdrop-blur-sm animate-pulse" style={{ boxShadow: "0 0 30px rgba(251,191,36,0.2)" }}>
                  ● listening · tap when done
                </button>
              ) : (
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">preparing…</p>
              )}
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="integrate" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 1.6 }} className="text-center">
              <p className="text-[10px] uppercase tracking-[0.42em] text-rose-200/70">rest</p>
              {reflection && <p className="mt-5 text-lg italic text-rose-100/60 max-w-sm leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>"{reflection}"</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip / safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-20 text-[10px] uppercase tracking-[0.3em] text-white/25 hover:text-rose-200/70 transition"
      >
        end · save
      </button>
    </div>
  );
}

export default function HeartCoherenceBridge() {
  const g = getLabGame("heart-coherence-bridge")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}
