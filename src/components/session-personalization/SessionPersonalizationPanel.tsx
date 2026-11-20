import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SessionConfiguration,
  ExtendedSessionConfiguration,
  FocusType,
  GuideStyle,
  LifeDomainId,
  SessionPreset,
  DEFAULT_SESSION_CONFIG,
  DEFAULT_EXTENDED_CONFIG,
  SYSTEM_PRESETS,
  validateSessionConfig,
  mergeSessionConfig,
  mergeExtendedConfig,
  getFocusType,
  getGuideStyle,
  getLifeDomain,
} from '@/types/session-config';
import { supabase } from '@/lib/supabase';
import { useAuthReady } from '@/hooks/useAuthReady';
import { BasicConfigTab } from './BasicConfigTab';
import { AdvancedConfigTab } from './AdvancedConfigTab';
import { PresetsTab } from './PresetsTab';
import { NaturalLanguageInput } from './NaturalLanguageInput';
import { SessionPreview } from './SessionPreview';
import { Button } from "@/design-system";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/design-system";
import { Card, CardContent, CardHeader, CardTitle } from "@/design-system";
import { Separator } from "@/design-system";
import { Alert, AlertDescription } from "@/design-system";
import { CheckCircle2, AlertCircle, Save, Sparkles, Settings2, BookOpen, Zap, Eye } from 'lucide-react';

export interface SessionPersonalizationPanelProps {
  initialConfig?: Partial<ExtendedSessionConfiguration>;
  onSave?: (config: ExtendedSessionConfiguration) => Promise<void>;
  onClose?: () => void;
  mode?: 'full' | 'compact' | 'wizard';
  showPreview?: boolean;
}

const TAB_CONFIG = [
  { id: 'basic', label: 'Essentials', icon: Settings2, description: 'Focus, time, guide style, energy' },
  { id: 'advanced', label: 'Advanced', icon: Zap, description: 'Practice targets, micro-techniques, resistance rules' },
  { id: 'presets', label: 'Presets', icon: BookOpen, description: 'Save, load, and share configurations' },
  { id: 'ai', label: 'AI Designer', icon: Sparkles, description: 'Describe your session in natural language' },
] as const;

export function SessionPersonalizationPanel({
  initialConfig,
  onSave,
  onClose,
  mode = 'full',
  showPreview = true,
}: SessionPersonalizationPanelProps) {
  const { user } = useAuthReady();
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'presets' | 'ai'>('basic');
  const [config, setConfig] = useState<ExtendedSessionConfiguration>(() => 
    initialConfig ? mergeExtendedConfig(DEFAULT_EXTENDED_CONFIG, initialConfig) : DEFAULT_EXTENDED_CONFIG
  );
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[] }>({ valid: true, errors: [] });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [userPresets, setUserPresets] = useState<SessionPreset[]>([]);
  const [previewSession, setPreviewSession] = useState<Record<string, unknown> | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      setConfig(mergeExtendedConfig(DEFAULT_EXTENDED_CONFIG, initialConfig));
    }
    loadUserPresets();
  }, [initialConfig]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const result = validateSessionConfig(config);
    setValidation(result);
  }, [config]);

  const loadUserPresets = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('user_session_presets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setUserPresets(data as SessionPreset[]);
    } catch (e) {
      console.error('Failed to load presets:', e);
    }
  };

  const handleConfigChange = useCallback((updates: Partial<ExtendedSessionConfiguration>) => {
    setConfig(prev => mergeExtendedConfig(prev, updates));
    setSaveStatus('idle');
  }, []);

  const handleSave = async () => {
    if (!validation.valid) return;
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const configToSave = { ...config, updatedAt: new Date().toISOString(), version: config.version + 1 };
      if (onSave) {
        await onSave(configToSave);
      } else if (user) {
        await supabase
          .from('user_consciousness_profile')
          .update({ session_config: configToSave as any }) // eslint-disable-line @typescript-eslint/no-explicit-any
          .eq('user_id', user.id);
      }
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      setSaveStatus('error');
      console.error('Save failed:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePresetSelect = useCallback((preset: SessionPreset) => {
    setConfig(mergeExtendedConfig(DEFAULT_EXTENDED_CONFIG, preset.config));
    setActiveTab('basic');
  }, []);

  const handleGeneratePreview = async () => {
    setIsGeneratingPreview(true);
    try {
      const { data } = await supabase.functions.invoke('compose-session-v3', {
        body: {
          timeBudgetMin: config.timeBudgetMin,
          energy: config.energyMode,
          gate: config.preferredGate === 'flexible' ? undefined : config.preferredGate,
          intent: config.intent,
          sessionConfig: config,
        },
      });
      if (data?.ok) setPreviewSession(data.plan);
    } catch (e) {
      console.error('Preview generation failed:', e);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  useEffect(() => {
    if (showPreview && config.timeBudgetMin > 0) {
      const timer = setTimeout(handleGeneratePreview, 500);
      return () => clearTimeout(timer);
    }
  }, [config.timeBudgetMin, config.focusType, config.guideStyle, config.energyMode, config.preferredGate]); // eslint-disable-line react-hooks/exhaustive-deps

  const allPresets = useMemo(() => [...SYSTEM_PRESETS, ...userPresets], [userPresets]);

  const hasUnsavedChanges = useMemo(() => {
    if (!initialConfig) return true;
    return JSON.stringify(config) !== JSON.stringify(mergeExtendedConfig(DEFAULT_EXTENDED_CONFIG, initialConfig));
  }, [config, initialConfig]);

  const saveAsPreset = async (name: string, description: string) => {
    if (!user) return;
    
    const preset: SessionPreset = {
      id: `preset_${Date.now()}`,
      name,
      description,
      config: config,
      isSystem: false,
      createdAt: new Date().toISOString(),
      useCount: 0,
    };
    
    await supabase.from('user_session_presets').insert({
      user_id: user.id,
      ...preset,
    });
    
    setUserPresets(prev => [preset, ...prev]);
  };

  if (mode === 'compact') {
    return (
      <div className="space-y-4">
        <CompactConfigView config={config} onChange={handleConfigChange} validation={validation} />
        {showPreview && <SessionPreview session={previewSession} isLoading={isGeneratingPreview} />}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving || !validation.valid}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[90vh] bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col h-full"
      >
        <header className="flex items-center justify-between p-4 border-b border-border/50">
          <div>
            <h1 className="text-xl font-serif font-medium">Personalize Your Session</h1>
            <p className="text-sm text-muted-foreground">1000+ combinations â€” tune every aspect</p>
          </div>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <span className="text-xs text-amber-500 flex items-center gap-1">
                <Zap className="w-3 h-3 animate-pulse" /> Unsaved changes
              </span>
            )}
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            )}
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 border-b border-border/50 px-2">
            {TAB_CONFIG.map(({ id, label, icon: Icon, description }) => (
              <TabsTrigger
                key={id}
                value={id}
                className="flex flex-col items-start gap-1 px-3 py-3 text-left hover:bg-accent/50 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{description}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <TabsContent value="basic" className="space-y-4 animate-in fade-in-0 duration-200">
              <BasicConfigTab config={config} onChange={handleConfigChange} validation={validation} />
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 animate-in fade-in-0 duration-200">
              <AdvancedConfigTab config={config} onChange={handleConfigChange} />
            </TabsContent>

            <TabsContent value="presets" className="space-y-4 animate-in fade-in-0 duration-200">
              <PresetsTab
                presets={allPresets}
                currentConfig={config}
                onSelect={handlePresetSelect}
                onSave={(name, description) => saveAsPreset(name, description)}
              />
            </TabsContent>

            <TabsContent value="ai" className="space-y-4 animate-in fade-in-0 duration-200">
              <NaturalLanguageInput
                currentConfig={config}
                onConfigChange={handleConfigChange}
                userContext={user ? { id: user.id } : undefined}
              />
            </TabsContent>
          </div>
        </Tabs>

        {!validation.valid && (
          <Alert className="mx-4 mb-4 border-destructive/50 bg-destructive/10" variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-sm">
              <ul className="list-disc list-inside space-y-1 mt-1">
                {validation.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {showPreview && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="border-t border-border/50"
          >
            <SessionPreview session={previewSession} isLoading={isGeneratingPreview} config={config} />
          </motion.div>
        )}

        <footer className="p-4 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" style={{ color: validation.valid ? '#22c55e' : '#ef4444' }} />
              {validation.valid ? 'Configuration valid' : `${validation.errors.length} issue(s)`}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              Preview: {previewSession ? 'Ready' : isGeneratingPreview ? 'Generating...' : 'Auto'}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !validation.valid}
              className="bg-gold text-black hover:bg-gold/90"
            >
              {isSaving ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}

function CompactConfigView({ config, onChange, validation }: { config: ExtendedSessionConfiguration; onChange: (u: Partial<ExtendedSessionConfiguration>) => void; validation: { valid: boolean; errors: string[] } }) {
  return (
    <Card className="space-y-4">
      <CardContent className="space-y-4 pt-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FocusTypeSelector value={config.focusType} onChange={v => onChange({ focusType: v })} />
          <GuideStyleSelector value={config.guideStyle} onChange={v => onChange({ guideStyle: v })} />
          <TimeBudgetSelector value={config.timeBudgetMin} onChange={v => onChange({ timeBudgetMin: v })} />
          <EnergyModeSelector value={config.energyMode} onChange={v => onChange({ energyMode: v })} />
        </div>
        <DomainWeightsEditor weights={config.domainWeights} onChange={v => onChange({ domainWeights: v })} />
      </CardContent>
    </Card>
  );
}

function FocusTypeSelector({ value, onChange }: { value: FocusType; onChange: (v: FocusType) => void }) {
  const focus = getFocusType(value);
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">Focus Type</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value as FocusType)}
        className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold"
      >
        {[
          'focus', 'attention', 'self_inquiry', 'raja_yoga', 'jnana', 'bhakti',
          'karma', 'tantra', 'kundalini', 'healing', 'sleep', 'energy',
          'relationship', 'work', 'creativity', 'custom'
        ].map(id => (
          <option key={id} value={id}>
            {getFocusType(id as FocusType).emoji} {getFocusType(id as FocusType).label}
          </option>
        ))}
      </select>
    </div>
  );
}

function GuideStyleSelector({ value, onChange }: { value: GuideStyle; onChange: (v: GuideStyle) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">Guide Style</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value as GuideStyle)}
        className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold"
      >
        {['gentle', 'direct', 'inquiry', 'devotional', 'silent'].map(id => (
          <option key={id} value={id}>
            {getGuideStyle(id as GuideStyle).emoji} {getGuideStyle(id as GuideStyle).label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TimeBudgetSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">Duration</label>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="1"
          max="120"
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-muted rounded-lg appearance-none accent-gold"
        />
        <span className="text-sm font-mono w-16 text-right">{value} min</span>
      </div>
    </div>
  );
}

function EnergyModeSelector({ value, onChange }: { value: 'low' | 'medium' | 'high' | 'adaptive'; onChange: (v: 'low' | 'medium' | 'high' | 'adaptive') => void }) {
  const labels = { low: 'Low ðŸŒ™', medium: 'Medium â˜€ï¸', high: 'High âš¡', adaptive: 'Adaptive ðŸ”„' };
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">Energy</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value as 'low' | 'medium' | 'high' | 'adaptive')}
        className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold"
      >
        {(Object.keys(labels) as Array<'low' | 'medium' | 'high' | 'adaptive'>).map(k => (
          <option key={k} value={k}>{labels[k]}</option>
        ))}
      </select>
    </div>
  );
}

function DomainWeightsEditor({ weights, onChange }: { weights: Record<string, number>; onChange: (v: Record<string, number>) => void }) {
  const domains = ['relationship', 'work', 'finance', 'health', 'creativity', 'spirituality'] as LifeDomainId[];
  
  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-muted-foreground">Life Domain Weights</label>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {domains.map(domain => {
          const d = getLifeDomain(domain);
          const value = weights[domain] ?? 0.5;
          return (
            <div key={domain} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
              <span className="text-lg">{d.emoji}</span>
              <span className="text-sm font-medium w-24">{d.label}</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={value}
                onChange={e => onChange({ ...weights, [domain]: Number(e.target.value) })}
                className="flex-1 h-1.5 bg-input rounded appearance-none accent-gold"
              />
              <span className="text-xs font-mono text-muted-foreground w-10">{Math.round(value * 100)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

