/**
 * Orb Practice — the bank made flesh.
 *
 * A single stage: the shared R3F orb, one spoken beat at a time, and DOM
 * controls around it for time, voice, listening and depth. Any practice from
 * 1 second to 12 hours is the same screen; only the script changes length.
 */
import { Suspense, lazy, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Film,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Shuffle,
  Sparkles,
  Square,
  Vibrate,
  Volume2,
  VolumeX,
  Waves,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { orbPaletteFromHue } from "@/components/orb/palettes";
import { SessionFilmBackdrop } from "@/components/experience/SessionFilmBackdrop";
import { useOrbPractice } from "@/hooks/useOrbPractice";
import { useOrbMedia } from "@/hooks/useOrbMedia";
import {
  DELIVERY_MODES,
  DURATION_SLOTS,
  ORB_LEVELS,
  PRACTICE_ATOMS,
  PRACTICE_BANK_STATS,
  PRACTICE_WORLDS,
  VOICES,
  buildOrbPractice,
  currentPracticeSlot,
  durationAtIndex,
  formatPracticeDuration,
  isDeepgramSttSupported,
  isSttSupported,
  nearestDurationSlot,
  pickPractice,
  recommendOrbPractice,
  videoForPractice,
  type DeliveryModeId,
  type ListenEngine,
  type PracticeSpec,
  type VoiceId,
} from "@/lib/practice-bank";
import type { WorldId } from "@/lib/bience/model";
import type { PracticeAtomKind } from "@/lib/practice-bank/atoms";

const ConsciousnessOrb = lazy(() => import("@/components/orb/ConsciousnessOrb"));

const QUICK_DURATIONS = [1, 30, 300, 1800, 7200, 21600, 43200];

function clock(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function OrbPractice() {
  const navigate = useNavigate();
  const sttSupported = useMemo(() => isSttSupported(), []);
  const deepgramSupported = useMemo(() => isDeepgramSttSupported(), []);
  const voiceSupported = sttSupported || deepgramSupported;

  const [durationIndex, setDurationIndex] = useState(() => nearestDurationSlot(300));
  const [atomKind, setAtomKind] = useState<PracticeAtomKind | "all">("all");
  const [atomId, setAtomId] = useState<string>("auto");
  const [modeId, setModeId] = useState<DeliveryModeId>("orb");
  const [voiceId, setVoiceId] = useState<VoiceId>("guru");
  const [worldId, setWorldId] = useState<WorldId>("first-light");
  const [level, setLevel] = useState(2);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [sttEnabled, setSttEnabled] = useState(voiceSupported);
  const [sttEngine, setSttEngine] = useState<ListenEngine>("auto");
  const [film, setFilm] = useState(true);
  const [ambience, setAmbience] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [seed, setSeed] = useState(0);

  const duration = durationAtIndex(durationIndex);

  const atoms = useMemo(
    () => (atomKind === "all" ? PRACTICE_ATOMS : PRACTICE_ATOMS.filter((atom) => atom.kind === atomKind)),
    [atomKind],
  );

  const spec: PracticeSpec = useMemo(() => {
    if (atomId === "auto") {
      return recommendOrbPractice(
        {
          modeId,
          voiceId,
          worldId,
          level,
          slot: currentPracticeSlot(),
          energy: level >= 5 ? "high" : level <= 2 ? "low" : "medium",
        },
        duration.seconds,
        seed,
      );
    }
    return pickPractice(
      { atomId, durationSec: duration.seconds, modeId, worldId, voiceId, level },
      `exact:${seed}:${atomId}:${duration.seconds}`,
    );
  }, [atomId, modeId, voiceId, worldId, level, duration.seconds, seed]);

  const practice = useMemo(() => buildOrbPractice(spec), [spec]);
  const runtime = useOrbPractice(practice, { ttsEnabled, sttEnabled, sttEngine });
  const media = useMemo(() => videoForPractice(practice), [practice]);
  useOrbMedia(practice, {
    active: runtime.status === "running",
    ambience,
    haptics,
    beatId: runtime.beat?.id,
    beatKind: runtime.beat?.kind,
  });

  const running = runtime.status === "running";
  const complete = runtime.status === "complete";
  const palette = useMemo(() => orbPaletteFromHue(practice.hue), [practice.hue]);
  const beatText = runtime.beat?.speak ?? runtime.beat?.listenPrompt ?? (runtime.beat?.kind === "silence" ? "Silence" : practice.title);

  const shuffle = () => {
    setSeed(Date.now());
    if (atomId !== "auto") {
      const next = pickPractice({ atomKind: atomKind === "all" ? undefined : atomKind }, Date.now());
      setAtomId(next.atomId);
    }
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-background text-foreground">
      {film ? (
        <div className="fixed inset-0 z-0">
          <SessionFilmBackdrop
            url={media.url}
            active={running || runtime.status === "paused"}
            paused={!running}
          />
        </div>
      ) : null}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(circle at 50% 18%, hsl(${practice.hue} 82% 55% / 0.16), transparent 55%), radial-gradient(circle at 50% 100%, hsl(${practice.hue} 70% 45% / 0.08), transparent 45%)`,
        }}
      />

      <header className="relative z-10 mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 pb-2 pt-[calc(1rem+env(safe-area-inset-top))] sm:px-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border/40 bg-background/60 text-muted-foreground backdrop-blur transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </button>
        <div className="min-w-0 text-center">
          <p className="font-display text-[0.7rem] uppercase tracking-[0.24em] text-primary/70">Orb practice</p>
          <p className="truncate font-body text-[0.7rem] text-muted-foreground">
            {PRACTICE_BANK_STATS.size.toLocaleString()} practices · 1s → 12h
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTtsEnabled((value) => !value)}
            aria-pressed={ttsEnabled}
            aria-label={ttsEnabled ? "Mute the voice" : "Unmute the voice"}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
              ttsEnabled ? "border-primary/40 bg-primary/10 text-primary" : "border-border/40 bg-background/60 text-muted-foreground",
            )}
          >
            {ttsEnabled ? <Volume2 className="h-4 w-4" aria-hidden /> : <VolumeX className="h-4 w-4" aria-hidden />}
          </button>
          <button
            type="button"
            onClick={() => voiceSupported && setSttEnabled((value) => !value)}
            disabled={!voiceSupported}
            aria-pressed={sttEnabled}
            aria-label={voiceSupported ? (sttEnabled ? "Disable listening" : "Enable listening") : "Listening is not supported in this browser"}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-40",
              sttEnabled ? "border-primary/40 bg-primary/10 text-primary" : "border-border/40 bg-background/60 text-muted-foreground",
            )}
          >
            <Mic className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-2 sm:px-6">
        <section className="relative">
          <div className="relative mx-auto w-[min(78vw,21rem)]">
            <Suspense
              fallback={
                <div
                  className="aspect-square w-full rounded-full"
                  style={{
                    background: `radial-gradient(circle at 40% 35%, ${palette[3]} 0%, ${palette[2]} 42%, ${palette[1]} 72%, ${palette[0]} 100%)`,
                    boxShadow: `0 0 90px hsl(${practice.hue} 90% 55% / 0.35)`,
                  }}
                />
              }
            >
              <ConsciousnessOrb
                palette={palette}
                breathSeconds={runtime.breathSeconds}
                stateCharge={0.3 + runtime.progress * 0.55}
                colorShift={running ? 1 : 0.35}
                ariaLabel={`${practice.title}. ${running ? "Tap to pause" : "Tap to begin"} this ${formatPracticeDuration(practice.durationSec)} practice.`}
                onActivate={() => (running ? runtime.pause() : runtime.start())}
              />
            </Suspense>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-1">
              <p className="font-display text-2xl font-semibold tabular-nums tracking-tight text-foreground/90 drop-shadow">
                {clock(runtime.remainingSec)}
              </p>
              <p className="font-body text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                {runtime.status === "paused" ? "paused" : running ? runtime.beat?.title ?? "practice" : "ready"}
              </p>
            </div>
          </div>

          <div className="mt-5 text-center">
            <h1 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {practice.title}
            </h1>
            <p className="mt-1 font-body text-[0.8rem] text-muted-foreground">
              {practice.subtitle} · {practice.worldName} · {practice.voiceLabel}
            </p>
          </div>

          <div className="mt-4 rounded-3xl border border-border/40 bg-background/55 px-5 py-4 text-center backdrop-blur-xl">
            <p className="min-h-[3.25rem] font-body text-[0.95rem] leading-relaxed text-foreground/90">
              {beatText ?? "Stay with what is actually here."}
            </p>
            <p className="mt-2 text-[0.62rem] uppercase tracking-[0.24em] text-primary/60">
              {runtime.beat?.title ?? "ready"} · {practice.breathLabel} · {practice.beats.length} beats
            </p>
          </div>
        </section>

        <section className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => (running ? runtime.pause() : runtime.start())}
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/12 px-6 py-3 font-display text-sm text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            {running ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
            {running ? "Pause" : runtime.status === "paused" ? "Resume" : "Begin"}
          </button>
          <button
            type="button"
            onClick={() => runtime.stop()}
            className="inline-flex items-center gap-2 rounded-full border border-border/40 px-4 py-3 font-body text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <Square className="h-3.5 w-3.5" aria-hidden /> End
          </button>
          <button
            type="button"
            onClick={() => runtime.reset()}
            className="inline-flex items-center gap-2 rounded-full border border-border/40 px-4 py-3 font-body text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset
          </button>
          <button
            type="button"
            onClick={shuffle}
            className="inline-flex items-center gap-2 rounded-full border border-border/40 px-4 py-3 font-body text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <Shuffle className="h-3.5 w-3.5" aria-hidden /> Next
          </button>
        </section>

        {practice.listens ? (
          <section className="rounded-2xl border border-border/40 bg-background/50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-display text-xs uppercase tracking-[0.2em] text-primary/70">Voice inquiry</p>
                <p className="mt-1 font-body text-[0.8rem] text-muted-foreground">
                  {runtime.beat?.listenPrompt ?? "A voice prompt arrives when the orb asks."}
                </p>
              </div>
              <button
                type="button"
                onClick={runtime.listenNow}
                disabled={!runtime.beat?.listenPrompt || runtime.listening}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-4 py-2 font-body text-xs text-primary transition-colors hover:bg-primary/20 disabled:opacity-40"
              >
                <Mic className="h-3.5 w-3.5" aria-hidden />
                {runtime.listening ? "Listening…" : "Speak"}
              </button>
            </div>
            {runtime.transcripts.length ? (
              <ul className="mt-3 space-y-1.5">
                {runtime.transcripts.map((entry, index) => (
                  <li key={`${entry.beatId}-${index}`} className="font-body text-[0.78rem] text-foreground/80">
                    <span className="text-muted-foreground">{clock(entry.atSec)} · </span>
                    {entry.text}
                  </li>
                ))}
              </ul>
            ) : null}
            <label className="mt-3 flex items-center justify-between gap-3 border-t border-border/30 pt-3">
              <span className="font-body text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                Speech engine
              </span>
              <select
                value={sttEngine}
                onChange={(event) => setSttEngine(event.target.value as ListenEngine)}
                disabled={!deepgramSupported}
                className="rounded-xl border border-border/40 bg-background/70 px-3 py-1.5 font-body text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50"
              >
                <option value="auto">Deepgram → browser</option>
                <option value="deepgram">Deepgram Nova-3</option>
                <option value="browser">Browser (local)</option>
              </select>
            </label>
          </section>
        ) : null}

        <section className="rounded-3xl border border-border/40 bg-background/45 p-4 backdrop-blur-xl sm:p-5">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 font-body text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              Layers
            </span>
            {(
              [
                { id: "film", label: `Film · ${media.label}`, icon: Film, on: film, set: setFilm },
                { id: "ambience", label: "Ambience", icon: Waves, on: ambience, set: setAmbience },
                { id: "haptics", label: "Haptics", icon: Vibrate, on: haptics, set: setHaptics },
              ] as const
            ).map((layer) => (
              <button
                key={layer.id}
                type="button"
                onClick={() => layer.set((value) => !value)}
                aria-pressed={layer.on}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-body text-[0.68rem] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                  layer.on
                    ? "border-primary/40 bg-primary/12 text-primary"
                    : "border-border/40 text-muted-foreground hover:text-foreground",
                )}
              >
                <layer.icon className="h-3 w-3" aria-hidden />
                {layer.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 font-display text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <Clock className="h-3.5 w-3.5" aria-hidden /> Time
            </p>
            <p className="font-display text-sm text-primary">
              {duration.label} <span className="text-muted-foreground">· {duration.band}</span>
            </p>
          </div>

          <input
            type="range"
            min={0}
            max={DURATION_SLOTS.length - 1}
            step={1}
            value={durationIndex}
            onChange={(event) => setDurationIndex(Number(event.target.value))}
            aria-label="Practice duration, from one second to twelve hours"
            className="mt-3 w-full accent-[hsl(var(--primary))]"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {QUICK_DURATIONS.map((seconds) => (
              <button
                key={seconds}
                type="button"
                onClick={() => setDurationIndex(nearestDurationSlot(seconds))}
                className={cn(
                  "rounded-full border px-3 py-1.5 font-body text-[0.68rem] transition-colors",
                  duration.seconds === seconds
                    ? "border-primary/45 bg-primary/12 text-primary"
                    : "border-border/40 text-muted-foreground hover:text-foreground",
                )}
              >
                {formatPracticeDuration(seconds)}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block font-body text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                Delivery
              </span>
              <select
                value={modeId}
                onChange={(event) => setModeId(event.target.value as DeliveryModeId)}
                className="w-full rounded-xl border border-border/40 bg-background/70 px-3 py-2 font-body text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                {DELIVERY_MODES.map((mode) => (
                  <option key={mode.id} value={mode.id}>
                    {mode.label} — {mode.hint}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block font-body text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                Voice
              </span>
              <select
                value={voiceId}
                onChange={(event) => setVoiceId(event.target.value as VoiceId)}
                className="w-full rounded-xl border border-border/40 bg-background/70 px-3 py-2 font-body text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                {VOICES.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.label} — {voice.hint}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block font-body text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                World
              </span>
              <select
                value={worldId}
                onChange={(event) => setWorldId(event.target.value as WorldId)}
                className="w-full rounded-xl border border-border/40 bg-background/70 px-3 py-2 font-body text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                {PRACTICE_WORLDS.map((world) => (
                  <option key={world.id} value={world.id}>
                    {world.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block font-body text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                Depth · L{level}
              </span>
              <input
                type="range"
                min={1}
                max={7}
                step={1}
                value={level}
                onChange={(event) => setLevel(Number(event.target.value))}
                aria-label="Practice depth level"
                className="mt-2 w-full accent-[hsl(var(--primary))]"
              />
              <div className="flex justify-between font-body text-[0.6rem] text-muted-foreground">
                {ORB_LEVELS.map((entry) => (
                  <span key={entry}>{entry}</span>
                ))}
              </div>
            </label>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="block">
              <span className="mb-1 block font-body text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                Practice
              </span>
              <select
                value={atomId}
                onChange={(event) => setAtomId(event.target.value)}
                className="w-full rounded-xl border border-border/40 bg-background/70 px-3 py-2 font-body text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <option value="auto">Choose from my metrics</option>
                {atoms.map((atom) => (
                  <option key={atom.id} value={atom.id}>
                    {atom.title} · {String(atom.category).replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:w-36">
              <span className="mb-1 block font-body text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                Source
              </span>
              <select
                value={atomKind}
                onChange={(event) => {
                  setAtomKind(event.target.value as PracticeAtomKind | "all");
                  setAtomId("auto");
                }}
                className="w-full rounded-xl border border-border/40 bg-background/70 px-3 py-2 font-body text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <option value="all">All</option>
                <option value="framework">Frameworks</option>
                <option value="technique">Techniques</option>
              </select>
            </label>
          </div>

          <p className="mt-4 font-body text-[0.7rem] leading-relaxed text-muted-foreground/80">
            <Sparkles className="mr-1 inline h-3 w-3" aria-hidden />
            {practice.why}
          </p>
        </section>

        {complete ? (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-primary/30 bg-primary/8 p-5 text-center"
          >
            <p className="font-display text-lg text-foreground">Sitting complete</p>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              {formatPracticeDuration(practice.durationSec)} · {practice.beats.length} beats
              {runtime.transcripts.length ? ` · ${runtime.transcripts.length} voice note(s)` : ""}
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  runtime.reset();
                  runtime.start();
                }}
                className="rounded-full border border-primary/40 bg-primary/12 px-5 py-2.5 font-body text-sm text-primary hover:bg-primary/20"
              >
                Sit again
              </button>
              <button
                type="button"
                onClick={() => {
                  shuffle();
                  runtime.reset();
                }}
                className="rounded-full border border-border/40 px-5 py-2.5 font-body text-sm text-muted-foreground hover:text-foreground"
              >
                Another practice
              </button>
            </div>
          </motion.section>
        ) : null}

        <p className="text-center font-body text-[0.62rem] leading-relaxed text-muted-foreground/60">
          Bank index {practice.spec.index.toLocaleString()} of {PRACTICE_BANK_STATS.size.toLocaleString()} ·{" "}
          {practice.atom.kind === "framework" ? "framework" : "technique"} ·{" "}
          {String(practice.atom.category).replace(/_/g, " ")}
        </p>
      </main>
    </div>
  );
}
