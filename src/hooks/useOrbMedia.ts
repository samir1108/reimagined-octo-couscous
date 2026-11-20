import { useEffect, useMemo } from "react";
import { WORLDS, WORLDS_BY_ID, worldMix } from "@/lib/bience/model";
import { getBienceEngine, isAudioSupported } from "@/lib/bience/engine";
import type { OrbPractice } from "@/lib/practice-bank/script";

export interface OrbMediaOptions {
  /** The sitting is running (paused stops the ambience). */
  active: boolean;
  ambience: boolean;
  haptics: boolean;
  beatId?: string;
  beatKind?: string;
}

/**
 * Ambient world + haptics for an orb practice.
 *
 * The generative Bience engine already knows how every world sounds, so the
 * practice only has to name its world. Haptics fire on bells, rest cues and
 * listening prompts — the three moments a body may be eyes-closed.
 */
export function useOrbMedia(practice: OrbPractice | null, options: OrbMediaOptions) {
  const engine = useMemo(() => getBienceEngine(), []);
  const audioSupported = useMemo(() => isAudioSupported(), []);
  const worldId = practice?.spec.worldId;

  useEffect(() => {
    if (!audioSupported) return;
    if (!practice || !options.ambience || !options.active) {
      engine.stop(0.5);
      return;
    }
    const world = WORLDS_BY_ID[worldId ?? ""] ?? WORLDS[0];
    const mix = worldMix(world.id);
    mix.master = 0.32;
    engine.start(mix, world).catch(() => undefined);
    return () => {
      engine.stop(0.7);
    };
  }, [engine, audioSupported, practice, worldId, options.ambience, options.active]);

  useEffect(() => {
    if (!options.haptics || !options.active || !options.beatId) return;
    if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
    const pattern =
      options.beatKind === "bell"
        ? [30, 50, 30]
        : options.beatKind === "rest"
          ? [60, 50, 60]
          : options.beatKind === "listen"
            ? [25]
            : null;
    if (pattern) navigator.vibrate(pattern);
  }, [options.haptics, options.active, options.beatId, options.beatKind]);

  return { engine, audioSupported };
}

export default useOrbMedia;
