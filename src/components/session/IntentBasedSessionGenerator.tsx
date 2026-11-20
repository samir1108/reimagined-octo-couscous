/**
 * IntentBasedSessionGenerator — Generate sessions from natural language intent
 * ─────────────────────────────────────────────────────────────────────────────
 * User types what they want → AI generates a complete session config.
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Zap, Clock, Target, Loader2, Play, RotateCcw } from "lucide-react";
import { useAIPersonalization } from "@/hooks/useAIPersonalization";
import { DEFAULT_EXTENDED_CONFIG } from "@/types/session-config";
import type { ExtendedSessionConfiguration } from "@/types/session-config";
import { Button } from "@/design-system";
import { Input } from "@/design-system";
import { Textarea } from "@/design-system";
import { Card, CardContent, CardHeader, CardTitle } from "@/design-system";
import { Badge } from "@/design-system";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

const EXAMPLE_INTENTS = [
  "I have 10 minutes before a meeting, I'm nervous",
  "Deep self-inquiry into who is angry, 45 min, silent guide",
  "Morning energy boost with breath and movement, 20 min",
  "Evening wind-down for sleep, gentle, 15 min",
  "Work on my abandonment wound with Rumi's guidance",
  "Focus session for deep work, 30 min, direct style",
  "Relationship repair after argument, 25 min, devotional",
  "Creative flow session, 40 min, any time",
];

export default function IntentBasedSessionGenerator({ onGenerate }: { onGenerate?: (config: ExtendedSessionConfiguration) => void }) {
  const [intent, setIntent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedConfig, setGeneratedConfig] = useState<ExtendedSessionConfiguration | null>(null);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);
  const { sendMessage } = useAIPersonalization();

  const handleGenerate = useCallback(async () => {
    if (!intent.trim() || isLoading) return;
    setIsLoading(true);
    setGeneratedConfig(null);
    setGeneratedSummary(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-session-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            message: intent,
            currentConfig: DEFAULT_EXTENDED_CONFIG,
            context: "intent_generation",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to generate");

      const result = await response.json();
      const newConfig = { ...DEFAULT_EXTENDED_CONFIG, ...result.configPatch, intent };
      setGeneratedConfig(newConfig);
      setGeneratedSummary(result.confirmationMessage || "Session generated from your intent.");

      if (onGenerate) onGenerate(newConfig);
    } catch (e) {
      toast({ title: "Error", description: "Failed to generate session. Try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [intent, isLoading, onGenerate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="w-4 h-4 text-primary" /> Intent-Based Session Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Describe what you want in natural language. The AI will compose a complete session.
        </p>

        <Textarea
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., 'I have 10 minutes before a meeting, I'm nervous' or 'Deep self-inquiry into who is angry, 45 min, silent guide'"
          rows={3}
          disabled={isLoading}
        />

        <div className="flex gap-2">
          <Button onClick={handleGenerate} disabled={isLoading || !intent.trim()} className="flex-1 rounded-xl">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
            {isLoading ? "Generating..." : "Generate Session"}
          </Button>
          {generatedConfig && (
            <Button variant="outline" onClick={() => { setIntent(""); setGeneratedConfig(null); setGeneratedSummary(null); }} className="rounded-xl">
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Example Intents */}
        {!generatedConfig && (
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Try these:</p>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLE_INTENTS.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setIntent(ex)}
                  className="text-xs px-3 py-1.5 rounded-full glass-subtle hover:bg-muted/50 transition-colors text-left"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Generated Result */}
        <AnimatePresence>
          {generatedConfig && generatedSummary && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3"
            >
              <p className="text-sm font-medium">{generatedSummary}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="gap-1">
                  <Target className="w-3 h-3" /> {generatedConfig.focusType}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Clock className="w-3 h-3" /> {generatedConfig.timeBudgetMin} min
                </Badge>
                <Badge variant="outline" className="gap-1">
                  {generatedConfig.guideStyle}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  {generatedConfig.structure}
                </Badge>
                {generatedConfig.shadowTargets?.active?.length > 0 && (
                  <Badge variant="outline" className="gap-1">
                    🎯 {generatedConfig.shadowTargets.active.map(t => t.name).join(", ")}
                  </Badge>
                )}
              </div>
              {generatedConfig.practiceLevelTargets && Object.keys(generatedConfig.practiceLevelTargets).length > 0 && (
                <div className="pt-2 border-t border-border/30">
                  <p className="text-[10px] text-muted-foreground mb-1">Practice Targets:</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(generatedConfig.practiceLevelTargets).map(([id, target]) => (
                      <Badge key={id} variant="outline" className="text-[10px]">
                        {id}: L{target.targetLevel} ({target.priority})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <Button
                className="w-full rounded-xl"
                onClick={() => {
                  // Save generated config
                  supabase.auth.getUser().then(({ data: { user } }) => {
                    if (user) {
                      supabase
                        .from("user_consciousness_profile")
                        .update({ session_config: generatedConfig as any })
                        .eq("user_id", user.id);
                    }
                  });
                  toast({ title: "Session saved", description: "Your next session will use this configuration." });
                }}
              >
                <Play className="w-4 h-4 mr-2" /> Use This Session
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}