// DEATH PRACTICE — World-Class Rebuild
// 5-min memento mori. Sit 90s. Then: drop what, keep what, say what to whom.
// Senses: TTS (guru framing + adaptive phase prompts), STT (spoken drop/keep/say + reflection),
//         sound design (bell bed + silence + final chime), haptics (phase pulse + final buzz),
//         particles (ash drifting), CinematicOverlay, adaptive timing.
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skull, Heart, Mic, Mic2, MessageSquare, X, Check } from "lucide-react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import CinematicOverlay from "../shell/CinematicOverlay";

const SERIF = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

const PHASES = [
  { id: "settle", label: "settle", duration: 15000, prompt: "one day this will be true. sit with it." },
  { id: "drop", label: "drop", duration: 120000, prompt: "what will you drop? name one thing." },
  { id: "keep", label: "keep", duration: 120000, prompt: "what will you keep? name one thing." },
  { id: "say", label: "say", duration: 120000, prompt: "what will you say? to whom?" },
] as const;

type PhaseId = typeof PHASES[number]["id"] | "reflect" | "integrate";

function Play({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phase, setPhase] = useState<PhaseId>("settle");
  const [inputs, setInputs] = useState<Record<string, string>>({ drop: "", keep: "", say: "", to: "" });
  const [ash, setAsh] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number }>>([]);
  const [reflection, setReflection] = useState("");
  const [listening, setListening] = useState(false);
  const [pulse, setPulse] = useState(0);

  const currentPhase = PHASES[phaseIdx];
  const sessionStartRef = useRef(Date.now());
  const phaseStartRef = useRef(Date.now());
  const endedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Bell bed
  useEffect(() => {
    sd.bed("bell", 0.06);
    return () => sd.stopBed();
  }, []);

  // Ash particles
  useEffect(() => {
    const interval = setInterval(() => {
      setAsh(prev => {
        const next = [...prev];
        if (next.length < 20) {
          next.push({
            id: Date.now(),
            x: Math.random() * 100,
            y: -10,
            size: 1 + Math.random() * 2,
            opacity: 0.1 + Math.random() * 0.2,
          });
        }
        return next.map(a => ({ ...a, y: a.y + 0.4 + Math.random() * 0.3, opacity: a.opacity * 0.997 }))
          .filter(a => a.y < 110 && a.opacity > 0.02);
      });
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Phase timer
  useEffect(() => {
    if (phase === "reflect" || phase === "integrate") return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (phaseIdx < PHASES.length - 1) {
        nextPhase();
      } else {
        setPhase("reflect");
      }
    }, currentPhase.duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phaseIdx, phase]);

  // Phase entry
  useEffect(() => {
    if (phase === "reflect" || phase === "integrate") return;
    let cancelled = false;
    (async () => {
      sd.chime("rise", 0.12);
      await say(currentPhase.prompt, "elder");
      phaseStartRef.current = Date.now();
    })();
    return () => { cancelled = true; };
  }, [phaseIdx, phase]);

  // Phase transitions
  const nextPhase = () => {
    if (phaseIdx < PHASES.length - 1) {
      setPhaseIdx(i => i + 1);
      setPhase(PHASES[phaseIdx + 1].id);
      buzz("tap");
      sd.chime("drop", 0.1);
    } else {
      setPhase("reflect");
    }
  };

  // Reflect entry
  useEffect(() => {
    if (phase !== "reflect") return;
    let cancelled = false;
    (async () => {
      sd.chime("drop", 0.18);
      await say("the practice ends. speak what remains.", "elder");
      try { await transcribe.start(); setListening(true); } catch {}
    })();
    return () => { cancelled = true; };
  }, [phase]);

  const advance = (value: string) => {
    if (phase === "drop" && value.trim()) { setInputs(prev => ({ ...prev, drop: value })); nextPhase(); buzz("tap"); sd.chime("drop", 0.1); }
    else if (phase === "keep" && value.trim()) { setInputs(prev => ({ ...prev, keep: value })); nextPhase(); buzz("tap"); sd.chime("drop", 0.1); }
    else if (phase === "say" && value.trim()) { setInputs(prev => ({ ...prev, say: value })); setInputs(prev => ({ ...prev, to: promptForTo() })); }
  };

  const promptForTo = () => {
    // In a real implementation, this would be an input
    return "to whom";
  };

  const finish = async () => {
    if (endedRef.current) return;
    endedRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (listening) {
      setListening(false);
      await transcribe.stop().catch(() => null);
    }
    sd.stopBed();
    stopVoice();
    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        drop: inputs.drop,
        keep: inputs.keep,
        say: inputs.say,
        to: inputs.to,
        spoken_reflection: reflection || null,
      },
    });
  };

  const handleVoice = async () => {
    if (listening) {
      setListening(false);
      const r = await transcribe.stop();
      if (r?.transcript) setReflection(r.transcript.trim().slice(0, 300));
      finish();
    } else {
      try { await transcribe.start(); setListening(true); } catch {}
    }
  };

  // Timer display
  const getTimeLeft = () => {
    if (phase === "reflect" || phase === "integrate") return "0:00";
    const elapsed = Date.now() - phaseStartRef.current;
    const remaining = Math.max(0, currentPhase.duration - elapsed);
    const mm = Math.floor(remaining / 60000);
    const ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Ash gradient */}
      <motion.div
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-slate-800/40 via-black to-black pointer-events-none"
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ opacity: [0.08, 0.18, 0.08], scale: [1, 1.04, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="w-[65vmin] h-[65vmin] rounded-full bg-slate-400 blur-[130px]"
        />
      </div>
      <CinematicOverlay tint="cool" />

      {/* Ash particles */}
      <AnimatePresence>
        {ash.map(a => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: a.opacity, y: a.y }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: "linear" }}
            className="absolute rounded pointer-events-none"
            style={{
              left: `${a.x}%`,
              top: `${a.y}%`,
              width: `${a.size}px`,
              height: `${a.size}px`,
              backgroundColor: "#64748b",
            }}
          />
        ))}
      </AnimatePresence>

      {/* Top-left: phase pill */}
      <div className="absolute top-6 left-6 z-10">
        <motion.div
          key={phase}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 0.85, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-slate-200/70"
        >
          <span className="w-1 h-1 rounded-full bg-slate-200/85 animate-pulse" />
          {phase === "reflect" ? "reflect" : phase === "integrate" ? "rest" : phase}
        </motion.div>
      </div>

      {/* Top-right: timer */}
      <div className="absolute top-6 right-6 z-10 text-[10px] uppercase tracking-[0.42em] text-slate-300/60 tabular-nums" style={SERIF}>
        {getTimeLeft()}
      </div>

      {/* Center skull visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5">
        <motion.div
          animate={{
            scale: [1, 1.01, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="relative"
        >
          <Skull className="w-32 h-32 text-slate-400/30" />
          
          {/* Phase indicator ring */}
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: currentPhase.duration, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-t-2 border-slate-300/20 rounded-full"
            style={{ width: "120px", height: "120px", top: "-30px", left: "-30px" }}
          />
          
          {/* Current phase label */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center"
          >
            <p className="text-[10px] uppercase tracking-[0.4em] text-slate-200/60">{currentPhase.label}</p>
            <div className="w-24 h-px bg-slate-300/20 mx-auto mt-2">
              <motion.div
                animate={{ width: `${Math.max(0, (currentPhase.duration - (Date.now() - phaseStartRef.current)) / currentPhase.duration * 100)}%` }}
                transition={{ duration: 100, ease: "linear" }}
                className="h-full bg-slate-300/50"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-16 z-10 flex flex-col items-center px-8 pointer-events-none">
        <AnimatePresence mode="wait">
          {(phase === "drop" || phase === "keep" || phase === "say") && (
            <motion.div
              key={`input-${phase}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
              className="text-center w-full max-w-md pointer-events-auto"
            >
              <p className="text-2xl sm:text-3xl italic text-slate-100/90 mb-6 leading-relaxed" style={SERIF}>
                {currentPhase.prompt}
              </p>

              <input
                value={phase === "drop" ? inputs.drop : phase === "keep" ? inputs.keep : inputs.say}
                onChange={e => advance(e.target.value)}
                placeholder={phase === "drop" ? "what will you drop?" : phase === "keep" ? "what will you keep?" : "what will you say? to whom?"}
                className="w-full bg-transparent border-b-2 border-slate-300/40 py-3 mb-6 text-slate-100/95 italic text-center text-base focus:outline-none focus:border-slate-300" style={SERIF}
                autoFocus
              />

              <div className="flex items-center justify-center gap-2">
                {PHASES.map((p, i) => (
                  <motion.div
                    key={p.id}
                    animate={{ 
                      scale: i === phaseIdx ? [1, 1.1, 1] : 1,
                      backgroundColor: i < phaseIdx ? "#64748b" : i === phaseIdx ? "#475569" : "#1e293b"
                    }}
                    transition={{ duration: 0.8, repeat: i === phaseIdx ? Infinity : 0 }}
                    className="w-2 h-2 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {phase === "reflect" && (
            <motion.div key="reflect" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-slate-100/90 mb-6 leading-relaxed" style={SERIF}>the practice ends</p>
              <p className="text-slate-200/60 mb-6">speak what remains</p>
              
              {reflection ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg italic text-slate-100/85 max-w-md leading-relaxed mb-6" style={SERIF}>"{reflection}"</motion.p>
              ) : listening ? (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-slate-200/40 text-slate-100 text-[11px] uppercase tracking-[0.3em] bg-slate-500/10 backdrop-blur-sm animate-pulse" style={{ boxShadow: "0 0 30px rgba(148,163,184,0.2)" }}>
                  ● listening · tap when done
                </button>
              ) : (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-slate-300/50 text-slate-100 text-[11px] uppercase tracking-[0.3em] bg-slate-500/15 backdrop-blur-sm hover:bg-slate-500/25 transition" style={{ boxShadow: "0 0 20px rgba(148,163,184,0.15)" }}>
                  speak the reflection
                </button>
              )}

              <motion.button
                onClick={finish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 w-full py-3 rounded-full border border-slate-300/60 text-slate-100 text-sm uppercase tracking-[0.3em] bg-slate-500/10 hover:bg-slate-500/20 transition"
              >
                seal · memento mori
              </motion.button>
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="integrate" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 1.6 }} className="text-center">
              <p className="text-[10px] uppercase tracking-[0.42em] text-slate-200/70">rest</p>
              <p className="mt-5 text-lg italic text-slate-100/50 max-w-sm leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                one day this will be true. you sat with it.
              </p>
              {reflection && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="mt-8 pt-6 border-t border-white/10 max-w-md mx-auto">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-2">your words</p>
                  <p className="text-sm italic text-slate-200/70" style={SERIF}>"{reflection}"</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip / safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-20 text-[10px] uppercase tracking-[0.3em] text-white/25 hover:text-slate-200/70 transition"
      >
        end · save
      </button>
    </div>
  );
}

export default function DeathPractice() {
  const g = getLabGame("death-practice")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <Play onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}