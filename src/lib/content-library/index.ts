/**
 * CONTENT LIBRARY — Main Module (facade over the 10,000+ generator)
 * Central entry point. Lazily generates the full library on first access.
 */

export * from '@/types/contentLibrary';
export * from './taxonomy';

import type { LibraryItem, LibraryCategory, LibrarySubcategory, ContentRelationship, UserLibraryProgress, Recommendation, RecommendationContext } from '@/types/contentLibrary';

let _items: LibraryItem[] | null = null;
let _categories: LibraryCategory[] | null = null;
const _relationships: ContentRelationship[] = [];

import { generateLibrary } from './generator/generate';

function ensureLoaded(): LibraryItem[] {
  if (_items) return _items;
  const lib = generateLibrary();
  _items = lib.items as LibraryItem[];
  _categories = buildCategories(lib);
  return _items;
}

import { CATEGORY_SPECS, getCategorySpec } from './generator/manifest';
export { getCategorySpec };

function buildCategories(lib: any): LibraryCategory[] {
  const specs = CATEGORY_SPECS as any[];
  return specs.map((spec) => ({
    id: spec.slug,
    name: spec.name,
    slug: spec.slug,
    description: spec.description,
    icon: spec.icon,
    color: spec.color,
    item_count: (lib.byCategory?.[spec.slug] || []).length,
    subcategories: spec.subcategories.map((sub: any) => ({
      id: `${spec.slug}/${sub.slug}`,
      category_id: spec.slug,
      name: sub.name,
      slug: sub.slug,
      item_count: sub.count,
    })),
  }));
}

export function setLibraryItems(items: LibraryItem[]): void {
  _items = items;
}

export function getLibraryItems(): LibraryItem[] {
  return ensureLoaded();
}

export function getLibraryItemById(id: string): LibraryItem | undefined {
  return ensureLoaded().find((i) => i.id === id);
}

export function getLibraryItemsByType(type: string): LibraryItem[] {
  return ensureLoaded().filter((i) => i.type === type);
}

export function getLibraryItemsByCategory(category: string): LibraryItem[] {
  return ensureLoaded().filter((i) => i.category === category);
}

export function getLibraryItemsBySubcategory(subcategory: string): LibraryItem[] {
  return ensureLoaded().filter((i) => i.subcategory === subcategory);
}

export function searchLibraryItems(query: string, limit: number = 50): LibraryItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const tokens = q.split(/\s+/);
  const items = ensureLoaded();
  return items
    .map((item) => {
      const hay = `${item.title} ${item.description} ${(item.tags || []).join(' ')} ${(item.consciousness_dimensions || []).join(' ')} ${(item.life_domains || []).join(' ')}`.toLowerCase();
      const score = tokens.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0);
      return { item, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.item);
}

export function getRelatedItems(itemId: string, limit: number = 10): LibraryItem[] {
  const item = getLibraryItemById(itemId);
  if (!item) return [];
  const ids = item.related_items || [];
  const items = ensureLoaded();
  return ids
    .map((id) => items.find((i) => i.id === id))
    .filter(Boolean)
    .slice(0, limit) as LibraryItem[];
}

export function addRelationship(rel: ContentRelationship): void {
  _relationships.push(rel);
}

export function getRelationships(): ContentRelationship[] {
  return _relationships;
}

export function setCategories(cats: LibraryCategory[]): void {
  _categories = cats;
}

export function getCategories(): LibraryCategory[] {
  if (!_categories) ensureLoaded();
  return _categories || [];
}

export function getDiscoverySections(userId?: string): {
  id: string;
  title: string;
  type: string;
  items: LibraryItem[];
}[] {
  const published = ensureLoaded().filter((i) => i.review_status === 'published');
  return [
    {
      id: 'continue_journey',
      title: 'Continue Your Journey',
      type: 'continue_journey',
      items: published.slice(0, 3),
    },
    {
      id: 'popular_week',
      title: 'Popular This Week',
      type: 'popular',
      items: [...published].sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0)).slice(0, 6),
    },
    {
      id: 'recently_added',
      title: 'Recently Added',
      type: 'recent',
      items: [...published].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6),
    },
    {
      id: 'deep_exploration',
      title: 'Deep Exploration',
      type: 'discover',
      items: published.filter((i) => i.difficulty === 'advanced').slice(0, 6),
    },
    {
      id: 'random_discovery',
      title: 'Random Discovery',
      type: 'random',
      items: shuffleArray(published).slice(0, 6),
    },
  ];
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getPersonalizedRecommendations(
  ctx: RecommendationContext,
  limit: number = 4
): LibraryItem[] {
  const published = ensureLoaded().filter((i) => i.review_status === 'published');
  const completed = new Set(ctx.completed_item_ids);
  const weakDims = new Set(ctx.weak_dimensions);

  const scored = published
    .filter((i) => !completed.has(i.id))
    .map((item) => {
      let score = 0;
      for (const dim of item.consciousness_dimensions) {
        if (weakDims.has(dim)) score += 0.3;
      }
      if (item.duration_minutes && item.duration_minutes <= ctx.available_minutes) {
        score += 0.2;
      }
      if (ctx.time_of_day === 'evening' || ctx.time_of_day === 'night') {
        if (item.tags.includes('evening') || item.tags.includes('sleep') || item.tags.includes('calm')) score += 0.2;
      }
      if (ctx.time_of_day === 'morning') {
        if (item.tags.includes('morning') || item.tags.includes('energy')) score += 0.2;
      }
      if (ctx.current_band !== undefined) {
        const bandStr = String(ctx.current_band);
        if (item.suitable_bands.some((b) => b === 'all' || b.includes(bandStr))) score += 0.15;
      }
      if (ctx.favorited_item_ids.includes(item.id)) score += 0.1;
      score += (item.popularity_score || 0) * 0.05;
      // graph proximity boost
      for (const rid of item.related_items || []) {
        if (completed.has(rid)) { score += 0.1; break; }
      }
      return { item, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((s) => s.item);
}

// Counts
export function getLibraryStats(): { total: number; byCategory: Record<string, number>; byType: Record<string, number> } {
  const items = ensureLoaded();
  const byCategory: Record<string, number> = {};
  const byType: Record<string, number> = {};
  for (const it of items) {
    byCategory[it.category] = (byCategory[it.category] || 0) + 1;
    byType[it.type] = (byType[it.type] || 0) + 1;
  }
  return { total: items.length, byCategory, byType };
}
