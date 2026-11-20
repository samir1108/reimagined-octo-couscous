# Supabase Migration Guide

## Overview
This guide helps you migrate from ConsciousOS's Supabase to your own Supabase instance.

## Current Configuration (ConsciousOS)
- Project ID: `ewwgxwuhtkmnajcmelqc`
- URL: `https://ewwgxwuhtkmnajcmelqc.supabase.co`

## What's Been Done
✅ Created new Supabase auth integration (`src/integrations/supabase/auth.ts`)
✅ Updated Auth.tsx to use Supabase auth directly
✅ Updated offline sync to remove platform-specific references
✅ Created `.env.example` template
✅ Database schema already exists in `docs/DATABASE_SCHEMA.sql`

## Steps to Complete Migration

### Step 1: Create Your Own Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Enter your project details:
   - Name: `conscious-os` (or your preferred name)
   - Database Password: Create a strong password
   - Region: Choose the closest region to you
4. Click "Create new project" and wait for setup to complete

### Step 2: Get Your Credentials
1. In your Supabase dashboard, go to **Settings** (gear icon) → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

### Step 3: Update Environment Variables
Update your `.env` file with your new credentials:
```
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_URL=https://your-project.supabase.co
```

### Step 4: Apply Database Schema
In your Supabase dashboard:
1. Go to the **SQL Editor** in the left sidebar
2. Copy the contents of `docs/DATABASE_SCHEMA.sql`
3. Paste into the SQL Editor and click **Run**

This will create all 42 tables and necessary functions.

### Step 5: Configure Authentication
1. In Supabase Dashboard → **Authentication** → **Providers**
2. Enable the auth providers you want (Google, Apple, etc.)
3. Configure OAuth redirect URLs as needed

### Step 6: Restart Your App
```bash
npm run dev
```

## Tables Created (42 total)
The schema includes:
- profiles, user_roles
- domains, pillars, traditions, practices, wisdom_library
- curriculum_modules, curriculum_lessons
- chat_sessions, chat_messages
- daily_journeys, adaptive_days, day_chains
- tasks, journal_entries
- user_capacities, user_loops, life_domains
- user_curriculum_progress, lesson_task_progress
- practice_history, user_achievements, user_favorites
- tradition_progress, guru_memory, pattern_insights
- capacity_history, v_level_history, streak_history
- xp_transactions, crisis_events
- notification_preferences, push_subscriptions, notification_logs
- scheduled_sessions, day_feedback
- rate_limits, engine_logs, security_audit_log
- data_export_requests, offline_sync_queue

## Key Functions Created
- `update_updated_at_column()` - Auto-update timestamps
- `calculate_level_from_xp()` - Calculate user level
- `check_rate_limit()` - Rate limiting
- `clamp_capacity_values()` - Validate capacity values
- `initialize_life_domains()` - Setup new user domains
- `cleanup_old_records()` - Data maintenance
- `get_user_data_export()` - GDPR export
- `has_role()` - Role checking

## Environment Variables Required
| Variable | Description |
|----------|-------------|
| VITE_SUPABASE_URL | Your Supabase project URL |
| VITE_SUPABASE_PUBLISHABLE_KEY | Your anon/public key |
| VITE_SUPABASE_PROJECT_ID | Your project ID (optional) |
| OPENROUTER_API_KEY | Your OpenRouter API key (required for AI functions) |

## Setting Up OpenRouter API Key

For the AI functions to work, you need to set up the OpenRouter API key in Supabase Edge Functions:

### Option 1: Using Supabase CLI
```bash
supabase secrets set OPENROUTER_API_KEY=your_api_key_here
```

### Option 2: Using Supabase Dashboard
1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **Edge Functions**
3. Add a new secret: `OPENROUTER_API_KEY` = `your_api_key_here`

### Getting Your OpenRouter API Key
1. Go to [openrouter.ai](https://openrouter.ai/)
2. Sign up or log in
3. Go to **Keys** in the left sidebar
4. Create a new API key
5. Add credits to your account (required for API usage)

## Notes
- The app is already configured to use `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
- No code changes needed - just update the `.env` file
- The Supabase client is configured in `src/integrations/supabase/client.ts`
