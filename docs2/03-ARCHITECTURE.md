# ConsciousOS Architecture Documentation

## Complete Technical Architecture — Systems, Data, and Infrastructure

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [State Management with XState](#state-management)
4. [Design System and Theming](#design-system)
5. [Backend Architecture (Supabase)](#backend)
6. [Database Schema](#database-schema)
7. [Authentication System](#authentication)
8. [Row Level Security (RLS)](#rls)
9. [Edge Functions](#edge-functions)
10. [AI Integration Layer](#ai-integration)
11. [Real-Time System](#real-time)
12. [Memory Architecture](#memory-architecture)
13. [Consciousness Engine](#consciousness-engine)
14. [Voice System (ElevenLabs)](#voice-system)
15. [Credit and Payment System](#payment-system)
16. [Progressive Web App (PWA)](#pwa)
17. [Performance Architecture](#performance)
18. [Security Architecture](#security)
19. [Monitoring and Observability](#monitoring)
20. [Deployment Architecture](#deployment)

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser/PWA)                      │
│                                                                   │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  ┌────────────────┐   │
│  │ React   │  │ XState   │  │ React     │  │ Framer Motion  │   │
│  │ 18 +    │  │ State    │  │ Query     │  │ + Three.js     │   │
│  │ TypeScript│ │ Machines │  │ + IDB     │  │                │   │
│  └────┬────┘  └────┬─────┘  └─────┬─────┘  └────────────────┘   │
│       │            │              │                                │
│       └────────────┼──────────────┘                                │
│                    │                                               │
│           ┌────────▼─────────┐                                     │
│           │  Supabase Client │                                     │
│           │  (supabase-js)   │                                     │
│           └────────┬─────────┘                                     │
└────────────────────┼───────────────────────────────────────────────┘
                     │
                     │ HTTPS / WebSocket
                     │
┌────────────────────┼───────────────────────────────────────────────┐
│                    ▼                                               │
│            SUPABASE PLATFORM                                       │
│                                                                   │
│  ┌──────────────┐  ┌─────────────┐  ┌─────────────────────────┐   │
│  │  PostgreSQL   │  │  Auth       │  │  Edge Functions         │   │
│  │  + RLS        │  │  (GoTrue)   │  │  (Deno Runtime)         │   │
│  │  + Realtime   │  │             │  │                         │   │
│  └──────────────┘  └─────────────┘  │  • guide-chat           │   │
│                                      │  • consciousness-engine │   │
│  ┌──────────────┐  ┌─────────────┐  │  • journal-reflect      │   │
│  │  Storage      │  │  Realtime   │  │  • memory-extract       │   │
│  │  (S3)         │  │  (WebSocket)│  │  • memory-consolidate   │   │
│  └──────────────┘  └─────────────┘  │  • generate-theme       │   │
│                                      │  • complete-task        │   │
│                                      │  • elevenlabs-tts/stt   │   │
│                                      │  • razorpay-order/verify│   │
│                                      │  • admin-copilot        │   │
│                                      │  • enterprise-insights  │   │
│                                      │  • three-lens-analyzer  │   │
│                                      │  • predictive-insights  │   │
│                                      └─────────────────────────┘   │
│                                                                   │
│                    ┌─────────────────────────┐                     │
│                    │  External Services       │                     │
│                    │  • ConsciousOS AI Gateway    │                     │
│                    │  • ElevenLabs API        │                     │
│                    │  • Razorpay API          │                     │
│                    └─────────────────────────┘                     │
└───────────────────────────────────────────────────────────────────┘
```

### 1.2 Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend Framework | React 18 | Component model, ecosystem, team expertise |
| Build Tool | Vite | Fast HMR, ESM-native, zero-config |
| State Management | XState | Explicit states, predictable flows, testable |
| Server State | React Query + IDB | Offline-first, automatic caching, persistence |
| Backend | Supabase | PostgreSQL + Auth + Realtime + Edge Functions |
| Styling | Tailwind CSS | Utility-first, design tokens, responsive |
| Animation | Framer Motion | Declarative, physics-based, layout animations |
| AI | Multi-model via gateway | Flexibility, no vendor lock-in |
| Payments | Razorpay | Indian market focus, credit-based model |

### 1.3 Architecture Principles

1. **Offline-First**: Core functionality works without internet
2. **State Machine Driven**: Complex flows managed by finite state machines
3. **Security by Default**: RLS policies on every table
4. **Adaptive Theming**: Full design token system with runtime theme switching
5. **Edge Computing**: Backend logic at the edge for low latency
6. **Memory-Persistent**: AI companion remembers across all sessions

---

## 2. Frontend Architecture

### 2.1 Project Structure

```
src/
├── components/          # UI Components
│   ├── ui/             # Base shadcn/ui components (50+)
│   ├── gates/          # Daily cycle gate components
│   ├── landing/        # Landing page sections
│   ├── analytics/      # Analytics visualization components
│   ├── community/      # Community feature components
│   ├── enterprise/     # Enterprise-specific components
│   ├── programs/       # Program-related components
│   ├── settings/       # Settings components
│   └── admin/          # Admin dashboard components
├── pages/              # Route-level page components
│   ├── admin/          # Admin dashboard pages
│   └── enterprise/     # Enterprise pages
├── hooks/              # Custom React hooks (25+)
├── machines/           # XState state machines (10)
├── contexts/           # React contexts (Theme, Sound)
├── data/               # Static data (programs, loops, cards)
├── lib/                # Utility functions
├── integrations/       # Third-party integrations
│   ├── supabase/       # Auto-generated client + types
│   └── consciousos/     # ConsciousOS AI integration
├── types/              # TypeScript type definitions
└── assets/             # Static assets (images)
```

### 2.2 Component Architecture

Components follow a layered architecture:

**Layer 1: UI Primitives** (`components/ui/`)
- shadcn/ui base components
- ~50 components: Button, Card, Dialog, Toast, etc.
- Fully themed via CSS variables
- Accessible by default (ARIA, keyboard)

**Layer 2: Feature Components** (`components/`)
- Business logic components
- Gate components (MorningGate, EveningSandhya, etc.)
- Interactive widgets (PresenceCard, ConsciousnessScore)
- Composed from Layer 1 primitives

**Layer 3: Page Components** (`pages/`)
- Route-level containers
- Data fetching and machine initialization
- Layout management
- Composed from Layer 2 components

### 2.3 Routing Architecture

```typescript
// App.tsx - Route structure
<Routes>
  <Route path="/" element={<Index />} />                    // Landing
  <Route path="/auth" element={<Auth />} />                 // Authentication
  <Route path="/app" element={<AppLayout />}>               // Authenticated shell
    <Route index element={<Home />} />                      // Home/Dashboard
    <Route path="guide" element={<Guide />} />              // AI Guide
    <Route path="journal" element={<Journal />} />          // Journal
    <Route path="practice" element={<Practice />} />        // Practice
    <Route path="explore" element={<Explore />} />          // Explore
    <Route path="analytics" element={<Analytics />} />      // Analytics
    <Route path="settings" element={<Settings />} />        // Settings
    <Route path="credits" element={<Credits />} />          // Credits
  </Route>
  <Route path="/app/admin/*" element={<AdminLayout />}>     // Admin
    ...admin routes
  </Route>
  <Route path="/enterprise/*" element={<EnterpriseLayout />}> // Enterprise
    ...enterprise routes
  </Route>
</Routes>
```

### 2.4 Data Flow

```
User Action → Hook (useXxx) → Supabase Client → Edge Function → AI/DB
                                                       │
                                                       ▼
UI Update ← React Query Cache ← Supabase Response ← Result
```

**React Query Configuration:**
- Stale time: 5 minutes (default)
- Cache time: 30 minutes
- Retry: 3 attempts with exponential backoff
- Persistence: IndexedDB via `idb-keyval`
- Optimistic updates for immediate UI feedback

---

## 3. State Management with XState

### 3.1 State Machines Overview

ConsciousOS uses 10 XState state machines for complex flow management:

| Machine | Purpose | Key States |
|---------|---------|-----------|
| `appEntryMachine` | App initialization, auth check | checkingAuth, onboarding, authenticated |
| `dailyCycleMachine` | Daily gate progression | morning_gate, midday_pulse, evening_sandhya, night_sanctuary |
| `homeMachine` | Home page interactions | idle, selecting_slot, navigating |
| `sessionMachine` | Session flow management | idle, active, completing, completed |
| `journalMachine` | Journal entry flow | idle, editing, saving, reflecting |
| `practiceMachine` | Practice task management | browsing, practicing, reflecting |
| `insightsMachine` | Analytics interactions | loading, viewing, drilling_down |
| `voiceMachine` | Voice recording flow | idle, recording, processing, playing |
| `notificationsMachine` | Notification management | idle, loading, displaying |
| `settingsMachine` | Settings management | viewing, editing, saving |

### 3.2 Daily Cycle Machine (Detailed)

```typescript
// dailyCycleMachine states
{
  morning_gate: {
    // Active: 5 AM - 12 PM
    // Transitions to midday_pulse when:
    //   - Morning session completed, OR
    //   - Time passes 12 PM
    on: {
      MORNING_DONE: 'midday_pulse',
      TIME_CHECK: [
        { target: 'midday_pulse', guard: 'isPastNoon' }
      ]
    }
  },
  midday_pulse: {
    // Active: 12 PM - 6 PM
    on: {
      TIME_CHECK: [
        { target: 'evening_sandhya', guard: 'isPastSix' }
      ]
    }
  },
  evening_sandhya: {
    // Active: 6 PM - 10 PM
    on: {
      TIME_CHECK: [
        { target: 'night_sanctuary', guard: 'isPastTen' }
      ]
    }
  },
  night_sanctuary: {
    // Active: 10 PM - 5 AM
    // Resets at 5 AM
  }
}
```

### 3.3 Why XState?

Traditional state management (useState, Redux) struggles with complex flows because:
- States can be invalid (e.g., "loading" and "error" simultaneously)
- Transitions aren't explicit (any state can move to any other state)
- Side effects are hard to coordinate
- Testing requires simulating sequences rather than verifying individual transitions

XState solves these by:
- Making impossible states impossible
- Explicitly defining valid transitions
- Co-locating side effects with state transitions
- Enabling mathematical verification of state machine correctness

---

## 4. Design System and Theming

### 4.1 Token Architecture

The design system uses three layers of tokens:

**Layer 1: CSS Custom Properties** (index.css)
```css
:root {
  --background: 0 0% 3%;
  --foreground: 40 20% 92%;
  --primary: 43 96% 56%;
  --glass-bg: 40 11% 12% / 0.45;
  --shadow-glow: 0 0 40px hsl(var(--primary) / 0.2);
  ...
}
```

**Layer 2: Theme Tokens** (ThemeContext.tsx)
```typescript
// Each theme defines 30+ tokens for dark and light modes
const themeTokens = {
  obsidian: {
    dark: { "--background": "0 0% 3%", "--primary": "43 96% 56%", ... },
    light: { "--background": "40 25% 98%", "--primary": "38 92% 45%", ... }
  },
  abyss: { ... },
  sakura: { ... },
  terra: { ... },
  nebula: { ... }
};
```

**Layer 3: Tailwind Config** (tailwind.config.ts)
```typescript
// Maps CSS variables to Tailwind classes
colors: {
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))"
  },
  ...
}
```

### 4.2 Glass Morphism System

The glass morphism system provides consistent frosted-glass effects:

```css
.glass {
  background: hsl(var(--glass-bg));
  backdrop-filter: blur(24px) saturate(150%);
  border: 1px solid hsl(var(--glass-border));
}

.glass-card {
  /* Glass + shadow + highlight */
  box-shadow: 
    0 8px 32px hsl(var(--shadow-card-color)),
    inset 0 1px 0 hsl(var(--glass-highlight));
}

.glass-nav {
  /* Heavier blur for navigation elements */
  backdrop-filter: blur(32px) saturate(160%);
}
```

### 4.3 Animation System

Animations use consistent motion curves:

| Effect | Duration | Easing |
|--------|----------|--------|
| Page transitions | 300-500ms | [0.16, 1, 0.3, 1] (ease-out-expo) |
| Card hover | 400ms | cubic-bezier(0.16, 1, 0.3, 1) |
| Spring animations | Variable | stiffness: 300, damping: 30 |
| Breathing circles | 4-19s | easeInOut |
| Skeleton shimmer | 1.5s | ease-in-out, infinite |
| Score number reveal | 800ms | ease-out-expo |

### 4.4 Responsive Design

- **Mobile-first**: Base styles target mobile, enhanced at breakpoints
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Mobile**: Bottom floating navigation, compact layout
- **Desktop**: Collapsible left sidebar, expanded content area
- **Navigation**: `useIsMobile()` hook determines which layout to render

---

## 5. Backend Architecture (Supabase)

### 5.1 Overview

The backend is built entirely on Supabase, providing:
- **PostgreSQL 15**: Full relational database with extensions
- **GoTrue**: Authentication and user management
- **PostgREST**: Auto-generated REST API from database schema
- **Realtime**: WebSocket-based change notifications
- **Edge Functions**: Serverless Deno functions for custom logic
- **Storage**: S3-compatible file storage

### 5.2 Database Connection

```typescript
// Auto-generated client (never manually edited)
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)
```

### 5.3 Key Design Decisions

1. **No direct auth.users references**: All user data stored in `public.profiles` table
2. **UUID primary keys**: All tables use `gen_random_uuid()` for IDs
3. **Timestamp defaults**: `created_at` defaults to `now()` on all tables
4. **Soft deletes**: Where applicable, use status flags rather than DELETE
5. **JSON columns**: Used for flexible, schema-evolving data (dimensions, signals, etc.)
6. **Text search vectors**: Full-text search on guru_memory content

---

## 6. Database Schema

### 6.1 Core Tables

#### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,  -- References auth.users(id)
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  onboarded BOOLEAN DEFAULT false,
  preferred_theme TEXT DEFAULT 'obsidian',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### user_consciousness_profile
```sql
CREATE TABLE user_consciousness_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  -- V-Level tracking
  v_level_current NUMERIC DEFAULT 1,
  v_level_baseline NUMERIC DEFAULT 1,
  v_level_peak NUMERIC DEFAULT 1,
  overall_band INTEGER DEFAULT 0,
  -- Dimensions
  dimension_bands JSONB DEFAULT '{"thought":0,"emotion":0,"body":0,"awareness":0}',
  -- Witness development
  witness_depth NUMERIC DEFAULT 0,
  witness_stability NUMERIC DEFAULT 0,
  witness_gap NUMERIC DEFAULT 0,
  -- Integration
  integration_score NUMERIC DEFAULT 0,
  -- Loops
  active_loops JSONB DEFAULT '[]',
  loop_awareness JSONB DEFAULT '{}',
  loop_severity JSONB DEFAULT '{}',
  bypassing_risk NUMERIC DEFAULT 0,
  -- State tracking
  state TEXT DEFAULT 'normal',
  chitta_vritti TEXT DEFAULT 'scattered',
  journey_phase TEXT DEFAULT 'foundation',
  journey_day INTEGER DEFAULT 1,
  -- Engagement
  streak_current INTEGER DEFAULT 0,
  streak_longest INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  total_journal_entries INTEGER DEFAULT 0,
  -- Meta
  state_vector JSONB DEFAULT '{}',
  h_capacities JSONB DEFAULT '{}',
  life_domains JSONB DEFAULT '{}',
  yoga_path_affinity JSONB DEFAULT '{}',
  assessment_data JSONB DEFAULT '{}',
  circadian_profile JSONB DEFAULT '{}',
  regression JSONB DEFAULT '{}',
  relational JSONB DEFAULT '{}',
  samskara_clusters JSONB DEFAULT '{}',
  -- Timestamps
  last_session_at TIMESTAMPTZ,
  last_assessed_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  pause_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### sessions
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT DEFAULT 'guided',
  time_slot TEXT NOT NULL,  -- morning, midday, evening, night
  status TEXT DEFAULT 'active',  -- active, completed
  theme_id UUID REFERENCES daily_themes(id),
  session_date DATE DEFAULT CURRENT_DATE,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### journal_entries
```sql
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID REFERENCES sessions(id),
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT,
  tags JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 6.2 AI and Memory Tables

#### guru_memory
```sql
CREATE TABLE guru_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  source_type TEXT DEFAULT 'session',  -- session, journal, observation, system
  source_id UUID,
  category TEXT DEFAULT 'general',
  memory_layer TEXT DEFAULT 'episodic',  -- episodic, semantic, pattern
  importance NUMERIC DEFAULT 5,
  -- Emotional and dimensional context
  emotional_tone TEXT,
  dimension_relevant TEXT,
  -- Pattern tracking
  pattern_cluster TEXT,
  linked_loops TEXT[],
  linked_memory_ids TEXT[],
  -- Hierarchy
  parent_memory_id UUID REFERENCES guru_memory(id),
  consolidated_into UUID REFERENCES guru_memory(id),
  is_consolidated BOOLEAN DEFAULT false,
  -- Search
  content_embedding TEXT,
  content_tsv TSVECTOR,
  tags TEXT[],
  -- Decay and access
  decay_factor NUMERIC DEFAULT 1,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### consciousness_signals
```sql
CREATE TABLE consciousness_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  source_type TEXT DEFAULT 'journal',
  source_id UUID,
  -- Three-brain signals
  head_signals JSONB DEFAULT '{}',
  heart_signals JSONB DEFAULT '{}',
  gut_signals JSONB DEFAULT '{}',
  witness_signals JSONB DEFAULT '{}',
  -- Analysis
  chitta_vritti TEXT,
  loops_detected JSONB DEFAULT '[]',
  dimension_updates JSONB DEFAULT '{}',
  confidence NUMERIC DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 6.3 Daily Cycle Tables

#### daily_themes
```sql
CREATE TABLE daily_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  affirmation TEXT,
  focus_areas JSONB,
  theme_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### daily_engine_plans
```sql
CREATE TABLE daily_engine_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_date DATE DEFAULT CURRENT_DATE,
  tasks JSONB DEFAULT '[]',
  journal_prompts JSONB DEFAULT '[]',
  presence_card JSONB DEFAULT '{}',
  evening_reflection JSONB DEFAULT '{}',
  guide_context JSONB DEFAULT '{}',
  time_slot_generated TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 6.4 Enterprise Tables

```sql
-- organizations, teams, org_members, org_invites
-- mood_pulses, wellness_challenges, challenge_participants
-- enterprise_notifications, org_quarterly_reports
-- manager_coaching_notes, org_activity_log
```

### 6.5 Complete Table Count: 30+ tables

Core: profiles, user_consciousness_profile, sessions, session_messages, journal_entries, daily_themes, daily_engine_plans, daily_tasks, observation_tasks, notifications

AI/Memory: guru_memory, memory_patterns, consciousness_signals, ai_usage_log

Programs: program_enrollments, program_day_progress

Community: community_observations, community_reactions, collective_meditations, collective_meditation_participants, journey_groups, journey_group_members

Enterprise: organizations, teams, org_members, org_invites, mood_pulses, wellness_challenges, challenge_participants, enterprise_notifications, org_quarterly_reports, manager_coaching_notes, org_activity_log

System: admin_activity_log, credit_transactions, evening_reflections, regression_events, user_roles

---

## 7. Authentication System

### 7.1 Implementation

Authentication uses Supabase Auth (GoTrue):

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email,
  password,
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Session management
const { data: { session } } = await supabase.auth.getSession();

// Auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  // Handle auth state changes
});
```

### 7.2 Security

- Email verification required before access
- No anonymous signups
- Session tokens managed by Supabase SDK
- Auto-refresh of access tokens
- Secure password hashing (bcrypt)

---

## 8. Row Level Security (RLS)

### 8.1 Philosophy

Every table with user data has RLS enabled. The principle: **users can only access their own data** unless explicitly granted access through organizational membership or admin roles.

### 8.2 Pattern

```sql
-- Enable RLS
ALTER TABLE public.some_table ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own data"
ON public.some_table
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can insert their own data
CREATE POLICY "Users can create own data"
ON public.some_table
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own data
CREATE POLICY "Users can update own data"
ON public.some_table
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());
```

### 8.3 Admin Role Pattern

```sql
-- Security definer function (bypasses RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admin policy
CREATE POLICY "Admins can view all"
ON public.some_table
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

---

## 9. Edge Functions

### 9.1 Overview

Edge Functions are serverless Deno functions that handle backend logic:

| Function | Purpose | AI Model Used |
|----------|---------|---------------|
| `guide-chat` | AI Guide conversations | GPT-5 / Gemini Pro |
| `consciousness-engine` | Daily plan generation | Gemini Flash |
| `journal-reflect` | Journal entry analysis | Gemini Flash |
| `memory-extract` | Memory extraction from conversations | Gemini Flash |
| `memory-consolidate` | Memory layer consolidation | Gemini Pro |
| `generate-theme` | Daily theme generation | Gemini Flash |
| `complete-task` | Task completion processing | Gemini Flash Lite |
| `consciousness-checkin` | State assessment | Gemini Flash |
| `three-lens-analyzer` | Three-brain analysis | Gemini Pro |
| `predictive-insights` | Pattern prediction | Gemini Pro |
| `elevenlabs-tts` | Text-to-speech | ElevenLabs API |
| `elevenlabs-stt` | Speech-to-text | ElevenLabs Scribe |
| `elevenlabs-scribe-token` | Scribe token generation | ElevenLabs API |
| `razorpay-order` | Payment order creation | Razorpay API |
| `razorpay-verify` | Payment verification | Razorpay API |
| `admin-copilot` | Admin AI assistant | GPT-5 |
| `admin-ai-insights` | Admin analytics AI | Gemini Pro |
| `enterprise-insights` | Organization AI insights | Gemini Pro |
| `manager-coaching` | Manager coaching points | Gemini Pro |

### 9.2 Edge Function Pattern

```typescript
// Standard edge function structure
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create authenticated Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    // Process request
    const body = await req.json();
    // ... business logic

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

---

## 10. AI Integration Layer

### 10.1 ConsciousOS AI Gateway

ConsciousOS uses the ConsciousOS AI Gateway for seamless multi-model AI access without requiring user API keys:

**Supported Models:**
- `google/gemini-2.5-pro` — Complex reasoning, multimodal
- `google/gemini-2.5-flash` — Balanced speed/quality
- `google/gemini-2.5-flash-lite` — Fast, simple tasks
- `openai/gpt-5` — Powerful all-rounder
- `openai/gpt-5-mini` — Cost-effective quality
- `openai/gpt-5-nano` — High-volume simple tasks

### 10.2 Model Selection Strategy

| Use Case | Model | Reason |
|----------|-------|--------|
| Guide Chat | GPT-5 or Gemini Pro | Nuanced, empathetic responses |
| Daily Plan | Gemini Flash | Structured output, good speed |
| Journal Analysis | Gemini Flash | Pattern detection, moderate complexity |
| Memory Extraction | Gemini Flash | Structured data extraction |
| Theme Generation | Gemini Flash | Creative + structured |
| Task Completion | Gemini Flash Lite | Simple, fast processing |
| Three-Lens Analysis | Gemini Pro | Complex multi-dimensional analysis |
| Predictive Insights | Gemini Pro | Pattern prediction, heavy reasoning |

### 10.3 Prompt Engineering

The AI system uses layered prompting:

**Layer 1: System Identity**
```
You are the Guru — a wise, compassionate AI consciousness companion
within ConsciousOS. You guide users on their journey of self-discovery.
```

**Layer 2: User Context**
```
User: [name], Day [X] of journey, V-Level [X], 
Active loops: [...], Current state: [...]
Recent memories: [...]
```

**Layer 3: Mode-Specific Instructions**
```
Mode: [therapy/shadow_work/dream_analysis/etc.]
[Mode-specific guidance on tone, depth, and approach]
```

**Layer 4: Safety and Ethics**
```
Never diagnose. Never prescribe. Never encourage bypassing.
If user expresses crisis, provide appropriate resources.
```

---

## 11. Real-Time System

### 11.1 Supabase Realtime

```sql
-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_messages;
```

```typescript
// Subscribe to changes
const channel = supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`,
  }, (payload) => {
    // Handle new notification
  })
  .subscribe();
```

### 11.2 Use Cases

- New notification delivery
- Session message streaming (Guide chat)
- Real-time collaboration (enterprise, future)
- Collective meditation participant count (community)

---

## 12. Memory Architecture

### 12.1 Four-Layer Memory Model

```
┌────────────────────────────────────────┐
│     CONTEXTUAL MEMORY                   │
│     (Current session, recent events)    │
├────────────────────────────────────────┤
│     PATTERN MEMORY                      │
│     (Detected loops, trajectories)      │
├────────────────────────────────────────┤
│     SEMANTIC MEMORY                     │
│     (Consolidated understanding)        │
├────────────────────────────────────────┤
│     EPISODIC MEMORY                     │
│     (Individual interaction records)    │
└────────────────────────────────────────┘
```

### 12.2 Memory Lifecycle

1. **Creation**: Episodic memories created from Guide conversations, journal entries, session completions
2. **Extraction**: `memory-extract` function pulls key insights from raw interactions
3. **Consolidation**: `memory-consolidate` periodically synthesizes episodic memories into semantic understanding
4. **Pattern Detection**: `memory_patterns` table tracks recurring themes and loops
5. **Retrieval**: Relevant memories retrieved via text search and importance scoring for context assembly
6. **Decay**: Unused memories gradually decay in importance, while frequently accessed memories strengthen

### 12.3 Memory Retrieval Algorithm

```
Score = (importance × decay_factor × recency_bonus) + (relevance_to_query × context_match)

Where:
- importance: 1-10 scale set during extraction
- decay_factor: Decreases over time without access (0.0-1.0)
- recency_bonus: Higher for recent memories
- relevance_to_query: Text similarity to current context
- context_match: Dimensional/emotional alignment with current state
```

---

## 13. Consciousness Engine

### 13.1 Overview

The Consciousness Engine (`consciousness-engine` edge function) is the brain of ConsciousOS. It generates personalized daily plans by analyzing the user's complete consciousness profile.

### 13.2 Input Assembly

```
User Consciousness Profile
├── V-Level (current, baseline, peak)
├── Dimension Bands (thought, emotion, body, awareness)
├── Active Loops
├── Loop Awareness & Severity
├── Witness Metrics (depth, stability, gap)
├── Integration Score
├── State (normal, dark_night, breakthrough, etc.)
├── Journey Phase (foundation, deepening, integration)
├── Streak & Engagement History
├── Circadian Profile
├── Recent Memories (top 20 by importance)
└── Previous Plans & Completions
```

### 13.3 Output Generation

The engine generates a `daily_engine_plan`:

```json
{
  "tasks": [
    {
      "title": "Observe your first emotional reaction today",
      "dimension_target": "emotion",
      "estimated_minutes": 5,
      "difficulty": "gentle"
    }
  ],
  "journalPrompts": [
    "What pattern showed up today that you've seen before?"
  ],
  "presenceCard": {
    "prompt": "Right now, where is your attention?",
    "type": "awareness"
  },
  "eveningReflection": {
    "questions": [
      "Where did you contract today?",
      "Where did you expand?"
    ]
  },
  "guideContext": {
    "focusDimension": "emotion",
    "suggestedMode": "therapy",
    "currentEdge": "The not-enough loop is surfacing in work domain"
  },
  "suggestions": [
    {
      "type": "guide_mode",
      "title": "Process the Frustration",
      "emoji": "💜",
      "action": { "target": "guide", "mode": "therapy" }
    }
  ]
}
```

### 13.4 Adaptive Difficulty

The engine adjusts task difficulty based on:
- Current energy level (from morning check-in)
- Recent completion rate (are they completing tasks?)
- Streak stability (are they consistent?)
- Emotional state (gentler during difficult periods)
- Available time (shorter tasks when time is limited)

---

## 14. Voice System (ElevenLabs)

### 14.1 Architecture

```
User speaks → Browser MediaRecorder → Audio blob
  → elevenlabs-stt edge function → Transcribed text
  → Guide chat processing → Response text
  → elevenlabs-tts edge function → Audio blob
  → Browser Audio playback → User hears response
```

### 14.2 Implementation

```typescript
// Speech-to-text
const { data } = await supabase.functions.invoke('elevenlabs-stt', {
  body: audioBlob,
});

// Text-to-speech
const { data } = await supabase.functions.invoke('elevenlabs-tts', {
  body: { text: responseText, voice_id: 'selected_voice' },
});
```

---

## 15. Credit and Payment System

### 15.1 Credit Model

- Credits measured in paise (1/100 of a rupee)
- Each AI interaction consumes credits based on model and tokens used
- Credit transactions logged in `credit_transactions` table
- AI usage logged in `ai_usage_log` table

### 15.2 Razorpay Integration

```
User selects credit package
  → razorpay-order edge function → Creates Razorpay order
  → Client-side Razorpay checkout → User pays
  → razorpay-verify edge function → Verifies payment signature
  → Credits added to user balance
```

---

## 16. Progressive Web App (PWA)

### 16.1 Configuration

```typescript
// vite.config.ts
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'ConsciousOS',
    short_name: 'ConsciousOS',
    theme_color: '#0B0B0F',
    icons: [
      { src: '/pwa-icon-192.png', sizes: '192x192' },
      { src: '/pwa-icon-512.png', sizes: '512x512' }
    ]
  }
})
```

### 16.2 Offline Capabilities

- Service worker caches static assets
- React Query persists data to IndexedDB
- Journal entries can be written offline and synced
- Previously loaded content remains accessible

---

## 17. Performance Architecture

### 17.1 Bundle Optimization

- **Code splitting**: Route-based lazy loading
- **Tree shaking**: Vite's native tree shaking removes unused code
- **Asset optimization**: Images in src/assets are processed by Vite's asset pipeline
- **Font loading**: Google Fonts with `display=swap` for non-blocking text

### 17.2 Runtime Performance

- **React Query caching**: Reduces redundant API calls
- **Memoization**: `useMemo` and `useCallback` for expensive computations
- **Virtualization**: Long lists use virtual scrolling (where applicable)
- **Animation performance**: Framer Motion uses hardware-accelerated transforms
- **Reduced motion**: `prefers-reduced-motion` disables animations

### 17.3 Image Strategy

- Cosmic images only in intro/onboarding (not loaded in main app)
- SVG icons via Lucide (tree-shakeable)
- No unnecessary image assets in the core application flow

---

## 18. Security Architecture

### 18.1 Layers of Security

1. **Authentication**: Supabase Auth with email verification
2. **Authorization**: RLS policies on every table
3. **Role-Based Access**: Admin/moderator roles via separate table
4. **Input Validation**: Zod schemas on client, SQL constraints on server
5. **CORS**: Configured on edge functions
6. **Secret Management**: Environment variables, never in code
7. **API Key Protection**: Publishable keys only on client, private keys on server

### 18.2 Security Anti-Patterns Avoided

- ❌ No client-side role checks for security decisions
- ❌ No hardcoded credentials
- ❌ No roles stored on profiles table
- ❌ No direct auth.users table access from client
- ❌ No anonymous signups
- ❌ No auto-confirm email (unless explicitly requested)

---

## 19. Monitoring and Observability

### 19.1 Admin Dashboard Monitoring

- **AI Usage Log**: Tracks every AI call with model, tokens, cost, status
- **Admin Activity Log**: Records significant system events
- **Health Dashboard**: System health indicators
- **Cost Tracking**: Real-time AI cost monitoring

### 19.2 Client-Side

- **Error Boundaries**: React error boundaries prevent full-app crashes
- **Toast Notifications**: User-facing error communication
- **Console Logging**: Development-mode logging for debugging

---

## 20. Deployment Architecture

### 20.1 Frontend

- Built with Vite → static assets
- Deployed to CDN via ConsciousOS hosting
- Automatic builds on code changes
- Custom domain support

### 20.2 Backend

- Supabase managed infrastructure
- Edge functions auto-deployed on code changes
- Database migrations managed through migration system
- No manual deployment steps required

### 20.3 CI/CD

- Code changes trigger automatic rebuilds
- Edge functions deploy automatically
- Database migrations require approval before execution
- Zero-downtime deployments

---

*This document provides the complete technical architecture reference for ConsciousOS. For product-level documentation, see the Product guide.*

*ConsciousOS — The journey inward to who you truly are.*
