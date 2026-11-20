# E2E Testing Documentation

## Overview

ConsciousOS uses [Playwright](https://playwright.dev/) for end-to-end (E2E) testing. This ensures critical user flows work correctly across different browsers and devices.

## Test Coverage

### Critical User Flows

1. **Authentication Flow** (`auth.spec.ts`)
   - Landing Page → Login → Dashboard
   - Error handling for invalid credentials
   - Session persistence

2. **Daily Check-in Flow** (`daily-flow.spec.ts`)
   - Dashboard → Morning Check-in → Set Intention → Dashboard
   - Mood tracking
   - Sleep quality input
   - Intention setting

3. **Practice Session Flow** (`practice.spec.ts`)
   - Dashboard → Select Practice → Complete Session → Earn XP
   - Practice selection
   - Timer functionality
   - XP awarding
   - Pause/resume

4. **Journal Entry Flow** (`journal.spec.ts`)
   - Dashboard → Journal → Create Entry → Auto-save
   - Entry creation
   - Auto-save functionality
   - Persistence after navigation
   - Rich text support

5. **Loop Work Flow** (`loops.spec.ts`)
   - Dashboard → Loop Section → Identify Pattern → Dissolution
   - View active loops
   - Pattern identification
   - Session completion
   - Progress tracking

## Running Tests

### Prerequisites

```bash
# Install dependencies (includes Playwright)
npm install

# Install browser binaries
npx playwright install
```

### Available Commands

```bash
# Run all E2E tests
npm run e2e

# Run tests with UI mode (for debugging)
npm run e2e:ui

# Run tests in debug mode
npm run e2e:debug

# Show test report
npm run e2e:report

# Run tests for specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run specific test file
npx playwright test auth.spec.ts

# Run tests matching pattern
npx playwright test --grep "login"
```

## Test Structure

```
e2e/
├── auth.spec.ts              # Authentication flows
├── daily-flow.spec.ts        # Daily check-in flow
├── practice.spec.ts          # Practice session flow
├── journal.spec.ts           # Journal entry flow
├── loops.spec.ts             # Loop work flow
├── global-setup.ts           # Global test setup
├── global-teardown.ts        # Global test teardown
├── fixtures/
│   ├── users.ts              # Test user data
│   └── sessions.ts           # Test session data
├── pages/
│   ├── BasePage.ts           # Base page object
│   ├── LandingPage.ts        # Landing page POM
│   ├── LoginPage.ts          # Login page POM
│   ├── DashboardPage.ts      # Dashboard page POM
│   └── index.ts              # Page exports
└── utils/
    └── test-helpers.ts       # Test utilities
```

## Page Object Model (POM)

Tests use the Page Object Model pattern for maintainability:

```typescript
// Example usage in tests
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

test('user can login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password');
  await dashboardPage.expectPageLoaded();
});
```

## Test Data

### Environment Variables

Create a `.env` file for test credentials:

```env
E2E_TEST_USER_EMAIL=test@consciousos.app
E2E_TEST_USER_PASSWORD=TestPass123!
E2E_PREMIUM_USER_EMAIL=premium@consciousos.app
E2E_PREMIUM_USER_PASSWORD=PremiumPass123!
```

### Test Fixtures

Test users are defined in `e2e/fixtures/users.ts`:

- `standard` - Regular test user
- `premium` - Premium tier user
- `admin` - Admin user
- `newUser` - For onboarding flow tests

## Visual Regression Testing

Playwright includes visual regression testing:

```typescript
test('dashboard visual regression', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard.png');
});
```

### Update Snapshots

```bash
# Update all snapshots
npx playwright test --update-snapshots

# Update snapshots for specific browser
npx playwright test --update-snapshots --project=chromium
```

## CI/CD Integration

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main`
- Manual workflow dispatch

### GitHub Actions

The workflow file `.github/workflows/e2e.yml`:
- Runs tests on Chromium, Firefox, and WebKit
- Uploads test reports and screenshots on failure
- Supports visual regression updates via workflow dispatch

## Best Practices

### Writing Tests

1. **Use Page Objects**: Encapsulate page interactions in POM classes
2. **Independent Tests**: Each test should be self-contained
3. **Data Attributes**: Use `data-testid` for reliable selectors
4. **Retry Logic**: Playwright retries failed tests automatically
5. **Cleanup**: Clear auth state before/after tests

### Selectors

Prefer these selector strategies (in order):
1. `getByRole()` - Accessible role selectors
2. `getByTestId()` - Custom data-testid attributes
3. `getByText()` - Text content
4. `getByLabel()` - Form labels
5. CSS selectors - Last resort

### Debugging

```bash
# Run with UI mode
npx playwright test --ui

# Run in debug mode
npx playwright test --debug

# Show browser
npx playwright test --headed

# Slow motion (for visual debugging)
npx playwright test --slow-mo 500
```

## Troubleshooting

### Tests Fail in CI but Pass Locally

1. Check for environment differences (env vars, API endpoints)
2. Increase timeouts for slower CI runners
3. Check for race conditions
4. Verify browser versions match

### Flaky Tests

1. Add explicit waits for dynamic content
2. Use `waitFor` for network requests
3. Disable animations in test environment
4. Increase retry count in CI

### Browser Installation Issues

```bash
# Reinstall browsers
npx playwright install --force

# Install with dependencies (Linux)
npx playwright install-deps
```

## Configuration

### playwright.config.ts

Key configuration options:
- `baseURL` - Base URL for tests (default: http://localhost:5173)
- `projects` - Browser configurations
- `webServer` - Development server settings
- `expect` - Screenshot comparison settings

### Environment-Specific Settings

Override settings via environment variables:

```bash
# Custom base URL
PLAYWRIGHT_BASE_URL=https://staging.consciousos.app npx playwright test

# Skip web server
SKIP_WEB_SERVER=true npx playwright test
```

## 100-Day Simulation Testing

### Overview

Our advanced E2E testing includes a comprehensive 100-day user journey simulation that validates:
- Complete user lifecycle from onboarding to mastery
- All 4 daily phases (Morning, Midday, Evening, Night)
- Level progression (1-21)
- Loop lifecycle (detection → work → dissolution)
- XP and streak calculations
- Network resilience
- Performance benchmarks

### Test Files

- `e2e/simulation/100-day-journey.spec.ts` - Main 100-day simulation
- `e2e/simulation/day-cycle.spec.ts` - Daily phase testing
- `e2e/simulation/edge-cases.spec.ts` - Hardcore edge case testing
- `e2e/simulation/performance.spec.ts` - Performance benchmarks
- `e2e/simulation/level-progression.spec.ts` - Level mechanics
- `e2e/simulation/loop-lifecycle.spec.ts` - Loop system testing

### Running 100-Day Tests

```bash
# Run all simulation tests
npx playwright test e2e/simulation/

# Run specific period
npx playwright test -g "Day 1-7"

# Run fast mode (CI)
FAST_MODE=true npx playwright test e2e/simulation/
```

### Time Simulation

Tests use the app's built-in Rapid Testing Mode to:
- Jump between time phases instantly
- Advance days without waiting
- Test all scenarios quickly

See [docs/E2E_100_DAY_TESTING.md](E2E_100_DAY_TESTING.md) for full documentation.

---

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Test Generator](https://playwright.dev/docs/codegen)
- [E2E 100-Day Testing](E2E_100_DAY_TESTING.md) - Comprehensive simulation guide
- [E2E Architecture Diagrams](E2E_ARCHITECTURE_DIAGRAM.md) - Technical architecture
- [E2E Test Report Template](E2E_TEST_REPORT_TEMPLATE.md) - Reporting format
- [E2E Improvements Roadmap](E2E_IMPROVEMENTS_ROADMAP.md) - Future plans
- [e2e/README.md](../e2e/README.md) - E2E directory guide
