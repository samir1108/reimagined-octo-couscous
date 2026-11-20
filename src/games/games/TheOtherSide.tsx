// THE OTHER SIDE v2 — flagship #23, Hegel synthesis + cognitive empathy.
//
// XState v5 phase machine, mirrors the #15–#22 pipeline.
// Three tensions. For each, the user dwells on side A or side B and may flip.
// We track per-side dwell, total flips, mic envelope variance per side
// (somatic charge of holding the opposite view), and finally elicit a
// spoken synthesis via STT. Calibration reveal reads back the asymmetry.
//
// Senses used:
//   - Microphone envelope per side (somatic charge under perspective)
//   - TTS (guru frames each tension + calibration line)
//   - STT (final spoken synthesis)
//   - Sound design (warm temple bed)
//   - Haptics (flip / commit / reveal)
//
// Phases (XState):
//   1. settle   (TTS frames the practice)
//   2. round    (loops over PAIRS — TTS topic, dwell, flip, commit)
//   3. reveal   (TTS reads back lean / charge asymmetry)
//   4. synthesis (STT — name the truth that holds both)
//   5. integrate (rest)

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
import TheOtherSideCanvas from "./TheOtherSideCanvas";
import CinematicOverlay from "../shell/CinematicOverlay";

const SERIF: React.CSSProperties = { fontFamily: '"Cormorant Garamond", Georgia, serif' };

const PAIRS = [
  {
    topic: "effort vs. surrender",
    a: "if i don't push, nothing will change. discipline is freedom.",
    b: "pushing creates more resistance. letting go is the deeper move.",
  },
  {
    topic: "speak vs. stay silent",
    a: "saying it clears the air. silence is cowardice.",
    b: "some truths grow louder unspoken. silence is the cleaner gift.",
  },
  {
    topic: "stay vs. leave",
    a: "roots take time. leaving every time it's hard is a pattern.",
    b: "staying past the signal is its own betrayal of self.",
  },
];

const ROUND_MIN_MS = 8_000;
const ROUND_MAX_MS = 35_000;

interface RoundData {
  topic: string;
  a_ms: number;
  b_ms: number;
  flips: number;
  envA: number[];
  envB: number[];
}

function emptyRound(topic: string): RoundData {
  return { topic, a_ms: 0, b_ms: 0, flips: 0, envA: [], envB: [] };
}

type Ctx = { idx: number };

const machine = setup({
  types: {} as {
    context: Ctx;
    events:
      | { type: "ADVANCE" }
      | { type: "COMMIT_ROUND" }
      | { type: "FINALIZE" };
  },
  actions: {
    nextIdx: assign({ idx: ({ context }) => context.idx + 1 }),
  },
  guards: {
    moreRounds: ({ context }) => context.idx + 1 < PAIRS.length,
  },
}).createMachine({
  id: "theOtherSide",
  initial: "settle",
  context: { idx: 0 },
  states: {
    settle: { on: { ADVANCE: "round" } },
    round: {
      on: {
        COMMIT_ROUND: [
          { target: "round", guard: "moreRounds", actions: "nextIdx", reenter: true },
          { target: "reveal" },
        ],
      },
    },
    reveal:    { on: { ADVANCE: "synthesis" } },
    synthesis: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done:      { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as "settle" | "round" | "reveal" | "synthesis" | "integrate" | "done";
  const idx = state.context.idx;

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [side, setSide] = useState<"a" | "b">("a");
  const [revealLine, setRevealLine] = useState("");
  const [synthesis, setSynthesis] = useState("");
  const [listening, setListening] = useState(false);
  const [roundElapsed, setRoundElapsed] = useState(0);

  const sideStartRef = useRef(performance.now());
  const roundStartRef = useRef(performance.now());
  const sideRef = useRef<"a" | "b">("a");
  const phaseRef = useRef(phase);
  const dataRef = useRef<RoundData[]>(PAIRS.map((p) => emptyRound(p.topic)));
  const sessionStartRef = useRef(Date.now());
  const endedRef = useRef(false);

  // Bed
  useEffect(() => {
    sd.bed("temple", 0.12);
    return () => { sd.stopBed(); stopVoice(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { sideRef.current = side; }, [side]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Sample mic envelope per active side
  useEffect(() => {
    if (phase !== "round") return;
    const r = dataRef.current[idx];
    if (sideRef.current === "a") r.envA.push(breath.envelope);
    else r.envB.push(breath.envelope);
  }, [breath.envelope, phase, idx]);

  // Round timer
  useEffect(() => {
    if (phase !== "round") return;
    roundStartRef.current = performance.now();
    sideStartRef.current = performance.now();
    setSide("a");
    setRoundElapsed(0);
    const i = setInterval(() => {
      const e = performance.now() - roundStartRef.current;
      setRoundElapsed(e);
      if (e >= ROUND_MAX_MS) commitRound();
    }, 250);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx]);

  // Drive each phase
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.12);
        await say("three tensions. sit with each side. notice which one your body wants to live in.", "guru");
        if (cancelled) return;
        setTimeout(() => { if (!cancelled) send({ type: "ADVANCE" }); }, 700);
      } else if (phase === "round") {
        sd.chime("drop", 0.08);
        await say(PAIRS[idx].topic, "guru");
      } else if (phase === "reveal") {
        sd.chime("drop", 0.14);
        const line = buildRevealLine();
        await say(line, "guru");
      } else if (phase === "synthesis") {
        sd.chime("drop", 0.1);
        await say("now name the truth that holds both. one sentence.", "guru");
        if (cancelled) return;
        try { await transcribe.start(); setListening(true); } catch {}
      } else if (phase === "integrate") {
        if (listening) {
          setListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setSynthesis(r.transcript.trim().slice(0, 280));
        }
        sd.chime("drop", 0.16);
        stopVoice();
        await say("the third side is not in either. it is in how you held them both.", "guru");
      } else if (phase === "done") {
        finish();
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Auto-advance reveal → synthesis
  useEffect(() => {
    if (phase !== "reveal") return;
    const t = setTimeout(() => send({ type: "ADVANCE" }), 11_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Auto-cap synthesis at 18s
  useEffect(() => {
    if (phase !== "synthesis") return;
    const t = setTimeout(() => send({ type: "ADVANCE" }), 18_000);
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

  const flipSide = () => {
    if (phase !== "round") return;
    const now = performance.now();
    const dur = now - sideStartRef.current;
    const r = dataRef.current[idx];
    if (sideRef.current === "a") r.a_ms += dur; else r.b_ms += dur;
    r.flips += 1;
    sideStartRef.current = now;
    setSide((s) => (s === "a" ? "b" : "a"));
    buzz("tap");
  };

  const commitRound = () => {
    if (phase !== "round") return;
    const now = performance.now();
    const dur = now - sideStartRef.current;
    const r = dataRef.current[idx];
    if (sideRef.current === "a") r.a_ms += dur; else r.b_ms += dur;
    if ((r.a_ms + r.b_ms) < ROUND_MIN_MS) return; // need to sit a bit
    buzz("tap");
    send({ type: "COMMIT_ROUND" });
  };

  const buildRevealLine = (): string => {
    const rounds = dataRef.current;
    const totA = rounds.reduce((s, r) => s + r.a_ms, 0);
    const totB = rounds.reduce((s, r) => s + r.b_ms, 0);
    const tot = totA + totB || 1;
    const leanA = totA / tot;
    const flips = rounds.reduce((s, r) => s + r.flips, 0);
    const charge = (arr: number[]) => {
      if (!arr.length) return 0;
      const m = arr.reduce((a, b) => a + b, 0) / arr.length;
      return arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length;
    };
    const chargeA = rounds.reduce((s, r) => s + charge(r.envA), 0) / rounds.length;
    const chargeB = rounds.reduce((s, r) => s + charge(r.envB), 0) / rounds.length;
    let line: string;
    if (Math.abs(leanA - 0.5) < 0.1 && flips >= 4) {
      line = "you moved between both sides freely. the body found rest in neither — and that is the practice.";
    } else if (leanA > 0.7) {
      line = "you lived mostly in the first voice. the second side may hold what you defend against.";
    } else if (leanA < 0.3) {
      line = "you stayed in the second voice. the first may carry a hunger you don't trust yet.";
    } else if (chargeB > chargeA * 1.4) {
      line = "the body lit up more on the opposite side. that is where the real work is.";
    } else if (chargeA > chargeB * 1.4) {
      line = "the side that felt obvious shook your body more. obviousness can be its own defense.";
    } else if (flips <= 1) {
      line = "you barely flipped. the mind likes its chosen room — visit the other one tomorrow.";
    } else {
      line = "two voices, both yours. notice which one needed less convincing.";
    }
    setRevealLine(line);
    return line;
  };

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    const rounds = dataRef.current;
    const totA = rounds.reduce((s, r) => s + r.a_ms, 0);
    const totB = rounds.reduce((s, r) => s + r.b_ms, 0);
    const flips = rounds.reduce((s, r) => s + r.flips, 0);
    const charge = (arr: number[]) => {
      if (!arr.length) return 0;
      const m = arr.reduce((a, b) => a + b, 0) / arr.length;
      return arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length;
    };
    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        rounds: rounds.map((r) => ({
          topic: r.topic,
          a_ms: Math.round(r.a_ms),
          b_ms: Math.round(r.b_ms),
          flips: r.flips,
          env_var_a: +charge(r.envA).toFixed(5),
          env_var_b: +charge(r.envB).toFixed(5),
        })),
        total_a_ms: Math.round(totA),
        total_b_ms: Math.round(totB),
        lean_a: +(totA / (totA + totB || 1)).toFixed(3),
        total_flips: flips,
        reveal_line: revealLine,
        spoken_synthesis: synthesis || null,
        mic_ready: breath.ready,
      },
    });
  };

  const r = dataRef.current[idx];
  const liveLeanA = (() => {
    const liveA = r.a_ms + (sideRef.current === "a" ? performance.now() - sideStartRef.current : 0);
    const liveB = r.b_ms + (sideRef.current === "b" ? performance.now() - sideStartRef.current : 0);
    const t = liveA + liveB;
    return t > 0 ? liveA / t : 0.5;
  })();

  const canCommit = phase === "round" && roundElapsed >= ROUND_MIN_MS;
  const fmtRemaining = (ms: number) => {
    const left = Math.max(0, ROUND_MAX_MS - ms);
    const s = Math.ceil(left / 1000);
    return `0:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <TheOtherSideCanvas side={side} envelope={breath.envelope} leanA={liveLeanA} />
      <CinematicOverlay tint="amber" />

      {/* Top-left phase pill */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <motion.div
          key={String(phase) + idx}
          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 0.9, x: 0 }} transition={{ duration: 0.6 }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-amber-100/75"
        >
          <span className="w-1 h-1 rounded-full bg-amber-200/85 animate-pulse" />
          <span>{phase === "settle" && "the other side"}
          {phase === "round" && `${idx + 1} / ${PAIRS.length} · ${PAIRS[idx].topic}`}
          {phase === "reveal" && "calibration"}
          {phase === "synthesis" && "synthesis"}
          {phase === "integrate" && "rest"}</span>
        </motion.div>
      </div>

      {/* Top-right mic + countdown */}
      <div className="absolute top-6 right-6 z-30 text-right space-y-1.5 pointer-events-none">
        <div className="flex items-center justify-end gap-1.5">
          {breath.ready ? <Mic className="w-3 h-3 text-amber-200/70" /> : <MicOff className="w-3 h-3 text-white/30" />}
          <span className="text-[10px] uppercase tracking-widest text-white/50">{breath.ready ? "mic" : "no mic"}</span>
        </div>
        {phase === "round" && (
          <p className="text-[10px] uppercase tracking-widest text-amber-200/60">{fmtRemaining(roundElapsed)}</p>
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
            <p style={SERIF} className="text-3xl italic font-light text-amber-50/90">the other side</p>
            <p className="mt-4 text-[11px] uppercase tracking-[0.4em] text-white/45 max-w-sm leading-relaxed">three tensions · sit with each side · notice which one feels like home</p>
          </motion.div>
        )}

        {phase === "round" && (
          <motion.div
            key={`round-${idx}-${side}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center"
          >
            <p style={SERIF} className="text-xl sm:text-2xl font-light italic text-amber-50/95 leading-relaxed max-w-md drop-shadow-[0_0_20px_rgba(255,190,120,0.15)]">
              "{side === "a" ? PAIRS[idx].a : PAIRS[idx].b}"
            </p>
            <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-white/40">
              {side === "a" ? "side one" : "side two"}
            </p>
            <div className="mt-10 flex gap-3">
              <button
                onClick={flipSide}
                className="px-5 py-2 rounded-full border border-white/30 text-xs tracking-widest uppercase text-white/75 hover:bg-white/5 hover:border-white/50 transition"
              >
                flip side
              </button>
              <motion.button
                onClick={commitRound}
                disabled={!canCommit}
                whileTap={{ scale: 0.96 }}
                className={`px-5 py-2 rounded-full text-xs tracking-widest uppercase border transition ${
                  canCommit
                    ? "border-amber-200/45 text-amber-100 bg-amber-500/10 hover:bg-amber-500/20 shadow-[0_0_25px_rgba(255,190,120,0.15)]"
                    : "border-white/10 text-white/30"
                }`}
              >
                {idx + 1 >= PAIRS.length ? "release · reveal" : "next tension"}
              </motion.button>
            </div>
            {!canCommit && (
              <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-white/30">
                sit with it · {Math.max(0, Math.ceil((ROUND_MIN_MS - roundElapsed) / 1000))}s
              </p>
            )}
          </motion.div>
        )}

        {phase === "reveal" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none"
          >
            <p className="text-[10px] uppercase tracking-[0.42em] text-amber-200/75 mb-6">calibration</p>
            <p style={SERIF} className="text-xl sm:text-2xl font-light text-amber-50/95 italic leading-relaxed max-w-md">
              "{revealLine || "…"}"
            </p>
          </motion.div>
        )}

        {phase === "synthesis" && (
          <motion.div
            key="synthesis"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center max-w-md mx-auto gap-6"
          >
            <p style={SERIF} className="text-xl sm:text-2xl italic font-light text-amber-50/95 leading-relaxed max-w-sm">
              name the truth that holds both. one sentence.
            </p>
            {listening ? (
              <button
                onClick={() => send({ type: "ADVANCE" })}
                className="px-6 py-2.5 rounded-full border border-amber-200/45 text-amber-100 text-sm bg-amber-500/10 backdrop-blur-sm animate-pulse shadow-[0_0_28px_rgba(255,190,120,0.18)]"
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
            transition={{ duration: 1.6 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none"
          >
            <p className="text-sm font-light text-white/65 tracking-[0.3em] uppercase">rest</p>
            {synthesis && <p className="mt-4 text-xs italic text-white/45 max-w-sm">"{synthesis}"</p>}
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

export default function TheOtherSide() {
  const g = getLabGame("the-other-side")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}
