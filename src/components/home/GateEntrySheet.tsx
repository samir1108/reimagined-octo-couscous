"use client";
import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GateId, getGateDef } from "@/lib/consciousness/dailyGates";
import { type EngineResponse } from "@/hooks/useConsciousnessEngine";
import { type UserTimeProfile } from "@/lib/consciousness/dailyGates";
import { X, ChevronDown, ChevronUp, Sparkles, Clock, Zap, Heart, Brain, Sun, Moon, Star } from "lucide-react";
import { BottomSheet } from "@/design-system";
import { cn } from "@/lib/utils";

type FocusType = "breath" | "body" | "emotion" | "thought" | "awareness" | "intention" | "gratitude" | "release";
type EnergyLevel = "low" | "medium" | "high" | "adaptive";
type GuideStyle = "gentle" | "direct" | "inquiry" | "devotional" | "silent";

interface SessionConfig {
  gate: GateId;
  focusType: string;
  durationMin: number;
  energy: EnergyLevel;
  guideStyle: GuideStyle;
  intent?: string;
}

interface GateEntrySheetProps {
  open: boolean;
  gate: GateId;
  onClose: () => void;
  onStartSession: (config: SessionConfig) => void;
  engineData: EngineResponse | undefined;
  userTimeProfile: UserTimeProfile | undefined;
}

const FOCUS_OPTIONS: { value: FocusType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: "breath", label: "Breath", icon: <Wind className="w-5 h-5" />, description: "Anchor in the breath" },
  { value: "body", label: "Body", icon: <Heart className="w-5 h-5" />, description: "Somatic awareness" },
  { value: "emotion", label: "Emotion", icon: <Sparkles className="w-5 h-5" />, description: "Feel what's present" },
  { value: "thought", label: "Thought", icon: <Brain className="w-5 h-5" />, description: "Observe the mind" },
  { value: "awareness", label: "Awareness", icon: <Sun className="w-5 h-5" />, description: "Open presence" },
  { value: "intention", label: "Intention", icon: <Star className="w-5 h-5" />, description: "Set a direction" },
  { value: "gratitude", label: "Gratitude", icon: <Heart className="w-5 h-5" />, description: "Cultivate appreciation" },
  { value: "release", label: "Release", icon: <Moon className="w-5 h-5" />, description: "Let go" },
];

const DURATION_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

const ENERGY_OPTIONS: { value: EnergyLevel; label: string; description: string }[] = [
  { value: "low", label: "Low", description: "Gentle, minimal effort" },
  { value: "medium", label: "Medium", description: "Balanced engagement" },
  { value: "high", label: "High", description: "Deep, intensive" },
  { value: "adaptive", label: "Adaptive", description: "AI adjusts to you" },
];

const GUIDE_STYLE_OPTIONS: { value: GuideStyle; label: string; description: string }[] = [
  { value: "gentle", label: "Gentle", description: "Soft, nurturing guidance" },
  { value: "direct", label: "Direct", description: "Clear, straightforward" },
  { value: "inquiry", label: "Inquiry", description: "Question-based exploration" },
  { value: "devotional", label: "Devotional", description: "Heart-centered, reverent" },
  { value: "silent", label: "Silent", description: "Minimal words, space" },
];

function Wind({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
    </svg>
  );
}

export function GateEntrySheet({
  open,
  gate,
  onClose,
  onStartSession,
  engineData,
  userTimeProfile,
}: GateEntrySheetProps) {
  const reducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const gateDef = getGateDef(gate);
  const maxDuration = gateDef.maxDurationMinutes;
  const validDurations = DURATION_OPTIONS.filter(d => d <= maxDuration);
  if (validDurations.length === 0) validDurations.push(maxDuration);

  const [focusType, setFocusType] = useState<FocusType>("breath");
  const [durationMin, setDurationMin] = useState(validDurations[Math.min(1, validDurations.length - 1)]);
  const [energy, setEnergy] = useState<EnergyLevel>("adaptive");
  const [guideStyle, setGuideStyle] = useState<GuideStyle>("gentle");
  const [intent, setIntent] = useState("");
  const [expanded, setExpanded] = useState(false);

  if (!open) return null;

  const profile = engineData?.profile;
  const plan = engineData?.plan;
  const weakestDimension = plan?.focusDimension?.toLowerCase() as FocusType | undefined;

  const handleStart = () => {
    onStartSession({
      gate,
      focusType,
      durationMin,
      energy,
      guideStyle,
      intent: intent.trim() || undefined,
    });
  };

  const gateColor = `hsl(${gateDef.accentColor})`;

  const content = (
    <>
      <div style={{ background: `linear-gradient(135deg, ${gateColor}22, ${gateColor}11)` }}>
        <div className="relative p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 id="gate-sheet-title" className="text-2xl font-bold text-foreground">
                {gateDef.icon} {gateDef.label} Gate
              </h1>
              <p className="mt-1 text-muted-foreground">
                {gateDef.theme} • {gateDef.timeRange}
              </p>
              <p className="mt-2 text-sm text-muted-foreground/70">
                {gateDef.toneModifiers.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(" • ")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 pb-safe">
        {profile && (
          <div className="bg-muted/30 rounded-xl p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Your Current State
            </h3>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-2 rounded-lg bg-background">
                <div className="text-lg font-bold text-foreground">{profile.overall_band}</div>
                <div className="text-xs text-muted-foreground">Band</div>
              </div>
              <div className="p-2 rounded-lg bg-background">
                <div className="text-lg font-bold text-foreground">{profile.dimension_bands.thought}</div>
                <div className="text-xs text-muted-foreground">Thought</div>
              </div>
              <div className="p-2 rounded-lg bg-background">
                <div className="text-lg font-bold text-foreground">{profile.dimension_bands.emotion}</div>
                <div className="text-xs text-muted-foreground">Emotion</div>
              </div>
              <div className="p-2 rounded-lg bg-background">
                <div className="text-lg font-bold text-foreground">{profile.dimension_bands.body}</div>
                <div className="text-xs text-muted-foreground">Body</div>
              </div>
            </div>
            {weakestDimension && (
              <p className="mt-3 text-sm text-muted-foreground">
                Suggested focus: <span className="font-medium capitalize">{weakestDimension}</span> (weakest dimension)
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Focus Type
          </label>
          <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Focus type">
            {FOCUS_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={focusType === option.value}
                onClick={() => setFocusType(option.value)}
                className={cn(
                  "relative p-3 rounded-xl border-2 transition-all",
                  focusType === option.value
                    ? `border-[${gateColor}] bg-[${gateColor}]10`
                    : "border-border/40 bg-muted/20 hover:border-border/60",
                )}
              >
                <div className="flex items-center justify-center mb-1">
                  {option.icon}
                </div>
                <span className="text-xs font-medium capitalize">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Duration
          </label>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Duration">
            {validDurations.map(d => (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={durationMin === d}
                onClick={() => setDurationMin(d)}
                className={cn(
                  "px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all",
                  durationMin === d
                    ? `border-[${gateColor}] bg-[${gateColor}]10 text-[${gateColor}]`
                    : "border-border/40 bg-muted/20 text-foreground hover:border-border/60",
                )}
              >
                {d} min
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground/70">
            Max for this gate: {maxDuration} min
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/20"
          aria-expanded={expanded}
        >
          <span className="text-sm font-medium text-foreground">
            Advanced Options
          </span>
          {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </button>

        {expanded && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Energy Level
              </label>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Energy level">
                {ENERGY_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={energy === option.value}
                    onClick={() => setEnergy(option.value)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all",
                      energy === option.value
                        ? `border-[${gateColor}] bg-[${gateColor}]10`
                        : "border-border/40 bg-muted/20 hover:border-border/60",
                    )}
                  >
                    <div className="font-medium capitalize">{option.label}</div>
                    <div className="text-xs text-muted-foreground/70 mt-0.5">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Guide Style
              </label>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Guide style">
                {GUIDE_STYLE_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={guideStyle === option.value}
                    onClick={() => setGuideStyle(option.value)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all",
                      guideStyle === option.value
                        ? `border-[${gateColor}] bg-[${gateColor}]10`
                        : "border-border/40 bg-muted/20 hover:border-border/60",
                    )}
                  >
                    <div className="font-medium capitalize">{option.label}</div>
                    <div className="text-xs text-muted-foreground/70 mt-0.5">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="intent" className="block text-sm font-medium text-foreground mb-2">
                Intent (optional)
              </label>
              <textarea
                id="intent"
                value={intent}
                onChange={e => setIntent(e.target.value)}
                placeholder="What would you like to explore or cultivate?"
                rows={3}
                className={cn(
                  "w-full p-3 rounded-xl border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent resize-none",
                  `focus:ring-[${gateColor}]`
                )}
                maxLength={500}
              />
              <p className="mt-1 text-xs text-muted-foreground/70 text-right">
                {intent.length}/500
              </p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-border/40">
          <button
            onClick={handleStart}
            disabled={durationMin > maxDuration}
            className="w-full py-3 px-6 rounded-xl font-semibold text-white transition-all shadow-lg"
            style={{ background: `linear-gradient(135deg, ${gateColor}, ${gateColor}dd)` }}
          >
            Begin {gateDef.label} Session
          </button>
          <button
            onClick={onClose}
            type="button"
            className="w-full mt-3 py-3 px-6 rounded-xl font-medium text-foreground border border-border/40 hover:bg-muted/30 transition-colors"
          >
            Not Now
          </button>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onClose={onClose}
        title={`${gateDef.icon} ${gateDef.label} Gate`}
        maxHeight="90vh"
      >
        {content}
      </BottomSheet>
    );
  }

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0 }}
      animate={reducedMotion ? {} : { opacity: 1 }}
      exit={reducedMotion ? {} : { opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-sheet-title"
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
        className="relative w-full max-w-md sm:max-w-lg bg-background rounded-2xl shadow-2xl overflow-hidden"
        initial={reducedMotion ? {} : { y: "100%" }}
        animate={reducedMotion ? {} : { y: 0 }}
        exit={reducedMotion ? {} : { y: "100%" }}
        transition={reducedMotion ? {} : { type: "spring", damping: 25, stiffness: 200 }}
      >
        {content}
      </motion.div>
    </motion.div>
  );
}

export default GateEntrySheet;