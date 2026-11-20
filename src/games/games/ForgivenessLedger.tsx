// FORGIVENESS LEDGER — World-Class Rebuild
// Name the debt. What it costs. Choose — release, partial, or not yet.
// Senses: TTS (guru framing + adaptive choice prompts), STT (spoken reflection),
//         sound design (heartbeat bed + chimes + release swell), haptics (choice pulse + cost buzz),
//         particles (rose gold leaves falling), CinematicOverlay, adaptive choice reflection.
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Leaf, X, Check, Minus, Mic, Mic2 } from "lucide-react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import CinematicOverlay from "../shell/CinematicOverlay";

const SERIF = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

const CHOICES = [
  { id: "release", label: "release fully", icon: <Check className="w-4 h-4" />, color: "emerald" },
  { id: "partial", label: "release part", icon: <Minus className="w-4 h-4" />, color: "amber" },
  { id: "hold", label: "not yet", icon: <X className="w-4 h-4" />, color: "rose" },
] as const;

type Choice = typeof CHOICES[number]["id"] | null;

function Play({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [stage, setStage] = useState<"who" | "debt" | "cost" | "choice" | "reflect" | "integrate">("who");
  const [who, setWho] = useState("");
  const [debt, setDebt] = useState("");
  const [cost, setCost] = useState("");
  const [choice, setChoice] = useState<Choice>(null);
  const [reflection, setReflection] = useState("");
  const [listening, setListening] = useState(false);
  const [leaves, setLeaves] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number; rotation: number; color: string }>>([]);
  const [pulse, setPulse] = useState(0);

  const ready = who.trim() && debt.trim() && cost.trim() && choice;
  const sessionStartRef = useRef(Date.now());
  const endedRef = useRef(false);

  // Heartbeat bed
  useEffect(() => {
    sd.bed("heartbeat", 0.12);
    return () => sd.stopBed();
  }, []);

  // Falling leaves
  useEffect(() => {
    const interval = setInterval(() => {
      setLeaves(prev => {
        const next = [...prev];
        if (next.length < 20) {
          const colors = { release: "#86efac", partial: "#fde047", hold: "#fda4af" };
          next.push({
            id: Date.now(),
            x: Math.random() * 100,
            y: -10,
            size: 8 + Math.random() * 12,
            opacity: 0.3 + Math.random() * 0.3,
            rotation: Math.random() * 360,
            color: choice ? colors[choice] : "#fda4af",
          });
        }
        return next.map(l => ({ ...l, y: l.y + 1 + Math.random() * 2, rotation: l.rotation + 1 }))
          .filter(l => l.y < 115);
      });
    }, 500);
    return () => clearInterval(interval);
  }, [choice]);

  // Stage entry
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (stage === "who") {
        sd.chime("rise", 0.12);
        await say("kṣamā — the honest ledger. who owes you a debt?", "guru");
      } else if (stage === "debt") {
        sd.chime("rise", 0.12);
        await say(`${who} owes you something. what is it?`, "guru");
      } else if (stage === "cost") {
        sd.chime("rise", 0.1);
        await say(`they owe you: ${debt}. what does carrying this cost you?`, "guru");
      } else if (stage === "choice") {
        sd.chime("rise", 0.15);
        await say(`it costs: ${cost}. choose — release fully, release part, or not yet. nothing is required.`, "guru");
      } else if (stage === "reflect") {
        sd.chime("drop", 0.18);
        await say("the choice is made. speak what the ledger says now.", "guru");
        try { await transcribe.start(); setListening(true); } catch {}
      } else if (stage === "integrate") {
        if (listening) {
          setListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setReflection(r.transcript.trim().slice(0, 300));
        }
        sd.chime("drop", 0.15);
        stopVoice();
        await say("the ledger is noted. you chose honestly.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [stage]);

  const advance = (value: string) => {
    if (stage === "who" && value.trim()) { setWho(value); setStage("debt"); buzz("tap"); sd.chime("drop", 0.1); }
    else if (stage === "debt" && value.trim()) { setDebt(value); setStage("cost"); buzz("tap"); sd.chime("drop", 0.1); }
    else if (stage === "cost" && value.trim()) { setCost(value); setStage("choice"); buzz("tap"); sd.chime("rise", 0.1); }
  };

  const makeChoice = (c: Choice) => {
    setChoice(c);
    const choiceData = CHOICES.find(ch => ch.id === c);
    sd.chime(choiceData?.id === "release" ? "rise" : choiceData?.id === "partial" ? "drop" : "drop", 0.2);
    buzz(choiceData?.id === "release" ? "exhale" : "heavy");
    setPulse(p => p + 1);
    setStage("reflect");
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
        who: who,
        debt: debt,
        cost: cost,
        choice: choice,
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

  const currentInput = stage === "who" ? who : stage === "debt" ? debt : stage === "cost" ? cost : "";
  const placeholders = { who: "who owes you", debt: "what they owe", cost: "what carrying it costs you" };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Rose-purple ledger gradient */}
      <motion.div
        animate={{ opacity: [0.08, 0.2, 0.08] }}
        transition={{ duration: 16, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-br from-rose-950/25 via-black to-purple-950/20 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
      <CinematicOverlay tint="warm" />

      {/* Falling leaves */}
      <AnimatePresence>
        {leaves.map(l => (
          <motion.div
            key={l.id}
            initial={{ opacity: 0, y: -20, rotate: l.rotation }}
            animate={{ opacity: l.opacity, y: l.y, rotate: l.rotation + 180 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: "linear" }}
            className="absolute pointer-events-none"
            style={{
              left: `${l.x}%`,
              top: `${l.y}%`,
              width: `${l.size}px`,
              height: `${l.size * 0.6}px`,
              backgroundColor: l.color,
              clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
              transform: `rotate(${l.rotation}deg)`,
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
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-rose-200/75"
        >
          <span className="w-1 h-1 rounded-full bg-rose-200/80 animate-pulse" />
          {stage}
        </motion.div>
      </div>

      {/* Top-right: progress */}
      <div className="absolute top-6 right-6 z-10 text-right space-y-1.5">
        <div className="flex items-center justify-end gap-1.5">
          <Heart className="w-3 h-3 text-rose-200/60" />
          <span className="text-[10px] uppercase tracking-widest text-white/50">ledger</span>
        </div>
        {stage === "choice" && choice && (
          <p className="text-[10px] uppercase tracking-widest text-emerald-200/65">choice · {choice}</p>
        )}
        {stage === "reflect" && (
          <p className="text-[10px] uppercase tracking-widest text-rose-200/65">reflect</p>
        )}
        {stage === "integrate" && (
          <p className="text-[10px] uppercase tracking-widest text-emerald-200/65">integrate</p>
        )}
      </div>

      {/* Center ledger visualization */}
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
            className="w-40 h-56 rounded-xl bg-gradient-to-b from-rose-900/30 to-purple-900/20 border border-rose-300/20 flex flex-col items-center justify-center p-6"
          >
            <p className="text-[10px] uppercase tracking-[0.4em] text-rose-200/60 mb-2">kṣamā</p>
            <p className="text-2xl font-light text-rose-100/80 mb-4" style={SERIF}>the ledger</p>
            {who && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center text-sm text-rose-100/70 mb-2" style={SERIF}>
                {who} · {debt}
              </motion.div>
            )}
            {cost && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center text-sm text-amber-200/70 mb-2" style={SERIF}>
                cost: {cost}
              </motion.div>
            )}
            {choice && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 mt-4"
              >
                <span className={`text-[10px] uppercase tracking-[0.3em] px-3 py-1 rounded-full ${choice === "release" ? "bg-emerald-500/30 text-emerald-200" : choice === "partial" ? "bg-amber-500/30 text-amber-200" : "bg-rose-500/30 text-rose-200"}`}>
                  {CHOICES.find(c => c.id === choice)?.label}
                </span>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-16 z-10 flex flex-col items-center px-8 pointer-events-none">
        <AnimatePresence mode="wait">
          {(stage === "who" || stage === "debt" || stage === "cost") && (
            <motion.div
              key={`input-${stage}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
              className="text-center w-full max-w-md pointer-events-auto"
            >
              <p className="text-2xl sm:text-3xl italic text-white/90 mb-2 leading-relaxed" style={SERIF}>
                {stage === "who" && "who owes you a debt?"}
                {stage === "debt" && `${who} owes you what?`}
                {stage === "cost" && `they owe: ${debt}. what's the cost?`}
              </p>

              <input
                value={currentInput}
                onChange={e => advance(e.target.value)}
                placeholder={placeholders[stage as keyof typeof placeholders]}
                className="w-full bg-transparent border-b-2 border-rose-300/40 py-3 mb-6 text-white/90 italic text-center text-base focus:outline-none focus:border-rose-300" style={SERIF}
                autoFocus
              />

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => advance(currentInput)} disabled={!currentInput.trim()} className={`w-full py-3 rounded-full border text-sm uppercase tracking-[0.3em] ${currentInput.trim() ? "border-rose-300/60 text-rose-100 bg-rose-500/10 hover:bg-rose-500/20" : "border-white/10 text-white/25"}`}>next</motion.button>
            </motion.div>
          )}

          {stage === "choice" && (
            <motion.div key="choice" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-white/90 mb-2 leading-relaxed" style={SERIF}>
                it costs: {cost}
              </p>
              <p className="text-white/40 text-sm mb-6">choose · nothing is required</p>
              
              <div className="flex flex-col gap-3 mb-6">
                {CHOICES.map(c => (
                  <motion.button
                    key={c.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => makeChoice(c.id)}
                    className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 text-left ${choice === c.id ? `border-${c.color}-400/70 bg-${c.color}-500/15` : "border-white/15 bg-white/5"}`}
                  >
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full ${choice === c.id ? `bg-${c.color}-500/30` : "bg-white/10"}`}>
                      {c.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/90">{c.label}</p>
                      <p className="text-[10px] text-white/40">nothing is required</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {stage === "reflect" && (
            <motion.div key="reflect" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="text-center w-full max-w-md pointer-events-auto">
              <p className="text-2xl sm:text-3xl italic text-white/90 mb-6 leading-relaxed" style={SERIF}>the choice is made</p>
              <p className="italic text-rose-100/80 mb-6">"{cost}" · {choice}</p>
              
              {reflection ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg italic text-rose-100/85 max-w-md leading-relaxed mb-6" style={SERIF}>"{reflection}"</motion.p>
              ) : listening ? (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-rose-200/40 text-rose-100 text-[11px] uppercase tracking-[0.3em] bg-rose-500/10 backdrop-blur-sm animate-pulse" style={{ boxShadow: "0 0 30px rgba(244,114,182,0.2)" }}>
                  ● listening · tap when done
                </button>
              ) : (
                <button onClick={handleVoice} className="px-6 py-2.5 rounded-full border border-rose-300/50 text-rose-100 text-[11px] uppercase tracking-[0.3em] bg-rose-500/15 backdrop-blur-sm hover:bg-rose-500/25 transition" style={{ boxShadow: "0 0 20px rgba(244,114,182,0.15)" }}>
                  speak the reflection
                </button>
              )}
            </motion.div>
          )}

          {stage === "integrate" && (
            <motion.div key="integrate" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 1.6 }} className="text-center">
              <p className="text-[10px] uppercase tracking-[0.42em] text-rose-200/70">rest</p>
              <p className="mt-5 text-lg italic text-rose-100/50 max-w-sm leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                the ledger is noted. you chose honestly.
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

export default function ForgivenessLedger() {
  const g = getLabGame("forgiveness-ledger")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <Play onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}