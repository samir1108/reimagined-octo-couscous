import { createContext, useContext, type ReactNode } from "react";
import { useSoundSystem } from "@/hooks/useSoundSystem";

type SoundType = "tap" | "success" | "toggle" | "notification" | "navigate" | "error";

interface SoundContextValue {
  soundEnabled: boolean;
  toggleSound: () => void;
  playSound: (type: SoundType) => void;
  /** Getter for the shared AudioContext (for ambient audio, etc.) */
  getAudioContext: () => AudioContext | null;
}

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const sound = useSoundSystem();

  return (
    <SoundContext.Provider value={sound}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used within SoundProvider");
  return ctx;
}

/** Access the shared AudioContext getter (for ambient audio, etc.) */
export function useAudioContext() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useAudioContext must be used within SoundProvider");
  return ctx.getAudioContext;
}