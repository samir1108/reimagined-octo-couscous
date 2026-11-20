"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import OversoulOrbPure from "@/components/orb/OversoulOrbPure";
import { GateId } from "@/lib/consciousness/dailyGates";

interface ConsciousnessOrbProps {
  gate: GateId;
  size?: "mobile" | "tablet" | "desktop" | "large";
  onTap?: () => void;
  onHold?: () => void;
  onDoubleTap?: () => void;
  onTripleTap?: () => void;
  onHoldProgress?: (progress: number) => void;
  className?: string;
  "aria-label"?: string;
}

const SIZE_MAP = {
  mobile: 280,
  tablet: 320,
  desktop: 360,
  large: 400,
};

const HOLD_DURATION = 4500;

export default function ConsciousnessOrb({
  gate,
  size = "desktop",
  onTap,
  onHold,
  onDoubleTap,
  onTripleTap,
  onHoldProgress,
  className = "",
  "aria-label": ariaLabel = "Living consciousness orb",
}: ConsciousnessOrbProps) {
  const orbRef = useRef<HTMLDivElement>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const holdStartRef = useRef<number>(0);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<number>(0);

  const orbSize = SIZE_MAP[size];

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0 && e.type !== "touchstart") return;

    const now = performance.now();
    holdStartRef.current = now;
    setIsHolding(true);
    setHoldProgress(0);

    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
      tapTimerRef.current = null;
    }

    const timeSinceLastTap = now - lastTapRef.current;
    if (timeSinceLastTap < 400) {
      setTapCount((c) => c + 1);
    } else {
      setTapCount(1);
    }
    lastTapRef.current = now;

    holdIntervalRef.current = setInterval(() => {
      const elapsed = performance.now() - holdStartRef.current;
      const progress = Math.min(1, elapsed / HOLD_DURATION);
      setHoldProgress(progress);
      onHoldProgress?.(progress);

      if (progress >= 1) {
        if (holdIntervalRef.current) {
          clearInterval(holdIntervalRef.current);
          holdIntervalRef.current = null;
        }
        setIsHolding(false);
        setHoldProgress(0);
        onHold?.();
      }
    }, 50);

    orbRef.current?.setPointerCapture(e.pointerId);
  }, [onHold, onHoldProgress]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }

    const wasHolding = isHolding;
    setIsHolding(false);
    setHoldProgress(0);

    if (!wasHolding) {
      tapTimerRef.current = setTimeout(() => {
        const count = tapCount;
        if (count >= 3 && onTripleTap) {
          onTripleTap();
        } else if (count >= 2 && onDoubleTap) {
          onDoubleTap();
        } else if (count === 1 && onTap) {
          onTap();
        }
        setTapCount(0);
      }, 400);
    }

    orbRef.current?.releasePointerCapture(e.pointerId);
  }, [isHolding, tapCount, onTap, onDoubleTap, onTripleTap]);

  const handlePointerCancel = useCallback(() => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  }, []);

  const handlePointerLeave = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "mouse" || e.pointerType === "pen") {
      handlePointerCancel();
    }
  }, [handlePointerCancel]);

  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    };
  }, []);

  const gateAriaLabels: Record<GateId, string> = {
    morning: "Morning gate - Awakening energy",
    midday: "Midday gate - Presence energy",
    evening: "Evening gate - Integration energy",
    night: "Night gate - Sanctuary energy",
  };

  return (
    <div
      ref={orbRef}
      className={`relative ${className}`}
      style={{
        width: orbSize,
        height: orbSize,
        maxWidth: "100%",
        maxHeight: "100%",
        touchAction: "none",
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerLeave}
      role="button"
      tabIndex={0}
      aria-label={`${ariaLabel}. ${gateAriaLabels[gate]}. Hold for 4.5 seconds to begin a session.`}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          handlePointerDown(e as unknown as React.PointerEvent);
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          handlePointerUp(e as unknown as React.PointerEvent);
        }
      }}
    >
      <OversoulOrbPure
        onActivate={onHold}
        onHoldComplete={onHold}
        onDoubleTap={onDoubleTap}
        onTripleTap={onTripleTap}
        className="w-full h-full"
      />

      {isHolding && holdProgress > 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ borderRadius: "50%" }}
          aria-hidden="true"
        >
          <svg
            className="w-full h-full max-w-[200px] max-h-[200px] -rotate-90"
            viewBox="0 0 100 100"
            style={{ filter: "drop-shadow(0 0 8px hsl(var(--primary)))" }}
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 45}
              strokeDashoffset={2 * Math.PI * 45 * (1 - holdProgress)}
            />
          </svg>
        </div>
      )}

      <div className="absolute bottom-[-36px] left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <p className="text-[9px] font-display tracking-[0.25em] uppercase text-muted-foreground">
          {isHolding ? `Hold... ${Math.round(holdProgress * 100)}%` : "Hold to begin"}
        </p>
      </div>
    </div>
  );
}
