// THE GRIEVING ROOM v2 — flagship #24, ars moriendi / Tibetan bardo.
//
// XState v5 phase machine, mirrors the #15–#23 pipeline.
// "Someone you love just died." There is nothing to do. Staying is the practice.
// We track:
//   - stayed_ms (raw dwell)
//   - urge_taps (tiny "leave" pulls during the wave)
//   - mic envelope variance (sob spikes / vocalised grief)
//   - mic envelope mean (ambient stillness)
//   - 3 grief waves (each with its own envelope window)
//   - one whispered line via STT — "what would you say to them"
//
// Senses used:
//   - Microphone envelope (somatic grief signal)
//   - TTS (guru frames + calibration line)
//   - STT (final whispered words)
//   - Sound design (room bed)
//   - Haptics (only on commit / leave — no celebration)
//
// Phases (XState):
//   1. settle    (TTS opens softly)
//   2. arrival   (the line lands; user just is)
//   3. wave      (loops 3 grief waves with brief frames)
//   4. reveal    (TTS reads back what the body did)
//   5. words     (STT — say what you would have said)
//   6. integrate (closing line, then end)

import { useEffect, useRef, useState } from "react";
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
import GrievingRoomCanvas from "./GrievingRoomCanvas";
import CinematicOverlay from "../shell/CinematicOverlay";

const SERIF: React.CSSProperties = { fontFamily: '"Cormorant Garamond", Georgia, serif' };

const WAVES = [
  { frame: "the first wave. the fact arrives.", min: 12_000, max: 35_000 },
  { frame: "the second wave. the small things — their voice, a cup.", min: 12_000, max: 35_000 },
  { frame: "the third wave. the rest of your life without them.", min: 12_000, max: 40_000 },
];

interface WaveData {
  ms: number;
  env: number[];
  urgeTaps: number;
}

const emptyWave = (): WaveData => ({ ms: 0, env: [], urgeTaps: 0 });

type Ctx = { idx: number };

const machine = setup({
  types: {} as {
    context: Ctx;
    events:
      | { type: "ADVANCE" }
      | { type: "COMMIT_WAVE" }
      | { type: "FINALIZE" };
  },
  actions: {
    nextIdx: assign({ idx: ({ context }) => context.idx + 1 }),
  },
  guards: {
    moreWaves: ({ context }) => context.idx + 1 < WAVES.length,
  },
}).createMachine({
  id: "grievingRoom",
  initial: "settle",
  context: { idx: 0 },
  states: {
    settle:   { on: { ADVANCE: "arrival" } },
    arrival:  { on: { ADVANCE: "wave" } },
    wave: {
      on: {
        COMMIT_WAVE: [
          { target: "wave", guard: "moreWaves", actions: "nextIdx", reenter: true },
          { target: "reveal" },
        ],
      },
    },
    reveal:    { on: { ADVANCE: "words" } },
    words:     { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done:      { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as "settle" | "arrival" | "wave" | "reveal" | "words" | "integrate" | "done";
  const idx = state.context.idx;

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [revealLine, setRevealLine] = useState("");
  const [whispered, setWhispered] = useState("");
  const [listening, setListening] = useState(false);
  const [waveElapsed, setWaveElapsed] = useState(0);
  const [waveTick, setWaveTick] = useState(0); // for canvas ripple on wave entry

  const waveStartRef = useRef(performance.now());
  const sessionStartRef = useRef(Date.now());
  const dataRef = useRef<WaveData[]>(WAVES.map(() => emptyWave()));
  const phaseRef = useRef(phase);
  const endedRef = useRef(false);

  // Bed
  useEffect(() => {
    sd.bed("temple", 0.08);
    return () => { sd.stopBed(); stopVoice(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Sample mic envelope during waves
  useEffect(() => {
    if (phase !== "wave") return;
    dataRef.current[idx].env.push(breath.envelope);
  }, [breath.envelope, phase, idx]);

  // Wave timer + entry ripple
  useEffect(() => {
    if (phase !== "wave") return;
    waveStartRef.current = performance.now();
    setWaveElapsed(0);
    setWaveTick((t) => t + 1);
    const i = setInterval(() => {
      const e = performance.now() - waveStartRef.current;
      setWaveElapsed(e);
      if (e >= WAVES[idx].max) commitWave();
    }, 250);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx]);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.08);
        await say("breathe once. you are entering a room. there is nothing to do here. only stay.", "guru");
        if (cancelled) return;
        setTimeout(() => { if (!cancelled) send({ type: "ADVANCE" }); }, 900);
      } else if (phase === "arrival") {
        sd.chime("drop", 0.06);
        await say("someone you love just died.", "guru");
        if (cancelled) return;
        // long pause — let the line sit
        setTimeout(() => { if (!cancelled) send({ type: "ADVANCE" }); }, 4500);
      } else if (phase === "wave") {
        sd.chime("drop", 0.05);
        await say(WAVES[idx].frame, "guru");
      } else if (phase === "reveal") {
        sd.chime("drop", 0.1);
        const line = buildRevealLine();
        await say(line, "guru");
      } else if (phase === "words") {
        sd.chime("drop", 0.08);
        await say("if there were one thing left to say to them — say it now. quietly.", "guru");
        if (cancelled) return;
        try { await transcribe.start(); setListening(true); } catch {}
      } else if (phase === "integrate") {
        if (listening) {
          setListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setWhispered(r.transcript.trim().slice(0, 280));
        }
        sd.chime("drop", 0.12);
        stopVoice();
        await say("grief is love with nowhere to go. you held it. that is enough.", "guru");
      } else if (phase === "done") {
        finish();
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Auto-advance reveal → words
  useEffect(() => {
    if (phase !== "reveal") return;
    const t = setTimeout(() => send({ type: "ADVANCE" }), 11_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Cap whispered words at 22s
  useEffect(() => {
    if (phase !== "words") return;
    const t = setTimeout(() => send({ type: "ADVANCE" }), 22_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Integrate → done
  useEffect(() => {
    if (phase !== "integrate") return;
    const t = setTimeout(() => send({ type: "FINALIZE" }), 8_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const commitWave = () => {
    if (phaseRef.current !== "wave") return;
    const dur = performance.now() - waveStartRef.current;
    const w = dataRef.current[idx];
    w.ms = dur;
    if (dur < WAVES[idx].min) return; // must stay
    buzz("tap");
    send({ type: "COMMIT_WAVE" });
  };

  const urgePull = () => {
    if (phaseRef.current !== "wave") return;
    dataRef.current[idx].urgeTaps += 1;
    buzz("tap");
  };

  const buildRevealLine = (): string => {
    const ws = dataRef.current;
    const totalMs = ws.reduce((s, w) => s + w.ms, 0);
    const totalUrge = ws.reduce((s, w) => s + w.urgeTaps, 0);
    const allEnv = ws.flatMap((w) => w.env);
    const meanEnv = allEnv.length ? allEnv.reduce((a, b) => a + b, 0) / allEnv.length : 0;
    const varEnv = allEnv.length
      ? allEnv.reduce((a, b) => a + (b - meanEnv) ** 2, 0) / allEnv.length
      : 0;

    const stayedSec = Math.round(totalMs / 1000);
    let line: string;
    if (totalUrge >= 6) {
      line = `you stayed ${stayedSec} seconds, but the hand kept reaching for the door. that reach is the grief — it does not need to be solved.`;
    } else if (varEnv > 0.012) {
      line = `the body broke the silence on its own — sob, breath, sound. you let it. that is the practice.`;
    } else if (meanEnv < 0.04 && totalUrge <= 1) {
      line = `you barely moved. the room held you. notice — stillness is not absence. it is presence without claim.`;
    } else if (stayedSec < 40) {
      line = `you stayed briefly. the door stays open. grief returns when it is ready, not when you are.`;
    } else {
      line = `you stayed ${stayedSec} seconds with what cannot be fixed. that is the whole teaching.`;
    }
    setRevealLine(line);
    return line;
  };

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();

    const ws = dataRef.current;
    const totalMs = ws.reduce((s, w) => s + w.ms, 0);
    const totalUrge = ws.reduce((s, w) => s + w.urgeTaps, 0);
    const charge = (arr: number[]) => {
      if (!arr.length) return 0;
      const m = arr.reduce((a, b) => a + b, 0) / arr.length;
      return arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length;
    };
    const allEnv = ws.flatMap((w) => w.env);
    const meanEnv = allEnv.length ? allEnv.reduce((a, b) => a + b, 0) / allEnv.length : 0;

    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        stayed_ms: Math.round(totalMs),
        urge_taps: totalUrge,
        env_mean: +meanEnv.toFixed(4),
        env_var: +charge(allEnv).toFixed(5),
        waves: ws.map((w, i) => ({
          frame: WAVES[i].frame,
          ms: Math.round(w.ms),
          urge_taps: w.urgeTaps,
          env_var: +charge(w.env).toFixed(5),
        })),
        reveal_line: revealLine,
        whispered_words: whispered || null,
        mic_ready: breath.ready,
      },
    });
  };

  // Intensity ramps up with stayed time across all phases
  const liveStayed = phase === "wave"
    ? dataRef.current.slice(0, idx).reduce((s, w) => s + w.ms, 0) + (performance.now() - waveStartRef.current)
    : dataRef.current.reduce((s, w) => s + w.ms, 0);
  const intensity = Math.min(1, liveStayed / 90_000);

  const canCommit = phase === "wave" && waveElapsed >= WAVES[idx].min;

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <GrievingRoomCanvas envelope={breath.envelope} wave={waveTick} intensity={intensity} />
      <CinematicOverlay tint="cool" />

      {/* Top-left phase pill */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <motion.div
          key={String(phase) + idx}
          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 0.9, x: 0 }} transition={{ duration: 0.6 }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-blue-100/70"
        >
          <span className="w-1 h-1 rounded-full bg-blue-200/85 animate-pulse" />
          <span>{phase === "settle" && "the grieving room"}
          {phase === "arrival" && "arrival"}
          {phase === "wave" && `wave ${idx + 1} / ${WAVES.length}`}
          {phase === "reveal" && "calibration"}
          {phase === "words" && "last words"}
          {phase === "integrate" && "rest"}</span>
        </motion.div>
      </div>

      {/* Top-right mic */}
      <div className="absolute top-6 right-6 z-30 text-right space-y-1.5 pointer-events-none">
        <div className="flex items-center justify-end gap-1.5">
          {breath.ready ? <Mic className="w-3 h-3 text-blue-200/60" /> : <MicOff className="w-3 h-3 text-white/30" />}
          <span className="text-[10px] uppercase tracking-widest text-white/50">{breath.ready ? "mic" : "no mic"}</span>
        </div>
        {phase === "wave" && (
          <p className="text-[10px] uppercase tracking-widest text-white/40">
            {Math.floor(waveElapsed / 1000)}s
          </p>
        )}
      </div>

      <AnimatePresence mode="wait">
        {phase === "settle" && (
          <motion.div
            key="settle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.6 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none px-8 text-center"
          >
            <p style={SERIF} className="text-3xl italic font-light text-blue-50/90">the grieving room</p>
            <p className="mt-4 text-[11px] uppercase tracking-[0.4em] text-white/45 max-w-xs">there is nothing to do · only stay</p>
          </motion.div>
        )}

        {phase === "arrival" && (
          <motion.div
            key="arrival"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2.4 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none px-8 text-center"
          >
            <p style={SERIF} className="text-2xl sm:text-3xl italic font-light text-blue-50/90 max-w-md leading-relaxed drop-shadow-[0_0_25px_rgba(150,190,230,0.15)]">
              someone you love just died.
            </p>
          </motion.div>
        )}

        {phase === "wave" && (
          <motion.div
            key={`wave-${idx}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 flex flex-col items-center justify-end z-20 px-8 pb-32 text-center"
          >
            <p style={SERIF} className="text-lg sm:text-xl italic font-light text-blue-50/85 leading-relaxed max-w-md">
              {WAVES[idx].frame}
            </p>
            <div className="mt-10 flex flex-col items-center gap-3">
              <button
                onClick={urgePull}
                className="px-4 py-1.5 rounded-full border border-white/10 text-[10px] tracking-[0.3em] uppercase text-white/30 hover:text-white/55 transition"
              >
                i want to leave
              </button>
              <motion.button
                onClick={commitWave}
                disabled={!canCommit}
                whileTap={{ scale: 0.96 }}
                className={`px-5 py-2 rounded-full text-xs tracking-wider border transition ${
                  canCommit
                    ? "border-blue-200/30 text-blue-100/80 bg-blue-500/5 hover:bg-blue-500/15"
                    : "border-white/10 text-white/20"
                }`}
              >
                {idx + 1 >= WAVES.length ? "release · reveal" : "let the next wave come"}
              </motion.button>
              {!canCommit && (
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/25">
                  stay · {Math.max(0, Math.ceil((WAVES[idx].min - waveElapsed) / 1000))}s
                </p>
              )}
            </div>
          </motion.div>
        )}

        {phase === "reveal" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.4 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none"
          >
            <p className="text-[10px] uppercase tracking-[0.42em] text-blue-100/70 mb-6">calibration</p>
            <p style={SERIF} className="text-xl sm:text-2xl font-light text-blue-50/95 italic leading-relaxed max-w-md">
              "{revealLine || "…"}"
            </p>
          </motion.div>
        )}

        {phase === "words" && (
          <motion.div
            key="words"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.9 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center max-w-md mx-auto gap-6"
          >
            <p style={SERIF} className="text-xl sm:text-2xl italic font-light text-blue-50/95 leading-relaxed max-w-sm">
              if there were one thing left to say — say it now.
            </p>
            {listening ? (
              <button
                onClick={() => send({ type: "ADVANCE" })}
                className="px-6 py-2.5 rounded-full border border-blue-200/40 text-blue-100/95 text-sm bg-blue-500/10 backdrop-blur-sm animate-pulse shadow-[0_0_28px_rgba(150,190,230,0.18)]"
              >
                ● listening — tap when done
              </button>
            ) : (
              <p className="text-xs text-white/40">preparing…</p>
            )}
          </motion.div>
        )}

        {phase === "integrate" && (
          <motion.div
            key="integrate"
            initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.8 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none"
          >
            <p className="text-sm font-light text-white/65 tracking-[0.3em] uppercase">rest</p>
            {whispered && <p className="mt-4 text-xs italic text-white/45 max-w-sm">"{whispered}"</p>}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-40 text-[10px] uppercase tracking-widest text-white/25 hover:text-white/65 transition"
      >
        end · save
      </button>
    </div>
  );
}

export default function GrievingRoom() {
  const g = getLabGame("grieving-room")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}
