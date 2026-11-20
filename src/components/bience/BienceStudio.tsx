import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Moon,
  Pause,
  Play,
  SlidersHorizontal,
  Timer,
  Wind,
  X,
} from "lucide-react";

import BienceMixer from "./BienceMixer";
import BienceSlider from "./BienceSlider";
import BienceStage from "./BienceStage";
import WorldArt from "./WorldArt";
import { sleepLabel, useBienceStudio } from "@/hooks/useBienceStudio";
import {
  BREATH_PATTERNS,
  SLEEP_OPTIONS,
  WORLDS,
  noteForFrequency,
  type SleepMinutes,
  type WorldId,
} from "@/lib/bience/model";
import { hsla as hslaSafe } from "@/lib/bience/visuals";

function popoverClass() {
  return "absolute right-0 top-[calc(100%+0.5rem)] z-40 w-48 overflow-hidden rounded-2xl border border-white/10 bg-[#100d09]/95 p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl";
}

function breathScale(phase: string, progress: number): number {
  if (phase === "inhale") return 0.86 + progress * 0.28;
  if (phase === "hold") return 1.14;
  if (phase === "exhale") return 1.14 - progress * 0.28;
  return 0.86;
}

export default function BienceStudio() {
  const studio = useBienceStudio();
  const navigate = useNavigate();
  const [timerOpen, setTimerOpen] = useState(false);
  const [breathOpen, setBreathOpen] = useState(false);
  const [mixerOpen, setMixerOpen] = useState(false);
  const [masterBeforeMute, setMasterBeforeMute] = useState(0.82);
  const hintTimer = useRef<number | null>(null);
  const [hint, setHint] = useState(true);

  const { world, mix, levels, breath, breathOn, playing, supported } = studio;
  const accent = world.palette[3];
  const accentColor = hslaSafe(accent, 1);
  const glow = hslaSafe(accent, 0.35);

  useEffect(() => {
    const previous = document.title;
    document.title = `${world.name} · Bience`;
    return () => {
      document.title = previous;
    };
  }, [world.name]);

  useEffect(() => {
    hintTimer.current = window.setTimeout(() => setHint(false), 9000);
    return () => {
      if (hintTimer.current) window.clearTimeout(hintTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `${world.name} · Bience`,
        artist: "ConsciousOS",
        album: "Ambient worlds",
      });
      navigator.mediaSession.setActionHandler("play", () => studio.toggle());
      navigator.mediaSession.setActionHandler("pause", () => studio.stop());
    } catch {
      /* unsupported media session */
    }
    return () => {
      try {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
      } catch {
        /* ignore */
      }
    };
  }, [studio, world.name]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT")) {
        return;
      }
      if (event.code === "Space") {
        event.preventDefault();
        studio.toggle();
        setHint(false);
        return;
      }
      if (event.key === "Escape") {
        setMixerOpen(false);
        setTimerOpen(false);
        setBreathOpen(false);
        return;
      }
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        const delta = event.key === "ArrowUp" ? 0.05 : -0.05;
        studio.setMaster(Math.min(1, Math.max(0, mix.master + delta)));
        return;
      }
      if (event.key === "m" || event.key === "M") {
        if (mix.master > 0.01) {
          setMasterBeforeMute(mix.master);
          studio.setMaster(0);
        } else {
          studio.setMaster(masterBeforeMute || 0.82);
        }
        return;
      }
      if (event.key === "b" || event.key === "B") {
        studio.setBreathOn(!breathOn);
        return;
      }
      const worldIndex = Number(event.key);
      if (Number.isInteger(worldIndex) && worldIndex >= 1 && worldIndex <= WORLDS.length) {
        studio.selectWorld(WORLDS[worldIndex - 1].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [studio, mix.master, masterBeforeMute, breathOn]);

  const scale = breathOn ? breathScale(breath.phase, breath.progress) : 1;
  const activeCount = studio.active.length;
  const worlds = useMemo(() => WORLDS, []);
  const worldIndex = Math.max(0, WORLDS.findIndex((item) => item.id === world.id)) + 1;

  const mixer = (
    <BienceMixer
      levels={levels}
      reverb={mix.reverb}
      onLayer={studio.setLayer}
      onReverb={studio.setReverb}
      onRestore={studio.restoreWorld}
      onSilence={studio.muteAll}
      evolve={studio.evolve}
      onEvolve={studio.setEvolve}
    />
  );

  return (
    <div
      className="relative h-[100dvh] w-full overflow-hidden bg-[#060504] text-foreground"
      style={{ ["--bience-accent" as string]: accentColor }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{ background: "linear-gradient(180deg, rgba(4,3,2,0.72), transparent)" }}
      />

      <div className="relative z-10 flex h-full flex-col">
        <header className="flex items-center justify-between gap-3 px-3 py-3 sm:px-7 sm:py-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="glass-1 flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              aria-label="Leave Bience"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="leading-none">
              <div className="flex items-baseline gap-2">
                <span
                  aria-hidden
                  className="mb-[3px] inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: accentColor, boxShadow: `0 0 12px ${glow}` }}
                />
                <span className="text-[11px] font-semibold uppercase tracking-[0.42em] text-foreground/90">
                  Bience
                </span>
              </div>
              <p className="mt-1 text-[10px] uppercase tracking-[0.26em] text-muted-foreground/60">
                Ambient worlds
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setTimerOpen((open) => !open);
                  setBreathOpen(false);
                }}
                aria-expanded={timerOpen}
                className="glass-1 flex h-10 items-center gap-2 rounded-full px-3 text-[12px] text-foreground/75 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                {studio.sleep > 0 && playing ? <Timer className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                <span className="hidden tabular-nums sm:inline">
                  {studio.sleep > 0 && studio.remaining > 0
                    ? sleepLabel(studio.sleep, studio.remaining)
                    : "Sleep timer"}
                </span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
              <AnimatePresence>
                {timerOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setTimerOpen(false)} aria-hidden />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className={popoverClass()}
                      role="menu"
                      aria-label="Sleep timer"
                    >
                      <p className="px-2 pt-1.5 pb-1 text-[9px] uppercase tracking-[0.28em] text-muted-foreground/60">
                        Fade out after
                      </p>
                      {SLEEP_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          role="menuitemradio"
                          aria-checked={studio.sleep === option}
                          onClick={() => {
                            studio.setSleep(option as SleepMinutes);
                            setTimerOpen(false);
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-[13px] text-foreground/80 transition-colors hover:bg-white/[0.06]"
                        >
                          <span>{option === 0 ? "No timer" : `${option} minutes`}</span>
                          {studio.sleep === option && <Check className="h-3.5 w-3.5 text-primary" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setBreathOpen((open) => !open);
                  setTimerOpen(false);
                }}
                aria-expanded={breathOpen}
                className="glass-1 flex h-10 items-center gap-2 rounded-full px-3 text-[12px] text-foreground/75 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <Wind className="h-3.5 w-3.5" />
                <span className="hidden md:inline">{breathOn ? breath.label : "Breath off"}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
              <AnimatePresence>
                {breathOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setBreathOpen(false)} aria-hidden />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className={popoverClass()}
                      role="menu"
                      aria-label="Breath guide"
                    >
                      <button
                        type="button"
                        role="menuitemcheckbox"
                        aria-checked={breathOn}
                        onClick={() => studio.setBreathOn(!breathOn)}
                        className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-[13px] text-foreground/80 transition-colors hover:bg-white/[0.06]"
                      >
                        <span>Guide breathing</span>
                        {breathOn && <Check className="h-3.5 w-3.5 text-primary" />}
                      </button>
                      <p className="px-2.5 pt-2 pb-1 text-[9px] uppercase tracking-[0.28em] text-muted-foreground/60">
                        Pattern
                      </p>
                      {BREATH_PATTERNS.map((pattern) => (
                        <button
                          key={pattern.id}
                          type="button"
                          role="menuitemradio"
                          aria-checked={studio.breathPattern.id === pattern.id}
                          onClick={() => studio.setBreathPattern(pattern)}
                          className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-[13px] text-foreground/80 transition-colors hover:bg-white/[0.06]"
                        >
                          <span>{pattern.label}</span>
                          {studio.breathPattern.id === pattern.id && <Check className="h-3.5 w-3.5 text-primary" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden w-40 sm:block">
              <BienceSlider
                label="Master"
                value={mix.master}
                hue={accent[0]}
                onChange={studio.setMaster}
                compact
              />
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <BienceStage world={world} engine={studio.engine} playing={playing} breath={breath.cycle} levels={levels} />
            <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-4 sm:px-8">
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[52vmin] w-[52vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[70px]"
                style={{ background: `radial-gradient(circle, ${hslaSafe(accent, 0.32)}, transparent 68%)` }}
                aria-hidden
              />

              <p className="mb-5 flex items-center gap-3 text-[9px] uppercase tracking-[0.36em] text-foreground/35">
                <span className="h-px w-8 bg-gradient-to-r from-transparent to-foreground/30" />
                World {String(worldIndex).padStart(2, "0")}
                <span className="text-foreground/20">/ {String(WORLDS.length).padStart(2, "0")}</span>
                <span className="h-px w-8 bg-gradient-to-l from-transparent to-foreground/30" />
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="glass-1 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground/65">
                  {noteForFrequency(world.root)}
                </span>
                <span className="glass-1 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground/65">
                  {activeCount} {activeCount === 1 ? "layer" : "layers"} live
                </span>
                <span className="glass-1 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground/65">
                  Room {Math.round(mix.reverb * 100)}%
                </span>
              </div>

              <motion.h1
                key={world.id}
                initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6 max-w-[18ch] text-balance text-center font-[var(--font-display,inherit)] text-[clamp(2.6rem,7vw,5.4rem)] font-light leading-[0.95] tracking-[-0.02em] text-foreground"
                style={{ textShadow: `0 0 60px ${hslaSafe(accent, 0.25)}` }}
              >
                {world.name}
              </motion.h1>
              <p className="mt-3 max-w-[42ch] text-center text-[13px] leading-relaxed text-muted-foreground sm:text-[15px]">
                {world.subtitle}
              </p>

              <div className="relative mt-10 flex h-40 w-40 items-center justify-center sm:mt-12">
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full border"
                  style={{
                    borderColor: hslaSafe(accent, 0.18),
                    transform: `scale(${Math.min(1.35, scale)})`,
                    transition: "transform 220ms linear, border-color 320ms ease",
                    boxShadow: `0 0 60px ${hslaSafe(accent, 0.12)} inset`,
                  }}
                />
                <span
                  aria-hidden
                  className="absolute inset-5 rounded-full border"
                  style={{
                    borderColor: hslaSafe(accent, playing ? 0.32 : 0.12),
                    transform: `scale(${scale})`,
                    transition: "transform 220ms linear, border-color 320ms ease",
                  }}
                />
                <span
                  aria-hidden
                  className="absolute inset-10 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${hslaSafe(accent, playing ? 0.18 : 0.06)}, transparent 70%)`,
                    transform: `scale(${scale})`,
                    transition: "transform 220ms linear",
                  }}
                />
                {playing && breathOn && (
                  <span
                    aria-hidden
                    className="absolute inset-[14px] rounded-full transition-opacity duration-500"
                    style={{
                      background: `conic-gradient(from -90deg, ${hslaSafe(accent, 0.7)} ${breath.cycle * 360}deg, transparent 0)`,
                      WebkitMaskImage: "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))",
                      maskImage: "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))",
                    }}
                  />
                )}
                <button
                  type="button"
                  onClick={studio.toggle}
                  disabled={!supported}
                  aria-label={playing ? "Pause ambience" : "Begin ambience"}
                  className="glass-2 relative z-10 flex h-[70px] w-[70px] items-center justify-center rounded-full text-foreground transition-transform duration-300 hover:scale-[1.04] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ boxShadow: playing ? `0 0 44px ${hslaSafe(accent, 0.35)}` : undefined }}
                >
                  {playing ? (
                    <Pause className="h-6 w-6" fill="currentColor" strokeWidth={0} />
                  ) : (
                    <Play className="ml-1 h-6 w-6" fill="currentColor" strokeWidth={0} />
                  )}
                </button>
              </div>

              <div className="mt-4 flex min-h-[22px] items-center gap-2 text-center">
                {!supported ? (
                  <span className="text-[12px] text-muted-foreground">This device cannot play live audio.</span>
                ) : playing ? (
                  <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-foreground/55">
                    <span
                      className="inline-block h-1.5 w-1.5 animate-pulse rounded-full"
                      style={{ background: accentColor }}
                    />
                    {breathOn ? `${breath.label} · ${studio.breathPattern.label}` : "Listening"}
                  </span>
                ) : (
                  <span className="text-[11px] uppercase tracking-[0.24em] text-foreground/45">
                    Press play to open the room
                  </span>
                )}
              </div>
            </div>

            <div className="relative z-10 px-3 pb-20 sm:px-7 lg:pb-6">
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-[9px] uppercase tracking-[0.32em] text-muted-foreground/50">Worlds</p>
                <p className={`hidden text-[10px] text-muted-foreground/40 transition-opacity duration-700 sm:block ${hint ? "opacity-100" : "opacity-0"}`}>
                  Space to play · M to mute · 1–8 for worlds
                </p>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#0a0806] to-transparent" aria-hidden />
                <div className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {worlds.map((item, index) => {
                  const active = item.id === world.id && mix.source !== "custom";
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => studio.selectWorld(item.id as WorldId)}
                      className="group relative h-[92px] w-[216px] shrink-0 snap-start overflow-hidden rounded-2xl border text-left transition-all duration-500 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                      style={{
                        borderColor: active ? hslaSafe(item.palette[3], 0.5) : "rgba(255,255,255,0.08)",
                        boxShadow: active
                          ? `0 14px 34px -16px ${hslaSafe(item.palette[3], 0.55)}, inset 0 0 0 1px ${hslaSafe(item.palette[3], 0.2)}`
                          : "0 10px 24px -18px rgba(0,0,0,0.9)",
                      }}
                      aria-pressed={active}
                    >
                      <WorldArt world={item} dim={!active} />
                      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5" />
                      <span className="relative flex h-full flex-col justify-between p-3">
                        <span className="flex items-center justify-between">
                          <span className="text-[9px] uppercase tracking-[0.26em] text-white/55">
                            {String(index + 1).padStart(2, "0")} · {item.note.split(" · ")[0]}
                          </span>
                          {active ? (
                            <span
                              className="flex h-4 w-4 items-center justify-center rounded-full"
                              style={{ background: hslaSafe(item.palette[3], 0.95) }}
                            >
                              <Check className="h-2.5 w-2.5 text-black" strokeWidth={3} />
                            </span>
                          ) : (
                            <span className="h-1 w-1 rounded-full bg-white/25 transition-colors group-hover:bg-white/60" />
                          )}
                        </span>
                        <span>
                          <span className="block font-[var(--font-display,inherit)] text-[15px] leading-tight text-white/95">
                            {item.name}
                          </span>
                          <span className="mt-0.5 block truncate text-[10px] text-white/45">{item.subtitle}</span>
                        </span>
                      </span>
                    </button>
                  );
                })}
                </div>
              </div>
            </div>
          </main>

          <aside className="hidden w-[368px] shrink-0 py-4 pr-4 pl-1 lg:block">
            <div className="glass-1 flex h-full flex-col overflow-hidden rounded-[26px]">
              <div className="min-h-0 flex-1 overflow-y-auto px-2 py-4 [scrollbar-width:thin]">
                {mixer}
              </div>
              <div className="border-t border-white/[0.06] px-4 py-3">
                <p className="text-[10px] leading-relaxed text-muted-foreground/45">
                  Every sound is synthesised live in your browser. Nothing is streamed, downloaded or stored.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setMixerOpen(true)}
        className="glass-2 fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-20 flex items-center gap-2 rounded-full px-4 py-3 text-[12px] font-medium text-foreground/85 lg:hidden"
        aria-label="Open layer mixer"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Mix
        <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] tabular-nums">{activeCount}</span>
      </button>

      <AnimatePresence>
        {mixerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm lg:hidden"
              onClick={() => setMixerOpen(false)}
              aria-hidden
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[82dvh] overflow-hidden rounded-t-[28px] border-t border-white/10 bg-[#0b0906]/97 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Layer mixer"
            >
              <div className="flex items-center justify-between px-4 pt-3">
                <div className="mx-auto h-1 w-10 rounded-full bg-white/15" />
                <button
                  type="button"
                  onClick={() => setMixerOpen(false)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  aria-label="Close mixer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-[74dvh] overflow-y-auto px-3 pb-6 pt-2">{mixer}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
