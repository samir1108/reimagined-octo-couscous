import { useState } from 'react';
import { ExtendedSessionConfiguration, FocusType, GuideStyle, GateId, LifeDomainId, getFocusType, getGuideStyle, getLifeDomain, FOCUS_TYPES, GUIDE_STYLES, LIFE_DOMAINS } from '@/types/session-config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/design-system";
import { Button } from "@/design-system";
import { Label } from "@/design-system";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/design-system";
import { Slider } from "@/design-system";
import { Separator } from "@/design-system";
import { ScrollArea } from "@/design-system";
import { Target, Clock, Sun, Moon, Zap, Heart, Brain, Sparkles, User, Briefcase, DollarSign, Dumbbell, Palette, Leaf, type LucideIcon } from 'lucide-react';

interface BasicConfigTabProps {
  config: ExtendedSessionConfiguration;
  onChange: (updates: Partial<ExtendedSessionConfiguration>) => void;
  validation: { valid: boolean; errors: string[] };
}

const ENERGY_MODES = [
  { value: 'adaptive' as const, label: 'Adaptive', description: 'Auto-adjust to your state', icon: Zap },
  { value: 'low' as const, label: 'Low', description: 'Gentle, restorative', icon: Moon },
  { value: 'medium' as const, label: 'Medium', description: 'Balanced, steady', icon: Sun },
  { value: 'high' as const, label: 'High', description: 'Energizing, intense', icon: Zap },
] as const;

const GATES = [
  { value: 'flexible' as const, label: 'Flexible', description: 'Adapts to current time', icon: Sparkles },
  { value: 'morning' as const, label: 'Morning', description: 'Wake up, set intention', icon: Sun },
  { value: 'midday' as const, label: 'Midday', description: 'Reset, recenter', icon: Zap },
  { value: 'evening' as const, label: 'Evening', description: 'Process the day', icon: Moon },
  { value: 'night' as const, label: 'Night', description: 'Release, prepare for sleep', icon: Moon },
] as const;

const STRUCTURES = [
  { value: 'guided' as const, label: 'Guided', description: 'Full AI guidance throughout' },
  { value: 'hybrid' as const, label: 'Hybrid', description: 'Mix of guided and self-directed' },
  { value: 'self_directed' as const, label: 'Self-Directed', description: 'You choose, app supports' },
] as const;

const REFLECTION_DEPTHS = [
  { value: 'micro' as const, label: 'Micro (1-2 min)', description: 'Single prompt, quick insight' },
  { value: 'standard' as const, label: 'Standard (3-5 min)', description: 'Journaling with guidance' },
  { value: 'deep' as const, label: 'Deep (10+ min)', description: 'Inquiry spiral, full exploration' },
] as const;

const SPEED_PROFILES = [
  { value: 'adaptive' as const, label: 'Adaptive', description: 'Engine decides based on your patterns' },
  { value: 'fast' as const, label: 'Fast Tracker', description: '5-7 sessions per level, push pace' },
  { value: 'steady' as const, label: 'Steady Walker', description: '8-14 sessions per level, balanced' },
  { value: 'deep' as const, label: 'Deep Digger', description: '15-25 sessions per level, thorough' },
] as const;

const DIFFICULTY_OVERRIDES = [
  { value: 'standard' as const, label: 'Standard', description: 'Normal progression' },
  { value: 'gentler' as const, label: 'Gentler', description: 'Easier practices, more support' },
  { value: 'harder' as const, label: 'Harder', description: 'More challenging, less scaffolding' },
] as const;

function Section({ title, description, icon: Icon, children, className = '' }: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-gold" />}
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && <CardDescription className="text-xs">{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

function FocusTypeCard({ focus, isSelected, onClick }: {
  focus: typeof FOCUS_TYPES[0];
  isSelected: boolean;
  onClick: () => void;
}) {
  const suitableGates = focus.suitableGates.join(', ');
  return (
    <Button
      variant={isSelected ? 'default' : 'outline'}
      className="w-full h-auto p-3 text-left transition-all hover:shadow-lg hover:shadow-gold/10"
      onClick={onClick}
      style={{ borderColor: isSelected ? 'hsl(var(--gold))' : undefined }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">{focus.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{focus.label}</span>
            {focus.id === 'custom' && <span className="text-xs px-1.5 py-0.5 bg-gold/20 text-gold rounded">Custom</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{focus.description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {focus.defaultDuration[0]}-{focus.defaultDuration[1]} min
            </span>
            <span className="flex items-center gap-1">
              <Sun className="w-3 h-3" />
              {suitableGates}
            </span>
          </div>
        </div>
        {isSelected && <span className="text-gold">✓</span>}
      </div>
    </Button>
  );
}

export function BasicConfigTab({ config, onChange, validation }: BasicConfigTabProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    focus: true,
    time: true,
    guide: true,
    domains: false,
    structure: false,
    advanced: false,
  });

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ScrollArea className="h-full pr-2">
      <div className="space-y-4">
        <Section
          title="Focus Type"
          description="What kind of practice do you want right now?"
          icon={Target}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {FOCUS_TYPES.map(focus => (
              <FocusTypeCard
                key={focus.id}
                focus={focus}
                isSelected={config.focusType === focus.id}
                onClick={() => onChange({ focusType: focus.id })}
              />
            ))}
          </div>
          {config.focusType === 'custom' && (
            <div className="mt-3 space-y-2">
              <input
                type="text"
                placeholder="Custom focus name (e.g., 'Anger Transformation')"
                value={config.customFocusName || ''}
                onChange={e => onChange({ customFocusName: e.target.value })}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
              <textarea
                placeholder="Describe your custom focus..."
                value={config.customFocusDescription || ''}
                onChange={e => onChange({ customFocusDescription: e.target.value })}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold min-h-[60px]"
                rows={2}
              />
            </div>
          )}
        </Section>

        <Section
          title="Time & Energy"
          description="How long and what energy level suits you now"
          icon={Clock}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                <span>Duration</span>
                <span className="font-mono text-gold">{config.timeBudgetMin} min</span>
              </Label>
              <Slider
                value={[config.timeBudgetMin]}
                onValueChange={([v]) => onChange({ timeBudgetMin: v })}
                min={1}
                max={120}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 min</span>
                <span>2 hrs</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Energy Mode</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {ENERGY_MODES.map(mode => (
                  <Button
                    key={mode.value}
                    variant={config.energyMode === mode.value ? 'default' : 'outline'}
                    className="h-auto p-3 text-left justify-start"
                    onClick={() => onChange({ energyMode: mode.value })}
                  >
                    <div className="flex items-center gap-2">
                      <mode.icon className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{mode.label}</div>
                        <div className="text-xs text-muted-foreground">{mode.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preferred Time (Gate)</Label>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {GATES.map(gate => (
                  <Button
                    key={gate.value}
                    variant={config.preferredGate === gate.value ? 'default' : 'outline'}
                    className="h-auto p-3 text-left justify-start"
                    onClick={() => onChange({ preferredGate: gate.value })}
                  >
                    <div className="flex items-center gap-2">
                      <gate.icon className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{gate.label}</div>
                        <div className="text-xs text-muted-foreground">{gate.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Speed Profile</Label>
              <Select value={config.speedProfile} onValueChange={v => onChange({ speedProfile: v as 'fast' | 'steady' | 'deep' | 'adaptive' })} className="w-full">
                <SelectTrigger>
                  <SelectValue placeholder="Select speed profile" />
                </SelectTrigger>
                <SelectContent>
                  {SPEED_PROFILES.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      <div className="flex flex-col">
                        <span>{p.label}</span>
                        <span className="text-xs text-muted-foreground">{p.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Section>

        <Section
          title="Guide & Structure"
          description="How you want to be guided through the session"
          icon={User}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Guide Style</Label>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {GUIDE_STYLES.map(style => (
                  <Button
                    key={style.id}
                    variant={config.guideStyle === style.id ? 'default' : 'outline'}
                    className="h-auto p-3 text-left justify-start"
                    onClick={() => onChange({ guideStyle: style.id })}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{style.emoji}</span>
                      <div>
                        <div className="font-medium">{style.label}</div>
                        <div className="text-xs text-muted-foreground">{style.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Session Structure</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {STRUCTURES.map(s => (
                  <Button
                    key={s.value}
                    variant={config.structure === s.value ? 'default' : 'outline'}
                    className="h-auto p-3 text-left justify-start"
                    onClick={() => onChange({ structure: s.value })}
                  >
                    <div className="font-medium">{s.label}</div>
                    <div className="text-xs text-muted-foreground">{s.description}</div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reflection Depth</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {REFLECTION_DEPTHS.map(r => (
                  <Button
                    key={r.value}
                    variant={config.reflectionDepth === r.value ? 'default' : 'outline'}
                    className="h-auto p-3 text-left justify-start"
                    onClick={() => onChange({ reflectionDepth: r.value })}
                  >
                    <div className="font-medium">{r.label}</div>
                    <div className="text-xs text-muted-foreground">{r.description}</div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Difficulty Override</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {DIFFICULTY_OVERRIDES.map(d => (
                  <Button
                    key={d.value}
                    variant={config.difficultyOverride === d.value ? 'default' : 'outline'}
                    className="h-auto p-3 text-left justify-start"
                    onClick={() => onChange({ difficultyOverride: d.value })}
                  >
                    <div className="font-medium">{d.label}</div>
                    <div className="text-xs text-muted-foreground">{d.description}</div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section
          title="Life Domain Weights"
          description="Which life areas need attention (influences practice selection)"
          icon={Brain}
        >
          <div className="space-y-3">
            {LIFE_DOMAINS.map(domain => {
              const value = config.domainWeights[domain.id] ?? 0.5;
              const dimensionColors = {
                thought: 'text-blue-400',
                emotion: 'text-pink-400',
                body: 'text-amber-400',
                action: 'text-green-400',
                connection: 'text-purple-400',
                spirit: 'text-gold',
              };
              return (
                <div key={domain.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                  <span className="text-xl">{domain.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate">{domain.label}</span>
                      <span className={`font-mono ${dimensionColors[domain.relatedDimension]}`}>{Math.round(value * 100)}%</span>
                    </div>
                    <Slider
                      value={[value]}
                      onValueChange={([v]) => onChange({ domainWeights: { ...config.domainWeights, [domain.id]: v } })}
                      min={0}
                      max={1}
                      step={0.1}
                      className="w-full mt-1"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        <Section
          title="Practice Filters"
          description="Include or exclude specific practices"
          icon={Sparkles}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Included Practices</Label>
              <PracticeMultiSelect
                value={config.includedPracticeIds}
                onChange={v => onChange({ includedPracticeIds: v })}
                placeholder="Add practices to prioritize..."
              />
            </div>
            <div className="space-y-2">
              <Label>Excluded Practices</Label>
              <PracticeMultiSelect
                value={config.excludedPracticeIds}
                onChange={v => onChange({ excludedPracticeIds: v })}
                placeholder="Add practices to avoid..."
              />
            </div>
          </div>
        </Section>

        <Section
          title="Accessibility"
          description="Voice, language, and display preferences"
          icon={Heart}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={config.language} onValueChange={v => onChange({ language: v })} className="w-full">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.voiceEnabled}
                  onChange={e => onChange({ voiceEnabled: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-gold focus:ring-gold"
                />
                <span>Voice Enabled</span>
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.reducedMotion}
                  onChange={e => onChange({ reducedMotion: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-gold focus:ring-gold"
                />
                <span>Reduced Motion</span>
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.screenReaderOptimized}
                  onChange={e => onChange({ screenReaderOptimized: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-gold focus:ring-gold"
                />
                <span>Screen Reader Optimized</span>
              </Label>
            </div>
          </div>
        </Section>
      </div>
    </ScrollArea>
  );
}

function PracticeMultiSelect({ value, onChange, placeholder }: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const practices = [
    'observation', 'self-inquiry', 'breath', 'witnessing', 'body',
    'bhakti', 'karma', 'jnana', 'raja', 'kriya', 'tantra',
    'neuroscience', 'emotional-healing', 'loop-dissolution',
    'relationship', 'work-career', 'finance', 'health'
  ];

  return (
    <div className="flex flex-wrap gap-2 min-h-[44px] p-2 bg-input/50 rounded-lg border border-border">
      {value.map(p => (
        <span key={p} className="inline-flex items-center gap-1 px-2 py-1 bg-gold/20 text-gold text-xs rounded-full">
          {p}
          <button
            type="button"
            onClick={() => onChange(value.filter(x => x !== p))}
            className="hover:text-gold/70"
          >
            ×
          </button>
        </span>
      ))}
      <select
        onChange={e => {
          if (e.target.value) {
            onChange([...value, e.target.value]);
            e.target.value = '';
          }
        }}
        className="bg-transparent border-none text-sm text-muted-foreground focus:outline-none"
      >
        <option value="" disabled selected>{placeholder}</option>
        {practices.filter(p => !value.includes(p)).map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
    </div>
  );
}