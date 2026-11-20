"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useState, useEffect } from "react";
import { X, AlertTriangle, Heart, Brain, Zap, Phone, MessageCircle, MapPin, Shield, RotateCcw } from "lucide-react";

interface CrisisModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerSOS: () => void;
  className?: string;
}

const crisisResources = [
  { name: "988 Suicide & Crisis Lifeline", number: "988", country: "US", type: "call" },
  { name: "Crisis Text Line", number: "741741", country: "US", type: "text" },
  { name: "116 123 Samaritans", number: "116 123", country: "UK", type: "call" },
  { name: "International Helplines", number: "findahelpline.com", country: "Global", type: "web" },
];

export function CrisisModeOverlay({
  isOpen,
  onClose,
  onTriggerSOS,
  className = "",
}: CrisisModeOverlayProps) {
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState<"main" | "breathing" | "witness" | "contacts">("main");
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [breathCount, setBreathCount] = useState(0);

  // 4-7-8 breathing animation
  useEffect(() => {
    if (step !== "breathing") return;
    
    const phases: Array<{ phase: "inhale" | "hold" | "exhale"; duration: number }> = [
      { phase: "inhale", duration: 4000 },
      { phase: "hold", duration: 7000 },
      { phase: "exhale", duration: 8000 },
    ];
    
    let phaseIndex = 0;
    let cycleCount = 0;
    
    const runCycle = () => {
      const current = phases[phaseIndex];
      setBreathPhase(current.phase);
      
      setTimeout(() => {
        phaseIndex = (phaseIndex + 1) % phases.length;
        if (phaseIndex === 0) {
          cycleCount++;
          setBreathCount(cycleCount);
          if (cycleCount >= 4) {
            setStep("witness");
            return;
          }
        }
        runCycle();
      }, current.duration);
    };
    
    runCycle();
  }, [step]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0 }}
      animate={reducedMotion ? {} : { opacity: 1 }}
      exit={reducedMotion ? {} : { opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={reducedMotion ? {} : { opacity: 0, scale: 0.9, y: 20 }}
        animate={reducedMotion ? {} : { opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-background border border-destructive/30 rounded-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertTriangle className="text-destructive w-5 h-5" />
            </div>
            <h2 className="font-display font-medium text-foreground">Crisis Support</h2>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step: Main */}
        {step === "main" && (
          <div className="p-6 space-y-4">
            <p className="text-center text-muted-foreground/80">
              You're not alone. Help is here right now. Choose what you need:
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStep("breathing")}
                className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl hover:bg-destructive/20 transition-colors flex flex-col items-center gap-2"
              >
                <RotateCcw className="w-6 h-6" />
                <span className="font-medium">4-7-8 Breathing</span>
                <span className="text-xs text-destructive/70">4 cycles</span>
              </button>
              <button
                onClick={() => setStep("witness")}
                className="p-4 bg-primary/10 border border-primary/20 text-primary rounded-xl hover:bg-primary/20 transition-colors flex flex-col items-center gap-2"
              >
                <Brain className="w-6 h-6" />
                <span className="font-medium">Witness Anchor</span>
                <span className="text-xs text-primary/70">Name what's here</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setStep("contacts")}
                className="w-full p-3 bg-background/40 border border-border/30 rounded-xl hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Emergency Contacts →</span>
              </button>
            </div>

            <button
              onClick={onTriggerSOS}
              className="w-full p-4 bg-destructive text-destructive-foreground rounded-xl font-medium hover:bg-destructive/90 transition-colors animate-pulse"
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              SOS — CALL EMERGENCY SERVICES
            </button>
          </div>
        )}

        {/* Step: Breathing */}
        {step === "breathing" && (
          <div className="p-6 space-y-6 text-center">
            <button onClick={() => setStep("main")} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            
            <p className="text-sm text-muted-foreground">Cycle {breathCount}/4</p>
            
            <motion.div
              animate={{ 
                scale: breathPhase === "inhale" ? 1.2 : breathPhase === "hold" ? 1.1 : 0.9,
                borderRadius: breathPhase === "inhale" ? "50%" : breathPhase === "hold" ? "30%" : "50%",
              }}
              transition={{ duration: breathPhase === "inhale" ? 4 : breathPhase === "hold" ? 7 : 8 }}
              className="w-48 h-48 mx-auto rounded-full bg-gradient-to-r from-primary to-accent/50 flex items-center justify-center"
            >
              <div className="text-center">
                <p className="text-4xl font-display font-bold text-foreground">
                  {breathPhase === "inhale" ? "4" : breathPhase === "hold" ? "7" : "8"}
                </p>
                <p className="text-sm text-foreground/70 capitalize">{breathPhase}</p>
              </div>
            </motion.div>

            <p className="text-lg font-medium text-foreground capitalize">
              {breathPhase === "inhale" ? "Inhale slowly through nose" : 
               breathPhase === "hold" ? "Hold the breath" : 
               "Exhale slowly through mouth"}
            </p>

            <div className="flex justify-center gap-2">
              {[1,2,3,4].map(i => (
                <motion.div
                  key={i}
                  initial={reducedMotion ? {} : { scale: 0 }}
                  animate={reducedMotion ? {} : { scale: i <= breathCount ? 1 : 0.5 }}
                  className={`w-2 h-2 rounded-full ${i <= breathCount ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>

            <button
              onClick={() => setStep("main")}
              className="w-full py-2 bg-muted/50 border border-border/30 rounded-xl hover:bg-muted/70 transition-colors"
            >
              Exit Breathing
            </button>
          </div>
        )}

        {/* Step: Witness */}
        {step === "witness" && (
          <div className="p-6 space-y-6 text-center">
            <button onClick={() => setStep("main")} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            
            <div className="space-y-3">
              <p className="text-lg font-medium text-foreground">Name what's here</p>
              <p className="text-muted-foreground/80">No need to fix. Just witness.</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Sensation", prompt: "Where in the body?" },
                { label: "Emotion", prompt: "What feeling?" },
                { label: "Thought", prompt: "What story?" },
              ].map(item => (
                <button
                  key={item.label}
                  className="p-3 bg-background/40 border border-border/30 rounded-xl hover:border-primary/50 transition-colors text-left"
                >
                  <p className="font-medium text-sm text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.prompt}</p>
                </button>
              ))}
            </div>

            <textarea
              placeholder="I notice... I feel... The story is..."
              className="w-full min-h-[80px] p-3 bg-background border border-border/30 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 resize-none"
              rows={3}
            />

            <div className="flex gap-2">
              <button
                onClick={() => setStep("main")}
                className="flex-1 py-2 bg-muted/50 border border-border/30 rounded-xl hover:bg-muted/70 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep("contacts")}
                className="flex-1 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl hover:bg-primary/20 transition-colors"
              >
                Need More Help
              </button>
            </div>
          </div>
        )}

        {/* Step: Contacts */}
        {step === "contacts" && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-medium text-foreground">Emergency Resources</h3>
              <button onClick={() => setStep("main")} className="p-2 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {crisisResources.map((resource, i) => (
                <motion.div
                  key={resource.name}
                  initial={reducedMotion ? {} : { opacity: 0, x: -20 }}
                  animate={reducedMotion ? {} : { opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="p-3 bg-background/40 border border-border/30 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      {resource.type === "call" && <Phone className="w-5 h-5 text-primary" />}
                      {resource.type === "text" && <MessageCircle className="w-5 h-5 text-primary" />}
                      {resource.type === "web" && <MapPin className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{resource.name}</p>
                      <p className="text-xs text-muted-foreground">{resource.country} · {resource.type}</p>
                    </div>
                  </div>
                  {resource.type !== "web" && (
                    <button
                      onClick={() => window.open(`tel:${resource.number}`)}
                      className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-sm rounded-lg hover:bg-primary/20 transition-colors"
                    >
                      Call {resource.number}
                    </button>
                  )}
                  {resource.type === "web" && (
                    <a href={`https://${resource.number}`} target="_blank" rel="noopener" className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-sm rounded-lg hover:bg-primary/20 transition-colors">
                      Visit
                    </a>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="pt-4 border-t border-border/30">
              <button
                onClick={onTriggerSOS}
                className="w-full p-4 bg-destructive text-destructive-foreground rounded-xl font-medium hover:bg-destructive/90 transition-colors animate-pulse"
              >
                <AlertTriangle className="w-5 h-5 mr-2" />
                SOS — CALL EMERGENCY SERVICES
              </button>
            </div>
          </div>
        )}

        {/* Persistent footer */}
        <div className="p-4 border-t border-border/30 bg-background/50">
          <p className="text-xs text-center text-muted-foreground/70">
            This overlay is always accessible — 3-tap orb or long-press power button
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}