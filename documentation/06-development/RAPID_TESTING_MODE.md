# Rapid Testing Mode

## Overview

Rapid Testing Mode is a development and testing utility for ConsciousOS that enables quick progression through daily phases (Morning → Midday → Evening → Night) without waiting for actual time to pass.

## Purpose

- **Quick Testing**: Rapidly simulate completing one phase and moving to the next
- **Development**: Test UI states and content that appears based on time of day
- **Demos**: Show all daily phases without waiting hours between transitions
- **QA**: Automate testing of time-based features

## Daily Flow System

ConsciousOS has a 24-hour daily flow system:

| Phase | Time Range | Key Activities |
|-------|------------|----------------|
| **Morning** | 5:00 AM - 12:00 PM | Morning check-in, day package generation |
| **Midday** | 12:00 PM - 6:00 PM | Afternoon pings, active practice blocks |
| **Evening** | 6:00 PM - 10:00 PM | Evening reflection, integration |
| **Night** | 10:00 PM - 5:00 AM | Night mode, dream journal |

## Quick Start

### 1. Add the Provider

Wrap your app with `RapidTestingProvider`:

```tsx
import { RapidTestingProvider } from '@/hooks';

function App() {
  return (
    <RapidTestingProvider>
      <YourApp />
    </RapidTestingProvider>
  );
}
```

### 2. Add the Controls (Dev Only)

Add the floating control panel for easy phase navigation:

```tsx
import { RapidTestingControls } from '@/components/testing';

function App() {
  return (
    <RapidTestingProvider>
      <YourApp />
      {/* Only show in development */}
      {import.meta.env.DEV && <RapidTestingControls />}
    </RapidTestingProvider>
  );
}
```

### 3. Use in Components

Access rapid testing state and controls:

```tsx
import { useRapidTesting, useTestingAwareTimeContext } from '@/hooks';

function MyComponent() {
  const { 
    isRapidTesting, 
    currentPhase, 
    nextPhase, 
    previousPhase,
    setPhase 
  } = useRapidTesting();
  
  // Get time context that respects rapid testing mode
  const timeContext = useTestingAwareTimeContext();
  
  return (
    <div>
      <p>Current Phase: {currentPhase}</p>
      <button onClick={nextPhase}>Next Phase</button>
    </div>
  );
}
```

## API Reference

### Hooks

#### `useRapidTesting()`

Main hook for controlling rapid testing mode.

**Returns:**
- `isRapidTesting: boolean` - Whether rapid testing mode is active
- `currentPhase: TimePhase` - Currently simulated phase
- `autoAdvance: boolean` - Whether auto-advance is enabled
- `autoAdvanceInterval: number` - Auto-advance interval in seconds
- `enableRapidTesting(): void` - Enable rapid testing mode
- `disableRapidTesting(): void` - Disable rapid testing mode
- `toggleRapidTesting(): void` - Toggle rapid testing mode
- `nextPhase(): void` - Advance to next phase
- `previousPhase(): void` - Go back to previous phase
- `setPhase(phase: TimePhase): void` - Set specific phase
- `setAutoAdvance(enabled: boolean, intervalSeconds?: number): void` - Configure auto-advance
- `getSimulatedHour(): number` - Get simulated hour for current phase
- `getSimulatedDate(): Date` - Get Date object with simulated time

#### `useTestingAwareTimeContext()`

Returns the current time phase, respecting rapid testing mode if active.

**Returns:** `'morning' | 'midday' | 'evening' | 'night'`

#### `useIsRapidTestingAvailable()`

Check if rapid testing provider is available.

**Returns:** `boolean`

### Components

#### `RapidTestingControls`

Floating control panel for navigating between phases.

**Props:**
- `position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'` - Position on screen
- `visible?: boolean` - Whether to show the panel
- `onClose?: () => void` - Callback when panel is closed

### Utility Functions

For non-React code, use these utility functions from `lib/testingTimeUtils.ts`:

```typescript
import { 
  getCurrentHour,
  getTestingAwareTimeContext,
  isMorning,
  isMidday,
  isEvening,
  isNight,
  getTimeBasedGreeting 
} from '@/lib/testingTimeUtils';

// These functions check localStorage for rapid testing state
// and return simulated values when active
const hour = getCurrentHour();
const phase = getTestingAwareTimeContext();
```

## Integration Guide

### Updating Existing Time-Based Code

Replace direct `Date()` calls with testing-aware utilities:

**Before:**
```typescript
const hour = new Date().getHours();
const phase = getTimeContext(); // From adaptiveConfig.ts
```

**After:**
```typescript
import { getCurrentHour, getTestingAwareTimeContext } from '@/lib/testingTimeUtils';

const hour = getCurrentHour();
const phase = getTestingAwareTimeContext();
```

**For React Components:**
```tsx
// Before
const hour = new Date().getHours();

// After
import { useTestingAwareTimeContext } from '@/hooks';
const phase = useTestingAwareTimeContext();
```

### Key Files to Update

When integrating with existing code, these files may need updates to respect rapid testing mode:

1. `src/lib/adaptiveConfig.ts` - `getTimeContext()` function
2. `src/machines/utils/factory.ts` - `getCurrentTimeSegment()` function
3. `src/hooks/useHomeData.ts` - Time context calculations
4. `src/hooks/useHomeStats.ts` - Greeting logic
5. Any component using `new Date().getHours()` directly

## Keyboard Shortcuts

When the control panel is visible:

- `Ctrl/Cmd + Shift + T` - Toggle rapid testing mode
- `Ctrl/Cmd + Shift + →` - Next phase
- `Ctrl/Cmd + Shift + ←` - Previous phase

## Auto-Advance Mode

Enable auto-advance to automatically cycle through phases:

```tsx
const { setAutoAdvance } = useRapidTesting();

// Cycle every 5 seconds
setAutoAdvance(true, 5);

// Stop auto-advance
setAutoAdvance(false);
```

## Persistence

Rapid testing state is persisted to `localStorage` with key `consciousos_rapid_testing`:

```json
{
  "isRapidTesting": true,
  "currentPhase": "evening",
  "autoAdvance": false,
  "autoAdvanceInterval": 5
}
```

This allows testing state to survive page reloads.

## Security Considerations

⚠️ **Important:** Rapid Testing Mode should only be enabled in development environments.

- The control panel should only render when `import.meta.env.DEV` is true
- Never enable rapid testing mode in production builds
- The testing utilities fall back to real time when no testing state is found

## Troubleshooting

### Controls Not Visible
- Ensure `RapidTestingProvider` wraps your app
- Check that you're in development mode (`import.meta.env.DEV`)
- Verify the component import path: `@/components/testing`

### Time Not Updating
- Make sure you're using `useTestingAwareTimeContext()` or utility functions
- Direct `new Date()` calls won't respect rapid testing mode

### State Not Persisting
- Check browser localStorage is enabled
- Look for key `consciousos_rapid_testing` in dev tools

## Examples

### Example 1: Test All Phases
```tsx
function TestAllPhases() {
  const { setPhase } = useRapidTesting();
  
  const testAllPhases = () => {
    const phases: TimePhase[] = ['morning', 'midday', 'evening', 'night'];
    phases.forEach((phase, i) => {
      setTimeout(() => setPhase(phase), i * 2000);
    });
  };
  
  return <button onClick={testAllPhases}>Demo All Phases</button>;
}
```

### Example 2: Phase-Specific Content
```tsx
function PhaseSpecificContent() {
  const phase = useTestingAwareTimeContext();
  
  return (
    <div>
      {phase === 'morning' && <MorningRoutine />}
      {phase === 'midday' && <MiddayCheckIn />}
      {phase === 'evening' && <EveningReflection />}
      {phase === 'night' && <NightMode />}
    </div>
  );
}
```

### Example 3: Automated E2E Testing
```tsx
// In your test setup
const { enableRapidTesting, setPhase } = useRapidTesting();

// Enable testing and set specific phase
enableRapidTesting();
setPhase('evening');

// Now test evening-specific features
```

## Related Documentation

- [Adaptive System](./ADAPTIVE_SYSTEM_COMPLETE.md)
- [Daily Flow System](./STRUCTURED_DAILY_FLOW.md)
- [Testing Guide](./TESTING.md)
