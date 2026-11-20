// BREATH LADDER v2 — 4-7-8 pranayama cinematic build.
// Voice + mic + haptics + cinematic orb. Four rounds, ~76s.

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useBreathMic } from "../shell/useBreathMic";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import CinematicOverlay from "../shell/CinematicOverlay";

const SERIF: React.CSSProperties = { fontFamily: '"Cormorant Garamond", Georgia, serif' };
const ROUNDS = 4;
type Step = "settle" | "in" | "hold" | "out" | "done";

function Play({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [step, setStep] = useState<Step>("settle");
  const [round, setRound] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const sessionStartRef = useRef(Date.now());
  const endedRef = useRef(false);

  useEffect(() => { sd.bed("temple", 0.09); return () => { sd.stopBed(); stopVoice(); }; }, []); // eslint-disable-line

  useEffect(() => {
    let mounted = true;
    const wait = (ms: number) => new Promise<void>((res) => {
      let left = Math.ceil(ms / 1000);
      setCountdown(left);
      const id = setInterval(() => {
        left -= 1; if (mounted) setCountdown(left);
        if (left <= 0) { clearInterval(id); res(); }
      }, 1000);
    });
    (async () => {
      sd.chime("rise", 0.12);
      await say("four seconds in. hold seven. release eight. four rounds.", "guru");
      if (!mounted) return;
      for (let i = 0; i < ROUNDS && mounted; i++) {
        setRound(i + 1);
        setStep("in"); sd.chime("rise", 0.1); buzz("inhale"); say("inhale four", "guru"); await wait(4000);
        if (!mounted) return;
        setStep("hold"); say("hold seven", "guru"); await wait(7000);
        if (!mounted) return;
        setStep("out"); sd.chime("drop", 0.1); buzz("exhale"); say("exhale eight", "guru"); await wait(8000);
      }
      if (!mounted) return;
      setStep("done"); sd.chime("drop", 0.14);
      await say("the nervous system just downshifted. rest a moment.", "guru");
      if (!mounted || endedRef.current) return;
      endedRef.current = true;
      onEnd({
        outcome: "completed",
        signals: {
          duration_ms: Date.now() - sessionStartRef.current,
          rounds_completed: ROUNDS,
          mic_cycles: breath.cycles,
          last_exhale_ms: breath.lastExhaleMs,
          mic_ready: breath.ready,
        },
      });
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orbScale = step === "in" ? 1.55 : step === "out" ? 0.55 : step === "hold" ? 1.55 : 1;
  const orbDuration = step === "in" ? 4 : step === "out" ? 8 : step === "hold" ? 0.4 : 1;

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Base gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/40 via-black to-teal-950/30" />
      <CinematicOverlay tint="cool" />

      {/* Phase pill */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <motion.div key={step} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 0.9, x: 0 }} transition={{ duration: 0.6 }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-emerald-100/75">
          <span className="w-1 h-1 rounded-full bg-emerald-200/85 animate-pulse" />
          <span>
            {step === "settle" && "4 · 7 · 8"}
            {(step === "in" || step === "hold" || step === "out") && `round ${round} of ${ROUNDS}`}
            {step === "done" && "rest"}
          </span>
        </motion.div>
      </div>

      <div className="absolute top-6 right-6 z-30 pointer-events-none flex items-center gap-1.5">
        {breath.ready ? <Mic className="w-3 h-3 text-emerald-200/70" /> : <MicOff className="w-3 h-3 text-white/30" />}
        <span className="text-[10px] uppercase tracking-widest text-white/50">{breath.ready ? "mic" : "no mic"}</span>
      </div>

      {/* Orb */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <motion.div
            animate={{ scale: orbScale }}
            transition={{ duration: orbDuration, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle at 35% 30%, rgba(180,255,220,0.6) 0%, rgba(80,200,170,0.35) 40%, rgba(20,80,90,0.5) 100%)",
              boxShadow: "0 0 80px rgba(80,200,170,0.35), 0 0 20px rgba(180,255,220,0.25) inset",
              filter: "blur(2px)",
            }}
          />
          <motion.div
            animate={{ scale: orbScale * 0.8 }}
            transition={{ duration: orbDuration, ease: "easeInOut" }}
            className="absolute inset-4 rounded-full border border-emerald-100/25"
          />
          {step !== "settle" && step !== "done" && (
            <p style={SERIF} className="relative text-4xl italic font-light text-emerald-50/95 tabular-nums drop-shadow-[0_0_20px_rgba(180,255,220,0.35)]">
              {countdown}
            </p>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
            style={SERIF}
            className="mt-10 text-2xl italic font-light text-emerald-50/85 tracking-wide"
          >
            {step === "settle" && "breath ladder"}
            {step === "in" && "inhale"}
            {step === "hold" && "hold"}
            {step === "out" && "release"}
            {step === "done" && "rest"}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Round dots */}
      <div className="absolute bottom-8 inset-x-0 z-30 flex justify-center gap-2 pointer-events-none">
        {Array.from({ length: ROUNDS }).map((_, k) => (
          <div key={k} className={`h-[2px] w-8 rounded-full transition-all ${k < round ? "bg-emerald-200/70" : "bg-white/10"}`} />
        ))}
      </div>
    </div>
  );
}

export default function BreathLadder() {
  const g = getLabGame("breath-ladder")!;
  return <ConsciousGameShell game={labToMeta(g)}>{({ onEnd }) => <Play onEnd={onEnd} />}</ConsciousGameShell>;
}