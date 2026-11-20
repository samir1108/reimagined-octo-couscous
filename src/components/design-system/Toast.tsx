"use client";

import { useState, useEffect, type ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning" | "info" | "gold";
  duration?: number;
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function Toast({
  id,
  title,
  description,
  variant = "default",
  duration = 5000,
  onClose,
  action,
}: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose(id), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const variants = {
    default: "border-border bg-elevated-surface",
    success: "border-healing/30 bg-healing/10",
    error: "border-error/30 bg-error/10",
    warning: "bg-warning/10 border-warning/30",
    info: "bg-focus/10 border-focus/30",
    gold: "border-primary-gold/30 bg-primary-gold/10",
  };

  const icons = {
    default: <Info className="w-5 h-5 text-primary-gold" />,
    success: <CheckCircle className="w-5 h-5 text-healing" />,
    error: <AlertCircle className="w-5 h-5 text-error" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning" />,
    info: <Info className="w-5 h-5 text-focus" />,
    gold: <Info className="w-5 h-5 text-primary-gold" />,
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border shadow-xl",
        "transform transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "min-w-[300px] max-w-md",
        variants[variant],
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0 mt-0.5">{icons[variant]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-body text-primary font-medium">{title}</p>
        {description && (
          <p className="text-caption text-muted mt-1">{description}</p>
        )}
        {action && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              action.onClick();
              onClose(id);
            }}
            className="mt-2 text-primary-gold hover:text-gold-light"
          >
            {action.label}
          </Button>
        )}
      </div>
      <Button
        variant="icon"
        size="xs"
        onClick={() => onClose(id)}
        aria-label="Dismiss"
        className="text-muted hover:text-primary flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    title: string;
    description?: string;
    variant?: ToastProps["variant"];
    duration?: number;
    action?: ToastProps["action"];
  }>;
  onClose: (id: string) => void;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
}

export function ToastContainer({
  toasts,
  onClose,
  position = "bottom-right",
}: ToastContainerProps) {
  const positions = {
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-center": "top-6 left-1/2 -translate-x-1/2",
    "bottom-center": "bottom-6 left-1/2 -translate-x-1/2",
  };

  return (
    <div
      className={cn(
        "fixed z-[var(--z-toast)] flex flex-col gap-3 pointer-events-none",
        positions[position]
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto w-full">
          <Toast {...toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastContainerProps["toasts"]>([]);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const show = (toast: Omit<ToastContainerProps["toasts"][0], "id">) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  };

  return {
    toasts,
    show,
    dismiss,
    ToastContainer: ({ position }: { position?: ToastContainerProps["position"] }) => (
      <ToastContainer toasts={toasts} onClose={dismiss} position={position} />
    ),
  };
}