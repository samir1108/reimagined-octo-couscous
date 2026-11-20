# EXPLORE PAGE - DEEP UX AUDIT (User Interaction Flow)

## The User's Actual Journey

### Step 1: User opens /app/explore

**What happens:**
1. `useAuthReady` loads user profile
2. `useConsciousnessEngine` fetches band (takes ~2-3s)
3. `useGameSessions` fetches sessions (takes ~1-2s)
4. While loading, spinner shows
5. Then WorldsView renders with 14 world cards

**PROBLEMS:**
- ❌ **No skeleton/loading state** - just a spinner, user has no idea what's loading
- ❌ **14 worlds shown at once** - overwhelming, no prioritization
- ❌ **Daily Game card not visible** - `dailyGame` from useGameSessions is undefined (no daily_game table)
- ❌ **In-progress games empty** - checks `s.phase === "play"` but sessions are created with phase "intro" then updated to "play" only when game is clicked. Actually `startSession` is called on click, which creates with phase "intro". The filter checks "play" so this never matches.
- ❌ **Time-aware games** - `getGamesForTimeOfDay` uses `timeOfDay` but the mapping is wrong. `decision` is not a Faculty in the unified registry.
- ❌ **Recent Games row missing** - `recentGames` is computed but never displayed
- ❌ **GameInsights not linked** - `/app/games-insights` exists but no button to reach it
- ❌ **Weak dims mapping incomplete** - dimension_bands keys may not be "thought", "emotion", etc. Need to check actual keys.

### Step 2: User clicks a World card

**What happens:**
1. World card expands (AnimatePresence)
2. Shows 4 unlocked mini game cards
3. Shows 2 locked mini game cards
4. User clicks a mini game card

**PROBLEMS:**
- ❌ **World cards don't navigate** - they just expand/collapse, no dedicated world page
- ❌ **No "Explore World" CTA** - just a button at bottom
- ❌ **Mini game cards show FACULTY_ICONS[game.faculties[0]]** - but FACULTY_ICONS in Explore.tsx maps Faculty → string (emoji), while GameCardRich uses React nodes. Inconsistent.
- ❌ **No game preview** - clicking immediately navigates, no hover detail
- ❌ **Locked games show "Unlocks at Band X (you're Band Y)"** - good but no "how to unlock" guidance
- ❌ **No game duration badge** on mini cards

### Step 3: User clicks a Game card

**What happens:**
1. `startSession(game.id)` creates a game_sessions row with phase "intro"
2. `navigate("/app/games/${game.id}")` 
3. GameRoute loads the component
4. ConsciousGameShell shows intro screen

**PROBLEMS:**
- ❌ **startSession runs synchronously** - if it fails (no table, network), navigation still happens but session isn't tracked
- ❌ **GameRoute uses both old and LAB registries** - `getGame` (old) and `getLabGame` (LAB). If a game is in LAB but not old, it works. But if in old but not LAB, also works. However, the `UNIFIED_GAMES` list shows 232 games, but only ~150 have loaders.
- ❌ **No loading state** during navigation
- ❌ **No error handling** if game component fails to load
- ❌ **GameInsights not reachable** from within game

### Step 4: User plays a game

**What happens:**
1. Intro screen shows hero image + "Begin" button
2. User clicks Begin → play phase
3. Game component renders

**PROBLEMS:**
- ❌ **No pause button** - can't pause a game
- ❌ **No progress indicator** - "3 min" game shows no timer
- ❌ **No back button during play** - must complete or abandon
- ❌ **No "skip" option** - forced to wait
- ❌ **Reflection phase** - waits for AI response, no timeout
- ❌ **No "Play Again" / "Next Game"** after reflection
- ❌ **Karma awarded silently** - no toast/feedback

### Step 5: User returns to Explore

**What happens:**
1. Back at `/app/explore`
2. Session should show in "In Progress" or "Completed"

**PROBLEMS:**
- ❌ **In-progress detection broken** - checks `s.phase === "play"` but completed sessions have phase "completed"
- ❌ **Completed games** - uses `s.outcome === "completed"` which works but the `completedGames` array isn't displayed anywhere
- ❌ **No "Recent Games" row** - `recentGames` computed but never rendered
- ❌ **GameInsights tab** - exists but the data comes from `consciousness_signals`, not `game_sessions`. Two different data sources.
- ❌ **No "Resume" button** for in-progress games

### Step 6: User navigates to Insights tab

**What happens:**
1. Shows GameInsights component data
2. Groups by game_id from consciousness_signals

**PROBLEMS:**
- ❌ **Data mismatch** - Insights uses `consciousness_signals` table, Explore uses `game_sessions` table. They're not connected.
- ❌ **No link to individual game** from insights
- ❌ **No session detail view** - can't see reflection, signals, duration
- ❌ **No export/share** of insights

---

## Critical Issues Summary

### P0 (Must Fix)
1. **Dual game systems not unified** - old `lib/games/games.ts` (42 games) vs LAB (200+ games) vs `unifiedRegistry.ts` (232 games). The unified registry exists but the Explore page still doesn't use it consistently.
2. **game_sessions table doesn't exist** - Supabase migration needed. Without it, all session tracking fails silently.
3. **daily_game table doesn't exist** - Daily Game feature is dead code.
4. **In-progress detection broken** - checks wrong phase value.
5. **No "Recent Games" row** - computed but not rendered.
6. **GameInsights disconnected** - uses different data source.

### P1 (Should Fix)
7. **No pause/resume** - games can't be paused
8. **No timer/progress** during game play
9. **No "Play Again" / "Next Game"** after completion
10. **No karma feedback** - awarded silently
11. **No "how to unlock" guidance** for locked games
12. **Weak dimension mapping** - dimension_bands keys need verification
13. **No onboarding** for new users
14. **No time-aware recommendations** - implemented but not tested

### P2 (Nice to Have)
15. **Pull-to-refresh** - implemented but not wired to actual data refresh
16. **Haptics** - `useHaptics` exists but may not work on all devices
17. **Video previews** - `getGameVideo` exists but need to verify coverage
18. **Mobile bottom nav** - implemented but may overlap content

---

## Immediate Fixes Needed

1. **Verify Supabase tables exist** - check if game_sessions, daily_game tables exist
2. **Fix in-progress detection** - change `s.phase === "play"` to check for incomplete sessions
3. **Add Recent Games row** - render the `recentGames` array
4. **Link GameInsights** - add button in Insights tab or header
5. **Fix dimension mapping** - verify dimension_bands keys
6. **Add pause button** to ConsciousGameShell
7. **Add timer** to game play phase
8. **Add "Play Again" / "Next Game"** to reflection phase
9. **Add karma toast** on game completion

---

## What I'll Code Next (In Order)

1. **Fix in-progress detection + Recent Games row** (quick win)
2. **Wire GameInsights into explore** (tab + link)
3. **Add pause button + timer to ConsciousGameShell**
4. **Add "Play Again" / "Next Game" / karma toast to reflection**
5. **Create Supabase migration for game_sessions + daily_game**
6. **Build Daily Game mechanic** with streak
7. **Add time-aware recommendations** section
8. **New user onboarding flow**
9. **Mobile bottom nav + pull-to-refresh polish**