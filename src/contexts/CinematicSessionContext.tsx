/**
 * CinematicSessionContext
 * ───────────────────────
 * Global mount point for cinematic immersive sessions. Any surface (Guide,
 * Practice, Witness, etc.) can call `play(scriptId|practice)` to trigger
 * the full-screen overlay. Mounted once in AppLayout.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import CinematicSession from "@/components/cinematic/CinematicSession";
import { pickScript } from "@/lib/cinematic/registry";
import type { CinematicScript } from "@/lib/cinematic/types";
import type { Practice } from "@/lib/sutra/practices";

interface PlayingState {
  script: CinematicScript;
  layerIdx: number;
  guruImage?: string;
  guruName?: string;
  onComplete?: () => void;
  onExit?: () => void;
}

interface API {
  isPlaying: boolean;
  play: (opts: {
    scriptId?: string;
    practice?: Practice;
    userId?: string | null;
    guruImage?: string;
    guruName?: string;
    onComplete?: () => void;
    onExit?: () => void;
  }) => Promise<boolean>;
  stop: () => void;
}

const Ctx = createContext<API | null>(null);

export function CinematicSessionProvider({ children }: { children: ReactNode }) {
  const [playing, setPlaying] = useState<PlayingState | null>(null);

  const play = useCallback<API["play"]>(async (opts) => {
    const res = await pickScript({
      scriptId: opts.scriptId,
      practice: opts.practice,
      userId: opts.userId ?? null,
    });
    if (!res) return false;
    setPlaying({
      script: res.script,
      layerIdx: res.layerIdx,
      guruImage: opts.guruImage,
      guruName: opts.guruName,
      onComplete: opts.onComplete,
      onExit: opts.onExit,
    });
    return true;
  }, []);

  const stop = useCallback(() => setPlaying(null), []);

  const value = useMemo<API>(
    () => ({ isPlaying: !!playing, play, stop }),
    [playing, play, stop],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {playing && (
        <CinematicSession
          script={playing.script}
          layerIdx={playing.layerIdx}
          guruImage={playing.guruImage}
          guruName={playing.guruName}
          onComplete={() => {
            const cb = playing.onComplete;
            setPlaying(null);
            cb?.();
          }}
          onExit={() => {
            const cb = playing.onExit;
            setPlaying(null);
            cb?.();
          }}
        />
      )}
    </Ctx.Provider>
  );
}

export function useCinematicSession(): API {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useCinematicSession must be inside <CinematicSessionProvider>");
  }
  return ctx;
}
