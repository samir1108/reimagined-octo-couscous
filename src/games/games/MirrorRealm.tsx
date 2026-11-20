// MIRROR REALM v2 — flagship #21, Pratyabhijñā recognition.
//
// XState v5 phase machine, mirrors the #15/#16/#18/#19/#20 pipeline.
// Two charged stimuli (praise → shadow) read pre-conscious nervous reactivity
// via typing biometrics + microphone envelope variance, then a calibration
// reveal and spoken reflection.
//
// Senses used:
//   - Microphone envelope variance per stimulus (somatic charge)
//   - Typing biometrics (interkey latency, deletions, longest pause)
//   - TTS (guru speaks each line)
//   - STT (final spoken reflection)
//   - Sound design (void bed)
//   - Haptics (commit / reveal)
//
// Phases (XState):
//   1. settle  (TTS frames the mirror)
//   2. praise  (TTS praise → user types reaction)
//   3. insult  (TTS shadow → user types reaction)
//   4. reveal  (TTS calibration read-back)
//   5. voice   (STT — truer response)
//   6. integrate (rest)

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { setup, assign } from "xstate";
import { useMachine } from "@xstate/react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useBreathMic } from "../shell/useBreathMic";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import MirrorRealmCanvas from "./MirrorRealmCanvas";
import CinematicOverlay from "../shell/CinematicOverlay";

const MIN_CHARS = 12;
const WRITE_LIMIT_MS = 90_000;

const PRAISE_LINES = [
  "your work moves people in ways you don't yet see.",
  "you carry a depth that's rare. people notice, even when they don't say it.",
  "what you're building matters. quietly, but it matters.",
];
const SHADOW_LINES = [
  "and yet — you keep performing the version of yourself you think they want.",
  "but parts of this are a costume. the question is which parts.",
  "and the people closest to you have felt the gap between what you say and what you do.",
];

type Ctx = { praiseDone: boolean; insultDone: boolean };

const machine = setup({
  types: {} as {
    context: Ctx;
    events:
      | { type: "ADVANCE" }
      | { type: "COMMIT_PRAISE" }
      | { type: "COMMIT_INSULT" }
      | { type: "FINALIZE" };
  },
  actions: {
    markPraise: assign({ praiseDone: () => true }),
    markInsult: assign({ insultDone: () => true }),
  },
}).createMachine({
  id: "mirrorRealm",
  initial: "settle",
  context: { praiseDone: false, insultDone: false },
  states: {
    settle:    { on: { ADVANCE: "praise" } },
    praise:    { on: { COMMIT_PRAISE: { target: "insult", actions: "markPraise" } } },
    insult:    { on: { COMMIT_INSULT: { target: "reveal", actions: "markInsult" } } },
    reveal:    { on: { ADVANCE: "voice" } },
    voice:     { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done:      { type: "final" },
  },
});

interface KeyStats {
  startMs: number;
  endMs: number;
  chars: number;
  deletions: number;
  longestPauseMs: number;
  avgInterKeyMs: number;
  envMean: number;
  envVar: number;
}

function emptyStats(): KeyStats {
  return { startMs: 0, endMs: 0, chars: 0, deletions: 0, longestPauseMs: 0, avgInterKeyMs: 0, envMean: 0, envVar: 0 };
}

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as
    | "settle" | "praise" | "insult" | "reveal" | "voice" | "integrate" | "done";

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [praiseLine] = useState(() => PRAISE_LINES[Math.floor(Math.random() * PRAISE_LINES.length)]);
  const [shadowLine] = useState(() => SHADOW_LINES[Math.floor(Math.random() * SHADOW_LINES.length)]);

  const [praiseText, setPraiseText] = useState("");
  const [shadowText, setShadowText] = useState("");
  const [reflection, setReflection] = useState("");
  const [revealLine, setRevealLine] = useState("");
  const [listening, setListening] = useState(false);
  const [canType, setCanType] = useState(false);
  const [intensity, setIntensity] = useState(0);
  const [writeRemaining, setWriteRemaining] = useState(WRITE_LIMIT_MS);

  const sessionStartRef = useRef<number>(Date.now());
  const writeStartRef = useRef<number>(0);
  const lastKeyRef = useRef<number | null>(null);
  const intervalsRef = useRef<number[]>([]);
  const deletionsRef = useRef(0);
  const longestPauseRef = useRef(0);
  const envBufferRef = useRef<number[]>([]);
  const praiseStatsRef = useRef<KeyStats>(emptyStats());
  const shadowStatsRef = useRef<KeyStats>(emptyStats());
  const decayRef = useRef<number | null>(null);
  const endedRef = useRef(false);

  // Ambient bed
  useEffect(() => {
    sd.bed("void", 0.22);
    return () => { sd.stopBed(); stopVoice(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Smooth typing intensity decay
  useEffect(() => {
    const tick = () => {
      setIntensity((v) => Math.max(0, v - 0.018));
      decayRef.current = requestAnimationFrame(tick);
    };
    decayRef.current = requestAnimationFrame(tick);
    return () => { if (decayRef.current) cancelAnimationFrame(decayRef.current); };
  }, []);

  // Sample mic envelope while in a charged write phase
  useEffect(() => {
    if (phase !== "praise" && phase !== "insult") return;
    envBufferRef.current.push(breath.envelope);
    if (envBufferRef.current.length > 4000) envBufferRef.current.shift();
  }, [breath.envelope, phase]);

  // Drive each phase
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.12);
        await say("step closer to the mirror. let it find you.", "guru");
        if (cancelled) return;
        setTimeout(() => { if (!cancelled) send({ type: "ADVANCE" }); }, 800);
      } else if (phase === "praise") {
        sd.chime("rise", 0.1);
        await say(praiseLine, "guru");
        if (cancelled) return;
        beginWrite();
      } else if (phase === "insult") {
        sd.chime("drop", 0.1);
        await say(shadowLine, "guru");
        if (cancelled) return;
        beginWrite();
      } else if (phase === "reveal") {
        sd.chime("drop", 0.14);
        const line = buildRevealLine();
        await say(line, "guru");
      } else if (phase === "voice") {
        sd.chime("drop", 0.1);
        await say("now say what was truer than the typing.", "guru");
        if (cancelled) return;
        try { await transcribe.start(); setListening(true); } catch {}
      } else if (phase === "integrate") {
        if (listening) {
          setListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setReflection(r.transcript.trim().slice(0, 240));
        }
        sd.chime("drop", 0.16);
        stopVoice();
        await say("the mirror only shows what was already there. notice, then return.", "guru");
      } else if (phase === "done") {
        finish();
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const beginWrite = () => {
    writeStartRef.current = Date.now();
    intervalsRef.current = [];
    envBufferRef.current = [];
    lastKeyRef.current = null;
    deletionsRef.current = 0;
    longestPauseRef.current = 0;
    setCanType(true);
    setWriteRemaining(WRITE_LIMIT_MS);
  };

  // Auto-cap write phases
  useEffect(() => {
    if (phase !== "praise" && phase !== "insult") return;
    const i = setInterval(() => {
      const elapsed = Date.now() - writeStartRef.current;
      const left = Math.max(0, WRITE_LIMIT_MS - elapsed);
      setWriteRemaining(left);
      if (left <= 0) commitCurrent();
    }, 250);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Auto-advance reveal → voice
  useEffect(() => {
    if (phase !== "reveal") return;
    const t = setTimeout(() => send({ type: "ADVANCE" }), 11_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Auto-cap voice phase at 14s
  useEffect(() => {
    if (phase !== "voice") return;
    const t = setTimeout(() => send({ type: "ADVANCE" }), 14_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Integrate → done
  useEffect(() => {
    if (phase !== "integrate") return;
    const t = setTimeout(() => send({ type: "FINALIZE" }), 7_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const captureStats = (text: string): KeyStats => {
    const intervals = intervalsRef.current;
    const avg = intervals.length ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;
    const env = envBufferRef.current;
    const meanEnv = env.length ? env.reduce((a, b) => a + b, 0) / env.length : 0;
    const varEnv = env.length
      ? env.reduce((a, b) => a + (b - meanEnv) ** 2, 0) / env.length
      : 0;
    return {
      startMs: writeStartRef.current,
      endMs: Date.now(),
      chars: text.length,
      deletions: deletionsRef.current,
      avgInterKeyMs: +avg.toFixed(1),
      longestPauseMs: +longestPauseRef.current.toFixed(0),
      envMean: +meanEnv.toFixed(4),
      envVar: +varEnv.toFixed(5),
    };
  };

  const commitCurrent = () => {
    if (phase === "praise") {
      praiseStatsRef.current = captureStats(praiseText);
      setCanType(false);
      buzz("tap");
      send({ type: "COMMIT_PRAISE" });
    } else if (phase === "insult") {
      shadowStatsRef.current = captureStats(shadowText);
      setCanType(false);
      buzz("tap");
      send({ type: "COMMIT_INSULT" });
    }
  };

  const onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const now = performance.now();
    const v = e.target.value;
    const cur = phase === "praise" ? praiseText : shadowText;
    if (v.length < cur.length) {
      deletionsRef.current += cur.length - v.length;
    }
    if (lastKeyRef.current !== null) {
      const dt = now - lastKeyRef.current;
      intervalsRef.current.push(dt);
      if (dt > longestPauseRef.current) longestPauseRef.current = dt;
    }
    lastKeyRef.current = now;
    setIntensity((i) => Math.min(1, i + 0.18));
    if (phase === "praise") setPraiseText(v);
    else if (phase === "insult") setShadowText(v);
  };

  const buildRevealLine = (): string => {
    const p = praiseStatsRef.current;
    const s = shadowStatsRef.current;
    const dCharge = s.envVar - p.envVar;
    const dPause = s.longestPauseMs - p.longestPauseMs;
    const dSpeed = s.avgInterKeyMs - p.avgInterKeyMs;
    const dDel = s.deletions - p.deletions;
    let line: string;
    if (p.chars < MIN_CHARS && s.chars < MIN_CHARS) {
      line = "barely a word for either. the mirror finds the silence telling.";
    } else if (dCharge > 0.02 && dPause > 1200) {
      line = "the shadow line moved your body more than the praise. that is where to look.";
    } else if (dCharge < -0.02) {
      line = "the praise lit you up more than the shadow stung. notice that hunger.";
    } else if (dDel > 4 && dSpeed > 60) {
      line = "you erased and slowed under the shadow. it landed somewhere you defend.";
    } else if (Math.abs(dCharge) < 0.005 && Math.abs(dPause) < 400) {
      line = "you met both the same way. either steady — or numb. only you know which.";
    } else {
      line = "two faces of the same mirror. notice which one you wanted to be true.";
    }
    setRevealLine(line);
    return line;
  };

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    const p = praiseStatsRef.current;
    const s = shadowStatsRef.current;
    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        praise_chars: p.chars,
        praise_deletions: p.deletions,
        praise_avg_interkey_ms: p.avgInterKeyMs,
        praise_longest_pause_ms: p.longestPauseMs,
        praise_env_var: p.envVar,
        shadow_chars: s.chars,
        shadow_deletions: s.deletions,
        shadow_avg_interkey_ms: s.avgInterKeyMs,
        shadow_longest_pause_ms: s.longestPauseMs,
        shadow_env_var: s.envVar,
        somatic_asymmetry: +(s.envVar - p.envVar).toFixed(5),
        ego_pull_index: +(
          (s.deletions - p.deletions) * 0.4 +
          (s.longestPauseMs - p.longestPauseMs) * 0.0008 +
          (s.envVar - p.envVar) * 30
        ).toFixed(3),
        reveal_line: revealLine,
        spoken_reflection: reflection || null,
        mic_ready: breath.ready,
        // text intentionally NOT persisted
      },
    });
  };

  const fmtRemaining = (ms: number) => {
    const s = Math.ceil(ms / 1000);
    return `0:${s.toString().padStart(2, "0")}`;
  };

  const canvasPhase: "praise" | "insult" | "done" =
    phase === "praise" ? "praise"
    : phase === "insult" ? "insult"
    : phase === "reveal" || phase === "voice" || phase === "integrate" || phase === "done" ? "done"
    : "praise";

  const fracture =
    phase === "insult" ? Math.min(1, shadowText.length / 80 + 0.2) :
    phase === "reveal" || phase === "voice" || phase === "integrate" ? 0.45 : 0;

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <MirrorRealmCanvas phase={canvasPhase} intensity={intensity} fracture={fracture} />
      <CinematicOverlay tint="amber" />

      {/* Top-left phase pill */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <motion.div
          key={String(phase)}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 0.85, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-amber-200/70"
        >
          <span className="w-1 h-1 rounded-full bg-amber-200/80 animate-pulse" />
          {phase === "settle" && "mirror realm"}
          {phase === "praise" && "praise"}
          {phase === "insult" && "shadow"}
          {phase === "reveal" && "calibration"}
          {phase === "voice" && "speak truer"}
          {phase === "integrate" && "rest"}
        </motion.div>
      </div>

      {/* Top-right mic */}
      <div className="absolute top-6 right-6 z-30 text-right space-y-1.5 pointer-events-none">
        <div className="flex items-center justify-end gap-1.5">
          {breath.ready ? <Mic className="w-3 h-3 text-amber-200/70" /> : <MicOff className="w-3 h-3 text-white/30" />}
          <span className="text-[10px] uppercase tracking-widest text-white/50">{breath.ready ? "mic" : "no mic"}</span>
        </div>
        {(phase === "praise" || phase === "insult") && (
          <p className="text-[10px] uppercase tracking-widest text-amber-200/60">{fmtRemaining(writeRemaining)}</p>
        )}
      </div>

      <AnimatePresence mode="wait">
        {phase === "settle" && (
          <motion.div
            key="settle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none px-8 text-center"
          >
            <p className="text-4xl sm:text-5xl italic text-amber-50/90" style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.02em", textShadow: "0 0 40px rgba(255,220,180,0.35)" }}>mirror realm</p>
            <p className="mt-6 text-sm text-white/55 max-w-xs leading-relaxed tracking-wide">two lines. praise, then shadow. notice what your body does before your mind does.</p>
          </motion.div>
        )}

        {(phase === "praise" || phase === "insult") && (
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 flex flex-col items-center justify-end z-20 px-6 pb-10 max-w-xl mx-auto gap-4"
          >
            <p className="text-2xl sm:text-3xl italic text-amber-50/90 text-center max-w-md leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              "{phase === "praise" ? praiseLine : shadowLine}"
            </p>
            <textarea
              autoFocus
              disabled={!canType}
              value={phase === "praise" ? praiseText : shadowText}
              onChange={onTextChange}
              placeholder="how does this land in you?"
              className="w-full h-32 sm:h-36 bg-black/45 border border-amber-200/20 rounded-2xl p-4 text-amber-50/90 text-sm leading-relaxed focus:outline-none focus:border-amber-200/50 resize-none placeholder:text-amber-200/30 backdrop-blur-sm disabled:opacity-50"
              style={{ boxShadow: "inset 0 0 40px rgba(0,0,0,0.4), 0 0 30px rgba(255,220,180,0.05)" }}
            />
            <div className="flex items-center gap-3">
              <motion.button
                onClick={commitCurrent}
                disabled={(phase === "praise" ? praiseText.length : shadowText.length) < MIN_CHARS}
                whileTap={{ scale: 0.96 }}
                className={`px-6 py-2.5 rounded-full text-[11px] uppercase tracking-[0.3em] border transition ${
                  (phase === "praise" ? praiseText.length : shadowText.length) < MIN_CHARS
                    ? "border-white/10 text-white/30"
                    : "border-amber-200/40 text-amber-100 bg-amber-500/10 hover:bg-amber-500/20"
                }`}
                style={(phase === "praise" ? praiseText.length : shadowText.length) >= MIN_CHARS ? { boxShadow: "0 0 30px rgba(251,191,36,0.18)" } : undefined}
              >
                {phase === "praise" ? "next · shadow" : "release"}
              </motion.button>
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                {(phase === "praise" ? praiseText.length : shadowText.length) < MIN_CHARS
                  ? `${MIN_CHARS - (phase === "praise" ? praiseText.length : shadowText.length)} more`
                  : "ready"}
              </span>
            </div>
            <p className="text-[10px] text-amber-200/40 max-w-sm text-center">
              the words are not saved — only how you wrote them.
            </p>
          </motion.div>
        )}

        {phase === "reveal" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none"
          >
            <p className="text-[10px] uppercase tracking-[0.42em] text-amber-200/70 mb-6">calibration</p>
            <p className="text-2xl sm:text-3xl italic text-amber-50/95 leading-relaxed max-w-md" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              "{revealLine || "…"}"
            </p>
          </motion.div>
        )}

        {phase === "voice" && (
          <motion.div
            key="voice"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center max-w-md mx-auto gap-6"
          >
            <p className="text-2xl sm:text-3xl italic text-amber-50/90 leading-relaxed max-w-sm" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              say what was truer than the typing.
            </p>
            {listening ? (
              <button
                onClick={() => send({ type: "ADVANCE" })}
                className="px-6 py-2.5 rounded-full border border-amber-200/40 text-amber-100 text-[11px] uppercase tracking-[0.3em] bg-amber-500/10 backdrop-blur-sm animate-pulse"
                style={{ boxShadow: "0 0 30px rgba(251,191,36,0.2)" }}
              >
                ● listening · tap when done
              </button>
            ) : (
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">preparing…</p>
            )}
          </motion.div>
        )}

        {phase === "integrate" && (
          <motion.div
            key="integrate"
            initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.6 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none"
          >
            <p className="text-[10px] uppercase tracking-[0.42em] text-amber-200/60">rest</p>
            {reflection && <p className="mt-5 text-lg italic text-amber-100/60 max-w-sm leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>"{reflection}"</p>}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-40 text-[10px] uppercase tracking-[0.3em] text-white/25 hover:text-amber-200/70 transition"
      >
        end · save
      </button>
    </div>
  );
}

export default function MirrorRealm() {
  const g = getLabGame("mirror-realm")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}
