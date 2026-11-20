import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  Check,
  Loader2,
  RotateCcw,
  Sparkles,
  TriangleAlert,
  Wand2,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { ExtendedSessionConfiguration } from '@/types/session-config';
import { Button } from "@/design-system";
import { Textarea } from "@/design-system";
import { Badge } from "@/design-system";
import { Label } from "@/design-system";
import {
  ConfigChange,
  applyConfigChanges,
  diffConfigPatch,
} from './personalizationModel';

interface IntentRailProps {
  config: ExtendedSessionConfiguration;
  onApply: (patch: Partial<ExtendedSessionConfiguration>) => void;
}

type IntentMode = 'compose' | 'tune';

const EXAMPLES = [
  'I have 10 minutes before a meeting, I am nervous',
  'Deep self-inquiry into who is angry, 45 min, silent guide',
  'Evening wind-down for sleep, gentle, 15 min',
  'Relationship repair after an argument, 25 min, devotional',
  'Focus session for deep work, 30 min, direct style',
];

interface ParseResult {
  ok?: boolean;
  intent?: string;
  configPatch?: Record<string, unknown>;
  confirmationMessage?: string;
  suggestedActions?: string[];
  needsClarification?: boolean;
  clarificationQuestion?: string | null;
  error?: string;
}

export function IntentRail({ config, onApply }: IntentRailProps) {
  const [mode, setMode] = useState<IntentMode>('compose');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<ConfigChange[]>([]);

  const changes = useMemo(
    () => (result?.configPatch ? diffConfigPatch(config, result.configPatch) : []),
    [result, config],
  );

  const handleSubmit = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setPending([]);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('parse-session-intent', {
        body: {
          message: trimmed,
          currentConfig: config,
          context: mode === 'compose' ? 'intent_generation' : 'config_tuning',
        },
      });

      if (fnError) {
        setError(fnError.message || 'The AI could not be reached.');
        return;
      }

      const payload = (data ?? {}) as ParseResult;
      if (payload.error) {
        setError(payload.error);
        return;
      }

      setResult(payload);
      setPending(diffConfigPatch(config, payload.configPatch ?? {}));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The AI could not be reached.');
    } finally {
      setIsLoading(false);
    }
  }, [config, isLoading, message, mode]);

  const applyChange = useCallback(
    (change: ConfigChange) => {
      onApply(applyConfigChanges(config, [change]));
      setPending((prev) => prev.filter((entry) => entry.path !== change.path));
    },
    [config, onApply],
  );

  const applyAll = useCallback(() => {
    if (pending.length === 0) return;
    onApply(applyConfigChanges(config, pending));
    setPending([]);
  }, [config, onApply, pending]);

  const rejectChange = useCallback((path: string) => {
    setPending((prev) => prev.filter((entry) => entry.path !== path));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div role="radiogroup" aria-label="AI intent mode" className="flex gap-2">
          <Button
            type="button"
            role="radio"
            aria-checked={mode === 'compose'}
            variant={mode === 'compose' ? 'default' : 'outline'}
            size="sm"
            className="gap-2 rounded-full"
            onClick={() => setMode('compose')}
          >
            <Wand2 className="h-3.5 w-3.5" /> Build from intent
          </Button>
          <Button
            type="button"
            role="radio"
            aria-checked={mode === 'tune'}
            variant={mode === 'tune' ? 'default' : 'outline'}
            size="sm"
            className="gap-2 rounded-full"
            onClick={() => setMode('tune')}
          >
            <Bot className="h-3.5 w-3.5" /> Tune this session
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {mode === 'compose'
            ? 'Describe the session you need — the AI proposes every change.'
            : 'Describe what to adjust — the AI proposes a reviewable diff.'}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="session-intent-input" className="text-xs">
          {mode === 'compose' ? 'What do you want from this session?' : 'What should change?'}
        </Label>
        <Textarea
          id="session-intent-input"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              void handleSubmit();
            }
          }}
          rows={3}
          maxLength={500}
          placeholder="I have 10 minutes before a meeting, I am nervous"
          className="resize-none"
          aria-describedby="session-intent-hint"
        />
        <div id="session-intent-hint" className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Ctrl + Enter to send · changes are staged for your review</span>
          <span>{message.length}/500</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isLoading || !message.trim()}
          className="gap-2 rounded-xl"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {isLoading ? 'Thinking…' : mode === 'compose' ? 'Build session' : 'Propose changes'}
        </Button>
        {result && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={() => {
              setResult(null);
              setPending([]);
              setMessage('');
            }}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
        )}
      </div>

      {!result && !isLoading && (
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setMessage(example)}
              className="rounded-full border border-border/60 bg-muted/30 px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              {example}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">AI unavailable</p>
            <p className="text-xs opacity-90">{error} — every control below still works manually.</p>
          </div>
        </div>
      )}

      <AnimatePresence initial={false}>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-3"
            aria-live="polite"
          >
            {result.confirmationMessage && (
              <p className="text-sm text-foreground">{result.confirmationMessage}</p>
            )}

            {result.needsClarification && result.clarificationQuestion && (
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  {result.clarificationQuestion}
                </p>
              </div>
            )}

            {changes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Proposed changes ({pending.length} pending)
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1.5 rounded-lg text-xs"
                    onClick={applyAll}
                    disabled={pending.length === 0}
                  >
                    <Check className="h-3 w-3" /> Apply all
                  </Button>
                </div>

                <ul className="space-y-2">
                  {changes.map((change) => {
                    const isPending = pending.some((entry) => entry.path === change.path);
                    return (
                      <li
                        key={change.path}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/60 p-2.5"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{change.label}</p>
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="line-through opacity-70">{change.displayBefore}</span>
                            <ArrowRight className="h-3 w-3" />
                            <span className="text-foreground">{change.displayAfter}</span>
                          </p>
                        </div>
                        {isPending ? (
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              size="sm"
                              className="h-7 gap-1 rounded-lg text-xs"
                              onClick={() => applyChange(change)}
                            >
                              <Check className="h-3 w-3" /> Apply
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-muted-foreground"
                              aria-label={`Reject ${change.label}`}
                              onClick={() => rejectChange(change.path)}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-[10px]">
                            <Check className="h-3 w-3" /> Applied
                          </Badge>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {changes.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No configuration changes were needed for this request.
              </p>
            )}

            {result.suggestedActions && result.suggestedActions.length > 0 && (
              <div className="flex flex-wrap gap-2 border-t border-border/40 pt-2">
                {result.suggestedActions.map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => setMessage(action)}
                    className="rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
