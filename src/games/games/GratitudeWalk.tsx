// GRATITUDE WALK — World-Class Rebuild
// Three embodied steps. Three thanks. Not for a list — for a body.
// Senses: TTS (guru framing + adaptive warmth prompts), STT (spoken thanks + closing reflection),
//         sound design (footstep bed + chimes per step), haptics (step buzz + warmth pulse),
//         particles (golden leaves), CinematicOverlay, adaptive warmth calibration.
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Footprints, Heart, Sun, Sparkles } from "lucide-react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import CinematicOverlay from "../shell/CinematicOverlay";

const SERIF = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

const PROMPTS = [
  { id: "body", label: "step one", text: "one thing your body did for you today, unasked.", icon: <Heart className="w-5 h-5" /> },
  { id: "kindness", label: "step two", text: "one small kindness you received (and almost missed).", icon: <Sparkles className="w-5 h-5" /> },
  { id: "holding", label: "step three", text: "one thing that is still holding — that no one thanks.", icon: <Sun className="w-5 h-5" /> },
];

function Play({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [step, setStep] = useState(0);
  const [thanks, setThanks] = useState<Record<string, string>>({ body: "", kindness: "", holding: "" });
  const [warmth, setWarmth] = useState(6);
  const [leaves, setLeaves] = useState<Array<{ id: number; x: number; y: number; rotation: number; delay: number }>>([]);
  const [reflection, setReflection] = useState("");
  const [listening, setListening] = useState(false);
  const [pulse, setPulse] = useState(0);

  const sessionStartRef = useRef(Date.now());
  const stepStartRef = useRef(Date.now());
  const endedRef = useRef(false);

  // Ambient bed — walking path
  useEffect(() => {
    sd.bed("forest", 0.07);
    return () => sd.stopBed();
  }, []);

  // Golden leaves particles
  useEffect(() => {
    const interval = setInterval(() => {
      setLeaves(prev => {
        const next = [...prev];
        if (next.length < 24) {
          next.push({
            id: Date.now(),
            x: Math.random() * 100,
            y: 100 + Math.random() * 20,
            rotation: Math.random() * 360,
            delay: Math.random() * 2000,
          });
        }
        return next.filter(l => Date.now() - l.id < 15000);
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Step entry
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (step < 3) {
        const p = PROMPTS[step];
        sd.chime("rise", 0.15);
        await say(p.text, "guru");
        if (cancelled) return;
        stepStartRef.current = Date.now();
      } else if (step === 3) {
        sd.chime("rise", 0.18);
        await say("three steps taken. three thanks given. now feel the warmth.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [step]);

  // Completion handler
  useEffect(() => {
    if (step !== 3 || warmth === 6) return;
    (async () => {
      sd.chime("rise", 0.2);
      await say("rate the warmth in your chest. then speak what the walk gave you.", "guru");
      try { await transcribe.start(); setListening(true); } catch {}
    })();
  }, [warmth]);

  const advance = (value: string) => {
    setThanks(prev => ({ ...prev, [PROMPTS[step].id]: value }));
    buzz("tap");
    sd.chime("drop", 0.12);
    setPulse(p => p + 1);
    if (step < 2) setStep(s => s + 1);
    else setStep(3);
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
        body_thanks: thanks.body,
        kindness_thanks: thanks.kindness,
        holding_thanks: thanks.holding,
        warmth_after: warmth,
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

  const currentPrompt = step < 3 ? PROMPTS[step] : null;
  const allFilled = PROMPTS.every(p => thanks[p.id].trim());

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Dawn path gradient — orange to rose */}
      <motion.div
        animate={{ opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-b from-orange-950/25 via-black to-rose-950/15 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
      <CinematicOverlay tint="warm" />

      {/* Golden leaves falling */}
      <AnimatePresence>
        {leaves.map(l => (
          <motion.div
            key={l.id}
            initial={{ opacity: 0, y: -100, rotate: l.rotation }}
            animate={{ opacity: 0.6, y: 120, rotate: l.rotation + 720 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 8, delay: l.delay / 1000, ease: "linear" }}
            className="absolute pointer-events-none"
            style={{
              left: `${l.x}%`,
              top: `${l.y}%`,
              width: "6px",
              height: "10px",
              background: "linear-gradient(180deg, #fbbf24, #f59e0b)",
              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
              filter: "blur(0.5px)",
            }}
          />
        ))}
      </AnimatePresence>

      {/* Top-left: phase pill */}
      <div className="absolute top-6 left-6 z-10">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 0.85, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-orange-200/75"
        >
          <span className="w-1 h-1 rounded-full bg-orange-200/80 animate-pulse" />
          {step < 3 ? PROMPTS[step].label : "arrive"}
        </motion.div>
      </div>

      {/* Top-right: step progress */}
      <div className="absolute top-6 right-6 z-10 text-right space-y-1.5">
        <div className="flex items-center justify-end gap-1.5">
          <Footprints className="w-4 h-4 text-orange-200/60" />
          <span className="text-[10px] uppercase tracking-widest text-white/50">{step < 3 ? step + 1 : 3} / 3</span>
        </div>
        {step === 3 && (
          <p className="text-[10px] uppercase tracking-widest text-orange-200/65">warmth · {warmth}/10</p>
        )}
      </div>

      {/* Center walking visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5">
        <motion.div
          animate={{
            x: [0, 8, -8, 0],
            y: [0, -4, 4, 0],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <motion.div
            animate={{ scale: [1, 1.02, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400/20 to-rose-400/10 blur-xl"
          />
          {step < 3 && currentPrompt && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-4xl text-orange-200/40">{currentPrompt.icon}</div>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div
              animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Heart className="w-14 h-14 text-orange-300/60" />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Bottom step content */}
      <div className="absolute inset-x-0 bottom-16 z-10 flex flex-col items-center px-8 pointer-events-none">
        <AnimatePresence mode="wait">
          {step < 3 && currentPrompt && (
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
              className="text-center w-full max-w-md pointer-events-auto"
            >
              <p className="text-[10px] uppercase tracking-[0.42em] text-orange-200/60 mb-3">{currentPrompt.label}</p>
              <p className="text-xl sm:text-2xl italic text-white/90 mb-6 leading-relaxed" style={SERIF}>
                {currentPrompt.text}
              </p>

              <input
                value={thanks[currentPrompt.id]}
                onChange={e => advance(e.target.value)}
                placeholder="one specific line…"
                className="w-full bg-transparent border-b-2 border-orange-300/40 py-3 mb-6 text-white/90 italic text-center text-base focus:outline-none focus:border-orange-300" style={SERIF}
                autoFocus
              />

              {thanks[currentPrompt.id] && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm italic text-orange-200/70 mb-2" style={SERIF}
                >
                  "{thanks[currentPrompt.id]}"
                </motion.p>
              )}

              <div className="flex items-center justify-center gap-2">
                {PROMPTS.slice(0, step + 1).map((p, i) => (
                  <motion.div
                    key={p.id}
                    animate={{ scale: i === step ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 0.8, repeat: i === step ? Infinity : 0 }}
                    className={`w-2 h-2 rounded-full ${i <= step ? "bg-orange-300/80" : "bg-white/15"}`}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="arrive"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center w-full max-w-md pointer-events-auto"
            >
              <motion.div
                animate={{ scale: [1, 1.03, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mb-6"
              >
                <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-t from-orange-300/30 to-transparent blur-2xl" />
              </motion.div>

              <p className="text-2xl italic text-orange-50/90 mb-6 leading-relaxed" style={SERIF}>
                three steps. three thanks.
              </p>

              <div className="space-y-3 mb-6 p-6 bg-orange-500/10 rounded-2xl border border-orange-300/20 text-left">
                {PROMPTS.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15, duration: 0.5 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-orange-300/60">{p.icon}</div>
                    <p className="italic text-orange-100/85 pt-1" style={SERIF}>"{thanks[p.id]}"</p>
                  </motion.div>
                ))}
              </div>

              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">warmth in chest — after</p>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-orange-200/60 text-sm">cold</span>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={warmth}
                    onChange={e => setWarmth(+e.target.value)}
                    className="w-64 h-2 accent-orange-300"
                  />
                  <span className="text-orange-200/60 text-sm">{warmth}/10</span>
                </div>
              </div>

              {reflection ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg italic text-orange-100/85 max-w-md leading-relaxed mb-6" style={SERIF}>
                  "{reflection}"
                </motion.p>
              ) : listening ? (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-orange-200/40 text-orange-100 text-[11px] uppercase tracking-[0.3em] bg-orange-500/10 backdrop-blur-sm animate-pulse" style={{ boxShadow: "0 0 30px rgba(249,115,22,0.2)" }}>
                  ● listening · tap when done
                </button>
              ) : (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-orange-300/50 text-orange-100 text-[11px] uppercase tracking-[0.3em] bg-orange-500/15 backdrop-blur-sm hover:bg-orange-500/25 transition" style={{ boxShadow: "0 0 20px rgba(249,115,22,0.15)" }}>
                  speak what the walk gave you
                </button>
              )}

              <motion.button
                onClick={finish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 w-full py-3 rounded-full border border-orange-300/60 text-orange-100 text-sm uppercase tracking-[0.3em] bg-orange-500/10 hover:bg-orange-500/20 transition"
              >
                arrive · close
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip / safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-20 text-[10px] uppercase tracking-[0.3em] text-white/25 hover:text-orange-200/70 transition"
      >
        end · save
      </button>
    </div>
  );
}

export default function GratitudeWalk() {
  const g = getLabGame("gratitude-walk")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <Play onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}