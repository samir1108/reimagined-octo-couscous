/**
 * SessionConfigurationSettings
 * ────────────────────────────────────
 * Settings panel for user-tunable session configuration.
 * Progressive disclosure: Simple → Intermediate → Advanced → Expert
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Clock, Heart, Brain, Zap, Moon, Sun,
  SlidersHorizontal, Layers, Settings, Save, RotateCcw,
  ChevronDown, ChevronUp, Check, X, Plus, Trash2,
  BookOpen, Sparkles, Shield, Eye, EyeOff
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { consciousFromError } from "@/lib/consciousToast";
import {
  SessionConfiguration,
  SessionPreset,
  DEFAULT_SESSION_CONFIG,
  SYSTEM_PRESETS,
  FOCUS_TYPES,
  GUIDE_STYLES,
  LIFE_DOMAINS,
  FocusType,
  GuideStyle,
  LifeDomainId,
  PracticeId,
  PracticeLevelTarget,
  PracticeLevelTargets,
  validateSessionConfig,
  mergeSessionConfig,
  getFocusType,
  getGuideStyle,
  getLifeDomain,
} from "@/types/session-config";
import { Button } from "@/design-system";
import { Slider } from "@/design-system";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/design-system";
import { Switch } from "@/design-system";
import { Label } from "@/design-system";
import { Input } from "@/design-system";
import { Textarea } from "@/design-system";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/design-system";
import { Card, CardContent, CardHeader, CardTitle } from "@/design-system";
import { Separator } from "@/design-system";
import { Badge } from "@/design-system";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/design-system";

const PRESET_STORAGE_KEY = "session_presets_v1";

function useSessionConfig() {
  return useQuery({
    queryKey: ["session-config"],
    queryFn: async (): Promise<SessionConfiguration> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return DEFAULT_SESSION_CONFIG;

      const { data, error } = await supabase
        .from("user_consciousness_profile")
        .select("session_config")
        .eq("user_id", user.id)
        .single();

      if (error || !data?.session_config) return DEFAULT_SESSION_CONFIG;
      return { ...DEFAULT_SESSION_CONFIG, ...data.session_config } as SessionConfiguration;
    },
  });
}

function usePresets() {
  const queryClient = useQueryClient();

  const { data: presets } = useQuery({
    queryKey: ["session-presets"],
    queryFn: async (): Promise<SessionPreset[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [...SYSTEM_PRESETS];

      const { data } = await supabase
        .from("user_session_presets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      return [...SYSTEM_PRESETS, ...(data || [])];
    },
  });

  const savePresetMutation = useMutation({
    mutationFn: async (preset: Omit<SessionPreset, "id" | "created_at" | "updated_at" | "use_count">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_session_presets")
        .insert({ ...preset, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-presets"] });
      toast({ title: "Preset saved" });
    },
    onError: (e) => consciousFromError(e, "actionMissed"),
  });

  const updatePresetMutation = useMutation({
    mutationFn: async (preset: SessionPreset) => {
      const { error } = await supabase
        .from("user_session_presets")
        .update({ ...preset, updated_at: new Date().toISOString() })
        .eq("id", preset.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-presets"] });
      toast({ title: "Preset updated" });
    },
    onError: (e) => consciousFromError(e, "actionMissed"),
  });

  const deletePresetMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("user_session_presets")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-presets"] });
      toast({ title: "Preset deleted" });
    },
    onError: (e) => consciousFromError(e, "actionMissed"),
  });

  const usePresetMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_session_presets")
        .update({ use_count: supabase.rpc("increment", { row_id: id }), last_used_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-presets"] });
    },
  });

  return { presets: presets || [], savePresetMutation, updatePresetMutation, deletePresetMutation, usePresetMutation };
}

function useSaveConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: SessionConfiguration) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_consciousness_profile")
        .update({ session_config: config as any })
        .eq("user_id", user.id);

      if (error) throw error;
      return config;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-config"] });
      toast({ title: "Session settings saved", description: "Your next session will use these preferences." });
    },
    onError: (e) => consciousFromError(e, "actionMissed"),
  });
}

export default function SessionConfigurationSettings() {
  const { data: config, isLoading } = useSessionConfig();
  const { presets, savePresetMutation, updatePresetMutation, deletePresetMutation, usePresetMutation } = usePresets();
  const saveConfigMutation = useSaveConfig();

  const [localConfig, setLocalConfig] = useState<SessionConfiguration>(DEFAULT_SESSION_CONFIG);
  const [activeTab, setActiveTab] = useState<"simple" | "intermediate" | "advanced" | "expert">("simple");
  const [saving, setSaving] = useState(false);
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [newPresetDesc, setNewPresetDesc] = useState("");
  const [editingPreset, setEditingPreset] = useState<SessionPreset | null>(null);

  useEffect(() => {
    if (config) setLocalConfig(config);
  }, [config]);

  const updateConfig = useCallback((patch: Partial<SessionConfiguration>) => {
    setLocalConfig(prev => mergeSessionConfig(prev, patch));
  }, []);

  const handleSave = async () => {
    const validation = validateSessionConfig(localConfig);
    if (!validation.valid) {
      toast({ title: "Invalid configuration", description: validation.errors.join(", "), variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await saveConfigMutation.mutateAsync(localConfig);
    } finally {
      setSaving(false);
    }
  };

  const handleUsePreset = async (preset: SessionPreset) => {
    const validation = validateSessionConfig(preset.config);
    if (!validation.valid) {
      toast({ title: "Invalid preset", description: validation.errors.join(", "), variant: "destructive" });
      return;
    }
    setLocalConfig(preset.config);
    if (!preset.is_system) {
      await usePresetMutation.mutateAsync(preset.id);
    }
    toast({ title: `Applied: ${preset.name}` });
  };

  const handleSaveAsPreset = async () => {
    if (!newPresetName.trim()) return;
    const validation = validateSessionConfig(localConfig);
    if (!validation.valid) {
      toast({ title: "Invalid configuration", description: validation.errors.join(", "), variant: "destructive" });
      return;
    }

    if (editingPreset) {
      await updatePresetMutation.mutateAsync({ ...editingPreset, name: newPresetName, description: newPresetDesc, config: localConfig });
    } else {
      await savePresetMutation.mutateAsync({ name: newPresetName, description: newPresetDesc, config: localConfig, is_system: false });
    }
    setShowPresetDialog(false);
    setNewPresetName("");
    setNewPresetDesc("");
    setEditingPreset(null);
  };

  const handleEditPreset = (preset: SessionPreset) => {
    setEditingPreset(preset);
    setNewPresetName(preset.name);
    setNewPresetDesc(preset.description || "");
    setShowPresetDialog(true);
  };

  const handleDeletePreset = async (id: string) => {
    if (confirm("Delete this preset?")) {
      await deletePresetMutation.mutateAsync(id);
    }
  };

  const focusType = getFocusType(localConfig.focusType);
  const guideStyle = getGuideStyle(localConfig.guideStyle);

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6 space-y-4 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="h-4 bg-muted rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl glass-subtle flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Session Configuration</h3>
            <p className="text-xs text-muted-foreground">Tune every aspect of your session — 1000+ combinations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setShowPresetDialog(true); setEditingPreset(null); setNewPresetName(""); setNewPresetDesc(""); }}>
            <Plus className="w-4 h-4 mr-1" /> Save as Preset
          </Button>
          <Button onClick={handleSave} disabled={saving} className="rounded-xl">
            <Save className="w-4 h-4 mr-1" /> {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </motion.div>

      {/* Current Focus Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{focusType.emoji}</span>
          <div className="flex-1">
            <p className="font-display font-medium text-foreground">{focusType.label}</p>
            <p className="text-xs text-muted-foreground">{focusType.description}</p>
          </div>
          <div className="text-right">
            <p className="font-display font-bold text-foreground">{localConfig.timeBudgetMin} min</p>
            <p className="text-xs text-muted-foreground">{guideStyle.label} guide</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="gap-1">
            <Zap className="w-3 h-3" /> {localConfig.energyMode}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Moon className="w-3 h-3" /> {localConfig.preferredGate}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Layers className="w-3 h-3" /> {localConfig.structure}
          </Badge>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card rounded-2xl p-2"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 bg-transparent p-1">
            <TabsTrigger value="simple" className="text-xs">Simple</TabsTrigger>
            <TabsTrigger value="intermediate" className="text-xs">Intermediate</TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs">Advanced</TabsTrigger>
            <TabsTrigger value="expert" className="text-xs">Expert</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* SIMPLE TAB */}
          {activeTab === "simple" && (
            <div className="space-y-6">
              <SessionFocusPicker config={localConfig} onChange={updateConfig} />
              <SessionTimePicker config={localConfig} onChange={updateConfig} />
              <SessionGatePicker config={localConfig} onChange={updateConfig} />
              <SessionGuideStylePicker config={localConfig} onChange={updateConfig} />
            </div>
          )}

          {/* INTERMEDIATE TAB */}
          {activeTab === "intermediate" && (
            <div className="space-y-6">
              <SessionDomainWeights config={localConfig} onChange={updateConfig} />
              <SessionEnergyPicker config={localConfig} onChange={updateConfig} />
              <SessionStructurePicker config={localConfig} onChange={updateConfig} />
              <SessionAccessibility config={localConfig} onChange={updateConfig} />
            </div>
          )}

          {/* ADVANCED TAB */}
          {activeTab === "advanced" && (
            <div className="space-y-6">
              <SessionTargeting config={localConfig} onChange={updateConfig} />
              <SessionContentFilters config={localConfig} onChange={updateConfig} />
              <SessionArchetypeWeights config={localConfig} onChange={updateConfig} />
              <SessionPracticeTargets config={localConfig} onChange={updateConfig} />
              <SessionIngredientPreferences config={localConfig} onChange={updateConfig} />
            </div>
          )}

          {/* EXPERT TAB */}
          {activeTab === "expert" && (
            <div className="space-y-6">
              <SessionPresetsManager presets={presets} onUse={handleUsePreset} onEdit={handleEditPreset} onDelete={handleDeletePreset} />
              <SessionPhysiological config={localConfig} onChange={updateConfig} />
              <SessionDebugInfo config={localConfig} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Preset Dialog */}
      <AnimatePresence>
        {showPresetDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => { setShowPresetDialog(false); setEditingPreset(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-display font-semibold">{editingPreset ? "Edit Preset" : "Save as Preset"}</h4>
                <button onClick={() => { setShowPresetDialog(false); setEditingPreset(null); }} className="p-1 rounded-full hover:bg-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs mb-1 block">Name</Label>
                  <Input value={newPresetName} onChange={(e) => setNewPresetName(e.target.value)} placeholder="My Morning Focus" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Description (optional)</Label>
                  <Textarea value={newPresetDesc} onChange={(e) => setNewPresetDesc(e.target.value)} placeholder="Sharp 20-min concentration to start the day" rows={2} />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" onClick={() => { setShowPresetDialog(false); setEditingPreset(null); }}>Cancel</Button>
                  <Button onClick={handleSaveAsPreset} disabled={savePresetMutation.isPending || updatePresetMutation.isPending}>
                    {editingPreset ? "Update" : "Save"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-Components ───

function SessionFocusPicker({ config, onChange }: { config: SessionConfiguration; onChange: (patch: Partial<SessionConfiguration>) => void }) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="w-4 h-4" /> Practice Focus
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">What kind of practice do you want right now?</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {FOCUS_TYPES.map((focus) => (
            <TooltipProvider key={focus.id} keyDelay={500}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={() => onChange({ focusType: focus.id, customFocusName: undefined, customFocusDescription: undefined })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl text-left transition-all ${
                      config.focusType === focus.id
                        ? "bg-primary/10 border border-primary/30 text-primary"
                        : "glass-subtle hover:bg-muted/50"
                    }`}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="text-2xl">{focus.emoji}</span>
                    <span className="font-display font-medium text-sm">{focus.label}</span>
                    <span className="text-[10px] text-muted-foreground">{focus.defaultDuration[0]}–{focus.defaultDuration[1]} min</span>
                    {config.focusType === focus.id && <Check className="w-4 h-4" />}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="top" align="center" className="max-w-xs">
                  <p className="font-medium">{focus.label}</p>
                  <p className="text-xs text-muted-foreground">{focus.description}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">Best for: {focus.suitableGates.join(", ")} gate</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        {config.focusType === "custom" && (
          <div className="space-y-2 pt-2 border-t border-border/30">
            <Input
              placeholder="Custom focus name"
              value={config.customFocusName || ""}
              onChange={(e) => onChange({ customFocusName: e.target.value })}
            />
            <Textarea
              placeholder="Describe your custom focus..."
              value={config.customFocusDescription || ""}
              onChange={(e) => onChange({ customFocusDescription: e.target.value })}
              rows={2}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SessionTimePicker({ config, onChange }: { config: SessionConfiguration; onChange: (patch: Partial<SessionConfiguration>) => void }) {
  const focus = getFocusType(config.focusType);
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="w-4 h-4" /> Duration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display font-medium">{config.timeBudgetMin} minutes</p>
            <p className="text-xs text-muted-foreground">Recommended: {focus.defaultDuration[0]}–{focus.defaultDuration[1]} min for {focus.label}</p>
          </div>
        </div>
        <Slider
          value={[config.timeBudgetMin]}
          onValueChange={([v]) => onChange({ timeBudgetMin: v })}
          min={1}
          max={720}
          step={1}
          className="w-full"
        />
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 5, 10, 15, 20, 30, 45, 60, 90, 120].map((m) => (
            <Button
              key={m}
              variant={config.timeBudgetMin === m ? "default" : "outline"}
              size="sm"
              onClick={() => onChange({ timeBudgetMin: m })}
              className="rounded-full"
            >
              {m} min
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SessionGatePicker({ config, onChange }: { config: SessionConfiguration; onChange: (patch: Partial<SessionConfiguration>) => void }) {
  const gates: { id: "morning" | "midday" | "evening" | "night" | "flexible"; label: string; emoji: string; description: string }[] = [
    { id: "morning", label: "Morning", emoji: "🌅", description: "Wake up, set intention" },
    { id: "midday", label: "Midday", emoji: "☀️", description: "Reset, recenter" },
    { id: "evening", label: "Evening", emoji: "🌆", description: "Process the day" },
    { id: "night", label: "Night", emoji: "🌙", description: "Release, prepare for sleep" },
    { id: "flexible", label: "Flexible", emoji: "✨", description: "Anytime, adapts to now" },
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Moon className="w-4 h-4" /> Preferred Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {gates.map((gate) => (
            <motion.button
              key={gate.id}
              onClick={() => onChange({ preferredGate: gate.id })}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                config.preferredGate === gate.id
                  ? "bg-primary/10 border border-primary/30 text-primary"
                  : "glass-subtle hover:bg-muted/50"
              }`}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-xl">{gate.emoji}</span>
              <span className="font-display font-medium text-sm">{gate.label}</span>
              <span className="text-[10px] text-muted-foreground">{gate.description}</span>
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SessionGuideStylePicker({ config, onChange }: { config: SessionConfiguration; onChange: (patch: Partial<SessionConfiguration>) => void }) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="w-4 h-4" /> Guide Style
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {GUIDE_STYLES.map((style) => (
            <TooltipProvider key={style.id} keyDelay={500}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={() => onChange({ guideStyle: style.id })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                      config.guideStyle === style.id
                        ? "bg-primary/10 border border-primary/30 text-primary"
                        : "glass-subtle hover:bg-muted/50"
                    }`}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="text-2xl">{style.emoji}</span>
                    <span className="font-display font-medium text-sm">{style.label}</span>
                    <span className="text-[10px] text-muted-foreground">{style.description}</span>
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="top">{style.description}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SessionDomainWeights({ config, onChange }: { config: SessionConfiguration; onChange: (patch: Partial<SessionConfiguration>) => void }) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Heart className="w-4 h-4" /> Life Domain Priority
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">Weight each domain (0–1). Higher = more practices targeting that area.</p>
        <div className="space-y-3">
          {LIFE_DOMAINS.map((domain) => (
            <div key={domain.id} className="flex items-center gap-3">
              <TooltipProvider keyDelay={500}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-2 w-36 shrink-0">
                      <span className="text-lg">{domain.emoji}</span>
                      <span className="text-sm font-body truncate">{domain.label}</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="right">{domain.description} — targets {domain.relatedDimension} dimension</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Slider
                value={[config.domainWeights[domain.id] ?? 0.5]}
                onValueChange={([v]) => onChange({ domainWeights: { ...config.domainWeights, [domain.id]: Math.round(v * 100) / 100 } })}
                min={0}
                max={1}
                step={0.1}
                className="flex-1"
              />
              <span className="text-sm font-mono text-muted-foreground w-10 text-right">
                {(config.domainWeights[domain.id] ?? 0.5).toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SessionEnergyPicker({ config, onChange }: { config: SessionConfiguration; onChange: (patch: Partial<SessionConfiguration>) => void }) {
  const energies: { id: "low" | "medium" | "high" | "adaptive"; label: string; emoji: string; description: string }[] = [
    { id: "low", label: "Low", emoji: "🌿", description: "Gentle, restorative" },
    { id: "medium", label: "Medium", emoji: "⚖️", description: "Balanced, steady" },
    { id: "high", label: "High", emoji: "🔥", description: "Intense, activating" },
    { id: "adaptive", label: "Adaptive", emoji: "🤖", description: "AI detects your energy" },
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="w-4 h-4" /> Energy Level
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {energies.map((e) => (
            <motion.button
              key={e.id}
              onClick={() => onChange({ energyMode: e.id })}
              className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                config.energyMode === e.id
                  ? "bg-primary/10 border border-primary/30 text-primary"
                  : "glass-subtle hover:bg-muted/50"
              }`}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-xl">{e.emoji}</span>
              <div className="text-left">
                <p className="font-display font-medium text-sm">{e.label}</p>
                <p className="text-[10px] text-muted-foreground">{e.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SessionStructurePicker({ config, onChange }: { config: SessionConfiguration; onChange: (patch: Partial<SessionConfiguration>) => void }) {
  const structures: { id: "guided" | "self_directed" | "hybrid"; label: string; emoji: string; description: string }[] = [
    { id: "guided", label: "Guided", emoji: "🧭", description: "Full AI guidance, step-by-step" },
    { id: "hybrid", label: "Hybrid", emoji: "🔀", description: "AI suggests, you choose" },
    { id: "self_directed", label: "Self-Directed", emoji: "🧘", description: "You lead, app supports" },
  ];

  const reflections: { id: "micro" | "standard" | "deep"; label: string; emoji: string; description: string }[] = [
    { id: "micro", label: "Micro", emoji: "✨", description: "1–2 min, one prompt" },
    { id: "standard", label: "Standard", emoji: "📝", description: "3–5 min, journaling" },
    { id: "deep", label: "Deep", emoji: "🔍", description: "10+ min, inquiry spiral" },
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Layers className="w-4 h-4" /> Session Structure
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-2">Guidance Level</p>
          <div className="grid grid-cols-3 gap-2">
            {structures.map((s) => (
              <motion.button
                key={s.id}
                onClick={() => onChange({ structure: s.id })}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                  config.structure === s.id
                    ? "bg-primary/10 border border-primary/30 text-primary"
                    : "glass-subtle hover:bg-muted/50"
                }`}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-xl">{s.emoji}</span>
                <span className="font-display font-medium text-sm">{s.label}</span>
                <span className="text-[10px] text-muted-foreground">{s.description}</span>
              </motion.button>
            ))}
          </div>
        </div>
        <Separator />
        <div>
          <p className="text-xs text-muted-foreground mb-2">Reflection Depth</p>
          <div className="grid grid-cols-3 gap-2">
            {reflections.map((r) => (
              <motion.button
                key={r.id}
                onClick={() => onChange({ reflectionDepth: r.id })}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                  config.reflectionDepth === r.id
                    ? "bg-primary/10 border border-primary/30 text-primary"
                    : "glass-subtle hover:bg-muted/50"
                }`}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-xl">{r.emoji}</span>
                <span className="font-display font-medium text-sm">{r.label}</span>
                <span className="text-[10px] text-muted-foreground">{r.description}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SessionAccessibility({ config, onChange }: { config: SessionConfiguration; onChange: (patch: Partial<SessionConfiguration>) => void }) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="w-4 h-4" /> Accessibility
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Voice Guidance</p>
            <p className="text-xs text-muted-foreground">TTS for practice instructions</p>
          </div>
          <Switch checked={config.voiceEnabled} onCheckedChange={(v) => onChange({ voiceEnabled: v })} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Reduced Motion</p>
            <p className="text-xs text-muted-foreground">Minimize animations</p>
          </div>
          <Switch checked={config.reducedMotion} onCheckedChange={(v) => onChange({ reducedMotion: v })} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Screen Reader Optimized</p>
            <p className="text-xs text-muted-foreground">Enhanced ARIA labels</p>
          </div>
          <Switch checked={config.screenReaderOptimized} onCheckedChange={(v) => onChange({ screenReaderOptimized: v })} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Difficulty</p>
            <p className="text-xs text-muted-foreground">Adjust practice intensity</p>
          </div>
          <Select value={config.difficultyOverride} onValueChange={(v) => onChange({ difficultyOverride: v as any })} className="w-40">
            <SelectTrigger className="w-full"><SelectValue placeholder="Standard" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="gentler">Gentler</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="harder">Harder</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

function SessionTargeting({ config, onChange }: { config: SessionConfiguration; onChange: (patch: Partial<SessionConfiguration>) => void }) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="w-4 h-4" /> Consciousness Targeting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">Optional: guide the engine toward specific levels (respects calibration caps)</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs mb-1 block">Target V-Level</Label>
            <Slider
              value={[config.targetVLevel ?? 0]}
              onValueChange={([v]) => onChange({ targetVLevel: v > 0 ? v : undefined })}
              min={0}
              max={10}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {config.targetVLevel ? `Target: ${config.targetVLevel.toFixed(1)}` : "Auto (engine decides)"}
            </p>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Target Band</Label>
            <Select value={config.targetBand?.toString() || ""} onValueChange={(v) => onChange({ targetBand: v ? parseInt(v) : undefined })} className="w-full">
              <SelectTrigger><SelectValue placeholder="Auto" /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 11 }, (_, i) => i).map((b) => (
                  <SelectItem key={b} value={b.toString()}>Band {b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Target Micro-Level</Label>
            <Select value={config.targetMicroLevel || ""} onValueChange={(v) => onChange({ targetMicroLevel: v as any })} className="w-full">
              <SelectTrigger><SelectValue placeholder="Auto" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="entering">Entering (0.0–0.3)</SelectItem>
                <SelectItem value="deepening">Deepening (0.3–0.7)</SelectItem>
                <SelectItem value="mastery">Mastery (0.7+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Speed Profile</Label>
            <Select value={config.speedProfile} onValueChange={(v) => onChange({ speedProfile: v as any })} className="w-full">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="adaptive">Adaptive (AI detects)</SelectItem>
                <SelectItem value="fast">Fast Tracker (~15%)</SelectItem>
                <SelectItem value="steady">Steady Walker (~65%)</SelectItem>
                <SelectItem value="deep">Deep Digger (~20%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SessionContentFilters({ config, onChange }: { config: SessionConfiguration; onChange: (patch: Partial<SessionConfiguration>) => void }) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Eye className="w-4 h-4" /> Content Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs mb-1 block">Include Tags</Label>
            <Input
              placeholder="breathwork, mantra, journaling..."
              value={config.includedTags.join(", ")}
              onChange={(e) => onChange({ includedTags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
            />
            <p className="text-[10px] text-muted-foreground mt-1">Only practices with these tags</p>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Exclude Tags</Label>
            <Input
              placeholder="movement, chanting, intense..."
              value={config.excludedTags.join(", ")}
              onChange={(e) => onChange({ excludedTags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
            />
            <p className="text-[10px] text-muted-foreground mt-1">Never include these tags</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs mb-1 block">Include Practices (IDs)</Label>
            <Input
              placeholder="observation, breath, witnessing..."
              value={config.includedPracticeIds.join(", ")}
              onChange={(e) => onChange({ includedPracticeIds: e.target.value.split(",").map(s => s.trim()).filter(Boolean) as any })}
            />
            <p className="text-[10px] text-muted-foreground mt-1">Force these practices</p>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Exclude Practices (IDs)</Label>
            <Input
              placeholder="kriya, tantra, neuroscience..."
              value={config.excludedPracticeIds.join(", ")}
              onChange={(e) => onChange({ excludedPracticeIds: e.target.value.split(",").map(s => s.trim()).filter(Boolean) as any })}
            />
            <p className="text-[10px] text-muted-foreground mt-1">Never suggest these</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SessionArchetypeWeights({ config, onChange }: { config: SessionConfiguration; onChange: (patch: Partial<SessionConfiguration>) => void }) {
  const archetypes = [
    "opening", "inquiry", "teaching", "practice_deep", "integration", "release", "micro"
  ] as const;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings className="w-4 h-4" /> Archetype Weights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">Bias the session shape selection (0–2, default 1). Higher = more likely to be chosen.</p>
        <div className="space-y-2">
          {archetypes.map((arch) => (
            <div key={arch} className="flex items-center gap-3">
              <span className="text-sm font-body w-32 capitalize">{arch.replace("_", " ")}</span>
              <Slider
                value={[config.archetypeWeights[arch] ?? 1]}
                onValueChange={([v]) => onChange({ archetypeWeights: { ...config.archetypeWeights, [arch]: Math.round(v * 10) / 10 } })}
                min={0}
                max={2}
                step={0.1}
                className="flex-1"
              />
              <span className="text-sm font-mono text-muted-foreground w-10 text-right">
                {(config.archetypeWeights[arch] ?? 1).toFixed(1)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs mb-0">Force Archetype</Label>
          <Select value={config.forcedArchetype || ""} onValueChange={(v) => onChange({ forcedArchetype: v as any })} className="w-48 ml-2">
            <SelectTrigger><SelectValue placeholder="Auto (engine decides)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Auto</SelectItem>
              {archetypes.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

function SessionPracticeTargets({ config, onChange }: { config: SessionConfiguration; onChange: (patch: Partial<SessionConfiguration>) => void }) {
  const practices: { id: PracticeId; label: string; maxLevel: number; icon: string }[] = [
    { id: 'observation', label: 'Observation', maxLevel: 7, icon: '👁️' },
    { id: 'self-inquiry', label: 'Self-Inquiry', maxLevel: 6, icon: '❓' },
    { id: 'breath', label: 'Breath Awareness', maxLevel: 5, icon: '🌬️' },
    { id: 'witnessing', label: 'Witnessing', maxLevel: 5, icon: '🔍' },
    { id: 'body', label: 'Body Awareness', maxLevel: 5, icon: '🫁' },
    { id: 'bhakti', label: 'Bhakti Yoga', maxLevel: 5, icon: '❤️' },
    { id: 'karma', label: 'Karma Yoga', maxLevel: 5, icon: '🤲' },
    { id: 'jnana', label: 'Jnana Yoga', maxLevel: 6, icon: '📖' },
    { id: 'raja', label: 'Raja Yoga', maxLevel: 8, icon: '👑' },
    { id: 'kriya', label: 'Kriya Yoga', maxLevel: 7, icon: '⚡' },
    { id: 'tantra', label: 'Tantra', maxLevel: 5, icon: '🔥' },
    { id: 'neuroscience', label: 'Neuroscience', maxLevel: 5, icon: '🧬' },
    { id: 'emotional-healing', label: 'Emotional Healing', maxLevel: 5, icon: '💧' },
    { id: 'loop-dissolution', label: 'Loop Dissolution', maxLevel: 5, icon: '🔓' },
    { id: 'relationship', label: 'Relationship', maxLevel: 5, icon: '💞' },
    { id: 'work-career', label: 'Work & Career', maxLevel: 5, icon: '💼' },
    { id: 'finance', label: 'Finance', maxLevel: 4, icon: '💰' },
    { id: 'health', label: 'Health', maxLevel: 4, icon: '🏥' },
  ];

  const priorities = ['low', 'medium', 'high', 'required'] as const;
  const targets = config.practiceLevelTargets || {};

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="w-4 h-4" /> Practice-Level Targets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Target specific practices at specific levels. Gap of 1 = ready now, 2 = building toward.
        </p>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {practices.map((practice) => {
            const target = targets[practice.id];
            const currentLevel = 0; // Would come from user context in real implementation
            return (
              <div key={practice.id} className="flex items-center gap-2 p-2 glass-subtle rounded-xl">
                <span className="text-lg w-8 text-center">{practice.icon}</span>
                <span className="font-medium text-sm w-36 truncate">{practice.label}</span>
                <Input
                  type="number"
                  placeholder="Target level"
                  value={target?.targetLevel?.toString() || ""}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value) : undefined;
                    onChange({
                      practiceLevelTargets: {
                        ...targets,
                        [practice.id]: val ? { ...(targets[practice.id] || {}), practiceId: practice.id, targetLevel: val } : undefined,
                      },
                    });
                    // Clean up undefined
                    if (!val) {
                      const next = { ...targets };
                      delete next[practice.id];
                      onChange({ practiceLevelTargets: next });
                    }
                  }}
                  min={1}
                  max={practice.maxLevel}
                  className="w-20 text-center text-sm"
                />
                <span className="text-[10px] text-muted-foreground w-16">/ {practice.maxLevel}</span>
                <Select
                  value={target?.priority || "medium"}
                  onValueChange={(v) => {
                    if (targets[practice.id]) {
                      onChange({
                        practiceLevelTargets: {
                          ...targets,
                          [practice.id]: { ...targets[practice.id], priority: v as any },
                        },
                      });
                    }
                  }}
                  className="w-24"
                >
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Priority" /></SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
                {target && currentLevel > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    Current: L{currentLevel} {' → '}
                    {target.targetLevel > currentLevel ? '⬆️' : target.targetLevel < currentLevel ? '⬇️' : '✓'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function SessionIngredientPreferences({ config, onChange }: { config: SessionConfiguration; onChange: (patch: Partial<SessionConfiguration>) => void }) {
  const kinds = ["practice", "knowledge", "reflection", "micro_action"] as const;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Layers className="w-4 h-4" /> Ingredient Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">Weight each ingredient type (-1 to 2, default 1). Negative = avoid, 2 = strongly prefer.</p>
        <div className="space-y-2">
          {kinds.map((kind) => (
            <div key={kind} className="flex items-center gap-3">
              <span className="text-sm font-body w-32 capitalize">{kind.replace("_", " ")}</span>
              <Slider
                value={[config.ingredientPreferences[kind] ?? 1]}
                onValueChange={([v]) => onChange({ ingredientPreferences: { ...config.ingredientPreferences, [kind]: Math.round(v * 10) / 10 } })}
                min={-1}
                max={2}
                step={0.1}
                className="flex-1"
              />
              <span className="text-sm font-mono text-muted-foreground w-10 text-right">
                {(config.ingredientPreferences[kind] ?? 1).toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SessionPresetsManager({ presets, onUse, onEdit, onDelete }: {
  presets: SessionPreset[];
  onUse: (preset: SessionPreset) => void;
  onEdit: (preset: SessionPreset) => void;
  onDelete: (id: string) => void;
}) {
  const userPresets = presets.filter(p => !p.is_system);
  const systemPresets = presets.filter(p => p.is_system);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="w-4 h-4" /> Saved Presets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {userPresets.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No custom presets yet. Configure settings and click "Save as Preset".</p>
        )}
        <div className="space-y-2">
          {userPresets.map((preset) => (
            <div key={preset.id} className="flex items-center gap-3 p-3 glass-subtle rounded-xl">
              <Button variant="ghost" size="sm" onClick={() => onUse(preset)} className="flex-1 text-left justify-start">
                <div className="flex items-center gap-2">
                  <span className="font-display font-medium">{preset.name}</span>
                  <Badge variant="outline" className="text-[10px]">{preset.use_count} uses</Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{preset.description}</p>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onEdit(preset)}>
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(preset.id)} className="text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        {systemPresets.length > 0 && (
          <>
            <Separator />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">System Presets</p>
            <div className="grid grid-cols-2 gap-2">
              {systemPresets.map((preset) => (
                <Button
                  key={preset.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onUse(preset)}
                  className="rounded-xl h-auto py-3 px-2"
                >
                  <p className="font-display font-medium text-sm">{preset.name}</p>
                  <p className="text-[10px] text-muted-foreground">{preset.description}</p>
                </Button>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SessionPhysiological({ config, onChange }: { config: SessionConfiguration; onChange: (patch: Partial<SessionConfiguration>) => void }) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="w-4 h-4" /> Physiological Targets (Wearables)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">Optional: target HRV & breath rate when wearables connected</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs mb-1 block">Target HRV (ms)</Label>
            <Input
              type="number"
              placeholder="Auto"
              value={config.hrvTarget?.toString() || ""}
              onChange={(e) => onChange({ hrvTarget: e.target.value ? parseInt(e.target.value) : undefined })}
              min={20}
              max={150}
            />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Target Breath Rate (bpm)</Label>
            <Input
              type="number"
              placeholder="Auto"
              value={config.breathRateTarget?.toString() || ""}
              onChange={(e) => onChange({ breathRateTarget: e.target.value ? parseInt(e.target.value) : undefined })}
              min={4}
              max={30}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SessionDebugInfo({ config }: { config: SessionConfiguration }) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Eye className="w-4 h-4" /> Debug Info
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="text-[10px] font-mono text-muted-foreground bg-muted/50 p-3 rounded max-h-60 overflow-auto">
          {JSON.stringify(config, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}