// OrbSession — session modal for daily practice
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/design-system";

interface OrbSessionProps {
  open: boolean;
  plan: any;
  onClose: () => void;
  onComplete: (outcome: string) => void;
}

export default function OrbSession({ open, plan, onClose, onComplete }: OrbSessionProps) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-card/95 backdrop-blur-xl rounded-2xl border border-border/30 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold">Session</h2>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full hover:bg-muted transition"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Your Plan</p>
              <p className="text-lg font-medium mt-1">{plan?.name || "Daily Practice"}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-2xl font-bold">{plan?.minutes || "10"}</p>
                <p className="text-xs text-muted-foreground">minutes</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-2xl font-bold">{plan?.energy || "calm"}</p>
                <p className="text-xs text-muted-foreground">energy</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-2xl font-bold">{plan?.guruId || "—"}</p>
                <p className="text-xs text-muted-foreground">guide</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => { onComplete("completed"); onClose(); }}
              >
                Begin Session
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}