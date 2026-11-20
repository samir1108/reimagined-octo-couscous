import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Volume2, VolumeX, Cloud, Waves, Wind, Sparkles, Moon, Cpu, Code2, Orbit, Mountain, Disc3, X, Settings, SlidersHorizontal, Flame, Droplets, CloudRain, Sunrise, Music } from "lucide-react";
import { Button } from "@/design-system";
import { Slider } from "@/design-system";
import { useSound } from "@/contexts/SoundContext";

/**
 * AmbientLayer
 * - Peaceful full-screen background visuals (CSS only, GPU-cheap)
 * - Procedural ambient audio via Web Audio API (no external assets, no network)
 *
 * Scenes:
 *   rain    â€” soft rain on dark window, blue-grey wash
 *   ocean   â€” slow ocean swell, deep teal
 *   forest  â€” mist + faint wind, mossy green
 *   night   â€” starfield, deep indigo, soft pad
 *   temple  â€” warm amber glow, gentle drone (default for sessions)
 */

export type AmbientScene =
  | "rain" | "ocean" | "forest" | "night" | "temple"
  | "tron" | "matrix" | "cosmos" | "zen" | "lofi"
  | "fire" | "cave" | "monsoon" | "dawn" | "satsang";

const STORAGE_KEY = "session-shell:ambient";

// Pre-computed film grain SVG data URL to avoid parser issues with inline /Â»
const FILM_GRAIN_SVG = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

interface Stored {
  scene: AmbientScene;
  volume: number; // 0..1
  muted: boolean;
}

function loadPrefs(): Stored {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { scene: "temple", volume: 0.5, muted: false, ...JSON.parse(raw) };
  } catch {}
  return { scene: "temple", volume: 0.5, muted: false };
}

function savePrefs(p: Stored) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {}
}

interface SceneMeta {
  id: AmbientScene;
  label: string;
  Icon: typeof Cloud;
  tagline: string;
  description: string;
  feel: string;
}

const SCENES: SceneMeta[] = [
  { id: "temple", label: "Temple",  Icon: Sparkles, tagline: "Warm sanctuary drone",
    description: "A golden room of resonance â€” D-minor bell harmonics breathing with a slow tanpura pulse.",
    feel: "Reverent Â· grounding Â· sacred" },
  { id: "rain",   label: "Rain",    Icon: Cloud,
    tagline: "Window in a winter storm",
    description: "Soft rain on glass with distant thunder rolls and a low blue pad. Built for thinking.",
    feel: "Cool Â· cleansing Â· introspective" },
  { id: "ocean",  label: "Ocean",   Icon: Waves,
    tagline: "Tide breathing under stars",
    description: "Slow 12-second swells, sub-bass undertow, far-off seabird shimmer.",
    feel: "Expansive Â· rhythmic Â· vast" },
  { id: "forest", label: "Forest",  Icon: Wind,
    tagline: "Pre-dawn canopy",
    description: "Mist, distant bird calls, a wooden flute drone weaving through leaves.",
    feel: "Alive Â· earthy Â· soft" },
  { id: "night",  label: "Night",   Icon: Moon,
    tagline: "Deep starfield pad",
    description: "Slow indigo pads, crickets, an owl in the distance â€” the universe exhaling.",
    feel: "Quiet Â· still Â· cosmic" },
  { id: "tron",   label: "Tron",    Icon: Cpu,
    tagline: "Inside the grid",
    description: "Daft-Punk inspired synthwave: pulsing sub-bass, glassy saw arpeggio, neon hi-hat ticks.",
    feel: "Electric Â· focused Â· cinematic" },
  { id: "matrix", label: "Matrix",  Icon: Code2,
    tagline: "Digital rain falls",
    description: "Dark cinematic drone, glitched code ticks, that low 'red pill' brass swell.",
    feel: "Intense Â· mysterious Â· awake" },
  { id: "cosmos", label: "Cosmos",  Icon: Orbit,
    tagline: "Voyager passing Saturn",
    description: "Deep space pad, slow shimmer bells, distant pulsar clicks â€” Hans Zimmer's INTERSTELLAR feel.",
    feel: "Wonder Â· weightless Â· infinite" },
  { id: "zen",    label: "Zen",     Icon: Mountain,
    tagline: "Kyoto temple at dusk",
    description: "Shakuhachi flute, occasional singing bowl strike, bamboo wind. Pure stillness.",
    feel: "Empty Â· luminous Â· present" },
  { id: "lofi",   label: "Lo-Fi",   Icon: Disc3,
    tagline: "3am study session",
    description: "Warm Rhodes chord cycle (Cmaj7 â†’ Am7 â†’ Dm7 â†’ G7), tape hiss, soft vinyl crackle.",
    feel: "Cozy Â· nostalgic Â· easy" },
  { id: "fire",   label: "Fire",    Icon: Flame,
    tagline: "Hearth at midnight",
    description: "A low fire in a quiet room: soft roar, dry crackle, warm sub-bass and the occasional flare.",
    feel: "Warm Â· sheltered Â· alive" },
  { id: "cave",   label: "Cave",    Icon: Droplets,
    tagline: "Water in deep stone",
    description: "Dripping water, a resonant sub drone and a far wind moving through the chamber mouth.",
    feel: "Vast Â· cool Â· still" },
  { id: "monsoon", label: "Monsoon", Icon: CloudRain,
    tagline: "Rain on the whole city",
    description: "Sheets of rain, gusting wind and rolling thunder far out past the rooftops.",
    feel: "Heavy Â· cleansing Â· enclosed" },
  { id: "dawn",   label: "Dawn",    Icon: Sunrise,
    tagline: "First light, first birds",
    description: "A slow warm pad with waking birdsong and a distant temple chime as the sky opens.",
    feel: "Fresh Â· tender Â· beginning" },
  { id: "satsang", label: "Satsang", Icon: Music,
    tagline: "Tanpura and harmonium",
    description: "A slow tanpura cycle, a breathing harmonium drone and a bowl that marks the silence.",
    feel: "Devotional Â· grounded Â· open" },
];

interface AmbientLayerProps {
  /** External AudioContext to share (from SoundContext) */
  audioContext?: AudioContext | null;
  /** Whether to show the floating control panel */
  showControls?: boolean;
  /** Initial scene override */
  initialScene?: AmbientScene;
  /** Initial volume override */
  initialVolume?: number;
  /** Initial mute override */
  initialMuted?: boolean;
  /** Callback when scene changes */
  onSceneChange?: (scene: AmbientScene) => void;
  /** Callback when volume changes */
  onVolumeChange?: (volume: number) => void;
  /** Callback when mute changes */
  onMuteChange?: (muted: boolean) => void;
}

export function AmbientLayer({
  audioContext,
  showControls = true,
  initialScene,
  initialVolume,
  initialMuted,
  onSceneChange,
  onVolumeChange,
  onMuteChange,
}: AmbientLayerProps) {
  const { soundEnabled, playSound } = useSound();
  const [prefs, setPrefs] = useState<Stored>(() => {
    const loaded = loadPrefs();
    return {
      scene: initialScene ?? loaded.scene,
      volume: initialVolume ?? loaded.volume,
      muted: initialMuted ?? loaded.muted,
    };
  });
  const [open, setOpen] = useState(false);
  const [audioState, setAudioState] = useState<string>("uninitialized");
  const [isDark, setIsDark] = useState(
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : true,
  );
  const ctxRef = useRef<AudioContext | null>(audioContext ?? null);
  const masterRef = useRef<GainNode | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains("dark"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // Sync audioContext from props
  useEffect(() => {
    // Only adopt the shared context before we start our own; mixing a
    // GainNode from one context into another breaks scene wiring.
    if (audioContext && !initializedRef.current) {
      ctxRef.current = audioContext;
      if (!masterRef.current) {
        masterRef.current = audioContext.createGain();
        masterRef.current.gain.value = 0;
        masterRef.current.connect(audioContext.destination);
      }
      if (audioContext.state === "suspended") {
        audioContext.resume().catch(() => {});
      }
    }
  }, [audioContext]);

  useEffect(() => { savePrefs(prefs); }, [prefs]);

  const prefsRef = useRef(prefs);
  useEffect(() => { prefsRef.current = prefs; }, [prefs]);

  // Audio engine â€” builds the procedural scene into the master gain
  const startAudio = useCallback(() => {
    let ctx = ctxRef.current;
    if (!ctx) {
      if (typeof window === "undefined") return;
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      ctx = new Ctor();
      ctxRef.current = ctx;
    }
    if (ctx.state === "suspended" || (ctx.state as string) === "interrupted") {
      ctx.resume().then(() => setAudioState(ctx.state)).catch(() => {});
    }
    ctx.onstatechange = () => setAudioState(ctx.state);
    setAudioState(ctx.state);
    if (!masterRef.current) {
      masterRef.current = ctx.createGain();
      masterRef.current.gain.value = 0;
      masterRef.current.connect(ctx.destination);
    }
    const master = masterRef.current;
    const current = prefsRef.current;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.linearRampToValueAtTime(
      current.muted ? 0 : Math.min(1, Math.max(0, current.volume) * 1.5),
      now + 0.4,
    );
    // Tear down previous scene and rebuild the current one
    stopRef.current?.();
    stopRef.current = null;
    stopRef.current = buildScene(ctx, master, current.scene);
  }, []);

  const stopAudio = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
  }, []);

  // Volume control
  useEffect(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.linearRampToValueAtTime(prefs.muted ? 0 : Math.min(1, Math.max(0, prefs.volume) * 1.5), now + 0.4);
  }, [prefs.volume, prefs.muted]);

  // Initialize / unlock audio on any gesture. The listeners stay attached:
  // mobile browsers suspend the context freely, and the next tap must revive it.
  const initAudio = useCallback(() => {
    const ctx = ctxRef.current;
    if (initializedRef.current && ctx?.state === "running" && stopRef.current) return;
    initializedRef.current = true;
    startAudio();
  }, [startAudio]);

  useEffect(() => {
    const onGesture = () => initAudio();
    window.addEventListener("pointerdown", onGesture, { passive: true });
    window.addEventListener("keydown", onGesture);
    window.addEventListener("touchstart", onGesture, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      window.removeEventListener("touchstart", onGesture);
    };
  }, [initAudio]);

  // Rebuild the audio scene whenever the selected scene changes.
  useEffect(() => {
    if (!initializedRef.current) return;
    startAudio();
  }, [prefs.scene, startAudio]);

  // Scene change callback — choosing a theme is intent to hear it.
  const handleSceneChange = useCallback((scene: AmbientScene) => {
    initAudio();
    setPrefs(p => ({ ...p, scene, muted: false }));
    onSceneChange?.(scene);
  }, [initAudio, onSceneChange]);

  const handleVolumeChange = useCallback((volume: number) => {
    initAudio();
    setPrefs(p => ({ ...p, volume, muted: false }));
    onVolumeChange?.(volume);
  }, [initAudio, onVolumeChange]);

  const handleMuteChange = useCallback((muted: boolean) => {
    initAudio();
    setPrefs(p => ({ ...p, muted }));
    onMuteChange?.(muted);
  }, [initAudio, onMuteChange]);

  return (
    <>
      {/* Visual layer â€” sits behind all step content */}
      <SceneVisual scene={prefs.scene} />

      {/* Floating control â€” top right, very subtle */}
      {showControls && (
        <div
          className="pointer-events-auto fixed top-20 right-4 flex flex-col items-end gap-2 isolate"
          style={{ zIndex: 2147483600 }}
        >
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleMuteChange(!prefs.muted); }}
              className="relative h-12 w-12 inline-flex items-center justify-center rounded-full bg-background/80 backdrop-blur-md hover:bg-background hover:scale-105 active:scale-95 shadow-lg ring-1 ring-border/40 text-foreground transition pointer-events-auto"
              aria-label={prefs.muted ? "Unmute ambience" : "Mute ambience"}
              aria-pressed={prefs.muted}
            >
              {prefs.muted ? <VolumeX className="h-5 w-5 pointer-events-none" /> : <Volume2 className="h-5 w-5 pointer-events-none" />}
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
              className="flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-[10px] tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground hover:bg-background/90 shadow ring-1 ring-border/40 transition pointer-events-auto"
              aria-label="Ambience scenes"
            >
              <span
                className={
                  "h-1.5 w-1.5 rounded-full " +
                  (prefs.muted
                    ? "bg-muted-foreground/50"
                    : audioState === "running"
                      ? "bg-emerald-400 animate-pulse"
                      : "bg-amber-400")
                }
              />
              Scene
            </button>
          </div>
          {open && (
            <div className="w-[19rem] max-h-[70vh] overflow-y-auto rounded-2xl border border-border/40 bg-background/90 p-3 shadow-2xl backdrop-blur-xl animate-fade-in">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Ambience · {SCENES.length} themes
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-lg hover:bg-muted/40 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {/* Audio state — never leave the sitter guessing whether it plays */}
              <div className="mb-2 flex items-center justify-between rounded-lg bg-muted/25 px-2 py-1">
                <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                  <span
                    className={
                      "h-1.5 w-1.5 rounded-full " +
                      (prefs.muted
                        ? "bg-amber-400/80"
                        : audioState === "running"
                          ? "bg-emerald-400 animate-pulse"
                          : "bg-muted-foreground/50")
                    }
                  />
                  {prefs.muted
                    ? "Muted"
                    : audioState === "running"
                      ? "Live · playing"
                      : "Tap a theme to start sound"}
                </span>
                {!prefs.muted && audioState !== "running" && (
                  <button
                    type="button"
                    onClick={() => handleVolumeChange(prefs.volume)}
                    className="text-[9px] uppercase tracking-[0.14em] text-primary/80 underline-offset-2 hover:underline"
                  >
                    Start
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1.5 mb-3">
                {SCENES.map(({ id, label, Icon }) => {
                  const active = prefs.scene === id;
                  return (
                    <button
                      key={id}
                      onClick={() => handleSceneChange(id)}
                      className={
                        "flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] transition " +
                        (active
                          ? "bg-primary/15 text-primary ring-1 ring-primary/40"
                          : "text-muted-foreground hover:bg-muted/40")
                      }
                      aria-label={label}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="truncate w-full text-center">{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active scene info card */}
              {(() => {
                const meta = SCENES.find((s) => s.id === prefs.scene);
                if (!meta) return null;
                const Icon = meta.Icon;
                return (
                  <div className="mb-3 rounded-xl border border-border/30 bg-muted/30 p-2.5">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                      <p className="text-[11px] font-medium tracking-wide">{meta.label}</p>
                    </div>
                    <p className="mt-1.5 text-[9px] uppercase tracking-[0.16em] text-muted-foreground/80">{meta.feel}</p>
                  </div>
                );
              })()}

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => handleMuteChange(!prefs.muted)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  aria-label={prefs.muted ? "Unmute" : "Mute"}
                >
                  {prefs.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <Slider
                  value={[Math.round(prefs.volume * 100)]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(v) => handleVolumeChange((v[0] ?? 0) / 100)}
                  className="flex-1"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// Expose ambient controls hook for external components
export function useAmbientControls() {
  const [prefs, setPrefs] = useState<Stored>(() => loadPrefs());
  
  const setScene = useCallback((scene: AmbientScene) => {
    setPrefs((prev) => {
      const next = { ...prev, scene };
      savePrefs(next);
      return next;
    });
  }, []);
  
  const setVolume = useCallback((volume: number) => {
    setPrefs((prev) => {
      const next = { ...prev, volume, muted: false };
      savePrefs(next);
      return next;
    });
  }, []);
  
  const setMuted = useCallback((muted: boolean) => {
    setPrefs((prev) => {
      const next = { ...prev, muted };
      savePrefs(next);
      return next;
    });
  }, []);
  
  return { prefs, setScene, setVolume, setMuted };
}

const SCENE_TINT: Record<AmbientScene, string> = {
  temple: "hsl(30 90% 55%)",
  rain: "hsl(210 80% 65%)",
  ocean: "hsl(195 80% 65%)",
  forest: "hsl(90 70% 60%)",
  night: "hsl(250 70% 70%)",
  tron: "hsl(190 100% 60%)",
  matrix: "hsl(130 90% 50%)",
  cosmos: "hsl(270 80% 70%)",
  zen: "hsl(20 60% 70%)",
  lofi: "hsl(35 60% 65%)",
  fire: "hsl(24 95% 60%)",
  cave: "hsl(200 45% 62%)",
  monsoon: "hsl(215 55% 62%)",
  dawn: "hsl(35 90% 72%)",
  satsang: "hsl(42 85% 64%)",
};

function SceneVisual({ scene }: { scene: AmbientScene }) {
  const tint = SCENE_TINT[scene] ?? SCENE_TINT.temple;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {scene === "rain"   && <RainScene />}
      {scene === "ocean"  && <OceanScene />}
      {scene === "forest" && <ForestScene />}
      {scene === "night"  && <NightScene />}
      {scene === "temple" && <TempleScene />}
      {scene === "tron"   && <TronScene />}
      {scene === "matrix" && <MatrixScene />}
      {scene === "cosmos" && <CosmosScene />}
      {scene === "zen"    && <ZenScene />}
      {scene === "lofi"   && <LofiScene />}
      {scene === "fire"   && <FireScene />}
      {scene === "cave"   && <CaveScene />}
      {scene === "monsoon" && <MonsoonScene />}
      {scene === "dawn"   && <DawnScene />}
      {scene === "satsang" && <SatsangScene />}
      <CinematicOverlay tint={tint} />
    </div>
  );
}

 
// TEMPORARILY COMMENTED OUT FOR DEBUGGING
// /* ============================================================
//    VISUALS â€” pure CSS / SVG, GPU-friendly
//    ============================================================ */
// 
// function SceneVisual({ scene }: { scene: AmbientScene }) {
//   const tint =
//     scene === "temple" ? "hsl(30 90% 55%)"
//     : scene === "rain" ? "hsl(210 80% 65%)"
//     : scene === "ocean" ? "hsl(195 80% 65%)"
//     : scene === "forest" ? "hsl(90 70% 60%)"
//     : scene === "night" ? "hsl(250 70% 70%)"
//     : scene === "tron" ? "hsl(190 100% 60%)"
//     : scene === "matrix" ? "hsl(130 90% 50%)"
//     : scene === "cosmos" ? "hsl(270 80% 70%)"
//     : scene === "zen" ? "hsl(20 60% 70%)"
//     : scene === "lofi" ? "hsl(35 60% 65%)"
//     : "hsl(250 70% 70%)";
//   return (
//     <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
//       {scene === "rain"   && <RainScene />}
//       {scene === "ocean"  && <OceanScene />}
//       {scene === "forest" && <ForestScene />}
//       {scene === "night"  && <NightScene />}
//       {scene === "temple" && <TempleScene />}
//       {scene === "tron"   && <TronScene />}
//       {scene === "matrix" && <MatrixScene />}
//       {scene === "cosmos" && <CosmosScene />}
//       {scene === "zen"    && <ZenScene />}
//       {scene === "lofi"   && <LofiScene />}
//       <CinematicOverlay tint={tint} />
//     </div>
//   );
// }
// 
// ... rest of file commented out for debugging

/* ---------- CINEMATIC OVERLAY: grain + vignette + bloom + bokeh ----------
   A shared finishing pass that lifts every scene from "generic CSS" to
   feeling like a graded film frame. Pure CSS/SVG, GPU-cheap.
*/
function CinematicOverlay({ tint }: { tint: string }) {
  const tintAlpha = (a: number) => tint.replace(")", " / " + a + ")");
  const bokeh = useMemo(
    () =>
      Array.from({ length: 14 }).map(() => ({
        left: Math.random() * 100,
        top: 20 + Math.random() * 70,
        size: 40 + Math.random() * 90,
        delay: Math.random() * 18,
        duration: 22 + Math.random() * 22,
        drift: (Math.random() - 0.5) * 60,
      })),
    [],
  );
  return (
    <>
      {/* Soft floating bokeh â€” depth + life */}
      {bokeh.map((b, i) => (
        <span
          key={i}
          className="absolute block rounded-full mix-blend-screen"
          style={{
            left: `${b.left}%`,
            top: `${b.top}%`,
            width: b.size,
            height: b.size,
            background: `radial-gradient(circle, ${tintAlpha(0.18)} 0%, transparent 65%)`,
            filter: "blur(14px)",
            ['--bx' as any]: `${b.drift}px`,
            animation: `bokeh-drift ${b.duration}s ease-in-out ${b.delay}s infinite`,
          }}
        />
      ))}
      {/* Edge bloom â€” colored light leak from corners */}
      <div
        className="absolute inset-0 mix-blend-screen"
        style={{
          background:
            `radial-gradient(ellipse at 0% 100%, ${tintAlpha(0.16)}, transparent 45%),` +
            `radial-gradient(ellipse at 100% 0%, ${tintAlpha(0.10)}, transparent 50%)`,
          animation: "bloom-breathe 16s ease-in-out infinite",
        }}
      />
      {/* Deep cinematic vignette â€” pulls focus to center */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, hsl(0 0% 0% / 0.55) 95%)",
        }}
      />
      {/* Film grain â€” animated SVG turbulence */}
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage: FILM_GRAIN_SVG,
          animation: "grain-shift 1.6s steps(6) infinite",
        }}
      />
      <style>{`
        @keyframes bokeh-drift {
          0%,100% { transform: translate(0,0) scale(1); opacity: .35; }
          50%     { transform: translate(var(--bx), -40px) scale(1.15); opacity: .7; }
        }
        @keyframes bloom-breathe {
          0%,100% { opacity: .35; }
          50%     { opacity: .65; }
        }
        @keyframes grain-shift {
          0%   { transform: translate(0,0); }
          20%  { transform: translate(-3%, 2%); }
          40%  { transform: translate(2%, -3%); }
          60%  { transform: translate(-2%, 3%); }
          80%  { transform: translate(3%, -2%); }
          100% { transform: translate(0,0); }
        }
      `}</style>
    </>
  );
}

/* ---------- RAIN: layered parallax, mist, lightning, window glow ---------- */
function RainScene() {
  const layers = useMemo(() => {
    const make = (count: number, baseDur: number, opacity: number, len: string, width: string) =>
      Array.from({ length: count }).map(() => ({
        left: Math.random() * 110 - 5,
        delay: Math.random() * baseDur,
        duration: baseDur + Math.random() * 0.6,
        opacity: opacity * (0.6 + Math.random() * 0.6),
        len,
        width,
      }));
    return {
      far: make(40, 1.6, 0.18, "8vh", "1px"),
      mid: make(50, 1.0, 0.35, "14vh", "1px"),
      near: make(30, 0.55, 0.6, "22vh", "1.5px"),
    };
  }, []);
  const renderDrops = (drops: any[], blur = 0, tilt = 8) =>
    drops.map((d, i) => (
      <span
        key={i}
        className="absolute top-[-15%] block bg-gradient-to-b from-transparent via-sky-200/90 to-transparent"
        style={{
          left: `${d.left}%`,
          width: d.width,
          height: d.len,
          opacity: d.opacity,
          filter: blur ? `blur(${blur}px)` : undefined,
          transform: `rotate(${tilt}deg)`,
          animation: `rain-fall ${d.duration}s linear ${d.delay}s infinite`,
        }}
      />
    ));
  return (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(215_50%_14%),hsl(225_55%_4%))]">
      {/* Distant lightning glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 25%, hsl(210 80% 55% / 0.10), transparent 55%)",
          animation: "lightning 11s ease-out infinite",
        }}
      />
      {/* Soft window vignette */}
      <div
        className="absolute inset-0 mix-blend-screen opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 70% 80%, hsl(45 80% 60% / 0.18), transparent 45%)",
        }}
      />
      {/* Rain layers */}
      <div className="absolute inset-0">{renderDrops(layers.far, 1.5, 6)}</div>
      <div className="absolute inset-0">{renderDrops(layers.mid, 0.5, 8)}</div>
      <div className="absolute inset-0">{renderDrops(layers.near, 0, 10)}</div>
      {/* Ground mist */}
      <div
        className="absolute inset-x-0 bottom-0 h-[35%]"
        style={{
          background:
            "linear-gradient(to top, hsl(220 50% 8% / 0.85), hsl(220 50% 8% / 0.2) 60%, transparent)",
          animation: "mist-drift 14s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes rain-fall {0%{transform:translateY(-15vh) rotate(10deg)}100%{transform:translateY(125vh) rotate(10deg)}}
        @keyframes lightning {
          0%,89%,100%{opacity:.35}
          90%{opacity:1}
          91%{opacity:.55}
          92%{opacity:.95}
          94%{opacity:.4}
        }
        @keyframes mist-drift {0%,100%{transform:translateX(-2%)}50%{transform:translateX(2%)}}
      `}</style>
    </div>
  );
}

/* ---------- OCEAN: layered SVG waves, moon path, horizon ---------- */
function OceanScene() {
  return (
    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,hsl(220_55%_6%)_0%,hsl(210_60%_10%)_45%,hsl(195_55%_14%)_65%,hsl(190_50%_18%)_100%)]">
      {/* Stars above horizon */}
      <div className="absolute inset-x-0 top-0 h-[55%]"
        style={{
          background:
            "radial-gradient(2px 2px at 20% 20%, white, transparent), radial-gradient(1px 1px at 45% 35%, hsl(0 0% 90% / .8), transparent), radial-gradient(1.5px 1.5px at 75% 15%, white, transparent), radial-gradient(1px 1px at 88% 40%, hsl(0 0% 80% / .7), transparent)",
          opacity: 0.6,
        }}
      />
      {/* Moon */}
      <div
        className="absolute top-[18%] right-[22%] h-20 w-20 rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(45 70% 92%) 0%, hsl(40 60% 80%) 55%, transparent 75%)",
          boxShadow: "0 0 60px hsl(45 80% 75% / 0.55), 0 0 120px hsl(45 80% 70% / 0.3)",
        }}
      />
      {/* Moon path on water */}
      <div
        className="absolute left-[60%] top-[55%] h-[45%] w-[35%] -translate-x-1/2 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, hsl(45 80% 80% / 0.5), transparent 70%)",
          filter: "blur(8px)",
          animation: "moon-shimmer 6s ease-in-out infinite",
        }}
      />
      {/* SVG wave layers */}
      <svg className="absolute inset-x-0 bottom-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: "55%" }}>
        <defs>
          <linearGradient id="wave1" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(195 60% 22%)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="hsl(200 70% 8%)" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="wave2" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(190 55% 30%)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="hsl(195 60% 12%)" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="wave3" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(185 50% 38%)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="hsl(190 55% 18%)" stopOpacity="1" />
          </linearGradient>
        </defs>
        <path fill="url(#wave3)" style={{ animation: "wave-shift-a 14s ease-in-out infinite" }}
          d="M0,160 C240,200 480,120 720,160 C960,200 1200,120 1440,160 L1440,320 L0,320 Z" />
        <path fill="url(#wave2)" style={{ animation: "wave-shift-b 11s ease-in-out infinite" }}
          d="M0,200 C240,240 480,180 720,210 C960,240 1200,180 1440,210 L1440,320 L0,320 Z" />
        <path fill="url(#wave1)" style={{ animation: "wave-shift-a 9s ease-in-out -2s infinite" }}
          d="M0,240 C360,280 720,220 1080,250 C1260,265 1380,255 1440,250 L1440,320 L0,320 Z" />
      </svg>
      <style>{`
        @keyframes wave-shift-a {0%,100%{transform:translateX(0) translateY(0)}50%{transform:translateX(-2%) translateY(-1%)}}
        @keyframes wave-shift-b {0%,100%{transform:translateX(0)}50%{transform:translateX(2%)}}
        @keyframes moon-shimmer {0%,100%{opacity:.5;transform:translateX(-50%) scaleX(1)}50%{opacity:.75;transform:translateX(-50%) scaleX(1.08)}}
      `}</style>
    </div>
  );
}

/* ---------- FOREST: god-rays, tree silhouettes, fireflies, mist ---------- */
function ForestScene() {
  const fireflies = useMemo(
    () =>
      Array.from({ length: 22 }).map(() => ({
        left: Math.random() * 100,
        top: 30 + Math.random() * 60,
        delay: Math.random() * 6,
        duration: 4 + Math.random() * 5,
        size: 1.5 + Math.random() * 2,
      })),
    [],
  );
  return (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(150_40%_14%),hsl(155_55%_4%))]">
      {/* God rays */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-screen"
        style={{
          background:
            "conic-gradient(from 200deg at 35% -10%, transparent 0deg, hsl(80 60% 70% / 0.18) 8deg, transparent 16deg, transparent 30deg, hsl(80 60% 70% / 0.12) 38deg, transparent 46deg, transparent 60deg, hsl(80 60% 70% / 0.15) 68deg, transparent 76deg)",
          filter: "blur(8px)",
          animation: "ray-shift 22s ease-in-out infinite",
        }}
      />
      {/* Far tree silhouette */}
      <svg className="absolute inset-x-0 bottom-0 w-full opacity-70" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: "60%" }}>
        <path fill="hsl(150 50% 6%)" d="M0,260 L40,200 L80,240 L120,160 L160,220 L210,140 L260,210 L320,180 L380,120 L440,200 L500,170 L560,140 L620,210 L680,150 L740,200 L800,130 L860,190 L920,160 L980,210 L1040,140 L1100,200 L1160,170 L1220,130 L1280,200 L1340,160 L1400,210 L1440,180 L1440,320 L0,320 Z" />
      </svg>
      {/* Near tree silhouette */}
      <svg className="absolute inset-x-0 bottom-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: "45%" }}>
        <path fill="hsl(150 60% 3%)" d="M0,280 L60,180 L120,260 L180,150 L240,240 L320,170 L380,250 L460,140 L520,230 L600,180 L680,260 L760,150 L840,240 L920,170 L1000,250 L1080,150 L1160,230 L1240,180 L1320,260 L1400,180 L1440,240 L1440,320 L0,320 Z" />
      </svg>
      {/* Ground mist */}
      <div
        className="absolute inset-x-0 bottom-0 h-[40%] opacity-50"
        style={{
          background:
            "linear-gradient(to top, hsl(150 30% 18% / 0.7), transparent)",
          animation: "mist-drift 18s ease-in-out infinite",
        }}
      />
      {/* Fireflies */}
      {fireflies.map((f, i) => (
        <span
          key={i}
          className="absolute block rounded-full"
          style={{
            left: `${f.left}%`,
            top: `${f.top}%`,
            width: f.size,
            height: f.size,
            background: "hsl(70 90% 70%)",
            boxShadow: "0 0 6px hsl(70 90% 60%), 0 0 14px hsl(80 80% 50% / 0.6)",
            animation: `firefly ${f.duration}s ease-in-out ${f.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes ray-shift {0%,100%{transform:translateX(-2%)}50%{transform:translateX(3%)}}
        @keyframes firefly {
          0%,100%{opacity:0;transform:translate(0,0) scale(.8)}
          25%{opacity:.9}
          50%{opacity:.5;transform:translate(8px,-12px) scale(1.1)}
          75%{opacity:.85;transform:translate(-6px,-20px) scale(.95)}
        }
      `}</style>
    </div>
  );
}

/* ---------- NIGHT: starfield, milky way, shooting stars, aurora veil ---------- */
function NightScene() {
  const stars = useMemo(
    () =>
      Array.from({ length: 140 }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 1.8 + 0.3,
        delay: Math.random() * 5,
        duration: 2 + Math.random() * 5,
        hue: 200 + Math.random() * 60,
      })),
    [],
  );
  const shooting = useMemo(
    () =>
      Array.from({ length: 3 }).map((_, i) => ({
        top: 10 + i * 25 + Math.random() * 8,
        left: Math.random() * 60,
        delay: i * 6 + Math.random() * 4,
      })),
    [],
  );
  return (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(245_55%_8%),hsl(250_60%_3%))]">
      {/* Milky way band */}
      <div
        className="absolute inset-0 opacity-35 mix-blend-screen"
        style={{
          background:
            "linear-gradient(115deg, transparent 30%, hsl(260 60% 30% / 0.45) 45%, hsl(280 50% 35% / 0.5) 50%, hsl(220 60% 35% / 0.4) 55%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      {/* Nebula clouds */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-screen"
        style={{
          background:
            "radial-gradient(ellipse at 25% 40%, hsl(280 70% 45% / 0.4), transparent 45%), radial-gradient(ellipse at 75% 60%, hsl(200 70% 45% / 0.35), transparent 50%)",
          filter: "blur(30px)",
          animation: "nebula 28s ease-in-out infinite",
        }}
      />
      {/* Stars */}
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute block rounded-full"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            background: `hsl(${s.hue} 30% 95%)`,
            boxShadow: s.size > 1.2 ? `0 0 ${s.size * 3}px hsl(${s.hue} 40% 85% / 0.8)` : undefined,
            animation: `star-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
      {/* Shooting stars */}
      {shooting.map((s, i) => (
        <span
          key={i}
          className="absolute block h-px w-[140px] bg-gradient-to-r from-transparent via-white to-transparent"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            opacity: 0,
            transform: "rotate(-20deg)",
            animation: `shoot 14s ease-in ${s.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes star-twinkle {0%,100%{opacity:.25}50%{opacity:1}}
        @keyframes nebula {0%,100%{transform:translateX(-1%) scale(1)}50%{transform:translateX(1%) scale(1.05)}}
        @keyframes shoot {
          0%,90%,100%{opacity:0;transform:translateX(0) rotate(-20deg)}
          92%{opacity:1}
          97%{opacity:.6;transform:translateX(380px) rotate(-20deg)}
          99%{opacity:0;transform:translateX(420px) rotate(-20deg)}
        }
      `}</style>
    </div>
  );
}

/* ---------- TEMPLE: golden god-rays, floating embers, mandala, diya glow ---------- */
function TempleScene() {
  const embers = useMemo(
    () =>
      Array.from({ length: 28 }).map(() => ({
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 7 + Math.random() * 7,
        size: 1.5 + Math.random() * 2.5,
        drift: (Math.random() - 0.5) * 40,
      })),
    [],
  );
  return (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(28_55%_9%),hsl(18_65%_3%))]">
      {/* Outer warm vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, hsl(30 80% 25% / 0.5), transparent 65%)",
        }}
      />
      {/* God rays from above */}
      <div
        className="absolute inset-0 opacity-30 mix-blend-screen"
        style={{
          background:
            "conic-gradient(from 175deg at 50% -5%, transparent 0deg, hsl(40 90% 65% / 0.25) 5deg, transparent 12deg, transparent 25deg, hsl(40 90% 65% / 0.18) 32deg, transparent 40deg)",
          filter: "blur(6px)",
          animation: "ray-shift 24s ease-in-out infinite",
        }}
      />
      {/* Mandala silhouette â€” inner */}
      <svg
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.12]"
        width="600" height="600" viewBox="0 0 200 200"
        style={{ animation: "mandala-spin 90s linear infinite" }}
      >
        <g fill="none" stroke="hsl(40 90% 60%)" strokeWidth="0.4">
          <circle cx="100" cy="100" r="80" />
          <circle cx="100" cy="100" r="60" />
          <circle cx="100" cy="100" r="40" />
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i / 16) * Math.PI * 2;
            return <line key={i} x1="100" y1="100" x2={100 + Math.cos(a) * 80} y2={100 + Math.sin(a) * 80} />;
          })}
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return <circle key={i} cx={100 + Math.cos(a) * 60} cy={100 + Math.sin(a) * 60} r="6" />;
          })}
        </g>
      </svg>
      {/* Outer mandala â€” slower, counter-rotating, parallax depth */}
      <svg
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
        width="950" height="950" viewBox="0 0 200 200"
        style={{ animation: "mandala-spin-rev 180s linear infinite" }}
      >
        <g fill="none" stroke="hsl(40 95% 65%)" strokeWidth="0.25">
          <circle cx="100" cy="100" r="95" />
          <circle cx="100" cy="100" r="78" />
          {Array.from({ length: 36 }).map((_, i) => {
            const a = (i / 36) * Math.PI * 2;
            return <line key={i} x1={100 + Math.cos(a) * 78} y1={100 + Math.sin(a) * 78} x2={100 + Math.cos(a) * 95} y2={100 + Math.sin(a) * 95} />;
          })}
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i / 24) * Math.PI * 2;
            return <circle key={i} cx={100 + Math.cos(a) * 86} cy={100 + Math.sin(a) * 86} r="1.4" />;
          })}
        </g>
      </svg>
      {/* Caustic shimmer â€” moving light through golden mist */}
      <div
        className="absolute inset-0 opacity-25 mix-blend-screen"
        style={{
          background:
            "radial-gradient(ellipse 60% 25% at 50% 40%, hsl(45 100% 70% / 0.5), transparent 70%)",
          filter: "blur(20px)",
          animation: "caustic 9s ease-in-out infinite",
        }}
      />
      {/* Central diya glow */}
      <div
        className="absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, hsl(38 95% 60% / 0.4) 0%, hsl(28 85% 45% / 0.18) 30%, transparent 65%)",
          filter: "blur(18px)",
          animation: "temple-breathe 7s ease-in-out infinite",
        }}
      />
      {/* Inner flame */}
      <div
        className="absolute left-1/2 top-1/2 h-16 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at 50% 70%, hsl(50 100% 80%) 0%, hsl(35 100% 60%) 35%, hsl(15 90% 40% / 0.6) 70%, transparent 100%)",
          filter: "blur(2px)",
          animation: "flame-flicker 1.6s ease-in-out infinite",
        }}
      />
      {/* Floating embers */}
      {embers.map((e, i) => (
        <span
          key={i}
          className="absolute bottom-0 block rounded-full"
          style={{
            left: `${e.left}%`,
            width: e.size,
            height: e.size,
            background: "hsl(35 95% 65%)",
            boxShadow: "0 0 6px hsl(35 95% 60%), 0 0 14px hsl(20 90% 50% / 0.7)",
            ['--drift' as any]: `${e.drift}px`,
            animation: `ember-rise ${e.duration}s linear ${e.delay}s infinite`,
          }}
        />
      ))}
      {/* Lotus silhouette â€” grounds the frame */}
      <svg
        className="absolute left-1/2 bottom-[-6%] -translate-x-1/2 opacity-[0.18]"
        width="640" height="220" viewBox="0 0 640 220"
        style={{ animation: "lotus-sway 11s ease-in-out infinite" }}
      >
        <defs>
          <linearGradient id="petal" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(35 95% 55%)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="hsl(15 80% 12%)" stopOpacity="1" />
          </linearGradient>
        </defs>
        <g fill="url(#petal)">
          {Array.from({ length: 9 }).map((_, i) => {
            const cx = 320 + (i - 4) * 60;
            const h = 130 + Math.abs(i - 4) * -8;
            return <ellipse key={i} cx={cx} cy="200" rx="42" ry={h} />;
          })}
        </g>
      </svg>
      <style>{`
        @keyframes temple-breathe {0%,100%{transform:translate(-50%,-50%) scale(.95);opacity:.55}50%{transform:translate(-50%,-50%) scale(1.06);opacity:.85}}
        @keyframes flame-flicker {0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.9}25%{transform:translate(-50%,-52%) scale(1.05);opacity:1}50%{transform:translate(-50%,-48%) scale(.95);opacity:.85}75%{transform:translate(-51%,-51%) scale(1.03);opacity:.95}}
        @keyframes mandala-spin {to{transform:translate(-50%,-50%) rotate(360deg)}}
        @keyframes mandala-spin-rev {to{transform:translate(-50%,-50%) rotate(-360deg)}}
        @keyframes ray-shift {0%,100%{transform:translateX(-1%)}50%{transform:translateX(1%)}}
        @keyframes caustic {0%,100%{transform:translateX(-6%) scaleY(1);opacity:.18}50%{transform:translateX(6%) scaleY(1.15);opacity:.35}}
        @keyframes lotus-sway {0%,100%{transform:translateX(calc(-50% - 4px))}50%{transform:translateX(calc(-50% + 4px))}}
        @keyframes ember-rise {
          0%{transform:translate(0,0) scale(1);opacity:0}
          10%{opacity:.9}
          90%{opacity:.7}
          100%{transform:translate(var(--drift),-110vh) scale(.4);opacity:0}
        }
      `}</style>
    </div>
  );
}


/* ============================================================
   AUDIO ENGINE â€” Web Audio, procedural, no assets
   ============================================================ */

function useAmbientAudio(scene: AmbientScene, volume: number) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  // Init / teardown when scene changes
  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (typeof window === "undefined") return;
      // Lazy create â€” must be after a user gesture; we attach a one-shot resume.
      if (!ctxRef.current) {
        const Ctx =
          (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!Ctx) return;
        ctxRef.current = new Ctx();
        masterRef.current = ctxRef.current.createGain();
        masterRef.current.gain.value = 0;
        masterRef.current.connect(ctxRef.current.destination);
      }
      const ctx = ctxRef.current!;
      // Resume on first interaction if needed
      if (ctx.state === "suspended") {
        const resume = () => {
          ctx.resume().catch(() => {});
          window.removeEventListener("pointerdown", resume);
          window.removeEventListener("keydown", resume);
        };
        window.addEventListener("pointerdown", resume, { once: true });
        window.addEventListener("keydown", resume, { once: true });
      }

      // Tear down previous scene
      stopRef.current?.();
      stopRef.current = null;
      if (cancelled) return;

      stopRef.current = buildScene(ctx, masterRef.current!, scene);
    }

    void start();
    return () => {
      cancelled = true;
    };
  }, [scene]);

  // Volume ramp
  useEffect(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, volume)), now + 0.4);
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRef.current?.();
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
      masterRef.current = null;
    };
  }, []);
}

function buildScene(
  ctx: AudioContext,
  master: GainNode,
  scene: AmbientScene,
): () => void {
  const nodes: AudioNode[] = [];
  const stops: Array<() => void> = [];
  const timers: ReturnType<typeof setTimeout>[] = [];
  const intervals: ReturnType<typeof setInterval>[] = [];

  // ── Output chain: scene → compressor → [dry + hall] → master ──
  // Every theme gets glue compression and a shared hall so layers sit in one
  // room instead of stacking dry on top of each other.
  const sceneOut = ctx.createGain();
  const entry = ctx.currentTime;
  sceneOut.gain.setValueAtTime(0.0001, entry);
  sceneOut.gain.exponentialRampToValueAtTime(1, entry + 1.8);

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -20;
  comp.knee.value = 24;
  comp.ratio.value = 3;
  comp.attack.value = 0.02;
  comp.release.value = 0.35;

  const dry = ctx.createGain();
  dry.gain.value = 0.88;
  const convolver = ctx.createConvolver();
  convolver.buffer = impulseResponse(ctx, 3.2, 2.8);
  const wet = ctx.createGain();
  wet.gain.value = 0.17;

  sceneOut.connect(comp);
  comp.connect(dry).connect(master);
  comp.connect(convolver).connect(wet).connect(master);
  nodes.push(sceneOut, comp, dry, convolver, wet);

  function impulseResponse(audio: AudioContext, seconds: number, decay: number) {
    const rate = audio.sampleRate;
    const length = Math.floor(rate * seconds);
    const buf = audio.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return buf;
  }

  // â”€â”€ Shared building blocks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function noiseBuffer(seconds = 2) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  function noiseSource(opts: { type?: BiquadFilterType; freq: number; q?: number; gain: number; dest?: AudioNode }) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(3);
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = opts.type ?? "lowpass";
    filter.frequency.value = opts.freq;
    if (opts.q != null) filter.Q.value = opts.q;
    const gain = ctx.createGain();
    gain.gain.value = opts.gain;
    src.connect(filter).connect(gain).connect(opts.dest ?? sceneOut);
    src.start();
    nodes.push(src, filter, gain);
    stops.push(() => { try { src.stop(); } catch {} });
    return { src, filter, gain };
  }

  function pad(freq: number, gain = 0.06, type: OscillatorType = "sine", lfoRate?: number) {
    // Two slightly detuned oscillators through a low-pass — a wider, warmer
    // bed than a single sine, and the filter keeps upper harmonics soft.
    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();
    oscA.type = type;
    oscB.type = type;
    oscA.frequency.value = freq;
    oscB.frequency.value = freq;
    oscA.detune.value = -5 - Math.random() * 2;
    oscB.detune.value = 5 + Math.random() * 2;

    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = Math.min(7000, Math.max(500, freq * 7));
    lp.Q.value = 0.6;

    const g = ctx.createGain();
    g.gain.value = gain;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = lfoRate ?? (0.05 + Math.random() * 0.07);
    lfoGain.gain.value = gain * 0.55;
    lfo.connect(lfoGain).connect(g.gain);

    oscA.connect(lp);
    oscB.connect(lp);
    lp.connect(g).connect(sceneOut);
    oscA.start();
    oscB.start();
    lfo.start();
    nodes.push(oscA, oscB, lp, g, lfo, lfoGain);
    stops.push(() => { try { oscA.stop(); } catch {}; try { oscB.stop(); } catch {}; try { lfo.stop(); } catch {} });
    return { osc: oscA, g };
  }

  // Bell / bowl â€” exponential decay sine cluster
  function bell(freq: number, dur = 4, gain = 0.18, harmonics: number[] = [1, 2, 3, 4.2]) {
    const now = ctx.currentTime;
    harmonics.forEach((mult, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq * mult;
      const peak = gain * Math.pow(0.55, i);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(peak, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      o.connect(g).connect(sceneOut);
      o.start(now);
      o.stop(now + dur + 0.1);
    });
  }

  // Pluck â€” short percussive sine for synthwave arp / lofi rhodes
  function pluck(freq: number, dur = 0.6, gain = 0.12, type: OscillatorType = "triangle") {
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    o.type = type;
    o.frequency.value = freq;
    f.type = "lowpass";
    f.frequency.setValueAtTime(2400, now);
    f.frequency.exponentialRampToValueAtTime(400, now + dur);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(gain, now + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(f).connect(g).connect(sceneOut);
    o.start(now);
    o.stop(now + dur + 0.05);
  }

  // Swell — a slow-breathing tone that fades in and out on its own
  // (harmonium, distant choir). Self-releasing so repeats never pile up.
  function swell(freq: number, dur = 8, gain = 0.03, type: OscillatorType = "sawtooth") {
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    o.type = type;
    o.frequency.value = freq;
    f.type = "lowpass";
    f.frequency.value = 900;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(gain, now + dur * 0.35);
    g.gain.linearRampToValueAtTime(0.0001, now + dur);
    o.connect(f).connect(g).connect(sceneOut);
    o.start(now);
    o.stop(now + dur + 0.1);
  }

  // Short noise tick (rain drop / hi-hat / digital tick)
  function tick(opts: { freq: number; q?: number; gain?: number; dur?: number; type?: BiquadFilterType }) {
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(0.2);
    const f = ctx.createBiquadFilter();
    f.type = opts.type ?? "bandpass";
    f.frequency.value = opts.freq;
    f.Q.value = opts.q ?? 8;
    const g = ctx.createGain();
    const peak = opts.gain ?? 0.08;
    const dur = opts.dur ?? 0.08;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(peak, now + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(f).connect(g).connect(sceneOut);
    src.start(now);
    src.stop(now + dur + 0.05);
  }

  // Distant thunder / cinematic boom
  function boom(freq = 55, dur = 5, gain = 0.25) {
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(dur + 0.5);
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = freq;
    f.Q.value = 4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(gain, now + 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(f).connect(g).connect(sceneOut);
    src.start(now);
    src.stop(now + dur + 0.1);
  }

  function every(ms: number, fn: () => void) {
    const id = setInterval(fn, ms);
    intervals.push(id);
  }
  function after(ms: number, fn: () => void) {
    const id = setTimeout(fn, ms);
    timers.push(id);
  }

  // â”€â”€ Scene compositions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  switch (scene) {
    case "rain": {
      noiseSource({ type: "highpass", freq: 1400, gain: 0.14 }); // hiss
      noiseSource({ type: "lowpass",  freq: 700,  gain: 0.20 }); // body
      pad(73.4,  0.025, "sine");  // moody blue pad
      pad(110,   0.018, "sine");
      // Distant thunder every 18â€“35s
      every(22000, () => { if (Math.random() < 0.7) boom(50 + Math.random() * 30, 5 + Math.random() * 4, 0.18); });
      after(6000, () => boom(55, 6, 0.15));
      break;
    }
    case "ocean": {
      const { gain } = noiseSource({ type: "lowpass", freq: 520, gain: 0.0 });
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.085; // ~12s swells
      lfoGain.gain.value = 0.26;
      lfo.connect(lfoGain).connect(gain.gain);
      lfo.start();
      nodes.push(lfo, lfoGain);
      stops.push(() => { try { lfo.stop(); } catch {} });
      pad(55, 0.04, "sine", 0.04); // sub undertow
      pad(82.4, 0.02, "sine");
      // far seabird calls
      every(28000, () => { if (Math.random() < 0.5) pluck(1200 + Math.random() * 600, 0.4, 0.04, "sine"); });
      break;
    }
    case "forest": {
      noiseSource({ type: "lowpass", freq: 380, gain: 0.10 }); // wind
      pad(110, 0.035, "sine");
      pad(165, 0.025, "sine");
      pad(220, 0.018, "triangle");
      // bird chirps
      every(7000, () => {
        if (Math.random() > 0.55) return;
        const base = 1600 + Math.random() * 1400;
        pluck(base, 0.18, 0.05, "sine");
        after(120 + Math.random() * 80, () => pluck(base * 1.2, 0.16, 0.04, "sine"));
      });
      // distant creek
      noiseSource({ type: "bandpass", freq: 2400, q: 1.2, gain: 0.04 });
      break;
    }
    case "night": {
      pad(96,  0.05, "sine");
      pad(144, 0.035, "sine");
      pad(192, 0.025, "triangle");
      pad(288, 0.015, "sine");
      noiseSource({ type: "lowpass", freq: 200, gain: 0.04 });
      // crickets
      every(420, () => { if (Math.random() > 0.5) tick({ freq: 4800, q: 25, gain: 0.025, dur: 0.05 }); });
      // far owl
      every(34000, () => {
        if (Math.random() > 0.5) return;
        pluck(220, 0.5, 0.05, "sine");
        after(380, () => pluck(196, 0.7, 0.04, "sine"));
      });
      break;
    }
    case "temple": {
      pad(73.4, 0.06, "sine");
      pad(110,  0.035, "sine");
      pad(146.8, 0.03, "sine");
      pad(220,  0.018, "triangle");
      noiseSource({ type: "lowpass", freq: 180, gain: 0.035 });
      // bell every ~24s
      every(24000, () => bell(293.66, 6, 0.16)); // D4
      after(2000, () => bell(293.66, 6, 0.14));
      break;
    }

    case "tron": {
      // Daft-Punk Legacy: pulsing sub, glassy saw arp, neon ticks
      pad(55, 0.07, "sawtooth", 0.06); // sub
      pad(110, 0.04, "sawtooth", 0.08);
      pad(220, 0.02, "triangle");
      // 16th-note arpeggio on Am pentatonic
      const arp = [220, 261.63, 329.63, 440, 329.63, 261.63]; // A3 C4 E4 A4 E4 C4
      let i = 0;
      every(180, () => { pluck(arp[i % arp.length], 0.25, 0.07, "sawtooth"); i++; });
      // 4-on-floor kick illusion via low boom
      every(500, () => boom(60, 0.4, 0.18));
      // hi-hat ticks on offbeats
      every(250, () => tick({ freq: 8000, q: 4, gain: 0.04, dur: 0.04, type: "highpass" }));
      break;
    }

    case "matrix": {
      // Don Davis: dark drone + digital rain ticks + low brass swell
      pad(43.65, 0.08, "sawtooth", 0.03); // F1 sub
      pad(65.4,  0.05, "sawtooth", 0.04);
      pad(87.3,  0.03, "triangle");
      pad(174.6, 0.02, "sine"); // F3 shimmer
      noiseSource({ type: "highpass", freq: 6000, gain: 0.025 }); // digital hiss
      // Code rain â€” fast random ticks
      every(110, () => {
        if (Math.random() > 0.4) return;
        tick({ freq: 3000 + Math.random() * 4000, q: 14, gain: 0.035, dur: 0.04 });
      });
      // Low cinematic brass hits every ~12s
      every(12000, () => {
        boom(65, 4, 0.22);
        after(60, () => pad(87.3, 0.04, "sawtooth", 0.4));
      });
      break;
    }

    case "cosmos": {
      // Interstellar-esque: vast pad + shimmer bells + pulsar clicks
      pad(48,  0.06, "sine", 0.03);  // deep space
      pad(96,  0.04, "sine", 0.04);
      pad(144, 0.025, "triangle");
      pad(192, 0.018, "sine");
      pad(384, 0.012, "sine");
      // shimmer bells slowly drifting
      every(9000, () => {
        const tones = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5 E5 G5 C6 E6
        bell(tones[Math.floor(Math.random() * tones.length)], 8, 0.09, [1, 2, 3]);
      });
      // pulsar
      every(2400, () => tick({ freq: 220, q: 30, gain: 0.05, dur: 0.18 }));
      break;
    }

    case "zen": {
      // Shakuhachi-like breathy flute + occasional bowl
      pad(196,  0.04, "sine", 0.06); // G3
      pad(293.66, 0.03, "triangle", 0.05); // D4
      noiseSource({ type: "bandpass", freq: 1200, q: 2, gain: 0.025 }); // breath
      // flute phrase notes
      every(5500, () => {
        if (Math.random() > 0.6) return;
        const notes = [392, 440, 523.25, 587.33, 659.25]; // G4 A4 C5 D5 E5
        const n = notes[Math.floor(Math.random() * notes.length)];
        pluck(n, 1.4, 0.06, "sine");
      });
      // singing bowl strike
      every(22000, () => bell(174.6, 9, 0.18, [1, 2.76, 5.4, 8.93])); // bowl harmonics
      break;
    }

    case "lofi": {
      // Cmaj7 â†’ Am7 â†’ Dm7 â†’ G7 in slow 4/4
      const chords: number[][] = [
        [261.63, 329.63, 392, 493.88], // Cmaj7
        [220, 261.63, 329.63, 392],     // Am7
        [293.66, 349.23, 440, 523.25],  // Dm7
        [392, 493.88, 587.33, 698.46],  // G7
      ];
      let bar = 0;
      // tape hiss
      noiseSource({ type: "lowpass", freq: 4000, gain: 0.025 });
      // warm sub
      pad(65.4, 0.04, "sine");
      const playChord = () => {
        const c = chords[bar % chords.length];
        c.forEach((f, i) => after(i * 90, () => pluck(f, 1.8, 0.06, "sine")));
        bar++;
      };
      playChord();
      every(2400, playChord); // ~25 bpm chord changes
      // vinyl crackle
      every(180, () => { if (Math.random() > 0.7) tick({ freq: 2000 + Math.random() * 2000, q: 6, gain: 0.025, dur: 0.03 }); });
      // soft kick
      every(600, () => boom(70, 0.35, 0.10));
      break;
    }

    case "fire": {
      // Hearth: dry crackle over a warm sub, with occasional flares.
      noiseSource({ type: "highpass", freq: 1600, gain: 0.05 });
      noiseSource({ type: "lowpass",  freq: 320,  gain: 0.12 });
      pad(55,   0.035, "sine", 0.045);
      pad(82.4, 0.02,  "sine", 0.06);
      every(260, () => {
        if (Math.random() > 0.55) return;
        tick({ freq: 900 + Math.random() * 2600, q: 3, gain: 0.045, dur: 0.05 });
      });
      every(7500, () => boom(90 + Math.random() * 40, 1.1, 0.045));
      after(1800, () => boom(110, 1.4, 0.05));
      break;
    }

    case "cave": {
      // Deep chamber: sub resonance, dripping water, far wind.
      pad(43.65, 0.05,  "sine", 0.03);
      pad(65.4,  0.028, "sine", 0.04);
      pad(130.8, 0.014, "triangle", 0.05);
      // mid presence so the chamber speaks on small speakers too
      pad(220,   0.016, "triangle", 0.045);
      pad(329.63, 0.009, "sine", 0.06);
      noiseSource({ type: "lowpass", freq: 200, gain: 0.05 });
      noiseSource({ type: "bandpass", freq: 720, q: 1.1, gain: 0.02 });
      // water drops — a short glassy pluck with a tail
      every(3400, () => {
        if (Math.random() > 0.7) return;
        const f = 1500 + Math.random() * 1400;
        pluck(f, 0.5, 0.035, "sine");
        after(220, () => pluck(f * 0.75, 0.8, 0.02, "sine"));
      });
      // far stone settling
      every(21000, () => boom(48 + Math.random() * 18, 6, 0.08));
      break;
    }

    case "monsoon": {
      // Sheets of rain with gusting gain and rolling thunder.
      const rainBody = noiseSource({ type: "lowpass", freq: 900, gain: 0.16 });
      noiseSource({ type: "highpass", freq: 2600, gain: 0.07 });
      pad(55,   0.03, "sine", 0.03);
      pad(82.4, 0.018, "sine", 0.045);
      const gust = ctx.createOscillator();
      const gustGain = ctx.createGain();
      gust.frequency.value = 0.06;
      gustGain.gain.value = 0.07;
      gust.connect(gustGain).connect(rainBody.gain.gain);
      gust.start();
      nodes.push(gust, gustGain);
      stops.push(() => { try { gust.stop(); } catch {} });
      every(15000, () => {
        if (Math.random() > 0.65) return;
        boom(42 + Math.random() * 26, 7 + Math.random() * 3, 0.2);
      });
      after(4000, () => boom(52, 8, 0.14));
      break;
    }

    case "dawn": {
      // First light: warm pad, waking birds, a distant temple chime.
      pad(110,   0.03,  "sine", 0.03);
      pad(164.81, 0.022, "sine", 0.045);
      pad(220,   0.014, "triangle", 0.06);
      noiseSource({ type: "lowpass", freq: 420, gain: 0.045 });
      every(4200, () => {
        if (Math.random() > 0.6) return;
        const base = 1500 + Math.random() * 1200;
        pluck(base, 0.2, 0.04, "sine");
        after(130, () => pluck(base * 1.22, 0.16, 0.03, "sine"));
        after(260, () => pluck(base * 1.4, 0.14, 0.02, "sine"));
      });
      every(24000, () => bell(523.25, 9, 0.1, [1, 2, 3]));
      break;
    }

    case "satsang": {
      // Tanpura cycle + harmonium bed + a bowl marking the silence.
      const sa = 146.83; // D3
      const pa = 220;    // A3
      pad(sa, 0.05,  "triangle", 0.035);
      pad(pa, 0.025, "triangle", 0.05);
      pad(sa * 1.5, 0.018, "sine", 0.06);
      noiseSource({ type: "bandpass", freq: 900, q: 0.8, gain: 0.012 });
      // plucked tanpura cycle: Sa – Pa – Sa – Sa
      const cycle = [sa, pa, sa, sa];
      let step = 0;
      every(1250, () => {
        pluck(cycle[step % cycle.length], 2.4, 0.045, "triangle");
        step++;
      });
      // harmonium swell every 12s, entering on a breath
      every(12000, () => {
        swell(185, 10, 0.022);
        swell(220, 10, 0.014, "triangle");
      });
      every(30000, () => bell(146.83, 10, 0.14, [1, 2.76, 5.4, 8.93]));
      after(6000, () => bell(146.83, 10, 0.1, [1, 2.76, 5.4]));
      break;
    }
  }

  // Fade out over ~1.2s, then release every node. This is what makes scene
  // changes a dissolve instead of a cut.
  let stopped = false;
  return () => {
    if (stopped) return;
    stopped = true;
    timers.forEach(clearTimeout);
    intervals.forEach(clearInterval);
    const now = ctx.currentTime;
    try {
      sceneOut.gain.cancelScheduledValues(now);
      sceneOut.gain.setValueAtTime(sceneOut.gain.value, now);
      sceneOut.gain.linearRampToValueAtTime(0.0001, now + 1.2);
    } catch {
      /* ignore */
    }
    window.setTimeout(() => {
      stops.forEach((s) => s());
      nodes.forEach((n) => { try { n.disconnect(); } catch {} });
    }, 1400);
  };
}

/* ============================================================
   NEW VISUAL SCENES â€” Tron, Matrix, Cosmos, Zen, Lofi
   Pure CSS / SVG, GPU-friendly
   ============================================================ */

function TronScene() {
  return (
    <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 60%, hsl(200 100% 18%) 0%, hsl(220 90% 6%) 60%, #000 100%)" }}>
      {/* perspective grid */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3"
        style={{
          backgroundImage:
            "linear-gradient(hsl(190 100% 55% / 0.45) 1px, transparent 1px), linear-gradient(90deg, hsl(190 100% 55% / 0.45) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          transform: "perspective(600px) rotateX(60deg)",
          transformOrigin: "center bottom",
          maskImage: "linear-gradient(to top, black 30%, transparent 100%)",
          animation: "tron-scroll 8s linear infinite",
        }}
      />
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 30%, hsl(190 100% 60% / 0.25), transparent 50%)" }} />
      <style>{`@keyframes tron-scroll { from { background-position: 0 0, 0 0; } to { background-position: 0 60px, 60px 0; } }`}</style>
    </div>
  );
}

function MatrixScene() {
  const cols = useMemo(() =>
    Array.from({ length: 28 }).map((_, i) => ({
      left: (i / 28) * 100,
      delay: Math.random() * 6,
      duration: 4 + Math.random() * 6,
      chars: Array.from({ length: 18 }).map(() => String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96))).join(""),
    })), []);
  return (
    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #000 0%, hsl(130 30% 4%) 100%)" }}>
      {cols.map((c, i) => (
        <div
          key={i}
          className="absolute top-0 text-[14px] leading-[14px] font-mono whitespace-pre"
          style={{
            left: `${c.left}%`,
            color: "hsl(130 90% 55%)",
            textShadow: "0 0 8px hsl(130 100% 55% / 0.9)",
            writingMode: "vertical-rl",
            animation: `matrix-fall ${c.duration}s linear ${c.delay}s infinite`,
            opacity: 0.7,
          }}
        >
          {c.chars}
        </div>
      ))}
      <style>{`@keyframes matrix-fall { from { transform: translateY(-100%); } to { transform: translateY(110vh); } }`}</style>
    </div>
  );
}

function CosmosScene() {
  const stars = useMemo(() =>
    Array.from({ length: 140 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 0.4,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 5,
    })), []);
  return (
    <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 40%, hsl(270 60% 15%), hsl(240 50% 4%) 70%, #000 100%)" }}>
      {stars.map((s, i) => (
        <span key={i} className="absolute rounded-full bg-white" style={{
          left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size,
          animation: `cosmos-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
        }} />
      ))}
      {/* nebula */}
      <div className="absolute inset-0" style={{
        background:
          "radial-gradient(ellipse at 70% 30%, hsl(290 80% 50% / 0.25), transparent 40%)," +
          "radial-gradient(ellipse at 20% 70%, hsl(200 90% 50% / 0.18), transparent 45%)",
        filter: "blur(40px)",
      }} />
      <style>{`@keyframes cosmos-twinkle { 0%,100% { opacity: .3; } 50% { opacity: 1; } }`}</style>
    </div>
  );
}

function ZenScene() {
  return (
    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(20 40% 88%) 0%, hsl(30 35% 78%) 60%, hsl(25 30% 65%) 100%)" }}>
      {/* enso circle */}
      <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" width="60%" height="60%" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(20 50% 20% / 0.6)" strokeWidth="3" strokeDasharray="490 60" strokeLinecap="round" transform="rotate(-90 100 100)" />
      </svg>
      {/* mountain silhouette */}
      <svg className="absolute inset-x-0 bottom-0" viewBox="0 0 1200 200" preserveAspectRatio="none" style={{ width: "100%", height: "30%" }}>
        <path d="M0,200 L200,80 L400,140 L600,40 L800,120 L1000,70 L1200,150 L1200,200 Z" fill="hsl(20 50% 25% / 0.7)" />
      </svg>
    </div>
  );
}

function LofiScene() {
  return (
    <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsl(20 40% 18%) 0%, hsl(280 30% 12%) 100%)" }}>
      {/* warm window glow */}
      <div className="absolute right-[15%] top-[20%] h-40 w-32 rounded-md" style={{
        background: "linear-gradient(180deg, hsl(40 90% 70% / 0.9), hsl(30 80% 50% / 0.5))",
        filter: "blur(8px)",
        boxShadow: "0 0 80px hsl(35 80% 55% / 0.6)",
      }} />
      {/* desk lamp pool */}
      <div className="absolute left-[20%] bottom-[10%] h-64 w-96 rounded-full" style={{
        background: "radial-gradient(ellipse, hsl(35 70% 55% / 0.35), transparent 70%)",
        filter: "blur(20px)",
      }} />
      {/* rain on window */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: "repeating-linear-gradient(75deg, hsl(220 60% 80% / 0.4) 0 1px, transparent 1px 14px)",
        animation: "lofi-rain 0.8s linear infinite",
      }} />
      <style>{`@keyframes lofi-rain { from { background-position: 0 0; } to { background-position: 14px 56px; } }`}</style>
    </div>
  );
}

/* ============================================================
   AMBIENT THEMES XI–XV — Fire, Cave, Monsoon, Dawn, Satsang
   ============================================================ */

function FireScene() {
  const embers = useMemo(
    () =>
      Array.from({ length: 34 }).map(() => ({
        left: Math.random() * 100,
        size: 1.5 + Math.random() * 3,
        delay: Math.random() * 9,
        duration: 5 + Math.random() * 7,
        drift: (Math.random() - 0.5) * 60,
      })),
    [],
  );
  return (
    <div
      className="absolute inset-0"
      style={{ background: "linear-gradient(180deg, #090604 0%, hsl(18 50% 7%) 52%, hsl(24 65% 11%) 100%)" }}
    >
      <div
        className="absolute bottom-[-14%] left-1/2 h-[60vh] w-[78vw] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, hsl(24 95% 55% / 0.55) 0%, hsl(18 90% 38% / 0.2) 46%, transparent 72%)",
          animation: "fire-flicker 5.5s ease-in-out infinite",
        }}
      />
      {embers.map((e, i) => (
        <span
          key={i}
          className="absolute bottom-[8%] rounded-full"
          style={{
            left: `${e.left}%`,
            width: e.size,
            height: e.size,
            background: "hsl(32 100% 68%)",
            boxShadow: "0 0 8px hsl(28 100% 60% / 0.9)",
            animation: `ember-rise ${e.duration}s linear ${e.delay}s infinite`,
            ["--ember-drift" as string]: `${e.drift}px`,
          }}
        />
      ))}
      <style>{`
        @keyframes fire-flicker {
          0%, 100% { opacity: 0.75; transform: translateX(-50%) scale(1); }
          38%      { opacity: 1;    transform: translateX(-50%) scale(1.05); }
          62%      { opacity: 0.66; transform: translateX(-50%) scale(0.98); }
        }
        @keyframes ember-rise {
          0%   { transform: translate3d(0, 0, 0) scale(1); opacity: 0; }
          12%  { opacity: 0.9; }
          100% { transform: translate3d(var(--ember-drift, 0px), -72vh, 0) scale(0.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function CaveScene() {
  const drips = useMemo(
    () =>
      Array.from({ length: 7 }).map(() => ({
        left: 18 + Math.random() * 64,
        delay: Math.random() * 6,
        duration: 4.5 + Math.random() * 4,
      })),
    [],
  );
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse at 50% 6%, hsl(198 28% 24%) 0%, hsl(205 26% 10%) 46%, #030507 100%)",
      }}
    >
      {/* light shaft from the chamber mouth */}
      <div
        className="absolute left-1/2 top-[-10%] h-[70vh] w-[46vw] -translate-x-1/2 blur-2xl"
        style={{
          background:
            "linear-gradient(180deg, hsl(198 55% 76% / 0.4), hsl(198 50% 62% / 0.1) 60%, transparent 100%)",
          clipPath: "polygon(38% 0%, 62% 0%, 88% 100%, 12% 100%)",
          animation: "cave-shaft 14s ease-in-out infinite",
        }}
      />
      {drips.map((d, i) => (
        <span
          key={i}
          className="absolute top-[6%] h-10 w-px"
          style={{
            left: `${d.left}%`,
            background: "linear-gradient(180deg, transparent, hsl(198 60% 80% / 0.5), transparent)",
            animation: `cave-drip ${d.duration}s linear ${d.delay}s infinite`,
          }}
        />
      ))}
      {/* water rings at the floor */}
      {[0, 1, 2].map((r) => (
        <span
          key={r}
          className="absolute bottom-[12%] left-1/2 h-24 w-24 -translate-x-1/2 rounded-full border border-cyan-200/20"
          style={{ animation: `cave-ripple 7s ease-out ${r * 2.3}s infinite` }}
        />
      ))}
      <style>{`
        @keyframes cave-shaft { 0%,100% { opacity: .6; } 50% { opacity: .95; } }
        @keyframes cave-drip { 0% { transform: translateY(0); opacity: 0; } 10% { opacity: 1; } 90% { opacity: .6; } 100% { transform: translateY(64vh); opacity: 0; } }
        @keyframes cave-ripple { 0% { transform: translateX(-50%) scale(.25); opacity: 0; } 18% { opacity: .55; } 100% { transform: translateX(-50%) scale(3.4); opacity: 0; } }
      `}</style>
    </div>
  );
}

function MonsoonScene() {
  return (
    <div
      className="absolute inset-0"
      style={{ background: "linear-gradient(180deg, hsl(215 45% 8%) 0%, hsl(212 42% 13%) 55%, hsl(208 38% 9%) 100%)" }}
    >
      {/* cloud banks */}
      <div
        className="absolute inset-x-0 top-0 h-[45%]"
        style={{
          background:
            "radial-gradient(ellipse at 20% 0%, hsl(214 30% 26% / .7), transparent 60%), radial-gradient(ellipse at 78% 10%, hsl(210 28% 22% / .6), transparent 62%)",
          filter: "blur(30px)",
        }}
      />
      {/* rain layers moving at different speeds */}
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "repeating-linear-gradient(78deg, hsl(210 70% 78% / .5) 0 1px, transparent 1px 26px)",
          animation: "monsoon-rain 0.9s linear infinite",
        }}
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(82deg, hsl(210 80% 85% / .5) 0 1px, transparent 1px 14px)",
          animation: "monsoon-rain 0.55s linear infinite reverse",
        }}
      />
      {/* distant lightning */}
      <div
        className="absolute inset-0 bg-slate-100/70 mix-blend-screen"
        style={{ animation: "monsoon-flash 16s ease-out 3s infinite", opacity: 0 }}
      />
      <style>{`
        @keyframes monsoon-rain { from { background-position: 0 0; } to { background-position: 26px 240px; } }
        @keyframes monsoon-flash { 0%, 92%, 100% { opacity: 0; } 93% { opacity: .22; } 94% { opacity: .04; } 95% { opacity: .16; } 96.5% { opacity: 0; } }
      `}</style>
    </div>
  );
}

function DawnScene() {
  const birds = useMemo(
    () =>
      Array.from({ length: 8 }).map(() => ({
        top: 22 + Math.random() * 30,
        delay: Math.random() * 14,
        duration: 16 + Math.random() * 14,
        scale: 0.6 + Math.random() * 0.7,
      })),
    [],
  );
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(180deg, hsl(32 60% 20%) 0%, hsl(28 65% 38%) 36%, hsl(26 70% 62%) 68%, hsl(30 55% 78%) 100%)",
      }}
    >
      {/* rising sun */}
      <div
        className="absolute bottom-[16%] left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-2xl"
        style={{
          background: "radial-gradient(circle, hsl(45 100% 78% / .95), hsl(35 100% 62% / .55) 42%, transparent 70%)",
          animation: "dawn-rise 24s ease-in-out infinite alternate",
        }}
      />
      {/* mist bands */}
      <div
        className="absolute inset-x-0 bottom-[12%] h-40 blur-2xl"
        style={{ background: "linear-gradient(180deg, transparent, hsl(30 50% 85% / .35), transparent)" }}
      />
      {birds.map((b, i) => (
        <svg
          key={i}
          className="absolute"
          width="26"
          height="10"
          viewBox="0 0 26 10"
          style={{
            top: `${b.top}%`,
            left: "-6%",
            animation: `dawn-fly ${b.duration}s linear ${b.delay}s infinite`,
            opacity: 0.55,
            ["--s" as string]: b.scale,
          }}
        >
          <path d="M1 7 Q7 1 13 6 Q19 1 25 7" fill="none" stroke="hsl(25 30% 18% / .7)" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      ))}
      <style>{`
        @keyframes dawn-rise { from { transform: translate(-50%, 12px) scale(.96); opacity: .8; } to { transform: translate(-50%, -26px) scale(1.06); opacity: 1; } }
        @keyframes dawn-fly { from { transform: translateX(0) scale(var(--s,1)); } to { transform: translateX(112vw) scale(var(--s,1)); } }
      `}</style>
    </div>
  );
}

function SatsangScene() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse at 50% 60%, hsl(34 65% 22%) 0%, hsl(28 55% 12%) 45%, hsl(24 45% 6%) 100%)",
      }}
    >
      {/* lamp glow */}
      <div
        className="absolute left-1/2 top-[38%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(42 100% 70% / .55), transparent 68%)" }}
      />
      {/* breathing rings */}
      {[0, 1, 2].map((r) => (
        <span
          key={r}
          className="absolute left-1/2 top-[38%] h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/20"
          style={{ animation: `satsang-breathe 9s ease-in-out ${r * 3}s infinite` }}
        />
      ))}
      {/* dust motes */}
      {Array.from({ length: 22 }).map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-amber-100/60"
          style={{
            left: `${8 + Math.random() * 84}%`,
            top: `${18 + Math.random() * 66}%`,
            width: 2 + Math.random() * 2,
            height: 2 + Math.random() * 2,
            animation: `satsang-mote ${8 + Math.random() * 8}s ease-in-out ${Math.random() * 6}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes satsang-breathe { 0%,100% { transform: translate(-50%,-50%) scale(.72); opacity: .08; } 50% { transform: translate(-50%,-50%) scale(1.12); opacity: .32; } }
        @keyframes satsang-mote { 0%,100% { opacity: .15; transform: translateY(0); } 50% { opacity: .85; transform: translateY(-10px); } }
      `}</style>
    </div>
  );
}
