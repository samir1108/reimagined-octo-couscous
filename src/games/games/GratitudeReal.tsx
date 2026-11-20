// GRATITUDE REAL — World-Class Rebuild
// The uncomfortable kind. Body · near-miss · the one you'd rather not admit · a person unseen.
// Senses: TTS (guru framing + adaptive warmth), STT (spoken gratitude + reflection),
//         sound design (heartbeat bed + chimes + warmth swell), haptics (pulse per gratitude),
//         particles (rose gold motes), CinematicOverlay, adaptive warmth calibration.
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, User, Eye, Mic, Mic2 } from "lucide-react";
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
  { id: "body", label: "body", prompt: "one thing your body was quietly grateful for today.", icon: <Heart className="w-6 h-6" />, color: "rose" },
  { id: "almost", label: "near-miss", prompt: "one thing that almost went wrong — and didn't.", icon: <Sparkles className="w-6 h-6" />, color: "amber" },
  { id: "quiet", label: "unspoken", prompt: "one thing you're grateful for that you'd rather not admit.", icon: <Eye className="w-6 h-6" />, color: "orange" },
  { id: "who", label: "unseen", prompt: "one person — who does not know you noticed them.", icon: <User className="w-6 h-6" />, color: "rose" },
] as const;

type PhaseId = typeof PHASES[number]["id"];
type Phase = typeof PHASES[number]["id"] | "reflect" | "integrate";

function Play({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [phaseIdx, setPhaseIdx] = useState(0);
  const [inputs, setInputs] = useState<Record<PhaseId, string>>({ body: "", almost: "", quiet: "", who: "" });
  const [warmth, setWarmth] = useState(6);
  const [motes, setMotes] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number; color: string }>>([]);
  const [reflection, setReflection] = useState("");
  const [listening, setListening] = useState(false);
  const [pulse, setPulse] = useState(0);

  const currentPhase = phaseIdx < PHASES.length ? PHASES[phaseIdx] : null;
  const isInputPhase = phaseIdx < PHASES.length;
  const isComplete = PHASES.every(p => inputs[p.id].trim());
  const sessionStartRef = useRef(Date.now());
  const endedRef = useRef(false);

  // Heartbeat bed
  useEffect(() => {
    sd.bed("heartbeat", 0.15);
    return () => sd.stopBed();
  }, []);

  // Rose gold motes
  useEffect(() => {
    const interval = setInterval(() => {
      setMotes(prev => {
        const next = [...prev];
        if (next.length < 24) {
          const phaseColor = currentPhase?.color || "rose";
          const colors = {
            rose: ["#fda4af", "#f472b6", "#e879f9"],
            amber: ["#fde047", "#fbbf24", "#f59e0b"],
            orange: ["#fdba74", "#fb923c", "#f97316"],
          };
          next.push({
            id: Date.now(),
            x: Math.random() * 100,
            y: 100 + Math.random() * 20,
            size: 2 + Math.random() * 4,
            opacity: 0.2 + Math.random() * 0.3,
            color: colors[phaseColor as keyof typeof colors][Math.floor(Math.random() * 3)],
          });
        }
        return next.filter(m => Date.now() - m.id < 8000);
      });
    }, 600);
    return () => clearInterval(interval);
  }, [currentPhase]);

  // Phase entry
  useEffect(() => {
    if (!isInputPhase) return;
    let cancelled = false;
    (async () => {
      sd.chime("rise", 0.15);
      await say(currentPhase!.prompt, "guru");
    })();
    return () => { cancelled = true; };
  }, [phaseIdx]);

  // Completion handler
  useEffect(() => {
    if (!isComplete) return;
    (async () => {
      sd.chime("rise", 0.2);
      await say("four gratitudes named. the uncomfortable kind. speak the reflection.", "guru");
      try { await transcribe.start(); setListening(true); } catch {}
    })();
  }, [isComplete]);

  const advance = (value: string) => {
    if (!currentPhase) return;
    setInputs(prev => ({ ...prev, [currentPhase.id]: value }));
    buzz("tap");
    sd.chime("drop", 0.12);
    setPulse(p => p + 1);
    if (phaseIdx < PHASES.length - 1) setPhaseIdx(i => i + 1);
  };

  const finish = async () => {
    if (endedRef.current) return;
    endedRef.current = true;
    if (listening) {
      setListening(false);
      const r = await transcribe.stop().catch(() => null);
      if (r?.transcript) setReflection(r.transcript.trim().slice(0, 300));
    }
    sd.stopBed();
    stopVoice();
    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        body_gratitude: inputs.body,
        almost_gratitude: inputs.almost,
        quiet_gratitude: inputs.quiet,
        unseen_person: inputs.who,
        warmth: warmth,
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

  const completedCount = PHASES.filter(p => inputs[p.id].trim()).length;

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Rose-amber warmth gradient */}
      <motion.div
        animate={{ opacity: [0.12, 0.28, 0.12] }}
        transition={{ duration: 11, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-b from-rose-950/25 via-black to-amber-950/20 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
      <CinematicOverlay tint="warm" />

      {/* Rose gold motes */}
      <AnimatePresence>
        {motes.map(m => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: m.opacity, scale: 1, y: -40 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 4, ease: "easeOut" }}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${m.x}%`,
              top: `${m.y}%`,
              width: `${m.size}px`,
              height: `${m.size}px`,
              backgroundColor: m.color,
              filter: "blur(1px)",
            }}
          />
        ))}
      </AnimatePresence>

      {/* Top-left: phase pill */}
      <div className="absolute top-6 left-6 z-10">
        <motion.div
          key={phaseIdx}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 0.85, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-rose-200/75"
        >
          <span className="w-1 h-1 rounded-full bg-rose-200/80 animate-pulse" />
          {isInputPhase ? currentPhase?.label : phaseIdx === PHASES.length ? "reflect" : "rest"}
        </motion.div>
      </div>

      {/* Top-right: progress */}
      <div className="absolute top-6 right-6 z-10 text-right space-y-1.5">
        <div className="flex items-center justify-end gap-1.5">
          <Heart className="w-3 h-3 text-rose-200/60" />
          <span className="text-[10px] uppercase tracking-widest text-white/50">{completedCount} / {PHASES.length}</span>
        </div>
        {phaseIdx === PHASES.length && (
          <p className="text-[10px] uppercase tracking-widest text-rose-200/65">warmth · {warmth}/10</p>
        )}
      </div>

      {/* Center heart visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5">
        <motion.div
          animate={{
            scale: [1, 1.02, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="relative"
        >
          <div className="relative w-32 h-32">
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-gradient-to-t from-rose-400/20 to-amber-300/10 blur-xl"
            />
            <motion.div
              animate={{ rotate: [0, 2, -2, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Heart className="w-12 h-12 text-rose-300/50" />
            </motion.div>
          </div>
          
          {/* Completed gratitude markers */}
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex gap-1">
            {PHASES.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: inputs[p.id] ? 1 : 0.3, scale: inputs[p.id] ? 1 : 0.8 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: inputs[p.id] ? (p.color === "rose" ? "#fda4af" : p.color === "amber" ? "#fde047" : "#fdba74") : "white" }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-16 z-10 flex flex-col items-center px-8 pointer-events-none">
        <AnimatePresence mode="wait">
          {isInputPhase && currentPhase && (
            <motion.div
              key={`input-${currentPhase.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
              className="text-center w-full max-w-md pointer-events-auto"
            >
              <p className="text-[10px] uppercase tracking-[0.42em] text-rose-200/60 mb-2">{currentPhase.label}</p>
              <p className="text-2xl sm:text-3xl italic text-white/90 mb-6 leading-relaxed" style={SERIF}>
                {currentPhase.prompt}
              </p>

              <input
                value={inputs[currentPhase.id]}
                onChange={e => advance(e.target.value)}
                placeholder={
                  currentPhase.id === "body" ? "warm water · the chair · one deep breath" :
                  currentPhase.id === "almost" ? "the near miss · she picked up · the door held" :
                  currentPhase.id === "quiet" ? "the money · the ex · being alone" :
                  "the guard · the friend · mom"
                }
                className="w-full bg-transparent border-b-2 border-rose-300/40 py-3 mb-6 text-white/90 italic text-center text-base focus:outline-none focus:border-rose-300" style={SERIF}
                autoFocus
              />

              <div className="flex items-center justify-center gap-2">
                {PHASES.map((p, i) => (
                  <motion.div
                    key={p.id}
                    animate={{ scale: i === phaseIdx ? [1, 1.1, 1] : 1, backgroundColor: inputs[p.id] ? (p.color === "rose" ? "#fda4af" : p.color === "amber" ? "#fde047" : "#fdba74") : "white" }}
                    transition={{ duration: 0.8, repeat: i === phaseIdx ? Infinity : 0 }}
                    className="w-2 h-2 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {phaseIdx === PHASES.length && (
            <motion.div
              key="warmth"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center w-full max-w-md pointer-events-auto"
            >
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mb-6"
              >
                <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-t from-rose-300/30 to-transparent blur-2xl" />
              </motion.div>

              <p className="text-2xl italic text-rose-50/90 mb-6 leading-relaxed" style={SERIF}>
                four gratitudes named
              </p>

              <div className="space-y-3 mb-6 p-6 bg-rose-500/10 rounded-2xl border border-rose-300/20 text-left">
                {PHASES.map(p => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: PHASES.indexOf(p) * 0.1, duration: 0.4 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-rose-300/60">{p.icon}</div>
                    <p className="italic text-rose-100/85 pt-1" style={SERIF}>"{inputs[p.id]}"</p>
                  </motion.div>
                ))}
              </div>

              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">warmth in chest — after</p>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-rose-200/60 text-sm">cold</span>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={warmth}
                    onChange={e => setWarmth(+e.target.value)}
                    className="w-64 h-2 accent-rose-300"
                  />
                  <span className="text-rose-200/60 text-sm">{warmth}/10</span>
                </div>
              </div>

              {reflection ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg italic text-rose-100/85 max-w-md leading-relaxed mb-6" style={SERIF}>
                  "{reflection}"
                </motion.p>
              ) : listening ? (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-rose-200/40 text-rose-100 text-[11px] uppercase tracking-[0.3em] bg-rose-500/10 backdrop-blur-sm animate-pulse" style={{ boxShadow: "0 0 30px rgba(244,114,182,0.2)" }}>
                  ● listening · tap when done
                </button>
              ) : (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-rose-300/50 text-rose-100 text-[11px] uppercase tracking-[0.3em] bg-rose-500/15 backdrop-blur-sm hover:bg-rose-500/25 transition" style={{ boxShadow: "0 0 20px rgba(244,114,182,0.15)" }}>
                  speak the reflection
                </button>
              )}

              <motion.button
                onClick={finish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 w-full py-3 rounded-full border border-rose-300/60 text-rose-100 text-sm uppercase tracking-[0.3em] bg-rose-500/10 hover:bg-rose-500/20 transition"
              >
                seal · the gratitude
              </motion.button>
            </motion.div>
          )}

          {phaseIdx === PHASES.length + 1 && (
            <motion.div key="integrate" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 1.6 }} className="text-center">
              <p className="text-[10px] uppercase tracking-[0.42em] text-rose-200/70">rest</p>
              <p className="mt-5 text-lg italic text-rose-100/50 max-w-sm leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                gratitude that hurts a little is the real kind.
              </p>
              {reflection && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="mt-8 pt-6 border-t border-white/10 max-w-md mx-auto">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-2">your words</p>
                  <p className="text-sm italic text-rose-200/70" style={SERIF}>"{reflection}"</p>
                </motion.div>
              )}
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

export default function GratitudeReal() {
  const g = getLabGame("gratitude-real")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <Play onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}