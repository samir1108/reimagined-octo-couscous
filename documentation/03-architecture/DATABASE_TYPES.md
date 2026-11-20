# Database Types Documentation

## Overview

This project uses **auto-generated TypeScript types** from the Supabase database schema to ensure complete type safety across all database operations.

## Architecture

### Type Generation Flow

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

## Generated Types Location

- **File**: [`src/types/database-generated.ts`](../src/types/database-generated.ts)
- **Generator**: [`scripts/generate-db-types.ts`](../scripts/generate-db-types.ts)
- **Source**: Supabase database schema (see [`DATABASE_SCHEMA.sql`](DATABASE_SCHEMA.sql))

## Type Categories

### 1. Database Interface

The main `Database` interface contains all tables, views, functions, and enums:

```typescript
interface Database {
  public: {
    Tables: { /* all table definitions */ }
    Views: { /* database views */ }
    Functions: { /* stored functions */ }
    Enums: { /* enum types */ }
  }
}
```

### 2. Table Helper Types

Convenience types for accessing table rows, inserts, and updates:

```typescript
// Row type (what you get from SELECT)
type ProfileRow = Tables<'profiles'>;

// Insert type (what you pass to INSERT)
type ProfileInsert = TablesInsert<'profiles'>;

// Update type (what you pass to UPDATE)
type ProfileUpdate = TablesUpdate<'profiles'>;
```

### 3. Enum Types

All database enums are available as TypeScript unions:

```typescript
type JourneyStatus = Enums<'journey_status'>;
// Result: 'morning_pending' | 'tasks_active' | 'evening_pending' | 'practice_pending' | 'completed'

type TaskStatus = Enums<'task_status'>;
// Result: 'pending' | 'in_progress' | 'completed' | 'skipped'
```

## Available Types

### Core Tables

| Table | Row Type | Insert Type | Update Type |
|-------|----------|-------------|-------------|
| profiles | `ProfileRow` | `ProfileInsert` | `ProfileUpdate` |
| daily_journeys | `JourneyRow` | `JourneyInsert` | `JourneyUpdate` |
| tasks | `TaskRow` | `TaskInsert` | `TaskUpdate` |
| journal_entries | `JournalEntryRow` | `JournalEntryInsert` | `JournalEntryUpdate` |
| xp_transactions | `XPTransactionRow` | `XPTransactionInsert` | - |
| user_achievements | `UserAchievementRow` | `UserAchievementInsert` | - |
| user_capacities | `UserCapacitiesRow` | `UserCapacitiesInsert` | `UserCapacitiesUpdate` |
| user_loops | `UserLoopRow` | `UserLoopInsert` | `UserLoopUpdate` |
| chat_sessions | `ChatSessionRow` | - | - |
| chat_messages | `ChatMessageRow` | - | - |
| domains | `DomainRow` | - | - |
| pillars | `PillarRow` | - | - |
| traditions | `TraditionRow` | - | - |
| practices | `PracticeRow` | - | - |
| practice_history | `PracticeHistoryRow` | `PracticeHistoryInsert` | - |

### Enum Types

| Enum | Type Name | Values |
|------|-----------|--------|
| journey_status | `JourneyStatus` | `morning_pending`, `tasks_active`, `evening_pending`, `practice_pending`, `completed` |
| task_status | `TaskStatus` | `pending`, `in_progress`, `completed`, `skipped` |
| practice_type | `PracticeType` | `meditation`, `breathwork`, `movement`, `journaling` |
| time_segment | `TimeSegment` | `morning`, `afternoon`, `evening`, `night` |
| app_role | `AppRole` | `admin`, `moderator`, `user` |

## NPM Scripts

### Generate Types

```bash
# Generate from local linked Supabase project
npm run db:types:generate

# Generate from remote project (requires SUPABASE_PROJECT_ID)
npm run db:types:remote

# Watch for schema changes and auto-regenerate
npm run db:types:watch
```

### Supabase CLI Commands

```bash
# Link local project to Supabase
npm run supabase:link <project-ref>

# Check Supabase status
npm run supabase:status
```

## Usage Examples

### In API Functions

```typescript
import type { ProfileRow, ProfileInsert, TablesUpdate } from '@/types';

// Use Row type for return values
async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data; // Automatically typed as ProfileRow | null
}

// Use Insert type for new records
async function createProfile(userId: string): Promise<ProfileRow> {
  const newProfile: ProfileInsert = {
    user_id: userId,
    display_name: null,
    xp: 0,
    // ... other required fields
  };
  
  const { data } = await supabase
    .from('profiles')
    .insert(newProfile)
    .select()
    .single();
  return data;
}

// Use Update type for partial updates
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

### In Components

```typescript
import type { JourneyStatus, TaskStatus, JourneyRow } from '@/types';

interface JourneyCardProps {
  journey: JourneyRow;
  onStatusChange: (status: JourneyStatus) => void;
}

function JourneyCard({ journey, onStatusChange }: JourneyCardProps) {
  // Type-safe access to journey properties
  const status: JourneyStatus = journey.status;
  
  return (
    <div>
      <span>Status: {status}</span>
      <button onClick={() => onStatusChange('completed')}>
        Complete
      </button>
    </div>
  );
}
```

## When to Regenerate Types

### Required Regeneration

Regenerate types when:
- ✅ Adding new tables
- ✅ Modifying table columns
- ✅ Adding or changing enums
- ✅ Creating new relationships
- ✅ Adding stored functions

### Not Required

No need to regenerate when:
- ❌ Only changing data (rows)
- ❌ Modifying RLS policies
- ❌ Adding indexes
- ❌ Changing triggers (unless column-related)

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Generate Database Types

on:
  push:
    paths:
      - 'supabase/migrations/**'
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Generate types
        env:
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
        run: npm run db:types:remote
        
      - name: Check for changes
        run: |
          if git diff --quiet src/types/database-generated.ts; then
            echo "No type changes detected"
          else
            echo "Type changes detected - committing..."
            git config user.name "github-actions"
            git config user.email "actions@github.com"
            git add src/types/database-generated.ts
            git commit -m "chore: regenerate database types [skip ci]"
            git push
          fi
```

## Type Safety Best Practices

### 1. Use Generated Types for Database Operations

```typescript
// ✅ Good - Type-safe
const { data } = await supabase
  .from('profiles')
  .select('*');
// data is automatically typed as ProfileRow[]

// ❌ Bad - Manual casting
const { data } = await supabase
  .from('profiles')
  .select('*');
return data as any; // Loses type safety
```

### 2. Use Insert Types for New Records

```typescript
// ✅ Good - Ensures all required fields
const newProfile: ProfileInsert = {
  user_id: userId,
  // TypeScript will error if required fields are missing
};

// ❌ Bad - No type checking
const newProfile = {
  user_id: userId,
  // Missing fields won't be caught
};
```

### 3. Use Enum Types for Status Values

```typescript
// ✅ Good - Type-safe status transitions
function updateTaskStatus(status: TaskStatus) {
  // Only valid statuses are allowed
}
updateTaskStatus('completed'); // ✓ Valid
updateTaskStatus('done');      // ✗ Type error

// ❌ Bad - String allows any value
function updateTaskStatus(status: string) {
  // Any string is accepted
}
updateTaskStatus('anything');  // No error!
```

### 4. Handle Nullable Fields

```typescript
// ✅ Good - Check for null
const displayName = profile.display_name;
if (displayName) {
  // displayName is string here
}

// ❌ Bad - Assume non-null
const name: string = profile.display_name; // Type error!
```

## Troubleshooting

### Common Issues

#### 1. "Cannot find module '@/types'"

**Solution**: Ensure the path alias is configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### 2. Types not updating after schema change

**Solution**: Regenerate types:

```bash
npm run db:types:generate
```

#### 3. Supabase CLI not found

**Solution**: The CLI is automatically installed via npx. If issues persist:

```bash
npm install --save-dev supabase
```

#### 4. "Project not linked" error

**Solution**: Link your local project:

```bash
npx supabase link --project-ref <your-project-ref>
```

Or use remote generation:

```bash
SUPABASE_PROJECT_ID=<your-project-id> npm run db:types:remote
```

## Migration from Manual Types

If you're migrating from manually-defined types:

1. **Identify manual type definitions** in your codebase
2. **Replace with generated types** from `@/types`
3. **Remove `as` casts** - they're no longer needed
4. **Update function signatures** to use generated types
5. **Run type check** to catch any inconsistencies

### Example Migration

**Before:**
```typescript
interface Profile {
  id: string;
  user_id: string;
  // ... manual definition
}

async function fetchProfile(): Promise<Profile> {
  const { data } = await supabase.from('profiles').select('*');
  return data as Profile; // Manual cast
}
```

**After:**
```typescript
import type { ProfileRow } from '@/types';

async function fetchProfile(): Promise<ProfileRow> {
  const { data } = await supabase.from('profiles').select('*');
  return data; // Automatic typing
}
```

## Related Documentation

- [DATABASE_SCHEMA.sql](DATABASE_SCHEMA.sql) - Complete database schema
- [Supabase Type Generation](https://supabase.com/docs/guides/api/rest/generating-types) - Official Supabase docs
- [src/types/database.ts](../src/types/database.ts) - JSONB column type definitions
