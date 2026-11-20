import { useBleHrv } from "@/hooks/useBleHrv";
import { Button } from "@/design-system";
import { motion } from "framer-motion";
import { Heart, Bluetooth } from "lucide-react";

/**
 * Live HRV "coherence ring" used inside The Witness practice.
 * Pulsates with BPM, color-shifts with RMSSD coherence (red→amber→green).
 */
export default function CoherenceRing({ size = 140 }: { size?: number }) {
  const { connected, bpm, rmssd, coherence, error, connect, disconnect } = useBleHrv();

  const hue = Math.round(coherence * 130); // 0=red, 130=green
  const ringColor = `hsl(${hue}, 80%, 55%)`;
  const beatDuration = bpm ? 60 / bpm : 1;

  if (!connected) {
    return (
      <div className="flex flex-col items-center gap-3 p-4">
        <Button variant="outline" onClick={connect} className="gap-2">
          <Bluetooth className="w-4 h-4" />
          Connect HRV strap
        </Button>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <p className="text-[10px] text-muted-foreground max-w-[220px] text-center">
          Optional. Polar H10 / Movesense / any BLE HR strap. Live HRV stays on device, only
          per-30s RMSSD is ingested.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: size,
          height: size,
          boxShadow: `0 0 ${20 + coherence * 30}px ${ringColor}`,
          border: `2px solid ${ringColor}`,
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: beatDuration, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="text-center">
          <Heart className="w-5 h-5 mx-auto mb-1" style={{ color: ringColor }} />
          <div className="text-2xl font-light">{bpm ?? "--"}</div>
          <div className="text-[10px] text-muted-foreground">
            RMSSD {rmssd ? Math.round(rmssd) : "--"} ms
          </div>
        </div>
      </motion.div>
      <button
        onClick={disconnect}
        className="text-[10px] text-muted-foreground hover:text-foreground"
      >
        disconnect
      </button>
    </div>
  );
}
