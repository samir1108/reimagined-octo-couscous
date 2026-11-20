/**
 * GlobalErrorRedirect
 * Only redirect to /app/credits when the error/toast is actually about
 * credits (insufficient balance, out of credits, payment required, etc).
 * Other errors are left alone.
 */
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast as sonner } from "sonner";

const TARGET = "/app/credits";
let lastRedirect = 0;

const CREDIT_RE =
  /\b(credit|credits|insufficient|out of credits?|not enough credits?|top ?up|recharge|payment required|402|low balance|no balance)\b/i;

function isCreditMessage(input: unknown): boolean {
  if (!input) return false;
  const s =
    typeof input === "string"
      ? input
      : typeof (input as any)?.message === "string"
      ? (input as any).message
      : (() => {
          try { return JSON.stringify(input); } catch { return ""; }
        })();
  return CREDIT_RE.test(s);
}

export default function GlobalErrorRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const go = () => {
      const now = Date.now();
      if (now - lastRedirect < 1500) return;
      if (location.pathname.startsWith(TARGET)) return;
      lastRedirect = now;
      navigate(TARGET);
    };

    // Patch sonner toast.error — redirect only when the toast text is credits-related.
    const origError = sonner.error;
    (sonner as any).error = (...args: unknown[]) => {
      try {
        const [msg, opts] = args as [unknown, any];
        if (isCreditMessage(msg) || isCreditMessage(opts?.description)) go();
      } catch { /* ignore */ }
      return (origError as any).apply(sonner, args);
    };

    const onErr = (e: ErrorEvent) => {
      if (isCreditMessage(e.message) || isCreditMessage(e.error)) go();
    };
    const onRej = (e: PromiseRejectionEvent) => {
      if (isCreditMessage(e.reason)) go();
    };
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);

    return () => {
      (sonner as any).error = origError;
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRej);
    };
  }, [navigate, location.pathname]);

  return null;
}
