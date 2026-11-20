import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import type { LibraryItemType, DifficultyLevel } from "@/types/contentLibrary";

export interface ExploreFilters {
  query: string;
  types: LibraryItemType[];
  difficulties: DifficultyLevel[];
  durationRanges: string[];
  dimensions: string[];
  lifeDomains: string[];
  yogaPaths: string[];
  sortBy: "relevance" | "popular" | "recent" | "duration" | "rating";
  sortOrder: "asc" | "desc";
}

const DEFAULT_FILTERS: ExploreFilters = {
  query: "",
  types: [],
  difficulties: [],
  durationRanges: [],
  dimensions: [],
  lifeDomains: [],
  yogaPaths: [],
  sortBy: "relevance",
  sortOrder: "desc",
};

export const DURATION_RANGES = [
  { key: "1-5", label: "1-5 min", min: 1, max: 5 },
  { key: "5-10", label: "5-10 min", min: 5, max: 10 },
  { key: "10-20", label: "10-20 min", min: 10, max: 20 },
  { key: "20-30", label: "20-30 min", min: 20, max: 30 },
  { key: "30+", label: "30+ min", min: 30, max: Infinity },
];

export const SORT_OPTIONS = [
  { key: "relevance", label: "Relevance" },
  { key: "popular", label: "Most Popular" },
  { key: "recent", label: "Recently Added" },
  { key: "duration", label: "Duration" },
  { key: "rating", label: "Highest Rated" },
];

export function useExploreFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState<ExploreFilters>(() => {
    const params = new URLSearchParams(searchParams);
    return {
      query: params.get("q") || "",
      types: params.get("types")?.split(",").filter(Boolean) as LibraryItemType[] || [],
      difficulties: params.get("difficulties")?.split(",").filter(Boolean) as DifficultyLevel[] || [],
      durationRanges: params.get("durations")?.split(",").filter(Boolean) || [],
      dimensions: params.get("dimensions")?.split(",").filter(Boolean) || [],
      lifeDomains: params.get("domains")?.split(",").filter(Boolean) || [],
      yogaPaths: params.get("paths")?.split(",").filter(Boolean) || [],
      sortBy: (params.get("sortBy") as ExploreFilters["sortBy"]) || "relevance",
      sortOrder: (params.get("sortOrder") as ExploreFilters["sortOrder"]) || "desc",
    };
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("explore_recent_searches") || "[]");
    } catch {
      return [];
    }
  });

  const updateFilters = useCallback((updates: Partial<ExploreFilters>) => {
    setFilters((prev) => {
      const next = { ...prev, ...updates };
      const params = new URLSearchParams();
      
      if (next.query) params.set("q", next.query);
      if (next.types.length) params.set("types", next.types.join(","));
      if (next.difficulties.length) params.set("difficulties", next.difficulties.join(","));
      if (next.durationRanges.length) params.set("durations", next.durationRanges.join(","));
      if (next.dimensions.length) params.set("dimensions", next.dimensions.join(","));
      if (next.lifeDomains.length) params.set("domains", next.lifeDomains.join(","));
      if (next.yogaPaths.length) params.set("paths", next.yogaPaths.join(","));
      if (next.sortBy !== "relevance") params.set("sortBy", next.sortBy);
      if (next.sortOrder !== "desc") params.set("sortOrder", next.sortOrder);
      
      setSearchParams(params, { replace: true });
      return next;
    });
  }, [setSearchParams]);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const hasActiveFilters = useMemo(() => 
    filters.types.length > 0 ||
    filters.difficulties.length > 0 ||
    filters.durationRanges.length > 0 ||
    filters.dimensions.length > 0 ||
    filters.lifeDomains.length > 0 ||
    filters.yogaPaths.length > 0,
    [filters]
  );

  const addRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    setRecentSearches((prev) => {
      const next = [query, ...prev.filter((q) => q !== query)].slice(0, 5);
      localStorage.setItem("explore_recent_searches", JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleType = useCallback((type: LibraryItemType) => {
    updateFilters({
      types: filters.types.includes(type)
        ? filters.types.filter((t) => t !== type)
        : [...filters.types, type],
    });
  }, [filters.types, updateFilters]);

  const toggleDifficulty = useCallback((difficulty: DifficultyLevel) => {
    updateFilters({
      difficulties: filters.difficulties.includes(difficulty)
        ? filters.difficulties.filter((d) => d !== difficulty)
        : [...filters.difficulties, difficulty],
    });
  }, [filters.difficulties, updateFilters]);

  const toggleDuration = useCallback((durationKey: string) => {
    updateFilters({
      durationRanges: filters.durationRanges.includes(durationKey)
        ? filters.durationRanges.filter((d) => d !== durationKey)
        : [...filters.durationRanges, durationKey],
    });
  }, [filters.durationRanges, updateFilters]);

  const toggleDimension = useCallback((dimension: string) => {
    updateFilters({
      dimensions: filters.dimensions.includes(dimension)
        ? filters.dimensions.filter((d) => d !== dimension)
        : [...filters.dimensions, dimension],
    });
  }, [filters.dimensions, updateFilters]);

  const toggleLifeDomain = useCallback((domain: string) => {
    updateFilters({
      lifeDomains: filters.lifeDomains.includes(domain)
        ? filters.lifeDomains.filter((d) => d !== domain)
        : [...filters.lifeDomains, domain],
    });
  }, [filters.lifeDomains, updateFilters]);

  const toggleYogaPath = useCallback((path: string) => {
    updateFilters({
      yogaPaths: filters.yogaPaths.includes(path)
        ? filters.yogaPaths.filter((p) => p !== path)
        : [...filters.yogaPaths, path],
    });
  }, [filters.yogaPaths, updateFilters]);

  return {
    filters,
    setFilters: updateFilters,
    clearFilters,
    hasActiveFilters,
    isFilterOpen,
    setIsFilterOpen,
    recentSearches,
    addRecentSearch,
    toggleType,
    toggleDifficulty,
    toggleDuration,
    toggleDimension,
    toggleLifeDomain,
    toggleYogaPath,
    DURATION_RANGES,
    SORT_OPTIONS,
  };
}

export function applyFilters(items: any[], filters: ExploreFilters): any[] {
  let result = [...items];

  if (filters.query.trim()) {
    const q = filters.query.toLowerCase().trim();
    const tokens = q.split(/\s+/);
    result = result
      .map((item) => {
        const hay = `${item.title} ${item.description} ${(item.tags || []).join(" ")} ${(item.consciousness_dimensions || []).join(" ")} ${(item.life_domains || []).join(" ")}`.toLowerCase();
        const score = tokens.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0);
        return { item, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.item);
  }

  if (filters.types.length > 0) {
    result = result.filter((item) => filters.types.includes(item.type));
  }

  if (filters.difficulties.length > 0) {
    result = result.filter((item) => filters.difficulties.includes(item.difficulty));
  }

  if (filters.durationRanges.length > 0) {
    result = result.filter((item) => {
      const dur = item.duration_minutes || 0;
      return filters.durationRanges.some((range) => {
        const r = DURATION_RANGES.find((dr) => dr.key === range);
        return r && dur >= r.min && dur <= r.max;
      });
    });
  }

  if (filters.dimensions.length > 0) {
    result = result.filter((item) =>
      filters.dimensions.some((dim) => item.consciousness_dimensions?.includes(dim))
    );
  }

  if (filters.lifeDomains.length > 0) {
    result = result.filter((item) =>
      filters.lifeDomains.some((domain) => item.life_domains?.includes(domain))
    );
  }

  if (filters.yogaPaths.length > 0) {
    result = result.filter((item) =>
      filters.yogaPaths.some((path) => item.yoga_paths?.includes(path))
    );
  }

  switch (filters.sortBy) {
    case "popular":
      result.sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));
      break;
    case "recent":
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
    case "duration":
      result.sort((a, b) => (a.duration_minutes || 0) - (b.duration_minutes || 0));
      if (filters.sortOrder === "desc") result.reverse();
      break;
    case "rating":
      result.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
      break;
    default:
      break;
  }

  return result;
}