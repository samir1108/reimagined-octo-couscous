// ObserveOrbScreen — full-screen observe orb while generating content
"use client";

import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import HomeOrb from "@/components/orb/HomeOrb";

interface ObserveOrbScreenProps {
  open: boolean;
  generating: boolean;
  ready: boolean;
  pollIntervalMs?: number;
  onHoldComplete: () => void;
  onTimeout?: () => void;
  maxWaitMs?: number;
}

export default function ObserveOrbScreen({
  open,
  generating,
  ready,
  pollIntervalMs = 1000,
  onHoldComplete,
  onTimeout,
  maxWaitMs = 30000,
}: ObserveOrbScreenProps) {
  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center space-y-8"
      >
        {/* The Home orb, while the sitting is woven */}
        <div className="relative h-48 w-48">
          <HomeOrb className="absolute inset-0" />
          {generating && (
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-sky-200/30 border-t-sky-300/60"
            />
          )}
        </div>

        <div className="text-center space-y-4">
          <motion.p
            key={generating ? "gen" : "ready"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-light text-white/80"
          >
            {generating ? "weaving your session…" : "session ready"}
          </motion.p>

          {generating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 text-sm text-white/40"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>generating…</span>
            </motion.div>
          )}

          {!generating && ready && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 text-sm text-sky-200"
            >
              <Sparkles className="w-5 h-5" />
              <span>ready — tap to begin</span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}