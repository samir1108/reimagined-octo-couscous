import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  BREATH_PATTERNS,
  LAYER_IDS,
  STORAGE_KEY,
  WORLDS,
  WORLDS_BY_ID,
  activeLayers,
  breathAt,
  emptyLevels,
  formatClock,
  normalizeMix,
  parseBience,
  serializeBience,
  worldMix,
  type BienceMix,
  type BreathMoment,
  type BreathPattern,
  type LayerId,
  type SleepMinutes,
  type WorldId,
} from "@/lib/bience/model";
import { getBienceEngine, isAudioSupported, type BienceEngine, type EngineState } from "@/lib/bience/engine";

function loadStoredMix(): BienceMix {
  if (typeof window === "undefined") return worldMix(WORLDS[0].id);
  try {
    return parseBience(window.localStorage.getItem(STORAGE_KEY)) ?? worldMix(WORLDS[0].id);
  } catch {
    return worldMix(WORLDS[0].id);
  }
}

export interface BienceStudio {
  mix: BienceMix;
  levels: Record<LayerId, number>;
  world: (typeof WORLDS)[number];
  engine: BienceEngine;
  playing: boolean;
  ready: boolean;
  supported: boolean;
  breathOn: boolean;
  breathPattern: BreathPattern;
  breath: BreathMoment;
  sleep: SleepMinutes;
  remaining: number;
  active: LayerId[];
  toggle: () => void;
  stop: () => void;
  selectWorld: (id: WorldId) => void;
  setLayer: (id: LayerId, level: number) => void;
  nudgeLayer: (id: LayerId, delta: number) => void;
  muteAll: () => void;
  restoreWorld: () => void;
  setMaster: (value: number) => void;
  setReverb: (value: number) => void;
  setBreathOn: (value: boolean) => void;
  setBreathPattern: (pattern: BreathPattern) => void;
  setSleep: (minutes: SleepMinutes) => void;
  evolve: boolean;
  setEvolve: (value: boolean) => void;
}

export function useBienceStudio(): BienceStudio {
  const [mix, setMix] = useState<BienceMix>(() => loadStoredMix());
  const [playing, setPlaying] = useState(false);
  const [engineState, setEngineState] = useState<EngineState>("idle");
  const [breathOn, setBreathOn] = useState(true);
  const [breathPatternId, setBreathPatternId] = useState<BreathPattern["id"]>("settle");
  const [sleep, setSleepState] = useState<SleepMinutes>(0);
  const [evolve, setEvolve] = useState(true);
  const [remaining, setRemaining] = useState(0);

  const engine = useMemo(() => getBienceEngine(), []);
  const supported = useMemo(() => isAudioSupported(), []);
  const started = useRef(false);

  const world = WORLDS_BY_ID[mix.base] ?? WORLDS[0];

  useEffect(() => {
    const handle = (state: EngineState) => setEngineState(state);
    engine.onStateChange = handle;
    return () => {
      if (engine.onStateChange === handle) engine.onStateChange = undefined;
    };
  }, [engine]);

  useEffect(() => {
    setPlaying(engineState === "playing");
  }, [engineState]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const debugWindow = window as Window & { __bienceEngine?: BienceEngine };
    debugWindow.__bienceEngine = engine;
    return () => {
      delete debugWindow.__bienceEngine;
    };
  }, [engine]);

  useEffect(() => {
    if (started.current) engine.sync(mix, world);
  }, [engine, mix, world]);

  useEffect(() => {
    if (!playing) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, serializeBience(mix));
    } catch {
      /* storage full or unavailable */
    }
  }, [mix, playing]);

  useEffect(() => {
    return () => {
      engine.stop(0.6);
    };
  }, [engine]);

  const breathPattern = useMemo(
    () => BREATH_PATTERNS.find((pattern) => pattern.id === breathPatternId) ?? BREATH_PATTERNS[0],
    [breathPatternId],
  );

  const [breath, setBreath] = useState<BreathMoment>(() => breathAt(BREATH_PATTERNS[0], 0));
  const breathStart = useRef(0);

  useEffect(() => {
    breathStart.current = performance.now();
    setBreath(breathAt(breathPattern, 0));
    const tick = () => {
      const seconds = (performance.now() - breathStart.current) / 1000;
      setBreath(breathAt(breathPattern, seconds));
    };
    tick();
    const interval = window.setInterval(tick, 200);
    return () => window.clearInterval(interval);
  }, [breathPattern]);

  useEffect(() => {
    if (sleep === 0 || !playing) {
      setRemaining(0);
      return;
    }
    setRemaining(sleep * 60);
    engine.sleepFade(sleep);
    const interval = window.setInterval(() => {
      setRemaining((previous) => {
        const next = Math.max(0, previous - 1);
        if (next === 0) {
          window.clearInterval(interval);
          engine.stop(8);
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [sleep, playing, engine]);

  useEffect(() => {
    if (!playing || !evolve) return;
    const interval = window.setInterval(() => {
      if (Math.random() < 0.45) return;
      setMix((current) => {
        const options = LAYER_IDS.filter((id) => (current.levels[id] ?? 0) > 0 && (current.levels[id] ?? 0) < 0.92);
        if (options.length === 0) return current;
        const id = options[Math.floor(Math.random() * options.length)];
        const delta = (Math.random() < 0.5 ? -1 : 1) * (0.02 + Math.random() * 0.05);
        const next = Math.max(0, Math.min(1, (current.levels[id] ?? 0) + delta));
        return { ...current, source: "custom", levels: { ...current.levels, [id]: next } };
      });
    }, 21000);
    return () => window.clearInterval(interval);
  }, [playing, evolve]);

  const toggle = useCallback(() => {
    if (engine.getState() === "playing") {
      engine.stop(1.1);
      return;
    }
    started.current = true;
    void engine.start(mix, world);
  }, [engine, mix, world]);

  const stop = useCallback(() => {
    engine.stop(1.1);
  }, [engine]);

  const selectWorld = useCallback((id: WorldId) => {
    setMix((current) => ({ ...worldMix(id), master: current.master }));
  }, []);

  const setLayer = useCallback((id: LayerId, level: number) => {
    setMix((current) => {
      const clamped = Math.max(0, Math.min(1, Number.isFinite(level) ? level : 0));
      return { ...current, source: "custom", levels: { ...current.levels, [id]: clamped } };
    });
  }, []);

  const nudgeLayer = useCallback((id: LayerId, delta: number) => {
    setMix((current) => {
      const next = Math.max(0, Math.min(1, (current.levels[id] ?? 0) + delta));
      return { ...current, source: "custom", levels: { ...current.levels, [id]: next } };
    });
  }, []);

  const muteAll = useCallback(() => {
    setMix((current) => ({ ...current, source: "custom", levels: emptyLevels() }));
  }, []);

  const restoreWorld = useCallback(() => {
    setMix((current) => ({ ...worldMix(current.base), master: current.master }));
  }, []);

  const setMaster = useCallback((value: number) => {
    const clamped = Math.max(0, Math.min(1, value));
    setMix((current) => ({ ...current, master: clamped }));
  }, []);

  const setReverb = useCallback((value: number) => {
    const clamped = Math.max(0, Math.min(1, value));
    setMix((current) => ({ ...current, reverb: clamped }));
  }, []);

  const setSleep = useCallback(
    (minutes: SleepMinutes) => {
      setSleepState(minutes);
      if (minutes === 0) engine.setMaster(mix.master, 1);
    },
    [engine, mix.master],
  );

  return {
    mix: normalizeMix(mix),
    levels: mix.levels,
    world,
    engine,
    playing,
    ready: engineState !== "suspended",
    supported,
    breathOn,
    breathPattern,
    breath,
    sleep,
    remaining,
    active: activeLayers(mix.levels),
    toggle,
    stop,
    selectWorld,
    setLayer,
    nudgeLayer,
    muteAll,
    restoreWorld,
    setMaster,
    setReverb,
    setBreathOn,
    setBreathPattern: (pattern) => setBreathPatternId(pattern.id),
    setSleep,
    evolve,
    setEvolve,
  };
}

export function sleepLabel(minutes: SleepMinutes, remaining: number): string {
  if (minutes === 0) return "No timer";
  if (remaining > 0) return `${formatClock(remaining)} left`;
  return `${minutes} min`;
}
