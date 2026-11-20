// REST PERMISSION — World-Class Rebuild (BODY faculty)
// the body speaks. listen..
// Senses: TTS (guru framing + adaptive prompts), STT (spoken reflection),
//         sound design (breath chimes + water bed), haptics (choice pulse + reflection buzz),
//         particles (body motes), CinematicOverlay, adaptive body calibration.
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Leaf, Sun } from "lucide-react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import CinematicOverlay from "../shell/CinematicOverlay";

const SERIF = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

const PHASES = ["prompt", "reflect", "integrate"] as const;
type Phase = typeof PHASES[number];

function Play({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [phaseIdx, setPhaseIdx] = useState(0);
  const phase = PHASES[phaseIdx];
  const [reflection, setReflection] = useState("");
  const [listening, setListening] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number; color: string }>>([]);
  const [pulse, setPulse] = useState(0);

  const sessionStartRef = useRef(Date.now());
  const endedRef = useRef(false);

  // water bed
  useEffect(() => {
    sd.bed("water", 0.1);
    return () => sd.stopBed();
  }, []);

  // body particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => {
        const next = [...prev];
        const colors = ["#86efac","#34d399","#10b981"];
        if (next.length < 20) {
          next.push({
            id: Date.now(),
            x: Math.random() * 100,
            y: 100 + Math.random() * 20,
            size: 3 + Math.random() * 5,
            opacity: 0.2 + Math.random() * 0.3,
            color: colors[Math.floor(Math.random() * colors.length)],
          });
        }
        return next.filter(p => Date.now() - p.id < 8000);
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Phase entry
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "prompt") {
        sd.chime("rise", 0.12);
        await say("the body speaks. listen.", "guru");
      } else if (phase === "reflect") {
        sd.chime("drop", 0.18);
        await say("what does the body say when this moment?", "guru");
        try { await transcribe.start(); setListening(true); } catch {}
      } else if (phase === "integrate") {
        if (listening) {
          setListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setReflection(r.transcript.trim().slice(0, 300));
        }
        sd.chime("drop", 0.15);
        stopVoice();
        await say("the body was heard. the listening continues.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  const advance = () => {
    if (phaseIdx < PHASES.length - 1) {
      setPhaseIdx(i => i + 1);
      sd.chime("drop", 0.1);
      buzz("tap");
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

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* body gradient */}
      <motion.div
        animate={{ opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-br from-emerald-950/25 via-black to-teal-950/20 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
      <CinematicOverlay tint="cool" />

      {/* body particles */}
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: p.opacity, scale: 1, y: -30 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 4, ease: "easeOut" }}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              filter: "blur(1px)",
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
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-emerald-200/75"
        >
          <span className="w-1 h-1 rounded-full bg-emerald-200/80 animate-pulse" />
          {phase}
        </motion.div>
      </div>

      {/* Top-right: body indicator */}
      <div className="absolute top-6 right-6 z-10 text-right space-y-1.5">
        <div className="flex items-center justify-end gap-1.5">
          <Heart className="w-3 h-3 text-emerald-200/60" />
          <span className="text-[10px] uppercase tracking-widest text-white/50">body</span>
        </div>
      </div>

      {/* Center visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5">
        <motion.div
          animate={{
            scale: [1, 1.01, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="relative"
        >
          <motion.div
            animate={{ scale: [1, 1.03, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-32 h-32 rounded-full bg-gradient-to-t from-emerald-400/20 to-transparent blur-xl"
          />
          <motion.div
            animate={{ rotate: [0, 2, -2, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Heart className="w-12 h-12 text-emerald-300/50" />
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-16 z-10 flex flex-col items-center px-8 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "prompt" && (
            <motion.div key="prompt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-white/90 mb-6 leading-relaxed" style={SERIF}>Rest Permission</p>
              <p className="text-white/55 italic mb-6 leading-relaxed" style={SERIF}>the body speaks. listen.. what does the body say when this moment?</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={advance}
                className="w-full py-3 rounded-full text-sm border border-emerald-300/60 text-emerald-100 bg-emerald-500/10 hover:bg-emerald-500/20 transition"
              >
                begin · reflect
              </motion.button>
            </motion.div>
          )}

          {phase === "reflect" && (
            <motion.div key="reflect" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-white/90 mb-6 leading-relaxed" style={SERIF}>what does the body say when you pause?</p>
              
              {reflection ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg italic text-emerald-100/85 max-w-md leading-relaxed mb-6" style={SERIF}>"${reflection}"</motion.p>
              ) : listening ? (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-emerald-200/40 text-emerald-100 text-[11px] uppercase tracking-[0.3em] bg-emerald-500/10 backdrop-blur-sm animate-pulse" style={{ boxShadow: "0 0 30px rgba(0,0,0,0.2)" }}>
                  ● listening · tap when done
                </button>
              ) : (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-emerald-300/50 text-emerald-100 text-[11px] uppercase tracking-[0.3em] bg-emerald-500/15 backdrop-blur-sm hover:bg-emerald-500/25 transition" style={{ boxShadow: "0 0 20px rgba(0,0,0,0.15)" }}>
                  speak the reflection
                </button>
              )}
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="integrate" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 1.6 }} className="text-center">
              <p className="text-[10px] uppercase tracking-[0.42em] text-emerald-200/70">rest</p>
              <p className="mt-5 text-lg italic text-emerald-100/50 max-w-sm leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                the body was heard. the listening continues.
              </p>
              {reflection && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="mt-8 pt-6 border-t border-white/10 max-w-md mx-auto">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-2">your words</p>
                  <p className="text-sm italic text-emerald-200/70" style={SERIF}>"${reflection}"</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip / safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-20 text-[10px] uppercase tracking-[0.3em] text-white/25 hover:text-emerald-200/70 transition"
      >
        end · save
      </button>
    </div>
  );
}

export default function RestPermission() {
  const g = getLabGame("rest-permission")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <Play onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}
