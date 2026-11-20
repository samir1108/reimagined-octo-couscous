// ELDER LETTER — World-Class Rebuild
// A letter to you from the you at 80. Plain, tired, kind words.
// Senses: TTS (elder voice framing + adaptive prompts), STT (spoken letter + reflection),
//         sound design (paper bed + fountain pen scratches + seal chime), haptics (write pulse + seal buzz),
//         particles (dust motes on paper), CinematicOverlay, adaptive warmth.
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Pen, Heart, Mic, Mic2, Sparkles } from "lucide-react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import CinematicOverlay from "../shell/CinematicOverlay";

const SERIF = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

const PHASES = ["prompt", "write", "speak", "seal", "reflect", "integrate"] as const;
type Phase = typeof PHASES[number];

function Play({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [phaseIdx, setPhaseIdx] = useState(0);
  const phase = PHASES[phaseIdx];
  const [letter, setLetter] = useState("");
  const [dust, setDust] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number }>>([]);
  const [reflection, setReflection] = useState("");
  const [listening, setListening] = useState(false);
  const [pulse, setPulse] = useState(0);

  const sessionStartRef = useRef(Date.now());
  const endedRef = useRef(false);

  // Paper bed
  useEffect(() => {
    sd.bed("paper", 0.1);
    return () => sd.stopBed();
  }, []);

  // Dust motes on paper
  useEffect(() => {
    const interval = setInterval(() => {
      setDust(prev => {
        const next = [...prev];
        if (next.length < 20) {
          next.push({
            id: Date.now(),
            x: 20 + Math.random() * 60,
            y: 20 + Math.random() * 60,
            size: 1 + Math.random() * 2,
            opacity: 0.15 + Math.random() * 0.2,
          });
        }
        return next.filter(d => Date.now() - d.id < 10000);
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Stage entry
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "prompt") {
        sd.chime("rise", 0.1);
        await say("vṛddha-vāṇī — the elder's letter. you at eighty is writing to you today.", "elder");
      } else if (phase === "write") {
        sd.chime("rise", 0.12);
        await say("they've lived the whole thing. they know what mattered and what didn't. what would they say — in plain, tired, kind words?", "elder");
      } else if (phase === "speak") {
        sd.chime("rise", 0.18);
        setPulse(p => p + 1);
        buzz("exhale");
        await say("read your letter aloud. let the elder's voice be yours.", "elder");
        try { await transcribe.start(); setListening(true); } catch {}
      } else if (phase === "seal") {
        if (listening) {
          setListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setLetter(r.transcript.trim().slice(0, 500));
        }
        sd.chime("drop", 0.2);
        await say("the letter is written. they signed it — love, me. keep the one line that stung the most.", "elder");
      } else if (phase === "reflect") {
        sd.chime("drop", 0.18);
        await say("speak what the elder taught you.", "elder");
        try { await transcribe.start(); setListening(true); } catch {}
      } else if (phase === "integrate") {
        if (listening) {
          setListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setReflection(r.transcript.trim().slice(0, 300));
        }
        sd.chime("drop", 0.12);
        stopVoice();
        await say("the elder's words live in you now. carry them.", "elder");
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  // Auto-advance from write
  useEffect(() => {
    if (phase === "write" && letter.trim().length >= 40) {
      setPhaseIdx(2);
      buzz("tap");
      sd.chime("drop", 0.1);
    }
  }, [letter, phase]);

  // Complete speak -> seal
  useEffect(() => {
    if (phase !== "speak" || listening) return;
    const timer = setTimeout(() => {
      setPhaseIdx(3);
      sd.chime("drop", 0.15);
    }, 1000);
    return () => clearTimeout(timer);
  }, [phase, listening]);

  // Seal -> reflect
  useEffect(() => {
    if (phase !== "seal") return;
    const timer = setTimeout(() => {
      setPhaseIdx(4);
      sd.chime("drop", 0.1);
    }, 2000);
    return () => clearTimeout(timer);
  }, [phase]);

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
        letter_length: letter.length,
        letter: letter,
        spoken_letter: letter,
        spoken_reflection: reflection || null,
      },
    });
  };

  const handleVoice = async () => {
    if (listening) {
      setListening(false);
      const r = await transcribe.stop();
      if (r?.transcript) {
        if (phase === "speak") setLetter(r.transcript.trim().slice(0, 500));
        else if (phase === "reflect") setReflection(r.transcript.trim().slice(0, 300));
      }
      if (phase === "speak") setPhaseIdx(3);
      else if (phase === "reflect") finish();
    } else {
      try { await transcribe.start(); setListening(true); } catch {}
    }
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Amber-stone paper gradient */}
      <motion.div
        animate={{ opacity: [0.1, 0.24, 0.1] }}
        transition={{ duration: 14, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-b from-amber-950/25 via-black to-stone-950/25 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
      <CinematicOverlay tint="warm" />

      {/* Dust motes */}
      <AnimatePresence>
        {dust.map(d => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: d.opacity, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.1, ease: "linear" }}
            className="absolute rounded pointer-events-none"
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: `${d.size}px`,
              height: `${d.size}px`,
              backgroundColor: "#d4a843",
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
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-amber-200/75"
        >
          <span className="w-1 h-1 rounded-full bg-amber-200/85 animate-pulse" />
          {phase}
        </motion.div>
      </div>

      {/* Top-right: elder indicator */}
      <div className="absolute top-6 right-6 z-10 text-right space-y-1.5">
        <div className="flex items-center justify-end gap-1.5">
          <Heart className="w-3 h-3 text-amber-200/60" />
          <span className="text-[10px] uppercase tracking-widest text-white/50">elder</span>
        </div>
      </div>

      {/* Center paper visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5">
        <motion.div
          animate={{
            scale: [1, 1.005, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{ duration: 6, repeat: Infinity }}
          className="relative"
        >
          <motion.div
            animate={{ rotate: [0, 0.5, -0.5, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="w-80 h-96 bg-amber-50/5 rounded-xl border border-amber-200/20 shadow-[0_0_40px_rgba(212,168,67,0.15)] flex flex-col items-center justify-center p-8"
          >
            <div className="w-full h-full flex flex-col items-center justify-center">
              <p className="text-[10px] uppercase tracking-[0.4em] text-amber-400/70 mb-4" style={SERIF}>dear younger me</p>
              {letter && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-white/80 italic text-base leading-relaxed max-w-md text-center px-4" style={SERIF}
                >
                  {letter.length > 200 ? letter.slice(0, 200) + "…" : letter}
                </motion.p>
              )}
              {!letter && phase === "write" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-amber-200/40 italic text-center" style={SERIF}
                >
                  the elder is writing…
                </motion.p>
              )}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mt-8 flex items-center gap-2 text-amber-400/60" style={SERIF}
              >
                <Sparkles className="w-4 h-4" />
                <p className="text-[10px] uppercase tracking-[0.3em]">love, me</p>
                <Sparkles className="w-4 h-4" />
              </motion.div>
            </div>
          </motion.div>

          {/* Pen animation */}
          {phase === "write" && (
            <motion.div
              animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -right-8 top-1/2 -translate-y-1/2"
            >
              <Pen className="w-10 h-10 text-amber-300/50" />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-16 z-10 flex flex-col items-center px-8 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "prompt" && (
            <motion.div key="prompt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-white/90 mb-3" style={SERIF}>you at 80 is writing to you today.</p>
              <p className="text-white/55 italic mb-6 leading-relaxed" style={SERIF}>they've lived the whole thing. they know what mattered and what didn't.<br/>what would they say — in plain, tired, kind words?</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setPhaseIdx(1); buzz("tap"); sd.chime("drop", 0.1); }}
                className="w-full py-3 rounded-full text-sm border border-amber-300/60 text-amber-100 bg-amber-500/10 hover:bg-amber-500/20 transition"
              >
                begin the letter
              </motion.button>
            </motion.div>
          )}

          {phase === "write" && (
            <motion.div key="write" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-lg pointer-events-auto">
              <p className="text-[11px] uppercase tracking-[0.4em] text-white/45 mb-3 text-center" style={SERIF}>dear younger me,</p>
              <textarea
                value={letter}
                onChange={e => setLetter(e.target.value)}
                rows={9}
                placeholder="the thing you are worrying about right now · it is not the thing.\nwhat actually mattered was…"
                className="w-full bg-transparent border border-white/15 rounded-2xl p-4 text-white/90 italic leading-relaxed focus:outline-none focus:border-amber-300/60 resize-none" style={SERIF}
                autoFocus
              />
              <p className="text-[10px] text-white/40 italic text-center mt-2" style={SERIF}>let them be plain. old people don't perform.</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setPhaseIdx(2); buzz("tap"); sd.chime("drop", 0.1); }}
                disabled={letter.trim().length < 40}
                className={`w-full py-3 mt-5 rounded-full text-sm border transition ${letter.trim().length >= 40 ? "border-amber-300/60 text-amber-100 bg-amber-500/10 hover:bg-amber-500/20" : "border-white/10 text-white/25"}`}
              >
                {letter.trim().length >= 40 ? "speak the letter" : `write more · ${40 - letter.trim().length} chars`}
              </motion.button>
            </motion.div>
          )}

          {phase === "speak" && (
            <motion.div key="speak" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-white/90 mb-6 leading-relaxed" style={SERIF}>read your letter aloud</p>
              <p className="italic text-amber-100/80 mb-6 max-w-md mx-auto leading-relaxed" style={SERIF}>
                {letter.length > 300 ? letter.slice(0, 300) + "…" : letter}
              </p>
              
{letter ? (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg italic text-amber-100/85 max-w-md leading-relaxed mb-6" style={SERIF}>"{letter}"</motion.p>
                ) : listening ? (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-amber-200/40 text-amber-100 text-[11px] uppercase tracking-[0.3em] bg-amber-500/10 backdrop-blur-sm animate-pulse" style={{ boxShadow: "0 0 30px rgba(251,191,36,0.2)" }}>
                  ● listening · tap when done
                </button>
              ) : (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-amber-300/50 text-amber-100 text-[11px] uppercase tracking-[0.3em] bg-amber-500/15 backdrop-blur-sm hover:bg-amber-500/25 transition" style={{ boxShadow: "0 0 20px rgba(251,191,36,0.15)" }}>
                  speak the letter
                </button>
              )}
            </motion.div>
          )}

          {phase === "seal" && (
            <motion.div key="seal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-white/60 italic mb-6 leading-relaxed" style={SERIF}>they signed it — love, me.<br/>keep the one line that stung the most.</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setPhaseIdx(4); buzz("tap"); sd.chime("drop", 0.1); }}
                className="w-full py-3 rounded-full text-sm border border-amber-300/60 text-amber-100 bg-amber-500/10 hover:bg-amber-500/20 transition"
              >
                keep the line
              </motion.button>
            </motion.div>
          )}

          {phase === "reflect" && (
            <motion.div key="reflect" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-white/90 mb-6 leading-relaxed" style={SERIF}>speak what the elder taught you</p>
              
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
                seal · carry them
              </motion.button>
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="integrate" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 1.6 }} className="text-center">
              <p className="text-[10px] uppercase tracking-[0.42em] text-amber-200/70">rest</p>
              <p className="mt-5 text-lg italic text-amber-100/50 max-w-sm leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                the elder's words live in you now. carry them.
              </p>
              {reflection && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="mt-8 pt-6 border-t border-white/10 max-w-md mx-auto">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-2">your words</p>
                  <p className="text-sm italic text-amber-200/70" style={SERIF}>"{reflection}"</p>
                </motion.div>
              )}
              {letter && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }} className="mt-6 pt-4 border-t border-white/10 max-w-md mx-auto">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-2">the elder's line</p>
                  <p className="text-sm italic text-amber-200/70" style={SERIF}>"{letter.length > 200 ? letter.slice(0, 200) + "…" : letter}"</p>
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

export default function ElderLetter() {
  const g = getLabGame("elder-letter")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <Play onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}