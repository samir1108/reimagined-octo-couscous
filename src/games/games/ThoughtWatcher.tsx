// THOUGHT WATCHER v2 — flagship #12, fully sensorial.
//
// Senses used:
//   - Microphone (sub-vocal envelope = mental loudness)
//   - TTS (guru voice opens, reveals, closes)
//   - STT (closing reflection)
//   - Sound design (soft bed + chimes)
//   - Haptics (tap = "noted")
//
// Phases:
//   1. SETTLE   (5s) — TTS frames Vipassanā noting
//   2. WATCH    (90s) — words drift; tap to "note"; categorized as thinking/feeling/wanting
//   3. REVEAL   (10s) — TTS names the pattern (notice rate, latency, mind loudness)
//   4. REFLECT  (≤14s) — STT reflection
//   5. INTEGRATE(7s)
//
// Vipassanā noting (Goldstein) + meta-awareness / salience network (Hasenkamp 2012).

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useBreathMic } from "../shell/useBreathMic";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import ThoughtWatcherFieldCanvas from "./ThoughtWatcherFieldCanvas";

type Category = "thinking" | "feeling" | "wanting";
type Phase = "settle" | "watch" | "reveal" | "reflect" | "integrate";

const WATCH_MS = 90_000;

const POOL: Array<{ word: string; cat: Category }> = [
  { word: "money", cat: "thinking" },
  { word: "the email", cat: "thinking" },
  { word: "tomorrow", cat: "thinking" },
  { word: "what if", cat: "thinking" },
  { word: "I should", cat: "thinking" },
  { word: "they think", cat: "thinking" },
  { word: "remember", cat: "thinking" },
  { word: "regret", cat: "feeling" },
  { word: "tired", cat: "feeling" },
  { word: "not enough", cat: "feeling" },
  { word: "restless", cat: "feeling" },
  { word: "warm", cat: "feeling" },
  { word: "ache", cat: "feeling" },
  { word: "her", cat: "wanting" },
  { word: "him", cat: "wanting" },
  { word: "later", cat: "wanting" },
  { word: "more", cat: "wanting" },
  { word: "now", cat: "wanting" },
  { word: "again", cat: "wanting" },
  { word: "not yet", cat: "wanting" },
];

interface Drift {
  id: number;
  word: string;
  cat: Category;
  x: number;
  bornAt: number;
  tappedAt?: number;
}

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [phase, setPhase] = useState<Phase>("settle");
  const [drifts, setDrifts] = useState<Drift[]>([]);
  const [reflection, setReflection] = useState("");
  const [reflectionListening, setReflectionListening] = useState(false);
  const [revealLine, setRevealLine] = useState("");
  const [notedPulse, setNotedPulse] = useState(0);
  const [progress, setProgress] = useState(0);

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const sessionStartRef = useRef<number>(Date.now());
  const watchStartRef = useRef(0);
  const idRef = useRef(0);
  const recordRef = useRef<Drift[]>([]);
  const envSamplesRef = useRef<number[]>([]);
  const endedRef = useRef(false);
  const sighsAtStartRef = useRef(0);

  // Soft bed
  useEffect(() => { sd.bed("temple", 0.14); return () => sd.stopBed(); /* eslint-disable-next-line */ }, []);

  // Phase narration
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.14);
        await say("words will drift up. tap one when you see it. that is all.", "guru");
        if (cancelled) return;
        setTimeout(() => {
          if (cancelled) return;
          setPhase("watch");
          watchStartRef.current = Date.now();
          sighsAtStartRef.current = breath.sighs;
        }, 1200);
      } else if (phase === "reveal") {
        sd.chime("drop", 0.18);
        const noticed = recordRef.current.filter((d) => d.tappedAt != null);
        const lats = noticed.map((d) => d.tappedAt! - d.bornAt);
        const avgLat = lats.length ? lats.reduce((a, b) => a + b, 0) / lats.length : 0;
        const rate = recordRef.current.length ? noticed.length / recordRef.current.length : 0;
        const avgEnv = envSamplesRef.current.length
          ? envSamplesRef.current.reduce((a, b) => a + b, 0) / envSamplesRef.current.length : 0;
        const cats = { thinking: 0, feeling: 0, wanting: 0 };
        for (const d of noticed) cats[d.cat] += 1;
        const dominant: Category = (Object.entries(cats).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "thinking") as Category;

        let line = "you watched. the watcher is awake.";
        if (rate < 0.2) line = "most drifted by unseen. that is honest. the watcher is still waking.";
        else if (rate > 0.7 && avgLat < 1500) line = "you caught them quickly. crisp meta-awareness.";
        else if (avgEnv > 0.18) line = "the inside was loud. and still you noted. that is the practice.";
        else if (dominant === "wanting") line = "the noted ones were mostly wanting. desire is what asks loudest today.";
        else if (dominant === "feeling") line = "the noted ones were mostly feeling. the body was speaking up.";
        else if (dominant === "thinking") line = "the noted ones were mostly thinking. the head ran the show.";
        setRevealLine(line);
        await say(line, "guru");
      } else if (phase === "reflect") {
        sd.chime("drop", 0.16);
        await say("which one kept coming back?", "guru");
        if (cancelled) return;
        try { await transcribe.start(); setReflectionListening(true); } catch {}
      } else if (phase === "integrate") {
        if (reflectionListening) {
          setReflectionListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setReflection(r.transcript.trim().slice(0, 240));
        }
        sd.chime("drop", 0.18);
        stopVoice();
        await say("noting is enough. nothing else needs doing.", "guru");
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // WATCH spawn loop + progress + auto advance
  useEffect(() => {
    if (phase !== "watch") return;
    let alive = true;
    const spawn = () => {
      if (!alive) return;
      const pick = POOL[Math.floor(Math.random() * POOL.length)];
      const d: Drift = {
        id: ++idRef.current,
        word: pick.word,
        cat: pick.cat,
        x: 8 + Math.random() * 78,
        bornAt: performance.now(),
      };
      setDrifts((arr) => [...arr, d]);
      recordRef.current.push(d);
      setTimeout(() => setDrifts((arr) => arr.filter((x) => x.id !== d.id)), 9000);
      setTimeout(spawn, 1600 + Math.random() * 2400);
    };
    const sp = setTimeout(spawn, 800);

    const id = setInterval(() => {
      const elapsed = Date.now() - watchStartRef.current;
      const p = Math.min(1, elapsed / WATCH_MS);
      setProgress(p);
      if (p >= 1) {
        clearInterval(id);
        alive = false;
        setPhase("reveal");
        sd.chime("rise", 0.28);
      }
    }, 200);

    return () => { alive = false; clearTimeout(sp); clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Sample mic envelope while watching
  useEffect(() => {
    if (phase !== "watch") return;
    envSamplesRef.current.push(breath.envelope);
    if (envSamplesRef.current.length > 1500) envSamplesRef.current.shift();
  }, [breath.envelope, phase]);

  // Auto advance reveal → reflect
  useEffect(() => {
    if (phase !== "reveal") return;
    const t = setTimeout(() => setPhase("reflect"), 10_000);
    return () => clearTimeout(t);
  }, [phase]);

  // Auto advance reflect → integrate
  useEffect(() => {
    if (phase !== "reflect") return;
    const t = setTimeout(() => setPhase("integrate"), 14_000);
    return () => clearTimeout(t);
  }, [phase]);

  // Auto end after integrate
  useEffect(() => {
    if (phase !== "integrate") return;
    const t = setTimeout(() => finish(), 7_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const tap = (d: Drift) => {
    if (d.tappedAt != null) return;
    d.tappedAt = performance.now();
    setDrifts((arr) => arr.filter((x) => x.id !== d.id));
    setNotedPulse((n) => n + 1);
    buzz("tap");
    sd.chime("rise", 0.06);
  };

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    const noticed = recordRef.current.filter((d) => d.tappedAt != null);
    const lats = noticed.map((d) => d.tappedAt! - d.bornAt);
    const avgEnv = envSamplesRef.current.length
      ? envSamplesRef.current.reduce((a, b) => a + b, 0) / envSamplesRef.current.length : 0;
    const cats = { thinking: 0, feeling: 0, wanting: 0 };
    for (const d of noticed) cats[d.cat] += 1;
    const sighs = Math.max(0, breath.sighs - sighsAtStartRef.current);
    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        spawned: recordRef.current.length,
        noticed: noticed.length,
        notice_rate: recordRef.current.length ? +(noticed.length / recordRef.current.length).toFixed(3) : 0,
        avg_notice_latency_ms: lats.length ? Math.round(lats.reduce((a, b) => a + b, 0) / lats.length) : null,
        noted_thinking: cats.thinking,
        noted_feeling: cats.feeling,
        noted_wanting: cats.wanting,
        avg_mic_envelope: +avgEnv.toFixed(3),
        sighs_during_watch: sighs,
        reveal_line: revealLine,
        spoken_reflection: reflection || null,
        mic_ready: breath.ready,
      },
    });
  };

  const finalizeReflection = async () => {
    if (!reflectionListening) return;
    setReflectionListening(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) setReflection(r.transcript.trim().slice(0, 240));
    if (phase === "reflect") setPhase("integrate");
  };

  const remaining = phase === "watch" ? Math.max(0, WATCH_MS - (Date.now() - watchStartRef.current)) : 0;
  const noticedCount = recordRef.current.filter((d) => d.tappedAt != null).length;

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <ThoughtWatcherFieldCanvas envelope={breath.envelope} notedPulse={notedPulse} />

      {/* Cinematic vignette */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{
        background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 80%, rgba(4,6,14,0.92) 100%)"
      }} />
      {/* Film grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay z-10"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.85  0 0 0 0 0.9  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Top-left phase label */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <motion.div key={phase} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 0.9, x: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="flex items-center gap-2.5">
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
            className="block w-1 h-1 rounded-full bg-sky-200/80 shadow-[0_0_8px_rgba(186,230,253,0.9)]"
          />
          <span className="text-[10px] uppercase tracking-[0.5em] text-sky-100/80 font-light">
            {phase === "settle" && "the watcher"}
            {phase === "watch" && "watching"}
            {phase === "reveal" && "what was seen"}
            {phase === "reflect" && "speak"}
            {phase === "integrate" && "rest"}
          </span>
        </motion.div>
      </div>

      {/* Top-right signals */}
      <div className="absolute top-6 right-6 z-30 text-right space-y-1.5 pointer-events-none">
        <div className="flex items-center justify-end gap-1.5">
          {breath.ready ? <Mic className="w-3 h-3 text-sky-200/70" /> : <MicOff className="w-3 h-3 text-white/30" />}
          <span className="text-[10px] uppercase tracking-[0.35em] text-white/50">{breath.ready ? "mic" : "no mic"}</span>
        </div>
        {phase === "watch" && (
          <>
            <p className="text-[10px] uppercase tracking-[0.35em] text-sky-100/70" style={{ textShadow: "0 0 10px rgba(186,230,253,0.35)" }}>
              {Math.ceil(remaining / 1000)}s
            </p>
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/45">{noticedCount} noted</p>
          </>
        )}
      </div>

      {/* Watch — drifting words with category-tinted aura + blur→focus rise */}
      {phase === "watch" && (
        <AnimatePresence>
          {drifts.map((d) => {
            const tint =
              d.cat === "thinking"
                ? { color: "rgba(186,230,253,0.9)", glow: "rgba(56,189,248,0.5)" } // sky
                : d.cat === "feeling"
                ? { color: "rgba(253,186,205,0.9)", glow: "rgba(244,114,182,0.5)" } // rose
                : { color: "rgba(253,224,171,0.9)", glow: "rgba(251,191,36,0.5)" }; // amber
            return (
              <motion.button
                key={d.id}
                initial={{ y: "110vh", opacity: 0, filter: "blur(6px)", scale: 0.92 }}
                animate={{
                  y: "-15vh",
                  opacity: [0, 0.9, 0.9, 0],
                  filter: ["blur(6px)", "blur(0px)", "blur(0px)", "blur(4px)"],
                  scale: [0.92, 1, 1, 0.95],
                }}
                exit={{ opacity: 0, scale: 1.15, filter: "blur(8px)" }}
                transition={{ duration: 9, ease: "linear", times: [0, 0.15, 0.75, 1] }}
                onClick={() => tap(d)}
                style={{
                  left: `${d.x}%`,
                  color: tint.color,
                  textShadow: `0 0 18px ${tint.glow}`,
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                }}
                className="absolute z-20 text-xl italic font-light px-4 py-1.5 select-none tracking-wide hover:scale-110 transition-transform"
              >
                {d.word}
              </motion.button>
            );
          })}
        </AnimatePresence>
      )}

      {/* Phase content overlays */}
      <AnimatePresence mode="wait">
        {phase === "settle" && (
          <motion.div key="settle" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none px-8 text-center">
            <p className="text-2xl font-extralight text-white/90 tracking-[0.08em]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              the witness
            </p>
            <p className="mt-4 text-xs text-white/55 max-w-xs tracking-[0.15em] font-light">tap a word when you see it drift · no judgment · just noting</p>
          </motion.div>
        )}

        {phase === "watch" && (
          <motion.div key="watch-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="absolute bottom-12 inset-x-0 z-10 text-center pointer-events-none">
            <motion.p
              animate={{ opacity: [0.25, 0.5, 0.25] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="text-[10px] uppercase tracking-[0.4em] text-white/35"
            >
              tap a thought when you see it
            </motion.p>
          </motion.div>
        )}

        {phase === "reveal" && (
          <motion.div key="reveal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none">
            <p className="text-[10px] uppercase tracking-[0.5em] text-sky-100/75 mb-8">what was seen</p>
            <p
              className="text-xl sm:text-2xl font-extralight text-sky-50 italic leading-relaxed max-w-xl mb-10"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", textShadow: "0 0 24px rgba(186,230,253,0.35)" }}
            >
              "{revealLine || "…"}"
            </p>
            <div className="space-y-3 max-w-[220px] w-full text-[11px] tracking-[0.2em] uppercase text-white/55">
              <div className="flex justify-between border-b border-white/10 pb-2"><span>noted</span><span className="text-sky-200/90">{noticedCount} / {recordRef.current.length}</span></div>
              <div className="flex justify-between"><span>sighs</span><span className="text-amber-200/90">{Math.max(0, breath.sighs - sighsAtStartRef.current)}</span></div>
            </div>
          </motion.div>
        )}

        {phase === "reflect" && (
          <motion.div key="reflect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center">
            <p className="text-xl font-extralight text-white/90 mb-7" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              which one kept coming back?
            </p>
            {reflection ? (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }} className="text-lg text-sky-100/95 italic max-w-md font-light" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", textShadow: "0 0 20px rgba(186,230,253,0.3)" }}>
                "{reflection}"
              </motion.p>
            ) : reflectionListening ? (
              <button onClick={finalizeReflection} className="px-6 py-2.5 rounded-full border border-sky-200/50 text-sky-100 text-[11px] uppercase tracking-[0.3em] bg-sky-500/10 backdrop-blur-md animate-pulse shadow-[0_0_24px_rgba(186,230,253,0.25)]">
                ● listening — tap when done
              </button>
            ) : (
              <p className="text-xs text-white/40">preparing…</p>
            )}
          </motion.div>
        )}

        {phase === "integrate" && (
          <motion.div key="integrate" initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} exit={{ opacity: 0 }} transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none">
            <p className="text-sm font-extralight text-white/70 tracking-[0.5em] uppercase">noted</p>
            {reflection && <p className="mt-5 text-sm italic text-white/55 max-w-sm font-light" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>"{reflection}"</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress ring at bottom during watch */}
      {phase === "watch" && (
        <div className="absolute bottom-4 left-0 right-0 h-[2px] z-30 bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-sky-300/40 via-sky-200/80 to-sky-100/90 transition-all duration-500"
            style={{ width: `${progress * 100}%`, boxShadow: "0 0 12px rgba(186,230,253,0.6)" }}
          />
        </div>
      )}

      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-40 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-sky-100/70 transition-all duration-500"
      >
        end · save
      </button>
    </div>
  );
}

export default function ThoughtWatcher() {
  const g = getLabGame("thought-watcher")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}
