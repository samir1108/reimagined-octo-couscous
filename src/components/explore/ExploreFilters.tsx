import { useMemo } from "react";
import { X, ChevronDown, ChevronUp, SlidersHorizontal, Filter, FilterX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/design-system";
import { Checkbox } from "@/design-system";
import { Label } from "@/design-system";
import { Separator } from "@/design-system";
import { ScrollArea } from "@/design-system";
import { Button } from "@/design-system";
import { Badge } from "@/design-system";
import { Popover, PopoverTrigger, PopoverContent } from "@/design-system";
import { useExploreFilters, DURATION_RANGES, SORT_OPTIONS } from "@/hooks/useExploreFilters";
import type { LibraryItemType, DifficultyLevel } from "@/types/contentLibrary";

const ITEM_TYPES: { value: LibraryItemType; label: string; icon: string }[] = [
  { value: "practice", label: "Practices", icon: "🧘" },
  { value: "game", label: "Games", icon: "🎮" },
  { value: "program", label: "Programs", icon: "🗺️" },
  { value: "wisdom", label: "Wisdom", icon: "📜" },
  { value: "podcast", label: "Podcasts", icon: "🎧" },
  { value: "meditation", label: "Meditations", icon: "🕯️" },
  { value: "challenge", label: "Challenges", icon: "⚔️" },
  { value: "ritual", label: "Rituals", icon: "🕯️" },
  { value: "course", label: "Courses", icon: "📚" },
  { value: "story", label: "Stories", icon: "📖" },
  { value: "micro_practice", label: "Micro Practices", icon: "⚡" },
  { value: "journaling", label: "Journaling", icon: "📓" },
  { value: "self_inquiry", label: "Self-Inquiry", icon: "🔍" },
  { value: "breathwork", label: "Breathwork", icon: "🌬️" },
  { value: "somatic", label: "Somatic", icon: "🫁" },
  { value: "assessment", label: "Assessments", icon: "📊" },
  { value: "life_experiment", label: "Life Experiments", icon: "🧪" },
];

const DIFFICULTIES: { value: DifficultyLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "all", label: "All Levels" },
];

const CONSCIOUSNESS_DIMENSIONS = ["thought", "emotion", "body", "action", "connection", "spirit"] as const;
const LIFE_DOMAINS = ["work", "relationships", "health", "finances", "creativity", "learning", "spirituality", "community"] as const;
const YOGA_PATHS = ["raja", "bhakti", "jnana", "karma", "kriya", "tantra", "hatha"] as const;

function FilterSection({
  title,
  children,
  count,
  onClear,
}: {
  title: string;
  children: React.ReactNode;
  count?: number;
  onClear?: () => void;
}) {
  return (
    <fieldset className="space-y-3" aria-labelledby={`filter-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <legend id={`filter-${title.toLowerCase().replace(/\s+/g, '-')}`} className="sr-only">{title}</legend>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-sm">{title}</h3>
        {count && count > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-xs h-6 px-2" aria-label={`Clear ${title} filters`}>
            <FilterX className="w-3.5 h-3.5 mr-1" /> Clear
          </Button>
        )}
      </div>
      <div className="space-y-2" role="group" aria-label={`${title} options`}>{children}</div>
    </fieldset>
  );
}

function CheckboxItem({
  label,
  checked,
  onChange,
  description,
  id,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  id: string;
}) {
  const descId = description ? `${id}-desc` : undefined;
  
  return (
    <Label htmlFor={id} className="flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:bg-muted/30 transition-colors">
      <Checkbox 
        id={id}
        checked={checked} 
        onCheckedChange={onChange} 
        className="mt-0.5 shrink-0"
        aria-describedby={descId}
      />
      <div className="flex-1 min-w-0">
        <span className="text-sm">{label}</span>
        {description && <p id={descId} className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </Label>
  );
}

export function ExploreFiltersDesktop({ onClose }: { onClose?: () => void }) {
  const {
    filters,
    hasActiveFilters,
    clearFilters,
    toggleType,
    toggleDifficulty,
    toggleDuration,
    toggleDimension,
    toggleLifeDomain,
    toggleYogaPath,
    DURATION_RANGES,
    SORT_OPTIONS,
  } = useExploreFilters();

  return (
    <div className="w-72 flex-shrink-0 border-r border-border/50 bg-card/50 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2">
            <FilterX className="w-3.5 h-3.5 mr-1" /> Clear All
          </Button>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-200px)] pr-2">
        <div className="space-y-6">
          <FilterSection
            title="Types"
            count={filters.types.length}
            onClear={() => toggleType(filters.types[0])}
          >
            {ITEM_TYPES.map((type) => (
              <CheckboxItem
                key={type.value}
                id={`filter-type-${type.value}`}
                label={`${type.icon} ${type.label}`}
                checked={filters.types.includes(type.value)}
                onChange={(checked) => toggleType(type.value)}
              />
            ))}
          </FilterSection>

          <Separator />

          <FilterSection
            title="Difficulty"
            count={filters.difficulties.length}
            onClear={() => toggleDifficulty(filters.difficulties[0])}
          >
            {DIFFICULTIES.map((diff) => (
              <CheckboxItem
                key={diff.value}
                id={`filter-difficulty-${diff.value}`}
                label={diff.label}
                checked={filters.difficulties.includes(diff.value)}
                onChange={(checked) => toggleDifficulty(diff.value)}
              />
            ))}
          </FilterSection>

          <Separator />

          <FilterSection
            title="Duration"
            count={filters.durationRanges.length}
            onClear={() => toggleDuration(filters.durationRanges[0])}
          >
            {DURATION_RANGES.map((range) => (
              <CheckboxItem
                key={range.key}
                id={`filter-duration-${range.key}`}
                label={range.label}
                checked={filters.durationRanges.includes(range.key)}
                onChange={(checked) => toggleDuration(range.key)}
              />
            ))}
          </FilterSection>

          <Separator />

          <FilterSection
            title="Consciousness Dimensions"
            count={filters.dimensions.length}
            onClear={() => toggleDimension(filters.dimensions[0])}
          >
            {CONSCIOUSNESS_DIMENSIONS.map((dim) => (
              <CheckboxItem
                key={dim}
                id={`filter-dimension-${dim}`}
                label={dim.charAt(0).toUpperCase() + dim.slice(1)}
                checked={filters.dimensions.includes(dim)}
                onChange={(checked) => toggleDimension(dim)}
              />
            ))}
          </FilterSection>

          <Separator />

          <FilterSection
            title="Life Domains"
            count={filters.lifeDomains.length}
            onClear={() => toggleLifeDomain(filters.lifeDomains[0])}
          >
            {LIFE_DOMAINS.map((domain) => (
              <CheckboxItem
                key={domain}
                id={`filter-domain-${domain}`}
                label={domain.charAt(0).toUpperCase() + domain.slice(1)}
                checked={filters.lifeDomains.includes(domain)}
                onChange={(checked) => toggleLifeDomain(domain)}
              />
            ))}
          </FilterSection>

          <Separator />

          <FilterSection
            title="Yoga Paths"
            count={filters.yogaPaths.length}
            onClear={() => toggleYogaPath(filters.yogaPaths[0])}
          >
            {YOGA_PATHS.map((path) => (
              <CheckboxItem
                key={path}
                id={`filter-path-${path}`}
                label={path.charAt(0).toUpperCase() + path.slice(1)}
                checked={filters.yogaPaths.includes(path)}
                onChange={(checked) => toggleYogaPath(path)}
              />
            ))}
          </FilterSection>

          <Separator />

          <div className="space-y-3">
            <h3 className="font-medium text-sm">Sort By</h3>
            <div className="space-y-2">
              {SORT_OPTIONS.map((opt) => (
                <Label
                  key={opt.key}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    filters.sortBy === opt.key
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/30"
                  }`}
                >
                  <span className="text-sm">{opt.label}</span>
                  {filters.sortBy === opt.key && (
                    <span className="text-xs text-primary">✓</span>
                  )}
                  <input
                    type="radio"
                    name="sortBy"
                    value={opt.key}
                    checked={filters.sortBy === opt.key}
                    onChange={() => {
                      const { setFilters } = require("@/hooks/useExploreFilters");
                    }}
                    className="sr-only"
                  />
                </Label>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export function ExploreFiltersMobile() {
  const {
    filters,
    hasActiveFilters,
    clearFilters,
    isFilterOpen,
    setIsFilterOpen,
    toggleType,
    toggleDifficulty,
    toggleDuration,
    toggleDimension,
    toggleLifeDomain,
    toggleYogaPath,
    DURATION_RANGES,
    SORT_OPTIONS,
  } = useExploreFilters();

  return (
    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2" size="sm">
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {[
                filters.types.length,
                filters.difficulties.length,
                filters.durationRanges.length,
                filters.dimensions.length,
                filters.lifeDomains.length,
                filters.yogaPaths.length,
              ].reduce((a, b) => a + b, 0)}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full max-w-sm p-0" side="right">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display">Filters</SheetTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <FilterX className="w-3.5 h-3.5 mr-1" /> Clear All
              </Button>
            )}
          </div>
        </SheetHeader>
        <ScrollArea className="max-h-[70vh] pr-2">
          <div className="space-y-6 pb-4">
            <FilterSection
              title="Types"
              count={filters.types.length}
              onClear={() => filters.types.forEach((t) => toggleType(t))}
            >
              {ITEM_TYPES.map((type) => (
                <CheckboxItem
                  key={type.value}
                  id={`mobile-filter-type-${type.value}`}
                  label={`${type.icon} ${type.label}`}
                  checked={filters.types.includes(type.value)}
                  onChange={(checked) => toggleType(type.value)}
                />
              ))}
            </FilterSection>

            <Separator />

            <FilterSection
              title="Difficulty"
              count={filters.difficulties.length}
              onClear={() => filters.difficulties.forEach((d) => toggleDifficulty(d))}
            >
              {DIFFICULTIES.map((diff) => (
                <CheckboxItem
                  key={diff.value}
                  id={`mobile-filter-difficulty-${diff.value}`}
                  label={diff.label}
                  checked={filters.difficulties.includes(diff.value)}
                  onChange={(checked) => toggleDifficulty(diff.value)}
                />
              ))}
            </FilterSection>

            <Separator />

            <FilterSection
              title="Duration"
              count={filters.durationRanges.length}
              onClear={() => filters.durationRanges.forEach((d) => toggleDuration(d))}
            >
              {DURATION_RANGES.map((range) => (
                <CheckboxItem
                  key={range.key}
                  id={`mobile-filter-duration-${range.key}`}
                  label={range.label}
                  checked={filters.durationRanges.includes(range.key)}
                  onChange={(checked) => toggleDuration(range.key)}
                />
              ))}
            </FilterSection>

            <Separator />

            <FilterSection
              title="Consciousness Dimensions"
              count={filters.dimensions.length}
              onClear={() => filters.dimensions.forEach((d) => toggleDimension(d))}
            >
              {CONSCIOUSNESS_DIMENSIONS.map((dim) => (
                <CheckboxItem
                  key={dim}
                  id={`mobile-filter-dimension-${dim}`}
                  label={dim.charAt(0).toUpperCase() + dim.slice(1)}
                  checked={filters.dimensions.includes(dim)}
                  onChange={(checked) => toggleDimension(dim)}
                />
              ))}
            </FilterSection>

            <Separator />

            <FilterSection
              title="Life Domains"
              count={filters.lifeDomains.length}
              onClear={() => filters.lifeDomains.forEach((d) => toggleLifeDomain(d))}
            >
              {LIFE_DOMAINS.map((domain) => (
                <CheckboxItem
                  key={domain}
                  id={`mobile-filter-domain-${domain}`}
                  label={domain.charAt(0).toUpperCase() + domain.slice(1)}
                  checked={filters.lifeDomains.includes(domain)}
                  onChange={(checked) => toggleLifeDomain(domain)}
                />
              ))}
            </FilterSection>

            <Separator />

            <FilterSection
              title="Yoga Paths"
              count={filters.yogaPaths.length}
              onClear={() => filters.yogaPaths.forEach((p) => toggleYogaPath(p))}
            >
              {YOGA_PATHS.map((path) => (
                <CheckboxItem
                  key={path}
                  id={`mobile-filter-path-${path}`}
                  label={path.charAt(0).toUpperCase() + path.slice(1)}
                  checked={filters.yogaPaths.includes(path)}
                  onChange={(checked) => toggleYogaPath(path)}
                />
              ))}
            </FilterSection>

            <Separator />

            <div className="space-y-3">
              <h3 className="font-medium text-sm">Sort By</h3>
              <div className="space-y-2">
                {SORT_OPTIONS.map((opt) => (
                  <Label
                    key={opt.key}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      filters.sortBy === opt.key
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted/30"
                    }`}
                  >
                    <span className="text-sm">{opt.label}</span>
                    {filters.sortBy === opt.key && (
                      <span className="text-xs text-primary">✓</span>
                    )}
                  </Label>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export function ActiveFilterChips() {
  const { filters, clearFilters, toggleType, toggleDifficulty, toggleDuration, toggleDimension, toggleLifeDomain, toggleYogaPath } = useExploreFilters();

  const chips = useMemo(() => {
    const result: { label: string; onRemove: () => void }[] = [];
    filters.types.forEach((t) => result.push({ label: `Type: ${t}`, onRemove: () => toggleType(t) }));
    filters.difficulties.forEach((d) => result.push({ label: `Difficulty: ${d}`, onRemove: () => toggleDifficulty(d) }));
    filters.durationRanges.forEach((d) => {
      const range = DURATION_RANGES.find((r) => r.key === d);
      result.push({ label: `Duration: ${range?.label || d}`, onRemove: () => toggleDuration(d) });
    });
    filters.dimensions.forEach((d) => result.push({ label: `Dimension: ${d}`, onRemove: () => toggleDimension(d) }));
    filters.lifeDomains.forEach((d) => result.push({ label: `Domain: ${d}`, onRemove: () => toggleLifeDomain(d) }));
    filters.yogaPaths.forEach((p) => result.push({ label: `Path: ${p}`, onRemove: () => toggleYogaPath(p) }));
    return result;
  }, [filters, toggleType, toggleDifficulty, toggleDuration, toggleDimension, toggleLifeDomain, toggleYogaPath]);

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip, i) => (
        <Badge key={i} variant="outline" className="gap-1" onClick={chip.onRemove}>
          {chip.label}
          <X className="w-3 h-3 cursor-pointer hover:opacity-70" />
        </Badge>
      ))}
      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2">
        <FilterX className="w-3.5 h-3.5 mr-1" /> Clear All
      </Button>
    </div>
  );
}

export function SortPopover() {
  const { filters, SORT_OPTIONS } = useExploreFilters();
  const { setFilters } = require("@/hooks/useExploreFilters");
  // We need to use the hook properly, but for now let's use a simpler approach
  // The actual setFilters will come from the parent component
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Filter className="w-4 h-4" />
          Sort: {SORT_OPTIONS.find((o) => o.key === filters.sortBy)?.label || "Relevance"}
          <ChevronDown className="w-3.5 h-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => {
              // This needs to be connected to the actual setFilters
              console.log("Sort by:", opt.key);
            }}
            className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-accent ${
              filters.sortBy === opt.key ? "text-primary font-medium" : ""
            }`}
          >
            {opt.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}