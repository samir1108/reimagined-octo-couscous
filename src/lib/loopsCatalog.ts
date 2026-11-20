/**
 * Loops Catalog Service — Client-side access to loops_catalog table
 * Replaces hardcoded LOOP_ENTRIES in localLoopDetector.ts
 * and LOOP_CATALOG in loopLibraryCatalog.ts
 */

import { supabase } from '@/integrations/supabase/client';

export type LoopCatalogEntry = {
  id: string;
  name: string;
  category: string;
  hint: string;
  keywords: string[];
  phrases: string[];
  root_wound: string | null;
  chakras: string[];
  way_out: string | null;
  triggers: Record<string, string[]> | null;
  severity_thresholds: { low: number; medium: number; high: number } | null;
  is_active: boolean;
};

export interface LoopCategoryView {
  key: string;
  label: string;
  emoji: string;
  blurb: string;
  loop_count: number;
}

let loopsCache: LoopCatalogEntry[] | null = null;
let categoriesCache: LoopCategoryView[] | null = null;

export async function fetchLoopsCatalog(forceRefresh = false): Promise<LoopCatalogEntry[]> {
  if (loopsCache && !forceRefresh) return loopsCache;

  const client = supabase;
  const { data, error } = await (client as any)
    .from('loops_catalog')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('id', { ascending: true });

  if (error) {
    console.error('Failed to fetch loops catalog:', error);
    return loopsCache || [];
  }

  loopsCache = (data || []) as LoopCatalogEntry[];
  return loopsCache;
}

export async function fetchLoopCategories(forceRefresh = false): Promise<LoopCategoryView[]> {
  if (categoriesCache && !forceRefresh) return categoriesCache;

  const client = supabase;
  const { data, error } = await (client as any)
    .from('loop_categories_view')
    .select('*')
    .order('key', { ascending: true });

  if (error) {
    console.error('Failed to fetch loop categories:', error);
    return categoriesCache || [];
  }

  categoriesCache = (data || []) as LoopCategoryView[];
  return categoriesCache;
}

export function getLoopById(loops: LoopCatalogEntry[], id: string): LoopCatalogEntry | undefined {
  return loops.find(l => l.id === id);
}

export function getLoopsByCategory(loops: LoopCatalogEntry[], category: string): LoopCatalogEntry[] {
  return loops.filter(l => l.category === category);
}

export function searchLoops(loops: LoopCatalogEntry[], query: string): LoopCatalogEntry[] {
  const lower = query.toLowerCase();
  return loops.filter(l =>
    l.name.toLowerCase().includes(lower) ||
    l.hint?.toLowerCase().includes(lower) ||
    l.keywords.some(k => k.toLowerCase().includes(lower)) ||
    l.phrases.some(p => p.toLowerCase().includes(lower))
  );
}

export function clearLoopsCache(): void {
  loopsCache = null;
  categoriesCache = null;
}