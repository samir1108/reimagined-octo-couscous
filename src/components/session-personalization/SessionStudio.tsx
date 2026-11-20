import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Brain,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Heart,
  Layers,
  Loader2,
  Lock,
  Moon,
  RotateCcw,
  Save,
  Shield,
  Sparkles,
  Sun,
  Target,
  Timer,
  Users,
  Wand2,
  Wind,
  X,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthReady } from '@/hooks/useAuthReady';
import {
  ExtendedSessionConfiguration,
  DEFAULT_EXTENDED_CONFIG,
  SYSTEM_PRESETS,
  SessionPreset,
  SessionConfiguration,
  FOCUS_TYPES,
  GUIDE_STYLES,
  LIFE_DOMAINS,
  getFocusType,
  getGuideStyle,
  mergeExtendedConfig,
  validateSessionConfig,
} from '@/types/session-config';
import { IntentRail } from './IntentRail';
import { SessionPreview } from './SessionPreview';
import { buildPersonalizationView, PersonalizationView, PersonalizationSource } from './personalizationModel';
import { Button } from "@/design-system";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/design-system";
import { Label } from "@/design-system";
import { Slider } from "@/design-system";
import { Switch } from "@/design-system";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/design-system";
import { Badge } from "@/design-system";
import { Separator } from "@/design-system";
import { ScrollArea } from "@/design-system";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/design-system";
import AdvancedSessionConfiguration from '@/components/settings/AdvancedSessionConfiguration';

interface GeneratedSessionPlan {
  steps?: Array<Record<string, unknown>>;
  totalEstMinutes?: number;
  title?: string;
  subtitle?: string;
  whyThisSession?: string;
  whyForYou?: string;
  [key: string]: unknown;
}

const ENERGY_MODES = [
  { value: 'adaptive' as const, label: 'Adaptive', description: 'AI detects your energy', icon: Zap },
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

const STRUCTURES = [
  { value: 'guided' as const, label: 'Guided', description: 'Full AI guidance throughout' },
  { value: 'hybrid' as const, label: 'Hybrid', description: 'Mix of guided and self-directed' },
  { value: 'self_directed' as const, label: 'Self-Directed', description: 'You choose, app supports' },
] as const;

const REFLECTION_DEPTHS = [
  { value: 'micro' as const, label: 'Micro', description: '1-2 min, one prompt' },
  { value: 'standard' as const, label: 'Standard', description: '3-5 min, journaling' },
  { value: 'deep' as const, label: 'Deep', description: '10+ min, inquiry spiral' },
] as const;

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'pt', label: 'Portuguese' },
] as const;

const DURATION_QUICK_PICKS = [5, 10, 15, 20, 30, 45, 60, 90, 120];

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ');
}

function LayerCard({
  id,
  icon: Icon,
  title,
  description,
  summary,
  badge,
  children,
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  summary: string;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border/50 min-w-0 overflow-hidden">
      <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2 min-w-0">
        <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
          {Icon && <Icon className="w-5 h-5 text-golden shrink-0" />}
          <div className="min-w-0">
            <CardTitle className="text-base truncate">{title}</CardTitle>
            <CardDescription className="text-xs break-words">{description}</CardDescription>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 ml-auto shrink-0">
          {summary && <span className="text-xs text-muted-foreground text-right break-words">{summary}</span>}
          {badge !== undefined && badge > 0 && (
            <Badge variant="secondary" className="gap-1 shrink-0">
              <Check className="h-2.5 w-2.5" /> {badge}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 min-w-0">{children}</CardContent>
    </Card>
  );
}

function ChoiceButtons<T extends string>({
  options,
  value,
  onChange,
  renderOption,
}: {
  options: { value: T; label: string; description: string; icon?: React.ElementType }[];
  value: T;
  onChange: (v: T) => void;
  renderOption?: (opt: typeof options[0], isSelected: boolean) => React.ReactNode;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return renderOption ? (
          renderOption(opt, isSelected)
        ) : (
          <Button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            variant={isSelected ? 'default' : 'outline'}
            className="h-auto p-3 text-left justify-start transition-all"
            onClick={() => onChange(opt.value)}
          >
            <div className="flex items-start gap-2">
              {opt.icon && <opt.icon className="w-5 h-5 mt-0.5" />}
              <div>
                <div className="font-medium">{opt.label}</div>
                <div className="text-xs text-muted-foreground">{opt.description}</div>
              </div>
            </div>
          </Button>
        );
      })}
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.1,
  format,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: (v: number) => string;
}) {
  return (
    <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
      <Label className="text-sm font-medium w-24 shrink-0">{label}</Label>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="flex-1"
      />
      <span className="text-xs font-mono text-muted-foreground w-10 text-right">
        {format ? format(value) : `${Math.round(value * 100)}%`}
      </span>
    </div>
  );
}

interface SessionStudioProps {
  initialConfig?: Partial<ExtendedSessionConfiguration>;
  onConfigSaved?: (config: ExtendedSessionConfiguration) => void;
  embedded?: boolean;
}

function configBody(config: ExtendedSessionConfiguration) {
  const { updatedAt: _updatedAt, version: _version, ...rest } = config;
  return rest;
}

export function SessionStudio({ initialConfig, onConfigSaved, embedded = false }: SessionStudioProps) {
  const { user, isReady } = useAuthReady();

  const [config, setConfig] = useState<ExtendedSessionConfiguration>(() =>
    initialConfig ? mergeExtendedConfig(DEFAULT_EXTENDED_CONFIG, initialConfig) : DEFAULT_EXTENDED_CONFIG
  );
  const [savedConfig, setSavedConfig] = useState<ExtendedSessionConfiguration>(config);
  const [provenance, setProvenance] = useState<Record<string, PersonalizationSource>>({});
  const [presets, setPresets] = useState<SessionPreset[]>([]);
  const [isLoadingPresets, setIsLoadingPresets] = useState(false);

  const allPresets = useMemo(() => [...SYSTEM_PRESETS, ...presets], [presets]);
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [plan, setPlan] = useState<GeneratedSessionPlan | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [planStale, setPlanStale] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [planningError, setPlanningError] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const requestIdRef = useRef(0);
  const planTimerRef = useRef<number>();

  const applyPatch = useCallback(
    (patch: Partial<ExtendedSessionConfiguration>, source: PersonalizationSource = 'user') => {
      const newConfig = mergeExtendedConfig(config, patch);
      setConfig(newConfig);
      const newProvenance = { ...provenance };
      for (const key of Object.keys(patch)) {
        newProvenance[key] = source;
      }
      setProvenance(newProvenance);
    },
    [config, provenance],
  );

  const resetToSaved = useCallback(() => {
    setConfig(savedConfig);
    setProvenance({});
  }, [savedConfig]);

  const resetToDefaults = useCallback(() => {
    if (!window.confirm('Reset every personalization signal back to engine defaults? This is not saved until you save.')) return;
    setConfig(DEFAULT_EXTENDED_CONFIG);
    setProvenance({});
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isReady) return;
      if (!user) {
        setIsHydrating(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('user_consciousness_profile')
          .select('session_config')
          .eq('user_id', user.id)
          .maybeSingle();
        if (error) throw error;
        if (cancelled) return;
        const stored = (data?.session_config ?? {}) as Partial<ExtendedSessionConfiguration>;
        const loaded = mergeExtendedConfig(DEFAULT_EXTENDED_CONFIG, initialConfig ? { ...stored, ...initialConfig } : stored);
        setConfig(loaded);
        setSavedConfig(loaded);
      } catch (e) {
        console.error('Failed to load session config:', e);
      } finally {
        if (!cancelled) setIsHydrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isReady, user, initialConfig]);

  const loadPresets = useCallback(async () => {
    if (!user || isLoadingPresets) return;
    setIsLoadingPresets(true);
    try {
      const { data, error } = await supabase
        .from('user_session_presets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const mapped = (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description ?? '',
        config: row.config as SessionConfiguration,
        isSystem: row.is_system ?? false,
        createdAt: row.created_at,
        useCount: row.use_count ?? 0,
      }));
      setPresets(mapped);
    } catch (e) {
      console.error('Failed to load presets:', e);
    } finally {
      setIsLoadingPresets(false);
    }
  }, [user, isLoadingPresets]);

  const saveConfig = useCallback(async () => {
    if (!user) return;
    const validation = validateSessionConfig(config);
    if (!validation.valid) return;
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const configToSave = { ...config, updatedAt: new Date().toISOString(), version: config.version + 1 };
      const { error } = await supabase
        .from('user_consciousness_profile')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ session_config: configToSave as any })
        .eq('user_id', user.id);
      if (error) throw error;
      setSavedConfig(configToSave);
      setSaveStatus('success');
      onConfigSaved?.(configToSave);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      setSaveStatus('error');
      console.error('Save failed:', e);
    } finally {
      setIsSaving(false);
    }
  }, [config, user, onConfigSaved]);

  const saveAsPreset = useCallback(async () => {
    if (!user || !presetName.trim()) return;
    const configToSave = { ...config, updatedAt: new Date().toISOString(), version: config.version + 1 };
    try {
      const { error } = await supabase
        .from('user_session_presets')
        .insert({ user_id: user.id, name: presetName.trim(), description: presetDescription.trim(), config: configToSave, is_system: false });
      if (error) throw error;
      setPresets((prev) => [
        { id: `preset_${Date.now()}`, name: presetName.trim(), description: presetDescription.trim(), config: configToSave, isSystem: false, createdAt: new Date().toISOString(), useCount: 0 },
        ...prev,
      ]);
      setShowSavePreset(false);
      setPresetName('');
      setPresetDescription('');
    } catch (e) {
      console.error('Failed to save preset:', e);
    }
  }, [config, user, presetName, presetDescription]);

  const applyPreset = useCallback(
    (preset: SessionPreset) => {
      applyPatch(mergeExtendedConfig(DEFAULT_EXTENDED_CONFIG, preset.config), 'preset');
    },
    [applyPatch],
  );

  const generatePlan = useCallback(async () => {
    const id = ++requestIdRef.current;
    setIsPlanning(true);
    setPlanningError(null);
    if (plan) setPlanStale(true);
    try {
      const { data, error } = await supabase.functions.invoke('compose-session-v3', {
        body: {
          timeBudgetMin: config.timeBudgetMin,
          energy: config.energyMode,
          gate: config.preferredGate === 'flexible' ? undefined : config.preferredGate,
          intent: config.intent,
          sessionConfig: config,
        },
      });
      if (id !== requestIdRef.current) return;
      if (error) throw error;
      if (data?.ok) {
        setPlan(data.plan);
        setPlanStale(false);
      }
    } catch (e) {
      if (id === requestIdRef.current) setPlanningError(e instanceof Error ? e.message : 'Failed to generate plan');
    } finally {
      if (id === requestIdRef.current) setIsPlanning(false);
    }
  }, [config, plan]);

  const generatePlanRef = useRef(generatePlan);
  generatePlanRef.current = generatePlan;

  useEffect(() => {
    if (planTimerRef.current) clearTimeout(planTimerRef.current);
    planTimerRef.current = window.setTimeout(() => {
      if (!plan) return;
      generatePlanRef.current();
    }, 1200);
    return () => {
      if (planTimerRef.current) clearTimeout(planTimerRef.current);
    };
  }, [config.focusType, config.timeBudgetMin, config.energyMode, config.preferredGate, config.guideStyle, config.structure, config.reflectionDepth, plan]);

  useEffect(() => {
    if (user) loadPresets();
  }, [user, loadPresets]);

  const validation = validateSessionConfig(config);
  const view: PersonalizationView = useMemo(() => buildPersonalizationView(config, provenance), [config, provenance]);

  const isDirty = JSON.stringify(configBody(config)) !== JSON.stringify(configBody(savedConfig));

  if (!isReady || isHydrating) {
    return (
      <div className="glass-card rounded-2xl p-6 space-y-4 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="h-4 bg-muted rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-0 w-full max-w-full ${embedded ? 'space-y-4' : 'space-y-6'}`}>
      <header className={`flex flex-col gap-3 sm:flex-row sm:items-center flex-wrap ${embedded ? 'sm:justify-end' : 'sm:justify-between'}`}>
        {!embedded && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div>
              <h1 className="text-xl font-serif font-medium flex items-center gap-2">
                <Target className="w-5 h-5 text-golden" />
                Session Studio
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Deep personalization — every signal in one place</p>
            </div>
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-border/30">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Signals:</span>
                <span className="font-mono text-foreground">{view.activeSignals}/{view.totalSignals}</span>
              </div>
              <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-golden to-amber-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(view.depth * 100)}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <Badge variant="secondary" className="gap-1 text-xs capitalize font-display">
                <Sparkles className="w-2.5 h-2.5" />
                {view.depthLabel}
              </Badge>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {isDirty && (
            <Badge variant="secondary" className="gap-1.5 text-xs font-normal">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Unsaved changes
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={resetToDefaults} className="gap-1.5 text-muted-foreground">
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSavePreset(!showSavePreset)} className="gap-2">
            <Save className="w-4 h-4" /> Save as Preset
          </Button>
          <Button
            onClick={saveConfig}
            disabled={isSaving || !validation.valid}
            className="rounded-xl bg-golden text-black hover:bg-golden/90"
          >
            {isSaving ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Savingâ€¦
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Save Configuration
              </>
            )}
          </Button>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] min-w-0">
        <div className="space-y-4">
          <IntentRail config={config} onApply={applyPatch} />

          <LayerCard
            id="focus"
            icon={Compass}
            title="Practice Focus"
            description="What kind of practice do you want right now?"
            summary={getFocusType(config.focusType).label}
            badge={config.focusType !== DEFAULT_EXTENDED_CONFIG.focusType ? 1 : 0}
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {FOCUS_TYPES.map((focus) => {
                const isSelected = config.focusType === focus.id;
                return (
                  <Button
                    key={focus.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    variant={isSelected ? 'default' : 'outline'}
                    className="h-auto p-3 text-left transition-all"
                    onClick={() => applyPatch({ focusType: focus.id })}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xl">{focus.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{focus.label}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{focus.description}</div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {focus.defaultDuration[0]}-{focus.defaultDuration[1]} min</span>
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
            {config.focusType === 'custom' && (
              <div className="mt-3 space-y-3 p-3 bg-golden/5 border border-golden/20 rounded-lg">
                <p className="text-xs text-golden/80 font-medium">Custom Focus Details</p>
                <div className="space-y-2">
                  <Label className="text-xs block mb-1">Focus Name</Label>
                  <input
                    type="text"
                    placeholder="e.g., Anger Transformation"
                    value={config.customFocusName ?? ''}
                    onChange={(e) => applyPatch({ customFocusName: e.target.value })}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-golden"
                  />
                  <Label className="text-xs block mb-1">Description</Label>
                  <textarea
                    placeholder="Describe your custom focus..."
                    value={config.customFocusDescription ?? ''}
                    onChange={(e) => applyPatch({ customFocusDescription: e.target.value })}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-golden min-h-[60px]"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </LayerCard>

          <LayerCard
            id="shape"
            icon={Timer}
            title="Session Shape"
            description="Length, energy, timing and intensity"
            summary={`${config.timeBudgetMin} min Â· ${capitalize(config.energyMode)} Â· ${capitalize(config.difficultyOverride)}`}
            badge={[
              config.timeBudgetMin !== DEFAULT_EXTENDED_CONFIG.timeBudgetMin,
              config.energyMode !== DEFAULT_EXTENDED_CONFIG.energyMode,
              config.preferredGate !== DEFAULT_EXTENDED_CONFIG.preferredGate,
              config.speedProfile !== DEFAULT_EXTENDED_CONFIG.speedProfile,
              config.difficultyOverride !== DEFAULT_EXTENDED_CONFIG.difficultyOverride,
            ].filter(Boolean).length}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center justify-between">
                  <span>Duration</span>
                  <span className="font-mono text-golden">{config.timeBudgetMin} min</span>
                </Label>
                <Slider
                  value={[config.timeBudgetMin]}
                  onValueChange={([v]) => applyPatch({ timeBudgetMin: v })}
                  min={1}
                  max={120}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Quick picks:</p>
                <div className="flex gap-2 flex-wrap">
                  {DURATION_QUICK_PICKS.map((m) => (
                    <Button
                      key={m}
                      type="button"
                      variant={config.timeBudgetMin === m ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => applyPatch({ timeBudgetMin: m })}
                      className="rounded-full transition-all hover:shadow-sm"
                    >
                      {m} min
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Energy</Label>
                <ChoiceButtons
                  options={ENERGY_MODES}
                  value={config.energyMode}
                  onChange={(v) => applyPatch({ energyMode: v })}
                  renderOption={(opt, selected) => (
                    <Button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      variant={selected ? 'default' : 'outline'}
                      className="h-auto p-3 text-left justify-start"
                      onClick={() => applyPatch({ energyMode: opt.value })}
                    >
                      <div className="flex items-center gap-2">
                        <opt.icon className="w-5 h-5" />
                        <div>
                          <div className="font-medium">{opt.label}</div>
                          <div className="text-xs text-muted-foreground">{opt.description}</div>
                        </div>
                      </div>
                    </Button>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Preferred Time (Gate)</Label>
                <ChoiceButtons
                  options={GATES}
                  value={config.preferredGate}
                  onChange={(v) => applyPatch({ preferredGate: v })}
                  renderOption={(opt, selected) => (
                    <Button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      variant={selected ? 'default' : 'outline'}
                      className="h-auto p-3 text-left justify-start"
                      onClick={() => applyPatch({ preferredGate: opt.value })}
                    >
                      <div className="flex items-center gap-2">
                        <opt.icon className="w-5 h-5" />
                        <div>
                          <div className="font-medium">{opt.label}</div>
                          <div className="text-xs text-muted-foreground">{opt.description}</div>
                        </div>
                      </div>
                    </Button>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Progression Pace</Label>
                <Select value={config.speedProfile} onValueChange={(v) => applyPatch({ speedProfile: v as ExtendedSessionConfiguration['speedProfile'] })} className="w-full">
                  <SelectTrigger><SelectValue placeholder="Select speed profile" /></SelectTrigger>
                  <SelectContent>
                    {SPEED_PROFILES.map((p) => (
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

              <div className="space-y-2">
                <Label>Difficulty</Label>
                <ChoiceButtons
                  options={DIFFICULTY_OVERRIDES}
                  value={config.difficultyOverride}
                  onChange={(v) => applyPatch({ difficultyOverride: v })}
                  renderOption={(opt, selected) => (
                    <Button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      variant={selected ? 'default' : 'outline'}
                      className="h-auto p-3 text-left justify-start"
                      onClick={() => applyPatch({ difficultyOverride: opt.value })}
                    >
                      <div className="font-medium">{opt.label}</div>
                      <div className="text-xs text-muted-foreground">{opt.description}</div>
                    </Button>
                  )}
                />
              </div>
            </div>
          </LayerCard>

          <LayerCard
            id="guidance"
            icon={Wind}
            title="Guidance & Reflection"
            description="How the session is led and how deeply you reflect"
            summary={`${capitalize(config.structure)} Â· ${capitalize(config.reflectionDepth)} Â· ${getGuideStyle(config.guideStyle).label}`}
            badge={[
              config.structure !== DEFAULT_EXTENDED_CONFIG.structure,
              config.reflectionDepth !== DEFAULT_EXTENDED_CONFIG.reflectionDepth,
              config.guideStyle !== DEFAULT_EXTENDED_CONFIG.guideStyle,
            ].filter(Boolean).length}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Guidance Level</Label>
                <ChoiceButtons
                  options={STRUCTURES}
                  value={config.structure}
                  onChange={(v) => applyPatch({ structure: v })}
                />
              </div>
              <div className="space-y-2">
                <Label>Reflection Depth</Label>
                <ChoiceButtons
                  options={REFLECTION_DEPTHS}
                  value={config.reflectionDepth}
                  onChange={(v) => applyPatch({ reflectionDepth: v })}
                />
              </div>
              <div className="space-y-2">
                <Label>Guide Style</Label>
                <ChoiceButtons
                  options={GUIDE_STYLES.map((s) => ({ value: s.id as const, label: s.label, description: s.description, icon: undefined }))}
                  value={config.guideStyle}
                  onChange={(v) => applyPatch({ guideStyle: v })}
                  renderOption={(opt, selected) => (
                    <Button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      variant={selected ? 'default' : 'outline'}
                      className="h-auto p-3 text-left justify-start"
                      onClick={() => applyPatch({ guideStyle: opt.value })}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getGuideStyle(opt.value).emoji}</span>
                        <div>
                          <div className="font-medium">{opt.label}</div>
                          <div className="text-xs text-muted-foreground">{opt.description}</div>
                        </div>
                      </div>
                    </Button>
                  )}
                />
              </div>
            </div>
          </LayerCard>

          <LayerCard
            id="priorities"
            icon={Heart}
            title="Life Priorities"
            description="Which life areas receive the practice"
            summary={
              LIFE_DOMAINS.map((d) => ({ label: d.label, weight: config.domainWeights[d.id] ?? 0.5 }))
                .sort((a, b) => b.weight - a.weight)
                .slice(0, 2)
                .map((entry) => entry.label)
                .join(' Â· ')
            }
            badge={LIFE_DOMAINS.filter((d) => Math.abs((config.domainWeights[d.id] ?? 0.5) - (DEFAULT_EXTENDED_CONFIG.domainWeights[d.id] ?? 0.5)) > 0.001).length}
          >
            <div className="space-y-3">
              {LIFE_DOMAINS.map((domain) => {
                const value = config.domainWeights[domain.id] ?? 0.5;
                const dimensionColors = {
                  thought: 'text-blue-400',
                  emotion: 'text-pink-400',
                  body: 'text-amber-400',
                  action: 'text-green-400',
                  connection: 'text-purple-400',
                  spirit: 'text-golden',
                };
                return (
                  <div key={domain.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                    <span className="text-lg">{domain.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate">{domain.label}</span>
                        <span className={`font-mono ${dimensionColors[domain.relatedDimension]}`}>{Math.round(value * 100)}%</span>
                      </div>
                      <Slider
                        value={[value]}
                        onValueChange={([v]) => applyPatch({ domainWeights: { ...config.domainWeights, [domain.id]: v } })}
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
          </LayerCard>

          <LayerCard
            id="access"
            icon={Shield}
            title="Access Needs"
            description="Voice, motion and screen-reader support"
            summary={
              [config.voiceEnabled ? 'Voice' : null, config.reducedMotion ? 'Reduced motion' : null, config.screenReaderOptimized ? 'SR pacing' : null]
                .filter(Boolean)
                .join(' Â· ') || 'No access overrides'
            }
            badge={[
              config.voiceEnabled !== DEFAULT_EXTENDED_CONFIG.voiceEnabled,
              config.reducedMotion !== DEFAULT_EXTENDED_CONFIG.reducedMotion,
              config.screenReaderOptimized !== DEFAULT_EXTENDED_CONFIG.screenReaderOptimized,
              config.language !== DEFAULT_EXTENDED_CONFIG.language,
            ].filter(Boolean).length}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={config.language} onValueChange={(v) => applyPatch({ language: v })} className="w-full">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.voiceEnabled}
                    onChange={(e) => applyPatch({ voiceEnabled: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-golden focus:ring-golden"
                  />
                  <span>Voice Guidance</span>
                </Label>
              </div>
              <div className="flex items-center gap-4">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.reducedMotion}
                    onChange={(e) => applyPatch({ reducedMotion: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-golden focus:ring-golden"
                  />
                  <span>Reduced Motion</span>
                </Label>
              </div>
              <div className="flex items-center gap-4">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.screenReaderOptimized}
                    onChange={(e) => applyPatch({ screenReaderOptimized: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-golden focus:ring-golden"
                  />
                  <span>Screen-Reader Pacing</span>
                </Label>
              </div>
            </div>
          </LayerCard>

          <LayerCard
            id="advanced"
            icon={Layers}
            title="Advanced Controls"
            description="Practices, safeguards, personas, schedules and continuity"
            summary={view.layers.find((l) => l.id === 'advanced')?.summary ?? 'Using engine defaults'}
            badge={view.layers.find((l) => l.id === 'advanced')?.customizedCount ?? 0}
          >
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger className="w-full">
                <Card className={`mb-2 transition-all ${advancedOpen ? 'border-golden/30 shadow-golden/5' : ''}`}>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 cursor-pointer hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg glass-subtle flex items-center justify-center">
                        <Layers className="w-4 h-4 text-golden" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-medium">Advanced Controls</CardTitle>
                        <CardDescription className="text-xs">Practices, safeguards, personas, schedules & continuity</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {view.layers.find((l) => l.id === 'advanced')?.customizedCount && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <TrendingUp className="w-2.5 h-2.5" />
                          {view.layers.find((l) => l.id === 'advanced')?.customizedCount} active
                        </Badge>
                      )}
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Card className="mb-4">
                  <CardContent className="pt-4">
                    <AdvancedSessionConfiguration config={config} onChange={applyPatch} />
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </LayerCard>
        </div>

        <aside className="xl:sticky xl:top-24 space-y-4 min-w-0">
          <Card className="border-golden/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-golden" />
                  Live Plan
                </CardTitle>
                <Button
                  size="sm"
                  variant={isPlanning ? 'default' : 'outline'}
                  onClick={generatePlan}
                  disabled={isPlanning}
                  className="gap-2 h-8 text-xs rounded-lg"
                >
                  {isPlanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                  {isPlanning ? 'Updatingâ€¦' : 'Regenerate'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {planStale && (
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
                  <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                  <span>Showing previous plan while updatingâ€¦</span>
                </div>
              )}

              {planningError && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-medium">Preview failed</p>
                    <p className="text-xs opacity-90">{planningError} â€” manual controls remain fully functional.</p>
                    <Button size="sm" variant="outline" className="mt-2 gap-1" onClick={generatePlan}>
                      <RotateCcw className="h-3 w-3" /> Retry
                    </Button>
                  </div>
                </div>
              )}

              {!plan && !isPlanning && !planStale && (
                <div className="flex flex-col items-center justify-center gap-3 py-8 border-dashed rounded-lg">
                  <Target className="h-10 w-10 text-muted-foreground/50" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">No session plan yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Click Regenerate to compose a session from your settings</p>
                  </div>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={generatePlan}
                    className="gap-2 rounded-lg"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Plan
                  </Button>
                </div>
              )}

              {plan && (
                <SessionPreview session={plan} isLoading={isPlanning} config={config} />
              )}

              <Separator />

              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Effective Settings</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{getFocusType(config.focusType).label}</Badge>
                  <Badge variant="secondary">{config.timeBudgetMin} min</Badge>
                  <Badge variant="secondary">{capitalize(config.energyMode)}</Badge>
                  <Badge variant="secondary">{capitalize(config.preferredGate)}</Badge>
                  <Badge variant="secondary">{capitalize(config.guideStyle)}</Badge>
                  <Badge variant="secondary">{capitalize(config.structure)}</Badge>
                  <Badge variant="secondary">{capitalize(config.reflectionDepth)}</Badge>
                  <Badge variant="secondary">{capitalize(config.difficultyOverride)}</Badge>
                </div>
              </div>

              {view.conflicts.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-destructive/70">Conflicts</p>
                  <div className="space-y-2">
                    {view.conflicts.map((conflict) => (
                      <div key={conflict.id} className={`rounded-lg p-3 ${conflict.severity === 'blocking' ? 'border-destructive/40 bg-destructive/10' : 'border-amber-500/40 bg-amber-500/10'}`}>
                        <div className="flex items-start gap-2">
                          {conflict.severity === 'blocking' ? <Lock className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
                          <div>
                            <p className="text-sm font-medium">{conflict.message}</p>
                            <p className="text-xs opacity-90 mt-1">{conflict.resolution}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Priorities</p>
                <div className="flex flex-wrap gap-2">
                  {view.primaryDomains.map((domain) => (
                    <Badge key={domain.id} variant="secondary" className="gap-1">
                      <span>{domain.emoji}</span> {domain.label} {Math.round(domain.weight * 100)}%
                    </Badge>
                  ))}
                </div>
              </div>

              {view.practiceTargets.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-border/50">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Practice Targets</p>
                  <div className="flex flex-wrap gap-2">
                    {view.practiceTargets.map((target) => (
                      <Badge key={target.id} variant="outline" className="text-[10px]">
                        {target.id}: L{target.level} ({target.priority})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {view.shadowTargets.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-border/50">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Shadow Work</p>
                  <div className="flex flex-wrap gap-2">
                    {view.shadowTargets.map((target) => (
                      <Badge key={target.id} variant="outline" className="gap-1">
                        <Target className="h-3 w-3" /> {target.name} ({target.priority})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {view.masters.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-border/50">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Master Personas</p>
                  <div className="flex flex-wrap gap-2">
                    {view.masters.map((master, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1">
                        <BookOpen className="h-3 w-3" /> {master.practice} â†’ {master.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2 border-t border-border/50">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Adaptive Safeguards</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {view.safeguards.map((safeguard, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 bg-muted/50 rounded-lg">
                      <span className="text-muted-foreground">{safeguard.label}</span>
                      <span className="font-medium">{safeguard.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-golden" />
                Presets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {showSavePreset && (
                <div className="space-y-2 p-3 bg-golden/5 border border-golden/20 rounded-lg">
                  <input
                    type="text"
                    placeholder="Preset name"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-golden"
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={presetDescription}
                    onChange={(e) => setPresetDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-golden"
                  />
                  <div className="flex gap-2">
                    <Button onClick={saveAsPreset} disabled={!presetName.trim()}>Save Preset</Button>
                    <Button variant="outline" onClick={() => { setShowSavePreset(false); setPresetName(''); setPresetDescription(''); }}>Cancel</Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs text-muted-foreground mb-1">Apply a preset</label>
                <Select
                  onValueChange={(v) => {
                    if (v) applyPreset(allPresets.find((p) => p.id === v)!);
                  }}
                  className="w-full"
                >
                  <SelectTrigger><SelectValue placeholder="Select presetâ€¦" /></SelectTrigger>
                  <SelectContent>
                    {allPresets.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        <div className="flex flex-col">
                          <span>{preset.name} {preset.isSystem && <span className="text-[10px] text-muted-foreground"> (System)</span>}</span>
                          <span className="text-xs text-muted-foreground">{preset.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 text-sm border-t border-border/50 pt-4 min-w-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            {validation.valid ? (
              <>
                <BadgeCheck className="w-3.5 h-3.5 text-green-500" />
                <span className="text-green-700 dark:text-green-300 font-medium">Configuration valid</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                <span className="text-destructive font-medium">{validation.errors.length} issue{validation.errors.length !== 1 ? 's' : ''}</span>
              </>
            )}
          </div>
          {view.conflicts.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-amber-700 dark:text-amber-300 font-medium">{view.conflicts.length} conflict{view.conflicts.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-muted-foreground text-xs">
            <span>Depth:</span>
            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-golden to-amber-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(view.depth * 100)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <span className="font-mono w-10 text-right">{Math.round(view.depth * 100)}%</span>
          </div>
          <Badge variant="secondary" className="gap-1.5 px-2.5 py-1 font-display text-xs">
            <Sparkles className="w-3 h-3" />
            <span className="capitalize">{view.depthLabel}</span>
          </Badge>
        </div>
      </div>

      {showSavePreset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setShowSavePreset(false); setPresetName(''); setPresetDescription(''); }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass-card rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-display font-semibold">Save as Preset</h4>
              <button onClick={() => { setShowSavePreset(false); setPresetName(''); setPresetDescription(''); }} className="p-1 rounded-full hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
        <div className="space-y-4 min-w-0">
              <div>
                <Label className="text-xs mb-1 block">Name</Label>
                <input
                  type="text"
                  placeholder="My Morning Focus"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-golden"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Description (optional)</Label>
                <textarea
                  placeholder="Sharp 20-min concentration to start the day"
                  value={presetDescription}
                  onChange={(e) => setPresetDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-golden"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => { setShowSavePreset(false); setPresetName(''); setPresetDescription(''); }}>Cancel</Button>
                <Button onClick={saveAsPreset} disabled={!presetName.trim()}>Save</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

