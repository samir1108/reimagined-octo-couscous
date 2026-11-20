// WHOSE VOICE? v2 — flagship #19, Internal Family Systems (Schwartz).
//
// Driven by an XState v5 phase machine, mirrors #15/#16/#18 pipeline.
//
// Senses used:
//   - Microphone envelope variance per round (somatic charge per situation)
//   - TTS (guru reads each situation aloud)
//   - STT (final spoken reflection — "whose voice was loudest?")
//   - Sound design (warm temple bed)
//   - Haptics (tap on each pick, drop on reveal)
//
// Phases (XState):
//   1. settle    (TTS frames the practice)
//   2. round     (loop over PROMPTS — TTS speaks situation, user picks a voice)
//   3. reveal    (TTS reads back dominant voice + somatic asymmetry)
//   4. reflect   (STT — whose voice was loudest today?)
//   5. integrate (rest)

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CinematicOverlay from "../shell/CinematicOverlay";
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
import WhoseVoiceCanvas from "./WhoseVoiceCanvas";

type Tag = "mom" | "dad" | "teacher" | "self";

const PROMPTS: { situation: string; lines: { text: string; tag: Tag }[] }[] = [
  {
    situation: "you made a mistake at work.",
    lines: [
      { text: "it's okay sweetheart, just try again.", tag: "mom" },
      { text: "be more careful next time. think.",      tag: "dad" },
      { text: "what can this teach you?",               tag: "teacher" },
      { text: "i see what happened. i'll try again.",   tag: "self" },
    ],
  },
  {
    situation: "you're tired but want to rest.",
    lines: [
      { text: "lie down. i'll bring you tea.",       tag: "mom" },
      { text: "push through. almost done.",          tag: "dad" },
      { text: "notice what your body needs.",        tag: "teacher" },
      { text: "i'm tired. i'll rest.",               tag: "self" },
    ],
  },
  {
    situation: "someone praised you publicly.",
    lines: [
      { text: "i'm so proud of you!",                tag: "mom" },
      { text: "don't get cocky.",                    tag: "dad" },
      { text: "receive it without owning it.",       tag: "teacher" },
      { text: "thank you. i worked for that.",       tag: "self" },
    ],
  },
  {
    situation: "you're scared to start.",
    lines: [
      { text: "it'll be alright, sweetheart.",       tag: "mom" },
      { text: "stop overthinking. just do it.",      tag: "dad" },
      { text: "fear is signal, not stop.",           tag: "teacher" },
      { text: "i am scared. and i begin.",           tag: "self" },
    ],
  },
  {
    situation: "a friend cancels plans last minute.",
    lines: [
      { text: "maybe they're not feeling well.",     tag: "mom" },
      { text: "typical. people are unreliable.",     tag: "dad" },
      { text: "notice the story you're spinning.",   tag: "teacher" },
      { text: "i feel disappointed. that's it.",     tag: "self" },
    ],
  },
];

interface RoundResult {
  situation: string;
  tag: Tag | "skipped";
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
    moreRounds: ({ context }) => context.index + 1 < PROMPTS.length,
  },
}).createMachine({
  id: "whoseVoice",
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
  const round = PROMPTS[Math.min(idx, PROMPTS.length - 1)];

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [listening, setListening] = useState(false);
  const [reflection, setReflection] = useState("");
  const [revealLine, setRevealLine] = useState("");
  const [pulse, setPulse] = useState(0);
  const [active, setActive] = useState<Tag | null>(null);
  const [canPick, setCanPick] = useState(false);

  const sessionStartRef = useRef<number>(Date.now());
  const roundStartRef = useRef<number>(Date.now());
  const envBufferRef = useRef<number[]>([]);
  const endedRef = useRef(false);

  // Warm bed
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
        await say("five situations. four voices in your head. notice which one speaks first.", "guru");
        if (cancelled) return;
        setTimeout(() => { if (!cancelled) send({ type: "ADVANCE" }); }, 1000);
      } else if (phase === "round") {
        setCanPick(false);
        envBufferRef.current = [];
        sd.chime("drop", 0.1);
        await say(round.situation, "guru");
        if (cancelled) return;
        roundStartRef.current = Date.now();
        setCanPick(true);
      } else if (phase === "reveal") {
        sd.chime("drop", 0.14);
        const line = buildRevealLine();
        await say(line, "guru");
      } else if (phase === "reflect") {
        sd.chime("drop", 0.12);
        await say("whose voice was loudest in you today?", "guru");
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
        await say("each voice is a part of you. you are the one listening.", "guru");
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

  // Auto-advance reveal → reflect after 11s
  useEffect(() => {
    if (phase !== "reveal") return;
    const t = setTimeout(() => send({ type: "ADVANCE" }), 11_000);
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

  const handlePick = (tag: Tag) => {
    if (!canPick) return;
    const lat = Date.now() - roundStartRef.current;
    const v = computeVariance(envBufferRef.current);
    setCanPick(false);
    setActive(tag);
    setPulse((n) => n + 1);
    buzz("tap");
    send({
      type: "PICK",
      result: { situation: round.situation, tag, latency_ms: lat, env_variance: +v.toFixed(4) },
    });
  };

  const skipRound = () => {
    const lat = Date.now() - roundStartRef.current;
    const v = computeVariance(envBufferRef.current);
    setCanPick(false);
    send({
      type: "PICK",
      result: { situation: round.situation, tag: "skipped", latency_ms: lat, env_variance: +v.toFixed(4) },
    });
  };

  const metrics = useMemo(() => {
    const r = state.context.results;
    const counts: Record<string, number> = { mom: 0, dad: 0, teacher: 0, self: 0, skipped: 0 };
    const varByTag: Record<string, number[]> = { mom: [], dad: [], teacher: [], self: [] };
    const latByTag: Record<string, number[]> = { mom: [], dad: [], teacher: [], self: [] };
    r.forEach((x) => {
      counts[x.tag] = (counts[x.tag] ?? 0) + 1;
      if (x.tag !== "skipped") {
        varByTag[x.tag].push(x.env_variance);
        latByTag[x.tag].push(x.latency_ms);
      }
    });
    const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
    const tags: Tag[] = ["mom", "dad", "teacher", "self"];
    const dominant = tags
      .map((t) => ({ t, n: counts[t] }))
      .sort((a, b) => b.n - a.n)[0];
    const loudestTag = tags
      .map((t) => ({ t, v: mean(varByTag[t]) }))
      .sort((a, b) => b.v - a.v)[0];
    return {
      counts,
      dominant_voice: dominant?.n ? dominant.t : null,
      loudest_somatic_voice: loudestTag?.v ? loudestTag.t : null,
      mean_var_mom: mean(varByTag.mom),
      mean_var_dad: mean(varByTag.dad),
      mean_var_teacher: mean(varByTag.teacher),
      mean_var_self: mean(varByTag.self),
      mean_lat_mom: mean(latByTag.mom),
      mean_lat_dad: mean(latByTag.dad),
      mean_lat_teacher: mean(latByTag.teacher),
      mean_lat_self: mean(latByTag.self),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx]);

  const buildRevealLine = () => {
    const dom = metrics.dominant_voice;
    const loud = metrics.loudest_somatic_voice;
    let line: string;
    if (!dom) {
      line = "you sat without choosing. that, too, is a voice.";
    } else if (dom === "self") {
      line = "your own voice spoke first, more than the inherited ones. rare. keep listening.";
    } else if (breath.ready && loud && loud !== dom) {
      line = `your hand picked ${dom}. but the body lit up around ${loud}. the loudest voice isn't always the one you obey.`;
    } else if (dom === "dad") {
      line = "the inner father showed up most. notice if it pushes you, or punishes you.";
    } else if (dom === "mom") {
      line = "the inner mother held you most. notice if it soothes you, or shrinks you.";
    } else {
      line = "the inner teacher led most. notice if it teaches, or lectures.";
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
        reveal_line: revealLine,
        spoken_reflection: reflection || null,
        mic_ready: breath.ready,
      },
    });
  };

  const stepIndex =
    phase === "settle" ? -1 :
    phase === "round" ? idx :
    phase === "reveal" ? PROMPTS.length :
    phase === "reflect" ? PROMPTS.length + 1 :
    phase === "integrate" ? PROMPTS.length + 2 : -1;

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950/25 via-black to-rose-950/20 pointer-events-none" />
      <CinematicOverlay tint="warm" />

      <WhoseVoiceCanvas envelope={breath.envelope} pulse={pulse} active={active} />

      {/* Top-left phase pill */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <motion.div
          key={String(phase) + idx}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 0.9, x: 0 }}
          transition={{ duration: 0.7 }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-amber-200/70"
        >
          <motion.span
            className="inline-block w-1 h-1 rounded-full bg-amber-200/85"
            animate={{ opacity: [0.35, 1, 0.35], scale: [0.9, 1.25, 0.9] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          {phase === "settle" && "whose voice"}
          {phase === "round" && `situation ${idx + 1} of ${PROMPTS.length}`}
          {phase === "reveal" && "calibration"}
          {phase === "reflect" && "speak"}
          {phase === "integrate" && "rest"}
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
            <p
              className="text-4xl sm:text-5xl italic text-amber-50/90 tracking-wide"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
            >
              whose voice
            </p>
            <div className="mt-5 h-px w-16 bg-amber-100/25 mx-auto" />
            <p className="mt-4 text-[11px] uppercase tracking-[0.4em] text-amber-100/55 max-w-xs mx-auto">five moments · four voices · one listener</p>
          </motion.div>
        )}

        {phase === "round" && (
          <motion.div
            key={`round-${idx}`}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6 text-center max-w-md mx-auto gap-6"
          >
            <p
              className="text-2xl sm:text-3xl italic text-amber-50/95 leading-relaxed max-w-sm tracking-wide"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, textShadow: "0 0 30px rgba(255,220,180,0.28)" }}
            >
              {round.situation}
            </p>

            <div className={`w-full space-y-2 transition-opacity duration-500 ${canPick ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
              {round.lines.map((l) => (
                <button
                  key={l.tag}
                  onClick={() => handlePick(l.tag)}
                  className="w-full px-4 py-2.5 text-sm text-amber-50/85 border border-amber-200/30 rounded-2xl hover:bg-amber-200/10 transition text-left"
                >
                  <span className="text-[10px] uppercase tracking-[0.3em] text-amber-200/50 mr-2">{l.tag}</span>
                  {l.text}
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
            <p className="text-[10px] uppercase tracking-[0.42em] text-amber-200/70 mb-6">calibration</p>
            <p
              className="text-2xl sm:text-3xl italic text-amber-50/95 leading-relaxed max-w-md"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, textShadow: "0 0 30px rgba(255,220,180,0.3)" }}
            >
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
            <p
              className="text-2xl sm:text-3xl italic text-amber-50/95 leading-relaxed max-w-sm"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
            >
              whose voice was loudest in you today?
            </p>
            {listening ? (
              <button
                onClick={() => send({ type: "ADVANCE" })}
                className="px-7 py-2.5 rounded-full border border-amber-200/40 text-amber-100 text-[11px] uppercase tracking-[0.3em] bg-amber-500/10 backdrop-blur-sm hover:bg-amber-500/20 transition"
                style={{ boxShadow: "0 0 30px rgba(251,191,36,0.18)" }}
              >
                ● listening · tap when done
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
        {Array.from({ length: PROMPTS.length + 3 }).map((_, k) => (
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

export default function WhoseVoice() {
  const g = getLabGame("whose-voice")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}
