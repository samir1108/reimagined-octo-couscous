"use client";

import { Fragment, type ReactNode, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { Portal } from "./Portal";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
  side?: "left" | "right" | "top" | "bottom";
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showClose?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

export function Drawer({
  open,
  onClose,
  children,
  title,
  description,
  side = "right",
  size = "md",
  showClose = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
}: DrawerProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEscape) {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const sideStyles = {
    left: "fixed left-0 top-0 bottom-0 rounded-r-[var(--radius-2xl)] animate-slide-right",
    right: "fixed right-0 top-0 bottom-0 rounded-l-[var(--radius-2xl)] animate-slide-left",
    top: "fixed top-0 left-0 right-0 rounded-b-[var(--radius-2xl)] animate-slide-down",
    bottom: "fixed bottom-0 left-0 right-0 rounded-t-[var(--radius-2xl)] animate-slide-up",
  };

  const sizeStyles = {
    sm: side === "left" || side === "right" ? "w-[30vw]" : "h-[30vh]",
    md: side === "left" || side === "right" ? "w-[50vw]" : "h-[50vh]",
    lg: side === "left" || side === "right" ? "w-[70vw]" : "h-[70vh]",
    xl: side === "left" || side === "right" ? "w-[85vw]" : "h-[85vh]",
    full: side === "left" || side === "right" ? "w-full" : "h-full",
  };

  const isVertical = side === "left" || side === "right";

  return (
    <Fragment>
      <Portal>
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[var(--z-modal)] animate-fade-in"
          onClick={closeOnOverlayClick ? onClose : undefined}
          aria-hidden="true"
        />
      </Portal>
      <Portal>
        <div
          className={cn(
            "flex flex-col z-[calc(var(--z-modal)+1)] glass-card bg-surface/95",
            sideStyles[side],
            sizeStyles[size],
            isVertical ? "h-full" : "w-full",
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "drawer-title" : undefined}
          aria-describedby={description ? "drawer-description" : undefined}
        >
          {(title || showClose) && (
            <div className="flex items-start justify-between p-6 border-b border-border flex-shrink-0">
              <div className={isVertical ? "w-full" : ""}>
                {title && (
                  <h2 id="drawer-title" className="text-h4 text-primary">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="drawer-description" className="text-caption text-muted mt-1">
                    {description}
                  </p>
                )}
              </div>
              {showClose && (
                <Button
                  variant="icon"
                  size="sm"
                  onClick={onClose}
                  aria-label="Close drawer"
                  className="text-muted hover:text-primary flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </Portal>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slide-down {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slide-left {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slide-right {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 200ms ease-out; }
        .animate-slide-up { animation: slide-up 300ms cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slide-down { animation: slide-down 300ms cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slide-left { animation: slide-left 300ms cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slide-right { animation: slide-right 300ms cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </Fragment>
  );
}