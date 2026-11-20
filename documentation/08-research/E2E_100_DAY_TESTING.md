# ConsciousOS 100-Day E2E Testing System

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Test Architecture](#test-architecture)
- [Test Suites](#test-suites)
- [Running Tests](#running-tests)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Overview

### What is the 100-Day Simulation

The ConsciousOS 100-Day E2E Testing System is a comprehensive automated testing framework that simulates an entire user journey from Day 1 (onboarding) through Day 100 (mastery). It uses time acceleration to test all user flows across multiple phases and levels without waiting real time.

**Key Capabilities:**
- Simulates 100 days of user activity in ~6.6 hours (or faster in CI)
- Tests all 4 daily phases: Morning, Midday, Evening, Night
- Validates level progression from Level 1 to Level 21
- Tests the complete loop lifecycle (detection → work → dissolution)
- Verifies XP calculations, streak mechanics, and insights unlocking
- Tests network resilience and edge cases
- Measures performance benchmarks across the journey

### Why It Matters for Wellness Apps

Wellness applications like ConsciousOS depend on long-term user engagement:

1. **Habit Formation**: Users need 21-66 days to form habits; our tests validate the entire formation period
2. **Progression Systems**: Level unlocks and feature gating must work consistently across 100 days
3. **Data Integrity**: Journal entries, check-ins, and practice history must persist correctly
4. **State Management**: Complex app state across days, phases, and sessions must remain consistent
5. **User Retention**: Testing edge cases prevents frustrating bugs that cause churn

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Playwright Test Runner                        │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                     Time Simulation Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Rapid Testing│  │ Phase Control│  │   Day Advancement    │  │
│  │   enable()   │  │ setPhase()   │  │    advanceDays()     │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                     Page Objects Layer                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Journal  │ │ Practice │ │   Loop   │ │ Dashboard│          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Checkin  │ │Analytics │ │Onboarding│ │   Base   │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                     Fixture & Seed Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Day States   │  │   Users      │  │    Seed Data Utils   │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Installation Requirements

```bash
# 1. Ensure Node.js 18+ is installed
node --version

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install

# 4. Verify installation
npx playwright test --version
```

### Running Your First Test

```bash
# Run a single simulation test to verify setup
npx playwright test e2e/simulation/day-cycle.spec.ts --project=chromium

# Run with UI mode for debugging
npx playwright test e2e/simulation/day-cycle.spec.ts --ui
```

### Understanding Test Output

```
📅 Day 1/100 - Level 1 - 0 XP
  🕐 Phase: MORNING
    📝 Journal entry created
    ✓ Check-in completed (calm, energy: 7)
    🧘 Practice completed (+32 XP)

📅 Day 7/100 - Level 1 - 350 XP
  🕐 Phase: MORNING
    🎉 LEVEL UP! Day 14: Level 1 → 2
    💡 New Insight Unlocked: pattern-recognition

✅ Simulation Complete!
┌─────────────────────────────────────────┐
│ Total Days: 100                         │
│ Total Phases: 400                       │
│ Total Time: 45m 23s                     │
│ Journal Entries: 95                     │
│ Practices Completed: 140                │
│ Checkins Completed: 200                 │
│ XP Earned: 8500                         │
│ Level Ups: [14, 30, 60, 90]             │
└─────────────────────────────────────────┘
```

---

## Test Architecture

### Page Objects

ConsciousOS uses 10 Page Object Models (POMs) for maintainable tests:

| Page Object | File | Description |
|------------|------|-------------|
| [`BasePage`](e2e/pages/BasePage.ts) | `e2e/pages/BasePage.ts` | Abstract base class with common functionality |
| [`LandingPage`](e2e/pages/LandingPage.ts) | `e2e/pages/LandingPage.ts` | Landing/marketing page interactions |
| [`LoginPage`](e2e/pages/LoginPage.ts) | `e2e/pages/LoginPage.ts` | Authentication flows |
| [`DashboardPage`](e2e/pages/DashboardPage.ts) | `e2e/pages/DashboardPage.ts` | Main dashboard navigation and validation |
| [`JournalPage`](e2e/pages/JournalPage.ts) | `e2e/pages/JournalPage.ts` | Journal entry creation and management |
| [`PracticePage`](e2e/pages/PracticePage.ts) | `e2e/pages/PracticePage.ts` | Practice session flows |
| [`LoopPage`](e2e/pages/LoopPage.ts) | `e2e/pages/LoopPage.ts` | Shadow work and loop management |
| [`CheckinPage`](e2e/pages/CheckinPage.ts) | `e2e/pages/CheckinPage.ts` | Daily check-in flows |
| [`OnboardingPage`](e2e/pages/OnboardingPage.ts) | `e2e/pages/OnboardingPage.ts` | New user onboarding |
| [`AnalyticsPage`](e2e/pages/AnalyticsPage.ts) | `e2e/pages/AnalyticsPage.ts` | Progress and analytics views |

#### Inheritance Diagram

```
                    BasePage (abstract)
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   LandingPage      LoginPage       DashboardPage
        │                │                │
   ┌────┴────┐      ┌────┴────┐     ┌────┴────────┐
   │         │      │         │     │             │
Journal  Practice  Loop    Checkin  Onboarding  Analytics
```

#### Usage Example

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage, DashboardPage, JournalPage } from './pages';

test('user completes journal entry', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const journalPage = new JournalPage(page);

  // Login
  await loginPage.goto();
  await loginPage.login('test@example.com', 'password');

  // Navigate to journal
  await dashboardPage.navigateToJournal();
  await journalPage.expectToBeOnPage();

  // Create entry
  await journalPage.createEntry('Day 1 Reflection', 'Today I learned...');
  await expect(journalPage.entryCards).toHaveCount(1);
});
```

### Time Simulation

#### How Rapid Testing Mode Works

The app exposes a `window.__CONSCIOUSOS_RAPID_TESTING__` API that tests can use to manipulate time:

```typescript
// Enable rapid testing mode
await enableRapidTesting(page);

// Set specific phase
await setPhase(page, 'morning');

// Advance to next phase
await nextPhase(page); // morning → midday → evening → night

// Complete full day cycle
await completeDayCycle(page);

// Jump forward multiple days
await advanceDays(page, 30); // Jump to Day 30
```

**Behind the Scenes:**
1. Sets `localStorage` config: `consciousos_rapid_testing`
2. Dispatches custom events: `consciousos:phase-change`
3. App listens and updates internal time state
4. UI re-renders with new phase/day content

#### Phase Manipulation

```typescript
import { setPhase, Phase } from './utils/time-simulation';

const phases: Phase[] = ['morning', 'midday', 'evening', 'night'];

for (const phase of phases) {
  await setPhase(page, phase);

  // Phase-specific assertions
  await expect(page.getByText(`${phase} Check-in`)).toBeVisible();
}
```

#### Day Advancement Strategies

**Strategy 1: Quick Jump (for testing specific days)**
```typescript
// Seed Day 50 state directly
import { getDayState } from './fixtures/day-states';
import { seedCompleteDayState } from './utils/seed-data';

const day50 = getDayState(50);
await seedCompleteDayState(page, day50);
```

**Strategy 2: Iterative (for full journey validation)**
```typescript
// Run all 100 days with activities
for (let day = 1; day <= 100; day++) {
  const state = getDayState(day);
  await seedCompleteDayState(page, state);

  // Perform phase activities
  await completeDayCycle(page, {
    morningActions: async () => await performMorningCheckin(),
    eveningActions: async () => await performEveningReflection(),
  });
}
```

**Strategy 3: Simulation Runner (comprehensive)**
```typescript
import { run100DaySimulation } from './utils/simulation-runner';

const metrics = await run100DaySimulation(page, {
  startDay: 1,
  endDay: 100,
  phaseDurationMs: 1000, // 1 second per phase (fast mode)
  enableJournal: true,
  enableGuidedSessions: true,
  enableCheckins: true,
  enablePractices: true,
});
```

### Fixtures

#### Day-State Fixtures Explained

The [`day-states.ts`](e2e/fixtures/day-states.ts) file provides predefined states for key milestones:

```typescript
import { DAY_STATES, getDayState } from './fixtures/day-states';

// Predefined milestones
DAY_STATES.initial  // Day 1, Level 1, 0 XP
DAY_STATES.week1    // Day 7, Level 1, 350 XP
DAY_STATES.week2    // Day 14, Level 2, 750 XP
DAY_STATES.month1   // Day 30, Level 3, 1800 XP
DAY_STATES.month2   // Day 60, Level 5, 4200 XP
DAY_STATES.month3   // Day 90, Level 7, 7200 XP
DAY_STATES.day100   // Day 100, Level 8, 8500 XP

// Generate any day state (interpolates between known states)
const day42 = getDayState(42);
// Returns interpolated state with appropriate XP, level, etc.
```

**DayState Interface:**
```typescript
interface DayState {
  dayNumber: number;           // 1-100
  level: number;               // 1-21
  xp: number;                  // Total XP earned
  streak: number;              // Current streak
  completedBlocks: string[];   // Completed phase blocks
  activeLoops: string[];       // Active loop patterns
  journalEntries: number;      // Count of entries
  practicesCompleted: number;  // Practice count
  checkinsCompleted: number;   // Check-in count
  expectedPhase: Phase;        // Current phase
  guidedSessionsCompleted: number;
  loopsResolved: number;
  insightsUnlocked: string[];
  masteryProgress: number;     // 0-100
}
```

#### User Fixtures

```typescript
import { getTestUser, TestUser } from './fixtures/users';

const user: TestUser = getTestUser('standard');
// {
//   email: 'test@consciousos.app',
//   password: 'TestPass123!',
//   name: 'Test User',
//   role: 'standard'
// }

// Available users
getTestUser('standard');  // Regular user
getTestUser('premium');   // Premium tier
getTestUser('admin');     // Admin user
getTestUser('newUser');   // Fresh account for onboarding tests
```

#### Creating Custom Fixtures

```typescript
// e2e/fixtures/custom-states.ts
import { DayState } from './day-states';

export const CUSTOM_STATES = {
  // Day 50 with specific loop focus
  day50Procrastination: {
    ...getDayState(50),
    activeLoops: ['procrastination'],
    practicesCompleted: 75,
    xp: 3500,
  } as DayState,

  // Day 100 with all loops resolved
  day100Mastery: {
    ...getDayState(100),
    activeLoops: [],
    loopsResolved: 4,
    insightsUnlocked: ['awareness-basics', 'pattern-recognition', 
                       'emotional-regulation', 'self-inquiry', 
                       'presence', 'embodiment', 'non-duality', 'integration'],
  } as DayState,
};
```

---

## Test Suites

### 100-Day Journey

The main journey test covers the complete user lifecycle:

#### Day 1-7: Onboarding
**File**: `e2e/simulation/100-day-journey.spec.ts`

```typescript
test.describe('Day 1-7: Onboarding Phase', () => {
  test('Day 1: First-time user experience', async () => {
    // Onboarding flow
    // Welcome screens
    // First check-in
    // Initial loop detection
  });

  test('Day 2-3: Building the habit', async () => {
    // Morning check-ins
    // Evening reflections
    // XP accumulation
  });

  test('Day 4-7: Establishing routine', async () => {
    // All four phases
    // First insights unlock
    // Streak building
  });
});
```

**Validations:**
- Onboarding completion flow
- First journal entry
- Initial loop detection
- XP and streak mechanics

#### Day 8-30: Habit Formation

```typescript
test.describe('Day 8-30: Habit Formation', () => {
  test('Week 2: Level 1 → 2 transition', async () => {
    // 500 XP threshold
    // Feature unlocks
  });

  test('Day 30: Month 1 milestone', async () => {
    // Level 3 achievement
    // 30-day streak
    // Deep work block unlock
  });
});
```

**Validations:**
- Level progression triggers
- Feature gating
- Practice variety
- Loop work introduction

#### Day 31-60: Intermediate

```typescript
test.describe('Day 31-60: Intermediate Practice', () => {
  test('Month 2: Multiple loops active', async () => {
    // 2-3 concurrent loops
    // Dissolution progress
  });

  test('Day 60: Level 5 milestone', async () => {
    // Advanced practices unlocked
    // Mastery progress tracking
  });
});
```

**Validations:**
- Multi-loop management
- Loop dissolution mechanics
- Advanced practice access
- Progress analytics

#### Day 61-100: Advanced

```typescript
test.describe('Day 61-100: Advanced Practice', () => {
  test('Month 3: Approaching mastery', async () => {
    // Loop resolutions
    // Insight accumulation
  });

  test('Day 100: Mastery path', async () => {
    // 100-day streak
    // All insights unlocked
    // Level 7-8 achievement
  });
});
```

**Validations:**
- Loop completion
- Insight unlocking
- Level 7+ mechanics
- Long-term data persistence

### Daily Phase Cycles

**File**: `e2e/simulation/day-cycle.spec.ts`

Tests the four daily phases:

| Phase | Time Range | Activities | Content |
|-------|------------|------------|---------|
| **Morning** | 5 AM - 11 AM | Intention setting, meditation, planning | Morning check-in, breathing exercises |
| **Midday** | 11 AM - 5 PM | Reset practices, quick check-ins | Midday reset, body scan |
| **Evening** | 5 PM - 9 PM | Reflection, journaling, review | Evening check-in, inquiry practice |
| **Night** | 9 PM - 5 AM | Sleep prep, gratitude, wind-down | Sleep check-in, gratitude practice |

```typescript
test('complete day cycle with phase-specific content', async ({ page }) => {
  await enableRapidTesting(page);

  // Morning phase
  await setPhase(page, 'morning');
  await expect(page.getByText('Morning Check-in')).toBeVisible();
  await performMorningCheckin();

  // Midday phase
  await setPhase(page, 'midday');
  await expect(page.getByText('Midday Reset')).toBeVisible();
  await performMiddayReset();

  // Evening phase
  await setPhase(page, 'evening');
  await expect(page.getByText('Evening Reflection')).toBeVisible();
  await performEveningReflection();

  // Night phase
  await setPhase(page, 'night');
  await expect(page.getByText('Sleep Check-in')).toBeVisible();
  await performNightCheckin();
});
```

### Edge Cases

**File**: `e2e/simulation/edge-cases.spec.ts`

#### Network Resilience

```typescript
test('handles network disconnection during practice', async ({ page }) => {
  await startPractice();

  // Simulate offline
  await page.context().setOffline(true);

  // Should queue operations
  await completePractice();

  // Restore connection
  await page.context().setOffline(false);

  // Should sync queued operations
  await expectSyncComplete();
});
```

#### State Management

```typescript
test('recovers from page reload mid-session', async ({ page }) => {
  await startJournalEntry('Title', 'Partial content');

  // Simulate crash/reload
  await page.reload();

  // Should restore auto-saved state
  await expect(page.locator('[data-testid="editor"]')).
    toHaveValue('Partial content');
});
```

#### Data Integrity

```typescript
test('handles rapid phase switches', async ({ page }) => {
  // Rapidly switch phases
  for (let i = 0; i < 20; i++) {
    await nextPhase(page);
  }

  // Data should remain consistent
  const state = await getStoredState(page);
  expect(state.checkins).toHaveLength(5); // Only 4 phases + final
});
```

#### Session Handling

```typescript
test('handles session timeout gracefully', async ({ page }) => {
  // Expire auth token
  await expireAuthToken(page);

  // Attempt protected action
  await journalPage.createEntry('Title', 'Content');

  // Should redirect to login
  await expect(page).toHaveURL(/\/login/);
});
```

### Performance

**File**: `e2e/simulation/performance.spec.ts`

```typescript
test('page load benchmarks', async ({ page }) => {
  const metrics = await measurePageLoad(page, '/dashboard');

  expect(metrics.loadTime).toBeLessThan(2000); // < 2s
  expect(metrics.ttfb).toBeLessThan(600);      // < 600ms
  expect(metrics.fcp).toBeLessThan(1000);      // < 1s
});

test('memory usage stays stable', async ({ page }) => {
  const initialMemory = await getMemoryUsage(page);

  // Complete 30 days
  await runDays(page, 30);

  const finalMemory = await getMemoryUsage(page);
  const growth = finalMemory - initialMemory;

  expect(growth).toBeLessThan(50 * 1024 * 1024); // < 50MB growth
});
```

---

## Running Tests

### Local Development

```bash
# Run all simulation tests
npx playwright test e2e/simulation/

# Run specific test file
npx playwright test e2e/simulation/100-day-journey.spec.ts

# Run tests matching pattern
npx playwright test -g "Day 1-7"

# Run with UI for debugging
npx playwright test e2e/simulation/ --ui

# Run in debug mode
npx playwright test e2e/simulation/ --debug

# Run specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run with headed browser (visible)
npx playwright test --headed

# Run in parallel (default)
npx playwright test --workers=4

# Run sequentially
npx playwright test --workers=1
```

### Fast Mode (CI/CD)

```bash
# Enable fast mode (1s per phase instead of 60s)
FAST_MODE=true npx playwright test e2e/simulation/

# Or use shorter phase duration
npx playwright test e2e/simulation/ --config=playwright.fast.config.ts
```

**Fast Mode Configuration:**
```typescript
// playwright.fast.config.ts
import baseConfig from './playwright.config';

export default {
  ...baseConfig,
  use: {
    ...baseConfig.use,
    // Pass rapid testing config to tests
    rapidTesting: {
      phaseDurationMs: 1000,  // 1 second
      autoAdvance: true,
    },
  },
  workers: 4,
  fullyParallel: true,
};
```

### CI/CD Integration

#### GitHub Actions Configuration

```yaml
# .github/workflows/e2e-simulation.yml
name: 100-Day Simulation Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    # Run full simulation nightly
    - cron: '0 2 * * *'

jobs:
  simulation:
    runs-on: ubuntu-latest
    timeout-minutes: 120

    strategy:
      matrix:
        shard: [1, 2, 3, 4]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps chromium

      - name: Run simulation tests
        run: npx playwright test e2e/simulation/
          --project=chromium
          --shard=${{ matrix.shard }}/4
        env:
          FAST_MODE: true
          CI: true

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: simulation-results-${{ matrix.shard }}
          path: |
            playwright-report/
            test-results/
```

### Debugging

#### Viewing Test Traces

```bash
# Run with tracing enabled
npx playwright test e2e/simulation/ --trace=on

# Show trace viewer
npx playwright show-trace test-results/trace.zip
```

#### Analyzing Screenshots

```bash
# Screenshots are auto-captured on failure
# View in: test-results/

# Or manually capture
await page.screenshot({ path: 'screenshot.png', fullPage: true });
```

#### Using Playwright Inspector

```bash
# Pause execution for inspection
await page.pause(); // Add in test code

# Or run in debug mode
npx playwright test e2e/simulation/ --debug

# Step through each action
# Inspector allows: Step Over, Step Into, Step Out, Resume
```

---

## Advanced Usage

### Custom Simulations

#### Creating Your Own Day Sequences

```typescript
// e2e/custom-simulations/power-user.ts
import { run100DaySimulation, SimulationConfig } from '../utils/simulation-runner';

const powerUserConfig: Partial<SimulationConfig> = {
  startDay: 1,
  endDay: 30,
  phaseDurationMs: 500,
  enableJournal: true,
  enableGuidedSessions: true,
  enableCheckins: true,
  enablePractices: true,
  onDayComplete: async (day, state) => {
    // Custom validation after each day
    if (day % 7 === 0) {
      console.log(`Week ${day / 7} complete: Level ${state.level}`);
    }
  },
  onComplete: async (finalState) => {
    // Final validation
    expect(finalState.level).toBeGreaterThanOrEqual(3);
  },
};

test('power user simulation', async ({ page }) => {
  const metrics = await run100DaySimulation(page, powerUserConfig);
  expect(metrics.xpEarned).toBeGreaterThan(1800);
});
```

#### Modifying Phase Durations

```typescript
// Ultra-fast mode for smoke tests
await run100DaySimulation(page, {
  startDay: 1,
  endDay: 7,
  phaseDurationMs: 100, // 100ms per phase
  enableJournal: false,
  enableCheckins: true,
  enablePractices: false,
});
```

#### Adding Custom Assertions

```typescript
// Extend simulation with custom checks
async function runWithCustomAssertions(page: Page) {
  const customConfig: Partial<SimulationConfig> = {
    onPhaseComplete: async (day, phase) => {
      // Assert dashboard shows correct day/phase
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.expectDayAndPhase(day, phase);

      // Assert XP matches expected
      const expectedXP = calculateExpectedXP(day, phase);
      await dashboardPage.expectXP(expectedXP);
    },
  };

  return run100DaySimulation(page, customConfig);
}
```

### API Mocking

#### Supabase Mocking Strategies

```typescript
// Mock Supabase responses
test('handles Supabase downtime gracefully', async ({ page }) => {
  // Intercept and mock Supabase calls
  await page.route('**/supabase.co/**', async (route) => {
    await route.fulfill({
      status: 503,
      body: JSON.stringify({ error: 'Service Unavailable' }),
    });
  });

  // App should show offline mode
  await page.goto('/dashboard');
  await expect(page.getByText('Offline Mode')).toBeVisible();
});
```

#### LocalStorage Manipulation

```typescript
// Seed specific state
await page.evaluate((state) => {
  localStorage.setItem('consciousos-progress', JSON.stringify(state));
}, {
  level: 5,
  xp: 4000,
  streak: 45,
});
```

#### Network Interception

```typescript
// Simulate slow network
test('handles slow network', async ({ page }) => {
  await page.route('**/*', async (route) => {
    await new Promise(r => setTimeout(r, 5000)); // 5s delay
    await route.continue();
  });

  // Should show loading states
  await page.goto('/dashboard');
  await expect(page.getByText('Loading...')).toBeVisible();
});
```

---

## Troubleshooting

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Timeout waiting for selector` | Element not found | Check `data-testid` exists, use `getByRole` |
| `localStorage access denied` | Browser permissions | Ensure test context allows storage |
| `Phase transition failed` | Rapid testing not enabled | Call `enableRapidTesting(page)` first |
| `XP mismatch` | Calculation error | Check XP thresholds in day-states.ts |
| `Loop not found` | Timing issue | Add `waitForTimeout` or use `toBeVisible` |

### Flaky Test Handling

```typescript
// Add retry logic for flaky operations
test('flaky operation', async ({ page }) => {
  await expect(async () => {
    await performOperation();
    await expect(page.locator('.result')).toBeVisible();
  }).toPass({ timeout: 10000, intervals: [1000, 2000, 3000] });
});

// Or use test-level retries
test.describe('flaky suite', () => {
  test.describe.configure({ retries: 3 });

  test('sometimes fails', async () => {
    // ...
  });
});
```

### Timeout Configuration

```typescript
// playwright.config.ts
export default {
  timeout: 120000, // 2 minutes per test
  expect: {
    timeout: 10000, // 10 seconds per assertion
  },
  use: {
    actionTimeout: 15000, // 15 seconds per action
    navigationTimeout: 30000, // 30 seconds for navigation
  },
};
```

---

## Contributing

### Adding New Page Objects

```typescript
// 1. Create file: e2e/pages/NewFeaturePage.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class NewFeaturePage extends BasePage {
  readonly featureElement: Locator;

  constructor(page: Page) {
    super(page, '/app/feature');
    this.featureElement = page.locator('[data-testid="feature"]');
  }

  async performAction(): Promise<void> {
    await this.featureElement.click();
  }
}

// 2. Export from index.ts
export { NewFeaturePage } from './NewFeaturePage';

// 3. Write tests in e2e/simulation/new-feature.spec.ts
```

### Writing New Test Scenarios

```typescript
// Template for new simulation tests
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages';
import { enableRapidTesting, setPhase } from '../utils/time-simulation';
import { getDayState } from '../fixtures/day-states';
import { seedCompleteDayState } from '../utils/seed-data';

test.describe('Feature: New Capability', () => {
  test.beforeEach(async ({ page }) => {
    await enableRapidTesting(page);
  });

  test('scenario: user achieves goal', async ({ page }) => {
    // Arrange
    const state = getDayState(50);
    await seedCompleteDayState(page, state);

    // Act
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.performAction();

    // Assert
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

### Test Naming Conventions

```typescript
// Good names
test('Day 14: Level 1 → 2 transition at 500 XP');
test('Morning phase: Check-in form validation');
test('Loop dissolution: 100% completion triggers graduation');

// Avoid
test('test1');
test('stuff works');
test('validation');
```

**Pattern:** `[Context]: [Specific action] → [Expected result]`

---

## Related Documentation

- [E2E Testing Overview](E2E_TESTING.md) - General E2E documentation
- [E2E Architecture Diagrams](E2E_ARCHITECTURE_DIAGRAM.md) - Technical architecture
- [E2E Test Report Template](E2E_TEST_REPORT_TEMPLATE.md) - Reporting format
- [E2E Improvements Roadmap](E2E_IMPROVEMENTS_ROADMAP.md) - Future plans
- [e2e/README.md](../e2e/README.md) - E2E directory guide

---

*Last updated: March 2026*
