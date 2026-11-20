import { useState, useCallback } from 'react';
import { ExtendedSessionConfiguration } from '@/types/session-config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/design-system";
import { Button } from "@/design-system";
import { Textarea } from "@/design-system";
import { Badge } from "@/design-system";
import { ScrollArea } from "@/design-system";
import { Sparkles, Send, Loader2, CheckCircle2, AlertCircle, Zap, Target, Clock, User, Brain } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface NaturalLanguageInputProps {
  currentConfig: ExtendedSessionConfiguration;
  onConfigChange: (updates: Partial<ExtendedSessionConfiguration>) => void;
  userContext?: { id: string };
}

const EXAMPLE_PROMPTS = [
  "I want to work on my anger",
  "Make sessions 15 min",
  "Push breath to level 4",
  "More gentle guidance",
  "I have 10 minutes before a meeting, I'm nervous",
  "Deep self-inquiry into who is angry, 45 min, silent guide",
  "Morning energy boost with breath and movement, 20 min",
  "Evening wind-down for sleep, gentle, 15 min",
  "Work on my abandonment wound with Rumi's guidance",
  "Focus session for deep work, 30 min, direct style",
  "Relationship repair after argument, 25 min, devotional",
  "Creative flow session, 40 min, any time",
];

const CONTEXT_OPTIONS = [
  { value: 'config_tuning', label: 'Config Tuning', description: 'Adjust session settings' },
  { value: 'session_review', label: 'Session Review', description: 'Review past sessions' },
  { value: 'intent_generation', label: 'Intent Generation', description: 'Generate session from intent' },
] as const;

export function NaturalLanguageInput({ currentConfig, onConfigChange, userContext }: NaturalLanguageInputProps) {
  const [message, setMessage] = useState('');
  const [context, setContext] = useState<'config_tuning' | 'session_review' | 'intent_generation'>('config_tuning');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    intent: string;
    configPatch: Record<string, unknown>;
    confirmationMessage: string;
    suggestedActions: string[];
    needsClarification: boolean;
    clarificationQuestion: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!message.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('parse-session-intent', {
        body: {
          message: message.trim(),
          currentConfig,
          context,
        },
      });

      if (fnError) {
        setError(fnError.message || 'Failed to parse intent');
        return;
      }

      if (data?.ok) {
        setResult(data);
        if (data.configPatch && Object.keys(data.configPatch).length > 0) {
          onConfigChange(data.configPatch);
        }
      } else {
        setError(data?.error || 'Unknown error');
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  }, [message, currentConfig, context, onConfigChange]);

  const handleExampleClick = useCallback((prompt: string) => {
    setMessage(prompt);
  }, []);

  return (
    <ScrollArea className="h-full pr-2">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <h3 className="text-lg font-medium">AI Session Designer</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Describe what you want in natural language. The AI will compose a complete session configuration.
          </p>
        </div>

        <Card className="border-gold/30">
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Context</label>
              <div className="grid gap-2 sm:grid-cols-3">
                {CONTEXT_OPTIONS.map(opt => (
                  <Button
                    key={opt.value}
                    variant={context === opt.value ? 'default' : 'outline'}
                    className="h-auto p-3 text-left justify-start"
                    onClick={() => setContext(opt.value)}
                  >
                    <div>
                      <div className="font-medium text-sm">{opt.label}</div>
                      <div className="text-xs text-muted-foreground">{opt.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Your Request</label>
              <Textarea
                placeholder={`e.g., "I have 10 minutes before a meeting, I'm nervous" or "Deep self-inquiry into who is angry, 45 min, silent guide"`}
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                className="resize-none"
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSubmit();
                  }
                }}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Press Ctrl+Enter to submit</span>
                <span>{message.length}/500 chars</span>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isLoading || !message.trim()}
              className="w-full gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Parsing intent...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Generate Configuration
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className="border-green-500/50 bg-green-500/5">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <CardTitle className="text-base">Configuration Updated</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Intent</label>
                <p className="text-sm font-medium mt-1">{result.intent}</p>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Changes Applied</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.keys(result.configPatch).map(key => (
                    <Badge key={key} variant="secondary" className="bg-gold/20 text-gold">
                      {key}
                    </Badge>
                  ))}
                  {Object.keys(result.configPatch).length === 0 && (
                    <span className="text-sm text-muted-foreground">No changes needed</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Confirmation</label>
                <p className="text-sm mt-1">{result.confirmationMessage}</p>
              </div>

              {result.needsClarification && result.clarificationQuestion && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-sm font-medium text-amber-500">Clarification Needed</p>
                  <p className="text-sm mt-1">{result.clarificationQuestion}</p>
                </div>
              )}

              {result.suggestedActions.length > 0 && (
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Suggested Next Steps</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {result.suggestedActions.map((action, i) => (
                      <Badge key={i} variant="outline" className="cursor-pointer hover:bg-accent">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-gold" />
            Try these examples
          </h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {EXAMPLE_PROMPTS.map((prompt, i) => (
              <Button
                key={i}
                variant="outline"
                className="h-auto p-3 text-left justify-start text-sm hover:border-gold/50"
                onClick={() => handleExampleClick(prompt)}
              >
                <span className="line-clamp-2">{prompt}</span>
              </Button>
            ))}
          </div>
        </div>

        <Card className="border-dashed">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-gold mt-0.5" />
              <div>
                <p className="text-sm font-medium">Current Configuration</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary">{currentConfig.focusType}</Badge>
                  <Badge variant="secondary">{currentConfig.timeBudgetMin} min</Badge>
                  <Badge variant="secondary">{currentConfig.guideStyle}</Badge>
                  <Badge variant="secondary">{currentConfig.energyMode}</Badge>
                  <Badge variant="secondary">{currentConfig.preferredGate}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}