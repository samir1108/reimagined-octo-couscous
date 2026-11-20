// BOUNDARY NO — World-Class Rebuild
// Draft the no you owe. 22 words max. No apology. No over-explain.
// Senses: TTS (guru framing + adaptive audit), STT (spoken no + reflection),
//         sound design (edge chimes + tension bed), haptics (word buzz + audit pulse),
//         particles (boundary lines), CinematicOverlay, real-time audit.
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X, Mic, Mic2, Check, AlertCircle, ArrowRight } from "lucide-react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import CinematicOverlay from "../shell/CinematicOverlay";

const SERIF = { fontFamily: "'Cormorant Garamond', Georgia, serif" };
const MAX_WORDS = 22;

function Play({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [stage, setStage] = useState<"who" | "ask" | "draft" | "audit" | "send" | "reflect" | "integrate">("who");
  const [who, setWho] = useState("");
  const [ask, setAsk] = useState("");
  const [draft, setDraft] = useState("");
  const [auditResult, setAuditResult] = useState<{ apology: boolean; overExplain: boolean; wordCount: number } | null>(null);
  const [lines, setLines] = useState<Array<{ id: number; x1: number; y1: number; x2: number; y2: number; opacity: number }>>([]);
  const [reflection, setReflection] = useState("");
  const [listening, setListening] = useState(false);
  const [pulse, setPulse] = useState(0);

  const wordCount = draft.trim().split(/\s+/).filter(Boolean).length;
  const apology = /sorry|apolog|feel bad|guilty|just|maybe/i.test(draft);
  const overExplain = wordCount > MAX_WORDS;
  const clean = wordCount > 0 && !apology && !overExplain;

  const sessionStartRef = useRef(Date.now());
  const endedRef = useRef(false);
  const mountedRef = useRef(true);

  // Tension bed
  useEffect(() => {
    sd.bed("cave", 0.05);
    return () => sd.stopBed();
  }, []);

  // Boundary line particles
  useEffect(() => {
    const interval = setInterval(() => {
      setLines(prev => {
        const next = [...prev];
        if (next.length < 12) {
          const angle = Math.random() * Math.PI * 2;
          const len = 20 + Math.random() * 30;
          const cx = 50 + (Math.random() - 0.5) * 20;
          const cy = 50 + (Math.random() - 0.5) * 20;
          next.push({
            id: Date.now(),
            x1: cx,
            y1: cy,
            x2: cx + Math.cos(angle) * len,
            y2: cy + Math.sin(angle) * len,
            opacity: 0.15 + Math.random() * 0.2,
          });
        }
        return next.filter(l => Date.now() - l.id < 6000);
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Stage entry
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (stage === "who") {
        sd.chime("rise", 0.12);
        await say("maryādā — the clean edge. who do you need to say no to?", "guru");
      } else if (stage === "ask") {
        sd.chime("rise", 0.12);
        await say(`${who} asked you for something. what was it?`, "guru");
      } else if (stage === "draft") {
        sd.chime("rise", 0.1);
        await say("write your no. twenty-two words. no apology. no over-explanation.", "guru");
      } else if (stage === "audit") {
        if (apology) { sd.chime("drop", 0.15); await say("apology detected. strip it.", "guru"); }
        if (overExplain) { sd.chime("drop", 0.15); await say("over-explaining detected. cut to twenty-two words.", "guru"); }
        if (clean) { sd.chime("rise", 0.18); await say("clean. ready to send.", "guru"); }
      } else if (stage === "send") {
        sd.chime("rise", 0.2);
        await say("speak your no aloud. seal it with your voice.", "guru");
        try { await transcribe.start(); setListening(true); } catch {}
      } else if (stage === "reflect") {
        if (listening) {
          setListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setReflection(r.transcript.trim().slice(0, 200));
        }
        sd.chime("drop", 0.18);
        await say("how does the edge feel? speak the reflection.", "guru");
        try { await transcribe.start(); setListening(true); } catch {}
      } else if (stage === "integrate") {
        if (listening) {
          setListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setReflection(r.transcript.trim().slice(0, 200));
        }
        sd.chime("drop", 0.15);
        stopVoice();
        await say("the boundary holds. you held it.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [stage]);

  // Real-time audit
  useEffect(() => {
    if (stage !== "draft") return;
    const timer = setTimeout(() => {
      setAuditResult({ apology, overExplain, wordCount });
      if (apology || overExplain) {
        buzz("heavy");
        sd.chime("drop", 0.1);
      } else if (wordCount > 0 && wordCount <= MAX_WORDS) {
        buzz("tap");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [draft, stage]);

  const advance = () => {
    if (stage === "who" && who.trim()) {
      setStage("ask"); sd.chime("drop", 0.1); buzz("tap");
    } else if (stage === "ask" && ask.trim()) {
      setStage("draft"); sd.chime("drop", 0.1); buzz("tap");
    } else if (stage === "draft" && clean) {
      setStage("audit"); sd.chime("rise", 0.15); setAuditResult({ apology, overExplain, wordCount }); buzz("tap");
    } else if (stage === "audit" && clean) {
      setStage("send"); sd.chime("rise", 0.2); buzz("exhale"); setPulse(p => p + 1);
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
        to_whom: who,
        ask: ask,
        no: draft,
        apology_detected: apology,
        over_explain: overExplain,
        word_count: wordCount,
        spoken_no: reflection || null,
      },
    });
  };

  const handleVoice = async () => {
    if (listening) {
      setListening(false);
      const r = await transcribe.stop();
      if (r?.transcript) {
        if (stage === "send") setDraft(r.transcript.trim().slice(0, 200));
        else if (stage === "reflect") setReflection(r.transcript.trim().slice(0, 200));
      }
      if (stage === "send") setStage("reflect");
      else if (stage === "reflect") finish();
    } else {
      try { await transcribe.start(); setListening(true); } catch {}
    }
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Slate-stone edge gradient */}
      <motion.div
        animate={{ opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-black to-stone-900/30 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
      <CinematicOverlay tint="cool" />

      {/* Boundary lines */}
      <AnimatePresence>
        {lines.map(l => (
          <motion.div
            key={l.id}
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: l.opacity, pathLength: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute pointer-events-none"
            style={{
              left: `${l.x1}%`,
              top: `${l.y1}%`,
              width: `${Math.hypot(l.x2 - l.x1, l.y2 - l.y1) * 0.5}px`,
              height: "1px",
              background: "linear-gradient(90deg, transparent, #94a3b8, transparent)",
              transform: `rotate(${Math.atan2(l.y2 - l.y1, l.x2 - l.x1) * 180 / Math.PI}deg)`,
              transformOrigin: "0% 50%",
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
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-stone-200/75"
        >
          <span className="w-1 h-1 rounded-full bg-stone-200/80 animate-pulse" />
          {stage === "who" && "who"}
          {stage === "ask" && "ask"}
          {stage === "draft" && "draft"}
          {stage === "audit" && "audit"}
          {stage === "send" && "speak"}
          {stage === "reflect" && "reflect"}
          {stage === "integrate" && "rest"}
        </motion.div>
      </div>

      {/* Top-right: word count */}
      <div className="absolute top-6 right-6 z-10 text-right space-y-1.5">
        <div className="flex items-center justify-end gap-1.5">
          <Shield className="w-3 h-3 text-stone-200/60" />
          <span className="text-[10px] uppercase tracking-widest text-white/50">boundary</span>
        </div>
        {(stage === "draft" || stage === "audit" || stage === "send") && (
          <>
            <p className="text-[10px] uppercase tracking-widest text-white/40">words · {wordCount} / {MAX_WORDS}</p>
            <p className={`text-[10px] uppercase tracking-widest ${apology || overExplain ? "text-rose-300/70" : "text-stone-200/70"}`}>
              {apology && "⚠ apology"}
              {overExplain && "⚠ over"}
              {!apology && !overExplain && wordCount > 0 && "✓ clean"}
            </p>
          </>
        )}
      </div>

      {/* Center shield visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5">
        <motion.div
          animate={{
            scale: [1, 1.01, 1],
            borderColor: ["rgba(148,163,184,0.2)", "rgba(148,163,184,0.5)", "rgba(148,163,184,0.2)"],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="relative w-48 h-48 rounded-2xl border-2 flex items-center justify-center"
          style={{ background: "rgba(15,23,42,0.5)", boxShadow: "inset 0 0 40px rgba(0,0,0,0.5)" }}
        >
          {stage === "send" && (
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-6xl text-stone-200/40"
            >
              <X />
            </motion.div>
          )}
          {stage === "audit" && clean && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-5xl text-emerald-300/50"
            >
              <Check />
            </motion.div>
          )}
          {stage === "integrate" && (
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl text-stone-200/40"
            >
              <Shield />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-16 z-10 flex flex-col items-center px-8 pointer-events-none">
        <AnimatePresence mode="wait">
          {stage === "who" && (
            <motion.div key="who" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-stone-50/90 mb-6 leading-relaxed" style={SERIF}>who is the no for?</p>
              <input value={who} onChange={e => setWho(e.target.value)} placeholder="name them" className="w-full bg-transparent border-b-2 border-stone-300/40 py-3 mb-6 text-white/90 italic text-center text-base focus:outline-none focus:border-stone-300" style={SERIF} autoFocus />
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={advance} disabled={!who.trim()} className={`w-full py-3 rounded-full border text-sm uppercase tracking-[0.3em] ${who.trim() ? "border-stone-300/60 text-stone-100 bg-stone-500/10 hover:bg-stone-500/20" : "border-white/10 text-white/25"}`}>next</motion.button>
            </motion.div>
          )}

          {stage === "ask" && (
            <motion.div key="ask" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-stone-50/90 mb-6 leading-relaxed" style={SERIF}>{who} asked you for what?</p>
              <input value={ask} onChange={e => setAsk(e.target.value)} placeholder="what they asked" className="w-full bg-transparent border-b-2 border-stone-300/40 py-3 mb-6 text-white/90 italic text-center text-base focus:outline-none focus:border-stone-300" style={SERIF} autoFocus />
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={advance} disabled={!ask.trim()} className={`w-full py-3 rounded-full border text-sm uppercase tracking-[0.3em] ${ask.trim() ? "border-stone-300/60 text-stone-100 bg-stone-500/10 hover:bg-stone-500/20" : "border-white/10 text-white/25"}`}>next</motion.button>
            </motion.div>
          )}

          {stage === "draft" && (
            <motion.div key="draft" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-stone-50/90 mb-2 leading-relaxed" style={SERIF}>write your no</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-5">{MAX_WORDS} words · no apology · no over-explanation</p>
              <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={4} placeholder="I won't…" className="w-full bg-transparent border-2 border-stone-300/30 rounded-xl p-4 mb-4 text-white/90 italic text-base focus:outline-none focus:border-stone-300" style={SERIF} autoFocus />
              
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className={`flex items-center gap-1 text-[11px] ${apology ? "text-rose-300" : "text-white/40"}`}>
                  {apology ? <AlertCircle className="w-3 h-3" /> : <Check className="w-3 h-3 text-emerald-300/50" />} no apology
                </span>
                <span className={`flex items-center gap-1 text-[11px] ${overExplain ? "text-rose-300" : "text-white/40"}`}>
                  {overExplain ? <AlertCircle className="w-3 h-3" /> : <Check className="w-3 h-3 text-emerald-300/50" />} concise ({wordCount}/{MAX_WORDS})
                </span>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={advance} disabled={!clean} className={`w-full py-3 rounded-full border text-sm uppercase tracking-[0.3em] ${clean ? "border-stone-300/60 text-stone-100 bg-stone-500/10 hover:bg-stone-500/20" : "border-white/10 text-white/25"}`}>audit · next</motion.button>
            </motion.div>
          )}

          {stage === "audit" && (
            <motion.div key="audit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-stone-50/90 mb-2 leading-relaxed" style={SERIF}>audit result</p>
              <p className="text-white/40 text-sm mb-6">{clean ? "clean edge" : "issues found"}</p>
              
              <div className="space-y-2 mb-6 p-4 bg-stone-500/10 rounded-xl border border-stone-300/20 text-left">
                <p className="italic text-stone-100/80">"{draft}"</p>
                <div className="flex items-center gap-2 text-[11px] mt-2">
                  <span className={apology ? "text-rose-300" : "text-emerald-300/60"}>{apology ? "✗" : "✓"} apology</span>
                  <span className={overExplain ? "text-rose-300" : "text-emerald-300/60"}>{overExplain ? "✗" : "✓"} concise</span>
                  <span className="text-stone-200/60">{wordCount}/{MAX_WORDS} words</span>
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={advance} disabled={!clean} className={`w-full py-3 rounded-full border text-sm uppercase tracking-[0.3em] ${clean ? "border-stone-300/60 text-stone-100 bg-stone-500/10 hover:bg-stone-500/20" : "border-white/10 text-white/25"}`}>
                {clean ? "send the no" : "fix then send"}
              </motion.button>
            </motion.div>
          )}

          {stage === "send" && (
            <motion.div key="send" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-stone-50/90 mb-6 leading-relaxed" style={SERIF}>speak your no</p>
              <p className="italic text-stone-100/80 mb-6">"{draft}"</p>
              
              {reflection ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg italic text-stone-100/85 max-w-md leading-relaxed mb-6" style={SERIF}>"{reflection}"</motion.p>
              ) : listening ? (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-stone-200/40 text-stone-100 text-[11px] uppercase tracking-[0.3em] bg-stone-500/10 backdrop-blur-sm animate-pulse" style={{ boxShadow: "0 0 30px rgba(148,163,184,0.2)" }}>
                  ● listening · tap when done
                </button>
              ) : (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-stone-300/50 text-stone-100 text-[11px] uppercase tracking-[0.3em] bg-stone-500/15 backdrop-blur-sm hover:bg-stone-500/25 transition" style={{ boxShadow: "0 0 20px rgba(148,163,184,0.15)" }}>
                  speak the no aloud
                </button>
              )}
            </motion.div>
          )}

          {stage === "reflect" && (
            <motion.div key="reflect" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-stone-50/90 mb-6 leading-relaxed" style={SERIF}>how does the edge feel?</p>
              {reflection ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg italic text-stone-100/85 max-w-md leading-relaxed mb-6" style={SERIF}>"{reflection}"</motion.p>
              ) : listening ? (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-stone-200/40 text-stone-100 text-[11px] uppercase tracking-[0.3em] bg-stone-500/10 backdrop-blur-sm animate-pulse" style={{ boxShadow: "0 0 30px rgba(148,163,184,0.2)" }}>
                  ● listening · tap when done
                </button>
              ) : (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-stone-300/50 text-stone-100 text-[11px] uppercase tracking-[0.3em] bg-stone-500/15 backdrop-blur-sm hover:bg-stone-500/25 transition" style={{ boxShadow: "0 0 20px rgba(148,163,184,0.15)" }}>
                  speak the reflection
                </button>
              )}
            </motion.div>
          )}

          {stage === "integrate" && (
            <motion.div key="integrate" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 1.6 }} className="text-center">
              <p className="text-[10px] uppercase tracking-[0.42em] text-stone-200/70">rest</p>
              <p className="mt-5 text-lg italic text-stone-100/50 max-w-sm leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                the boundary holds. you held it.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip / safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-20 text-[10px] uppercase tracking-[0.3em] text-white/25 hover:text-stone-200/70 transition"
      >
        end · save
      </button>
    </div>
  );
}

export default function BoundaryNo() {
  const g = getLabGame("boundary-no")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <Play onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}