"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Portal } from "./Portal";

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  delay?: number;
  skipDelayDuration?: number;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Tooltip({
  content,
  children,
  side = "top",
  align = "center",
  delay = 200,
  skipDelayDuration = 300,
  defaultOpen,
  open: controlledOpen,
  onOpenChange,
}: TooltipProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number>();
  const skipTimeoutRef = useRef<number>();
  const childRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = (value: boolean) => {
    if (!isControlled) setUncontrolledOpen(value);
    onOpenChange?.(value);
  };

  useEffect(() => {
    if (open) {
      timeoutRef.current = window.setTimeout(() => {
        setIsVisible(true);
      }, delay);
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsVisible(false);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [open, delay]);

  useEffect(() => {
    if (isVisible) {
      skipTimeoutRef.current = window.setTimeout(() => {
        setOpen(false);
      }, skipDelayDuration);
    }
    return () => {
      if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current);
    };
  }, [isVisible, skipDelayDuration, setOpen]);

  const handleMouseEnter = () => setOpen(true);
  const handleMouseLeave = () => setOpen(false);
  const handleFocus = () => setOpen(true);
  const handleBlur = () => setOpen(false);

  const childProps = {
    ref: childRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    "aria-describedby": isVisible ? "tooltip-content" : undefined,
  };

  const sideStyles = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const alignStyles = {
    start: side === "top" || side === "bottom" ? "left-0 -translate-x-0" : "top-0 -translate-y-0",
    center: side === "top" || side === "bottom" ? "left-1/2 -translate-x-1/2" : "top-1/2 -translate-y-1/2",
    end: side === "top" || side === "bottom" ? "right-0 -translate-x-0" : "bottom-0 -translate-y-0",
  };

  const arrowStyles = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-gold-border",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-gold-border",
    left: "left-full top-1/2 -translate-y-1/2 border-l-gold-border",
    right: "right-full top-1/2 -translate-y-1/2 border-r-gold-border",
  };

  if (!isVisible) {
    return (
      <div className="inline-block" {...childProps}>
        {children}
      </div>
    );
  }

  return (
    <div className="inline-block relative" {...childProps}>
      {children}
      <Portal>
        <div
          ref={tooltipRef}
          id="tooltip-content"
          role="tooltip"
          className={cn(
            "fixed z-[var(--z-tooltip)] glass-gold px-3 py-2 text-caption text-primary-gold whitespace-nowrap",
            "rounded-lg shadow-lg pointer-events-none",
            "animate-in fade-in-0 zoom-in-95 duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]",
            sideStyles[side],
            alignStyles[align]
          )}
          style={{
            "--radix-tooltip-content-transform-origin": side === "top" || side === "bottom" ? "center" : "center",
          }}
        >
          {content}
          <div
            className={cn(
              "absolute w-0 h-0 border-4 border-transparent",
              arrowStyles[side]
            )}
          />
        </div>
      </Portal>
    </div>
  );
}

interface PortalProps {
  children: ReactNode;
  container?: HTMLElement | null;
}

function Portal({ children, container }: PortalProps) {
  const [mounted, setMounted] = useState(false);
  const targetRef = useRef<HTMLElement>(container ?? document.body);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return ReactDOM.createPortal(children, targetRef.current);
}

import ReactDOM from "react-dom";