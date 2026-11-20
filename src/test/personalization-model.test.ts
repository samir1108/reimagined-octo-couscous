import { describe, it, expect } from 'vitest';
import {
  DEFAULT_EXTENDED_CONFIG,
  ExtendedSessionConfiguration,
} from '@/types/session-config';
import {
  buildPersonalizationView,
  diffConfigPatch,
  applyConfigChanges,
  labelForPath,
  describeValue,
  collectConflicts,
} from '@/components/session-personalization/personalizationModel';

describe('personalizationModel', () => {
  const defaultConfig = DEFAULT_EXTENDED_CONFIG;

  describe('labelForPath', () => {
    it('returns known labels for top-level paths', () => {
      expect(labelForPath('focusType')).toBe('Practice focus');
      expect(labelForPath('timeBudgetMin')).toBe('Duration');
      expect(labelForPath('energyMode')).toBe('Energy');
      expect(labelForPath('domainWeights.work')).toBe('Work & Career');
    });

    it('falls back to path for unknown', () => {
      expect(labelForPath('unknown.path')).toBe('unknown.path');
    });
  });

  describe('describeValue', () => {
    it('formats focusType with label', () => {
      expect(describeValue('focusType', 'self_inquiry')).toBe('Self-Inquiry');
    });

    it('formats timeBudgetMin as minutes', () => {
      expect(describeValue('timeBudgetMin', 20)).toBe('20 min');
    });

    it('formats domainWeights as percentage', () => {
      expect(describeValue('domainWeights.work', 0.5)).toBe('50%');
    });

    it('formats arrays', () => {
      expect(describeValue('includedPracticeIds', ['breath', 'body'])).toBe('breath, body');
    });

    it('formats practiceLevelTargets', () => {
      const targets = { breath: { targetLevel: 4, priority: 'high' }, body: { targetLevel: 2, priority: 'medium' } };
      expect(describeValue('practiceLevelTargets', targets)).toContain('breath L4 (high)');
    });
  });

  describe('buildPersonalizationView', () => {
    it('returns Essential depth for default config', () => {
      const view = buildPersonalizationView(defaultConfig);
      expect(view.depth).toBeLessThan(0.25);
      expect(view.depthLabel).toBe('Essential');
      expect(view.activeSignals).toBe(0);
      expect(view.totalSignals).toBeGreaterThan(0);
    });

    it('increases depth when focusType changed', () => {
      const config = { ...defaultConfig, focusType: 'self_inquiry' as const };
      const view = buildPersonalizationView(config);
      expect(view.activeSignals).toBeGreaterThan(0);
      expect(view.layers.find(l => l.id === 'intent')?.customizedCount).toBe(1);
    });

    it('includes all six layers', () => {
      const view = buildPersonalizationView(defaultConfig);
      const layerIds = view.layers.map(l => l.id).sort();
      expect(layerIds).toEqual(['access', 'advanced', 'guidance', 'intent', 'priorities', 'shape']);
    });

    it('computes primary domains sorted by weight', () => {
      const config = { ...defaultConfig, domainWeights: { ...defaultConfig.domainWeights, spirituality: 1, health: 0.9, creativity: 0.1 } };
      const view = buildPersonalizationView(config);
      expect(view.primaryDomains[0].id).toBe('spirituality');
      expect(view.primaryDomains[1].id).toBe('health');
    });
  });

  describe('diffConfigPatch', () => {
    it('returns changes for modified paths', () => {
      const changes = diffConfigPatch(defaultConfig, { focusType: 'self_inquiry', timeBudgetMin: 30 });
      expect(changes).toHaveLength(2);
      expect(changes.map(c => c.path)).toContain('focusType');
      expect(changes.map(c => c.path)).toContain('timeBudgetMin');
    });

    it('skips unchanged values', () => {
      const changes = diffConfigPatch(defaultConfig, { timeBudgetMin: 20 }); // same as default
      expect(changes).toHaveLength(0);
    });

    it('includes display values', () => {
      const changes = diffConfigPatch(defaultConfig, { timeBudgetMin: 45 });
      expect(changes[0].displayBefore).toBe('20 min');
      expect(changes[0].displayAfter).toBe('45 min');
    });
  });

  describe('applyConfigChanges', () => {
    it('produces a patch object from changes', () => {
      const changes = diffConfigPatch(defaultConfig, { timeBudgetMin: 45, energyMode: 'high' });
      const patch = applyConfigChanges(defaultConfig, changes);
      expect(patch.timeBudgetMin).toBe(45);
      expect(patch.energyMode).toBe('high');
    });
  });

  describe('collectConflicts', () => {
    it('detects deep reflection with short session', () => {
      const config = { ...defaultConfig, reflectionDepth: 'deep' as const, timeBudgetMin: 5 };
      const conflicts = collectConflicts(config);
      const deep = conflicts.find(c => c.id === 'deep-reflection-short-session');
      expect(deep).toBeDefined();
      expect(deep?.severity).toBe('blocking');
    });

    it('detects standard reflection with very short session', () => {
      const config = { ...defaultConfig, reflectionDepth: 'standard' as const, timeBudgetMin: 2 };
      const conflicts = collectConflicts(config);
      const standard = conflicts.find(c => c.id === 'standard-reflection-short-session');
      expect(standard).toBeDefined();
      expect(standard?.severity).toBe('warning');
    });

    it('detects harder difficulty with low energy', () => {
      const config = { ...defaultConfig, difficultyOverride: 'harder' as const, energyMode: 'low' as const };
      const conflicts = collectConflicts(config);
      const conflict = conflicts.find(c => c.id === 'hard-difficulty-low-energy');
      expect(conflict).toBeDefined();
      expect(conflict?.severity).toBe('warning');
    });

    it('detects silent guide with guided structure', () => {
      const config = { ...defaultConfig, guideStyle: 'silent' as const, structure: 'guided' as const };
      const conflicts = collectConflicts(config);
      const conflict = conflicts.find(c => c.id === 'silent-guide-guided-structure');
      expect(conflict).toBeDefined();
      expect(conflict?.severity).toBe('warning');
    });

    it('detects included and excluded overlap', () => {
      const config = { ...defaultConfig, includedPracticeIds: ['breath'], excludedPracticeIds: ['breath'] };
      const conflicts = collectConflicts(config);
      const conflict = conflicts.find(c => c.id === 'included-excluded-overlap');
      expect(conflict).toBeDefined();
      expect(conflict?.severity).toBe('blocking');
    });

    it('detects required practice excluded', () => {
      const config = {
        ...defaultConfig,
        practiceLevelTargets: { breath: { practiceId: 'breath' as any, targetLevel: 4, priority: 'required' as const, reason: 'test' } },
        excludedPracticeIds: ['breath'],
      };
      const conflicts = collectConflicts(config);
      const conflict = conflicts.find(c => c.id === 'required-excluded-practice');
      expect(conflict).toBeDefined();
      expect(conflict?.severity).toBe('blocking');
    });

    it('detects all domain weights zero', () => {
      const config = { ...defaultConfig, domainWeights: { relationship: 0, work: 0, finance: 0, health: 0, creativity: 0, spirituality: 0 } };
      const conflicts = collectConflicts(config);
      const conflict = conflicts.find(c => c.id === 'all-domains-zero');
      expect(conflict).toBeDefined();
      expect(conflict?.severity).toBe('warning');
    });

    it('detects focus-gate mismatch', () => {
      const config = { ...defaultConfig, focusType: 'sleep' as const, preferredGate: 'morning' as const };
      const conflicts = collectConflicts(config);
      const conflict = conflicts.find(c => c.id === 'focus-gate-mismatch');
      expect(conflict).toBeDefined();
      expect(conflict?.severity).toBe('blocking');
    });
  });
});