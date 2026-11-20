import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Clock, BookOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { createPortal } from "react-dom";

interface ReadingCardModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  body: string;
  subtitle?: string;
  icon?: React.ReactNode;
  timestamp?: string;
  footer?: React.ReactNode;
}

export default function ReadingCardModal({
  open,
  onClose,
  title,
  body,
  subtitle,
  icon,
  timestamp,
  footer,
}: ReadingCardModalProps) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/95 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Card */}
          <motion.div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto glass-card rounded-2xl border border-border/20 shadow-2xl"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full glass-subtle flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start gap-3 pr-8">
                {icon || (
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div className="min-w-0">
                  {subtitle && (
                    <p className="text-[10px] font-display tracking-[0.2em] uppercase text-primary/70 font-semibold mb-1">
                      {subtitle}
                    </p>
                  )}
                  <h2 className="text-lg font-display font-bold text-foreground tracking-tight leading-tight">
                    {title}
                  </h2>
                  {timestamp && (
                    <p className="text-[10px] text-muted-foreground/60 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
                    </p>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="border-t border-border/10 pt-4">
                <p className="text-sm font-body text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {body}
                </p>
              </div>

              {/* Footer */}
              {footer && (
                <div className="border-t border-border/10 pt-4">
                  {footer}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
