# ConsciousOS Database Documentation

> **Version:** 1.0  
> **Last Updated:** 2026-02-28  
> **Database:** PostgreSQL 15+ (via Supabase)  
> **Tables:** 42+  
> **Generated Types:** 65KB+ TypeScript definitions

---

## Table of Contents

1. [Database Overview](#1-database-overview)
2. [Schema Overview](#2-schema-overview)
3. [Table Definitions](#3-table-definitions)
4. [Relationships & Foreign Keys](#4-relationships--foreign-keys)
5. [Row Level Security (RLS) Policies](#5-row-level-security-rls-policies)
6. [Indexes & Performance](#6-indexes--performance)
7. [Migrations Strategy](#7-migrations-strategy)
8. [Type Safety](#8-type-safety)
9. [Real-time Subscriptions](#9-real-time-subscriptions)
10. [Backup & Recovery](#10-backup--recovery)

---

## 1. Database Overview

### 1.1 Technology Stack

ConsciousOS uses **Supabase** as its backend-as-a-service platform, built on **PostgreSQL** 15+ with powerful extensions for real-time functionality and vector search.

```
┌─────────────────────────────────────────────────────────────────┐
│                      Database Architecture                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│   │   PostgreSQL │◄───│   Supabase   │◄───│   Client SDK │     │
│   │   Database   │    │   Platform   │    │  (@supabase) │     │
│   └──────┬───────┘    └──────────────┘    └──────────────┘     │
│          │                                                       │
│          ▼                                                       │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                      Extensions                          │   │
│   │  • Realtime (WebSocket pub/sub)                         │   │
│   │  • PostgREST (Auto-generated REST API)                  │   │
│   │  • Storage (Object storage)                             │   │
│   │  • Auth (JWT-based authentication)                      │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Key Features

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Row Level Security** | Fine-grained access control per row | PostgreSQL RLS policies |
| **Real-time** | Live data synchronization | Supabase Realtime (WebSocket) |
| **Auto-generated API** | RESTful endpoints from schema | PostgREST |
| **Type Safety** | Auto-generated TypeScript types | `supabase gen types` |
| **Edge Functions** | Serverless TypeScript functions | Deno runtime |
| **Full-text Search** | Advanced text search capabilities | PostgreSQL tsvector |

### 1.3 Database Configuration

**Current Configuration:**
- **Project ID:** `ewwgxwuhtkmnajcmelqc`
- **URL:** `https://ewwgxwuhtkmnajcmelqc.supabase.co`
- **Region:** Auto-selected based on deployment
- **PostgreSQL Version:** 15.x

**Connection Strings:**
```bash
# Direct PostgreSQL connection (restricted)
postgresql://postgres:[password]@db.ewwgxwuhtkmnajcmelqc.supabase.co:5432/postgres

# Supabase client connection
VITE_SUPABASE_URL=https://ewwgxwuhtkmnajcmelqc.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

### 1.4 Schema Design Philosophy

The database schema follows these principles:

1. **User-centric data isolation** - Every user table has `user_id` foreign key to `auth.users`
2. **Soft deletes** - Historical data preserved via status flags
3. **Audit trails** - `created_at`, `updated_at` timestamps on all tables
4. **Referential integrity** - Foreign key constraints with proper ON DELETE actions
5. **Security by default** - All tables have RLS enabled with restrictive policies

---

## 2. Schema Overview

### 2.1 Table Categories

The 42+ tables are organized into logical categories:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Table Categories                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🧑‍💼 USER MANAGEMENT (5)                                        │
│  ├── profiles           # User profile data                     │
│  ├── user_roles         # Role-based access control             │
│  ├── user_capacities    # Consciousness capacity scores         │
│  ├── user_loops         # Pattern detection & integration       │
│  └── life_domains       # User's 8 life domains                 │
│                                                                  │
│  📚 REFERENCE DATA (5)                                          │
│  ├── domains            # Life domains (Work, Health, etc.)     │
│  ├── pillars            # 12 consciousness pillars              │
│  ├── traditions         # Spiritual traditions                  │
│  ├── practices          # Practice library                      │
│  └── wisdom_library     # Teachings & quotes                    │
│                                                                  │
│  📖 CURRICULUM (3)                                              │
│  ├── curriculum_modules # Learning modules                      │
│  ├── curriculum_lessons # Individual lessons                    │
│  └── user_curriculum_progress  # User progress tracking         │
│                                                                  │
│  💬 COMMUNICATION (2)                                           │
│  ├── chat_sessions      # Guru conversation sessions            │
│  └── chat_messages      # Individual messages                   │
│                                                                  │
│  📅 DAILY FLOW (5)                                              │
│  ├── daily_journeys     # Structured daily sessions             │
│  ├── adaptive_days      # Adaptive mode days                    │
│  ├── day_chains         # Block-based daily structure           │
│  ├── tasks              # Daily tasks & actions                 │
│  └── lesson_task_progress  # Task completion tracking           │
│                                                                  │
│  📝 JOURNALING (1)                                              │
│  └── journal_entries    # User journal entries                  │
│                                                                  │
│  🏆 PROGRESSION (8)                                             │
│  ├── practice_history   # Completed practices log               │
│  ├── user_achievements  # Unlocked achievements                 │
│  ├── user_favorites     # Saved practices                       │
│  ├── tradition_progress # Tradition exploration progress        │
│  ├── guru_memory        # AI memory/context                     │
│  ├── pattern_insights   # Detected patterns                     │
│  ├── capacity_history   # Capacity score history                │
│  └── v_level_history    # Vertical level progression            │
│                                                                  │
│  🎮 GAMIFICATION (2)                                            │
│  ├── xp_transactions    # XP awards log                         │
│  └── streak_history     # Daily streak tracking                 │
│                                                                  │
│  🚨 CRISIS MANAGEMENT (1)                                       │
│  └── crisis_events      # Crisis detection & handling           │
│                                                                  │
│  🔔 NOTIFICATIONS (4)                                           │
│  ├── notification_preferences  # User notification settings     │
│  ├── push_subscriptions        # Push notification tokens       │
│  ├── notification_logs         # Sent notification history      │
│  └── scheduled_sessions        # Upcoming scheduled sessions    │
│                                                                  │
│  🛡️ SECURITY & SYSTEM (6)                                       │
│  ├── rate_limits        # Rate limiting tracking                │
│  ├── engine_logs        # AI engine execution logs              │
│  ├── security_audit_log # Security event tracking               │
│  ├── data_export_requests      # GDPR export requests           │
│  ├── offline_sync_queue        # Offline sync queue             │
│  └── day_feedback              # User feedback on days          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 ENUM Types

Custom PostgreSQL ENUMs ensure data integrity:

```sql
-- Journey status progression
CREATE TYPE public.journey_status AS ENUM (
  'morning_pending',    -- Morning session not started
  'tasks_active',       -- Tasks in progress
  'evening_pending',    -- Evening reflection pending
  'practice_pending',   -- Practice session pending
  'completed'           -- Day fully completed
);

-- Task lifecycle
CREATE TYPE public.task_status AS ENUM (
  'pending',      -- Not started
  'in_progress',  -- Currently active
  'completed',    -- Done
  'skipped'       -- User skipped
);

-- Practice categories
CREATE TYPE public.practice_type AS ENUM (
  'meditation',
  'breathwork',
  'movement',
  'journaling'
);

-- Time-of-day segments
CREATE TYPE public.time_segment AS ENUM (
  'morning',      -- 5:00 - 11:59
  'afternoon',    -- 12:00 - 16:59
  'evening',      -- 17:00 - 20:59
  'night'         -- 21:00 - 4:59
);

-- Application roles
CREATE TYPE public.app_role AS ENUM (
  'admin',
  'moderator',
  'user'
);
```

---

## 3. Table Definitions

### 3.1 Core User Tables

#### profiles

The central user profile table, linked to Supabase Auth.

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  consciousness_level INTEGER NOT NULL DEFAULT 1,
  streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  streak_freezes INTEGER DEFAULT 3 CHECK (streak_freezes >= 0),
  curriculum_mode BOOLEAN NOT NULL DEFAULT false,
  adaptive_mode BOOLEAN DEFAULT false,
  journey_path TEXT DEFAULT 'structured',
  current_phase INTEGER DEFAULT 1,
  v_level INTEGER DEFAULT 1,
  v_level_name TEXT DEFAULT 'Awakening Seeker',
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  level_0_completed BOOLEAN DEFAULT false,
  level_start_date TIMESTAMPTZ,
  phase_2_started_at TIMESTAMPTZ,
  phase_4_graduated_at TIMESTAMPTZ,
  last_vlevel_check TIMESTAMPTZ,
  last_lesson_reminder TIMESTAMPTZ,
  assessment_answers JSONB,
  preferred_traditions JSONB,
  programming_awareness TEXT[],
  curriculum_readiness_score INTEGER,
  depth_understanding_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profiles_mode_exclusive CHECK (NOT (curriculum_mode = true AND adaptive_mode = true))
);
```

**Key Fields:**
- `xp` / `level` - Gamification progression (100 XP per level)
- `v_level` / `v_level_name` - Vertical consciousness level (1-12)
- `curriculum_mode` / `adaptive_mode` - User journey mode (mutually exclusive)
- `streak` / `streak_freezes` - Daily practice streak tracking

**RLS Policies:**
```sql
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### user_capacities

Stores the 12 consciousness capacity scores (0-10 scale).

```sql
CREATE TABLE public.user_capacities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  attention INTEGER DEFAULT 1,
  observation INTEGER DEFAULT 1,
  presence INTEGER DEFAULT 1,
  body_awareness INTEGER DEFAULT 1,
  emotional_mastery INTEGER DEFAULT 1,
  pattern_recognition INTEGER DEFAULT 1,
  self_inquiry INTEGER DEFAULT 1,
  disidentification INTEGER DEFAULT 1,
  shadow_integration INTEGER DEFAULT 1,
  equanimity INTEGER DEFAULT 1,
  surrender INTEGER DEFAULT 1,
  unification INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**The 12 Capacities:**
1. **Attention** - Ability to focus awareness
2. **Observation** - Witness consciousness
3. **Presence** - Being in the now
4. **Body Awareness** - Somatic sensitivity
5. **Emotional Mastery** - Emotional regulation
6. **Pattern Recognition** - Seeing unconscious patterns
7. **Self-Inquiry** - Questioning assumptions
8. **Disidentification** - Separation from ego
9. **Shadow Integration** - Owning projections
10. **Equanimity** - Non-reactive awareness
11. **Surrender** - Letting go of control
12. **Unification** - Non-dual awareness

**Auto-clamp Trigger:** Values automatically clamped to 0-10 range.

### 3.2 Daily Flow Tables

#### daily_journeys

Structured daily session tracking.

```sql
CREATE TABLE public.daily_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  morning_session_id UUID REFERENCES public.chat_sessions(id),
  evening_session_id UUID REFERENCES public.chat_sessions(id),
  status journey_status NOT NULL DEFAULT 'morning_pending',
  theme TEXT,
  mood TEXT,
  analysis JSONB,
  practice_type practice_type,
  practice_duration INTEGER,
  practice_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT daily_journeys_user_date_unique UNIQUE (user_id, date)
);
```

**Status Flow:**
```
morning_pending → tasks_active → evening_pending → practice_pending → completed
       ↓              ↓               ↓                  ↓
   Morning        Complete       Evening          Practice
   Session        Tasks          Session          Complete
```

#### adaptive_days

Adaptive mode day tracking with flexible structure.

```sql
CREATE TABLE public.adaptive_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  morning_mood TEXT,
  energy_level INTEGER,
  intention TEXT,
  time_available INTEGER,
  day_package JSONB,              -- AI-generated day structure
  completed_blocks JSONB DEFAULT '[]',
  capacity_changes JSONB DEFAULT '{}',
  evening_reflection JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT adaptive_days_user_date_unique UNIQUE (user_id, date)
);
```

#### tasks

Individual tasks linked to daily journeys.

```sql
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID NOT NULL REFERENCES public.daily_journeys(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES public.domains(id),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.curriculum_lessons(id),
  pillar_id UUID REFERENCES public.pillars(id),
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  xp_reward INTEGER NOT NULL DEFAULT 10,
  status task_status NOT NULL DEFAULT 'pending',
  time_segment time_segment NOT NULL DEFAULT 'morning',
  sequence_order INTEGER,
  chain_mode BOOLEAN DEFAULT false,
  is_current BOOLEAN DEFAULT false,
  ai_response TEXT,
  feedback TEXT,
  reflection TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3.3 Reference Tables

#### domains

The 8 life domains for holistic tracking.

```sql
CREATE TABLE public.domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default domains:
-- 1. Work & Career (work)
-- 2. Relationships (relationships)
-- 3. Health & Body (health)
-- 4. Mind & Learning (mind)
-- 5. Creativity (creativity)
-- 6. Spirit & Purpose (spirit)
-- 7. Environment (environment)
-- 8. Play & Recreation (play)
```

#### pillars

The 12 consciousness pillars.

```sql
CREATE TABLE public.pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sanskrit TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### curriculum_modules & curriculum_lessons

Structured learning content.

```sql
-- Modules (e.g., "Foundations of Awareness")
CREATE TABLE public.curriculum_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 14,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lessons within modules
CREATE TABLE public.curriculum_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.curriculum_modules(id),
  pillar_id UUID NOT NULL REFERENCES public.pillars(id),
  title TEXT NOT NULL,
  teaching_content TEXT NOT NULL,
  practice_instructions JSONB DEFAULT '[]',
  reflection_prompts JSONB DEFAULT '[]',
  tasks JSONB DEFAULT '[]',
  practice_duration_minutes INTEGER NOT NULL DEFAULT 15,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT curriculum_lessons_module_order_unique UNIQUE (module_id, order_index)
);
```

### 3.4 AI & Memory Tables

#### guru_memory

AI conversation memory and context.

```sql
CREATE TABLE public.guru_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL,      -- 'insight', 'breakthrough', 'pattern', etc.
  content TEXT NOT NULL,
  context JSONB,                  -- Additional context
  importance INTEGER DEFAULT 5,   -- 1-10 relevance score
  last_referenced TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### pattern_insights

Detected patterns from user behavior analysis.

```sql
CREATE TABLE public.pattern_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,     -- 'resistance', 'breakthrough', 'loop', etc.
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence JSONB,                 -- Supporting data
  confidence_score NUMERIC,       -- AI confidence 0-1
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.5 Security Tables

#### security_audit_log

Security event tracking (admin-only access).

```sql
CREATE TABLE public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type TEXT NOT NULL,
  event_details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  severity TEXT NOT NULL DEFAULT 'info',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**RLS Policy:**
```sql
CREATE POLICY "Only admins can view audit log" ON public.security_audit_log FOR SELECT 
USING (has_role('admin', auth.uid()));
```

#### rate_limits

Rate limiting tracking (service role only).

```sql
CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  function_name TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, function_name)
);
```

---

## 4. Relationships & Foreign Keys

### 4.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Entity Relationships                                 │
└─────────────────────────────────────────────────────────────────────────────┘

auth.users
    │
    ├──► profiles (1:1)
    │
    ├──► user_capacities (1:1)
    │
    ├──► user_roles (1:N)
    │
    ├──► user_loops (1:N)
    │
    ├──► life_domains (1:8)
    │
    ├──► notification_preferences (1:1)
    │
    ├──► daily_journeys (1:N)
    │       │
    │       ├──► tasks (1:N) ──► domains (N:1)
    │       │
    │       ├──► journal_entries (1:N)
    │       │
    │       └──► chat_sessions (1:2) ──► chat_messages (1:N)
    │
    ├──► adaptive_days (1:N)
    │
    ├──► day_chains (1:N)
    │
    ├──► practice_history (1:N) ──► practices (N:1)
    │
    ├──► user_achievements (1:N)
    │
    ├──► user_favorites (1:N) ──► practices (N:1)
    │
    ├──► user_curriculum_progress (1:1)
    │       │
    │       ├──► curriculum_modules (N:1)
    │       └──► curriculum_lessons (N:1)
    │
    ├──► lesson_task_progress (1:N) ──► curriculum_lessons (N:1)
    │
    ├──► tradition_progress (1:N) ──► traditions (N:1)
    │
    ├──► guru_memory (1:N)
    │
    ├──► pattern_insights (1:N)
    │
    ├──► capacity_history (1:N)
    │
    ├──► v_level_history (1:N)
    │
    ├──► streak_history (1:N)
    │
    ├──► xp_transactions (1:N)
    │
    ├──► crisis_events (1:N)
    │
    ├──► push_subscriptions (1:N)
    │
    ├──► notification_logs (1:N)
    │
    ├──► scheduled_sessions (1:N)
    │
    ├──► day_feedback (1:N)
    │
    ├──► data_export_requests (1:N)
    │
    └──► offline_sync_queue (1:N)

Reference Tables (no user relationship):
    ├── domains ──► tasks
    ├── pillars ──► curriculum_lessons, tasks, journal_entries
    ├── traditions ──► tradition_progress
    ├── practices ──► practice_history, user_favorites
    ├── wisdom_library ──► pillars
    ├── curriculum_modules ──► curriculum_lessons
    └── curriculum_lessons ──► lesson_task_progress, tasks
```

### 4.2 Foreign Key Constraints

| Parent Table | Child Table | Column | ON DELETE |
|--------------|-------------|--------|-----------|
| auth.users | profiles | user_id | CASCADE |
| auth.users | user_capacities | user_id | CASCADE |
| auth.users | daily_journeys | user_id | CASCADE |
| auth.users | adaptive_days | user_id | CASCADE |
| auth.users | tasks | user_id | CASCADE |
| auth.users | journal_entries | user_id | CASCADE |
| auth.users | chat_sessions | user_id | CASCADE |
| auth.users | chat_messages | user_id | CASCADE |
| auth.users | practice_history | user_id | CASCADE |
| auth.users | user_achievements | user_id | CASCADE |
| auth.users | user_favorites | user_id | CASCADE |
| auth.users | tradition_progress | user_id | CASCADE |
| auth.users | guru_memory | user_id | CASCADE |
| auth.users | pattern_insights | user_id | CASCADE |
| auth.users | capacity_history | user_id | CASCADE |
| auth.users | v_level_history | user_id | CASCADE |
| auth.users | streak_history | user_id | CASCADE |
| auth.users | xp_transactions | user_id | CASCADE |
| auth.users | crisis_events | user_id | CASCADE |
| auth.users | notification_preferences | user_id | CASCADE |
| auth.users | push_subscriptions | user_id | CASCADE |
| auth.users | notification_logs | user_id | CASCADE |
| auth.users | scheduled_sessions | user_id | CASCADE |
| auth.users | day_feedback | user_id | CASCADE |
| auth.users | offline_sync_queue | user_id | CASCADE |
| auth.users | data_export_requests | user_id | CASCADE |
| auth.users | user_curriculum_progress | user_id | CASCADE |
| auth.users | user_loops | user_id | CASCADE |
| auth.users | life_domains | user_id | CASCADE |
| auth.users | lesson_task_progress | user_id | CASCADE |
| auth.users | day_chains | user_id | CASCADE |
| auth.users | user_roles | user_id | CASCADE |
| domains | tasks | domain_id | RESTRICT |
| pillars | curriculum_lessons | pillar_id | RESTRICT |
| pillars | tasks | pillar_id | SET NULL |
| pillars | journal_entries | pillar_id | SET NULL |
| curriculum_modules | curriculum_lessons | module_id | CASCADE |
| curriculum_modules | user_curriculum_progress | current_module_id | SET NULL |
| curriculum_lessons | tasks | lesson_id | SET NULL |
| curriculum_lessons | lesson_task_progress | lesson_id | CASCADE |
| curriculum_lessons | user_curriculum_progress | current_lesson_id | SET NULL |
| practices | practice_history | practice_id | SET NULL |
| practices | user_favorites | practice_id | CASCADE |
| traditions | tradition_progress | tradition_id | CASCADE |
| daily_journeys | tasks | journey_id | CASCADE |
| daily_journeys | journal_entries | journey_id | SET NULL |
| daily_journeys | day_feedback | journey_id | SET NULL |
| daily_journeys | day_chains | journey_id | SET NULL |
| adaptive_days | day_feedback | adaptive_day_id | SET NULL |
| chat_sessions | daily_journeys | morning_session_id | SET NULL |
| chat_sessions | daily_journeys | evening_session_id | SET NULL |
| chat_sessions | chat_messages | session_id | CASCADE |

---

## 5. Row Level Security (RLS) Policies

### 5.1 Policy Overview

All 42+ tables have Row Level Security enabled with restrictive policies. The database follows a **deny-by-default** security model.

```sql
-- Enable RLS on a table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create restrictive policy
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);
```

### 5.2 Policy Patterns

#### Pattern 1: User Owns Data

Applied to most user-specific tables.

```sql
-- SELECT: Users can only see their own data
CREATE POLICY "Users can view own records" 
  ON public.tasks 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- INSERT: Users can only insert their own data
CREATE POLICY "Users can create own records" 
  ON public.tasks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own data
CREATE POLICY "Users can update own records" 
  ON public.tasks 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- DELETE: Users can only delete their own data
CREATE POLICY "Users can delete own records" 
  ON public.journal_entries 
  FOR DELETE 
  USING (auth.uid() = user_id);
```

#### Pattern 2: Authenticated Read-Only

Applied to reference tables (domains, pillars, practices, etc.).

```sql
CREATE POLICY "Reference data viewable by authenticated" 
  ON public.domains 
  FOR SELECT 
  TO authenticated 
  USING (true);
```

#### Pattern 3: Admin Only

Applied to security-sensitive tables.

```sql
-- Security audit log - admin only
CREATE POLICY "Only admins can view audit log" 
  ON public.security_audit_log 
  FOR SELECT 
  USING (has_role('admin', auth.uid()));
```

#### Pattern 4: Service Role Only

Applied to internal system tables.

```sql
-- Engine logs - service role only
CREATE POLICY "Service role can manage engine logs" 
  ON public.engine_logs 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Rate limits - service role only
CREATE POLICY "Service role can manage rate limits" 
  ON public.rate_limits 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);
```

### 5.3 RLS Policy Inventory

| Table | SELECT | INSERT | UPDATE | DELETE | Pattern |
|-------|--------|--------|--------|--------|---------|
| profiles | Own data | Own data | Own data | - | User owns |
| user_roles | Own data | - | - | - | User owns |
| domains | All auth | - | - | - | Auth read |
| pillars | All auth | - | - | - | Auth read |
| traditions | All auth | - | - | - | Auth read |
| practices | All auth | - | - | - | Auth read |
| wisdom_library | All auth | - | - | - | Auth read |
| curriculum_modules | All auth | - | - | - | Auth read |
| curriculum_lessons | All auth | - | - | - | Auth read |
| chat_sessions | Own data | Own data | - | - | User owns |
| chat_messages | Own data | Own data | - | - | User owns |
| daily_journeys | Own data | Own data | Own data | - | User owns |
| adaptive_days | Own data | Own data | Own data | - | User owns |
| day_chains | Own data | Own data | Own data | - | User owns |
| tasks | Own data | Own data | Own data | - | User owns |
| journal_entries | Own data | Own data | Own data | Own data | User owns |
| user_capacities | Own data | Own data | Own data | - | User owns |
| user_loops | Own data | Own data | Own data | Own data | User owns |
| life_domains | Own data | Own data | Own data | - | User owns |
| user_curriculum_progress | Own data | Own data | Own data | - | User owns |
| lesson_task_progress | Own data | Own data | Own data | - | User owns |
| practice_history | Own data | Own data | - | - | User owns |
| user_achievements | Own data | Own data | - | - | User owns |
| user_favorites | Own data | Own data | - | Own data | User owns |
| tradition_progress | Own data | Own data | Own data | - | User owns |
| guru_memory | Own data | Own data | Own data | - | User owns |
| pattern_insights | Own data | Own data | - | - | User owns |
| capacity_history | Own data | Own data | - | - | User owns |
| v_level_history | Own data | Own data | - | - | User owns |
| streak_history | Own data | Own data | - | - | User owns |
| xp_transactions | Own data | Own data | - | - | User owns |
| crisis_events | Own data | Own data | Own data | - | User owns |
| notification_preferences | Own data | Own data | Own data | - | User owns |
| push_subscriptions | Own data | Own data | Own data | Own data | User owns |
| notification_logs | Own data | Own data | Own data | - | User owns |
| scheduled_sessions | Own data | Own data | Own data | Own data | User owns |
| day_feedback | Own data | Own data | - | - | User owns |
| data_export_requests | Own data | Own data | - | - | User owns |
| offline_sync_queue | Own data | Own data | Own data | Own data | User owns |
| engine_logs | Service | Service | Service | Service | Service only |
| rate_limits | Service | Service | Service | Service | Service only |
| security_audit_log | Admin | Service | - | - | Admin only |

### 5.4 Security Considerations

⚠️ **CRITICAL:** Two tables require special handling:

1. **engine_logs** - Must be service_role only (information disclosure risk)
2. **rate_limits** - Must be service_role only (rate limit bypass risk)

If these have user-accessible policies, apply the security hardening migration immediately.

---

## 6. Indexes & Performance

### 6.1 Index Strategy

Indexes are optimized for the most common query patterns while balancing write performance.

```sql
-- Primary key lookups
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);

-- User-specific data queries
CREATE INDEX idx_tasks_user_journey ON public.tasks(user_id, journey_id);
CREATE INDEX idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX idx_practice_history_user_id ON public.practice_history(user_id);
CREATE INDEX idx_xp_transactions_user_id ON public.xp_transactions(user_id);
CREATE INDEX idx_pattern_insights_user_id ON public.pattern_insights(user_id);

-- Date-based queries
CREATE INDEX idx_daily_journeys_user_date ON public.daily_journeys(user_id, date);
CREATE INDEX idx_adaptive_days_user_date ON public.adaptive_days(user_id, date);
CREATE INDEX idx_streak_history_user_date ON public.streak_history(user_id, date);

-- AI/ML feature queries
CREATE INDEX idx_guru_memory_user_type ON public.guru_memory(user_id, memory_type);

-- Partial indexes for active records
CREATE INDEX idx_user_loops_user_active ON public.user_loops(user_id, integrated_at) 
  WHERE integrated_at IS NULL;
```

### 6.2 Index Reference

| Index Name | Table | Columns | Type | Purpose |
|------------|-------|---------|------|---------|
| idx_profiles_user_id | profiles | user_id | B-tree | User lookup |
| idx_chat_sessions_user_id | chat_sessions | user_id | B-tree | User's sessions |
| idx_chat_messages_session_id | chat_messages | session_id | B-tree | Session messages |
| idx_tasks_user_journey | tasks | user_id, journey_id | B-tree | Journey tasks |
| idx_journal_entries_user_id | journal_entries | user_id | B-tree | User entries |
| idx_practice_history_user_id | practice_history | user_id | B-tree | User history |
| idx_guru_memory_user_type | guru_memory | user_id, memory_type | B-tree | Memory queries |
| idx_pattern_insights_user_id | pattern_insights | user_id | B-tree | User insights |
| idx_xp_transactions_user_id | xp_transactions | user_id | B-tree | XP queries |
| idx_streak_history_user_date | streak_history | user_id, date | B-tree | Streak queries |
| idx_daily_journeys_user_date | daily_journeys | user_id, date | B-tree | Unique constraint |
| idx_adaptive_days_user_date | adaptive_days | user_id, date | B-tree | Unique constraint |
| idx_user_capacities_user_id | user_capacities | user_id | B-tree | User lookup |
| idx_user_loops_user_active | user_loops | user_id, integrated_at | B-tree | Active loops only |

### 6.3 Query Optimization Tips

**1. Always include user_id in WHERE clauses:**
```sql
-- Good - Uses index
SELECT * FROM tasks WHERE user_id = 'uuid' AND status = 'pending';

-- Bad - Sequential scan
SELECT * FROM tasks WHERE status = 'pending';
```

**2. Use date ranges for time-series queries:**
```sql
-- Good
SELECT * FROM daily_journeys 
WHERE user_id = 'uuid' 
AND date BETWEEN '2026-01-01' AND '2026-01-31';
```

**3. Limit JSONB queries to indexed paths:**
```sql
-- Good - Use containment operator
SELECT * FROM daily_journeys 
WHERE analysis @> '{"mood": "peaceful"}';

-- Bad - Sequential scan on JSONB
SELECT * FROM daily_journeys 
WHERE analysis->>'mood' = 'peaceful';
```

### 6.4 Performance Monitoring

Monitor query performance via Supabase Dashboard:
1. Go to **Database** → **Query Performance**
2. Identify slow queries (>100ms)
3. Check for missing indexes
4. Review query plans with `EXPLAIN ANALYZE`

---

## 7. Migrations Strategy

### 7.1 Migration Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    Migration Workflow                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Development                                              │
│     └── Create migration file in supabase/migrations/        │
│                                                              │
│  2. Local Testing                                            │
│     └── supabase db reset                                    │
│     └── supabase migration up                                │
│                                                              │
│  3. Code Review                                              │
│     └── Review SQL syntax                                    │
│     └── Check RLS policies                                   │
│     └── Verify rollback plan                                 │
│                                                              │
│  4. Staging Deployment                                       │
│     └── supabase db push                                     │
│     └── Run integration tests                                │
│                                                              │
│  5. Production Deployment                                    │
│     └── supabase db push --db-url <prod>                     │
│     └── Verify migration success                             │
│     └── Monitor for errors                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Migration File Naming

```
supabase/migrations/
├── 20260115000000_initial_schema.sql
├── 20260120000000_add_user_capacities.sql
├── 20260201000000_add_guru_memory.sql
├── 20260215000000_add_notification_preferences.sql
└── 20260227000000_security_hardening.sql
```

### 7.3 Common Migration Patterns

#### Adding a New Table

```sql
-- Migration: 20260228000000_add_new_feature.sql

-- Create table
CREATE TABLE public.new_feature (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.new_feature ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view own new_feature" 
  ON public.new_feature FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own new_feature" 
  ON public.new_feature FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own new_feature" 
  ON public.new_feature FOR UPDATE USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX idx_new_feature_user_id ON public.new_feature(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_new_feature_updated_at 
  BEFORE UPDATE ON public.new_feature 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Adding a Column

```sql
-- Add column with default
ALTER TABLE public.profiles 
ADD COLUMN new_field TEXT DEFAULT 'default_value';

-- Backfill existing rows
UPDATE public.profiles 
SET new_field = 'default_value' 
WHERE new_field IS NULL;

-- Make non-nullable
ALTER TABLE public.profiles 
ALTER COLUMN new_field SET NOT NULL;
```

#### Modifying RLS Policies

```sql
-- Drop old policy
DROP POLICY IF EXISTS "Old policy name" ON public.table_name;

-- Create new policy
CREATE POLICY "New policy name" 
  ON public.table_name 
  FOR SELECT 
  USING (new_condition);
```

### 7.4 CLI Commands

```bash
# Initialize Supabase project
supabase init

# Link to remote project
supabase link --project-ref ewwgxwuhtkmnajcmelqc

# Create new migration
supabase migration new add_feature_x

# Apply migrations locally
supabase db reset

# Push to remote
supabase db push

# Generate types after schema change
npm run db:types:generate

# Start local development
supabase start

# Stop local development
supabase stop
```

---

## 8. Type Safety

### 8.1 Type Generation Architecture

```
Supabase Database Schema
         ↓
   Supabase CLI (gen types)
         ↓
src/types/database-generated.ts
         ↓
    Re-exports in src/types/index.ts
         ↓
    Used in API layer & components
```

### 8.2 Generated Type Categories

The generated types include:

- **43 Table Definitions** - Row, Insert, and Update types
- **5 Enum Types** - journey_status, task_status, practice_type, time_segment, app_role
- **10 Database Functions** - Type signatures for stored procedures
- **Helper Types** - Tables, TablesInsert, TablesUpdate, Enums generics

### 8.3 Usage Examples

#### Row Type (SELECT)

```typescript
import type { Tables } from '@/types';

type ProfileRow = Tables<'profiles'>;
// Equivalent to: Database['public']['Tables']['profiles']['Row']

async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data; // Automatically typed as ProfileRow | null
}
```

#### Insert Type (INSERT)

```typescript
import type { TablesInsert } from '@/types';

type ProfileInsert = TablesInsert<'profiles'>;

async function createProfile(userId: string): Promise<ProfileRow> {
  const newProfile: ProfileInsert = {
    user_id: userId,
    display_name: null,
    xp: 0,
    level: 1,
    // ... TypeScript ensures all required fields
  };
  
  const { data } = await supabase
    .from('profiles')
    .insert(newProfile)
    .select()
    .single();
  return data;
}
```

#### Update Type (UPDATE)

```typescript
import type { TablesUpdate } from '@/types';

type ProfileUpdate = TablesUpdate<'profiles'>;

async function updateProfile(userId: string, updates: Partial<ProfileRow>) {
  const { data } = await supabase
    .from('profiles')
    .update(updates as TablesUpdate<'profiles'>)
    .eq('user_id', userId)
    .select()
    .single();
  return data;
}
```

#### Enum Types

```typescript
import type { Enums } from '@/types';

type JourneyStatus = Enums<'journey_status'>;
// Result: 'morning_pending' | 'tasks_active' | 'evening_pending' | 'practice_pending' | 'completed'

type TaskStatus = Enums<'task_status'>;
// Result: 'pending' | 'in_progress' | 'completed' | 'skipped'

// Type-safe status transitions
function updateTaskStatus(status: TaskStatus) {
  // Only valid statuses are allowed
}

updateTaskStatus('completed'); // ✓ Valid
updateTaskStatus('done');      // ✗ Type error
```

### 8.4 NPM Scripts

```bash
# Generate from local linked Supabase project
npm run db:types:generate

# Generate from remote project
npm run db:types:remote

# Watch for schema changes and auto-regenerate
npm run db:types:watch

# Link local project to Supabase
npm run supabase:link <project-ref>

# Check Supabase status
npm run supabase:status
```

### 8.5 When to Regenerate Types

**Regenerate when:**
- ✅ Adding new tables
- ✅ Modifying table columns
- ✅ Adding or changing enums
- ✅ Creating new relationships
- ✅ Adding stored functions

**No need to regenerate when:**
- ❌ Only changing data (rows)
- ❌ Modifying RLS policies
- ❌ Adding indexes
- ❌ Changing triggers (unless column-related)

---

## 9. Real-time Subscriptions

### 9.1 Real-time Architecture

ConsciousOS uses Supabase Realtime for live data synchronization across clients.

```
┌─────────────────────────────────────────────────────────────┐
│                    Real-time Architecture                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Client A                      Client B                     │
│   ┌─────────────┐               ┌─────────────┐             │
│   │  React App  │               │  React App  │             │
│   └──────┬──────┘               └──────┬──────┘             │
│          │                             │                    │
│          ▼                             ▼                    │
│   ┌─────────────┐               ┌─────────────┐             │
│   │   useRealtime   │               │   useRealtime   │             │
│   │    Hook     │               │    Hook     │             │
│   └──────┬──────┘               └──────┬──────┘             │
│          │                             │                    │
│          └───────────┬─────────────────┘                    │
│                      │                                       │
│                      ▼                                       │
│         ┌─────────────────────┐                             │
│         │   Supabase Realtime │                             │
│         │   (WebSocket)       │                             │
│         └──────────┬──────────┘                             │
│                    │                                         │
│                    ▼                                         │
│         ┌─────────────────────┐                             │
│         │   PostgreSQL        │                             │
│         │   (Database Changes)│                             │
│         └─────────────────────┘                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Database Change Subscriptions

Subscribe to table changes with real-time updates.

```typescript
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

function TaskList({ userId }: { userId: string }) {
  // Subscribe to tasks table changes
  useRealtimeUpdates({
    table: 'tasks',
    queryKey: ['tasks', userId],
    onChange: (payload) => {
      console.log('Change type:', payload.eventType);
      console.log('New data:', payload.new);
      console.log('Old data:', payload.old);
    },
  });

  return <TaskListView />;
}
```

### 9.3 Channel Patterns

#### User-Specific Channel

```typescript
// Subscribe to user's data changes
const channel = supabase
  .channel(`user:${userId}`)
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'tasks',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      console.log('Task changed:', payload);
    }
  )
  .subscribe();
```

#### Table-Wide Changes

```typescript
// Subscribe to all changes on a table
const channel = supabase
  .channel('table-changes')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages',
    },
    (payload) => {
      console.log('New message:', payload.new);
    }
  )
  .subscribe();
```

#### Presence Tracking

```typescript
import { usePresence } from '@/hooks/usePresence';

function OnlineUsers({ roomId, userId }: { roomId: string; userId: string }) {
  const { onlineUsers, count, updateStatus } = usePresence(
    `room:${roomId}`,
    userId,
    {
      initialPresence: { status: 'online' },
    }
  );

  return (
    <div>
      <p>{count} users online</p>
      <button onClick={() => updateStatus('busy')}>Set Busy</button>
    </div>
  );
}
```

### 9.4 Real-time Best Practices

**1. Always filter by user_id:**
```typescript
// Good - Filtered subscription
.on('postgres_changes', {
  event: '*',
  schema: 'public',
  table: 'tasks',
  filter: `user_id=eq.${userId}`,
})

// Bad - Unfiltered subscription (security risk)
.on('postgres_changes', {
  event: '*',
  schema: 'public',
  table: 'tasks',
})
```

**2. Clean up subscriptions:**
```typescript
useEffect(() => {
  const channel = supabase
    .channel('table-changes')
    .on('postgres_changes', { ... }, callback)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

**3. Handle connection errors:**
```typescript
const channel = supabase
  .channel('table-changes')
  .on('postgres_changes', { ... }, callback)
  .subscribe((status) => {
    if (status === 'SUBSCRIPTION_ERROR') {
      console.error('Real-time subscription failed');
      // Retry logic or fallback
    }
  });
```

### 9.5 Real-time Enabled Tables

| Table | Real-time | Use Case |
|-------|-----------|----------|
| chat_messages | ✅ | Live chat updates |
| tasks | ✅ | Task status changes |
| daily_journeys | ✅ | Journey progress sync |
| user_presence | ✅ | Online status |
| profiles | ⚠️ | Limited (XP updates) |
| user_capacities | ✅ | Capacity growth tracking |

---

## 10. Backup & Recovery

### 10.1 Backup Strategy

Supabase provides automated backups with point-in-time recovery (PITR) for Pro tier and above.

| Tier | Backups | Retention | PITR |
|------|---------|-----------|------|
| Free | Daily | 7 days | No |
| Pro | Daily | 28 days | Yes (up to 7 days) |
| Team | Daily | 28 days | Yes (up to 14 days) |
| Enterprise | Custom | Custom | Yes (custom) |

### 10.2 Manual Backups

```bash
# Using pg_dump (requires direct DB access)
pg_dump -h db.ewwgxwuhtkmnajcmelqc.supabase.co \
  -U postgres \
  -d postgres \
  -f backup_$(date +%Y%m%d).sql

# Restore from backup
psql -h db.ewwgxwuhtkmnajcmelqc.supabase.co \
  -U postgres \
  -d postgres \
  -f backup_20260228.sql
```

### 10.3 GDPR Data Export

Users can export all their data:

```sql
-- Export all user data
SELECT get_user_data_export('user-uuid-here');
```

This returns JSON containing:
- profile
- journal_entries
- tasks
- practice_history
- capacities
- loops
- achievements

### 10.4 Disaster Recovery

**Recovery Time Objectives (RTO):**
- Service restoration: < 4 hours
- Data restoration: < 24 hours

**Recovery Point Objectives (RPO):**
- Maximum data loss: 24 hours (last daily backup)
- With PITR: < 5 minutes

**Recovery Procedures:**

1. **Database Corruption:**
   ```bash
   # Restore from latest backup
   supabase db restore backup_20260228.sql
   ```

2. **Accidental Deletion:**
   ```sql
   -- Use PITR for point-in-time recovery
   -- Contact Supabase support for Pro/Team tiers
   ```

3. **Complete Infrastructure Failure:**
   - Provision new Supabase project
   - Restore from latest backup
   - Update application environment variables
   - Verify all services operational

### 10.5 Data Retention Policies

```sql
-- Automated cleanup (runs via cron)
CREATE OR REPLACE FUNCTION cleanup_old_records()
RETURNS void AS $$
DECLARE
  deleted_engine_logs INT;
  deleted_rate_limits INT;
  deleted_notification_logs INT;
BEGIN
  -- Clean engine logs (30 days)
  DELETE FROM engine_logs WHERE created_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS deleted_engine_logs = ROW_COUNT;
  
  -- Clean rate limits (1 day)
  DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 day';
  GET DIAGNOSTICS deleted_rate_limits = ROW_COUNT;
  
  -- Clean notification logs (90 days)
  DELETE FROM notification_logs WHERE sent_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS deleted_notification_logs = ROW_COUNT;
  
  -- Reset stuck tasks
  PERFORM reset_stuck_tasks();
  
  -- Log cleanup event
  INSERT INTO security_audit_log (event_type, event_details, severity)
  VALUES ('scheduled_cleanup', jsonb_build_object(
    'cleaned_at', NOW(),
    'engine_logs_deleted', deleted_engine_logs,
    'rate_limits_deleted', deleted_rate_limits,
    'notification_logs_deleted', deleted_notification_logs
  ), 'info');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Appendix A: Complete Table Reference

### A.1 Table Count by Category

| Category | Table Count | Row Estimate |
|----------|-------------|--------------|
| User Management | 5 | 1 per user |
| Reference Data | 5 | Fixed (~100) |
| Curriculum | 3 | Fixed (~200) |
| Communication | 2 | High volume |
| Daily Flow | 5 | 1-10 per user/day |
| Journaling | 1 | 1-5 per user/day |
| Progression | 8 | 10-100 per user |
| Gamification | 2 | 10-100 per user |
| Crisis Management | 1 | Rare |
| Notifications | 4 | High volume |
| Security & System | 6 | System managed |
| **TOTAL** | **42+** | - |

### A.2 Storage Estimates

| Table Type | Rows per User | Size per Row | Total per User |
|------------|---------------|--------------|----------------|
| Profile tables | 5 | 2 KB | 10 KB |
| Daily data | 365/year | 5 KB | 1.8 MB/year |
| Journal entries | 100/year | 10 KB | 1 MB/year |
| Chat messages | 1000/year | 2 KB | 2 MB/year |
| Practice history | 200/year | 1 KB | 200 KB/year |
| System logs | 1000/year | 500 B | 500 KB/year |
| **Estimated Total** | - | - | **~6 MB/year** |

---

## Appendix B: Environment Variables

### B.1 Required Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://ewwgxwuhtkmnajcmelqc.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIs...
VITE_SUPABASE_PROJECT_ID=ewwgxwuhtkmnajcmelqc

# AI Services (Edge Functions)
OPENROUTER_API_KEY=sk-or-v1-...

# Optional: Allowed Origins (CORS)
ALLOWED_ORIGINS=https://consciousos.app,https://www.consciousos.app
```

### B.2 Supabase Secrets

Set via Supabase Dashboard or CLI:

```bash
# Required for Edge Functions
supabase secrets set OPENROUTER_API_KEY=sk-or-v1-...
supabase secrets set ALLOWED_ORIGINS=https://consciousos.app
```

---

## Appendix C: Troubleshooting

### C.1 Common Issues

**"Permission denied" errors:**
- Check RLS policies are enabled
- Verify user is authenticated
- Check auth.uid() matches user_id column

**Slow queries:**
- Verify indexes exist
- Check query uses user_id filter
- Review with EXPLAIN ANALYZE

**Type errors:**
- Regenerate types: `npm run db:types:generate`
- Check import path: `@/types`
- Verify table name matches

**Migration failures:**
- Check SQL syntax
- Verify no data conflicts
- Review rollback plan

### C.2 Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Types Guide](../DATABASE_TYPES.md)
- [Migration Guide](../SUPABASE_MIGRATION_GUIDE.md)
- [Security Audit](../RLS_POLICY_AUDIT.md)

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-28  
**Maintained by:** ConsciousOS Engineering Team