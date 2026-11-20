# EXPLORE PAGE - DEEP USER INTERACTION AUDIT

## Current Architecture (FRAGMENTED)

### Two Disconnected Game Systems

| System | File | Games | Used By | Status |
|--------|------|-------|---------|--------|
| **Old** | `src/lib/games/games.ts` | 42 | `/app/games` (Games.tsx) | Has components but basic |
| **LAB** | `src/games/shell/labRegistry.ts` | 200+ | `/app/explore` (my new page) | Rich metadata, ~150 have loaders |

**CRITICAL**: They share NO data. User sees different games in different places.

---

## User Journey Audit

### 1. NEW USER (First Visit)
```
Landing → Onboarding → Band Assessment → /app/explore
```
**PROBLEMS:**
- No onboarding flow to explain "Worlds" metaphor
- No "Start Here" guidance - 14 worlds is overwhelming
- No daily/first game suggestion
- Band assessment result not used for immediate recommendation

### 2. RETURNING USER - "Continue Playing"
```
Open app → /app/explore → See "Continue" section → Click game
```
**PROBLEMS:**
- Games are single-shot (no pause/resume)
- No "in-progress" game state persisted
- "Continue" section shows library items, NOT games
- GameInsights at `/app/games-insights` exists but unlinked

### 3. USER WANTS SPECIFIC FACULTY
```
Explore → Worlds → Click "Attention" → See games → Click one
```
**PROBLEMS:**
- 14 worlds shown as equal grid - no prioritization
- Locked games mixed with unlocked (confusing)
- No "Quick Play" for 60-second games
- No time-aware filtering (morning = energy, evening = wind-down)

### 4. USER COMPLETES A GAME
```
Play → Complete → Reflection → ??? 
```
**PROBLEMS:**
- Reflection spoken but not saved visibly
- No "Play Again" / "Next Recommended" / "Save Insight"
- No streak tracking for games
- Karma awarded silently - no feedback

### 5. USER WANTS HISTORY
```
Explore → ??? → GameInsights
```
**PROBLEMS:**
- GameInsights at `/app/games-insights` but NO link anywhere
- No "Recently Played" row on explore
- No session detail view
- No export/share of insights

---

## Missing Critical Features

### A. Unified Game Registry
- Merge old + LAB into single source of truth
- Every game needs: metadata, component loader, progress tracking

### B. Game Session State
```typescript
interface GameSessionState {
  gameId: string;
  phase: 'intro' | 'play' | 'reflect' | 'completed';
  startedAt: number;
  pausedAt?: number;
  signals: Record<string, any>;
  canResume: boolean;
}
```

### C. Smart Recommendations Engine
```typescript
interface GameRecommendation {
  gameId: string;
  reason: 'weak_dimension' | 'time_of_day' | 'streak' | 'unlocked' | 'daily' | 'completionist';
  confidence: number;
  expiresAt?: number; // for daily
}
```

### D. Time-Aware Suggestions
- **Morning (5-11)**: Energy games (breath, attention, willpower)
- **Afternoon (11-17)**: Focus games (deep work, decision, logic)
- **Evening (17-22)**: Wind-down (body, heart, stillness)
- **Night (22-5)**: Liminal (dream, sleep, death practices)

### E. Daily Game Mechanic
- One "Daily Game" per user per day
- Based on weak dimension + time of day
- Completing it = streak + bonus karma
- Shows prominently at top of explore

### F. Game Progress & History (Unified)
- Recent games row on explore (last 5)
- GameInsights integrated as tab or modal
- Session detail: signals, reflection, duration, date
- Aggregate: total sessions, total minutes, favorite faculty

### G. Mobile-First Interactions
- Bottom tab bar (Explore, Games, Journey, Profile)
- Pull-to-refresh on explore
- Swipe between worlds
- Haptic feedback on card press
- Safe area handling

---

## Implementation Priority

### Phase 1: Foundation (Unblock Everything)
1. **Unified Game Registry** - single source, all games
2. **Game Session Persistence** - Supabase table for in-progress + history
3. **GameInsights Link** - add to explore header/tab

### Phase 2: Smart Discovery
4. **Daily Game** - prominent card, streak tracking
5. **Time-Aware Recommendations** - morning/evening sections
6. **Weak Dimension Mapping** - use consciousness engine data

### Phase 3: Rich UX
7. **World Prioritization** - show user's weak faculty worlds first
8. **Quick Play Row** - 60-second games for "I have 1 minute"
9. **Session Detail Modal** - tap history → see reflection, signals

### Phase 4: Polish
10. **Mobile Bottom Nav**
11. **Pull-to-refresh**
12. **Haptics + Micro-animations**
13. **Onboarding Flow** for new users

---

## Data Model Changes Needed

### New Supabase Tables
```sql
-- Unified game catalog (replaces both registries)
CREATE TABLE games_catalog (
  id TEXT PRIMARY KEY,
  name TEXT,
  one_line TEXT,
  faculty TEXT[], -- primary faculties
  tier TEXT, -- S/A/B/C
  unlock_band INT,
  duration_ms INT,
  needs_mic BOOL,
  needs_camera BOOL,
  needs_tts BOOL,
  needs_stt BOOL,
  has_component BOOL,
  signal_description TEXT,
  tradition TEXT,
  mechanism TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game session state (for resume + history)
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  game_id TEXT REFERENCES games_catalog(id),
  phase TEXT, -- 'intro' | 'play' | 'reflect' | 'completed' | 'abandoned'
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  duration_ms INT,
  signals JSONB,
  reflection TEXT,
  outcome TEXT, -- 'completed' | 'abandoned' | 'interrupted'
  karma_awarded INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily game assignment
CREATE TABLE daily_game (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  game_id TEXT REFERENCES games_catalog(id),
  assigned_at DATE DEFAULT CURRENT_DATE,
  completed_at TIMESTAMPTZ,
  streak INT DEFAULT 0,
  UNIQUE (user_id, assigned_at)
);
```

---

## Immediate Action Items

1. **Audit which LAB games actually have loaders** - check `GameRoute.tsx` loaders vs `LAB_GAMES`
2. **Create unified registry** - merge old + LAB, mark which have components
3. **Add game_sessions table** - for history + resume
4. **Wire GameInsights into explore** - as tab or "History" button
5. **Build Daily Game mechanic** - assign on explore load
6. **Add "Recent Games" row** to explore (last 5 from game_sessions)
7. **Fix routing** - explore cards → `/app/games/${id}` must work for ALL games with components