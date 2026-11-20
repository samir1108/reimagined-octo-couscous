# ConsciousOS Developer Onboarding

> Get from zero to productive in under 30 minutes

---

## Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Version | Installation |
|------|---------|--------------|
| Node.js | 20.x+ | [nodejs.org](https://nodejs.org/) |
| Bun | Latest | [bun.sh](https://bun.sh/) (recommended) or use npm |
| Git | 2.x+ | [git-scm.com](https://git-scm.com/) |
| VS Code | Latest | [code.visualstudio.com](https://code.visualstudio.com/) |

### VS Code Extensions (Recommended)

Install these extensions for the best development experience:

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript Importer** - Auto-imports
- **Tailwind CSS IntelliSense** - CSS autocomplete
- **XState VSCode** - State machine visualization
- **GitLens** - Enhanced Git capabilities

---

## Quick Start (5 Minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/conscious-os.git
cd conscious-os
```

### 2. Install Dependencies

Using Bun (recommended - faster):
```bash
bun install
```

Using npm:
```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Start the Development Server

```bash
bun run dev
# or
npm run dev
```

The app will be available at [`http://localhost:5173`](http://localhost:5173)

---

## Architecture Overview

ConsciousOS is built with a modern React stack centered around state machines and type safety.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ConsciousOS                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  React UI    │  │  XState      │  │  TanStack Query      │  │
│  │  Components  │◄─►│  Machines    │◄─►│  Data Fetching       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Supabase    │  │  Local       │  │  Unreal Engine       │  │
│  │  (Auth/DB)   │  │  Storage     │  │  Guru (Optional)     │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
src/
├── api/              # Pure data fetching functions
├── components/       # React components
│   ├── ui/          # shadcn/ui base components
│   ├── guru/        # Guru system components
│   ├── error/       # Error boundaries
│   └── ...          # Feature components
├── hooks/           # Custom React hooks
├── machines/        # XState state machines
├── lib/             # Utility functions
├── pages/           # Page/route components
├── types/           # TypeScript type definitions
└── integrations/    # Third-party integrations
```

### Key Technologies

| Technology | Purpose | Documentation |
|------------|---------|---------------|
| **React 18** | UI Framework | [react.dev](https://react.dev/) |
| **TypeScript** | Type Safety | [typescriptlang.org](https://www.typescriptlang.org/) |
| **XState** | State Management | [stately.ai/docs](https://stately.ai/docs/) |
| **TanStack Query** | Data Fetching | [tanstack.com/query](https://tanstack.com/query/) |
| **Tailwind CSS** | Styling | [tailwindcss.com](https://tailwindcss.com/) |
| **Supabase** | Backend/Database | [supabase.com/docs](https://supabase.com/docs) |
| **Vite** | Build Tool | [vitejs.dev](https://vitejs.dev/) |

---

## Development Workflow

### Available Scripts

```bash
# Development
bun run dev              # Start dev server with HMR
bun run build            # Build for production
bun run preview          # Preview production build

# Code Quality
bun run lint             # Run ESLint
bun run lint:fix         # Fix ESLint issues
bun run format           # Format with Prettier
bun run format:check     # Check formatting
bun run typecheck        # TypeScript type checking

# Testing
bun run test             # Run tests once
bun run test:watch       # Run tests in watch mode
bun run test:coverage    # Run tests with coverage

# Database
bun run db:types:generate  # Generate types from DB schema
```

### Git Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Run validation:**
   ```bash
   bun run validate
   ```

4. **Commit using conventional commits:**
   ```bash
   git commit -m "feat: add new meditation timer component"
   ```

5. **Push and create PR:**
   ```bash
   git push origin feature/your-feature-name
   ```

---

## Common Tasks

### Adding a New Machine

1. Create machine file in `src/machines/`:
   ```typescript
   // src/machines/timerMachine.ts
   import { setup, createMachine, assign } from 'xstate';

   export const timerMachine = setup({
     types: {
       context: {} as { elapsed: number },
       events: {} as { type: 'START' } | { type: 'STOP' }
     }
   }).createMachine({
     id: 'timer',
     initial: 'idle',
     context: { elapsed: 0 },
     states: {
       idle: {
         on: { START: { target: 'running' } }
       },
       running: {
         on: { STOP: { target: 'idle' } }
       }
     }
   });
   ```

2. Use in component:
   ```typescript
   import { useMachine } from '@xstate/react';
   import { timerMachine } from '@/machines/timerMachine';

   function Timer() {
     const [state, send] = useMachine(timerMachine);
     return (
       <button onClick={() => send({ type: 'START' })}>
         Start
       </button>
     );
   }
   ```

### Creating a Component

1. Create component file:
   ```typescript
   // src/components/meditation/MeditationTimer.tsx
   import { useState } from 'react';
   import { Button } from '@/components/ui/button';

   interface MeditationTimerProps {
     duration: number;
     onComplete?: () => void;
   }

   export function MeditationTimer({ duration, onComplete }: MeditationTimerProps) {
     const [timeLeft, setTimeLeft] = useState(duration);
     
     // Component logic here
     
     return (
       <div className="p-4">
         <span className="text-2xl font-bold">{timeLeft}</span>
         <Button onClick={() => {}}>Start</Button>
       </div>
     );
   }
   ```

2. Export from index (if creating in a folder):
   ```typescript
   // src/components/meditation/index.ts
   export { MeditationTimer } from './MeditationTimer';
   ```

### Writing Tests

```typescript
// src/components/meditation/MeditationTimer.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MeditationTimer } from './MeditationTimer';

describe('MeditationTimer', () => {
  it('renders with initial duration', () => {
    render(<MeditationTimer duration={600} />);
    expect(screen.getByText('600')).toBeInTheDocument();
  });

  it('calls onComplete when finished', () => {
    const onComplete = vi.fn();
    render(<MeditationTimer duration={0} onComplete={onComplete} />);
    expect(onComplete).toHaveBeenCalled();
  });
});
```

### Adding an API Function

```typescript
// src/api/meditation.ts
import { supabase } from '@/integrations/supabase/client';

export async function fetchMeditationSessions(userId: string) {
  const { data, error } = await supabase
    .from('meditation_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
```

---

## Code Standards

### TypeScript

- Enable strict mode in `tsconfig.json`
- Use explicit return types on exported functions
- Prefer `interface` over `type` for object shapes
- Use discriminated unions for state management

### React

- Use functional components with hooks
- Prefer composition over inheritance
- Keep components small and focused
- Use React.memo for expensive renders

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use CSS variables for theming
- Maintain consistent spacing (4px grid)

### Testing

- Write tests for all new features
- Aim for 70%+ code coverage
- Test behavior, not implementation
- Use user-centric queries (getByRole)

---

## Troubleshooting

### Common Issues

#### "Cannot find module '@/components/ui/button'"
- Check that path mapping is configured in `tsconfig.json`
- Restart TypeScript server in VS Code

#### "Supabase URL is required"
- Ensure `.env` file exists with `VITE_SUPABASE_URL`
- Restart dev server after updating `.env`

#### Type errors after pulling latest
- Run `bun run db:types:generate` to update types
- Run `bun install` to update dependencies

#### Tests failing after changes
- Run `bun run test:watch` in another terminal
- Check for snapshot mismatches

### Getting Help

- Check existing [documentation](./)
- Search [GitHub Issues](https://github.com/your-org/conscious-os/issues)
- Ask in the #dev-help Slack channel
- Tag `@dev-team` for urgent issues

---

## Next Steps

After completing onboarding:

1. **Read the Architecture Decision Records (ADRs)** in `docs/adr/`
2. **Explore the codebase** starting with `src/App.tsx`
3. **Review the API documentation** at `docs/API.md`
4. **Set up the Guru system** (optional) - see `files/unreal-guru/SETUP_GUIDE.md`
5. **Pick up your first issue** from the backlog

---

## Resources

- [API Documentation](./API.md)
- [Type Guidelines](./TYPE_GUIDELINES.md)
- [Testing Guide](./TESTING.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
- [Architecture Decisions](./adr/)

Welcome to the team! 🧘
