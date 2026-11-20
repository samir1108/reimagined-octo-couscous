// KARMA COIN — World-Class Rebuild
// Declare one micro-action. Self-report at evening. Integrity tracking.
// Senses: TTS (guru framing + adaptive evening prompt), STT (spoken declaration + evening report),
//         sound design (coin chime + integrity bed), haptics (coin drop pulse + evening buzz),
//         particles (golden coins), CinematicOverlay, adaptive integrity tracking.
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CircleDollarSign, Sun, Moon, Mic, Mic2, Check } from "lucide-react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import CinematicOverlay from "../shell/CinematicOverlay";

const SERIF = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

const STAGES = ["declare", "speak", "evening", "reflect", "integrate"] as const;
type Stage = typeof STAGES[number];

function Play({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [stageIdx, setStageIdx] = useState(0);
  const stage = STAGES[stageIdx];
  const [action, setAction] = useState("");
  const [eveningDone, setEveningDone] = useState("");
  const [coins, setCoins] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number; rotation: number }>>([]);
  const [reflection, setReflection] = useState("");
  const [listening, setListening] = useState(false);
  const [pulse, setPulse] = useState(0);

  const sessionStartRef = useRef(Date.now());
  const endedRef = useRef(false);

  // Integrity bed
  useEffect(() => {
    sd.bed("fire", 0.08);
    return () => sd.stopBed();
  }, []);

  // Golden coins
  useEffect(() => {
    const interval = setInterval(() => {
      setCoins(prev => {
        const next = [...prev];
        if (next.length < 18) {
          next.push({
            id: Date.now(),
            x: 30 + Math.random() * 40,
            y: 110,
            size: 8 + Math.random() * 12,
            opacity: 0.3 + Math.random() * 0.4,
            rotation: Math.random() * 360,
          });
        }
        return next.map(c => ({ ...c, y: c.y - 1.2, rotation: c.rotation + 2, opacity: c.opacity * 0.995 }))
          .filter(c => c.y > -20 && c.opacity > 0.02);
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Stage entry
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (stage === "declare") {
        sd.chime("rise", 0.12);
        await say("karma coin — one micro-action. declare it. live it.", "guru");
      } else if (stage === "speak") {
        sd.chime("rise", 0.15);
        setPulse(p => p + 1);
        buzz("exhale");
        await say("speak your action aloud. drop the coin.", "guru");
        try { await transcribe.start(); setListening(true); } catch {}
      } else if (stage === "evening") {
        sd.chime("drop", 0.18);
        await say("evening comes. did you keep the coin? speak what you did.", "guru");
        try { await transcribe.start(); setListening(true); } catch {}
      } else if (stage === "reflect") {
        if (listening) {
          setListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setEveningDone(r.transcript.trim().slice(0, 300));
        }
        sd.chime("drop", 0.15);
        await say("the coin was declared. the evening reports. what did you learn?", "guru");
        try { await transcribe.start(); setListening(true); } catch {}
      } else if (stage === "integrate") {
        if (listening) {
          setListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setReflection(r.transcript.trim().slice(0, 300));
        }
        sd.chime("drop", 0.12);
        stopVoice();
        await say("integrity is the coin you keep. carry it forward.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [stage]);

  // Completion handlers
  useEffect(() => {
    if (stage !== "declare" && action.trim().length >= 4) {
      setStageIdx(1);
    }
  }, [action, stage]);

  const advance = () => {
    if (stage === "declare" && action.trim().length >= 4) {
      setStageIdx(1);
      buzz("tap");
      sd.chime("drop", 0.1);
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
        declared_action: action,
        spoken_declaration: reflection || null,
        evening_report: eveningDone || null,
        integrity_kept: eveningDone.toLowerCase().includes("yes") || eveningDone.toLowerCase().includes("done") || eveningDone.toLowerCase().includes("kept"),
      },
    });
  };

  const handleVoice = async () => {
    if (listening) {
      setListening(false);
      const r = await transcribe.stop();
      if (r?.transcript) {
        if (stage === "speak") setReflection(r.transcript.trim().slice(0, 200));
        else if (stage === "evening") setEveningDone(r.transcript.trim().slice(0, 300));
        else if (stage === "reflect") setReflection(r.transcript.trim().slice(0, 300));
      }
      if (stage === "speak") setStageIdx(2);
      else if (stage === "evening") setStageIdx(3);
      else if (stage === "reflect") finish();
    } else {
      try { await transcribe.start(); setListening(true); } catch {}
    }
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Amber integrity glow */}
      <motion.div
        animate={{ opacity: [0.12, 0.25, 0.12] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-br from-amber-950/30 via-black to-yellow-950/20 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
      <CinematicOverlay tint="warm" />

      {/* Golden coins */}
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
              backgroundColor: "#fbbf24",
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
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-amber-200/75"
        >
          <span className="w-1 h-1 rounded-full bg-amber-200/85 animate-pulse" />
          {stage}
        </motion.div>
      </div>

      {/* Top-right: time of day */}
      <div className="absolute top-6 right-6 z-10 text-right space-y-1.5">
        <div className="flex items-center justify-end gap-1.5">
          {stage === "evening" || stage === "reflect" || stage === "integrate" ? (
            <Moon className="w-4 h-4 text-amber-200/60" />
          ) : (
            <Sun className="w-4 h-4 text-amber-200/60" />
          )}
          <span className="text-[10px] uppercase tracking-widest text-white/50">
            {stage === "evening" || stage === "reflect" || stage === "integrate" ? "evening" : "morning"}
          </span>
        </div>
      </div>

      {/* Center coin visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5">
        <motion.div
          animate={{
            scale: [1, 1.02, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="relative"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center"
            style={{ boxShadow: "0 0 60px rgba(251,191,36,0.4), inset 0 0 30px rgba(253,224,71,0.3)" }}
          >
            <CircleDollarSign className="w-16 h-16 text-black/60" />
          </motion.div>

          {/* Stage indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center"
          >
            <p className="text-[10px] uppercase tracking-[0.4em] text-amber-200/70">{stage}</p>
            <div className="w-24 h-px bg-amber-300/30 mx-auto mt-2">
              <motion.div
                animate={{ width: stage === "integrate" ? "100%" : stage === "reflect" ? "80%" : stage === "evening" ? "60%" : stage === "speak" ? "40%" : "20%" }}
                transition={{ duration: 0.5 }}
                className="h-full bg-amber-300/60"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-16 z-10 flex flex-col items-center px-8 pointer-events-none">
        <AnimatePresence mode="wait">
          {stage === "declare" && (
            <motion.div key="declare" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="text-center w-full max-w-md pointer-events-auto">
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 0.9, y: 0 }}
                transition={{ duration: 1.6 }}
                className="text-3xl sm:text-4xl italic text-amber-50/90 mb-3 leading-snug"
                style={{ ...SERIF, textShadow: "0 0 30px rgba(253,224,71,0.3)" }}
              >
                one small action
              </motion.p>
              <p className="text-amber-200/60 text-[11px] uppercase tracking-[0.42em] mb-8" style={SERIF}>nothing more.</p>
              <textarea
                value={action}
                onChange={e => setAction(e.target.value)}
                placeholder="i will…"
                rows={3}
                className="bg-white/[0.03] border border-amber-200/20 rounded-xl p-4 text-amber-50/95 placeholder:text-amber-200/25 w-full max-w-md italic text-lg focus:outline-none focus:border-amber-200/50 backdrop-blur-sm resize-none"
                style={SERIF}
                autoFocus
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={advance}
                disabled={action.trim().length < 4}
                className={`mt-8 px-8 py-3 rounded-full border text-[11px] uppercase tracking-[0.4em] ${action.trim().length >= 4 ? "border-amber-200/40 text-amber-100 bg-amber-500/10 backdrop-blur-sm hover:bg-amber-500/15" : "border-white/10 text-white/25"} disabled:opacity-25 disabled:cursor-not-allowed transition`}
                style={{ ...SERIF, boxShadow: "0 0 25px rgba(253,224,71,0.2)" }}
              >
                drop the coin
              </motion.button>
            </motion.div>
          )}

          {stage === "speak" && (
            <motion.div key="speak" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-amber-50/90 mb-6 leading-relaxed" style={SERIF}>speak your action aloud</p>
              <p className="italic text-amber-100/80 mb-6">"{action}"</p>
              
              {reflection ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg italic text-amber-100/85 max-w-md leading-relaxed mb-6" style={SERIF}>"{reflection}"</motion.p>
              ) : listening ? (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-amber-200/40 text-amber-100 text-[11px] uppercase tracking-[0.3em] bg-amber-500/10 backdrop-blur-sm animate-pulse" style={{ boxShadow: "0 0 30px rgba(251,191,36,0.2)" }}>
                  ● listening · tap when done
                </button>
              ) : (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-amber-300/50 text-amber-100 text-[11px] uppercase tracking-[0.3em] bg-amber-500/15 backdrop-blur-sm hover:bg-amber-500/25 transition" style={{ boxShadow: "0 0 20px rgba(251,191,36,0.15)" }}>
                  speak the declaration
                </button>
              )}

              <motion.button
                onClick={() => setStageIdx(2)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 w-full py-3 rounded-full border border-amber-300/60 text-amber-100 text-sm uppercase tracking-[0.3em] bg-amber-500/10 hover:bg-amber-500/20 transition"
              >
                evening will come
              </motion.button>
            </motion.div>
          )}

          {stage === "evening" && (
            <motion.div key="evening" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-amber-50/90 mb-6 leading-relaxed" style={SERIF}>evening comes</p>
              <p className="text-amber-100/80 mb-6">did you keep the coin? speak what you did.</p>
              
              {eveningDone ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg italic text-amber-100/85 max-w-md leading-relaxed mb-6" style={SERIF}>"{eveningDone}"</motion.p>
              ) : listening ? (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-amber-200/40 text-amber-100 text-[11px] uppercase tracking-[0.3em] bg-amber-500/10 backdrop-blur-sm animate-pulse" style={{ boxShadow: "0 0 30px rgba(251,191,36,0.2)" }}>
                  ● listening · tap when done
                </button>
              ) : (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-amber-300/50 text-amber-100 text-[11px] uppercase tracking-[0.3em] bg-amber-500/15 backdrop-blur-sm hover:bg-amber-500/25 transition" style={{ boxShadow: "0 0 20px rgba(251,191,36,0.15)" }}>
                  speak the evening report
                </button>
              )}
            </motion.div>
          )}

          {stage === "reflect" && (
            <motion.div key="reflect" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-amber-50/90 mb-6 leading-relaxed" style={SERIF}>the coin was declared</p>
              <p className="text-amber-100/80 mb-6">the evening reports. what did you learn?</p>
              
              {reflection ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg italic text-amber-100/85 max-w-md leading-relaxed mb-6" style={SERIF}>"{reflection}"</motion.p>
              ) : listening ? (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-amber-200/40 text-amber-100 text-[11px] uppercase tracking-[0.3em] bg-amber-500/10 backdrop-blur-sm animate-pulse" style={{ boxShadow: "0 0 30px rgba(251,191,36,0.2)" }}>
                  ● listening · tap when done
                </button>
              ) : (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-amber-300/50 text-amber-100 text-[11px] uppercase tracking-[0.3em] bg-amber-500/15 backdrop-blur-sm hover:bg-amber-500/25 transition" style={{ boxShadow: "0 0 20px rgba(251,191,36,0.15)" }}>
                  speak the reflection
                </button>
              )}

              <motion.button
                onClick={finish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 w-full py-3 rounded-full border border-amber-300/60 text-amber-100 text-sm uppercase tracking-[0.3em] bg-amber-500/10 hover:bg-amber-500/20 transition"
              >
                seal · integrity kept
              </motion.button>
            </motion.div>
          )}

          {stage === "integrate" && (
            <motion.div key="integrate" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 1.6 }} className="text-center">
              <p className="text-[10px] uppercase tracking-[0.42em] text-amber-200/70">rest</p>
              <p className="mt-5 text-lg italic text-amber-100/50 max-w-sm leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                integrity is the coin you keep. carry it forward.
              </p>
              {reflection && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="mt-8 pt-6 border-t border-white/10 max-w-md mx-auto">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-2">your words</p>
                  <p className="text-sm italic text-amber-200/70" style={SERIF}>"{reflection}"</p>
                </motion.div>
              )}
              {eveningDone && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }} className="mt-6 pt-4 border-t border-white/10 max-w-md mx-auto">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-2">evening report</p>
                  <p className="text-sm italic text-amber-200/70" style={SERIF}>"{eveningDone}"</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip / safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-20 text-[10px] uppercase tracking-[0.3em] text-white/25 hover:text-amber-200/70 transition"
      >
        end · save
      </button>
    </div>
  );
}

export default function KarmaCoin() {
  const g = getLabGame("karma-coin")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <Play onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}