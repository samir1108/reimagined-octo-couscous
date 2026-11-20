import { useState } from 'react';
import { ExtendedSessionConfiguration, PracticeId, PracticeLevelTarget, PracticeLevelTargets, MicroTechniqueSelection, ResistanceRule, ResistanceTrigger, ResistanceAction, CrisisProtocol, MasterPersonas, ShadowTargets, ShadowTarget, SessionContinuityConfig, CyclicalAlignmentConfig, OutcomeTrackingConfig, SocialConfig, SessionMode } from '@/types/session-config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/design-system";
import { Button } from "@/design-system";
import { Label } from "@/design-system";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/design-system";
import { Input } from "@/design-system";
import { Textarea } from "@/design-system";
import { Switch } from "@/design-system";
import { Badge } from "@/design-system";
import { ScrollArea } from "@/design-system";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/design-system";
import { ChevronDown, ChevronRight, Target, Zap, Shield, Users, Calendar, Activity, Moon, Sun, Plus, Trash2, Settings2, Sparkles } from 'lucide-react';

interface AdvancedConfigTabProps {
  config: ExtendedSessionConfiguration;
  onChange: (updates: Partial<ExtendedSessionConfiguration>) => void;
}

const PRACTICES: { id: PracticeId; label: string; emoji: string }[] = [
  { id: 'observation', label: 'Observation', emoji: '👁' },
  { id: 'self-inquiry', label: 'Self-Inquiry', emoji: '❓' },
  { id: 'breath', label: 'Breath', emoji: '🌬' },
  { id: 'witnessing', label: 'Witnessing', emoji: '👁️' },
  { id: 'body', label: 'Body', emoji: '🧘' },
  { id: 'bhakti', label: 'Bhakti', emoji: '❤️' },
  { id: 'karma', label: 'Karma', emoji: '🤲' },
  { id: 'jnana', label: 'Jnana', emoji: '📖' },
  { id: 'raja', label: 'Raja', emoji: '👑' },
  { id: 'kriya', label: 'Kriya', emoji: '🔥' },
  { id: 'tantra', label: 'Tantra', emoji: '⚡' },
  { id: 'neuroscience', label: 'Neuroscience', emoji: '🧠' },
  { id: 'emotional-healing', label: 'Emotional Healing', emoji: '💧' },
  { id: 'loop-dissolution', label: 'Loop Dissolution', emoji: '🔄' },
  { id: 'relationship', label: 'Relationship', emoji: '💞' },
  { id: 'work-career', label: 'Work & Career', emoji: '💼' },
  { id: 'finance', label: 'Finance', emoji: '💰' },
  { id: 'health', label: 'Health', emoji: '🏥' },
];

const RESISTANCE_TRIGGERS: { value: ResistanceTrigger; label: string }[] = [
  { value: 'resistance_felt', label: 'Resistance Felt' },
  { value: 'bypassing_detected', label: 'Bypassing Detected' },
  { value: 'dark_night', label: 'Dark Night' },
  { value: 'low_energy', label: 'Low Energy' },
  { value: 'high_stress', label: 'High Stress' },
  { value: 'loop_activated', label: 'Loop Activated' },
  { value: 'quality_drop', label: 'Quality Drop' },
  { value: 'missed_sessions', label: 'Missed Sessions' },
];

const RESISTANCE_ACTIONS: { value: ResistanceAction; label: string }[] = [
  { value: 'insert_grounding', label: 'Insert Grounding' },
  { value: 'reduce_intensity', label: 'Reduce Intensity' },
  { value: 'split_session', label: 'Split Session' },
  { value: 'switch_focus', label: 'Switch Focus' },
  { value: 'add_compassion', label: 'Add Compassion' },
  { value: 'force_silence', label: 'Force Silence' },
  { value: 'shorten_duration', label: 'Shorten Duration' },
  { value: 'change_guide_style', label: 'Change Guide Style' },
];

const SHADOW_TARGETS = [
  { id: 'abandonment', label: 'Abandonment' },
  { id: 'control', label: 'Control' },
  { id: 'unworthiness', label: 'Unworthiness' },
  { id: 'perfectionism', label: 'Perfectionism' },
  { id: 'avoidance', label: 'Avoidance' },
  { id: 'people-pleasing', label: 'People-Pleasing' },
  { id: 'anger', label: 'Anger' },
  { id: 'grief', label: 'Grief' },
  { id: 'anxiety', label: 'Anxiety' },
];

const SOCIAL_MODES: { value: SessionMode; label: string; description: string }[] = [
  { value: 'solo', label: 'Solo', description: 'Individual practice' },
  { value: 'partner', label: 'Partner', description: 'Practice with a partner' },
  { value: 'group', label: 'Group', description: 'Group sessions' },
  { value: 'teacher', label: 'Teacher', description: 'Teacher-led sessions' },
];

interface SectionProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, description, icon: Icon, children, defaultOpen = false }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <Card className="mb-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              {Icon && <Icon className="w-5 h-5 text-gold" />}
              <div>
                <CardTitle className="text-base">{title}</CardTitle>
                {description && <CardDescription className="text-xs">{description}</CardDescription>}
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </CardHeader>
        </Card>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="mb-4">
          <CardContent className="pt-4">{children}</CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AdvancedConfigTab({ config, onChange }: AdvancedConfigTabProps) {
  const updatePracticeTarget = (practiceId: string, target: Partial<PracticeLevelTarget>) => {
    const existing = config.practiceLevelTargets[practiceId] || {
      practiceId: practiceId as PracticeId,
      targetLevel: 1,
      priority: 'medium' as const,
    };
    const updated = { ...existing, ...target };
    onChange({
      practiceLevelTargets: { ...config.practiceLevelTargets, [practiceId]: updated },
    });
  };

  const removePracticeTarget = (practiceId: string) => {
    const { [practiceId]: _, ...rest } = config.practiceLevelTargets;
    onChange({ practiceLevelTargets: rest });
  };

  const toggleShadowTarget = (id: string) => {
    const current = config.shadowTargets?.active || [];
    const exists = current.find(t => t.id === id);
    if (exists) {
      onChange({
        shadowTargets: {
          active: current.filter(t => t.id !== id),
          history: config.shadowTargets?.history || [],
        },
      });
    } else {
      onChange({
        shadowTargets: {
          active: [...current, { id, name: SHADOW_TARGETS.find(s => s.id === id)?.label || id, priority: 'medium' as const }],
          history: config.shadowTargets?.history || [],
        },
      });
    }
  };

  const addResistanceRule = () => {
    const newRule: ResistanceRule = {
      id: `rule_${Date.now()}`,
      trigger: 'resistance_felt',
      action: 'insert_grounding',
      priority: config.resistanceRules.length + 1,
      enabled: true,
    };
    onChange({ resistanceRules: [...config.resistanceRules, newRule] });
  };

  const updateResistanceRule = (id: string, updates: Partial<ResistanceRule>) => {
    onChange({
      resistanceRules: config.resistanceRules.map(r =>
        r.id === id ? { ...r, ...updates } : r
      ),
    });
  };

  const removeResistanceRule = (id: string) => {
    onChange({ resistanceRules: config.resistanceRules.filter(r => r.id !== id) });
  };

  const addCrisisProtocol = () => {
    const newProtocol: CrisisProtocol = {
      id: `crisis_${Date.now()}`,
      name: 'New Protocol',
      trigger: 'panic_attack',
      immediatePractice: 'breath',
      durationMin: 5,
      enabled: true,
    };
    onChange({ crisisProtocols: [...config.crisisProtocols, newProtocol] });
  };

  return (
    <ScrollArea className="h-full pr-2">
      <div className="space-y-2">
        <CollapsibleSection
          title="Practice-Level Targets"
          description="Set target levels for specific practices (e.g., observation L3, karma L4)"
          icon={Target}
          defaultOpen
        >
          <div className="space-y-4">
            <div className="grid gap-3">
              {PRACTICES.map(practice => {
                const target = config.practiceLevelTargets[practice.id];
                const isSelected = !!target;
                return (
                  <div
                    key={practice.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      isSelected ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-lg">{practice.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{practice.label}</div>
                      {isSelected && (
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1">
                            <Label className="text-xs text-muted-foreground">Level:</Label>
                            <Select
                              value={String(target?.targetLevel || 1)}
                              onValueChange={v => updatePracticeTarget(practice.id, { targetLevel: Number(v) })}
                            >
                              <SelectTrigger className="w-16 h-7">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 7].map(l => (
                                  <SelectItem key={l} value={String(l)}>{l}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-1">
                            <Label className="text-xs text-muted-foreground">Priority:</Label>
                            <Select
                              value={target?.priority || 'medium'}
                              onValueChange={v => updatePracticeTarget(practice.id, { priority: v as 'low' | 'medium' | 'high' | 'required' })}
                            >
                              <SelectTrigger className="w-24 h-7">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="required">Required</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Input
                            placeholder="Reason (optional)"
                            value={target?.reason || ''}
                            onChange={e => updatePracticeTarget(practice.id, { reason: e.target.value })}
                            className="h-7 text-xs flex-1"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive"
                            onClick={() => removePracticeTarget(practice.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {!isSelected && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updatePracticeTarget(practice.id, {})}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Target
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Shadow/Wound Targets"
          description="Active shadow work areas to address"
          icon={Moon}
          defaultOpen={false}
        >
          <div className="grid gap-2 sm:grid-cols-3">
            {SHADOW_TARGETS.map(shadow => {
              const isActive = config.shadowTargets?.active?.some(t => t.id === shadow.id);
              return (
                <Button
                  key={shadow.id}
                  variant={isActive ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={() => toggleShadowTarget(shadow.id)}
                >
                  {shadow.label}
                  {isActive && <span className="ml-auto text-xs opacity-70">Active</span>}
                </Button>
              );
            })}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Resistance Rules"
          description="Rules for handling resistance and difficulty during sessions"
          icon={Shield}
          defaultOpen={false}
        >
          <div className="space-y-3">
            {config.resistanceRules.map((rule, idx) => (
              <Card key={rule.id} className="p-3 bg-muted/30">
                <div className="flex items-start gap-3">
                  <div className="flex-1 grid gap-3 sm:grid-cols-3">
                    <div>
                      <Label className="text-xs">When</Label>
                      <Select
                        value={rule.trigger}
                        onValueChange={v => updateResistanceRule(rule.id, { trigger: v as ResistanceTrigger })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RESISTANCE_TRIGGERS.map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Then</Label>
                      <Select
                        value={rule.action}
                        onValueChange={v => updateResistanceRule(rule.id, { action: v as ResistanceAction })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RESISTANCE_ACTIONS.map(a => (
                            <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label className="text-xs">Priority</Label>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          value={rule.priority}
                          onChange={e => updateResistanceRule(rule.id, { priority: Number(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex items-center gap-2 pb-1">
                        <Label className="text-xs">Enabled</Label>
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={v => updateResistanceRule(rule.id, { enabled: v })}
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive mt-6"
                    onClick={() => removeResistanceRule(rule.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
            <Button variant="outline" onClick={addResistanceRule} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Resistance Rule
            </Button>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Crisis Protocols"
          description="Emergency response configurations"
          icon={Shield}
          defaultOpen={false}
        >
          <div className="space-y-3">
            {config.crisisProtocols.map((protocol, idx) => (
              <Card key={protocol.id} className="p-3 bg-muted/30">
                <div className="flex items-start gap-3">
                  <div className="flex-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input
                        value={protocol.name}
                        onChange={e => onChange({
                          crisisProtocols: config.crisisProtocols.map(p =>
                            p.id === protocol.id ? { ...p, name: e.target.value } : p
                          ),
                        })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Trigger</Label>
                      <Input
                        value={protocol.trigger}
                        onChange={e => onChange({
                          crisisProtocols: config.crisisProtocols.map(p =>
                            p.id === protocol.id ? { ...p, trigger: e.target.value } : p
                          ),
                        })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Immediate Practice</Label>
                      <Select
                        value={protocol.immediatePractice}
                        onValueChange={v => onChange({
                          crisisProtocols: config.crisisProtocols.map(p =>
                            p.id === protocol.id ? { ...p, immediatePractice: v as PracticeId } : p
                          ),
                        })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRACTICES.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Duration (min)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={30}
                        value={protocol.durationMin}
                        onChange={e => onChange({
                          crisisProtocols: config.crisisProtocols.map(p =>
                            p.id === protocol.id ? { ...p, durationMin: Number(e.target.value) } : p
                          ),
                        })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <Switch
                      checked={protocol.enabled}
                      onCheckedChange={v => onChange({
                        crisisProtocols: config.crisisProtocols.map(p =>
                          p.id === protocol.id ? { ...p, enabled: v } : p
                        ),
                      })}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => onChange({
                        crisisProtocols: config.crisisProtocols.filter(p => p.id !== protocol.id),
                      })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            <Button variant="outline" onClick={addCrisisProtocol} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Crisis Protocol
            </Button>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Social Mode"
          description="Practice alone, with partner, or in group"
          icon={Users}
          defaultOpen={false}
        >
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {SOCIAL_MODES.map(mode => (
                <Button
                  key={mode.value}
                  variant={config.socialConfig?.mode === mode.value ? 'default' : 'outline'}
                  className="h-auto p-3 text-left justify-start"
                  onClick={() => onChange({ socialConfig: { ...config.socialConfig, mode: mode.value } })}
                >
                  <div>
                    <div className="font-medium">{mode.label}</div>
                    <div className="text-xs text-muted-foreground">{mode.description}</div>
                  </div>
                </Button>
              ))}
            </div>
            {config.socialConfig?.mode === 'partner' && (
              <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                <div>
                  <Label className="text-xs">Practice Type</Label>
                  <Select
                    value={config.socialConfig?.partner?.practice || 'dual_bhakti'}
                    onValueChange={v => onChange({
                      socialConfig: {
                        ...config.socialConfig,
                        partner: { ...config.socialConfig?.partner, practice: v as 'dual_bhakti' | 'mirror_inquiry' | 'shared_breath' | 'witnessing_partner' | 'karma_service', structure: 'simultaneous', reflection: 'shared_journal' },
                      },
                    })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dual_bhakti">Dual Bhakti</SelectItem>
                      <SelectItem value="mirror_inquiry">Mirror Inquiry</SelectItem>
                      <SelectItem value="shared_breath">Shared Breath</SelectItem>
                      <SelectItem value="witnessing_partner">Witnessing Partner</SelectItem>
                      <SelectItem value="karma_service">Karma Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Session Continuity"
          description="Carry insights and threads between sessions"
          icon={Activity}
          defaultOpen={false}
        >
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-2">
                <Switch
                  checked={config.sessionContinuity?.carryThread ?? true}
                  onCheckedChange={v => onChange({
                    sessionContinuity: { ...config.sessionContinuity, carryThread: v },
                  })}
                />
                <span className="text-sm">Carry Thread</span>
              </label>
              <label className="flex items-center gap-2">
                <Switch
                  checked={config.sessionContinuity?.carryDepthMode ?? true}
                  onCheckedChange={v => onChange({
                    sessionContinuity: { ...config.sessionContinuity, carryDepthMode: v },
                  })}
                />
                <span className="text-sm">Carry Depth Mode</span>
              </label>
              <label className="flex items-center gap-2">
                <Switch
                  checked={config.sessionContinuity?.carryInsights ?? true}
                  onCheckedChange={v => onChange({
                    sessionContinuity: { ...config.sessionContinuity, carryInsights: v },
                  })}
                />
                <span className="text-sm">Carry Insights</span>
              </label>
              <label className="flex items-center gap-2">
                <Switch
                  checked={config.sessionContinuity?.carryClosingSentence ?? true}
                  onCheckedChange={v => onChange({
                    sessionContinuity: { ...config.sessionContinuity, carryClosingSentence: v },
                  })}
                />
                <span className="text-sm">Carry Closing Sentence</span>
              </label>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Max Thread Age (days)</Label>
              <Input
                type="number"
                min={1}
                max={365}
                value={config.sessionContinuity?.maxThreadAgeDays ?? 30}
                onChange={e => onChange({
                  sessionContinuity: { ...config.sessionContinuity, maxThreadAgeDays: Number(e.target.value) },
                })}
              />
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Cyclical Alignment"
          description="Seasonal and lunar phase adjustments"
          icon={Sun}
          defaultOpen={false}
        >
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-2">
                <Switch
                  checked={config.cyclicalAlignment?.autoDetectSeason ?? true}
                  onCheckedChange={v => onChange({
                    cyclicalAlignment: { ...config.cyclicalAlignment, autoDetectSeason: v },
                  })}
                />
                <span className="text-sm">Auto-Detect Season</span>
              </label>
              <label className="flex items-center gap-2">
                <Switch
                  checked={config.cyclicalAlignment?.autoDetectLunarPhase ?? false}
                  onCheckedChange={v => onChange({
                    cyclicalAlignment: { ...config.cyclicalAlignment, autoDetectLunarPhase: v },
                  })}
                />
                <span className="text-sm">Auto-Detect Lunar Phase</span>
              </label>
            </div>
            <div>
              <Label className="text-xs">Hemisphere</Label>
              <Select
                value={config.cyclicalAlignment?.hemisphere || 'northern'}
                onValueChange={v => onChange({
                  cyclicalAlignment: { ...config.cyclicalAlignment, hemisphere: v as 'northern' | 'southern' },
                })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="northern">Northern</SelectItem>
                  <SelectItem value="southern">Southern</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Outcome Tracking"
          description="Track success criteria and auto-adjust"
          icon={Target}
          defaultOpen={false}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <Switch
                  checked={config.outcomeTracking?.autoAdjustPlan ?? true}
                  onCheckedChange={v => onChange({
                    outcomeTracking: { ...config.outcomeTracking, autoAdjustPlan: v },
                  })}
                />
                <span className="text-sm">Auto-Adjust Plan</span>
              </label>
              <div className="flex items-center gap-2">
                <Label className="text-xs">Review Frequency (days)</Label>
                <Input
                  type="number"
                  min={1}
                  max={90}
                  value={config.outcomeTracking?.reviewFrequencyDays ?? 7}
                  onChange={e => onChange({
                    outcomeTracking: { ...config.outcomeTracking, reviewFrequencyDays: Number(e.target.value) },
                  })}
                  className="w-20"
                />
              </div>
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </ScrollArea>
  );
}