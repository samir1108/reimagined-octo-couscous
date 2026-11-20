# ADR 0003: Use Supabase for Backend

## Status

**Accepted**

## Context

ConsciousOS requires a backend for:
- User authentication and authorization
- Data persistence (profiles, journeys, journal entries)
- Real-time updates (collaborative features)
- File storage (audio recordings, images)
- Edge functions (AI processing, webhooks)

We evaluated several backend-as-a-service options:

| Option | Pros | Cons |
|--------|------|------|
| Firebase | Mature, comprehensive | Vendor lock-in, complex pricing |
| Supabase | Open source, PostgreSQL | Newer, smaller community |
| AWS Amplify | AWS ecosystem | Complex, expensive at scale |
| Self-hosted | Full control | Maintenance burden |
| PlanetScale | MySQL scaling | Limited feature set |

## Decision

We will use **Supabase** as our backend platform.

### Rationale

1. **PostgreSQL** - Industry-standard relational database with full SQL support
2. **Open Source** - Can self-host if needed, no vendor lock-in
3. **Real-time** - Built-in subscriptions for live updates
4. **Auth** - Complete authentication system with multiple providers
5. **Edge Functions** - Serverless functions using Deno
6. **TypeScript Support** - Auto-generated types from database schema
7. **Row Level Security** - Fine-grained access control at database level

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     ConsciousOS App                          │
│                   (React + TypeScript)                       │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          │ Supabase Client SDK
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                      Supabase Platform                       │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   Auth       │  Database    │   Realtime   │  Edge Functions│
│              │  (Postgres)  │              │  (Deno)        │
├──────────────┼──────────────┼──────────────┼────────────────┤
│ • JWT tokens │ • Profiles   │ • Changes    │ • AI webhooks  │
│ • OAuth      │ • Journeys   │ • Presence   │ • Analytics    │
│ • Magic link │ • Journal    │ • Broadcast  │ • Notifications│
│ • RLS        │ • Tasks      │              │ • Image proc   │
└──────────────┴──────────────┴──────────────┴────────────────┘
```

## Implementation

### Database Schema

```sql
-- Example: Profiles table with RLS
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

### Client Usage

```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Usage in API layer
import { supabase } from '@/integrations/supabase/client';

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}
```

### Real-time Subscriptions

```typescript
// Subscribe to profile changes
const subscription = supabase
  .channel('profile_changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'profiles',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Profile updated:', payload.new);
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    }
  )
  .subscribe();
```

### Edge Functions

```typescript
// supabase/functions/analytics/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { event, data } = await req.json();
  
  // Process analytics event
  await supabase.from('analytics_events').insert({
    event_type: event,
    event_data: data,
    created_at: new Date().toISOString()
  });
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

## Consequences

### Positive

- **Rapid development** - Pre-built auth, database, real-time
- **Type safety** - Auto-generated TypeScript types
- **Security** - RLS policies enforce access control
- **Scalability** - PostgreSQL handles growth
- **Cost-effective** - Generous free tier, predictable pricing
- **Self-host option** - Can migrate away if needed

### Negative

- **Newer platform** - Smaller community than Firebase
- **PostgreSQL specific** - Can't easily switch to another DB
- **Edge function limits** - Deno runtime has constraints
- **Cold starts** - Edge functions may have latency

## Migration Path

If we need to migrate from Supabase:

1. **Export data** - PostgreSQL dump works anywhere
2. **Auth** - Can use Auth0, Clerk, or custom JWT
3. **Database** - Any PostgreSQL host (AWS RDS, etc.)
4. **Real-time** - Can use WebSocket servers
5. **Edge functions** - Migrate to Cloudflare Workers, etc.

## Related Decisions

- [ADR 0001: Use XState for State Management](./0001-use-xstate-for-state-management.md)
- [ADR 0002: Dual State Architecture](./0002-dual-state-architecture.md)

## References

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## Date

2024-01-25

## Author

Development Team
