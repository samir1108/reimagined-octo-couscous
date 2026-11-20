import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/design-system";
import { SessionPersonalizationPanel } from './SessionPersonalizationPanel';
import { ExtendedSessionConfiguration } from '@/types/session-config';

export interface SessionPersonalizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialConfig?: Partial<ExtendedSessionConfiguration>;
  onSave?: (config: ExtendedSessionConfiguration) => Promise<void>;
}

export function SessionPersonalizationDialog({ open, onOpenChange, initialConfig, onSave }: SessionPersonalizationDialogProps) {
  const handleSave = async (config: ExtendedSessionConfiguration) => {
    if (onSave) await onSave(config);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>Personalize Your Session</DialogTitle>
          <DialogDescription>
            Tune every aspect of your session — 1000+ combinations
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <SessionPersonalizationPanel
            initialConfig={initialConfig}
            onSave={handleSave}
            onClose={() => onOpenChange(false)}
            mode="full"
            showPreview={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}