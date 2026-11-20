// ENVY MIRROR — World-Class Rebuild
// Envy is a map of your unlived life. Four reflections. One committed step.
// Senses: TTS (guru framing + adaptive mid-reflection), STT (spoken step + closing reflection),
//         sound design (mirror chimes + heartbeat bed), haptics (write buzz + step pulse),
//         particles (mirror shards), CinematicOverlay.
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Target } from "lucide-react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import CinematicOverlay from "../shell/CinematicOverlay";

const SERIF = { fontFamily: "'Cormorant Garamond', Georgia, serif" };
const STAGES = ["who", "what", "longing", "step"] as const;
type Stage = typeof STAGES[number];

function Play({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [stageIdx, setStageIdx] = useState(0);
  const [inputs, setInputs] = useState<Record<Stage, string>>({ who: "", what: "", longing: "", step: "" });
  const [shards, setShards] = useState<Array<{ id: number; x: number; y: number; rotation: number; opacity: number }>>([]);
  const [reflection, setReflection] = useState("");
  const [listening, setListening] = useState(false);
  const [pulse, setPulse] = useState(0);

  const stage = STAGES[stageIdx];
  const completed = STAGES.every(s => inputs[s].trim());
  const sessionStartRef = useRef(Date.now());
  const stageStartRef = useRef(Date.now());
  const endedRef = useRef(false);

  // Ambient bed — mirror chamber
  useEffect(() => {
    sd.bed("cave", 0.06);
    return () => sd.stopBed();
  }, []);

  // Shard particles
  useEffect(() => {
    const interval = setInterval(() => {
      setShards(prev => {
        const next = [...prev];
        if (next.length < 20) {
          next.push({
            id: Date.now(),
            x: 30 + Math.random() * 40,
            y: 30 + Math.random() * 40,
            rotation: Math.random() * 360,
            opacity: 0.1 + Math.random() * 0.15,
          });
        }
        return next.filter(p => Date.now() - p.id < 8000);
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Stage entry
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (stage === "who") {
        sd.chime("rise", 0.15);
        await say("envy is a mirror. who do you envy?", "guru");
      } else if (stage === "what") {
        sd.chime("rise", 0.15);
        await say(`${inputs.who}. what do they have that you don't?`, "guru");
      } else if (stage === "longing") {
        sd.chime("rise", 0.12);
        await say(`they have ${inputs.what}. what do you actually long for underneath?`, "guru");
      } else if (stage === "step") {
        sd.chime("rise", 0.18);
        await say(`you long for ${inputs.longing}. name one small step toward it this week.`, "guru");
      }
      if (cancelled) return;
      stageStartRef.current = Date.now();
    })();
    return () => { cancelled = true; };
  }, [stage]);

  // Completion handler
  useEffect(() => {
    if (!completed) return;
    (async () => {
      sd.chime("rise", 0.2);
      await say("the map is drawn. speak your step aloud to seal it.", "guru");
      try { await transcribe.start(); setListening(true); } catch {}
    })();
  }, [completed]);

  const advance = (value: string) => {
    setInputs(prev => ({ ...prev, [stage]: value }));
    buzz("tap");
    sd.chime("drop", 0.1);
    if (stageIdx < STAGES.length - 1) {
      setStageIdx(i => i + 1);
    }
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
        who: inputs.who,
        what: inputs.what,
        longing: inputs.longing,
        step: inputs.step,
        spoken_reflection: reflection || null,
      },
    });
  };

  const handleVoice = async () => {
    if (listening) {
      setListening(false);
      const r = await transcribe.stop();
      if (r?.transcript) {
        const val = r.transcript.trim().slice(0, 120);
        setInputs(prev => ({ ...prev, step: val }));
        setPulse(p => p + 1);
        buzz("exhale");
      }
      finish();
    } else {
      try { await transcribe.start(); setListening(true); } catch {}
    }
  };

  const progress = (stageIdx + (inputs[stage] ? 1 : 0)) / STAGES.length;

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Mirror gradient — emerald to teal */}
      <motion.div
        animate={{ opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 14, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-br from-emerald-950/25 via-black to-teal-950/20 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
      <CinematicOverlay tint="cool" />

      {/* Mirror shards */}
      <AnimatePresence>
        {shards.map(s => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, scale: 0, rotate: s.rotation }}
            animate={{ opacity: s.opacity, scale: 1, rotate: s.rotation + 180 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 4, ease: "easeOut" }}
            className="absolute pointer-events-none"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: "1px",
              height: "1px",
              background: "linear-gradient(45deg, #34d399, #06b6d4)",
              clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
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
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-emerald-200/75"
        >
          <span className="w-1 h-1 rounded-full bg-emerald-200/80 animate-pulse" />
          {stage === "who" && "who"}
          {stage === "what" && "what"}
          {stage === "longing" && "longing"}
          {stage === "step" && "step"}
        </motion.div>
      </div>

      {/* Top-right: progress */}
      <div className="absolute top-6 right-6 z-10 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <span className="text-[10px] uppercase tracking-widest text-emerald-200/60">{stageIdx + 1} / {STAGES.length}</span>
          <motion.div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-emerald-300/80"
            />
          </motion.div>
        </div>
      </div>

      {/* Center mirror surface */}
      <div className="absolute inset-0 flex items-center justify-center z-5">
        <motion.div
          animate={{
            scale: [1, 1.003, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(20,83,45,0.3) 0%, rgba(0,0,0,0.6) 50%, rgba(15,118,110,0.3) 100%)",
            border: "1px solid rgba(52,211,153,0.15)",
            boxShadow: "inset 0 0 60px rgba(0,0,0,0.5), 0 0 40px rgba(52,211,153,0.08)",
          }}
        >
          {/* Mirror reflection */}
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Eye className="w-16 h-16 text-emerald-200/30" />
          </motion.div>
          
          {/* Current reflection text */}
          {inputs[stage] && (
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-end justify-center pb-8 px-6 pointer-events-none"
            >
              <p className="text-center text-emerald-100/70 italic text-base sm:text-lg max-w-xs leading-relaxed" style={SERIF}>
                "{inputs[stage]}"
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Bottom input area */}
      <div className="absolute inset-x-0 bottom-16 z-10 flex flex-col items-center px-8 pointer-events-none">
        <AnimatePresence mode="wait">
          {!completed ? (
            <motion.div
              key={`stage-${stage}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-center w-full max-w-md pointer-events-auto"
            >
              <p className="text-xl sm:text-2xl italic text-emerald-50/90 mb-6 leading-relaxed" style={SERIF}>
                {stage === "who" && "who do you envy?"}
                {stage === "what" && `${inputs.who} — what do they have?`}
                {stage === "longing" && `they have ${inputs.what}. what do you long for?`}
                {stage === "step" && `you long for ${inputs.longing}. one step this week?`}
              </p>

              <input
                value={inputs[stage]}
                onChange={e => advance(e.target.value)}
                placeholder={
                  stage === "who" ? "name them" :
                  stage === "what" ? "what they have" :
                  stage === "longing" ? "your true longing" :
                  "one small step this week"
                }
                className="w-full bg-transparent border-b-2 border-emerald-300/30 py-3 mb-6 text-white/90 italic text-base focus:outline-none focus:border-emerald-300" style={SERIF}
                autoFocus
              />

              <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">
                {STAGES.slice(0, stageIdx).map(s => `✓ ${inputs[s]}`).join("  ·  ")}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center w-full max-w-md pointer-events-auto"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="mb-6"
              >
                <Target className="w-12 h-12 mx-auto text-emerald-300/70" />
              </motion.div>

              <p className="text-2xl italic text-emerald-50/90 mb-6 leading-relaxed" style={SERIF}>
                the map is drawn
              </p>

              <div className="space-y-3 mb-6 p-4 bg-emerald-500/10 rounded-xl border border-emerald-300/20 text-left">
                <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-200/60 mb-2">who</div>
                <p className="italic text-emerald-100/80">{inputs.who}</p>
                <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-200/60 mb-2 mt-3">what they have</div>
                <p className="italic text-emerald-100/80">{inputs.what}</p>
                <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-200/60 mb-2 mt-3">your longing</div>
                <p className="italic text-emerald-100/80">{inputs.longing}</p>
                <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-200/60 mb-2 mt-3">your step</div>
                <p className="italic text-emerald-100/80 font-medium">{inputs.step}</p>
              </div>

              {reflection ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg italic text-emerald-100/85 max-w-md leading-relaxed mb-6" style={SERIF}>
                  "{reflection}"
                </motion.p>
              ) : listening ? (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-emerald-200/40 text-emerald-100 text-[11px] uppercase tracking-[0.3em] bg-emerald-500/10 backdrop-blur-sm animate-pulse" style={{ boxShadow: "0 0 30px rgba(16,185,129,0.2)" }}>
                  ● listening · tap when done
                </button>
              ) : (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-emerald-300/50 text-emerald-100 text-[11px] uppercase tracking-[0.3em] bg-emerald-500/15 backdrop-blur-sm hover:bg-emerald-500/25 transition" style={{ boxShadow: "0 0 20px rgba(16,185,129,0.15)" }}>
                  speak your step aloud
                </button>
              )}

              <motion.button
                onClick={finish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 w-full py-3 rounded-full border border-emerald-300/60 text-emerald-100 text-sm uppercase tracking-[0.3em] bg-emerald-500/10 hover:bg-emerald-500/20 transition"
              >
                seal · the map
              </motion.button>
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

export default function EnvyMirror() {
  const g = getLabGame("envy-mirror")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <Play onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}