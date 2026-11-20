// SCREEN FAST — World-Class Rebuild
// Commit a window. Predict the pull. Name the alt. Certainty rated.
// Senses: TTS (guru framing + adaptive certainty prompts), STT (spoken commitment + reflection),
//         sound design (silence bed + chime + notification sounds), haptics (commit pulse + pull buzz),
//         particles (digital dust settling), CinematicOverlay, adaptive certainty calibration.
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, X, Clock, Zap, Mic, Mic2, Shield } from "lucide-react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import CinematicOverlay from "../shell/CinematicOverlay";

const SERIF = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

const WINDOWS = [
  { id: "30m", label: "30 min", ms: 30 * 60 * 1000 },
  { id: "1h", label: "1 hour", ms: 60 * 60 * 1000 },
  { id: "2h", label: "2 hours", ms: 2 * 60 * 60 * 1000 },
  { id: "evening", label: "evening", ms: 4 * 60 * 60 * 1000 },
  { id: "24h", label: "24 hours", ms: 24 * 60 * 60 * 1000 },
];

function Play({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [stage, setStage] = useState<"window" | "pull" | "alt" | "certainty" | "commit" | "reflect" | "integrate">("window");
  const [window, setWindow] = useState(WINDOWS[1].id);
  const [pull, setPull] = useState("");
  const [alt, setAlt] = useState("");
  const [certainty, setCertainty] = useState(6);
  const [dust, setDust] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number }>>([]);
  const [reflection, setReflection] = useState("");
  const [listening, setListening] = useState(false);
  const [pulse, setPulse] = useState(0);

  const ready = pull.trim() && alt.trim();
  const sessionStartRef = useRef(Date.now());
  const endedRef = useRef(false);

  // Silence bed
  useEffect(() => {
    sd.bed("void", 0.08);
    return () => sd.stopBed();
  }, []);

  // Digital dust settling
  useEffect(() => {
    const interval = setInterval(() => {
      setDust(prev => {
        const next = [...prev];
        if (next.length < 30) {
          next.push({
            id: Date.now(),
            x: Math.random() * 100,
            y: -10,
            size: 1 + Math.random() * 2,
            opacity: 0.1 + Math.random() * 0.2,
          });
        }
        return next.map(d => ({ ...d, y: d.y + 0.3 + Math.random() * 0.5, opacity: d.opacity * 0.995 }))
          .filter(d => d.y < 110 && d.opacity > 0.01);
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Stage entry
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (stage === "window") {
        sd.chime("rise", 0.12);
        await say("upavāsa — the fast from the feed. how long will you put the screen down?", "guru");
      } else if (stage === "pull") {
        sd.chime("rise", 0.1);
        await say(`${WINDOWS.find(w => w.id === window)?.label} without the screen. what pull will you feel?`, "guru");
      } else if (stage === "alt") {
        sd.chime("rise", 0.1);
        await say(`the pull: ${pull}. what will you do instead?`, "guru");
      } else if (stage === "certainty") {
        sd.chime("rise", 0.12);
        await say(`your alt: ${alt}. rate your certainty — zero to ten — that you'll keep this fast.`, "guru");
      } else if (stage === "commit") {
        sd.chime("rise", 0.2);
        setPulse(p => p + 1);
        buzz("exhale");
        await say("speak your commitment aloud. seal the fast.", "guru");
        try { await transcribe.start(); setListening(true); } catch {}
      } else if (stage === "reflect") {
        if (listening) {
          setListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setReflection(r.transcript.trim().slice(0, 300));
        }
        sd.chime("drop", 0.18);
        await say("the fast begins. speak the reflection when it ends.", "guru");
        try { await transcribe.start(); setListening(true); } catch {}
      } else if (stage === "integrate") {
        if (listening) {
          setListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setReflection(r.transcript.trim().slice(0, 300));
        }
        sd.chime("drop", 0.15);
        stopVoice();
        await say("the screen was down. you were here.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [stage]);

  const advance = (value: string) => {
    if (stage === "pull" && value.trim()) { setPull(value); setStage("alt"); buzz("tap"); sd.chime("drop", 0.1); }
    else if (stage === "alt" && value.trim()) { setAlt(value); setStage("certainty"); buzz("tap"); sd.chime("drop", 0.1); }
    else if (stage === "certainty") { setStage("commit"); buzz("tap"); sd.chime("rise", 0.15); }
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
        window: window,
        pull: pull,
        alt: alt,
        certainty: certainty,
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

  const currentInput = stage === "pull" ? pull : stage === "alt" ? alt : "";
  const placeholders = { pull: "the reach for it", alt: "the alt · walk · read · sit" };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Slate-zinc void gradient */}
      <motion.div
        animate={{ opacity: [0.06, 0.18, 0.06] }}
        transition={{ duration: 18, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-black to-zinc-950/30 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
      <CinematicOverlay tint="cool" />

      {/* Digital dust */}
      <AnimatePresence>
        {dust.map(d => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: d.opacity, y: d.y }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: "linear" }}
            className="absolute rounded pointer-events-none"
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: `${d.size}px`,
              height: `${d.size}px`,
              backgroundColor: "#71717a",
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
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-zinc-200/75"
        >
          <span className="w-1 h-1 rounded-full bg-zinc-200/80 animate-pulse" />
          {stage === "commit" ? "seal" : stage === "reflect" ? "reflect" : stage === "integrate" ? "rest" : stage}
        </motion.div>
      </div>

      {/* Top-right: phone status */}
      <div className="absolute top-6 right-6 z-10 text-right space-y-1.5">
        <div className="flex items-center justify-end gap-1.5">
          <Smartphone className="w-4 h-4 text-zinc-200/60" />
          <span className="text-[10px] uppercase tracking-widest text-white/50">fast</span>
        </div>
        {stage === "certainty" && (
          <p className="text-[10px] uppercase tracking-widest text-zinc-200/65">certainty · {certainty}/10</p>
        )}
        {stage === "commit" && (
          <p className="text-[10px] uppercase tracking-widest text-emerald-200/65">sealed</p>
        )}
      </div>

      {/* Center phone visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5">
        <motion.div
          animate={{
            scale: [1, 1.01, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 5, repeat: Infinity }}
          className="relative"
        >
          <div className="relative w-24 h-48">
            {/* Phone frame */}
            <motion.div
              animate={{ borderColor: ["rgba(113,113,122,0.3)", "rgba(113,113,122,0.6)", "rgba(113,113,122,0.3)"] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-full h-full rounded-2xl border-4 bg-black flex flex-col items-center justify-center p-6"
              style={{ boxShadow: "0 0 40px rgba(0,0,0,0.5)" }}
            >
              <div className="w-full h-full bg-zinc-900/50 rounded-xl flex items-center justify-center">
                {stage === "window" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <Clock className="w-10 h-10 mx-auto text-zinc-300/50 mb-2" />
                    <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-200/60">{WINDOWS.find(w => w.id === window)?.label}</p>
                  </motion.div>
                )}
                {stage === "pull" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <Zap className="w-10 h-10 mx-auto text-amber-300/60 mb-2 animate-pulse" />
                    <p className="text-sm text-zinc-200/60 max-w-xs">{pull || "the pull…"}</p>
                  </motion.div>
                )}
                {stage === "alt" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <Shield className="w-10 h-10 mx-auto text-emerald-300/60 mb-2" />
                    <p className="text-sm text-zinc-200/60 max-w-xs">{alt || "the alt…"}</p>
                  </motion.div>
                )}
                {(stage === "certainty" || stage === "commit") && (
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-600/50 flex items-center justify-center">
                      <span className="text-3xl font-light text-zinc-200/80">{certainty}</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-200/60 mt-2">certainty</p>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Screen off overlay */}
            {stage !== "window" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                className="absolute inset-0 rounded-xl bg-black/80 flex items-center justify-center"
              >
                <X className="w-8 h-8 text-zinc-500/50" />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-16 z-10 flex flex-col items-center px-8 pointer-events-none">
        <AnimatePresence mode="wait">
          {stage === "window" && (
            <motion.div key="window" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-white/90 mb-6 leading-relaxed" style={SERIF}>screen down. how long?</p>
              <div className="flex flex-wrap gap-2 mb-6 justify-center">
                {WINDOWS.map(w => (
                  <motion.button
                    key={w.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setWindow(w.id); setStage("pull"); buzz("tap"); sd.chime("drop", 0.1); }}
                    className={`px-4 py-2 rounded-full text-sm border transition ${window === w.id ? "border-zinc-100/70 text-white bg-white/10" : "border-white/15 text-white/50"}`}
                  >
                    {w.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {(stage === "pull" || stage === "alt") && (
            <motion.div key={`input-${stage}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-white/90 mb-2 leading-relaxed" style={SERIF}>
                {stage === "pull" ? `${WINDOWS.find(w => w.id === window)?.label} without the screen. what pull?` : `the pull: ${pull}. what will you do instead?`}
              </p>
              <input value={currentInput} onChange={e => { if (stage === "pull") setPull(e.target.value); else setAlt(e.target.value); }} placeholder={placeholders[stage as keyof typeof placeholders]} className="w-full bg-transparent border-b-2 border-zinc-200/40 py-3 mb-6 text-white/90 italic text-center text-base focus:outline-none focus:border-zinc-200" style={SERIF} autoFocus />
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => advance(currentInput)} disabled={!currentInput.trim()} className={`w-full py-3 rounded-full border text-sm uppercase tracking-[0.3em] ${currentInput.trim() ? "border-zinc-100/60 text-white bg-white/5 hover:bg-white/10" : "border-white/10 text-white/25"}`}>next</motion.button>
            </motion.div>
          )}

          {stage === "certainty" && (
            <motion.div key="certainty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-white/90 mb-2 leading-relaxed" style={SERIF}>your alt: {alt}</p>
              <p className="text-white/40 text-sm mb-6">rate your certainty — zero to ten — that you'll keep this fast</p>
              <div className="flex items-center justify-center gap-4 mb-6">
                <span className="text-zinc-200/60 text-sm">zero</span>
                <input type="range" min={0} max={10} value={certainty} onChange={e => setCertainty(+e.target.value)} className="w-64 h-2 accent-zinc-200" />
                <span className="text-zinc-200/60 text-sm">ten</span>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => advance("")} className="w-full py-3 rounded-full border border-zinc-100/60 text-white text-sm uppercase tracking-[0.3em] bg-white/5 hover:bg-white/10">commit · seal the fast</motion.button>
            </motion.div>
          )}

          {stage === "commit" && (
            <motion.div key="commit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-white/90 mb-6 leading-relaxed" style={SERIF}>speak your commitment</p>
              <p className="italic text-zinc-200/80 mb-6">"{WINDOWS.find(w => w.id === window)?.label} · {pull} · {alt} · {certainty}/10"</p>
              
              {reflection ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg italic text-zinc-100/85 max-w-md leading-relaxed mb-6" style={SERIF}>"{reflection}"</motion.p>
              ) : listening ? (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-zinc-200/40 text-zinc-100 text-[11px] uppercase tracking-[0.3em] bg-zinc-500/10 backdrop-blur-sm animate-pulse" style={{ boxShadow: "0 0 30px rgba(113,113,122,0.2)" }}>
                  ● listening · tap when done
                </button>
              ) : (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-zinc-200/50 text-zinc-100 text-[11px] uppercase tracking-[0.3em] bg-zinc-500/15 backdrop-blur-sm hover:bg-zinc-500/25 transition" style={{ boxShadow: "0 0 20px rgba(113,113,122,0.15)" }}>
                  speak the commitment
                </button>
              )}
            </motion.div>
          )}

          {stage === "reflect" && (
            <motion.div key="reflect" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-white/90 mb-6 leading-relaxed" style={SERIF}>the fast ends. reflect.</p>
              
              {reflection ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg italic text-zinc-100/85 max-w-md leading-relaxed mb-6" style={SERIF}>"{reflection}"</motion.p>
              ) : listening ? (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-zinc-200/40 text-zinc-100 text-[11px] uppercase tracking-[0.3em] bg-zinc-500/10 backdrop-blur-sm animate-pulse" style={{ boxShadow: "0 0 30px rgba(113,113,122,0.2)" }}>
                  ● listening · tap when done
                </button>
              ) : (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-zinc-200/50 text-zinc-100 text-[11px] uppercase tracking-[0.3em] bg-zinc-500/15 backdrop-blur-sm hover:bg-zinc-500/25 transition" style={{ boxShadow: "0 0 20px rgba(113,113,122,0.15)" }}>
                  speak the reflection
                </button>
              )}
            </motion.div>
          )}

          {stage === "integrate" && (
            <motion.div key="integrate" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 1.6 }} className="text-center">
              <p className="text-[10px] uppercase tracking-[0.42em] text-zinc-200/70">rest</p>
              <p className="mt-5 text-lg italic text-zinc-100/50 max-w-sm leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                the screen was down. you were here.
              </p>
              {reflection && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="mt-8 pt-6 border-t border-white/10 max-w-md mx-auto">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-2">your words</p>
                  <p className="text-sm italic text-zinc-200/70" style={SERIF}>"{reflection}"</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip / safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-20 text-[10px] uppercase tracking-[0.3em] text-white/25 hover:text-zinc-200/70 transition"
      >
        end · save
      </button>
    </div>
  );
}

export default function ScreenFast() {
  const g = getLabGame("screen-fast")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <Play onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}