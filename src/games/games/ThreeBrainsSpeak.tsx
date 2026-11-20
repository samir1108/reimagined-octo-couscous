// THREE BRAINS SPEAK v2 — flagship #6, fully sensorial.
//
// Senses used:
//   - TTS (guru voice asks the question through each brain, plus reveal)
//   - STT (optional: speak instead of type — full transcript captured)
//   - Mic (live envelope feeds sparks even while speaking)
//   - Sound design (temple bed + chimes per brain)
//   - Haptics (pulse per keystroke + transition buzz)
//
// Phases:
//   1. SETTLE   (8s) — TTS intro
//   2. QUESTION (7s) — show + speak the prompt
//   3. HEAD     (≤45s) — type or speak the head's answer
//   4. HEART    (≤45s) — heart's answer
//   5. GUT      (≤45s) — gut's answer
//   6. REVEAL   (14s)  — winning pillar erupts; TTS announces dominance
//   7. INTEGRATE(8s)
//
// IP: typing-biometrics-derived 3-brain dominance ranking.

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Type } from "lucide-react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useMicLevel } from "../shell/useMicLevel";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import ThreeBrainsCanvas, { Brain } from "./ThreeBrainsCanvas";

type Phase = "settle" | "question" | "head" | "heart" | "gut" | "reveal" | "integrate";
const ORDER: Phase[] = ["settle", "question", "head", "heart", "gut", "reveal", "integrate"];
const PHASE_MS: Record<Phase, number> = {
  settle: 8000,
  question: 7000,
  head: 45000,
  heart: 45000,
  gut: 45000,
  reveal: 14000,
  integrate: 8000,
};
const BRAIN_ORDER: Brain[] = ["head", "heart", "gut"];
const BRAIN_COPY: Record<Brain, { label: string; subtitle: string; ttsLead: string; placeholder: string }> = {
  head:  { label: "head",  subtitle: "what does it think?", ttsLead: "first, the head. what does it think?",       placeholder: "the logical answer…" },
  heart: { label: "heart", subtitle: "what does it feel?",  ttsLead: "now the heart. what does it feel?",          placeholder: "the felt answer…" },
  gut:   { label: "gut",   subtitle: "what does it know?",  ttsLead: "finally the gut. one sentence — what does it know?", placeholder: "the gut answer…" },
};

const PROMPTS = [
  "Should I have the conversation I've been avoiding?",
  "Is this relationship still right for me?",
  "Should I leave this job?",
  "Do I actually want what I'm chasing?",
  "What am I pretending not to know?",
  "Who am I trying to become — and is it me?",
];

interface BrainStats {
  text: string;
  startMs: number;
  endMs: number;
  chars: number;
  words: number;
  keystrokes: number;
  backspaces: number;
  longestPauseMs: number;
  avgInterKeyMs: number;
  spoken: boolean;
}
const emptyStats = (): BrainStats => ({
  text: "", startMs: 0, endMs: 0, chars: 0, words: 0,
  keystrokes: 0, backspaces: 0, longestPauseMs: 0, avgInterKeyMs: 0, spoken: false,
});

function inferDominance(s: Record<Brain, BrainStats>): { ranking: Brain[]; reasoning: string; scores: Record<Brain, number> } {
  const score: Record<Brain, number> = { head: 0, heart: 0, gut: 0 };
  const totals = BRAIN_ORDER.map((b) => s[b].words);
  const maxWords = Math.max(...totals, 1);
  for (const b of BRAIN_ORDER) {
    const st = s[b];
    if (!st.text.trim()) continue;
    const speed = st.avgInterKeyMs;
    const length = st.words / maxWords;
    const pause = st.longestPauseMs;
    const corr = st.backspaces / Math.max(st.keystrokes, 1);
    score.head  += speed > 0 && speed < 200 ? 2 : speed < 350 ? 1 : 0;
    score.head  += length > 0.6 ? 1 : 0;
    score.head  += corr < 0.05 ? 1 : 0;
    score.heart += pause > 2000 ? 2 : pause > 1000 ? 1 : 0;
    score.heart += corr > 0.08 ? 1 : 0;
    score.heart += speed > 350 ? 1 : 0;
    score.gut   += length < 0.5 && st.text.trim().length > 5 ? 2 : 0;
    score.gut   += corr < 0.03 ? 1 : 0;
    score.gut   += speed > 0 && speed < 250 && pause < 800 ? 1 : 0;
    score[b]    += 1;
  }
  const ranking = BRAIN_ORDER
    .filter((b) => s[b].text.trim().length > 0)
    .sort((a, b) => score[b] - score[a]);
  const top = ranking[0];
  const reasoning = top
    ? `Your ${top} brain led — its rhythm was strongest across all three answers.`
    : "No clear dominance — the council was quiet.";
  return { ranking, reasoning, scores: score };
}

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [phase, setPhase] = useState<Phase>("settle");
  const [prompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  const [stats, setStats] = useState<Record<Brain, BrainStats>>({
    head: emptyStats(), heart: emptyStats(), gut: emptyStats(),
  });
  const [pulse, setPulse] = useState(0);
  const [winner, setWinner] = useState<Brain | null>(null);
  const [reasoning, setReasoning] = useState<string>("");
  const [listeningBrain, setListeningBrain] = useState<Brain | null>(null);

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const mic = useMicLevel(true);
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const phaseStartRef = useRef<number>(Date.now());
  const sessionStartRef = useRef<number>(Date.now());
  const endedRef = useRef(false);
  const lastKeyAtRef = useRef<number>(0);
  const interKeysRef = useRef<number[]>([]);
  const lastMicPulseRef = useRef<number>(0);

  // Bed
  useEffect(() => {
    sd.bed("temple", 0.2);
    return () => sd.stopBed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phase advance
  useEffect(() => {
    const id = setInterval(() => {
      if (endedRef.current) return;
      const elapsed = Date.now() - phaseStartRef.current;
      if (elapsed < PHASE_MS[phase]) return;
      const idx = ORDER.indexOf(phase);
      if (idx < ORDER.length - 1) {
        const next = ORDER[idx + 1];
        if (next === "reveal") finalizeAndReveal();
        else if (next === "integrate" && phase === "reveal") {
          // ok
          setPhase(next);
          phaseStartRef.current = Date.now();
        } else {
          setPhase(next);
          phaseStartRef.current = Date.now();
          lastKeyAtRef.current = 0;
          interKeysRef.current = [];
        }
      } else {
        finish();
      }
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Phase entry side effects
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.16);
        await say("the council of three. one question — three answers.", "guru");
        if (cancelled) return;
        await say("head. heart. gut. each one will speak.", "guru");
      } else if (phase === "question") {
        sd.chime("rise", 0.18);
        await say(prompt, "guru");
      } else if (phase === "head" || phase === "heart" || phase === "gut") {
        const b = phase as Brain;
        sd.chime("rise", 0.14);
        buzz("tap");
        await say(BRAIN_COPY[b].ttsLead, "guru");
      } else if (phase === "reveal") {
        sd.chime("rise", 0.22);
        if (winner) {
          await say(`the ${winner} brain spoke loudest.`, "guru");
          if (cancelled) return;
          await say(reasoning, "guru");
        } else {
          await say("the council was quiet.", "guru");
        }
      } else if (phase === "integrate") {
        sd.chime("drop", 0.16);
        stopVoice();
        await say("notice which voice you trust. carry it forward.", "guru");
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Mic-driven sparks while speaking
  useEffect(() => {
    if (phase !== "head" && phase !== "heart" && phase !== "gut") return;
    if (!listeningBrain) return;
    const now = performance.now();
    if (mic.level > 0.18 && now - lastMicPulseRef.current > 80) {
      lastMicPulseRef.current = now;
      setPulse((p) => p + 1);
    }
  }, [mic.level, phase, listeningBrain]);

  const onChange = (b: Brain, val: string) => {
    setStats((prev) => {
      const cur = { ...prev[b] };
      const now = performance.now();
      if (cur.startMs === 0) {
        cur.startMs = now;
        lastKeyAtRef.current = now;
        interKeysRef.current = [];
      }
      const isBackspace = val.length < cur.text.length;
      if (isBackspace) cur.backspaces += 1;
      cur.keystrokes += 1;
      const dt = now - lastKeyAtRef.current;
      if (dt > 0 && dt < 10000) {
        interKeysRef.current.push(dt);
        if (dt > cur.longestPauseMs) cur.longestPauseMs = dt;
      }
      lastKeyAtRef.current = now;
      cur.text = val;
      cur.chars = val.length;
      cur.words = val.trim().split(/\s+/).filter(Boolean).length;
      cur.avgInterKeyMs = interKeysRef.current.length > 0
        ? interKeysRef.current.reduce((a, c) => a + c, 0) / interKeysRef.current.length
        : 0;
      return { ...prev, [b]: cur };
    });
    setPulse((p) => p + 1);
    buzz("tap");
  };

  const next = (b: Brain) => {
    setStats((prev) => ({ ...prev, [b]: { ...prev[b], endMs: performance.now() } }));
    sd.chime("drop", 0.16);
    const idx = BRAIN_ORDER.indexOf(b);
    if (idx < BRAIN_ORDER.length - 1) {
      const nextBrain = BRAIN_ORDER[idx + 1] as Phase;
      setPhase(nextBrain);
      phaseStartRef.current = Date.now();
      lastKeyAtRef.current = 0;
      interKeysRef.current = [];
    } else {
      finalizeAndReveal();
    }
  };

  const startListen = async (b: Brain) => {
    try { await transcribe.start(); setListeningBrain(b); } catch {}
  };
  const stopListen = async (b: Brain) => {
    setListeningBrain(null);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) {
      const text = r.transcript.trim().slice(0, 480);
      setStats((prev) => ({
        ...prev,
        [b]: { ...prev[b], text, chars: text.length, words: text.split(/\s+/).filter(Boolean).length, spoken: true, endMs: performance.now() },
      }));
    }
  };

  const finalizeAndReveal = () => {
    const dom = inferDominance(stats);
    setWinner(dom.ranking[0] || null);
    setReasoning(dom.reasoning);
    setPhase("reveal");
    phaseStartRef.current = Date.now();
  };

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    const dom = inferDominance(stats);
    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        prompt,
        head: stats.head,
        heart: stats.heart,
        gut: stats.gut,
        dominance_ranking: dom.ranking,
        dominance_scores: dom.scores,
        dominance_reasoning: dom.reasoning,
      },
    });
  };

  // Levels for canvas — answer length + activity boost
  const levels: Record<Brain, number> = {
    head:  Math.min(1, 0.10 + (stats.head.words  / 30) + (phase === "head"  ? 0.18 : 0) + (winner === "head"  ? 0.4 : 0)),
    heart: Math.min(1, 0.10 + (stats.heart.words / 30) + (phase === "heart" ? 0.18 : 0) + (winner === "heart" ? 0.4 : 0)),
    gut:   Math.min(1, 0.10 + (stats.gut.words   / 30) + (phase === "gut"   ? 0.18 : 0) + (winner === "gut"   ? 0.4 : 0)),
  };
  const activeBrain: Brain | null =
    phase === "head" ? "head" : phase === "heart" ? "heart" : phase === "gut" ? "gut" : null;

  const currentBrain = activeBrain;
  const isAnswering = currentBrain !== null;

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Aurora */}
      <motion.div
        animate={{ opacity: [0.06, 0.14, 0.06] }}
        transition={{ duration: 13, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-b from-violet-950/25 via-transparent to-amber-950/25 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85" />

      <ThreeBrainsCanvas active={activeBrain} levels={levels} pulse={pulse} reveal={phase === "reveal" ? winner : null} />

      {/* Top-left phase pill */}
      <div className="absolute top-6 left-6 z-10">
        <motion.div
          key={phase}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 0.85, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[10px] uppercase tracking-[0.4em] text-white/60"
        >
          {phase === "settle" && "the council"}
          {phase === "question" && "the question"}
          {phase === "head" && "head speaks"}
          {phase === "heart" && "heart speaks"}
          {phase === "gut" && "gut speaks"}
          {phase === "reveal" && "reveal"}
          {phase === "integrate" && "rest"}
        </motion.div>
      </div>

      {/* Top-right signals */}
      <div className="absolute top-6 right-6 z-10 text-right space-y-1.5">
        <div className="flex items-center justify-end gap-1.5">
          {mic.ready ? <Mic className="w-3 h-3 text-white/60" /> : <MicOff className="w-3 h-3 text-white/30" />}
          <span className="text-[10px] uppercase tracking-widest text-white/50">{mic.ready ? "mic" : "no mic"}</span>
        </div>
        {isAnswering && (
          <p className="text-[10px] uppercase tracking-widest text-white/40">words · {stats[currentBrain!].words}</p>
        )}
      </div>

      {/* The prompt — always visible from question phase onward */}
      {phase !== "settle" && (
        <div className="absolute inset-x-0 top-[10%] flex items-center justify-center px-8 pointer-events-none z-10">
          <motion.h2
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: phase === "question" ? 1 : 0.5, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center font-light text-white/85 max-w-2xl text-lg sm:text-xl leading-relaxed italic"
          >
            "{prompt}"
          </motion.h2>
        </div>
      )}

      {/* Bottom: per-brain input area */}
      <div className="absolute inset-x-0 bottom-20 z-10 flex flex-col items-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "settle" && (
            <motion.p key="settle" initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} className="text-xs text-white/50">
              one question · three answers
            </motion.p>
          )}

          {(phase === "head" || phase === "heart" || phase === "gut") && currentBrain && (
            <motion.div
              key={`brain-${currentBrain}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md flex flex-col items-center gap-3 pointer-events-auto"
            >
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/55">{BRAIN_COPY[currentBrain].subtitle}</p>
              <textarea
                value={stats[currentBrain].text}
                onChange={(e) => onChange(currentBrain, e.target.value)}
                placeholder={BRAIN_COPY[currentBrain].placeholder}
                rows={3}
                disabled={listeningBrain === currentBrain}
                className="w-full bg-white/5 border border-white/15 rounded-xl p-3.5 text-white/90 placeholder:text-white/25 text-sm leading-relaxed focus:outline-none focus:border-white/30 transition-colors resize-none backdrop-blur-sm"
              />
              <div className="flex items-center gap-3">
                {listeningBrain === currentBrain ? (
                  <button onClick={() => stopListen(currentBrain)} className="px-4 py-2 rounded-full border border-white/30 text-white/80 text-xs bg-white/5 backdrop-blur-sm animate-pulse">
                    ● listening — tap to finish
                  </button>
                ) : (
                  <button onClick={() => startListen(currentBrain)} className="px-3 py-2 rounded-full border border-white/15 text-white/55 text-[11px] hover:bg-white/5 backdrop-blur-sm flex items-center gap-1.5">
                    <Mic className="w-3 h-3" /> speak instead
                  </button>
                )}
                <button
                  onClick={() => next(currentBrain)}
                  disabled={stats[currentBrain].text.trim().length < 3}
                  className={`px-5 py-2 rounded-full text-xs transition-all ${
                    stats[currentBrain].text.trim().length >= 3
                      ? "bg-white/15 hover:bg-white/25 text-white"
                      : "bg-white/5 text-white/30 cursor-not-allowed"
                  }`}
                >
                  {currentBrain === "gut" ? "hear all three" : "next brain"}
                </button>
              </div>
            </motion.div>
          )}

          {phase === "reveal" && (
            <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} className="text-center">
              {winner ? (
                <>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-white/50 mb-2">today, the loudest voice</p>
                  <p className={`text-3xl font-light tracking-[0.25em] uppercase ${
                    winner === "head" ? "text-violet-200" : winner === "heart" ? "text-rose-200" : "text-amber-200"
                  }`}>{winner}</p>
                  <p className="mt-3 text-xs text-white/55 max-w-md mx-auto italic">{reasoning}</p>
                </>
              ) : (
                <p className="text-sm text-white/50 italic">the council was quiet.</p>
              )}
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="integrate" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 1.4 }} className="text-center">
              <p className="text-sm font-light text-white/60 tracking-[0.3em] uppercase">rest</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom indicator: brain dots */}
      {(phase === "head" || phase === "heart" || phase === "gut" || phase === "reveal") && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
          {BRAIN_ORDER.map((b) => {
            const past = BRAIN_ORDER.indexOf(b) < BRAIN_ORDER.indexOf(currentBrain ?? "gut") || phase === "reveal";
            const here = currentBrain === b;
            const won = phase === "reveal" && winner === b;
            return (
              <span key={b} className={`block h-[2px] rounded-full transition-all duration-700 ${
                won ? "w-12 bg-white/85" : here ? "w-8 bg-white/70" : past ? "w-6 bg-white/35" : "w-4 bg-white/15"
              }`} />
            );
          })}
        </div>
      )}

      {/* skip */}
      <button
        onClick={finish}
        className="absolute bottom-2 right-4 z-20 text-[9px] uppercase tracking-widest text-white/25 hover:text-white/60 transition"
      >
        end · save
      </button>
      <Type className="hidden" />
    </div>
  );
}

export default function ThreeBrainsSpeak() {
  const g = getLabGame("three-brains-speak")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}
