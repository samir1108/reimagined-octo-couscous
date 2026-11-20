/**
 * CONTENT LIBRARY — Recommendation Engine
 * Intelligent, context-aware recommendation system.
 * Combines rule-based scoring with knowledge graph traversal.
 */

import type { LibraryItem, RecommendationContext, Recommendation } from '@/types/contentLibrary';
import { getLibraryItems, getRelatedItems, getPersonalizedRecommendations } from './index';
import { getGraphNeighbors } from './graph';

// ─── Scoring Weights ─────────────────────────────────────────────────────────

const WEIGHTS = {
  dimensionAlignment: 0.25,
  durationFit: 0.15,
  timeOfDayFit: 0.15,
  bandSuitability: 0.10,
  novelty: 0.10,
  popularity: 0.05,
  favoriteBoost: 0.10,
  graphProximity: 0.10,
};

// ─── Time-of-Day Profiles ────────────────────────────────────────────────────

const TIME_PROFILES: Record<string, { preferredTags: string[]; avoidTags: string[]; maxDuration: number }> = {
  morning: {
    preferredTags: ['morning', 'energy', 'activation', 'focus', 'clarity'],
    avoidTags: ['sleep', 'evening', 'deep_rest'],
    maxDuration: 30,
  },
  afternoon: {
    preferredTags: ['focus', 'reset', 'energy', 'productivity'],
    avoidTags: [],
    maxDuration: 20,
  },
  evening: {
    preferredTags: ['evening', 'calm', 'reflection', 'wind_down', 'gratitude'],
    avoidTags: ['activation', 'energy', 'intense'],
    maxDuration: 15,
  },
  night: {
    preferredTags: ['sleep', 'calm', 'body_scan', 'breath', 'stillness', 'surrender'],
    avoidTags: ['activation', 'energy', 'focus', 'intense'],
    maxDuration: 10,
  },
};

// ─── Core Recommendation Function ────────────────────────────────────────────

export function generateRecommendations(
  ctx: RecommendationContext,
  limit: number = 4
): { item: LibraryItem; score: number; reason: string }[] {
  const items = getLibraryItems().filter((i) => i.review_status === 'published');
  const completed = new Set(ctx.completed_item_ids);
  const weakDims = new Set(ctx.weak_dimensions);
  const timeProfile = TIME_PROFILES[ctx.time_of_day] || TIME_PROFILES.afternoon;

  const scored = items
    .filter((i) => !completed.has(i.id))
    .map((item) => {
      let score = 0;
      const reasons: string[] = [];

      // 1. Dimension alignment (weak dimensions)
      const dimOverlap = (item.consciousness_dimensions || []).filter((d) => weakDims.has(d)).length;
      const dimScore = dimOverlap / Math.max((item.consciousness_dimensions || []).length, 1);
      score += dimScore * WEIGHTS.dimensionAlignment;
      if (dimOverlap > 0) reasons.push(`Strengthens ${dimOverlap} weak dimension(s)`);

      // 2. Duration fit
      if (item.duration_minutes && item.duration_minutes <= ctx.available_minutes) {
        const fitRatio = 1 - (item.duration_minutes / ctx.available_minutes) * 0.3;
        score += fitRatio * WEIGHTS.durationFit;
      } else if (!item.duration_minutes) {
        score += WEIGHTS.durationFit * 0.5;
      }

      // 3. Time-of-day fit
      let todScore = 0;
      for (const tag of (item.tags || [])) {
        if (timeProfile.preferredTags.includes(tag)) todScore += 0.2;
        if (timeProfile.avoidTags.includes(tag)) todScore -= 0.3;
      }
      if (item.duration_minutes && item.duration_minutes <= timeProfile.maxDuration) todScore += 0.1;
      score += Math.max(0, Math.min(1, todScore)) * WEIGHTS.timeOfDayFit;
      if (todScore > 0.2) reasons.push(`Fits ${ctx.time_of_day} context`);

      // 4. Band suitability
      if (ctx.current_band !== undefined) {
        const bandStr = String(ctx.current_band);
        const suitable = (item.suitable_bands || []).some((b) => b === 'all' || b.includes(bandStr));
        if (suitable) {
          score += WEIGHTS.bandSuitability;
        } else {
          score -= 0.05;
        }
      }

      // 5. Novelty (not recently completed)
      if (!completed.has(item.id)) {
        score += WEIGHTS.novelty;
      }

      // 6. Popularity
      score += (item.popularity_score || 0) * WEIGHTS.popularity;

      // 7. Favorite boost
      if (ctx.favorited_item_ids.includes(item.id)) {
        score += WEIGHTS.favoriteBoost;
        reasons.push('You favorited similar content');
      }

      // 8. Energy level matching
      if (ctx.energy_level === 'low') {
        if (item.difficulty === 'beginner' || item.tags.includes('gentle') || item.tags.includes('rest')) {
          score += 0.1;
          reasons.push('Gentle for low energy');
        }
      } else if (ctx.energy_level === 'high') {
        if (item.difficulty === 'advanced' || item.tags.includes('challenge') || item.tags.includes('deep')) {
          score += 0.1;
          reasons.push('Matches high energy');
        }
      }

      // 9. Program continuity
      if (ctx.current_program_id) {
        // Boost items related to current program
        const related = getRelatedItems(ctx.current_program_id, 20);
        if (related.some((r) => r.id === item.id)) {
          score += 0.15;
          reasons.push('Part of your current program');
        }
      }

      // 10. Graph proximity (if item relates to recently completed)
      // Simple heuristic: items sharing dimensions with completed items
      if (ctx.completed_item_ids.length > 0) {
        const recentCompleted = ctx.completed_item_ids.slice(-5);
        const recentItems = recentCompleted.map((id) => getLibraryItems().find((i) => i.id === id)).filter(Boolean) as LibraryItem[];
        const recentDims = new Set(recentItems.flatMap((i) => i.consciousness_dimensions));
        const overlap = item.consciousness_dimensions.filter((d) => recentDims.has(d)).length;
        if (overlap > 0) {
          score += (overlap / item.consciousness_dimensions.length) * WEIGHTS.graphProximity;
        }
      }

      const reason = reasons.length > 0 ? reasons.join('; ') : 'Recommended for your journey';

      return { item, score: Math.min(score, 1), reason };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

// ─── Context Builder ──────────────────────────────────────────────────────────

export function buildRecommendationContext(
  userId: string,
  overrides: Partial<RecommendationContext> = {}
): RecommendationContext {
  const now = new Date();
  const hour = now.getHours();
  let timeOfDay: RecommendationContext['time_of_day'] = 'afternoon';
  if (hour >= 5 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
  else timeOfDay = 'night';

  return {
    user_id: userId,
    time_of_day: timeOfDay,
    day_of_week: now.getDay(),
    available_minutes: 15,
    completed_item_ids: [],
    favorited_item_ids: [],
    weak_dimensions: [],
    ...overrides,
  };
}

// ─── Daily Recommendation Bundle ──────────────────────────────────────────────

export interface DailyBundle {
  awareness_game: LibraryItem | null;
  body_practice: LibraryItem | null;
  wisdom_teaching: LibraryItem | null;
  reflection: LibraryItem | null;
}

export function generateDailyBundle(ctx: RecommendationContext): DailyBundle {
  const items = getLibraryItems().filter((i) => i.review_status === 'published');

  const pick = (filter: (i: LibraryItem) => boolean): LibraryItem | null => {
    const candidates = items.filter(filter).filter((i) => !ctx.completed_item_ids.includes(i.id));
    if (candidates.length === 0) return null;
    // Score and pick top
    const scored = candidates.map((item) => {
      let s = (item.popularity_score || 0) * 0.5 + (item.average_rating || 0) / 5 * 0.5;
      if (ctx.weak_dimensions.some((d) => item.consciousness_dimensions.includes(d))) s += 0.3;
      return { item, s };
    }).sort((a, b) => b.s - a.s);
    return scored[0]?.item || null;
  };

  return {
    awareness_game: pick((i) => i.type === 'game' && i.tags.includes('awareness')),
    body_practice: pick((i) => (i.type === 'practice' || i.type === 'somatic') && i.consciousness_dimensions.includes('body')),
    wisdom_teaching: pick((i) => i.type === 'wisdom'),
    reflection: pick((i) => i.type === 'reflection_question' || i.type === 'journaling'),
  };
}

// ─── Novelty & Diversity Enforcement ─────────────────────────────────────────

export function enforceDiversity(
  recommendations: { item: LibraryItem; score: number; reason: string }[],
  maxPerCategory: number = 2
): { item: LibraryItem; score: number; reason: string }[] {
  const categoryCounts = new Map<string, number>();
  const result: { item: LibraryItem; score: number; reason: string }[] = [];

  for (const rec of recommendations) {
    const count = categoryCounts.get(rec.item.category) || 0;
    if (count < maxPerCategory) {
      result.push(rec);
      categoryCounts.set(rec.item.category, count + 1);
    }
  }

  return result;
}
