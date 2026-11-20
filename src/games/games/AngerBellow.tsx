// ANGER BELLOW — World-Class Rebuild
// Locate the fire in the body. Name the unmet need. Turn it into one honest ask.
// Senses: TTS (guru framing + adaptive heat prompts), STT (spoken need + ask + reflection),
//         sound design (fire bed + heartbeat + release chimes), haptics (heat pulse + release buzz),
//         particles (fire embers + body heat map), CinematicOverlay, adaptive heat tracking.
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Heart, Mic, Mic2, ArrowRight, AlertCircle, Check } from "lucide-react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import CinematicOverlay from "../shell/CinematicOverlay";

const SERIF = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

const BODY_PARTS = [
  { id: "jaw", label: "jaw", x: 50, y: 22 },
  { id: "throat", label: "throat", x: 50, y: 32 },
  { id: "chest", label: "chest", x: 50, y: 45 },
  { id: "belly", label: "belly", x: 50, y: 60 },
  { id: "fists", label: "fists", x: 25, y: 55 },
  { id: "shoulders", label: "shoulders", x: 50, y: 38 },
];

const STAGE_LABELS = ["locate", "need", "ask", "heat", "release", "integrate"] as const;
type Stage = typeof STAGE_LABELS[number];

function Play({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [stageIdx, setStageIdx] = useState(0);
  const stage = STAGE_LABELS[stageIdx];
  const [where, setWhere] = useState<string[]>([]);
  const [need, setNeed] = useState("");
  const [ask, setAsk] = useState("");
  const [heat, setHeat] = useState(7);
  const [reflection, setReflection] = useState("");
  const [listening, setListening] = useState(false);
  const [embers, setEmbers] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number; life: number }>>([]);
  const [pulse, setPulse] = useState(0);

  const ready = (
    (stage === "locate" && where.length > 0) ||
    (stage === "need" && need.trim()) ||
    (stage === "ask" && ask.trim()) ||
    (stage === "heat" && true) ||
    (stage === "release" && true)
  );

  const sessionStartRef = useRef(Date.now());
  const stageStartRef = useRef(Date.now());
  const endedRef = useRef(false);
  const heatHistoryRef = useRef<number[]>([]);

  // Fire bed
  useEffect(() => {
    sd.bed("fire", 0.12);
    return () => sd.stopBed();
  }, []);

  // Fire embers
  useEffect(() => {
    const interval = setInterval(() => {
      setEmbers(prev => {
        const next = [...prev];
        const intensity = heat / 10;
        if (next.length < 30 * intensity) {
          for (let i = 0; i < 2 * intensity; i++) {
            next.push({
              id: Date.now() + i,
              x: 30 + Math.random() * 40,
              y: 60 + Math.random() * 30,
              size: 3 + Math.random() * 6,
              opacity: 0.2 + Math.random() * 0.4,
              life: 100,
            });
          }
        }
        return next.map(e => ({ ...e, life: e.life - 2, opacity: e.opacity * 0.97, y: e.y - 0.5 }))
          .filter(e => e.life > 0 && e.opacity > 0.02);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [heat]);

  // Stage entry
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (stage === "locate") {
        sd.chime("rise", 0.15);
        await say("krodha — the honest fire. where does it burn in your body?", "guru");
      } else if (stage === "need") {
        sd.chime("rise", 0.12);
        await say(`fire in ${where.join(", ")}. what unmet need feeds this flame?`, "guru");
      } else if (stage === "ask") {
        sd.chime("rise", 0.12);
        await say(`you needed ${need}. turn it into one honest ask.`, "guru");
      } else if (stage === "heat") {
        sd.chime("rise", 0.1);
        await say("rate the heat now. then we release.", "guru");
      } else if (stage === "release") {
        sd.chime("rise", 0.25);
        setPulse(p => p + 1);
        buzz("exhale");
        await say("speak the ask aloud. let the fire become words.", "guru");
        try { await transcribe.start(); setListening(true); } catch {}
      } else if (stage === "integrate") {
        if (listening) {
          setListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setReflection(r.transcript.trim().slice(0, 200));
        }
        sd.chime("drop", 0.18);
        stopVoice();
        await say("the fire spoke. the need was heard. the ask was made.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [stage]);

  // Track heat history
  useEffect(() => {
    if (stage === "heat") {
      heatHistoryRef.current.push(heat);
    }
  }, [heat, stage]);

  const advance = () => {
    if (stageIdx < STAGE_LABELS.length - 1) {
      setStageIdx(i => i + 1);
      sd.chime("drop", 0.1);
      buzz("tap");
      stageStartRef.current = Date.now();
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
        body_sites: where,
        need: need.trim(),
        ask: ask.trim(),
        heat_final: heat,
        heat_history: heatHistoryRef.current,
        spoken_reflection: reflection || null,
      },
    });
  };

  const handleVoice = async () => {
    if (listening) {
      setListening(false);
      const r = await transcribe.stop();
      if (r?.transcript) {
        if (stage === "release") setAsk(r.transcript.trim().slice(0, 200));
        else if (stage === "integrate") setReflection(r.transcript.trim().slice(0, 200));
      }
      if (stage === "release") setStageIdx(i => i + 1);
      else if (stage === "integrate") finish();
    } else {
      try { await transcribe.start(); setListening(true); } catch {}
    }
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Fire gradient — red to orange */}
      <motion.div
        animate={{ opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-b from-red-950/40 via-black to-orange-950/20 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
      <CinematicOverlay tint="warm" />

      {/* Fire embers */}
      <AnimatePresence>
        {embers.map(e => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{ opacity: e.opacity, scale: 1, y: -e.life / 3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: "linear" }}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${e.x}%`,
              top: `${e.y}%`,
              width: `${e.size}px`,
              height: `${e.size}px`,
              background: `radial-gradient(circle, #fef08a 0%, #f97316 70%, transparent 100%)`,
              filter: "blur(1px)",
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
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-red-200/75"
        >
          <span className="w-1 h-1 rounded-full bg-red-400/80 animate-pulse" />
          {stage}
        </motion.div>
      </div>

      {/* Top-right: heat */}
      <div className="absolute top-6 right-6 z-10 text-right space-y-1.5">
        <div className="flex items-center justify-end gap-1.5">
          <Flame className="w-3 h-3 text-red-300/70" />
          <span className="text-[10px] uppercase tracking-widest text-white/50">fire</span>
        </div>
        {(stage === "heat" || stage === "release" || stage === "integrate") && (
          <p className="text-[10px] uppercase tracking-widest text-red-200/65">heat · {heat}/10</p>
        )}
      </div>

      {/* Center body heat map */}
      <div className="absolute inset-0 flex items-center justify-center z-5">
        <motion.div
          animate={{
            scale: [1, 1.01, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="relative"
        >
          <div className="relative w-64 h-80">
            {/* Body silhouette */}
            <motion.div
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-t from-red-900/20 via-transparent to-orange-900/10 rounded-full"
              style={{ clipPath: "ellipse(40% 45% at 50% 55%)" }}
            />
            
            {/* Selected body parts heat glow */}
            {where.map(site => {
              const part = BODY_PARTS.find(p => p.id === site);
              if (!part) return null;
              return (
                <motion.div
                  key={site}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ 
                    opacity: [0.6, 1, 0.6], 
                    scale: [1, 1.3, 1],
                    boxShadow: ["0 0 30px rgba(239,68,68,0.4)", "0 0 60px rgba(239,68,68,0.8)", "0 0 30px rgba(239,68,68,0.4)"]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    left: `${part.x}%`,
                    top: `${part.y}%`,
                    width: "50px",
                    height: "50px",
                    transform: "translate(-50%, -50%)",
                    background: "radial-gradient(circle, rgba(239,68,68,0.6) 0%, transparent 70%)",
                  }}
                />
              );
            })}

            {/* Body part labels */}
            {BODY_PARTS.map(p => (
              <motion.span
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: where.includes(p.id) ? 1 : 0.3, scale: where.includes(p.id) ? 1.1 : 1 }}
                transition={{ duration: 0.3 }}
                className={`absolute text-[10px] uppercase tracking-[0.2em] pointer-events-none ${where.includes(p.id) ? "text-red-100" : "text-white/30"}`}
                style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)" }}
              >
                {p.label}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-16 z-10 flex flex-col items-center px-8 pointer-events-none">
        <AnimatePresence mode="wait">
          {stage === "locate" && (
            <motion.div key="locate" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-red-50/90 mb-6 leading-relaxed" style={SERIF}>where is the fire?</p>
              <div className="flex flex-wrap gap-2 mb-6 justify-center">
                {BODY_PARTS.map(p => (
                  <motion.button
                    key={p.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setWhere(w => w.includes(p.id) ? w.filter(x => x !== p.id) : [...w, p.id])}
                    className={`px-4 py-2 rounded-full text-sm border transition ${where.includes(p.id) ? "border-red-400/70 text-red-100 bg-red-500/20" : "border-white/15 text-white/50"}`}
                  >
                    {p.label}
                  </motion.button>
                ))}
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={advance} disabled={where.length === 0} className={`w-full py-3 rounded-full border text-sm uppercase tracking-[0.3em] ${where.length > 0 ? "border-red-300/60 text-red-100 bg-red-500/10 hover:bg-red-500/20" : "border-white/10 text-white/25"}`}>next · name the need</motion.button>
            </motion.div>
          )}

          {stage === "need" && (
            <motion.div key="need" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-red-50/90 mb-2 leading-relaxed" style={SERIF}>fire in {where.join(", ")}</p>
              <p className="text-white/40 text-sm mb-6">what unmet need feeds this flame?</p>
              <input value={need} onChange={e => setNeed(e.target.value)} placeholder="I needed…" className="w-full bg-transparent border-b-2 border-red-300/40 py-3 mb-6 text-white/90 italic text-center text-base focus:outline-none focus:border-red-300" style={SERIF} autoFocus />
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={advance} disabled={!need.trim()} className={`w-full py-3 rounded-full border text-sm uppercase tracking-[0.3em] ${need.trim() ? "border-red-300/60 text-red-100 bg-red-500/10 hover:bg-red-500/20" : "border-white/10 text-white/25"}`}>next · the ask</motion.button>
            </motion.div>
          )}

          {stage === "ask" && (
            <motion.div key="ask" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-red-50/90 mb-2 leading-relaxed" style={SERIF}>you needed {need}</p>
              <p className="text-white/40 text-sm mb-6">turn it into one honest ask</p>
              <input value={ask} onChange={e => setAsk(e.target.value)} placeholder="could you…" className="w-full bg-transparent border-b-2 border-red-300/40 py-3 mb-6 text-white/90 italic text-center text-base focus:outline-none focus:border-red-300" style={SERIF} autoFocus />
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={advance} disabled={!ask.trim()} className={`w-full py-3 rounded-full border text-sm uppercase tracking-[0.3em] ${ask.trim() ? "border-red-300/60 text-red-100 bg-red-500/10 hover:bg-red-500/20" : "border-white/10 text-white/25"}`}>next · rate heat</motion.button>
            </motion.div>
          )}

          {stage === "heat" && (
            <motion.div key="heat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-red-50/90 mb-2 leading-relaxed" style={SERIF}>rate the heat now</p>
              <p className="text-white/40 text-sm mb-6">then we release</p>
              <div className="flex items-center justify-center gap-4 mb-6">
                <span className="text-red-200/60 text-sm">cool</span>
                <input type="range" min={0} max={10} value={heat} onChange={e => setHeat(+e.target.value)} className="w-64 h-2 accent-red-400" />
                <span className="text-red-200/60 text-sm">{heat}/10</span>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={advance} className="w-full py-3 rounded-full border border-red-300/60 text-red-100 text-sm uppercase tracking-[0.3em] bg-red-500/10 hover:bg-red-500/20">release · speak the ask</motion.button>
            </motion.div>
          )}

          {stage === "release" && (
            <motion.div key="release" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-red-50/90 mb-6 leading-relaxed" style={SERIF}>speak the ask aloud</p>
              <p className="italic text-red-100/80 mb-6">"{ask}"</p>
              
              {reflection ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg italic text-red-100/85 max-w-md leading-relaxed mb-6" style={SERIF}>"{reflection}"</motion.p>
              ) : listening ? (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-red-200/40 text-red-100 text-[11px] uppercase tracking-[0.3em] bg-red-500/10 backdrop-blur-sm animate-pulse" style={{ boxShadow: "0 0 30px rgba(239,68,68,0.2)" }}>
                  ● listening · tap when done
                </button>
              ) : (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-red-300/50 text-red-100 text-[11px] uppercase tracking-[0.3em] bg-red-500/15 backdrop-blur-sm hover:bg-red-500/25 transition" style={{ boxShadow: "0 0 20px rgba(239,68,68,0.15)" }}>
                  speak the ask
                </button>
              )}
            </motion.div>
          )}

          {stage === "integrate" && (
            <motion.div key="integrate" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 1.6 }} className="text-center">
              <p className="text-[10px] uppercase tracking-[0.42em] text-red-200/70">rest</p>
              <p className="mt-5 text-lg italic text-red-100/50 max-w-sm leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                the fire spoke. the need was heard. the ask was made.
              </p>
              {reflection && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="mt-8 pt-6 border-t border-white/10 max-w-md mx-auto">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-2">your words</p>
                  <p className="text-sm italic text-red-200/70" style={SERIF}>"{reflection}"</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip / safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-20 text-[10px] uppercase tracking-[0.3em] text-white/25 hover:text-red-200/70 transition"
      >
        end · save
      </button>
    </div>
  );
}

export default function AngerBellow() {
  const g = getLabGame("anger-bellow")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <Play onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}