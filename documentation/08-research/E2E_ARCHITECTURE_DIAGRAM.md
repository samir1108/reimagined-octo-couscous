# E2E Testing Architecture

## Table of Contents

- [System Architecture](#system-architecture)
- [Page Object Model](#page-object-model)
- [Time Simulation Architecture](#time-simulation-architecture)
- [Test Data Flow](#test-data-flow)
- [File Structure](#file-structure)
- [Integration Points](#integration-points)

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Playwright Test Runner                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Test Execution Engine                                                │  │
│  │  • Parallel test execution                                            │  │
│  │  • Retry logic for flaky tests                                        │  │
│  │  • Reporter integration                                               │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────────────┐
│                        Browser Context Manager                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Chromium    │  │   Firefox    │  │   WebKit     │  │  Mobile      │   │
│  │  (Chrome)    │  │              │  │  (Safari)    │  │  (Emulated)  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────────────┐
│                         Page Objects Layer                                   │
│                                                                              │
│   ┌────────────────────────────────────────────────────────────────────┐   │
│   │                        BasePage (Abstract)                          │   │
│   │  • Navigation (goto())                                              │   │
│   │  • Element waiting (waitForLoad())                                  │   │
│   │  • URL validation (expectToBeOnPage())                              │   │
│   │  • Common selectors                                                 │   │
│   └────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│   ┌────────┬────────┬────────┬──────┴──────┬────────┬────────┬────────┐   │
│   ▼        ▼        ▼        ▼              ▼        ▼        ▼        ▼   │
│  ┌──┐    ┌──┐    ┌──┐    ┌──┐            ┌──┐    ┌──┐    ┌──┐    ┌──┐  │
│  │LP│    │LO│    │DA│    │JO│            │PR│    │LO│    │CH│    │ON│  │
│  └──┘    └──┘    └──┘    └──┘            └──┘    └──┘    └──┘    └──┘  │
│  ┌──┐    ┌──┐    ┌──┐    ┌──┐            ┌──┐    ┌──┐    ┌──┐    ┌──┐  │
│  │AN│                                                                 │  │
│  └──┘                                                                 │  │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────────────┐
│                        Utility Layer                                         │
│                                                                              │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│   │ Time Simulation  │  │   Seed Data      │  │ Test Helpers     │         │
│   │ ───────────────  │  │   ─────────      │  │ ────────────     │         │
│   │ • enableRapid()  │  │ • seedDayState() │  │ • waitForToast() │         │
│   │ • setPhase()     │  │ • mockProgress() │  │ • clearAuth()    │         │
│   │ • advanceDays()  │  │ • createEntry()  │  │ • getAuthToken() │         │
│   │ • nextPhase()    │  │ • mockLoops()    │  │ • waitForLoad()  │         │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘         │
│                                                                              │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│   │ Simulation       │  │   Fixtures       │  │ Network Mocking  │         │
│   │ Runner           │  │   ─────────      │  │ ───────────────  │         │
│   │ ───────────────  │  │ • DAY_STATES     │  │ • intercept()    │         │
│   │ • run100Days()   │  │ • getDayState()  │  │ • mockSupabase() │         │
│   │ • config options │  │ • Users          │  │ • setOffline()   │         │
│   │ • metrics        │  │ • Sessions       │  │ • slowNetwork()  │         │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘         │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────────────┐
│                     App Under Test (ConsciousOS)                             │
│                                                                              │
│   ┌────────────────────────────────────────────────────────────────────┐   │
│   │                    React Application                                │   │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│   │  │Dashboard │  │  Journal │  │ Practice │  │   Loop   │          │   │
│   │  │  Page    │  │   Page   │  │   Page   │  │   Page   │          │   │
│   │  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │   │
│   └────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│   ┌────────────────────────────────▼──────────────────────────────────┐   │
│   │                      State Management                              │   │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │   │
│   │  │ localStorage │  │  Context API │  │  Supabase    │           │   │
│   │  │              │  │              │  │  (Mocked)    │           │   │
│   │  └──────────────┘  └──────────────┘  └──────────────┘           │   │
│   └──────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────┘

LP = LandingPage    LO = LoginPage      DA = DashboardPage   JO = JournalPage
PR = PracticePage   LO = LoopPage       CH = CheckinPage     ON = OnboardingPage
AN = AnalyticsPage
```

### Component Interactions

```
Test File
    │
    ├──► Page Object (JournalPage)
    │       │
    │       ├──► BasePage (navigate, wait)
    │       │
    │       └──► Page Locators (selectors)
    │
    ├──► Time Simulation (setPhase, advanceDays)
    │       │
    │       └──► localStorage (rapid_testing config)
    │
    ├──► Fixtures (DAY_STATES, Users)
    │       │
    │       └──► Seed Data (mockUserProgress)
    │               │
    │               └──► App State (localStorage)
    │
    └──► Assertions (expect)
```

---

## Page Object Model

### Inheritance Hierarchy

```
                              BasePage (Abstract)
                         ┌────┴────────────────────────────────┐
                         │                                     │
              ┌──────────▼──────────┐              ┌───────────▼──────────┐
              │    LandingPage      │              │     LoginPage        │
              │  ─────────────────  │              │  ──────────────────  │
              │  • navigate()       │              │  • login()           │
              │  • clickLogin()     │              │  • loginWithEmail()  │
              │  • clickSignup()    │              │  • expectError()     │
              │  • expectLoaded()   │              │  • forgotPassword()  │
              └──────────┬──────────┘              └───────────┬──────────┘
                         │                                     │
              ┌──────────▼──────────┐              ┌───────────▼──────────┐
              │   DashboardPage     │              │     JournalPage      │
              │  ─────────────────  │              │  ──────────────────  │
              │  • navigateToX()    │              │  • createEntry()     │
              │  • expectDayPhase() │              │  • editEntry()       │
              │  • startPractice()  │              │  • deleteEntry()     │
              │  • viewLoops()      │              │  • searchEntries()   │
              │  • getProgress()    │              │  • filterByTag()     │
              └──────────┬──────────┘              └───────────┬──────────┘
                         │                                     │
              ┌──────────▼──────────┐              ┌───────────▼──────────┐
              │    PracticePage     │              │      LoopPage        │
              │  ─────────────────  │              │  ──────────────────  │
              │  • selectPractice() │              │  • createLoop()      │
              │  • startSession()   │              │  • startWorkSession()│
              │  • pauseSession()   │              │  • viewProgress()    │
              │  • complete()       │              │  • resolveLoop()     │
              │  • getXP()          │              │  • getDissolution()  │
              └──────────┬──────────┘              └───────────┬──────────┘
                         │                                     │
              ┌──────────▼──────────┐              ┌───────────▼──────────┐
              │    CheckinPage      │              │   OnboardingPage     │
              │  ─────────────────  │              │  ──────────────────  │
              │  • completeMorning()│              │  • completeStep1()   │
              │  • completeMidday() │              │  • completeStep2()   │
              │  • completeEvening()│              │  • completeStep3()   │
              │  • setMood()        │              │  • skipOnboarding()  │
              │  • setEnergy()      │              │  • expectComplete()  │
              └──────────┬──────────┘              └──────────────────────┘
                         │
              ┌──────────▼──────────┐
              │   AnalyticsPage     │
              │  ─────────────────  │
              │  • viewProgress()   │
              │  • viewStreak()     │
              │  • exportData()     │
              │  • viewInsights()   │
              └─────────────────────┘
```

### Page Object Details

#### BasePage
```typescript
abstract class BasePage {
  readonly page: Page;
  readonly url: string;

  // Navigation
  async goto(): Promise<void>
  async expectToBeOnPage(): Promise<void>
  async waitForLoad(): Promise<void>

  // Common utilities
  async getTitle(): Promise<string>
  async waitForToast(message: string): Promise<void>
  async dismissModal(): Promise<void>
}
```

#### JournalPage
```typescript
class JournalPage extends BasePage {
  // Locators
  readonly entryList: Locator;
  readonly createNewEntryButton: Locator;
  readonly titleInput: Locator;
  readonly contentEditor: Locator;

  // Actions
  async createEntry(title: string, content: string): Promise<void>
  async editEntry(id: string, content: string): Promise<void>
  async deleteEntry(id: string): Promise<void>
  async searchEntries(query: string): Promise<void>
  async addTag(tag: string): Promise<void>

  // Assertions
  async expectEntryCount(count: number): Promise<void>
  async expectEntryVisible(title: string): Promise<void>
}
```

#### LoopPage
```typescript
class LoopPage extends BasePage {
  // Locators
  readonly loopCards: Locator;
  readonly createNewLoopButton: Locator;
  readonly dissolutionProgressBar: Locator;

  // Actions
  async createLoop(pattern: string, intensity: number): Promise<void>
  async startWorkSession(loopName: string): Promise<void>
  async completeWorkSession(): Promise<void>
  async resolveLoop(loopName: string): Promise<void>

  // Assertions
  async expectLoopActive(name: string): Promise<void>
  async expectDissolutionPercent(percent: number): Promise<void>
}
```

---

## Time Simulation Architecture

### Rapid Testing API

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Rapid Testing System                                    │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                     localStorage State                               │  │
│  │                                                                      │  │
│  │  {                                                                   │  │
│  │    "consciousos_rapid_testing": {                                    │  │
│  │      "isRapidTesting": true,                                         │  │
│  │      "currentPhase": "morning",                                      │  │
│  │      "autoAdvance": false,                                           │  │
│  │      "intervalMs": 60000,                                            │  │
│  │      "simulatedTime": "2026-03-02T08:00:00Z"                         │  │
│  │    }                                                                 │  │
│  │  }                                                                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ▲                                         │
│                                    │                                         │
│   ┌────────────────────────────────┼────────────────────────────────────┐  │
│   │       Event Dispatch System    │                                    │  │
│   │                                │                                    │  │
│   │  • consciousos:rapid-testing-enabled                                 │  │
│   │  • consciousos:phase-change                                          │  │
│   │  • consciousos:auto-advance-change                                   │  │
│   │  • consciousos:day-advance                                           │  │
│   └────────────────────────────────┼────────────────────────────────────┘  │
│                                    │                                         │
│   ┌────────────────────────────────┼────────────────────────────────────┐  │
│   │      Test Utility Functions    │                                    │  │
│   │                                ▼                                    │  │
│   │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │  │
│   │  │enableRapid     │  │    setPhase    │  │  advanceDays   │        │  │
│   │  │   Testing()    │──►    (phase)     │──►   (count)      │        │  │
│   │  └────────────────┘  └────────────────┘  └────────────────┘        │  │
│   │         │                   │                   │                  │  │
│   │         ▼                   ▼                   ▼                  │  │
│   │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │  │
│   │  │  nextPhase()   │  │completeDayCycle│  │getSimulatedTime│        │  │
│   │  └────────────────┘  └────────────────┘  └────────────────┘        │  │
│   └────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phase Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ MORNING │────►│ MIDDAY  │────►│ EVENING │────►│  NIGHT  │
│  5-11am │     │ 11am-5pm│     │ 5pm-9pm │     │ 9pm-5am │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     ▼               ▼               ▼               ▼
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
• Check-in    • Reset       • Reflection  • Sleep check
• Intention   • Body scan   • Journal     • Gratitude
• Meditation  • Quick check • Inquiry     • Wind-down
└─────────┘     └─────────┘     └─────────┘     └─────────┘
     │               │               │               │
     └───────────────┴───────────────┴───────────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │   Next Day  │
                  └─────────────┘
```

### Simulation Runner Flow

```
run100DaySimulation()
        │
        ├──► enableRapidTesting()
        │
        ├──► clearUserProgress()
        │
        ├──► FOR day = 1 to 100
        │       │
        │       ├──► getDayState(day)
        │       │
        │       ├──► seedCompleteDayState(dayState)
        │       │
        │       ├──► FOR phase IN [morning, midday, evening, night]
        │       │       │
        │       │       ├──► setPhase(phase)
        │       │       │
        │       │       ├──► performPhaseActivities()
        │       │       │       ├──► journal entry
        │       │       │       ├──► checkin
        │       │       │       ├──► practice
        │       │       │       └──► guided session
        │       │       │
        │       │       ├──► wait(phaseDuration)
        │       │       │
        │       │       └──► onPhaseComplete callback
        │       │
        │       ├──► onDayComplete callback
        │       │
        │       └──► trackLevelUps()
        │
        ├──► onComplete callback
        │
        └──► Return SimulationMetrics
```

---

## Test Data Flow

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Test Data Flow                                  │
│                                                                              │
│  ┌─────────────────┐                                                        │
│  │   DAY_STATES    │                                                        │
│  │  (Fixtures)     │                                                        │
│  │                 │                                                        │
│  │ • initial       │                                                        │
│  │ • week1         │                                                        │
│  │ • week2         │                                                        │
│  │ • month1        │                                                        │
│  │ • month2        │                                                        │
│  │ • month3        │                                                        │
│  │ • day100        │                                                        │
│  └────────┬────────┘                                                        │
│           │                                                                  │
│           │ getDayState(n)                                                   │
│           ▼                                                                  │
│  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐    │
│  │   Seed Data     │─────►│  localStorage   │─────►│   App State     │    │
│  │   Utilities     │      │   Mocking       │      │   Management    │    │
│  │                 │      │                 │      │                 │    │
│  │ • seedComplete  │      │ • user-profile  │      │ • Context API   │    │
│  │ • mockProgress  │      │ • daily-journey │      │ • React State   │    │
│  │ • createEntry   │      │ • journal-      │      │ • Zustand Store │    │
│  │ • mockLoops     │      │   entries       │      │                 │    │
│  └─────────────────┘      │ • active-loops  │      └────────┬────────┘    │
│                           │ • progress      │               │             │
│                           └─────────────────┘               │             │
│                                                             │             │
│                           ┌─────────────────┐               │             │
│                           │  Supabase Mock  │◄──────────────┘             │
│                           │  (Optional)     │                             │
│                           │                 │                             │
│                           │ • intercept()   │                             │
│                           │ • mockResponse  │                             │
│                           └─────────────────┘                             │
│                                    │                                      │
│                                    ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                          UI Components                               │  │
│  │                                                                      │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │Dashboard │  │  Journal │  │ Practice │  │   Loop   │           │  │
│  │  │   View   │  │   List   │  │  Timer   │  │   Cards  │           │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                    │                                      │
│                                    ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                            Assertions                                │  │
│  │                                                                      │  │
│  │  • expect(element).toBeVisible()                                    │  │
│  │  • expect(page).toHaveURL()                                         │  │
│  │  • expect(data).toEqual(expected)                                   │  │
│  │  • expect(metrics).toPassThresholds()                               │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### State Seeding Process

```
seedCompleteDayState(page, dayState)
        │
        ├──► Seed User Profile
        │       ├──► level, xp, streak
        │       ├──► createdAt, updatedAt
        │       └──► localStorage.setItem('consciousos-user', ...)
        │
        ├──► Seed Daily Journey
        │       ├──► dayNumber, currentPhase
        │       ├──► completedBlocks
        │       └──► localStorage.setItem('consciousos_daily_journey', ...)
        │
        ├──► Seed Journal Entries
        │       ├──► Generate entries based on dayNumber
        │       └──► localStorage.setItem('consciousos-journal-entries', ...)
        │
        ├──► Seed Practices
        │       ├──► Generate completed practices
        │       └──► localStorage.setItem('consciousos-completed-practices', ...)
        │
        ├──► Seed Loops
        │       ├──► Create active loops from dayState
        │       └──► localStorage.setItem('consciousos-active-loops', ...)
        │
        └──► Seed Check-ins
                ├──► Generate phase check-ins
                └──► localStorage.setItem('consciousos-checkins', ...)
```

---

## File Structure

### Complete Directory Tree

```
e2e/
│
├── simulation/                    # 100-day simulation tests
│   ├── 100-day-journey.spec.ts    # Main 100-day journey
│   ├── day-cycle.spec.ts          # Daily phase cycle tests
│   ├── edge-cases.spec.ts         # Edge case and stress tests
│   ├── index.ts                   # Simulation exports
│   ├── level-progression.spec.ts  # Level mechanics tests
│   ├── loop-lifecycle.spec.ts     # Loop system tests
│   └── performance.spec.ts        # Performance benchmarks
│
├── pages/                         # Page Object Models
│   ├── AnalyticsPage.ts           # Analytics page POM
│   ├── BasePage.ts                # Base page abstract class
│   ├── CheckinPage.ts             # Check-in page POM
│   ├── DashboardPage.ts           # Dashboard page POM
│   ├── index.ts                   # Page exports
│   ├── JournalPage.ts             # Journal page POM
│   ├── LandingPage.ts             # Landing page POM
│   ├── LoginPage.ts               # Login page POM
│   ├── LoopPage.ts                # Loop page POM
│   ├── OnboardingPage.ts          # Onboarding page POM
│   └── PracticePage.ts            # Practice page POM
│
├── fixtures/                      # Test data fixtures
│   ├── day-states.ts              # Day state definitions
│   ├── sessions.ts                # Session fixtures
│   └── users.ts                   # User fixtures
│
├── utils/                         # Utility functions
│   ├── seed-data.ts               # Data seeding utilities
│   ├── simulation-runner.ts       # 100-day simulation runner
│   ├── test-helpers.ts            # Common test helpers
│   └── time-simulation.ts         # Time manipulation utilities
│
├── auth.spec.ts                   # Authentication tests
├── daily-flow.spec.ts             # Daily flow tests
├── global-setup.ts                # Global test setup
├── global-teardown.ts             # Global test teardown
├── journal.spec.ts                # Journal feature tests
├── loops.spec.ts                  # Loop feature tests
├── practice.spec.ts               # Practice feature tests
└── README.md                      # E2E directory documentation
```

### File Relationships

```
Test Files (.spec.ts)
        │
        ├──► Import Page Objects
        │       ├──► pages/index.ts
        │       ├──► pages/*Page.ts
        │       └──► pages/BasePage.ts
        │
        ├──► Import Utilities
        │       ├──► utils/time-simulation.ts
        │       ├──► utils/seed-data.ts
        │       ├───► utils/test-helpers.ts
        │       └──► utils/simulation-runner.ts
        │
        ├──► Import Fixtures
        │       ├──► fixtures/day-states.ts
        │       ├──► fixtures/users.ts
        │       └──► fixtures/sessions.ts
        │
        └──► Import Playwright
                └──► @playwright/test

Configuration Files
        │
        ├──► playwright.config.ts
        │       ├──► Defines projects (Chromium, Firefox, WebKit)
        │       ├──► Sets timeout values
        │       ├──► Configures reporters
        │       └──► Specifies testMatch patterns
        │
        ├──► global-setup.ts
        │       └──► Runs once before all tests
        │
        └──► global-teardown.ts
                └──► Runs once after all tests
```

---

## Integration Points

### Playwright Configuration

```typescript
// playwright.config.ts integration
export default defineConfig({
  // Test directory
  testDir: './e2e',

  // Simulation tests timeout (longer for 100-day sim)
  timeout: 120000,

  // Parallel execution
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,

  // Global setup/teardown
  globalSetup: require.resolve('./e2e/global-setup'),
  globalTeardown: require.resolve('./e2e/global-teardown'),

  // Projects
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  // Reporters
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
});
```

### Package.json Scripts

```json
{
  "scripts": {
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "e2e:debug": "playwright test --debug",
    "e2e:report": "playwright show-report",
    "e2e:simulation": "playwright test e2e/simulation/",
    "e2e:fast": "FAST_MODE=true playwright test e2e/simulation/",
    "e2e:100day": "playwright test e2e/simulation/100-day-journey.spec.ts"
  }
}
```

### CI/CD Pipeline

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run e2e:fast
        env:
          FAST_MODE: true

      - name: Upload results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: test-results/
```

### Environment Variables

```
# .env (for local testing)
E2E_TEST_USER_EMAIL=test@consciousos.app
E2E_TEST_USER_PASSWORD=TestPass123!
E2E_PREMIUM_USER_EMAIL=premium@consciousos.app
E2E_PREMIUM_USER_PASSWORD=PremiumPass123!

# CI Environment
FAST_MODE=true              # Enable fast simulation mode
CI=true                     # CI detection
PLAYWRIGHT_WORKERS=4        # Parallel workers
PLAYWRIGHT_TIMEOUT=120000   # Test timeout
```

### Rapid Testing API Contract

```typescript
// App exposes this API for test manipulation
interface ConsciousOSRapidTestingAPI {
  // Enable/disable rapid testing mode
  enableRapidTesting(config: RapidTestingConfig): void;

  // Set current phase
  setPhase(phase: Phase): void;

  // Advance days
  advanceDays(count: number): void;

  // Complete day cycle
  completeDayCycle(): void;

  // Get current simulated time
  getSimulatedTime(): Date;
}

// Events dispatched by tests, listened by app
type ConsciousOSEvents =
  | 'consciousos:rapid-testing-enabled'
  | 'consciousos:phase-change'
  | 'consciousos:auto-advance-change'
  | 'consciousos:day-advance';

// localStorage keys used
const STORAGE_KEYS = {
  RAPID_TESTING: 'consciousos_rapid_testing',
  DAILY_JOURNEY: 'consciousos_daily_journey',
  USER_PROFILE: 'consciousos-user',
  JOURNAL_ENTRIES: 'consciousos-journal-entries',
  PRACTICES: 'consciousos-completed-practices',
  LOOPS: 'consciousos-active-loops',
  CHECKINS: 'consciousos-checkins',
  PROGRESS: 'consciousos-progress',
};
```

---

## Related Documentation

- [E2E 100-Day Testing Guide](E2E_100_DAY_TESTING.md) - Comprehensive testing guide
- [E2E Test Report Template](E2E_TEST_REPORT_TEMPLATE.md) - Reporting format
- [E2E Improvements Roadmap](E2E_IMPROVEMENTS_ROADMAP.md) - Future plans
- [e2e/README.md](../e2e/README.md) - E2E directory guide
- [Main E2E Documentation](E2E_TESTING.md) - General E2E overview

---

*Last updated: March 2026*
