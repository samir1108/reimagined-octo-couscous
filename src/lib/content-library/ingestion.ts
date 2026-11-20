/**
 * CONTENT LIBRARY — Ingestion Pipeline
 * Handles batch import, validation, quality scoring, and deduplication.
 */

import type { LibraryItem, IngestionBatch, ContentQualityReport } from '@/types/contentLibrary';
import { QUALITY_CRITERIA } from './taxonomy';

// ─── Validation ──────────────────────────────────────────────────────────────

export function validateLibraryItem(item: Partial<LibraryItem>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const required = QUALITY_CRITERIA.minimumRequired;

  for (const field of required) {
    if (!(item as Record<string, unknown>)[field] && (item as Record<string, unknown>)[field] !== 0) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (item.title && item.title.length < 3) errors.push('Title too short');
  if (item.description && item.description.length < 10) errors.push('Description too short');
  if (item.consciousness_dimensions && item.consciousness_dimensions.length === 0) {
    errors.push('At least one consciousness dimension required');
  }
  if (item.tags && item.tags.length === 0) errors.push('At least one tag required');

  // Type-specific validation
  if (item.type === 'practice' && item.content) {
    const c = item.content as Record<string, unknown>;
    if (!c.instructions && !c.session_steps) errors.push('Practice must have instructions or session_steps');
  }
  if (item.type === 'wisdom' && item.content) {
    const c = item.content as Record<string, unknown>;
    if (!c.concept && !c.explanation) errors.push('Wisdom must have a concept or explanation');
  }
  if (item.type === 'game' && item.content) {
    const c = item.content as Record<string, unknown>;
    if (!c.game_type && !c.mechanics) errors.push('Game must have game_type or mechanics');
  }
  if (item.type === 'program' && item.content) {
    const c = item.content as Record<string, unknown>;
    if (!c.duration_days && !c.days) errors.push('Program must have duration_days or days');
  }
  if (item.type === 'podcast' && item.content) {
    const c = item.content as Record<string, unknown>;
    if (!c.audio_url && !c.duration_minutes) errors.push('Podcast must have audio_url or duration_minutes');
  }
  if (item.type === 'assessment' && item.content) {
    const c = item.content as Record<string, unknown>;
    if (!c.questions) errors.push('Assessment must have questions');
  }

  return { valid: errors.length === 0, errors };
}

// ─── Quality Scoring ─────────────────────────────────────────────────────────

export function scoreContentQuality(item: LibraryItem): ContentQualityReport {
  const issues: string[] = [];
  let score = 0;
  const maxScore = 10;

  // Required fields (4 points)
  const required = QUALITY_CRITERIA.minimumRequired;
  const requiredPresent = required.filter((f) => !!(item as Record<string, unknown>)[f] || (item as Record<string, unknown>)[f] === 0).length;
  score += (requiredPresent / required.length) * 4;
  if (requiredPresent < required.length) {
    issues.push(`Missing ${required.length - requiredPresent} required fields`);
  }

  // Recommended fields (2 points)
  const recommended = QUALITY_CRITERIA.recommended;
  const recPresent = recommended.filter((f) => !!(item as Record<string, unknown>)[f]).length;
  score += (recPresent / recommended.length) * 2;

  // Type-specific (2 points)
  if (item.type === 'practice') {
    const c = item.content as Record<string, unknown>;
    const specFields = QUALITY_CRITERIA.practiceSpecific;
    const present = specFields.filter((f) => c && (c[f] || (Array.isArray(c[f]) && c[f].length > 0))).length;
    score += (present / specFields.length) * 2;
    if (present < specFields.length) issues.push(`Missing ${specFields.length - present} practice fields`);
  } else if (item.type === 'wisdom') {
    const c = item.content as Record<string, unknown>;
    const specFields = QUALITY_CRITERIA.wisdomSpecific;
    const present = specFields.filter((f) => c && c[f]).length;
    score += (present / specFields.length) * 2;
    if (present < specFields.length) issues.push(`Missing ${specFields.length - present} wisdom fields`);
  } else {
    score += 2; // default for other types
  }

  // Content richness (1 point)
  if (item.related_items && item.related_items.length >= 3) score += 0.5;
  if (item.tags && item.tags.length >= 5) score += 0.5;

  // Source/provenance (1 point)
  if (item.source && item.source !== 'ai_generated_reviewed') score += 0.5;
  if (item.provenance) score += 0.5;

  const normalizedScore = Math.min(score / maxScore, 1);

  return {
    item_id: item.id,
    has_source: !!item.source,
    has_practical_application: !!(item.content as Record<string, unknown>)?.practical_application,
    has_safety_notes: !!(item.content as Record<string, unknown>)?.safety_notes || !!(item.content as Record<string, unknown>)?.contraindications,
    has_consciousness_dimensions: (item.consciousness_dimensions || []).length > 0,
    has_related_items: (item.related_items?.length || 0) > 0,
    quality_score: normalizedScore,
    issues,
  };
}

// ─── Deduplication ───────────────────────────────────────────────────────────

export function findDuplicates(items: LibraryItem[], threshold: number = 0.85): Map<string, string[]> {
  const duplicates = new Map<string, string[]>();

  for (let i = 0; i < items.length; i++) {
    const dupes: string[] = [];
    for (let j = i + 1; j < items.length; j++) {
      const similarity = computeSimilarity(items[i], items[j]);
      if (similarity >= threshold) {
        dupes.push(items[j].id);
      }
    }
    if (dupes.length > 0) {
      duplicates.set(items[i].id, dupes);
    }
  }

  return duplicates;
}

function computeSimilarity(a: LibraryItem, b: LibraryItem): number {
  // Simple Jaccard similarity on title tokens + tags
  const tokensA = new Set(`${a.title} ${a.tags.join(' ')}`.toLowerCase().split(/\s+/));
  const tokensB = new Set(`${b.title} ${b.tags.join(' ')}`.toLowerCase().split(/\s+/));
  const intersection = new Set([...tokensA].filter((t) => tokensB.has(t)));
  const union = new Set([...tokensA, ...tokensB]);
  return intersection.size / (union.size || 1);
}

// ─── Batch Ingestion ─────────────────────────────────────────────────────────

export interface IngestionResult {
  batch_id: string;
  total: number;
  accepted: number;
  rejected: number;
  duplicates: number;
  errors: { item_id: string; errors: string[] }[];
}

export function processIngestionBatch(
  items: Partial<LibraryItem>[],
  source: string,
  category: string
): IngestionResult {
  const batchId = `batch-${Date.now()}`;
  const result: IngestionResult = {
    batch_id: batchId,
    total: items.length,
    accepted: 0,
    rejected: 0,
    duplicates: 0,
    errors: [],
  };

  const validated: LibraryItem[] = [];

  for (const item of items) {
    const { valid, errors } = validateLibraryItem(item);
    if (!valid) {
      result.rejected++;
      result.errors.push({ item_id: item.id || 'unknown', errors });
      continue;
    }
    validated.push(item as LibraryItem);
    result.accepted++;
  }

  // Check duplicates within batch
  const dupes = findDuplicates(validated);
  result.duplicates = dupes.size;

  return result;
}

// ─── Content Generation Templates ────────────────────────────────────────────

export const PRACTICE_TEMPLATE = {
  type: 'practice' as const,
  requiredContent: ['instructions', 'session_steps', 'required_widgets', 'expected_experience', 'contraindications', 'safety_notes'],
  optionalContent: ['tips', 'variations', 'audio_guide_url', 'video_guide_url'],
};

export const WISDOM_TEMPLATE = {
  type: 'wisdom' as const,
  requiredContent: ['concept', 'explanation', 'practical_application', 'reflection_questions', 'references'],
  optionalContent: ['original_text_excerpt', 'commentary', 'modern_interpretation', 'related_research'],
};

export const GAME_TEMPLATE = {
  type: 'game' as const,
  requiredContent: ['game_type', 'mechanics', 'scoring_rules', 'observation_outputs'],
  optionalContent: ['levels', 'achievements', 'multiplayer', 'leaderboard'],
};

export const PROGRAM_TEMPLATE = {
  type: 'program' as const,
  requiredContent: ['duration_days', 'daily_time_minutes', 'days'],
  optionalContent: ['certificate', 'prerequisites', 'target_audience'],
};

// ─── Export Helpers ───────────────────────────────────────────────────────────

export function generateItemId(category: string, index: number): string {
  return `${category}-${String(index).padStart(5, '0')}`;
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
