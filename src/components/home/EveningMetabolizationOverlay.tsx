"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Moon, Heart, Wind, Check, Sparkles, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/design-system";
import { Textarea } from "@/design-system";
import { Input } from "@/design-system";
import { conscious } from "@/lib/consciousToast";

interface EveningMetabolizationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: { line: string; gratitudes: string[]; scanNotes: string }) => void;
  prompt?: {
    line: string;
    gratitudes: string;
    scan: string;
  };
}

export default function EveningMetabolizationOverlay({
  isOpen,
  onClose,
  onComplete,
  prompt,
}: EveningMetabolizationOverlayProps) {
  const [line, setLine] = useState("");
  const [gratitudes, setGratitudes] = useState(["", "", ""]);
  const [scanNotes, setScanNotes] = useState("");
  const [step, setStep] = useState<"line" | "gratitudes" | "scan" | "complete">("line");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null]);

  useEffect(() => {
    if (isOpen) {
      setLine("");
      setGratitudes(["", "", ""]);
      setScanNotes("");
      setStep("line");
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === "gratitudes") {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } else if (step === "scan") {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [step]);

  const handleLineSubmit = () => {
    if (line.trim()) {
      setStep("gratitudes");
      conscious("noted", { kind: "subtle" });
    }
  };

  const handleGratitudesSubmit = () => {
    if (gratitudes.some(g => g.trim())) {
      setStep("scan");
      conscious("noted", { kind: "subtle" });
    }
  };

  const handleScanSubmit = () => {
    setStep("complete");
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await onComplete({ line, gratitudes: gratitudes.filter(g => g.trim()), scanNotes });
      conscious("noted", { kind: "success", message: "Evening metabolized. Sleep well." });
      onClose();
    } catch (e) {
      consciousFromError(e, "somethingSlipped");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const steps = [
    { id: "line", label: "Release", icon: Wind, total: 3 },
    { id: "gratitudes", label: "Gratitudes", icon: Heart, total: 3 },
    { id: "scan", label: "Body Scan", icon: Moon, total: 3 },
    { id: "complete", label: "Complete", icon: Sparkles, total: 3 },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={e => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="evening-metabolization-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-lg bg-background/95 border border-primary/20 rounded-3xl overflow-hidden glass-card"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Moon className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 id="evening-metabolization-title" className="font-display font-light text-lg text-foreground">
                  Evening Metabolization
                </h2>
                <p className="text-xs text-muted-foreground">Night Sanctuary exclusive</p>
              </div>
            </div>
            <Button
              variant="icon"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Close"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-center gap-2 mb-6">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      i < currentStepIndex
                        ? "bg-primary text-primary-foreground"
                        : i === currentStepIndex
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i < currentStepIndex ? <Check className="w-4 h-4" /> : <s.icon className="w-5 h-5" />}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`w-12 h-0.5 rounded transition-colors ${
                        i < currentStepIndex ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === "line" && (
                <motion.div
                  key="line"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <p className="text-sm text-muted-foreground mb-2">Write one line to release the day</p>
                      <p className="text-xs text-muted-foreground/70 italic">
                        {prompt?.line || '"Today I reacted when ____. The sensation was ____. I release it."'}
                      </p>
                    </div>
                    <Textarea
                      ref={textareaRef}
                      value={line}
                      onChange={e => setLine(e.target.value)}
                      placeholder="Today I reacted when..."
                      className="min-h-[100px] resize-none text-base"
                      rows={4}
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleLineSubmit();
                        }
                      }}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={onClose}>
                        Skip
                      </Button>
                      <Button size="sm" onClick={handleLineSubmit} disabled={!line.trim()}>
                        Continue
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === "gratitudes" && (
                <motion.div
                  key="gratitudes"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <p className="text-sm text-muted-foreground mb-2">Three gratitudes — not for what happened, but for what you noticed</p>
                      <p className="text-xs text-muted-foreground/70 italic">
                        {prompt?.gratitudes || 'One person. One sensation. One insight.'}
                      </p>
                    </div>
                    <div className="space-y-3" role="group" aria-label="Three gratitudes">
                      {gratitudes.map((g, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-medium flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </span>
                          <Input
                            ref={el => inputRefs.current[i] = el}
                            value={g}
                            onChange={e => {
                              const newGratitudes = [...gratitudes];
                              newGratitudes[i] = e.target.value;
                              setGratitudes(newGratitudes);
                            }}
                            placeholder={`Gratitude ${i + 1}`}
                            className="flex-1"
                            onKeyDown={e => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (i < 2) inputRefs.current[i + 1]?.focus();
                                else handleGratitudesSubmit();
                              }
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between">
                      <Button variant="ghost" size="sm" onClick={() => setStep("line")}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back
                      </Button>
                      <Button size="sm" onClick={handleGratitudesSubmit} disabled={!gratitudes.some(g => g.trim())}>
                        Continue
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === "scan" && (
                <motion.div
                  key="scan"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <p className="text-sm text-muted-foreground mb-2">Where does the day live in your body?</p>
                      <p className="text-xs text-muted-foreground/70 italic">
                        {prompt?.scan || 'Breathe there. Exhale = release.'}
                      </p>
                    </div>
                    <Textarea
                      ref={textareaRef}
                      value={scanNotes}
                      onChange={e => setScanNotes(e.target.value)}
                      placeholder="Scan from toes to crown... where is the weight? The tension? The release?"
                      className="min-h-[100px] resize-none text-base"
                      rows={4}
                    />
                    <div className="flex justify-between">
                      <Button variant="ghost" size="sm" onClick={() => setStep("gratitudes")}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back
                      </Button>
                      <Button size="sm" onClick={handleScanSubmit}>
                        Complete
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === "complete" && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
                    className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6"
                  >
                    <Sparkles className="w-10 h-10 text-primary" />
                  </motion.div>
                  <h3 className="font-display font-light text-xl text-foreground mb-2">
                    Evening Metabolized
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                    The day is released. The body is heard. Sleep comes naturally.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button variant="outline" size="sm" onClick={handleSkip}>
                      Skip to Sleep
                    </Button>
                    <Button size="sm" onClick={handleComplete} disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save & Sleep"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function consciousFromError(e: any, fallback: string) {
  console.error(e);
  conscious("somethingSlipped", { kind: "error", message: fallback });
}