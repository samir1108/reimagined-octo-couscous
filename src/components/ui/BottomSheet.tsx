"use client";
import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  handleRef?: React.RefObject<HTMLDivElement>;
  showHandle?: boolean;
  maxHeight?: string;
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
  handleRef,
  showHandle = true,
  maxHeight = "85vh",
}: BottomSheetProps) {
  const reducedMotion = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);
  const ref = handleRef || contentRef;

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0 }}
      animate={reducedMotion ? {} : { opacity: 1 }}
      exit={reducedMotion ? {} : { opacity: 0 }}
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "bottom-sheet-title" : undefined}
    >
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
        initial={reducedMotion ? {} : { opacity: 0 }}
        animate={reducedMotion ? {} : { opacity: 1 }}
        exit={reducedMotion ? {} : { opacity: 0 }}
      />
      <motion.div
        ref={ref}
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl",
          "max-h-[85vh] overflow-hidden flex flex-col",
          className
        )}
        style={{ maxHeight }}
        initial={reducedMotion ? {} : { y: "100%" }}
        animate={reducedMotion ? {} : { y: 0 }}
        exit={reducedMotion ? {} : { y: "100%" }}
        transition={reducedMotion ? {} : { type: "spring", damping: 25, stiffness: 200 }}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/30 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-10">
          {title && (
            <h2 id="bottom-sheet-title" className="text-lg font-semibold text-foreground">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 pb-safe">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default BottomSheet;