/**
 * Temple Error Boundary & Error Display
 * Per temple.md Section 28: Temple-appropriate error messages
 * NEVER show: "Error 500", "Something went wrong", stack traces, raw JSON
 */
import { motion } from "framer-motion";
import { RefreshCw, Home, WifiOff } from "lucide-react";
import { useState, useCallback } from "react";
import { TEMPLE_ERRORS } from "@/temple/types";

interface TempleErrorProps {
  errorType: keyof typeof TEMPLE_ERRORS;
  onRetry?: () => void;
  onGoHome?: () => void;
}

export default function TempleError({ errorType, onRetry, onGoHome }: TempleErrorProps) {
  const error = TEMPLE_ERRORS[errorType] || TEMPLE_ERRORS.serverError;

  return (
    <motion.div
      className="flex flex-col items-center justify-center p-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-6"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {errorType === "networkLost" ? (
          <WifiOff className="w-6 h-6 text-white/30" />
        ) : (
          <span className="text-2xl">🕯️</span>
        )}
      </motion.div>

      <h3 className="text-white/70 text-lg font-display mb-2">{error.title}</h3>
      <p className="text-white/30 text-sm font-display leading-relaxed max-w-xs mb-6 whitespace-pre-line">
        {error.message}
      </p>

      <div className="flex gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/50 text-xs font-display tracking-wider hover:bg-white/[0.1] transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {error.action}
          </button>
        )}
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/50 text-xs font-display tracking-wider hover:bg-white/[0.1] transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            Enter Temple
          </button>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Error state hook with auto-retry
 */
export function useTempleError(initialError: keyof typeof TEMPLE_ERRORS | null = null) {
  const [error, setError] = useState<keyof typeof TEMPLE_ERRORS | null>(initialError);
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(
    async (fn: () => Promise<void>) => {
      if (retryCount >= 3) {
        setError("serverError");
        return;
      }

      try {
        await fn();
        setError(null);
        setRetryCount(0);
      } catch {
        setRetryCount((prev) => prev + 1);
        if (retryCount + 1 >= 3) {
          setError("serverError");
        }
      }
    },
    [retryCount]
  );

  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  return { error, setError, retry, clearError, retryCount };
}
