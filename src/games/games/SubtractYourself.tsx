// SUBTRACT YOURSELF v2 — flagship #26, Neti Neti.
//
// You are shown 8 identities. One by one, you drop the ones you are NOT.
// What remains last is what you cling to most — the attachment proxy.
// Then the witness names what is left after every label is gone.
//
// We track:
//   - removal_order with per-drop latency_ms (hesitation = attachment)
//   - first_dropped (easiest to release)
//   - last_dropped (deepest attachment)
//   - hesitation index (variance in latency)
//   - mic envelope mean + variance during the drop sequence
//   - one spoken line at the end ("who is left?")
//
// Senses used:
//   - TTS (guru opens, frames, calibrates)
//   - Microphone envelope (somatic resistance to letting go)
//   - STT (the witness's own answer)
//   - Sound design + haptics
//
// XState phases:
//   1. settle    — opening line
//   2. drop      — pick & remove identities (single state, gated by remaining)
//   3. reveal    — calibration line on order, hesitation, somatic charge
//   4. words     — STT, "who is left?"
//   5. integrate — closing line, then end

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
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
import SubtractYourselfCanvas from "./SubtractYourselfCanvas";
import CinematicOverlay from "../shell/CinematicOverlay";

const SERIF: React.CSSProperties = { fontFamily: '"Cormorant Garamond", Georgia, serif' };

const SEED = [
  "your name",
  "your role",
  "your body",
  "your past",
  "your beliefs",
  "your relationships",
  "your future",
  "your story",
];

interface DropRecord {
  item: string;
  latency_ms: number;
}

const machine = setup({
  types: {} as {
    events: { type: "ADVANCE" } | { type: "FINALIZE" };
  },
}).createMachine({
  id: "subtractYourself",
  initial: "settle",
  states: {
    settle:    { on: { ADVANCE: "drop" } },
    drop:      { on: { ADVANCE: "reveal" } },
    reveal:    { on: { ADVANCE: "words" } },
    words:     { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done:      { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as "settle" | "drop" | "reveal" | "words" | "integrate" | "done";

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [items, setItems] = useState<string[]>(SEED);
  const [revealLine, setRevealLine] = useState("");
  const [whispered, setWhispered] = useState("");
  const [listening, setListening] = useState(false);

  const dropsRef = useRef<DropRecord[]>([]);
  const lastTapRef = useRef(performance.now());
  const envelopeRef = useRef<number[]>([]);
  const sessionStartRef = useRef(Date.now());
  const phaseRef = useRef(phase);
  const endedRef = useRef(false);

  // Bed
  useEffect(() => {
    sd.bed("temple", 0.06);
    return () => { sd.stopBed(); stopVoice(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Sample mic envelope during drop phase
  useEffect(() => {
    if (phase !== "drop") return;
    envelopeRef.current.push(breath.envelope);
  }, [breath.envelope, phase]);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.08);
        await say("you are about to drop everything you call yourself. one at a time. neti — neti — not this, not this.", "guru");
        if (cancelled) return;
        lastTapRef.current = performance.now();
        setTimeout(() => { if (!cancelled) send({ type: "ADVANCE" }); }, 700);
      } else if (phase === "drop") {
        sd.chime("drop", 0.05);
        await say("touch what you are not. begin with the easiest.", "guru");
      } else if (phase === "reveal") {
        sd.chime("drop", 0.1);
        const line = buildRevealLine();
        await say(line, "guru");
      } else if (phase === "words") {
        sd.chime("drop", 0.08);
        await say("with every label gone — who is left? speak it.", "guru");
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
        await say("what cannot be subtracted is what you actually are. rest there.", "guru");
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

  // Cap whispered at 22s
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

  const remove = (it: string) => {
    if (phaseRef.current !== "drop") return;
    const now = performance.now();
    dropsRef.current.push({ item: it, latency_ms: Math.round(now - lastTapRef.current) });
    lastTapRef.current = now;
    buzz("tap");
    const rest = items.filter((x) => x !== it);
    setItems(rest);
    if (rest.length === 0) {
      setTimeout(() => send({ type: "ADVANCE" }), 1000);
    }
  };

  const buildRevealLine = (): string => {
    const drops = dropsRef.current;
    if (!drops.length) {
      const fallback = "you stayed silent at the door. that is also an answer.";
      setRevealLine(fallback);
      return fallback;
    }
    const last = drops[drops.length - 1];
    const first = drops[0];
    const latencies = drops.map((d) => d.latency_ms);
    const meanLat = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const varLat = latencies.reduce((a, b) => a + (b - meanLat) ** 2, 0) / latencies.length;
    const env = envelopeRef.current;
    const meanEnv = env.length ? env.reduce((a, b) => a + b, 0) / env.length : 0;
    const varEnv = env.length ? env.reduce((a, b) => a + (b - meanEnv) ** 2, 0) / env.length : 0;

    let line: string;
    if (last.latency_ms > meanLat * 1.8) {
      line = `you released seven things easily. "${last.item}" — that one waited. that is where the self still grips.`;
    } else if (varLat > 1_500_000) {
      line = `the speed kept shifting. some labels fell, others fought. notice which ones stalled — they are still alive.`;
    } else if (varEnv > 0.012) {
      line = `the body resisted while the finger tapped. the breath caught on something the mind already let go.`;
    } else if (meanLat < 700) {
      line = `you dropped them all in a rush. notice — speed can be release, or it can be avoidance. which was it?`;
    } else {
      line = `"${first.item}" went first — easiest to disown. "${last.item}" went last — that is the attachment to look at.`;
    }
    setRevealLine(line);
    return line;
  };

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();

    const drops = dropsRef.current;
    const latencies = drops.map((d) => d.latency_ms);
    const meanLat = latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
    const varLat = latencies.length
      ? latencies.reduce((a, b) => a + (b - meanLat) ** 2, 0) / latencies.length
      : 0;
    const env = envelopeRef.current;
    const meanEnv = env.length ? env.reduce((a, b) => a + b, 0) / env.length : 0;
    const varEnv = env.length
      ? env.reduce((a, b) => a + (b - meanEnv) ** 2, 0) / env.length
      : 0;

    onEnd({
      outcome: drops.length === SEED.length ? "completed" : "abandoned",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        removal_order: drops,
        first_dropped: drops[0]?.item ?? null,
        last_dropped: drops[drops.length - 1]?.item ?? null,
        hesitation_var: Math.round(varLat),
        mean_latency_ms: Math.round(meanLat),
        env_mean: +meanEnv.toFixed(4),
        env_var: +varEnv.toFixed(5),
        completion_ratio: +(drops.length / SEED.length).toFixed(2),
        reveal_line: revealLine,
        witness_answer: whispered || null,
        mic_ready: breath.ready,
      },
    });
  };

  const remaining = items.length / SEED.length;
  const drop = dropsRef.current.length;

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <SubtractYourselfCanvas envelope={breath.envelope} remaining={remaining} drop={drop} />
      <CinematicOverlay tint="amber" />

      {/* Top-left phase pill */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <motion.div
          key={String(phase)}
          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 0.9, x: 0 }} transition={{ duration: 0.6 }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-amber-100/70"
        >
          <span className="w-1 h-1 rounded-full bg-amber-200/85 animate-pulse" />
          <span>{phase === "settle" && "subtract yourself"}
          {phase === "drop" && `neti · ${SEED.length - items.length} / ${SEED.length}`}
          {phase === "reveal" && "calibration"}
          {phase === "words" && "the witness speaks"}
          {phase === "integrate" && "rest"}</span>
        </motion.div>
      </div>

      {/* Top-right mic */}
      <div className="absolute top-6 right-6 z-30 text-right space-y-1.5 pointer-events-none">
        <div className="flex items-center justify-end gap-1.5">
          {breath.ready ? <Mic className="w-3 h-3 text-amber-100/60" /> : <MicOff className="w-3 h-3 text-white/30" />}
          <span className="text-[10px] uppercase tracking-widest text-white/50">{breath.ready ? "mic" : "no mic"}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === "settle" && (
          <motion.div
            key="settle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.6 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none px-8 text-center"
          >
            <p style={SERIF} className="text-3xl italic font-light text-amber-50/90">subtract yourself</p>
            <p className="mt-4 text-[11px] uppercase tracking-[0.4em] text-white/45 max-w-xs">drop what you are not · one at a time</p>
          </motion.div>
        )}

        {phase === "drop" && (
          <motion.div
            key="drop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.0 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6"
          >
            <p className="text-[10px] uppercase tracking-[0.42em] text-amber-100/65 mb-8">
              neti · neti · not this, not this
            </p>
            <div className="flex flex-wrap justify-center gap-3 max-w-md">
              <AnimatePresence>
                {items.map((it) => (
                  <motion.button
                    key={it}
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5, y: -30 }}
                    transition={{ duration: 0.5 }}
                    onClick={() => remove(it)}
                    style={SERIF}
                    className="px-5 py-2 rounded-full border border-white/25 text-base italic text-white/90 hover:bg-amber-500/5 hover:border-amber-100/45 hover:text-amber-50 transition"
                  >
                    {it}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
            {items.length === 0 && (
              <motion.p style={SERIF} initial={{opacity:0}} animate={{opacity:0.85}} className="mt-12 text-amber-50/85 text-xl font-light italic">
                what remains is the witness.
              </motion.p>
            )}
          </motion.div>
        )}

        {phase === "reveal" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.4 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none"
          >
            <p className="text-[10px] uppercase tracking-[0.42em] text-amber-100/70 mb-6">calibration</p>
            <p style={SERIF} className="text-xl sm:text-2xl font-light text-amber-50/95 italic leading-relaxed max-w-md">
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
            <p style={SERIF} className="text-xl sm:text-2xl italic font-light text-amber-50/95 leading-relaxed max-w-sm">
              with every label gone — who is left?
            </p>
            {listening ? (
              <button
                onClick={() => send({ type: "ADVANCE" })}
                className="px-6 py-2.5 rounded-full border border-amber-100/40 text-amber-50/95 text-sm bg-amber-500/10 backdrop-blur-sm animate-pulse shadow-[0_0_28px_rgba(255,190,120,0.15)]"
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

export default function SubtractYourself() {
  const g = getLabGame("subtract-yourself")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}
