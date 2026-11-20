// PermissionsGate — pre-flight screen that explains and requests sensors
// (mic / camera) BEFORE the game starts, so prompts don't hit cold.
// Silent on failure: if user denies, game still proceeds (most games degrade gracefully).

import { useState } from "react";
import { motion } from "framer-motion";

export interface SensorNeeds {
  mic?: boolean;
  camera?: boolean;
}

interface Props {
  needs: SensorNeeds;
  gameName: string;
  onReady: () => void;
}

export default function PermissionsGate({ needs, gameName, onReady }: Props) {
  const [requesting, setRequesting] = useState(false);
  const [status, setStatus] = useState<{ mic?: boolean; cam?: boolean }>({});

  const askPermissions = async () => {
    setRequesting(true);
    const next: { mic?: boolean; cam?: boolean } = {};
    try {
      if (needs.mic) {
        try {
          const s = await navigator.mediaDevices.getUserMedia({ audio: true });
          s.getTracks().forEach((t) => t.stop());
          next.mic = true;
        } catch {
          next.mic = false;
        }
      }
      if (needs.camera) {
        try {
          const s = await navigator.mediaDevices.getUserMedia({ video: true });
          s.getTracks().forEach((t) => t.stop());
          next.cam = true;
        } catch {
          next.cam = false;
        }
      }
    } finally {
      setStatus(next);
      setRequesting(false);
      // Brief pause so user sees the result, then proceed.
      setTimeout(() => onReady(), 600);
    }
  };

  const items: Array<{ key: "mic" | "cam"; label: string; why: string }> = [];
  if (needs.mic) items.push({ key: "mic", label: "Microphone", why: "to sense your breath, voice, or stillness" });
  if (needs.camera) items.push({ key: "cam", label: "Camera", why: "to sense gaze, presence, or light" });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center px-8 text-center"
    >
      <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-3">prepare</p>
      <h2 className="text-xl font-light text-white/85 mb-2">{gameName}</h2>
      <p className="text-sm text-white/55 max-w-sm mb-10">
        This practice listens through your senses. Nothing leaves your device.
      </p>

      <div className="space-y-4 mb-10 w-full max-w-xs">
        {items.map((it) => {
          const s = status[it.key];
          return (
            <div
              key={it.key}
              className="flex items-center justify-between border border-white/10 rounded-xl px-4 py-3 text-left"
            >
              <div>
                <p className="text-sm text-white/85">{it.label}</p>
                <p className="text-[11px] text-white/40">{it.why}</p>
              </div>
              <span className="text-[11px] uppercase tracking-wider">
                {s === true && <span className="text-emerald-400/80">on</span>}
                {s === false && <span className="text-rose-400/70">off</span>}
                {s === undefined && <span className="text-white/30">—</span>}
              </span>
            </div>
          );
        })}
      </div>

      <button
        onClick={askPermissions}
        disabled={requesting}
        className="px-8 py-3 border border-white/30 rounded-full text-sm tracking-wide hover:bg-white/5 transition disabled:opacity-50"
      >
        {requesting ? "asking…" : "allow & continue"}
      </button>

      <button
        onClick={onReady}
        className="mt-6 text-xs text-white/35 hover:text-white/70 transition"
      >
        skip — continue without sensors
      </button>
    </motion.div>
  );
}
