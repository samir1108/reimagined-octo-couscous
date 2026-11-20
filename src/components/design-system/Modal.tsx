"use client";

import { Fragment, type ReactNode, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { Portal } from "./Portal";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showClose?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

export function Modal({
  open,
  onClose,
  children,
  title,
  description,
  size = "md",
  showClose = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
}: ModalProps) {
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

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-4xl",
  };

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
            "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[calc(var(--z-modal)+1)]",
            "glass-card bg-surface/95 w-full mx-4 max-h-[85vh]",
            "animate-slide-up",
            sizes[size],
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
          aria-describedby={description ? "modal-description" : undefined}
        >
          {(title || showClose) && (
            <div className="flex items-start justify-between p-6 border-b border-border">
              <div>
                {title && (
                  <h2 id="modal-title" className="text-h4 text-primary">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="modal-description" className="text-caption text-muted mt-1">
                    {description}
                  </p>
                )}
              </div>
              {showClose && (
                <Button
                  variant="icon"
                  size="sm"
                  onClick={onClose}
                  aria-label="Close modal"
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
      </Portal>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translate(-50%, -50%) scale(0.95); opacity: 0; }
          to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 200ms ease-out; }
        .animate-slide-up { animation: slide-up 300ms cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </Fragment>
  );
}

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "gold";
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  loading = false,
}: ConfirmModalProps) {
  const confirmVariants = {
    default: "primary",
    destructive: "destructive",
    gold: "gold",
  };

  return (
    <Modal open={open} onClose={onClose} title={title} description={description} size="sm">
      <p className="text-body text-secondary mb-6">{description}</p>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={confirmVariants[variant]} onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}