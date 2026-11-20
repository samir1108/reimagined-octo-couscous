import { motion } from 'framer-motion';
import { Button } from "@/design-system";
import { Sparkles, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type PreJourneyPace, PACE_TARGET } from '@/hooks/usePreJourney';
import { useState } from 'react';

interface PreJourneyPacePickerProps {
  onSelect: (pace: PreJourneyPace) => void;
  loading?: boolean;
}

const OPTIONS: { id: PreJourneyPace; label: string; days: number; tagline: string; icon: typeof Sparkles }[] = [
  { id: 'slow', label: 'Slow', days: 60, tagline: 'One session a day. Deep integration.', icon: Clock },
  { id: 'balanced', label: 'Balanced', days: 20, tagline: 'Three sessions a day. Recommended.', icon: Sparkles },
  { id: 'intense', label: 'Intense', days: 6, tagline: 'Ten sessions a day. Retreat mode.', icon: Zap },
];

export function PreJourneyPacePicker({ onSelect, loading }: PreJourneyPacePickerProps) {
  const [selected, setSelected] = useState<PreJourneyPace>('balanced');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto px-5 py-12"
    >
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Foundation · Before You Begin
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
          Choose your pace
        </h1>
        <p className="text-muted-foreground mt-3 max-w-md mx-auto">
          60 short sessions across 8 modules. You decide how fast. You can switch anytime.
        </p>
      </div>

      <div className="space-y-3">
        {OPTIONS.map(opt => {
          const Icon = opt.icon;
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              className={cn(
                'w-full text-left p-5 rounded-2xl border-2 transition',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/30',
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'p-3 rounded-xl',
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-lg font-semibold">{opt.label}</h3>
                    <span className="text-sm text-muted-foreground">
                      {PACE_TARGET[opt.id]} / day · {opt.days} days
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{opt.tagline}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Button
        size="lg"
        className="w-full mt-8"
        onClick={() => onSelect(selected)}
        disabled={loading}
      >
        {loading ? 'Starting…' : 'Begin Foundation'}
      </Button>

      <p className="text-xs text-center text-muted-foreground mt-4">
        The Mirror stays open in parallel. You can check it anytime.
      </p>
    </motion.div>
  );
}
