# Explore Tab Implementation Plan

## Current State Analysis

The app has **two Explore implementations**:
1. **`/app/explore`** (`src/pages/Explore.tsx`) - Tab-based: Mirrors, Programs, Games, Wisdom
2. **`/app/library` → `/app/explore`** (`src/pages/ExploreLibrary.tsx`) - Content library with categories, search, discovery

Both use the **content library generator** (`src/lib/content-library/`) which generates 10,000+ items deterministically.

## Issues Identified

1. **Routing confusion**: Two different Explore pages with different URLs
2. **Content loading**: `ExploreLibrary.tsx` imports from `@/lib/content-library` but the generator may not be fully wired
3. **Search/filtering**: Basic search exists but no advanced filters
4. **Personalization**: No user-specific recommendations in Explore
5. **Progress tracking**: No user progress/favorites persistence
6. **Performance**: 10,000+ items generated on first load - needs virtualization
7. **Mobile UX**: No bottom nav, touch targets, pull-to-refresh

---

## Batch 1: Fix Routing & Content Loading (High Priority)

### Tasks
1. **Consolidate routes** in `App.tsx`:
   - Keep `/app/explore` as main entry (tabbed: Mirrors, Programs, Games, Wisdom)
   - Move content library to `/app/library` with category routes `/app/library/:category`
   - Remove duplicate `/app/explore` from content library routes

2. **Verify content library generator** works:
   - Test `getLibraryItems()` returns items
   - Verify categories load correctly
   - Check search functionality

3. **Fix ExploreLibrary.tsx** to use correct imports and data flow

### Files to Modify
- `src/App.tsx` - Route consolidation
- `src/pages/ExploreLibrary.tsx` - Fix data loading
- `src/pages/ExploreCategory.tsx` - Verify category filtering

---

## Batch 2: Search & Filtering (High Priority)

### Tasks
1. **Add advanced search filters**:
   - Filter by type (practice, game, program, wisdom, etc.)
   - Filter by difficulty (beginner, intermediate, advanced)
   - Filter by duration (5min, 10min, 20min, 30min+)
   - Filter by consciousness dimension
   - Filter by life domain
   - Filter by yoga path

2. **Implement filter UI**:
   - Filter drawer/sheet (mobile) or sidebar (desktop)
   - Active filter chips with clear option
   - Filter persistence in URL params

3. **Enhance search**:
   - Debounced search input
   - Search suggestions/autocomplete
   - Recent searches

### Files to Create/Modify
- `src/components/explore/ExploreFilters.tsx` (new)
- `src/components/explore/ExploreSearch.tsx` (new)
- `src/pages/ExploreLibrary.tsx` - Integrate filters
- `src/hooks/useExploreFilters.ts` (new)

---

## Batch 3: Personalized Recommendations (Medium Priority)

### Tasks
1. **Wire `getPersonalizedRecommendations`** from content library:
   - Get user context (band, completed items, weak dimensions, time of day)
   - Call recommendation engine
   - Display in "For Your Current State" section

2. **Add user context hooks**:
   - `useConsciousnessProfile()` - band, dimensions
   - `useCompletedItems()` - from sessions
   - `useWeakDimensions()` - from consciousness engine

3. **Recommendation UI**:
   - Explainable recommendations ("Recommended because...")
   - Thumbs up/down feedback
   - Dismiss recommendation

### Files to Create/Modify
- `src/hooks/usePersonalizedRecommendations.ts` (new)
- `src/components/explore/RecommendationCard.tsx` (new)
- `src/pages/ExploreLibrary.tsx` - Add personalized section

---

## Batch 4: Category Browsing & Discovery (Medium Priority)

### Tasks
1. **Enhance category pages** (`ExploreCategory.tsx`):
   - Subcategory tabs
   - Sort options (popular, recent, duration, difficulty)
   - Infinite scroll / pagination
   - Grid/List view toggle

2. **Discovery sections** (from `getDiscoverySections`):
   - Continue Your Journey (in-progress items)
   - Popular This Week
   - Recently Added
   - Deep Exploration (advanced)
   - Random Discovery

3. **Category detail page**:
   - Category hero with description
   - Subcategory navigation
   - Item count badges

### Files to Create/Modify
- `src/components/explore/CategoryHero.tsx` (new)
- `src/components/explore/SubcategoryTabs.tsx` (new)
- `src/components/explore/ItemGrid.tsx` (new) - with virtualization
- `src/pages/ExploreCategory.tsx` - Enhance

---

## Batch 5: Progress Tracking & Favorites (Medium Priority)

### Tasks
1. **User progress persistence**:
   - Save progress to Supabase (`user_library_progress` table)
   - Local-first with IndexedDB sync
   - Progress states: not_started, in_progress, completed, favorited, skipped

2. **Favorites system**:
   - Heart button on each item
   - Favorites page/section
   - Sync across devices

3. **Progress UI**:
   - Progress ring on item cards
   - Continue button for in-progress
   - Completed checkmark

### Files to Create/Modify
- `src/hooks/useLibraryProgress.ts` (new)
- `src/lib/libraryProgress.ts` (new) - Supabase integration
- `src/components/explore/ItemCard.tsx` - Add progress/favorite

---

## Batch 6: Performance Optimization (Medium Priority)

### Tasks
1. **Virtualized lists**:
   - Use `@tanstack/react-virtual` for item grids
   - Windowed rendering for 10,000+ items

2. **Lazy loading**:
   - Lazy load images with blur placeholders
   - Code-split category pages
   - Defer non-critical content

3. **Caching**:
   - Cache generated library in IndexedDB
   - React Query for server data
   - Stale-while-revalidate

4. **Bundle optimization**:
   - Tree-shake unused content banks
   - Dynamic imports for heavy banks

### Files to Create/Modify
- `src/components/explore/VirtualizedItemGrid.tsx` (new)
- `src/lib/content-library/cache.ts` (new)
- `vite.config.ts` - Check bundle splitting

---

## Batch 7: Accessibility & Mobile Polish (Low Priority)

### Tasks
1. **Accessibility**:
   - ARIA labels on all interactive elements
   - Keyboard navigation for filters/tabs
   - Focus management on route change
   - Screen reader announcements for dynamic content
   - Color contrast audit

2. **Mobile UX**:
   - Bottom tab bar for main navigation
   - Pull-to-refresh on lists
   - Touch targets ≥ 44px
   - Swipe gestures for category switching
   - Safe area handling

3. **PWA**:
   - Offline support for cached content
   - Install prompt
   - App shortcuts

### Files to Create/Modify
- `src/components/ui/bottom-tabs.tsx` (new)
- `src/hooks/usePullToRefresh.ts` (new)
- `src/components/explore/*` - Add ARIA attributes

---

## Implementation Order

| Batch | Priority | Est. Effort | Dependencies |
|-------|----------|-------------|--------------|
| 1 | High | 2-3 hrs | None |
| 2 | High | 3-4 hrs | Batch 1 |
| 3 | Medium | 2-3 hrs | Batch 1, 2 |
| 4 | Medium | 3-4 hrs | Batch 1, 2 |
| 5 | Medium | 3-4 hrs | Batch 1, Supabase |
| 6 | Medium | 2-3 hrs | Batch 1-4 |
| 7 | Low | 2-3 hrs | Batch 1-4 |

---

## Success Criteria

- [ ] Single `/app/explore` entry point with working tabs
- [ ] Content library loads 10,000+ items without blocking UI
- [ ] Search returns results in <100ms
- [ ] Filters work across all dimensions
- [ ] Personalized recommendations show on Explore home
- [ ] Category pages have subcategory navigation
- [ ] User progress persists across sessions
- [ ] Mobile UX is smooth (60fps scrolling)
- [ ] Accessibility audit passes (WCAG AA)

---

## Notes

- The content library is **deterministically generated** - no database needed for content
- User progress/favorites **do** need Supabase
- Use existing patterns: `useMemo` for derived data, `lazy` for code-splitting, `Suspense` for loading
- Follow existing theme system (5 themes × dark/light)
- Use `sonner` for toasts, `framer-motion` for animations