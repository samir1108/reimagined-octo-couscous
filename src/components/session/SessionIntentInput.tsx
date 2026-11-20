import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/design-system";
import { Textarea } from "@/design-system";

const PRESET_INTENTS = [
  { id: "understand_loop", label: "Understand my loop", description: "Process a pattern you've been noticing" },
  { id: "process_today", label: "Process today", description: "Work through today's experiences" },
  { id: "deepen_theme", label: "Deepen today's theme", description: "Go deeper into today's thread" },
  { id: "just_begin", label: "Just begin", description: "No agenda, just start where you are" },
];

interface SessionIntentInputProps {
  onIntent: (intent: string) => void;
  onSkip: () => void;
}

export default function SessionIntentInput({ onIntent, onSkip }: SessionIntentInputProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");

  const handleSubmit = () => {
    const intent = selected === "custom" ? customText.trim() : (selected || "just_begin");
    if (intent) onIntent(intent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md rounded-3xl border border-border/40 bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl"
      >
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground/60 mb-1">
          What do you want from this session?
        </p>
        <p className="text-sm text-foreground/70 mb-6">
          This shapes how your guide will speak to you. Be as specific or open as you like.
        </p>

        <div className="space-y-2 mb-4">
          {PRESET_INTENTS.map((intent) => (
            <button
              key={intent.id}
              onClick={() => setSelected(intent.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selected === intent.id
                  ? "border-primary/40 bg-primary/10"
                  : "border-border/30 bg-background/30 hover:bg-background/50"
              }`}
            >
              <p className="text-sm font-medium text-foreground">{intent.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{intent.description}</p>
            </button>
          ))}
        </div>

        <div className="mb-4">
          <Textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Or write your own intent…"
            className="min-h-[80px] bg-background/40 border-border/60 text-sm resize-none"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSubmit} className="flex-1 rounded-full" disabled={!selected && !customText.trim()}>
            Begin with this intent
          </Button>
          <Button onClick={onSkip} variant="ghost" className="rounded-full text-xs text-muted-foreground">
            Skip
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
