import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/design-system";
import { Clock, User, Sparkles } from "lucide-react";

interface SessionHandoffProps {
  acknowledgment: string;
  nextPreview: string;
  estMinutes: number;
  activity?: string;
  master?: string;
  onContinue: () => void;
  onNewTheme: () => void;
  isLastSession?: boolean;
  autoAdvanceMs?: number;
  onAutoAdvance?: () => void;
}

export default function SessionHandoff({
  acknowledgment,
  nextPreview,
  estMinutes,
  activity,
  master,
  onContinue,
  onNewTheme,
  isLastSession,
  autoAdvanceMs = 3000,
  onAutoAdvance,
}: SessionHandoffProps) {
  const [countdown, setCountdown] = useState(Math.ceil(autoAdvanceMs / 1000));

  useEffect(() => {
    if (autoAdvanceMs <= 0 || !onAutoAdvance) return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          onAutoAdvance();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [autoAdvanceMs, onAutoAdvance]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md rounded-3xl border border-border/40 bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl"
      >
        {/* Acknowledgment */}
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground/60 mb-3">
          Session complete
        </p>
        <p className="text-base text-foreground/85 italic leading-relaxed mb-6">
          "{acknowledgment}"
        </p>

        {/* Divider */}
        <div className="h-px bg-border/30 mb-6" />

        {/* Next preview */}
        <p className="text-sm text-foreground/80 leading-relaxed mb-4">
          {nextPreview}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>~{estMinutes} min</span>
          </div>
          {activity && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              <span className="capitalize">{activity}</span>
            </div>
          )}
          {master && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{master}</span>
            </div>
          )}
        </div>

        {/* Countdown */}
        {autoAdvanceMs > 0 && onAutoAdvance && (
          <p className="text-[11px] text-muted-foreground/60 mb-4 text-center">
            Returning home in {countdown}s
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {isLastSession ? (
            <Button onClick={onNewTheme} className="w-full rounded-full" size="lg">
              Seal the day
            </Button>
          ) : (
            <>
              <Button onClick={onContinue} className="w-full rounded-full" size="lg">
                Continue
              </Button>
              <Button
                onClick={onNewTheme}
                variant="ghost"
                className="w-full rounded-full text-xs text-muted-foreground"
              >
                New theme
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
