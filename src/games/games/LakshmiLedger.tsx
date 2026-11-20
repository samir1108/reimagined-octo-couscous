// LAKSHMI LEDGER — World-Class Rebuild
// Four currents this week — inflow, outflow, leak, seed. Feel the flow, not the fear.
// Senses: TTS (guru framing + adaptive flow prompts), STT (spoken reflection + feeling),
//         sound design (coin chimes + water flow bed + abundance swell), haptics (current pulse + feeling buzz),
//         particles (golden coins flowing), CinematicOverlay, adaptive feeling calibration.
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowUp, Droplet, Sprout, Heart, Mic, Mic2 } from "lucide-react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import CinematicOverlay from "../shell/CinematicOverlay";

const SERIF = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

const CURRENTS = [
  { id: "inflow", label: "inflow", prompt: "one source that fed you this week", icon: <ArrowDown className="w-5 h-5" />, color: "emerald" },
  { id: "outflow", label: "outflow", prompt: "one place you paid gladly", icon: <ArrowUp className="w-5 h-5" />, color: "rose" },
  { id: "leak", label: "leak", prompt: "one place it slipped without value", icon: <Droplet className="w-5 h-5" />, color: "amber" },
  { id: "seed", label: "seed", prompt: "one small planting for later", icon: <Sprout className="w-5 h-5" />, color: "green" },
] as const;

type Feeling = "scarce" | "neutral" | "abundant" | null;

function Play({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [stage, setStage] = useState<"currents" | "feeling" | "reflect" | "integrate">("currents");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({ inflow: "", outflow: "", leak: "", seed: "" });
  const [feeling, setFeeling] = useState<Feeling>(null);
  const [coins, setCoins] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number; rotation: number; color: string }>>([]);
  const [reflection, setReflection] = useState("");
  const [listening, setListening] = useState(false);
  const [pulse, setPulse] = useState(0);

  const currentCurrent = CURRENTS[currentIdx];
  const completedCount = CURRENTS.filter(c => values[c.id].trim()).length;
  const allCurrentsDone = CURRENTS.every(c => values[c.id].trim());
  const sessionStartRef = useRef(Date.now());
  const endedRef = useRef(false);

  // Water flow bed
  useEffect(() => {
    sd.bed("water", 0.1);
    return () => sd.stopBed();
  }, []);

  // Golden coins flowing
  useEffect(() => {
    const interval = setInterval(() => {
      setCoins(prev => {
        const next = [...prev];
        if (next.length < 24) {
          const colors = { inflow: "#86efac", outflow: "#fda4af", leak: "#fde047", seed: "#86efac" };
          next.push({
            id: Date.now(),
            x: Math.random() * 100,
            y: 110,
            size: 6 + Math.random() * 10,
            opacity: 0.3 + Math.random() * 0.4,
            rotation: Math.random() * 360,
            color: colors[currentCurrent?.id as keyof typeof colors] || "#fde047",
          });
        }
        return next.map(c => ({ ...c, y: c.y - 1.5 - Math.random() * 1, rotation: c.rotation + 2, opacity: c.opacity * 0.995 }))
          .filter(c => c.y > -20 && c.opacity > 0.02);
      });
    }, 300);
    return () => clearInterval(interval);
  }, [currentCurrent]);

  // Stage entry
  useEffect(() => {
    if (stage !== "currents") return;
    let cancelled = false;
    (async () => {
      if (currentIdx < CURRENTS.length) {
        sd.chime("rise", 0.12);
        await say(currentCurrent!.prompt, "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [currentIdx, stage]);

  // Completion handler
  useEffect(() => {
    if (stage !== "feeling") return;
    let cancelled = false;
    (async () => {
      sd.chime("rise", 0.15);
      await say("four currents named. how did money feel this week? scarce, neutral, or abundant?", "guru");
    })();
    return () => { cancelled = true; };
  }, [stage]);

  // All currents done -> feeling
  useEffect(() => {
    if (allCurrentsDone && stage === "currents") {
      setStage("feeling");
    }
  }, [allCurrentsDone, stage]);

  // Feeling chosen -> reflect
  useEffect(() => {
    if (feeling) {
      setStage("reflect");
    }
  }, [feeling]);

  // Reflect entry
  useEffect(() => {
    if (stage !== "reflect") return;
    let cancelled = false;
    (async () => {
      sd.chime("drop", 0.18);
      await say(`you felt ${feeling}. speak what the flow taught you.`, "guru");
      try { await transcribe.start(); setListening(true); } catch {}
    })();
    return () => { cancelled = true; };
  }, [stage]);

  const advance = (value: string) => {
    if (currentIdx < CURRENTS.length) {
      setValues(prev => ({ ...prev, [currentCurrent!.id]: value }));
      buzz("tap");
      sd.chime("drop", 0.12);
      setPulse(p => p + 1);
      if (currentIdx < CURRENTS.length - 1) {
        setCurrentIdx(i => i + 1);
      }
    }
  };

  const finish = async () => {
    if (endedRef.current) return;
    endedRef.current = true;
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
        inflow: values.inflow,
        outflow: values.outflow,
        leak: values.leak,
        seed: values.seed,
        feeling: feeling,
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

  const setFeelingChoice = (f: Feeling) => {
    setFeeling(f);
    buzz(f === "abundant" ? "exhale" : f === "scarce" ? "heavy" : "tap");
    sd.chime(f === "abundant" ? "rise" : f === "scarce" ? "drop" : "drop", 0.15);
    setPulse(p => p + 1);
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Gold-amber flow gradient */}
      <motion.div
        animate={{ opacity: [0.08, 0.22, 0.08] }}
        transition={{ duration: 14, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-br from-yellow-950/25 via-black to-amber-950/20 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
      <CinematicOverlay tint="warm" />

      {/* Golden coins flowing up */}
      <AnimatePresence>
        {coins.map(c => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, scale: 0, y: 10, rotate: c.rotation }}
            animate={{ opacity: c.opacity, scale: 1, y: c.y, rotate: c.rotation + 360 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: "linear" }}
            className="absolute pointer-events-none"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: `${c.size}px`,
              height: `${c.size}px`,
              backgroundColor: c.color,
              clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
              transform: `rotate(${c.rotation}deg)`,
              transformOrigin: "center",
            }}
          />
        ))}
      </AnimatePresence>

      {/* Top-left: phase pill */}
      <div className="absolute top-6 left-6 z-10">
        <motion.div
          key={stage}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 0.85, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-yellow-200/75"
        >
          <span className="w-1 h-1 rounded-full bg-yellow-200/80 animate-pulse" />
          {stage === "currents" ? `current ${currentIdx + 1} / ${CURRENTS.length}` : stage === "feeling" ? "feeling" : stage === "reflect" ? "reflect" : "rest"}
        </motion.div>
      </div>

      {/* Top-right: progress */}
      <div className="absolute top-6 right-6 z-10 text-right space-y-1.5">
        <div className="flex items-center justify-end gap-1.5">
          <Heart className="w-3 h-3 text-yellow-200/60" />
          <span className="text-[10px] uppercase tracking-widest text-white/50">{completedCount} / {CURRENTS.length}</span>
        </div>
        {stage === "feeling" && feeling && (
          <p className="text-[10px] uppercase tracking-widest text-yellow-200/65">feeling · {feeling}</p>
        )}
      </div>

      {/* Center flow visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5">
        <motion.div
          animate={{
            scale: [1, 1.01, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="relative"
        >
          <div className="relative w-40 h-40">
            <motion.div
              animate={{ scale: [1, 1.03, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/20 via-yellow-400/15 to-rose-400/20 blur-xl"
            />
            <motion.div
              animate={{ rotate: [0, 2, -2, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-5xl text-yellow-300/50">ॐ</div>
            </motion.div>
          </div>

          {/* Current indicator */}
          {stage === "currents" && currentCurrent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2"
            >
              <div className={`w-12 h-12 flex items-center justify-center rounded-full ${currentCurrent.color === "emerald" ? "bg-emerald-500/30" : currentCurrent.color === "rose" ? "bg-rose-500/30" : currentCurrent.color === "amber" ? "bg-amber-500/30" : "bg-green-500/30"}`}>
                {currentCurrent.icon}
              </div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-yellow-200/70">{currentCurrent.label}</p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-16 z-10 flex flex-col items-center px-8 pointer-events-none">
        <AnimatePresence mode="wait">
          {stage === "currents" && currentCurrent && (
            <motion.div key={`current-${currentCurrent.id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-[10px] uppercase tracking-[0.42em] text-yellow-200/60 mb-2">{currentCurrent.label}</p>
              <p className="text-2xl sm:text-3xl italic text-white/90 mb-6 leading-relaxed" style={SERIF}>
                {currentCurrent.prompt}
              </p>

              <input
                value={values[currentCurrent.id]}
                onChange={e => advance(e.target.value)}
                placeholder={currentCurrent.prompt}
                className="w-full bg-transparent border-b-2 border-yellow-300/40 py-3 mb-6 text-white/90 italic text-center text-base focus:outline-none focus:border-yellow-300" style={SERIF}
                autoFocus
              />

              <div className="flex items-center justify-center gap-2">
                {CURRENTS.map((c, i) => (
                  <motion.div
                    key={c.id}
                    animate={{ scale: i === currentIdx ? [1, 1.1, 1] : 1, backgroundColor: values[c.id] ? (c.color === "emerald" ? "#86efac" : c.color === "rose" ? "#fda4af" : c.color === "amber" ? "#fde047" : "#86efac") : "white" }}
                    transition={{ duration: 0.8, repeat: i === currentIdx ? Infinity : 0 }}
                    className="w-2 h-2 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {stage === "feeling" && (
            <motion.div key="feeling" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-white/90 mb-2 leading-relaxed" style={SERIF}>four currents named</p>
              <p className="text-white/40 text-sm mb-6">how did money feel this week?</p>
              
              <div className="flex gap-3 mb-6">
                {["scarce", "neutral", "abundant"].map(f => (
                  <motion.button
                    key={f}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFeelingChoice(f as Feeling)}
                    className={`flex-1 py-4 px-6 rounded-xl border-2 text-center ${feeling === f ? `border-${f === "abundant" ? "emerald" : f === "scarce" ? "rose" : "yellow"}-400/70 bg-${f === "abundant" ? "emerald" : f === "scarce" ? "rose" : "yellow"}-500/15` : "border-white/15 bg-white/5"}`}
                  >
                    <p className="text-sm font-medium text-white/90 capitalize">{f}</p>
                    <p className="text-[10px] text-white/40">feel the truth</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {stage === "reflect" && (
            <motion.div key="reflect" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-white/90 mb-2 leading-relaxed" style={SERIF}>you felt {feeling}</p>
              <p className="text-white/40 text-sm mb-6">speak what the flow taught you</p>
              
              {reflection ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg italic text-yellow-100/85 max-w-md leading-relaxed mb-6" style={SERIF}>"{reflection}"</motion.p>
              ) : listening ? (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-yellow-200/40 text-yellow-100 text-[11px] uppercase tracking-[0.3em] bg-yellow-500/10 backdrop-blur-sm animate-pulse" style={{ boxShadow: "0 0 30px rgba(251,191,36,0.2)" }}>
                  ● listening · tap when done
                </button>
              ) : (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-yellow-300/50 text-yellow-100 text-[11px] uppercase tracking-[0.3em] bg-yellow-500/15 backdrop-blur-sm hover:bg-yellow-500/25 transition" style={{ boxShadow: "0 0 20px rgba(251,191,36,0.15)" }}>
                  speak the reflection
                </button>
              )}

              <motion.button
                onClick={finish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 w-full py-3 rounded-full border border-yellow-300/60 text-yellow-100 text-sm uppercase tracking-[0.3em] bg-yellow-500/10 hover:bg-yellow-500/20 transition"
              >
                seal · the ledger
              </motion.button>
            </motion.div>
          )}

          {stage === "integrate" && (
            <motion.div key="integrate" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 1.6 }} className="text-center">
              <p className="text-[10px] uppercase tracking-[0.42em] text-yellow-200/70">rest</p>
              <p className="mt-5 text-lg italic text-yellow-100/50 max-w-sm leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                the flow is seen. the ledger is closed.
              </p>
              {reflection && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="mt-8 pt-6 border-t border-white/10 max-w-md mx-auto">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-2">your words</p>
                  <p className="text-sm italic text-yellow-200/70" style={SERIF}>"{reflection}"</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip / safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-20 text-[10px] uppercase tracking-[0.3em] text-white/25 hover:text-yellow-200/70 transition"
      >
        end · save
      </button>
    </div>
  );
}

export default function LakshmiLedger() {
  const g = getLabGame("lakshmi-ledger")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <Play onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}