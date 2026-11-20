/**
 * SlotSignature — the killer micro-ritual unique to each slot.
 * Morning: Sankalpa (one-word intention)
 * Midday:  60-second Reset (hold-to-pause)
 * Evening: Three Stones (heavy / warm / light)
 * Night:   Empty Bowl (eyes-closed breath)
 *
 * Pure UI — no backend writes. Stays in localStorage so it survives reloads
 * but never crashes if storage is blocked.
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Feather, Pause, Circle, CircleDot } from "lucide-react";
import { getSlotDesign } from "@/lib/slotDesign";
import type { TimeSlot } from "@/lib/timeSlots";

interface SlotSignatureProps {
  slot: TimeSlot;
}

const STORAGE_KEY = "slot-signature-v1";

function readStore(): Record<string, any> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}
function writeStore(patch: Record<string, any>) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...readStore(), ...patch, _date: new Date().toDateString() }),
    );
  } catch {}
}

export default function SlotSignature({ slot }: SlotSignatureProps) {
  const design = getSlotDesign(slot);
  const accent = `hsl(${design.accentVar})`;

  return (
    <motion.section
      key={slot}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.6 }}
      className="rounded-2xl p-5"
      style={{
        background: "hsl(var(--card) / 0.4)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: `1px solid hsl(${design.accentVar} / 0.14)`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[10px] font-display tracking-[0.24em] uppercase font-semibold"
          style={{ color: accent }}
        >
          {design.signatureName}
        </span>
        <span className="text-[10px] font-display text-muted-foreground/50">
          Today's ritual
        </span>
      </div>

      <p className="text-[13px] font-body text-muted-foreground/80 leading-relaxed mb-4">
        {design.signatureLine}
      </p>

      {slot === "morning" && <SankalpaInput accent={accent} />}
      {slot === "midday" && <SixtySecondReset accent={accent} />}
      {slot === "evening" && <ThreeStones accent={accent} />}
      {slot === "night" && <EmptyBowl accent={accent} />}
    </motion.section>
  );
}

/* ──────────────── MORNING: Sankalpa ──────────────── */
function SankalpaInput({ accent }: { accent: string }) {
  const today = new Date().toDateString();
  const stored = readStore();
  const initial = stored._date === today ? stored.sankalpa || "" : "";
  const [word, setWord] = useState(initial);
  const [saved, setSaved] = useState(!!initial);

  return (
    <div className="space-y-3">
      <input
        value={word}
        onChange={(e) => {
          setWord(e.target.value.slice(0, 18));
          setSaved(false);
        }}
        placeholder="one word…"
        className="w-full bg-transparent border-b text-center text-2xl font-display tracking-wider py-3 outline-none transition-colors"
        style={{
          borderColor: `${accent.replace("hsl(", "hsl(").replace(")", " / 0.3)")}`,
          color: "hsl(var(--foreground))",
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: word ? "normal" : "italic",
        }}
      />
      <button
        onClick={() => {
          if (!word.trim()) return;
          writeStore({ sankalpa: word.trim() });
          setSaved(true);
        }}
        disabled={!word.trim() || saved}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-display tracking-wide uppercase transition-opacity disabled:opacity-50"
        style={{
          background: word ? `${accent}` : "hsl(var(--muted))",
          color: word ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
        }}
      >
        <Feather className="w-3.5 h-3.5" />
        {saved ? "Carried with you today" : "Plant intention"}
      </button>
    </div>
  );
}

/* ──────────────── MIDDAY: 60-second hold-to-reset ──────────────── */
function SixtySecondReset({ accent }: { accent: string }) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const tick = () => {
    if (startRef.current === null) return;
    const elapsed = (Date.now() - startRef.current) / 60000; // 60s
    const p = Math.min(1, elapsed);
    setProgress(p);
    if (p >= 1) {
      setDone(true);
      setHolding(false);
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  };
  const start = () => {
    if (done) return;
    setHolding(true);
    startRef.current = Date.now() - progress * 60000;
    rafRef.current = requestAnimationFrame(tick);
  };
  const stop = () => {
    setHolding(false);
    startRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };
  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const seconds = Math.ceil((1 - progress) * 60);
  const ringSize = 120;
  const r = (ringSize - 6) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <button
        onMouseDown={start}
        onMouseUp={stop}
        onMouseLeave={stop}
        onTouchStart={start}
        onTouchEnd={stop}
        className="relative outline-none"
        aria-label="Hold to begin 60-second reset"
      >
        <svg width={ringSize} height={ringSize} className="-rotate-90">
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={r}
            fill="none"
            stroke="hsl(var(--muted) / 0.4)"
            strokeWidth={4}
          />
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={r}
            fill="none"
            stroke={accent}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - progress * c}
            style={{ transition: "stroke-dashoffset 0.1s linear" }}
          />
        </svg>
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center"
          animate={{ scale: holding ? 0.94 : 1 }}
          transition={{ duration: 0.4 }}
        >
          {done ? (
            <span className="text-2xl">🪷</span>
          ) : (
            <>
              <span className="text-3xl font-display font-light" style={{ color: accent }}>
                {seconds}
              </span>
              <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/70 mt-0.5">
                {holding ? "breathe" : "hold"}
              </span>
            </>
          )}
        </motion.div>
      </button>
      <p className="text-[11px] font-display text-muted-foreground/60 text-center">
        {done
          ? "Reset complete. Carry on."
          : holding
            ? "Stay. Don't let go."
            : "Press & hold the circle."}
      </p>
    </div>
  );
}

/* ──────────────── EVENING: Three Stones ──────────────── */
type StoneKind = "heavy" | "warm" | "light";
const STONES: { kind: StoneKind; label: string; emoji: string; prompt: string }[] = [
  { kind: "heavy", label: "Heavy", emoji: "⬛", prompt: "What weighed on you?" },
  { kind: "warm", label: "Warm", emoji: "🟧", prompt: "What you're grateful for?" },
  { kind: "light", label: "Light", emoji: "⚪", prompt: "What did you learn?" },
];

function ThreeStones({ accent }: { accent: string }) {
  const today = new Date().toDateString();
  const stored = readStore();
  const initial = stored._date === today ? stored.stones || {} : {};
  const [stones, setStones] = useState<Record<StoneKind, string>>({
    heavy: initial.heavy || "",
    warm: initial.warm || "",
    light: initial.light || "",
  });
  const [active, setActive] = useState<StoneKind | null>(null);
  const dropped = (k: StoneKind) => stones[k].trim().length > 0;

  const save = (k: StoneKind, v: string) => {
    const next = { ...stones, [k]: v };
    setStones(next);
    writeStore({ stones: next });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-around py-2">
        {STONES.map((s) => (
          <motion.button
            key={s.kind}
            onClick={() => setActive(active === s.kind ? null : s.kind)}
            className="flex flex-col items-center gap-1.5"
            whileTap={{ scale: 0.92 }}
          >
            <motion.div
              className="text-3xl"
              animate={{
                y: dropped(s.kind) ? 6 : 0,
                opacity: dropped(s.kind) ? 0.45 : 1,
                scale: active === s.kind ? 1.2 : 1,
              }}
              transition={{ type: "spring", stiffness: 240, damping: 20 }}
            >
              {s.emoji}
            </motion.div>
            <span
              className="text-[10px] font-display tracking-[0.18em] uppercase"
              style={{ color: dropped(s.kind) ? accent : "hsl(var(--muted-foreground))" }}
            >
              {s.label}
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key={active}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="text-[11px] font-display text-muted-foreground/70 mb-2">
              {STONES.find((s) => s.kind === active)?.prompt}
            </p>
            <textarea
              value={stones[active]}
              onChange={(e) => save(active, e.target.value.slice(0, 140))}
              placeholder="A few words…"
              rows={2}
              className="w-full bg-background/40 rounded-xl p-3 text-sm font-body text-foreground placeholder:text-muted-foreground/40 outline-none resize-none border"
              style={{ borderColor: `hsl(var(--border) / 0.5)` }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-center gap-1 pt-1">
        {STONES.map((s) => (
          <span
            key={s.kind}
            className="w-1.5 h-1.5 rounded-full transition-all"
            style={{
              background: dropped(s.kind) ? accent : "hsl(var(--muted))",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ──────────────── NIGHT: Empty Bowl ──────────────── */
function EmptyBowl({ accent }: { accent: string }) {
  const [active, setActive] = useState(false);
  const [breaths, setBreaths] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = window.setInterval(() => {
      setBreaths((b) => b + 1);
    }, 8000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [active]);

  return (
    <div className="flex flex-col items-center gap-4 py-3">
      <motion.button
        onClick={() => {
          if (active) {
            setActive(false);
          } else {
            setActive(true);
            setBreaths(0);
          }
        }}
        className="relative w-24 h-24 rounded-full flex items-center justify-center outline-none"
        style={{
          background: `radial-gradient(circle, ${accent.replace(")", " / 0.18)")}, transparent 70%)`,
          border: `1px solid ${accent.replace(")", " / 0.3)")}`,
        }}
        whileTap={{ scale: 0.94 }}
      >
        <motion.div
          className="rounded-full"
          style={{
            width: 24,
            height: 24,
            background: accent,
          }}
          animate={
            active
              ? { scale: [1, 2.4, 1], opacity: [0.85, 0.4, 0.85] }
              : { scale: 1, opacity: 0.85 }
          }
          transition={{
            duration: 8,
            repeat: active ? Infinity : 0,
            ease: "easeInOut",
          }}
        />
      </motion.button>

      <div className="text-center">
        <p className="text-[11px] font-display tracking-[0.2em] uppercase text-muted-foreground/60">
          {active ? `${breaths} breath${breaths === 1 ? "" : "s"} held` : "Tap to enter"}
        </p>
        <p className="text-[10px] font-display text-muted-foreground/40 mt-1">
          {active ? "Tap again when complete" : "Nothing to achieve. Just be."}
        </p>
      </div>
    </div>
  );
}
