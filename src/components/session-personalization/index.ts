export { SessionPersonalizationPanel } from './SessionPersonalizationPanel';
export { SessionPersonalizationDialog } from './SessionPersonalizationDialog';
export { BasicConfigTab } from './BasicConfigTab';
export { AdvancedConfigTab } from './AdvancedConfigTab';
export { PresetsTab } from './PresetsTab';
export { NaturalLanguageInput } from './NaturalLanguageInput';
export { SessionPreview } from './SessionPreview';
export { SessionStudio } from './SessionStudio';
export { IntentRail } from './IntentRail';

export type { SessionPersonalizationPanelProps } from './SessionPersonalizationPanel';
export type { SessionPersonalizationDialogProps } from './SessionPersonalizationDialog';
export type { PersonalizationView, PersonalizationConflict, ConfigChange, PersonalizationSource, PersonalizationLayerId } from './personalizationModel';

// Re-export types for convenience
export type { ExtendedSessionConfiguration, SessionConfiguration, SessionPreset } from '@/types/session-config';