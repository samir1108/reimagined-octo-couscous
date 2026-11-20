import { useState } from 'react';
import { SessionPreset, SessionConfiguration, ExtendedSessionConfiguration } from '@/types/session-config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/design-system";
import { Button } from "@/design-system";
import { Input } from "@/design-system";
import { Textarea } from "@/design-system";
import { Badge } from "@/design-system";
import { ScrollArea } from "@/design-system";
import { Separator } from "@/design-system";
import { BookOpen, Save, Trash2, Star, Clock, Zap, Check, Copy, Share2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthReady } from '@/hooks/useAuthReady';

interface PresetsTabProps {
  presets: SessionPreset[];
  currentConfig: ExtendedSessionConfiguration;
  onSelect: (preset: SessionPreset) => void;
  onSave: (name: string, description: string) => Promise<void>;
}

export function PresetsTab({ presets, currentConfig, onSelect, onSave }: PresetsTabProps) {
  const { user } = useAuthReady();
  const [isSaving, setIsSaving] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showSaveForm, setShowSaveForm] = useState(false);

  const systemPresets = presets.filter(p => p.isSystem);
  const userPresets = presets.filter(p => !p.isSystem);

  const handleSave = async () => {
    if (!saveName.trim()) return;
    setIsSaving(true);
    try {
      await onSave(saveName.trim(), saveDescription.trim());
      setSaveName('');
      setSaveDescription('');
      setShowSaveForm(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (presetId: string) => {
    if (!user) return;
    await supabase.from('user_session_presets').delete().eq('id', presetId);
  };

  const getPresetSummary = (config: SessionConfiguration) => {
    const focus = config.focusType;
    const duration = config.timeBudgetMin;
    const guide = config.guideStyle;
    return `${focus} · ${duration}min · ${guide}`;
  };

  return (
    <ScrollArea className="h-full pr-2">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Session Presets</h3>
            <p className="text-sm text-muted-foreground">Save configurations for quick access</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowSaveForm(!showSaveForm)}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Save Current
          </Button>
        </div>

        {showSaveForm && (
          <Card className="border-gold/50">
            <CardHeader>
              <CardTitle className="text-sm">Save as Preset</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Preset name"
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
              />
              <Textarea
                placeholder="Description (optional)"
                value={saveDescription}
                onChange={e => setSaveDescription(e.target.value)}
                rows={2}
              />
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isSaving || !saveName.trim()}>
                  {isSaving ? 'Saving...' : 'Save Preset'}
                </Button>
                <Button variant="outline" onClick={() => setShowSaveForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <Star className="w-4 h-4 text-gold" />
              System Presets ({systemPresets.length})
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {systemPresets.map(preset => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  isSelected={selectedPreset === preset.id}
                  onSelect={() => { setSelectedPreset(preset.id); onSelect(preset); }}
                  onDelete={undefined}
                  summary={getPresetSummary(preset.config)}
                />
              ))}
            </div>
          </div>

          {userPresets.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Your Presets ({userPresets.length})
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {userPresets.map(preset => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    isSelected={selectedPreset === preset.id}
                    onSelect={() => { setSelectedPreset(preset.id); onSelect(preset); }}
                    onDelete={() => handleDelete(preset.id)}
                    summary={getPresetSummary(preset.config)}
                  />
                ))}
              </div>
            </div>
          )}

          {userPresets.length === 0 && !showSaveForm && (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <BookOpen className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No saved presets yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Configure your session and click "Save Current" to create one
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}

function PresetCard({ preset, isSelected, onSelect, onDelete, summary }: {
  preset: SessionPreset;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
  summary: string;
}) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg hover:shadow-gold/10 ${
        isSelected ? 'border-gold bg-gold/5' : ''
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium truncate">{preset.name}</h4>
              {preset.isSystem && (
                <Badge variant="secondary" className="text-xs bg-gold/20 text-gold">
                  System
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{preset.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-mono text-gold">{summary}</span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(preset.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Used {preset.useCount}x
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2">
            {isSelected && <Check className="w-4 h-4 text-gold" />}
            {!preset.isSystem && onDelete && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                onClick={e => { e.stopPropagation(); onDelete(); }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}