/**
 * AdvancedSessionConfiguration — Expert-level session tuning
 * ────────────────────────────────────────────────────────────
 * Covers: Micro-Techniques, Shadow Targets, Resistance Rules,
 * Crisis Protocols, Master Personas, Seasonal Alignment,
 * Social Modes, Outcome Tracking, Progression Contracts,
 * Weekly Patterns, External Signals, Session Continuity.
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, ChevronDown, ChevronUp, Check, X, Plus, Trash2,
  Shield, Heart, Brain, Zap, Moon, Sun, Target, Clock,
  BookOpen, Sparkles, Layers, Eye, EyeOff, Flame, Wind,
  Users, Calendar, TrendingUp, AlertTriangle, Globe,
  SlidersHorizontal, Link, Unlink, Play, Pause,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { consciousFromError } from "@/lib/consciousToast";
import {
  SessionConfiguration,
  ExtendedSessionConfiguration,
  DEFAULT_EXTENDED_CONFIG,
  mergeExtendedConfig,
  ShadowTarget,
  ShadowTargets,
  ResistanceRule,
  CrisisProtocol,
  MasterPersona,
  MasterPersonas,
  DailyScheduleEntry,
  WeeklyPattern,
  ProgressionContract,
  ProgressionMilestone,
  SuccessCriterion,
  OutcomeTrackingConfig,
  SocialConfig,
  SessionMode,
  PartnerConfig,
  GroupConfig,
  CyclicalAlignmentConfig,
  ExternalSignalsConfig,
  ExternalSignalRule,
  SessionContinuityConfig,
  MicroTechniqueSelection,
} from "@/types/session-config";
import { Button } from "@/design-system";
import { Slider } from "@/design-system";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/design-system";
import { Switch } from "@/design-system";
import { Label } from "@/design-system";
import { Input } from "@/design-system";
import { Textarea } from "@/design-system";
import { Card, CardContent, CardHeader, CardTitle } from "@/design-system";
import { Separator } from "@/design-system";
import { Badge } from "@/design-system";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/design-system";
import { SHADOW_TARGETS } from "@/data/shadowTargets";
import { MASTER_PERSONAS, DEFAULT_MASTER_PERSONAS } from "@/data/masterPersonas";
import { DEFAULT_RESISTANCE_RULES, DEFAULT_CRISIS_PROTOCOLS } from "@/data/resistanceRules";
import { SEASONAL_BIAS, LUNAR_PHASE_BIAS, getCurrentSeason, getLunarPhase } from "@/data/seasonalAlignment";
import { MICRO_TECHNIQUES, getMicroTechniquesForPractice } from "@/data/microTechniques";
import type { PracticeId } from "@/types/practices";

interface Props {
  config: ExtendedSessionConfiguration;
  onChange: (patch: Partial<ExtendedSessionConfiguration>) => void;
}

export default function AdvancedSessionConfiguration({ config, onChange }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (section: string) => {
    setExpanded(prev => prev === section ? null : section);
  };

  const sections = [
    { id: 'micro', label: 'Micro-Techniques', icon: Zap, count: Object.keys(config.microTechniques || {}).length },
    { id: 'shadow', label: 'Shadow/Wound Work', icon: Heart, count: config.shadowTargets?.active?.length || 0 },
    { id: 'resistance', label: 'Resistance Rules', icon: Shield, count: config.resistanceRules?.filter(r => r.enabled).length || 0 },
    { id: 'crisis', label: 'Crisis Protocols', icon: AlertTriangle, count: config.crisisProtocols?.filter(c => c.enabled).length || 0 },
    { id: 'masters', label: 'Master Personas', icon: BookOpen, count: Object.keys(config.masterPersonas || {}).length },
    { id: 'seasonal', label: 'Seasonal Alignment', icon: Globe, count: config.cyclicalAlignment?.autoDetectSeason ? 1 : 0 },
    { id: 'social', label: 'Social Modes', icon: Users, count: config.socialConfig?.mode !== 'solo' ? 1 : 0 },
    { id: 'outcome', label: 'Outcome Tracking', icon: TrendingUp, count: config.outcomeTracking?.criteria?.length || 0 },
    { id: 'progression', label: 'Progression Contracts', icon: Calendar, count: config.progressionContracts?.length || 0 },
    { id: 'weekly', label: 'Weekly Patterns', icon: Calendar, count: config.weeklyPattern?.schedule?.length || 0 },
    { id: 'signals', label: 'External Signals', icon: Link, count: config.externalSignals?.rules?.filter(r => r.enabled).length || 0 },
    { id: 'continuity', label: 'Session Continuity', icon: Play, count: config.sessionContinuity?.carryThread ? 1 : 0 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl glass-subtle flex items-center justify-center">
          <SlidersHorizontal className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-foreground">Advanced Configuration</h3>
          <p className="text-xs text-muted-foreground">Expert-level session tuning — 1000+ combinations</p>
        </div>
      </div>

      {sections.map((section) => (
        <Card key={section.id} className="glass-card">
          <CardHeader
            className="cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => toggle(section.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <section.icon className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">{section.label}</CardTitle>
                {section.count > 0 && (
                  <Badge variant="outline" className="text-[10px]">{section.count}</Badge>
                )}
              </div>
              {expanded === section.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </CardHeader>
          <AnimatePresence>
            {expanded === section.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <CardContent className="pt-0">
                  {section.id === 'micro' && <MicroTechniquesPanel config={config} onChange={onChange} />}
                  {section.id === 'shadow' && <ShadowTargetsPanel config={config} onChange={onChange} />}
                  {section.id === 'resistance' && <ResistanceRulesPanel config={config} onChange={onChange} />}
                  {section.id === 'crisis' && <CrisisProtocolsPanel config={config} onChange={onChange} />}
                  {section.id === 'masters' && <MasterPersonasPanel config={config} onChange={onChange} />}
                  {section.id === 'seasonal' && <SeasonalAlignmentPanel config={config} onChange={onChange} />}
                  {section.id === 'social' && <SocialModesPanel config={config} onChange={onChange} />}
                  {section.id === 'outcome' && <OutcomeTrackingPanel config={config} onChange={onChange} />}
                  {section.id === 'progression' && <ProgressionContractsPanel config={config} onChange={onChange} />}
                  {section.id === 'weekly' && <WeeklyPatternsPanel config={config} onChange={onChange} />}
                  {section.id === 'signals' && <ExternalSignalsPanel config={config} onChange={onChange} />}
                  {section.id === 'continuity' && <SessionContinuityPanel config={config} onChange={onChange} />}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      ))}
    </div>
  );
}

// ─── Micro-Techniques Panel ───

function MicroTechniquesPanel({ config, onChange }: Props) {
  const practices = ['observation', 'breath', 'self-inquiry', 'witnessing', 'body', 'bhakti', 'karma', 'jnana', 'raja', 'kriya', 'tantra', 'emotional-healing', 'loop-dissolution', 'relationship', 'work-career', 'finance', 'health'];
  const techniques = config.microTechniques || {};

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Select specific techniques within practices. These override generic practice selection.</p>
      {practices.map((practiceId) => {
        const practiceTechniques = getMicroTechniquesForPractice(practiceId as PracticeId);
        const selected = techniques[practiceId] || [];
        if (practiceTechniques.length === 0) return null;
        return (
          <div key={practiceId} className="space-y-1">
            <p className="text-sm font-medium capitalize">{practiceId.replace('-', ' ')}</p>
            <div className="flex flex-wrap gap-1.5">
              {practiceTechniques.map((tech) => (
                <TooltipProvider key={tech.id} keyDelay={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          const next = selected.includes(tech.id)
                            ? selected.filter(t => t !== tech.id)
                            : [...selected, tech.id];
                          onChange({ microTechniques: { ...techniques, [practiceId]: next } });
                        }}
                        className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                          selected.includes(tech.id)
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "glass-subtle text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {tech.label}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="font-medium">{tech.label}</p>
                      <p className="text-xs text-muted-foreground">{tech.description}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">L{tech.level} · {tech.durationSec}s · {tech.tags.join(', ')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Shadow Targets Panel ───

function ShadowTargetsPanel({ config, onChange }: Props) {
  const active = config.shadowTargets?.active || [];
  const activeIds = new Set(active.map(t => t.id));

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Target specific wounds/patterns. The engine will prioritize practices that dissolve them.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SHADOW_TARGETS.map((target) => {
          const isActive = activeIds.has(target.id);
          return (
            <TooltipProvider key={target.id} keyDelay={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      const next = isActive
                        ? active.filter(t => t.id !== target.id)
                        : [...active, target];
                      onChange({ shadowTargets: { active: next, history: config.shadowTargets?.history || [] } });
                    }}
                    className={`flex items-center gap-2 p-3 rounded-xl text-left transition-all ${
                      isActive
                        ? "bg-primary/10 border border-primary/30 text-primary"
                        : "glass-subtle hover:bg-muted/50"
                    }`}
                  >
                    <span className="text-lg">
                      {target.priority === 'core' ? '🔴' : target.priority === 'high' ? '🟠' : '🟡'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-medium text-sm truncate">{target.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{target.description}</p>
                    </div>
                    {isActive && <Check className="w-4 h-4 shrink-0" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="font-medium">{target.name}</p>
                  <p className="text-xs text-muted-foreground">{target.description}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">Loops: {target.linkedLoops.join(', ')} · Chakras: {target.linkedChakras.join(', ')}</p>
                  <p className="text-[10px] text-muted-foreground/70">Priority: {target.priority}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
}

// ─── Resistance Rules Panel ───

function ResistanceRulesPanel({ config, onChange }: Props) {
  const rules = config.resistanceRules || DEFAULT_RESISTANCE_RULES;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">If-then rules: when resistance is detected, the engine adapts automatically.</p>
      {rules.map((rule) => (
        <div key={rule.id} className="flex items-center gap-3 p-3 glass-subtle rounded-xl">
          <Switch
            checked={rule.enabled}
            onCheckedChange={(v) => {
              const next = rules.map(r => r.id === rule.id ? { ...r, enabled: v } : r);
              onChange({ resistanceRules: next });
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium capitalize">{rule.trigger.replace(/_/g, ' ')}</p>
            <p className="text-[10px] text-muted-foreground">→ {rule.action.replace(/_/g, ' ')}</p>
          </div>
          <Badge variant="outline" className="text-[10px]">P{rule.priority}</Badge>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange({ resistanceRules: DEFAULT_RESISTANCE_RULES })}
        className="w-full"
      >
        Reset to Defaults
      </Button>
    </div>
  );
}

// ─── Crisis Protocols Panel ───

function CrisisProtocolsPanel({ config, onChange }: Props) {
  const protocols = config.crisisProtocols || DEFAULT_CRISIS_PROTOCOLS;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Emergency protocols: when crisis is detected, immediate practice + follow-up.</p>
      {protocols.map((protocol) => (
        <div key={protocol.id} className="flex items-center gap-3 p-3 glass-subtle rounded-xl">
          <Switch
            checked={protocol.enabled}
            onCheckedChange={(v) => {
              const next = protocols.map(p => p.id === protocol.id ? { ...p, enabled: v } : p);
              onChange({ crisisProtocols: next });
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{protocol.name}</p>
            <p className="text-[10px] text-muted-foreground">
              {protocol.immediatePractice} ({protocol.durationMin}min) → {protocol.followupPractice || 'none'} ({protocol.followupDurationMin || 0}min)
            </p>
          </div>
          <Badge variant="outline" className="text-[10px]">{protocol.guideStyleOverride}</Badge>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange({ crisisProtocols: DEFAULT_CRISIS_PROTOCOLS })}
        className="w-full"
      >
        Reset to Defaults
      </Button>
    </div>
  );
}

// ─── Master Personas Panel ───

function MasterPersonasPanel({ config, onChange }: Props) {
  const personas = config.masterPersonas || DEFAULT_MASTER_PERSONAS;
  const practices = Object.keys(personas);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Choose which master guides each practice type.</p>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {practices.map((practiceId) => {
          const masterId = personas[practiceId];
          const master = MASTER_PERSONAS.find(m => m.id === masterId);
          const availableMasters = MASTER_PERSONAS.filter(m => m.practices.includes(practiceId as PracticeId));
          return (
            <div key={practiceId} className="flex items-center gap-2 p-2 glass-subtle rounded-xl">
              <span className="text-sm font-medium w-32 capitalize truncate">{practiceId.replace('-', ' ')}</span>
              <Select
                value={masterId || ""}
                onValueChange={(v) => {
                  onChange({ masterPersonas: { ...personas, [practiceId]: v } });
                }}
              >
                <SelectTrigger className="flex-1 h-8 text-xs"><SelectValue placeholder="Select master" /></SelectTrigger>
                <SelectContent>
                  {availableMasters.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} ({m.tradition})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {master && (
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {master.voiceProfile.tone}
                </Badge>
              )}
            </div>
          );
        })}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange({ masterPersonas: DEFAULT_MASTER_PERSONAS })}
        className="w-full"
      >
        Reset to Defaults
      </Button>
    </div>
  );
}

// ─── Seasonal Alignment Panel ───

function SeasonalAlignmentPanel({ config, onChange }: Props) {
  const cyclical = config.cyclicalAlignment || { seasonalBias: {}, lunarPhaseBias: {}, autoDetectSeason: true, autoDetectLunarPhase: false, hemisphere: 'northern' };
  const currentSeason = getCurrentSeason(cyclical.hemisphere);
  const currentLunar = getLunarPhase();

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Practice weights shift with seasons and lunar phases.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-3 glass-subtle rounded-xl">
          <div>
            <p className="text-sm font-medium">Auto-Detect Season</p>
            <p className="text-[10px] text-muted-foreground">Current: {currentSeason}</p>
          </div>
          <Switch
            checked={cyclical.autoDetectSeason}
            onCheckedChange={(v) => onChange({ cyclicalAlignment: { ...cyclical, autoDetectSeason: v } })}
          />
        </div>
        <div className="flex items-center justify-between p-3 glass-subtle rounded-xl">
          <div>
            <p className="text-sm font-medium">Auto-Detect Lunar Phase</p>
            <p className="text-[10px] text-muted-foreground">Current: {currentLunar}</p>
          </div>
          <Switch
            checked={cyclical.autoDetectLunarPhase}
            onCheckedChange={(v) => onChange({ cyclicalAlignment: { ...cyclical, autoDetectLunarPhase: v } })}
          />
        </div>
      </div>
      <div>
        <Label className="text-xs mb-1 block">Hemisphere</Label>
        <Select
          value={cyclical.hemisphere}
          onValueChange={(v) => onChange({ cyclicalAlignment: { ...cyclical, hemisphere: v as 'northern' | 'southern' } })}
        >
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="northern">Northern</SelectItem>
            <SelectItem value="southern">Southern</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange({ cyclicalAlignment: { ...cyclical, seasonalBias: SEASONAL_BIAS, lunarPhaseBias: LUNAR_PHASE_BIAS } })}
        >
          Load Default Biases
        </Button>
      </div>
    </div>
  );
}

// ─── Social Modes Panel ───

function SocialModesPanel({ config, onChange }: Props) {
  const social = config.socialConfig || { mode: 'solo' };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Practice alone, with a partner, in a group, or in teacher mode.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {(['solo', 'partner', 'group', 'teacher'] as SessionMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => onChange({ socialConfig: { ...social, mode } })}
            className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
              social.mode === mode
                ? "bg-primary/10 border border-primary/30 text-primary"
                : "glass-subtle hover:bg-muted/50"
            }`}
          >
            <span className="text-xl">
              {mode === 'solo' ? '🧘' : mode === 'partner' ? '💞' : mode === 'group' ? '👥' : '👨‍🏫'}
            </span>
            <span className="font-display font-medium text-sm capitalize">{mode}</span>
          </button>
        ))}
      </div>
      {social.mode === 'partner' && (
        <div className="space-y-2 pt-2 border-t border-border/30">
          <Label className="text-xs">Partner Practice</Label>
          <Select
            value={social.partner?.practice || 'dual_bhakti'}
            onValueChange={(v) => onChange({ socialConfig: { ...social, partner: { ...social.partner, practice: v as 'dual_bhakti' | 'mirror_inquiry' | 'shared_breath' | 'witnessing_partner' | 'karma_service' } } })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="dual_bhakti">Dual Bhakti</SelectItem>
              <SelectItem value="mirror_inquiry">Mirror Inquiry</SelectItem>
              <SelectItem value="shared_breath">Shared Breath</SelectItem>
              <SelectItem value="witnessing_partner">Witnessing Partner</SelectItem>
              <SelectItem value="karma_service">Karma Service</SelectItem>
            </SelectContent>
          </Select>
          <Label className="text-xs">Structure</Label>
          <Select
            value={social.partner?.structure || 'alternate_leading'}
            onValueChange={(v) => onChange({ socialConfig: { ...social, partner: { ...social.partner, structure: v as 'alternate_leading' | 'simultaneous' | 'facilitator_led' } } })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="alternate_leading">Alternate Leading</SelectItem>
              <SelectItem value="simultaneous">Simultaneous</SelectItem>
              <SelectItem value="facilitator_led">Facilitator Led</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      {social.mode === 'group' && (
        <div className="space-y-2 pt-2 border-t border-border/30">
          <Label className="text-xs">Group Size</Label>
          <Input
            type="number"
            value={social.group?.size || 5}
            onChange={(e) => onChange({ socialConfig: { ...social, group: { ...social.group, size: parseInt(e.target.value) || 5 } } })}
            min={2}
            max={50}
          />
          <Label className="text-xs">Group Practice</Label>
          <Select
            value={social.group?.practice || 'group_meditation'}
            onValueChange={(v) => onChange({ socialConfig: { ...social, group: { ...social.group, practice: v as 'karma_yoga' | 'group_meditation' | 'chanting' | 'inquiry_circle' | 'sharing_circle' } } })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="karma_yoga">Karma Yoga</SelectItem>
              <SelectItem value="group_meditation">Group Meditation</SelectItem>
              <SelectItem value="chanting">Chanting</SelectItem>
              <SelectItem value="inquiry_circle">Inquiry Circle</SelectItem>
              <SelectItem value="sharing_circle">Sharing Circle</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

// ─── Outcome Tracking Panel ───

function OutcomeTrackingPanel({ config, onChange }: Props) {
  const tracking = config.outcomeTracking || { criteria: [], reviewFrequencyDays: 7, autoAdjustPlan: true };
  const criteria = tracking.criteria || [];

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Set success criteria and track progress over time.</p>
      <div className="space-y-2">
        {criteria.map((c, i) => (
          <div key={c.id} className="flex items-center gap-2 p-2 glass-subtle rounded-xl">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{c.name}</p>
              <p className="text-[10px] text-muted-foreground">{c.metric} · Deadline: {c.deadline}</p>
              <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (c.currentValue / c.targetValue) * 100)}%` }}
                />
              </div>
            </div>
            <Badge variant="outline" className="text-[10px]">{c.status}</Badge>
            <button
              onClick={() => {
                const next = criteria.filter((_, idx) => idx !== i);
                onChange({ outcomeTracking: { ...tracking, criteria: next } });
              }}
              className="p-1 text-destructive hover:bg-destructive/10 rounded"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const newCriterion: SuccessCriterion = {
            id: `outcome-${Date.now()}`,
            name: 'New Goal',
            metric: 'quality>=0.7 for 5 sessions',
            targetValue: 0.7,
            currentValue: 0,
            deadline: new Date(Date.now() + 30 * 86400_000).toISOString().slice(0, 10),
            status: 'pending',
            practiceIds: [],
          };
          onChange({ outcomeTracking: { ...tracking, criteria: [...criteria, newCriterion] } });
        }}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-1" /> Add Success Criterion
      </Button>
      <div className="flex items-center justify-between p-3 glass-subtle rounded-xl">
        <div>
          <p className="text-sm font-medium">Auto-Adjust Plan</p>
          <p className="text-[10px] text-muted-foreground">Adjust progression if off-track</p>
        </div>
        <Switch
          checked={tracking.autoAdjustPlan}
          onCheckedChange={(v) => onChange({ outcomeTracking: { ...tracking, autoAdjustPlan: v } })}
        />
      </div>
    </div>
  );
}

// ─── Progression Contracts Panel ───

function ProgressionContractsPanel({ config, onChange }: Props) {
  const contracts = config.progressionContracts || [];

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Multi-milestone progression plans with auto-adjustment.</p>
      {contracts.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">No progression contracts yet.</p>
      )}
      {contracts.map((contract) => (
        <div key={contract.id} className="p-3 glass-subtle rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-display font-medium text-sm">{contract.name}</p>
            <Badge variant="outline" className="text-[10px]">{contract.status}</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">{contract.description}</p>
          <p className="text-[10px] text-muted-foreground">
            {contract.startDate.slice(0, 10)} → {contract.targetDate.slice(0, 10)} · {contract.milestones.length} milestones
          </p>
          <div className="flex gap-1">
            {contract.milestones.map((m) => (
              <div
                key={m.id}
                className={`w-2 h-2 rounded-full ${
                  m.status === 'completed' ? 'bg-green-500' :
                  m.status === 'active' ? 'bg-primary' :
                  m.status === 'missed' ? 'bg-destructive' : 'bg-muted'
                }`}
                title={m.name}
              />
            ))}
          </div>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const newContract: ProgressionContract = {
            id: `contract-${Date.now()}`,
            name: 'New Progression',
            description: 'Custom progression plan',
            startDate: new Date().toISOString(),
            targetDate: new Date(Date.now() + 60 * 86400_000).toISOString(),
            milestones: [],
            autoAdjust: true,
            status: 'draft',
          };
          onChange({ progressionContracts: [...contracts, newContract] });
        }}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-1" /> New Progression Contract
      </Button>
    </div>
  );
}

// ─── Weekly Patterns Panel ───

function WeeklyPatternsPanel({ config, onChange }: Props) {
  const pattern = config.weeklyPattern || { schedule: [], timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, active: false };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Set different focus for each day of the week.</p>
      <div className="flex items-center justify-between p-3 glass-subtle rounded-xl">
        <div>
          <p className="text-sm font-medium">Enable Weekly Pattern</p>
          <p className="text-[10px] text-muted-foreground">Override daily focus based on day</p>
        </div>
        <Switch
          checked={pattern.active}
          onCheckedChange={(v) => onChange({ weeklyPattern: { ...pattern, active: v } })}
        />
      </div>
      {pattern.active && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => {
            const entry = pattern.schedule.find(s => s.day === day);
            return (
              <div key={day} className="flex flex-wrap items-center gap-2 p-2 glass-subtle rounded-xl">
                <span className="text-sm font-medium w-24 capitalize">{day}</span>
                <Select
                  value={entry?.focusType || 'focus'}
                  onValueChange={(v) => {
                    const next = pattern.schedule.filter(s => s.day !== day);
                    next.push({ day, focusType: v as string, timeOfDay: entry?.timeOfDay || '07:00', durationMin: entry?.durationMin || 20 });
                    onChange({ weeklyPattern: { ...pattern, schedule: next } });
                  }}
                >
                  <SelectTrigger className="flex-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['focus', 'attention', 'self_inquiry', 'raja_yoga', 'jnana', 'bhakti', 'karma', 'tantra', 'healing', 'sleep', 'energy', 'relationship', 'work', 'creativity'].map(f => (
                      <SelectItem key={f} value={f}>{f.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="time"
                  value={entry?.timeOfDay || '07:00'}
                  onChange={(e) => {
                    const next = pattern.schedule.filter(s => s.day !== day);
                    next.push({ day, focusType: entry?.focusType || 'focus', timeOfDay: e.target.value, durationMin: entry?.durationMin || 20 });
                    onChange({ weeklyPattern: { ...pattern, schedule: next } });
                  }}
                  className="w-24 h-8 text-xs"
                />
                <Input
                  type="number"
                  value={entry?.durationMin || 20}
                  onChange={(e) => {
                    const next = pattern.schedule.filter(s => s.day !== day);
                    next.push({ day, focusType: entry?.focusType || 'focus', timeOfDay: entry?.timeOfDay || '07:00', durationMin: parseInt(e.target.value) || 20 });
                    onChange({ weeklyPattern: { ...pattern, schedule: next } });
                  }}
                  className="w-16 h-8 text-xs"
                  min={1}
                  max={720}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── External Signals Panel ───

function ExternalSignalsPanel({ config, onChange }: Props) {
  const signals = config.externalSignals || { rules: [], providers: {} };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Connect wearables, calendar, location, weather to auto-adjust sessions.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {[
          { key: 'wearable', label: 'Wearable (HRV)', icon: '⌚' },
          { key: 'calendar', label: 'Calendar', icon: '📅' },
          { key: 'location', label: 'Location', icon: '📍' },
          { key: 'weather', label: 'Weather', icon: '🌤️' },
        ].map((provider) => (
          <div key={provider.key} className="flex items-center gap-2 p-3 glass-subtle rounded-xl">
            <span className="text-lg">{provider.icon}</span>
            <span className="text-sm font-medium flex-1">{provider.label}</span>
            <Switch
              checked={(signals.providers as Record<string, { connected?: boolean; enabled?: boolean }> | undefined)?.[provider.key]?.connected || (signals.providers as Record<string, { connected?: boolean; enabled?: boolean }> | undefined)?.[provider.key]?.enabled || false}
              onCheckedChange={(v) => {
                const providers = { ...signals.providers };
                if (provider.key === 'wearable') {
                  (providers as Record<string, unknown>).wearable = { type: 'oura', connected: v };
                } else if (provider.key === 'calendar') {
                  (providers as Record<string, unknown>).calendar = { type: 'google', connected: v };
                } else if (provider.key === 'location') {
                  (providers as Record<string, unknown>).location = { enabled: v };
                } else if (provider.key === 'weather') {
                  (providers as Record<string, unknown>).weather = { enabled: v };
                }
                onChange({ externalSignals: { ...signals, providers } });
              }}
            />
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground/70">
        Rules: {signals.rules.filter(r => r.enabled).length} active
      </p>
    </div>
  );
}

// ─── Session Continuity Panel ───

function SessionContinuityPanel({ config, onChange }: Props) {
  const continuity = config.sessionContinuity || { carryThread: true, carryDepthMode: true, carryInsights: true, carryClosingSentence: true, maxThreadAgeDays: 30 };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Control how sessions connect and build on each other.</p>
      {[
        { key: 'carryThread', label: 'Carry Living Thread', desc: 'Continue the open inquiry from last session' },
        { key: 'carryDepthMode', label: 'Carry Depth Mode', desc: 'Maintain investigation depth across sessions' },
        { key: 'carryInsights', label: 'Carry Insights', desc: 'Bring confirmed observations forward' },
        { key: 'carryClosingSentence', label: 'Carry Closing Sentence', desc: "Future-self whisper from previous session" },
      ].map((item) => (
        <div key={item.key} className="flex items-center justify-between p-3 glass-subtle rounded-xl">
          <div>
            <p className="text-sm font-medium">{item.label}</p>
            <p className="text-[10px] text-muted-foreground">{item.desc}</p>
          </div>
          <Switch
            checked={!!(continuity as Record<string, unknown>)[item.key]}
            onCheckedChange={(v) => onChange({ sessionContinuity: { ...continuity, [item.key]: v } })}
          />
        </div>
      ))}
      <div>
        <Label className="text-xs mb-1 block">Max Thread Age (days)</Label>
        <Slider
          value={[continuity.maxThreadAgeDays]}
          onValueChange={([v]) => onChange({ sessionContinuity: { ...continuity, maxThreadAgeDays: v } })}
          min={1}
          max={90}
          step={1}
          className="w-full"
        />
        <p className="text-[10px] text-muted-foreground mt-1">{continuity.maxThreadAgeDays} days</p>
      </div>
    </div>
  );
}
