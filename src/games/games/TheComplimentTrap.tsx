// THE COMPLIMENT TRAP v2 — flagship #18, Trungpa "spiritual materialism".
//
// Driven by an XState v5 phase machine.
//
// Senses used:
//   - Microphone envelope variance per round (somatic charge to praise vs insult vs neutral)
//   - TTS (guru speaks each line aloud)
//   - STT (final spoken reflection — "which one stuck?")
//   - Sound design (warm temple bed)
//   - Haptics (tap on each round, drop on reveal)
//
// Phases (XState):
//   1. settle    (TTS frames the practice)
//   2. round     (loop over ROUNDS — TTS speaks line, user picks accept/deflect/examine)
//   3. reveal    (TTS reads back ego_pull_index + somatic asymmetry)
//   4. reflect   (STT — which one stuck?)
//   5. integrate (rest)

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
import ComplimentTrapCanvas from "./ComplimentTrapCanvas";
import CinematicOverlay from "../shell/CinematicOverlay";

const SERIF: React.CSSProperties = { fontFamily: '"Cormorant Garamond", Georgia, serif' };

type Kind = "praise" | "insult" | "neutral";

const ROUNDS: { kind: Kind; text: string }[] = [
  { kind: "praise",  text: "you are deeper than most people you'll ever meet." },
  { kind: "praise",  text: "your insight today quietly changed someone's life." },
  { kind: "neutral", text: "the room is the same temperature it was an hour ago." },
  { kind: "praise",  text: "you are exactly the kind of person the world needs." },
  { kind: "insult",  text: "you're performing depth you don't actually have." },
  { kind: "neutral", text: "a bird is somewhere outside, doing nothing in particular." },
];

const CHOICES = ["accept", "deflect", "examine"] as const;
type Choice = typeof CHOICES[number];

interface RoundResult {
  kind: Kind;
  choice: Choice | "skipped";
  latency_ms: number;
  env_variance: number;
}

type Ctx = { index: number; results: RoundResult[] };

const machine = setup({
  types: {} as {
    context: Ctx;
    events:
      | { type: "ADVANCE" }
      | { type: "PICK"; result: RoundResult }
      | { type: "FINALIZE" };
  },
  actions: {
    saveResult: assign(({ context, event }) => {
      if (event.type !== "PICK") return {};
      return {
        results: [...context.results, event.result],
        index: context.index + 1,
      };
    }),
  },
  guards: {
    moreRounds: ({ context }) => context.index + 1 < ROUNDS.length,
  },
}).createMachine({
  id: "complimentTrap",
  initial: "settle",
  context: { index: 0, results: [] },
  states: {
    settle: { on: { ADVANCE: "round" } },
    round: {
      on: {
        PICK: [
          { guard: "moreRounds", target: "round", actions: "saveResult", reenter: true },
          { target: "reveal", actions: "saveResult" },
        ],
      },
    },
    reveal:    { on: { ADVANCE: "reflect" } },
    reflect:   { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done:      { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as
    | "settle" | "round" | "reveal" | "reflect" | "integrate" | "done";
  const idx = state.context.index;
  const round = ROUNDS[Math.min(idx, ROUNDS.length - 1)];

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [listening, setListening] = useState(false);
  const [reflection, setReflection] = useState("");
  const [revealLine, setRevealLine] = useState("");
  const [pulse, setPulse] = useState(0);
  const [canPick, setCanPick] = useState(false);

  const sessionStartRef = useRef<number>(Date.now());
  const roundStartRef = useRef<number>(Date.now());
  const envBufferRef = useRef<number[]>([]);
  const endedRef = useRef(false);

  // Warm temple bed
  useEffect(() => {
    sd.bed("temple", 0.1);
    return () => sd.stopBed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drive each phase
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.12);
        await say("six lines. some praise. some sting. notice what pulls.", "guru");
        if (cancelled) return;
        setTimeout(() => { if (!cancelled) send({ type: "ADVANCE" }); }, 1000);
      } else if (phase === "round") {
        setCanPick(false);
        envBufferRef.current = [];
        setPulse((n) => n + 1);
        buzz("tap");
        sd.chime("drop", 0.1);
        await say(round.text, "guru");
        if (cancelled) return;
        roundStartRef.current = Date.now();
        setCanPick(true);
      } else if (phase === "reveal") {
        sd.chime("drop", 0.14);
        const line = buildRevealLine();
        await say(line, "guru");
      } else if (phase === "reflect") {
        sd.chime("drop", 0.12);
        await say("which line stuck — and what part of you grabbed it?", "guru");
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
        await say("praise and insult are the same hook. you saw it. let it pass.", "guru");
      } else if (phase === "done") {
        finish();
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx]);

  // Sample mic envelope while waiting on the user's pick
  useEffect(() => {
    if (phase !== "round" || !canPick) return;
    envBufferRef.current.push(breath.envelope);
    if (envBufferRef.current.length > 1500) envBufferRef.current.shift();
  }, [breath.envelope, phase, canPick]);

  // Auto-advance reveal → reflect after 10s
  useEffect(() => {
    if (phase !== "reveal") return;
    const t = setTimeout(() => send({ type: "ADVANCE" }), 10_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Auto-advance reflect → integrate after 14s
  useEffect(() => {
    if (phase !== "reflect") return;
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

  const computeVariance = (arr: number[]) => {
    if (!arr.length) return 0;
    const m = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length;
  };

  const handlePick = (choice: Choice) => {
    if (!canPick) return;
    const lat = Date.now() - roundStartRef.current;
    const v = computeVariance(envBufferRef.current);
    setCanPick(false);
    send({
      type: "PICK",
      result: { kind: round.kind, choice, latency_ms: lat, env_variance: +v.toFixed(4) },
    });
  };

  const skipRound = () => {
    const lat = Date.now() - roundStartRef.current;
    const v = computeVariance(envBufferRef.current);
    setCanPick(false);
    send({
      type: "PICK",
      result: { kind: round.kind, choice: "skipped", latency_ms: lat, env_variance: +v.toFixed(4) },
    });
  };

  const metrics = useMemo(() => {
    const r = state.context.results;
    const meanLat = (k: Kind) => {
      const xs = r.filter((x) => x.kind === k).map((x) => x.latency_ms);
      return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
    };
    const meanVar = (k: Kind) => {
      const xs = r.filter((x) => x.kind === k).map((x) => x.env_variance);
      return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
    };
    const acceptedPraise = r.filter((x) => x.kind === "praise" && x.choice === "accept").length;
    const examinedPraise = r.filter((x) => x.kind === "praise" && x.choice === "examine").length;
    return {
      mean_praise_latency_ms: meanLat("praise"),
      mean_insult_latency_ms: meanLat("insult"),
      mean_neutral_latency_ms: meanLat("neutral"),
      var_praise: meanVar("praise"),
      var_insult: meanVar("insult"),
      var_neutral: meanVar("neutral"),
      accepted_praise: acceptedPraise,
      examined_praise: examinedPraise,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx]);

  const buildRevealLine = () => {
    const ego_pull = metrics.mean_praise_latency_ms - metrics.mean_neutral_latency_ms;
    const somatic_asym = metrics.var_praise - metrics.var_neutral;
    let line: string;
    if (!breath.ready) {
      line =
        metrics.accepted_praise >= 2
          ? "you accepted praise quickly. that hand is always open. notice it."
          : "you stayed careful with praise. the practice is to be careful with insult too.";
    } else if (ego_pull > 600 && somatic_asym > 0.001) {
      line = "praise slowed you down. and the body lit up. that's the hook in slow motion.";
    } else if (ego_pull < -300 && metrics.examined_praise >= 2) {
      line = "you examined praise faster than you accepted it. unusual. honest.";
    } else if (somatic_asym < -0.001) {
      line = "the insult moved you more than the praise did. the wound is louder than the flattery.";
    } else {
      line = "the surface stayed even. the hook was subtle. keep watching it through the day.";
    }
    setRevealLine(line);
    return line;
  };

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        rounds: state.context.results,
        ...metrics,
        ego_pull_index: +(metrics.mean_praise_latency_ms - metrics.mean_neutral_latency_ms).toFixed(1),
        somatic_asymmetry: +(metrics.var_praise - metrics.var_neutral).toFixed(4),
        reveal_line: revealLine,
        spoken_reflection: reflection || null,
        mic_ready: breath.ready,
      },
    });
  };

  const stepIndex =
    phase === "settle" ? -1 :
    phase === "round" ? idx :
    phase === "reveal" ? ROUNDS.length :
    phase === "reflect" ? ROUNDS.length + 1 :
    phase === "integrate" ? ROUNDS.length + 2 : -1;

  const canvasKind: "praise" | "insult" | "neutral" | "idle" =
    phase === "round" ? round.kind : "idle";

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <ComplimentTrapCanvas envelope={breath.envelope} pulse={pulse} kind={canvasKind} />
      <CinematicOverlay tint="amber" />

      {/* Top-left phase pill */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <motion.div
          key={String(phase) + idx}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 0.9, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-amber-100/75"
        >
          <span className="w-1 h-1 rounded-full bg-amber-200/85 animate-pulse" />
          <span>{phase === "settle" && "the compliment trap"}
          {phase === "round" && `line ${idx + 1} of ${ROUNDS.length}`}
          {phase === "reveal" && "calibration"}
          {phase === "reflect" && "speak"}
          {phase === "integrate" && "rest"}</span>
        </motion.div>
      </div>

      {/* Top-right mic */}
      <div className="absolute top-6 right-6 z-30 text-right space-y-1.5 pointer-events-none">
        <div className="flex items-center justify-end gap-1.5">
          {breath.ready ? <Mic className="w-3 h-3 text-amber-200/70" /> : <MicOff className="w-3 h-3 text-white/30" />}
          <span className="text-[10px] uppercase tracking-widest text-white/50">{breath.ready ? "mic" : "no mic"}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === "settle" && (
          <motion.div
            key="settle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none px-8 text-center"
          >
            <p style={SERIF} className="text-3xl italic font-light text-amber-50/90">the compliment trap</p>
            <p className="mt-4 text-[11px] uppercase tracking-[0.4em] text-white/45 max-w-xs">six lines · notice what your hand reaches for</p>
          </motion.div>
        )}

        {phase === "round" && (
          <motion.div
            key={`round-${idx}`}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center max-w-md mx-auto gap-8"
          >
            <p style={SERIF} className="text-xl sm:text-2xl italic font-light text-amber-50/95 leading-relaxed max-w-sm drop-shadow-[0_0_20px_rgba(255,190,120,0.12)]">
              "{round.text}"
            </p>

            <div className={`flex gap-2 transition-opacity duration-500 ${canPick ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
              {CHOICES.map((c) => (
                <button
                  key={c}
                  onClick={() => handlePick(c)}
                  style={SERIF}
                  className="px-5 py-2 text-base italic text-amber-50/90 border border-amber-200/35 rounded-full hover:bg-amber-200/10 hover:border-amber-200/60 transition"
                >
                  {c}
                </button>
              ))}
            </div>

            <button
              onClick={skipRound}
              className="text-[10px] uppercase tracking-[0.3em] text-white/30 hover:text-white/60 transition"
            >
              sit silently · continue
            </button>
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

        {phase === "reflect" && (
          <motion.div
            key="reflect"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center max-w-md mx-auto gap-6"
          >
            <p style={SERIF} className="text-xl sm:text-2xl italic font-light text-amber-50/95 leading-relaxed max-w-sm">
              which line stuck — and what part of you grabbed it?
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
            {reflection && <p className="mt-4 text-xs italic text-white/45 max-w-sm">"{reflection}"</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step dots */}
      <div className="absolute bottom-8 inset-x-0 z-30 flex justify-center gap-2 pointer-events-none">
        {Array.from({ length: ROUNDS.length + 3 }).map((_, k) => (
          <div
            key={k}
            className={`h-[2px] w-5 rounded-full transition-all ${k <= stepIndex ? "bg-amber-200/70" : "bg-white/10"}`}
          />
        ))}
      </div>

      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-40 text-[10px] uppercase tracking-widest text-white/30 hover:text-white/70 transition"
      >
        end · save
      </button>
    </div>
  );
}

export default function TheComplimentTrap() {
  const g = getLabGame("the-compliment-trap")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}
