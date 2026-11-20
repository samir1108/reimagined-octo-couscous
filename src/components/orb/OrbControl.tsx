import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export interface OrbGestureState {
  charge: number;
  holding: boolean;
  pointer: { x: number; y: number };
}

const HOLD_MS = 900;
const TAP_WINDOW_MS = 320;
const RING_R = 48;
const RING_C = 2 * Math.PI * RING_R;

interface OrbControlProps {
  children: (state: OrbGestureState) => ReactNode;
  onActivate?: () => void;
  onHold?: () => void;
  onDouble?: () => void;
  onTriple?: () => void;
  ariaLabel?: string;
  className?: string;
}

export default function OrbControl({
  children,
  onActivate,
  onHold,
  onDouble,
  onTriple,
  ariaLabel = "Consciousness orb",
  className = "",
}: OrbControlProps) {
  const [charge, setCharge] = useState(0);
  const [holding, setHolding] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const downAtRef = useRef(0);
  const holdFiredRef = useRef(false);
  const tapsRef = useRef(0);
  const tapTimerRef = useRef<number | null>(null);
  const activePointerRef = useRef<number | null>(null);
  const callbacksRef = useRef({ onActivate, onHold, onDouble, onTriple });
  callbacksRef.current = { onActivate, onHold, onDouble, onTriple };

  const stopCharge = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    setHolding(false);
    setCharge(0);
  }, []);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (tapTimerRef.current) window.clearTimeout(tapTimerRef.current);
    },
    [],
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerRef.current !== null) return;
    activePointerRef.current = e.pointerId;
    downAtRef.current = performance.now();
    holdFiredRef.current = false;
    setHolding(true);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // pointer capture unsupported — pointerup still handled via leave/cancel
    }
    const tick = () => {
      const elapsed = performance.now() - downAtRef.current;
      const c = Math.min(1, elapsed / HOLD_MS);
      setCharge(c);
      if (c >= 1 && !holdFiredRef.current) {
        holdFiredRef.current = true;
        callbacksRef.current.onHold?.();
      }
      if (c < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPointer({
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -(((e.clientY - rect.top) / rect.height) * 2 - 1),
    });
  };

  const finish = (e: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    if (activePointerRef.current !== e.pointerId) return;
    activePointerRef.current = null;
    const wasHold = holdFiredRef.current;
    stopCharge();
    if (wasHold || cancelled) {
      tapsRef.current = 0;
      return;
    }
    tapsRef.current += 1;
    const n = tapsRef.current;
    if (tapTimerRef.current) window.clearTimeout(tapTimerRef.current);
    tapTimerRef.current = window.setTimeout(() => {
      tapsRef.current = 0;
      if (n === 1) callbacksRef.current.onActivate?.();
      else if (n === 2) callbacksRef.current.onDouble?.();
      else if (n >= 3) callbacksRef.current.onTriple?.();
    }, TAP_WINDOW_MS);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      callbacksRef.current.onActivate?.();
    }
  };

  return (
    <div
      ref={rootRef}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      className={`relative aspect-square w-full touch-none select-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(e) => finish(e, false)}
      onPointerCancel={(e) => finish(e, true)}
      onPointerLeave={() => {
        if (holding) {
          activePointerRef.current = null;
          stopCharge();
        }
      }}
      onKeyDown={handleKeyDown}
    >
      {children({ charge, holding, pointer })}
      <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <circle cx="50" cy="50" r={RING_R} fill="none" stroke="currentColor" strokeOpacity="0.14" strokeWidth="1" />
        <circle
          cx="50"
          cy="50"
          r={RING_R}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray={RING_C}
          strokeDashoffset={RING_C * (1 - charge)}
          transform="rotate(-90 50 50)"
          className="text-primary"
          strokeOpacity={charge > 0 ? 0.9 : 0}
          style={{ transition: holding ? "none" : "stroke-dashoffset 0.4s ease, stroke-opacity 0.4s ease" }}
        />
      </svg>
    </div>
  );
}
