"use client";

import { Fragment, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
  side?: "bottom" | "right" | "left" | "top";
  size?: "sm" | "md" | "lg" | "full";
  showClose?: boolean;
}

export function Sheet({
  open,
  onClose,
  children,
  title,
  description,
  side = "bottom",
  size = "md",
  showClose = true,
}: SheetProps) {
  if (!open) return null;

  const sideStyles = {
    bottom: "fixed bottom-0 left-0 right-0 rounded-t-[var(--radius-section)] max-h-[85vh] animate-slide-up",
    top: "fixed top-0 left-0 right-0 rounded-b-[var(--radius-section)] max-h-[85vh] animate-slide-down",
    right: "fixed right-0 top-0 bottom-0 rounded-l-[var(--radius-section)] max-w-[85vw] animate-slide-left",
    left: "fixed left-0 top-0 bottom-0 rounded-r-[var(--radius-section)] max-w-[85vw] animate-slide-right",
  };

  const sizeStyles = {
    sm: side === "bottom" || side === "top" ? "h-[30vh]" : "w-[30vw]",
    md: side === "bottom" || side === "top" ? "h-[50vh]" : "w-[50vw]",
    lg: side === "bottom" || side === "top" ? "h-[70vh]" : "w-[70vw]",
    full: side === "bottom" || side === "top" ? "h-[90vh]" : "w-[90vw]",
  };

  const isVertical = side === "bottom" || side === "top";

  return (
    <Fragment>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[var(--z-modal)] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "flex flex-col z-[calc(var(--z-modal)+1)] glass-card bg-elevated/95",
          sideStyles[side],
          sizeStyles[size],
          isVertical ? "w-full" : "h-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "sheet-title" : undefined}
        aria-describedby={description ? "sheet-description" : undefined}
      >
        {(title || showClose) && (
          <div className="flex items-start justify-between p-6 border-b border-card">
            <div>
              {title && (
                <h2 id="sheet-title" className="text-card-heading text-primary">
                  {title}
                </h2>
              )}
              {description && (
                <p id="sheet-description" className="text-secondary text-muted mt-1">
                  {description}
                </p>
              )}
            </div>
            {showClose && (
              <Button
                variant="icon"
                size="sm"
                onClick={onClose}
                aria-label="Close"
                className="text-muted hover:text-primary"
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