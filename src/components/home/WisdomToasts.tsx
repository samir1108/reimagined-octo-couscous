"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Sparkles, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/design-system";
import { Card } from "@/components/design-system";
import { conscious } from "@/lib/consciousToast";
import { useNavigate } from "react-router-dom";

interface ShadowSignalToastProps {
  isOpen: boolean;
  onClose: () => void;
  signal: {
    title: string;
    content: string;
    subtitle?: string;
    action?: { label: string; type: string; payload?: any };
  } | null;
}

export function ShadowSignalToast({ isOpen, onClose, signal }: ShadowSignalToastProps) {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isOpen && signal) {
      timeoutRef.current = setTimeout(() => {
        onClose();
      }, 15000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isOpen, signal, onClose]);

  if (!isOpen || !signal) return null;

  const handleAction = () => {
    if (signal.action) {
      conscious("noted", { kind: "subtle" });
      if (signal.action.type === "guide") {
        navigate("/app/guide", { state: { mode: signal.action.payload?.mode || "shadow_work" } });
      }
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-6 right-6 z-50 max-w-sm w-full mx-4"
        role="alert"
        aria-live="polite"
      >
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="relative bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 glass-card shadow-2xl"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-light text-sm text-foreground">Shadow Signal</h3>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground/50"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-sm text-foreground/90 mb-2">{signal.content}</p>
              
              {signal.subtitle && (
                <p className="text-xs text-muted-foreground mb-3">{signal.subtitle}</p>
              )}
              
              {signal.action && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1 border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                  onClick={handleAction}
                >
                  {signal.action.label}
                  <ChevronRight className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
          
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: 0 }}
            transition={{ duration: 15000, ease: "linear" }}
            className="absolute bottom-0 left-0 h-0.5 bg-rose-500/50 rounded-b-2xl origin-left"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface WhisperUnlockToastProps {
  isOpen: boolean;
  onClose: () => void;
  whisper?: {
    content: string;
  };
}

export function WhisperUnlockToast({ isOpen, onClose, whisper }: WhisperUnlockToastProps) {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isOpen) {
      timeoutRef.current = setTimeout(() => {
        onClose();
      }, 10000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRead = () => {
    navigate("/app/home", { state: { scrollTo: "wisdom" } });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full mx-4"
        role="status"
        aria-live="polite"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="relative bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 glass-card shadow-2xl"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-light text-sm text-foreground flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  Whisper Unlocked
                </h3>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground/50"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-sm text-foreground/90 mb-2">
                3 missions complete — your future self has a message for you.
              </p>
              
              {whisper?.content && (
                <blockquote className="text-sm text-yellow-400/90 italic border-l-2 border-yellow-500/30 pl-3 my-3">
                  "{whisper.content}"
                </blockquote>
              )}
              
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                onClick={handleRead}
              >
                Read in Wisdom Universe
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: 0 }}
            transition={{ duration: 10000, ease: "linear" }}
            className="absolute bottom-0 left-0 h-0.5 bg-yellow-500/50 rounded-b-2xl origin-left"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}