import { useState } from 'react';
import { ExtendedSessionConfiguration } from '@/types/session-config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/design-system";
import { Button } from "@/design-system";
import { Badge } from "@/design-system";
import { ScrollArea } from "@/design-system";
import { Eye, Clock, Zap, Target, Sparkles, Loader2, RefreshCw, ChevronRight, Brain, Heart, Wind, Moon } from 'lucide-react';

interface SessionPlan {
  steps?: Array<Record<string, unknown>>;
  totalEstMinutes?: number;
  title?: string;
  subtitle?: string;
  whyThisSession?: string;
  whyForYou?: string;
}

interface SessionPreviewProps {
  session: SessionPlan | null;
  isLoading: boolean;
  config?: ExtendedSessionConfiguration;
}

const STEP_ICONS: Record<string, React.ElementType> = {
  'wisdom-read': Brain,
  'breathwork': Wind,
  'journal': Target,
  'micro-act': Sparkles,
  'reflection': Heart,
  'practice': Zap,
  'temple-chat': Moon,
  'witness': Eye,
};

export function SessionPreview({ session, isLoading, config }: SessionPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <Card className="border-golden/30">
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-golden" />
            <p className="text-sm text-muted-foreground">Composing your session...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center gap-3">
            <Eye className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Preview will appear here</p>
            <p className="text-xs text-muted-foreground">Adjust settings to see your session</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const steps = session.steps || [];
  const totalMinutes = session.totalEstMinutes || config?.timeBudgetMin || 20;
  const title = session.title || 'Your Session';
  const subtitle = session.subtitle || '';
  const whyThisSession = session.whyThisSession || session.whyForYou || '';

  return (
    <Card className="border-golden/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-golden" />
              {title}
            </CardTitle>
            {subtitle && <CardDescription className="text-xs mt-1">{subtitle}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-golden/20 text-golden">
              <Clock className="w-3 h-3 mr-1" />
              {totalMinutes} min
            </Badge>
            <Badge variant="outline">{steps.length} steps</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {whyThisSession && (
          <div className="p-3 bg-golden/5 border border-golden/20 rounded-lg">
            <p className="text-sm text-muted-foreground">{whyThisSession}</p>
          </div>
        )}

        <div className="space-y-2">
          {steps.slice(0, isExpanded ? steps.length : 3).map((step: Record<string, unknown>, i: number) => {
            const Icon = STEP_ICONS[String(step.kind ?? '')] || Sparkles;
            const minutes = (step.est_minutes ?? step.estMinutes ?? step.durationMinutes ?? 0) as number;
            return (
              <div key={String(step.id ?? i)} className="flex items-start gap-3 p-2 bg-muted/30 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-golden/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-golden" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{String(step.title ?? '')}</span>
                    <Badge variant="outline" className="text-xs">
                      {minutes} min
                    </Badge>
                  </div>
                  {step.prompt && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{String(step.prompt)}</p>
                  )}
                  {step.whyForYou && (
                    <p className="text-xs text-golden/70 mt-1 italic">{String(step.whyForYou)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {steps.length > 3 && (
          <Button
            variant="ghost"
            className="w-full text-sm text-muted-foreground"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show less' : `Show ${steps.length - 3} more steps`}
            <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </Button>
        )}

        {config && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{config.focusType}</Badge>
              <Badge variant="secondary">{config.guideStyle}</Badge>
              <Badge variant="secondary">{config.energyMode}</Badge>
              <Badge variant="secondary">{config.preferredGate}</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}