"use client";

import { forwardRef, type HTMLAttributes, useEffect, useRef, useState } from "react";
import { motion, type MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface OrbProps extends HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  state?: "dormant" | "breathing" | "held" | "shocked" | "active";
  intensity?: number; // 0-1
  onHoldComplete?: () => void;
  onActivate?: () => void;
  holdDuration?: number; // ms
  particles?: boolean;
  glow?: boolean;
  rotation?: boolean;
  className?: string;
}

const sizeMap = {
  xs: "var(--orb-size-xs)",
  sm: "var(--orb-size-sm)",
  md: "var(--orb-size-md)",
  lg: "var(--orb-size-lg)",
  xl: "var(--orb-size-xl)",
  "2xl": "var(--orb-size-2xl)",
} as const;

const glowRadiusMap = {
  xs: "var(--orb-glow-radius-sm)",
  sm: "var(--orb-glow-radius-md)",
  md: "var(--orb-glow-radius-lg)",
  lg: "var(--orb-glow-radius-xl)",
  xl: "var(--orb-glow-radius-xl)",
  "2xl": "var(--orb-glow-radius-xl)",
} as const;

export const Orb = forwardRef<HTMLDivElement, OrbProps>(
  (
    {
      size = "lg",
      state = "breathing",
      intensity = 0,
      onHoldComplete,
      onActivate,
      holdDuration = 1400,
      particles = true,
      glow = true,
      rotation = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [isHolding, setIsHolding] = useState(false);
    const [holdProgress, setHoldProgress] = useState(0);
    const [hasFired, setHasFired] = useState(false);
    const holdStartRef = useRef<number | null>(null);
    const animationFrameRef = useRef<number>();

    const orbSize = sizeMap[size];
    const glowRadius = glowRadiusMap[size];

    // Breathing animation
    useEffect(() => {
      if (state !== "breathing" && state !== "dormant") return;

      const animate = () => {
        // Breathing is handled by CSS animation
      };
      animate();
    }, [state]);

    // Hold progress animation
    useEffect(() => {
      if (!isHolding) {
        if (holdProgress > 0) {
          const start = holdProgress;
          const duration = 300;
          const startTime = performance.now();

          const animate = (now: number) => {
            const progress = Math.min(1, (now - startTime) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            setHoldProgress(start * (1 - eased));
            if (progress < 1) {
              animationFrameRef.current = requestAnimationFrame(animate);
            }
          };
          animationFrameRef.current = requestAnimationFrame(animate);
        }
        return;
      }

      const startTime = holdStartRef.current || performance.now();
      holdStartRef.current = startTime;

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / holdDuration);
        setHoldProgress(progress);

        if (progress >= 1 && !hasFired) {
          setHasFired(true);
          onHoldComplete?.();
          onActivate?.();
        }

        if (isHolding) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [isHolding, holdProgress, hasFired, holdDuration, onHoldComplete, onActivate]);

    const handlePointerDown = () => {
      if (state === "dormant") return;
      setIsHolding(true);
      setHasFired(false);
      holdStartRef.current = performance.now();
    };

    const handlePointerUp = () => {
      setIsHolding(false);
      holdStartRef.current = null;
    };

    const handlePointerLeave = () => {
      setIsHolding(false);
      holdStartRef.current = null;
    };

    // State-based styles
    const getStateStyles = () => {
      const base = {
        width: orbSize,
        height: orbSize,
      } as React.CSSProperties;

      switch (state) {
        case "dormant":
          return { ...base, opacity: 0.4 };
        case "held":
          return {
            ...base,
            transform: `scale(${1 + 0.08 * holdProgress})`,
            opacity: 0.8 + 0.2 * holdProgress,
          };
        case "shocked":
          return {
            ...base,
            boxShadow: `
              0 0 ${glowRadius} rgba(217,168,74,${0.3 + intensity * 0.3}),
              0 0 ${parseInt(glowRadius) * 2}px rgba(239,231,214,${0.15 + intensity * 0.15}),
              inset 0 0 ${parseInt(glowRadius) * 0.5}px rgba(255,255,255,${0.1 * intensity})
            `,
          };
        case "active":
          return {
            ...base,
            boxShadow: `
              0 0 ${glowRadius} rgba(217,168,74,0.4),
              0 0 ${parseInt(glowRadius) * 2}px rgba(16,185,129,0.2)
            `,
          };
        default: // breathing
          return base;
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex items-center justify-center",
          "touch-none select-none",
          className
        )}
        style={{ width: orbSize, height: orbSize }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerLeave}
        {...props}
      >
        {/* Outer Glow Rings */}
        {glow && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-orb-glow"
              style={{
                width: "120%",
                height: "120%",
                filter: "blur(60px)",
              }}
              animate={{
                scale: state === "breathing" ? [1, 1.08, 1] : 1 + intensity * 0.15,
                opacity: state === "breathing" ? [0.3, 0.6, 0.3] : 0.4 + intensity * 0.3,
              }}
              transition={{
                duration: 6,
                repeat: state === "breathing" ? Infinity : 0,
                ease: "easeInOut",
              }}
              aria-hidden="true"
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-orb-glow-intense"
              style={{
                width: "90%",
                height: "90%",
                filter: "blur(40px)",
              }}
              animate={{
                scale: state === "breathing" ? [1, 1.05, 1] : 1 + intensity * 0.1,
                opacity: state === "breathing" ? [0.2, 0.4, 0.2] : 0.3 + intensity * 0.2,
              }}
              transition={{
                duration: 8,
                repeat: state === "breathing" ? Infinity : 0,
                ease: "easeInOut",
                delay: 2,
              }}
              aria-hidden="true"
            />
          </>
        )}

        {/* Rotating Orb Shell */}
        <motion.div
          className="absolute inset-0 rounded-full border border-gold-400/10"
          style={{
            background: "linear-gradient(135deg, rgba(217,168,74,0.02) 0%, transparent 50%, rgba(217,168,74,0.02) 100%)",
          }}
          animate={{
            rotate: rotation ? 360 : 0,
            borderColor: [
              "rgba(217,168,74,0.1)",
              "rgba(217,168,74,0.3)",
              "rgba(217,168,74,0.1)",
            ],
          }}
          transition={{
            duration: 20,
            repeat: rotation ? Infinity : 0,
            ease: "linear",
          }}
          aria-hidden="true"
        />

        {/* Particles */}
        {particles && state !== "dormant" && (
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-gradient-to-r from-gold-300/30 via-gold-400/10 to-transparent"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                  width: 4 + Math.random() * 8,
                  height: 4 + Math.random() * 8,
                }}
                animate={{
                  opacity: state === "held" ? [0.2, 0.8, 0.2] : [0.1, 0.6, 0.1],
                  scale: state === "held" ? [0.5, 2, 0.5] : [0.5, 1.5, 0.5],
                  x: [0, (Math.random() - 0.5) * (state === "held" ? 60 : 40), 0],
                  y: [0, (Math.random() - 0.5) * (state === "held" ? 60 : 40), 0],
                }}
                transition={{
                  duration: state === "held" ? 3 : 8 + Math.random() * 6,
                  delay: Math.random() * 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        )}

        {/* Core Orb */}
        <motion.div
          className="relative z-10 rounded-full"
          style={{
            width: "100%",
            height: "100%",
            background: `
              radial-gradient(ellipse at 30% 30%, rgba(255,248,236,${0.3 + intensity * 0.3}) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 70%, rgba(217,168,74,${0.15 + intensity * 0.2}) 0%, transparent 50%),
              radial-gradient(ellipse at center, rgba(217,168,74,${0.08 + intensity * 0.1}) 0%, transparent 70%),
              var(--void-0)
            `,
            boxShadow: `
              inset 0 0 ${parseInt(orbSize) * 0.3}px rgba(217,168,74,${0.1 + intensity * 0.2}),
              inset 0 -${parseInt(orbSize) * 0.1}px ${parseInt(orbSize) * 0.2}px rgba(0,0,0,0.5),
              0 0 0 1px rgba(217,168,74,${0.1 + intensity * 0.2}),
              ${state === "shocked" ? `0 0 ${glowRadius} rgba(217,168,74,${0.5 + intensity * 0.3})` : ""}
              ${state === "active" ? `0 0 ${glowRadius} rgba(16,185,129,0.4)` : ""}
            `,
            ...getStateStyles(),
          }}
          animate={
            state === "breathing"
              ? {
                  scale: [1, 1.02, 1.04, 1.02, 1],
                  boxShadow: [
                    "inset 0 0 80px rgba(217,168,74,0.1), inset 0 -28px 56px rgba(0,0,0,0.5), 0 0 0 1px rgba(217,168,74,0.1), 0 0 40px rgba(217,168,74,0.15)",
                    "inset 0 0 100px rgba(217,168,74,0.15), inset 0 -32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(217,168,74,0.2), 0 0 60px rgba(217,168,74,0.25)",
                    "inset 0 0 120px rgba(217,168,74,0.2), inset 0 -36px 72px rgba(0,0,0,0.5), 0 0 0 1px rgba(217,168,74,0.25), 0 0 80px rgba(217,168,74,0.3)",
                    "inset 0 0 100px rgba(217,168,74,0.15), inset 0 -32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(217,168,74,0.2), 0 0 60px rgba(217,168,74,0.25)",
                    "inset 0 0 80px rgba(217,168,74,0.1), inset 0 -28px 56px rgba(0,0,0,0.5), 0 0 0 1px rgba(217,168,74,0.1), 0 0 40px rgba(217,168,74,0.15)",
                  ],
                }
              : state === "held"
              ? {
                  scale: 1 + 0.08 * holdProgress,
                }
              : {}
          }
          transition={
            state === "breathing"
              ? { duration: 12, repeat: Infinity, ease: "easeInOut" }
              : state === "held"
              ? { duration: 50, ease: "easeOut" }
              : { duration: 300, ease: [0.16, 1, 0.3, 1] }
          }
        >
          {/* Hold Progress Ring */}
          {isHolding && holdProgress > 0 && (
            <svg
              className="absolute inset-0 -rotate-90"
              viewBox="0 0 100 100"
              aria-hidden="true"
              style={{ filter: "drop-shadow(0 0 8px rgba(217,168,74,0.6))" }}
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(217,168,74,0.15)"
                strokeWidth="2"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--gold-400)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 45}
                style={{
                  strokeDashoffset: 2 * Math.PI * 45 * (1 - holdProgress),
                }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 45 * (1 - holdProgress),
                }}
                transition={{ duration: 50, ease: "linear" }}
              />
            </svg>
          )}

          {/* Shock Wave */}
          {state === "shocked" && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-gold-300"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              aria-hidden="true"
            />
          )}

          {/* Children (custom content) */}
          {children}
        </motion.div>

        {/* Hold Hint */}
        {state !== "dormant" && state !== "active" && !isHolding && !hasFired && (
          <motion.p
            className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 text-center text-micro text-text-muted/60 max-w-[280px] pointer-events-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 600, delay: 1200 }}
          >
            Hold to begin. No need to prepare — just arrive as you are.
          </motion.p>
        )}
      </div>
    );
  }
);

Orb.displayName = "Orb";

// Export a simplified version for the landing page hero
export const HeroOrb = forwardRef<HTMLDivElement, Omit<OrbProps, "onHoldComplete" | "onActivate" | "holdDuration">>(
  ({ className, ...props }, ref) => (
    <Orb
      ref={ref}
      size="2xl"
      state="breathing"
      particles={true}
      glow={true}
      rotation={true}
      className={className}
      {...props}
    />
  )
);

HeroOrb.displayName = "HeroOrb";