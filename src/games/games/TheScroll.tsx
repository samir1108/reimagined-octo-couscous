// THE SCROLL v2 — flagship #17, fully sensorial.
//
// Driven by an XState v5 phase machine.
//
// Senses used:
//   - Microphone (sub-vocal envelope = stress proxy)
//   - TTS (guru intro + reveal)
//   - STT (closing reflection)
//   - Sound design (soft bed + chimes)
//   - Haptics (refresh attempt, end pulse)
//   - Touch/scroll biometrics (velocity, dwell per item, refresh attempts, pause-then-burst patterns)
//
// Phases (XState):
//   1. settle    (6s)  — guru voice frames the experiment.
//   2. scroll    (75s) — generative-feel feed; we just watch.
//   3. reveal    (10s) — show what we read in their behaviour.
//   4. reflect   (≤14s) — STT reflection.
//   5. integrate (7s)
//
// Mere-measurement / generative-feed stress profiling.

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, RefreshCw } from "lucide-react";
import { setup } from "xstate";
import { useMachine } from "@xstate/react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useBreathMic } from "../shell/useBreathMic";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import TheScrollFieldCanvas from "./TheScrollFieldCanvas";

type Phase = "settle" | "scroll" | "reveal" | "reflect" | "integrate";

const PHASE_MS: Record<Phase, number> = {
  settle: 6000,
  scroll: 75000,
  reveal: 10000,
  reflect: 14000,
  integrate: 7000,
};

const machine = setup({
  types: {} as { events: { type: "ADVANCE" } | { type: "FINALIZE" } },
}).createMachine({
  id: "theScroll",
  initial: "settle",
  states: {
    settle:    { on: { ADVANCE: "scroll" } },
    scroll:    { on: { ADVANCE: "reveal" } },
    reveal:    { on: { ADVANCE: "reflect" } },
    reflect:   { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done:      { type: "final" },
  },
});

// Curated content with deliberate variety: bait, mirror, calm, provocation.
type Card = { kind: "quote" | "mirror" | "bait" | "ask" | "still"; text: string; meta?: string };
const POOL: Card[] = [
  { kind: "bait",    text: "5 things successful people do at 5am",                          meta: "trending" },
  { kind: "mirror",  text: "you opened this app to escape something. notice what." },
  { kind: "quote",   text: "the silence between thoughts is also you.",                     meta: "—rumi (?)" },
  { kind: "ask",     text: "what would you do if no one was watching?" },
  { kind: "still",   text: "this card has nothing for you. keep moving." },
  { kind: "bait",    text: "you've been doing meditation wrong this whole time",            meta: "27k likes" },
  { kind: "mirror",  text: "your thumb is moving faster than your breath." },
  { kind: "quote",   text: "you don't have to keep up.",                                    meta: "—anonymous" },
  { kind: "ask",     text: "when did you last let yourself be bored?" },
  { kind: "bait",    text: "the morning routine of a billionaire who quit social media",   meta: "must read" },
  { kind: "still",   text: "·" },
  { kind: "mirror",  text: "the urge to refresh is the loop showing itself." },
  { kind: "quote",   text: "the river doesn't rush. it just keeps moving." },
  { kind: "ask",     text: "what are you avoiding by being here?" },
  { kind: "bait",    text: "12 productivity hacks that actually changed my life",           meta: "viral" },
  { kind: "mirror",  text: "you've already arrived. you just keep leaving." },
  { kind: "still",   text: "blank space, intentional." },
  { kind: "quote",   text: "stop performing. start being." },
  { kind: "bait",    text: "neuroscientist reveals the one app that is rotting your brain" },
  { kind: "ask",     text: "what would change if you stopped now?" },
  { kind: "mirror",  text: "the scroll knows you better than you know the scroll." },
  { kind: "quote",   text: "you are not behind." },
  { kind: "still",   text: "·   ·   ·" },
  { kind: "bait",    text: "this one trick made me a better partner overnight" },
  { kind: "mirror",  text: "notice the small relief when each card disappears." },
  { kind: "ask",     text: "if you closed the phone right now, what would you do?" },
  { kind: "quote",   text: "scroll less. live more." },
  { kind: "bait",    text: "warning: this thread will challenge everything you believe" },
  { kind: "mirror",  text: "your fingertip has been your most loyal friend today." },
  { kind: "still",   text: "you can stop here." },
];

function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase | "done";
  const [cards] = useState<Card[]>(() => shuffle(POOL).concat(shuffle(POOL)).slice(0, 40));
  const [reflection, setReflection] = useState("");
  const [reflectionListening, setReflectionListening] = useState(false);
  const [pullPulse, setPullPulse] = useState(0);
  const [velocity, setVelocity] = useState(0); // 0..1 normalized

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const phaseStartRef = useRef<number>(Date.now());
  const sessionStartRef = useRef<number>(Date.now());
  const endedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Biometrics
  const lastScrollRef = useRef({ y: 0, t: Date.now() });
  const velSamplesRef = useRef<number[]>([]);
  const peakVelRef = useRef(0);
  const refreshAttemptsRef = useRef(0);
  const dwellMapRef = useRef<Map<number, number>>(new Map()); // index → ms visible
  const lastVisibleRef = useRef<{ idx: number; t: number } | null>(null);
  const burstsRef = useRef(0);
  const stillStretchRef = useRef(0);
  const lastMicSamplesRef = useRef<number[]>([]);
  const totalScrollPxRef = useRef(0);

  // Soft ambient bed
  useEffect(() => { sd.bed("temple", 0.14); return () => sd.stopBed(); /* eslint-disable-next-line */ }, []);

  // Phase auto-advance based on duration; reset phaseStart on transition
  useEffect(() => {
    phaseStartRef.current = Date.now();
    if (phase === "done") { finish(); return; }
    const dur = PHASE_MS[phase as Phase];
    const t = setTimeout(() => {
      if (endedRef.current) return;
      if (phase === "integrate") send({ type: "FINALIZE" });
      else send({ type: "ADVANCE" });
    }, dur);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Phase entry narration
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.14);
        await say("a feed. like any other.", "guru");
        if (cancelled) return;
        await say("we won't tell you what to do. just scroll.", "guru");
      } else if (phase === "scroll") {
        sd.chime("rise", 0.12);
      } else if (phase === "reveal") {
        sd.chime("drop", 0.14);
        const v = peakVelRef.current;
        const r = refreshAttemptsRef.current;
        if (r >= 2) await say("you reached for refresh more than once. the body wanted more.", "guru");
        else if (v > 0.7) await say("the thumb moved fast. the breath stayed quiet.", "guru");
        else if (burstsRef.current >= 2) await say("you paused. then surged. that's the loop.", "guru");
        else await say("you scrolled gently. notice how rare that is.", "guru");
      } else if (phase === "reflect") {
        sd.chime("drop", 0.16);
        await say("what did you actually want from this?", "guru");
        if (cancelled) return;
        try { await transcribe.start(); setReflectionListening(true); } catch {}
      } else if (phase === "integrate") {
        if (reflectionListening) {
          setReflectionListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setReflection(r.transcript.trim().slice(0, 240));
        }
        sd.chime("drop", 0.16);
        stopVoice();
        await say("the feed will always be here. so will you.", "guru");
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Scroll listener
  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    const onScroll = () => {
      const now = Date.now();
      const dy = el.scrollTop - lastScrollRef.current.y;
      const dt = Math.max(1, now - lastScrollRef.current.t);
      const v = Math.abs(dy) / dt; // px/ms
      const norm = Math.min(1, v / 3);
      velSamplesRef.current.push(v);
      if (velSamplesRef.current.length > 200) velSamplesRef.current.shift();
      peakVelRef.current = Math.max(peakVelRef.current, norm);
      totalScrollPxRef.current += Math.abs(dy);
      setVelocity(norm);

      // Pull-to-refresh attempt: was scrolled, now near top
      if (lastScrollRef.current.y > 200 && el.scrollTop < 8) {
        refreshAttemptsRef.current += 1;
        setPullPulse(p => p + 1);
        buzz("inhale");
        sd.chime("rise", 0.18);
      }

      // Burst detection: still then sudden
      if (stillStretchRef.current > 1500 && norm > 0.4) {
        burstsRef.current += 1;
      }
      stillStretchRef.current = norm < 0.05 ? stillStretchRef.current + dt : 0;

      lastScrollRef.current = { y: el.scrollTop, t: now };
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Velocity decay when idle
  useEffect(() => {
    const id = setInterval(() => setVelocity(v => v * 0.85), 120);
    return () => clearInterval(id);
  }, []);

  // Sample mic envelope to get stress baseline
  useEffect(() => {
    if (phase !== "scroll") return;
    lastMicSamplesRef.current.push(breath.envelope);
    if (lastMicSamplesRef.current.length > 600) lastMicSamplesRef.current.shift();
  }, [breath.envelope, phase]);

  // IntersectionObserver for dwell tracking
  useEffect(() => {
    if (phase !== "scroll") return;
    const root = scrollRef.current; if (!root) return;
    const flush = () => {
      if (lastVisibleRef.current) {
        const dur = Date.now() - lastVisibleRef.current.t;
        const prev = dwellMapRef.current.get(lastVisibleRef.current.idx) || 0;
        dwellMapRef.current.set(lastVisibleRef.current.idx, prev + dur);
        lastVisibleRef.current = null;
      }
    };
    const obs = new IntersectionObserver((entries) => {
      // Find most-centered visible card
      let best: { idx: number; ratio: number } | null = null;
      entries.forEach(e => {
        const idx = Number((e.target as HTMLElement).dataset.idx);
        if (e.isIntersecting && (!best || e.intersectionRatio > best.ratio)) {
          best = { idx, ratio: e.intersectionRatio };
        }
      });
      if (best && (!lastVisibleRef.current || lastVisibleRef.current.idx !== best.idx)) {
        flush();
        lastVisibleRef.current = { idx: best.idx, t: Date.now() };
      }
    }, { root, threshold: [0, 0.4, 0.8] });
    root.querySelectorAll<HTMLElement>("[data-idx]").forEach(el => obs.observe(el));
    return () => { flush(); obs.disconnect(); };
  }, [phase]);

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    // Top dwell card
    let topIdx = -1, topMs = 0;
    dwellMapRef.current.forEach((ms, idx) => { if (ms > topMs) { topMs = ms; topIdx = idx; } });
    const topCard = topIdx >= 0 ? cards[topIdx] : null;
    const avgMicEnv = lastMicSamplesRef.current.length
      ? lastMicSamplesRef.current.reduce((a, b) => a + b, 0) / lastMicSamplesRef.current.length
      : null;
    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        spoken_reflection: reflection || null,
        peak_scroll_velocity: peakVelRef.current,
        refresh_attempts: refreshAttemptsRef.current,
        burst_events: burstsRef.current,
        total_scroll_px: Math.round(totalScrollPxRef.current),
        cards_seen: dwellMapRef.current.size,
        top_dwell_card: topCard ? { kind: topCard.kind, text: topCard.text, dwell_ms: topMs } : null,
        avg_mic_envelope: avgMicEnv != null ? +avgMicEnv.toFixed(3) : null,
        mic_ready: breath.ready,
      },
    });
  };

  const finalizeReflection = async () => {
    if (!reflectionListening) return;
    setReflectionListening(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) setReflection(r.transcript.trim().slice(0, 240));
    if (phase === "reflect") send({ type: "ADVANCE" });
  };

  const elapsedScroll = phase === "scroll" ? Date.now() - phaseStartRef.current : 0;
  const scrollProgress = Math.min(1, elapsedScroll / PHASE_MS.scroll);

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Ambient field */}
      <TheScrollFieldCanvas velocity={velocity} envelope={breath.envelope} pullPulse={pullPulse} />

      {/* Top-left: phase pill */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <motion.div key={phase} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 0.85, x: 0 }} transition={{ duration: 0.6 }} className="text-[10px] uppercase tracking-[0.4em] text-amber-200/70">
          {phase === "settle" && "settling"}
          {phase === "scroll" && "scroll"}
          {phase === "reveal" && "what we saw"}
          {phase === "reflect" && "speak"}
          {phase === "integrate" && "rest"}
        </motion.div>
      </div>

      {/* Top-right signals */}
      <div className="absolute top-6 right-6 z-30 text-right space-y-1.5 pointer-events-none">
        <div className="flex items-center justify-end gap-1.5">
          {breath.ready ? <Mic className="w-3 h-3 text-amber-200/70" /> : <MicOff className="w-3 h-3 text-white/30" />}
          <span className="text-[10px] uppercase tracking-widest text-white/50">{breath.ready ? "mic" : "no mic"}</span>
        </div>
        {phase === "scroll" && (
          <p className="text-[10px] uppercase tracking-widest text-white/40">{Math.round((1 - scrollProgress) * 75)}s</p>
        )}
        {(phase === "scroll" || phase === "reveal") && refreshAttemptsRef.current > 0 && (
          <div className="flex items-center justify-end gap-1.5">
            <RefreshCw className="w-3 h-3 text-rose-300/70" />
            <span className="text-[10px] uppercase tracking-widest text-rose-200/70">{refreshAttemptsRef.current}</span>
          </div>
        )}
      </div>

      {/* Phase content */}
      <AnimatePresence mode="wait">
        {phase === "settle" && (
          <motion.div key="settle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none px-8 text-center">
            <p className="text-base font-light text-white/80">the scroll</p>
            <p className="mt-3 text-xs text-white/50 max-w-xs">a feed. like any other.</p>
          </motion.div>
        )}

        {phase === "scroll" && (
          <motion.div key="scroll" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0 z-20">
            <div ref={scrollRef} className="absolute inset-0 overflow-y-auto overscroll-contain">
              <div className="max-w-md mx-auto py-16 px-4 space-y-3">
                {cards.map((c, i) => (
                  <motion.div
                    key={i}
                    data-idx={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.6), duration: 0.6 }}
                    className={`p-5 rounded-2xl border backdrop-blur-sm ${
                      c.kind === "bait" ? "bg-rose-500/8 border-rose-300/15" :
                      c.kind === "mirror" ? "bg-amber-500/8 border-amber-300/20" :
                      c.kind === "ask" ? "bg-violet-500/8 border-violet-300/15" :
                      c.kind === "still" ? "bg-white/2 border-white/5" :
                      "bg-white/5 border-white/10"
                    }`}
                  >
                    <p className={`text-sm leading-relaxed ${
                      c.kind === "still" ? "text-white/30 text-center text-xs" :
                      c.kind === "mirror" ? "text-amber-100/85 italic" :
                      c.kind === "ask" ? "text-violet-100/85" :
                      "text-white/80"
                    }`}>
                      {c.text}
                    </p>
                    {c.meta && (
                      <p className="mt-2 text-[10px] uppercase tracking-widest text-white/30">{c.meta}</p>
                    )}
                  </motion.div>
                ))}
                <div className="h-32" />
              </div>
            </div>
            {/* Subtle progress bar at top */}
            <div className="absolute top-0 left-0 right-0 h-px bg-white/5">
              <motion.div className="h-full bg-amber-300/40" style={{ width: `${scrollProgress * 100}%` }} />
            </div>
          </motion.div>
        )}

        {phase === "reveal" && (
          <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none">
            <p className="text-[10px] uppercase tracking-[0.4em] text-amber-200/70 mb-6">what we saw</p>
            <div className="space-y-3 max-w-sm">
              <div className="flex justify-between text-xs text-white/70"><span>peak velocity</span><span className="text-amber-200">{(peakVelRef.current * 100).toFixed(0)}%</span></div>
              <div className="flex justify-between text-xs text-white/70"><span>refresh pulls</span><span className="text-rose-200">{refreshAttemptsRef.current}</span></div>
              <div className="flex justify-between text-xs text-white/70"><span>still→burst events</span><span className="text-violet-200">{burstsRef.current}</span></div>
              <div className="flex justify-between text-xs text-white/70"><span>cards engaged</span><span className="text-white/80">{dwellMapRef.current.size}</span></div>
            </div>
          </motion.div>
        )}

        {phase === "reflect" && (
          <motion.div key="reflect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center">
            <p className="text-base font-light text-white/85 mb-6">what did you want?</p>
            {reflection ? (
              <p className="text-base text-amber-100/90 italic max-w-md">"{reflection}"</p>
            ) : reflectionListening ? (
              <button onClick={finalizeReflection} className="px-5 py-2 rounded-full border border-amber-200/40 text-amber-100 text-sm bg-amber-500/10 backdrop-blur-sm animate-pulse">
                ● listening — tap when done
              </button>
            ) : (
              <p className="text-xs text-white/40">preparing…</p>
            )}
          </motion.div>
        )}

        {phase === "integrate" && (
          <motion.div key="integrate" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 1.6 }} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none">
            <p className="text-sm font-light text-white/65 tracking-[0.3em] uppercase">rest</p>
            {reflection && <p className="mt-4 text-xs italic text-white/45 max-w-sm">"{reflection}"</p>}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-40 text-[10px] uppercase tracking-widest text-white/30 hover:text-white/70 transition"
      >
        end · save
      </button>
    </div>
  );
}

export default function TheScroll() {
  const g = getLabGame("the-scroll")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}
