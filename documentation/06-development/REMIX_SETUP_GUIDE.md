# SoulScape Remix Setup Guide

This document contains everything needed to set up a fresh remix of the SoulScape project. During a remix, all Cloud/Supabase data is lost - this guide helps you recreate it.

---

## Table of Contents

1. [Secrets Required](#secrets-required)
2. [Database Schema](#database-schema)
3. [Edge Functions](#edge-functions)
4. [Auth Configuration](#auth-configuration)
5. [Seed Data](#seed-data)
6. [Post-Setup Checklist](#post-setup-checklist)

---

## Secrets Required

After remix, you need to configure these secrets in **Settings → Secrets**:

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `ELEVENLABS_API_KEY` | ElevenLabs API for voice features | Optional - voice features only |
| `VAPID_PUBLIC_KEY` | Web Push VAPID public key | Optional - push notifications only |
| `VAPID_PRIVATE_KEY` | Web Push VAPID private key | Optional - push notifications only |
| `CONSCIOUSOS_API_KEY` | Auto-configured by ConsciousOS Cloud | Auto-managed |

### Generating VAPID Keys

If you need push notifications, generate VAPID keys:
```bash
npx web-push generate-vapid-keys
```

---

## Database Schema

The complete database schema is defined in `src/integrations/supabase/types.ts` and migration files.

### Tables Overview (35 tables)

#### Core User Tables
| Table | Purpose |
|-------|---------|
| `profiles` | User profile, XP, level, streak, mode settings |
| `user_roles` | Admin/moderator/user roles |
| `user_capacities` | 12 capacity scores (0-10 scale) |
| `user_loops` | Active psychological loops per user |
| `user_achievements` | Unlocked achievements |
| `user_favorites` | Favorited practices |
| `user_curriculum_progress` | Lesson/module progress |

#### Daily Activity Tables
| Table | Purpose |
|-------|---------|
| `daily_journeys` | Structured mode daily journey |
| `adaptive_days` | Adaptive mode daily data |
| `day_chains` | Structured mode block sequences |
| `tasks` | Daily tasks (AI-generated) |
| `journal_entries` | User journal entries |

#### Reference/Content Tables
| Table | Purpose |
|-------|---------|
| `domains` | 10 life domains (Body, Mind, etc.) |
| `pillars` | 4 teaching pillars |
| `traditions` | Spiritual traditions |
| `practices` | Practice library |
| `wisdom_library` | Quotes and teachings |
| `curriculum_modules` | 4 learning modules |
| `curriculum_lessons` | Lessons within modules |

#### AI & System Tables
| Table | Purpose |
|-------|---------|
| `chat_sessions` | AI conversation sessions |
| `chat_messages` | Messages within sessions |
| `guru_memory` | AI memory/context storage |
| `pattern_insights` | AI-detected patterns |

#### Tracking Tables
| Table | Purpose |
|-------|---------|
| `capacity_history` | Capacity change history |
| `v_level_history` | V-Level progression history |
| `streak_history` | Streak actions log |
| `xp_transactions` | XP awards log |
| `practice_history` | Completed practices |
| `lesson_task_progress` | Task completion in lessons |

#### System Tables
| Table | Purpose |
|-------|---------|
| `rate_limits` | API rate limiting |
| `engine_logs` | AI engine execution logs |
| `notification_logs` | Sent notifications |
| `notification_preferences` | User notification settings |
| `push_subscriptions` | Web push subscriptions |
| `scheduled_sessions` | Scheduled practice sessions |
| `crisis_events` | Crisis detection events |
| `security_audit_log` | Security events |
| `data_export_requests` | GDPR export requests |
| `day_feedback` | User feedback |
| `life_domains` | User's life domain data |
| `tradition_progress` | User's tradition progress |
| `offline_sync_queue` | Offline data sync queue |

### Enums

```sql
-- Journey status
CREATE TYPE journey_status AS ENUM (
  'morning_pending', 'tasks_active', 'evening_pending', 
  'practice_pending', 'completed'
);

-- Task status  
CREATE TYPE task_status AS ENUM (
  'pending', 'in_progress', 'completed', 'skipped'
);

-- Practice type
CREATE TYPE practice_type AS ENUM (
  'meditation', 'breathwork', 'movement', 'journaling'
);

-- Time segment
CREATE TYPE time_segment AS ENUM (
  'morning', 'afternoon', 'evening', 'night'
);

-- User role
CREATE TYPE app_role AS ENUM (
  'admin', 'moderator', 'user'
);
```

### Key Database Functions

```sql
-- Level calculation from XP
calculate_level_from_xp(xp_amount: number) → number

-- Rate limiting check
check_rate_limit(function_name, max_requests?, user_id, window_minutes?) → boolean

-- Cleanup old records (30-day retention)
cleanup_old_records() → void

-- Reset stuck tasks (24h timeout)
reset_stuck_tasks() → void

-- Initialize life domains for new user
initialize_life_domains(user_id) → void

-- GDPR data export
get_user_data_export(user_id) → JSON

-- Role check
has_role(role, user_id) → boolean
```

### Key Constraints

```sql
-- Exclusive mode (can't be in both modes)
CHECK (NOT (curriculum_mode = true AND adaptive_mode = true))

-- Non-negative streak freezes
CHECK (streak_freezes >= 0)

-- Unique user+date for daily records
UNIQUE (user_id, date) ON adaptive_days, daily_journeys

-- Unique lesson ordering within modules
UNIQUE (module_id, order_index) ON curriculum_lessons

-- Unique user+loop_type (prevent duplicate loops)
UNIQUE (user_id, loop_type) ON user_loops
```

### Key Triggers

```sql
-- Clamp capacity values to 0-10
clamp_capacities_trigger ON user_capacities

-- Auto-update updated_at timestamps
update_*_updated_at ON most tables

-- Profile auto-creation on user signup
handle_new_user ON auth.users
```

---

## Edge Functions

35 edge functions in `supabase/functions/`:

### AI/Generation Functions
| Function | Purpose | Rate Limited |
|----------|---------|--------------|
| `adaptive-generate-day` | Generate adaptive day package | Yes |
| `adapt-day-realtime` | Real-time day adaptation | Yes |
| `chat` | Guru AI chat | Yes |
| `analyze-patterns` | Detect behavioral patterns | Yes |
| `analyze-shadow` | Shadow work analysis | Yes |
| `analyze-day` | Daily analysis | Yes |
| `detect-loops` | Psychological loop detection | Yes |
| `detect-capacity-markers` | Capacity growth markers | Yes |
| `detect-vlevel-markers` | V-Level progression markers | Yes |
| `assess-awareness-level` | Awareness assessment | Yes |
| `capacity-growth-engine` | Growth recommendations | Yes |
| `domain-balance-engine` | Domain balance analysis | Yes |
| `loop-dissolution` | Loop dissolution guidance | Yes |
| `regression-engine` | Regression detection | Yes |

### Task/Day Functions
| Function | Purpose | Rate Limited |
|----------|---------|--------------|
| `orchestrate-day` | Structured mode day generation | Yes |
| `generate-tasks` | Task generation | Yes |
| `generate-next-task` | Next task generation | Yes |
| `complete-lesson` | Lesson completion | Yes |
| `decide-next-action` | AI decision for next action | Yes |
| `presence-ping` | Presence check | Yes |
| `adaptive-afternoon-ping` | Afternoon energy check | Yes |

### Session/Memory Functions
| Function | Purpose | Rate Limited |
|----------|---------|--------------|
| `session-chain-engine` | Link evening→morning sessions | Yes |
| `ai-memory-context` | AI memory retrieval | Yes |
| `predict-day` | Next day prediction | Yes |
| `get-tomorrow-glimpse` | Tomorrow preview | Yes |
| `get-night-mode` | Night mode check | Yes |

### Notification Functions
| Function | Purpose | Rate Limited |
|----------|---------|--------------|
| `schedule-notifications` | Cron-triggered scheduling | N/A (cron) |
| `send-push-notification` | Send web push | Yes |
| `smart-notifications` | Intelligent notification timing | Yes |
| `streak-guardian` | Streak protection | Yes |

### Voice/TTS Functions
| Function | Purpose | Rate Limited |
|----------|---------|--------------|
| `elevenlabs-tts` | Text-to-speech | Yes |
| `elevenlabs-conversation-token` | Conversation auth | Yes |

### Utility Functions
| Function | Purpose | Rate Limited |
|----------|---------|--------------|
| `monthly-report` | Monthly progress report | Yes |
| `gdpr-data-export` | GDPR data export | Yes |

---

## Auth Configuration

### Required Settings

```
Auto-confirm email signups: ENABLED
Anonymous users: DISABLED  
Disable signup: FALSE
```

### Security Recommendations

1. **Enable Leaked Password Protection** - In Supabase Auth settings
2. **Move extensions out of public schema** - Database security best practice

---

## Seed Data

The app includes frontend seed data in `src/data/seed/`:

### Automatic Seeding

The app auto-seeds reference tables on first load via `checkAndSeedDatabase()` in `src/data/seed/index.ts`:

- `pillars` - 4 teaching pillars
- `practices` - Practice library
- `traditions` - Spiritual traditions  
- `domains` - 10 life domains
- `wisdom_library` - Quotes/teachings
- `curriculum_modules` - 4 learning modules
- `curriculum_lessons` - All lessons

### Manual Seed (if needed)

Visit `/seed` page or call:
```typescript
import { seedDatabase } from "@/data/seed";
await seedDatabase();
```

### Loops Library

150 psychological loops defined in `src/data/seed/loops.ts` - used by AI, not seeded to DB.

---

## Post-Setup Checklist

After remixing, complete these steps:

### 1. Enable ConsciousOS Cloud
- [ ] Connect new Supabase project (automatic with ConsciousOS Cloud)

### 2. Configure Auth
- [ ] Enable auto-confirm email signups
- [ ] Disable anonymous users

### 3. Add Secrets (if needed)
- [ ] `ELEVENLABS_API_KEY` - for voice features
- [ ] `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` - for push notifications

### 4. Run Migrations
- [ ] Migrations run automatically on first deploy
- [ ] Verify all tables created in Cloud dashboard

### 5. Seed Reference Data
- [ ] Visit app - auto-seeds on first authenticated visit
- [ ] Or manually visit `/seed` page

### 6. Security Hardening
- [ ] Enable leaked password protection in auth settings
- [ ] Verify RLS policies are active
- [ ] Check extensions are not in public schema

### 7. Test Critical Flows
- [ ] Sign up / Sign in
- [ ] Onboarding (both Structured and Adaptive paths)
- [ ] Morning check-in
- [ ] Block/task completion
- [ ] Evening reflection
- [ ] Streak tracking

---

## Architecture Reference

See these docs for detailed architecture:
- `docs/ARCHITECTURE.md` - System overview
- `docs/ADAPTIVE_SYSTEM_COMPLETE.md` - Adaptive mode details
- `docs/ADAPTIVE_USER_FLOW.md` - Adaptive user journey
- `docs/LEVEL_BASED_USER_FLOW.md` - Structured mode journey

---

## Troubleshooting

### "Table not found" errors
→ Migrations haven't run. Check Cloud dashboard for migration status.

### "RLS policy violation"
→ User not authenticated or wrong user_id. Check auth state.

### "Rate limit exceeded"
→ Normal protection. Wait 1 minute for window reset.

### Empty reference data
→ Visit `/seed` page or call `seedDatabase()`.

### Edge functions not working
→ Check secrets are configured. Check function logs in Cloud dashboard.

---

*Last updated: 2026-01-20*
