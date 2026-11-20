import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Wind, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/design-system";

interface SacredExitProps {
  /** Where the resistance happened. Auto-derived from current path if omitted. */
  context?: string;
  position?: string;
  returnTo?: string;
  className?: string;
  label?: string;
  /** "text" inline link, or "icon" topbar button. */
  variant?: "text" | "icon";
}

/**
 * "Too much today" — the sacred exit door.
 * The mind that resists is the mind we came to meet.
 */
export function SacredExitButton({
  context,
  position,
  returnTo = "/app",
  className = "",
  label = "Too much today",
  variant = "text",
}: SacredExitProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const resolvedContext = context ?? `route:${location.pathname}`;

  const trigger =
    variant === "icon" ? (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <motion.button
            onClick={() => setOpen(true)}
            className={`w-8 h-8 rounded-lg glass-subtle flex items-center justify-center text-muted-foreground hover:text-primary transition-all ${className}`}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            aria-label="Too much today — sacred exit"
          >
            <Wind className="w-3.5 h-3.5" />
          </motion.button>
        </TooltipTrigger>
        <TooltipContent className="font-body text-xs">Too much today</TooltipContent>
      </Tooltip>
    ) : (
      <button
        onClick={() => setOpen(true)}
        className={`text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors underline-offset-4 hover:underline ${className}`}
      >
        {label}
      </button>
    );

  return (
    <>
      {trigger}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <SacredBreathExit
                context={resolvedContext}
                position={position}
                returnTo={returnTo}
                onDone={() => setOpen(false)}
              />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

function SacredBreathExit({
  context,
  position,
  returnTo,
  onDone,
}: {
  context: string;
  position?: string;
  returnTo: string;
  onDone: () => void;
}) {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [logged, setLogged] = useState(false);

  // Log the resistance — fire and forget.
  useEffect(() => {
    if (logged) return;
    setLogged(true);
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from("consciousness_signals" as any).insert({
          user_id: user.id,
          signal_type: "sacred_exit",
          source: context,
          payload: {
            kind: "resistance",
            context,
            position: position ?? null,
            note: "User chose the sacred exit. Resistance is the doorway.",
          },
        });
      } catch {
        // Silent — meditative contexts must never throw at the user.
      }
    })();
  }, [logged, context, position]);

  // Countdown
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const phase = secondsLeft % 8; // 4 in, 4 out
  const inhaling = phase >= 4;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center px-6"
    >
      {/* Close button */}
      <button
        onClick={onDone}
        aria-label="Close"
        className="absolute top-5 right-5 w-10 h-10 rounded-full glass-subtle flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Breathing orb */}
      <motion.div
        animate={{
          scale: inhaling ? 1.4 : 0.85,
          opacity: inhaling ? 0.95 : 0.55,
        }}
        transition={{ duration: 4, ease: "easeInOut" }}
        className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/40 via-primary/20 to-transparent blur-md mb-10"
      />

      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70 mb-3">
        {inhaling ? "Breathe in" : "Breathe out"}
      </p>

      <p className="font-display text-lg sm:text-xl text-center max-w-md leading-relaxed text-foreground/90 mb-2">
        The mind that resists is the mind we came to meet.
      </p>
      <p className="text-sm text-muted-foreground text-center max-w-md leading-relaxed mb-10">
        Just breathe. We'll continue when you return. Nothing is lost.
      </p>

      {secondsLeft > 0 ? (
        <p className="text-xs text-muted-foreground/50">{secondsLeft}s</p>
      ) : (
        <div className="flex flex-col gap-2 items-center">
          <button
            onClick={() => {
              onDone();
              navigate(returnTo);
            }}
            className="px-6 py-2.5 rounded-full bg-primary/15 hover:bg-primary/25 text-sm text-foreground transition-colors"
          >
            Rest now
          </button>
          <button
            onClick={onDone}
            className="text-xs text-muted-foreground/60 hover:text-muted-foreground mt-1"
          >
            Stay a little longer
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default SacredExitButton;
