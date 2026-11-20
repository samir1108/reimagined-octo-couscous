import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Minimize2 } from "lucide-react";

interface ImmersivePracticeProps {
  open: boolean;
  title: string;
  prompt?: string;
  onClose: () => void;
  /** The practice surface itself — orb, timer, counters */
  children: ReactNode;
}

/**
 * ImmersivePractice — full-screen practice stage.
 * The orb returns as the practice surface; chrome disappears,
 * the session becomes a room instead of a card.
 */
export function ImmersivePractice({ open, title, prompt, onClose, children }: ImmersivePracticeProps) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="immersive-practice"
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse at 50% 32%, hsl(var(--primary) / 0.12) 0%, hsl(var(--background) / 0.98) 55%, hsl(var(--background)) 100%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Soft breathing halo behind the practice */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, hsl(var(--primary) / 0.10) 0%, transparent 60%)",
            }}
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          <button
            onClick={onClose}
            aria-label="Return from the practice"
            className="absolute top-5 right-5 z-20 w-11 h-11 rounded-full flex items-center justify-center bg-card/40 backdrop-blur-md border border-border/30 text-muted-foreground hover:text-foreground transition"
          >
            <Minimize2 className="w-4 h-4" />
          </button>

          <div className="absolute top-7 left-0 right-0 z-10 text-center px-6">
            <p className="text-[10px] font-display uppercase tracking-[0.35em] text-muted-foreground/70">
              {title}
            </p>
          </div>

          <div className="relative z-10 flex flex-col items-center px-6 text-center">
            {prompt && (
              <p className="mb-8 max-w-md text-sm text-foreground/90 leading-relaxed">
                {prompt}
              </p>
            )}
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
