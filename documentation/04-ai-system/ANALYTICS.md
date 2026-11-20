# ConsciousOS Analytics Documentation

## Overview

This document describes the analytics and tracking infrastructure for ConsciousOS, including event taxonomy, privacy compliance, and implementation guidelines.

## Table of Contents

1. [Event Taxonomy](#event-taxonomy)
2. [Analytics Service](#analytics-service)
3. [Privacy & Compliance](#privacy--compliance)
4. [Machine Integration](#machine-integration)
5. [React Hooks](#react-hooks)
6. [Dashboard Components](#dashboard-components)
7. [Data Export/Deletion](#data-exportdeletion)
8. [Best Practices](#best-practices)

---

## Event Taxonomy

All analytics events are defined in `src/lib/analytics/events.ts` and organized by domain.

### Event Categories

| Category | Description | Example Events |
|----------|-------------|----------------|
| `user` | User lifecycle events | `user_registered`, `user_logged_in` |
| `practice` | Practice session tracking | `practice_started`, `practice_completed` |
| `daily` | Daily flow interactions | `daily_checkin_completed`, `daily_intention_set` |
| `xp` | Gamification metrics | `xp_earned`, `level_up`, `streak_milestone` |
| `guru` | AI guide interactions | `guru_session_started`, `guru_message_sent` |
| `loops` | Conscious loops tracking | `loop_identified`, `loop_work_started` |
| `journal` | Journal entry management | `journal_entry_created`, `journal_recording_started` |
| `journey` | Quest and milestone tracking | `journey_quest_started`, `journey_milestone_reached` |
| `navigation` | UI navigation events | `navigation_page_viewed`, `navigation_tab_switched` |
| `error` | Error tracking | `error_caught`, `retry_attempted` |
| `feature` | Feature usage | `feature_discovered`, `tutorial_completed` |

### Using Events

```typescript
import { AnalyticsEvents } from '@/lib/analytics';

// Access event names
analytics.track(AnalyticsEvents.PRACTICE.STARTED, {
  practiceType: 'meditation',
  duration: 600,
});
```

---

## Analytics Service

The `AnalyticsService` class provides the core tracking functionality with privacy controls, queue management, and batching.

### Basic Usage

```typescript
import { analytics } from '@/lib/analytics';

// Track an event
analytics.track(AnalyticsEvents.PRACTICE.STARTED, {
  practiceType: 'meditation',
  duration: 600,
});

// Track page view
analytics.trackPageView('/dashboard', { section: 'home' });

// Set user ID (hashed internally)
analytics.setUserId('user-123');
```

### Configuration

```typescript
const analytics = new AnalyticsService({
  flushInterval: 5000,    // Flush queue every 5 seconds
  maxBatchSize: 50,       // Max events per batch
  maxQueueSize: 1000,     // Max events in queue
  endpoint: '/api/analytics/events',
  debug: true,            // Enable debug logging
  retentionDays: 90,      // Data retention period
});
```

### Queue Management

Events are queued and flushed automatically:
- **High priority**: Immediate flush (errors, critical events)
- **Normal priority**: Standard batching
- **Low priority**: Deferred/bulk processing

---

## Privacy & Compliance

### GDPR/CCPA Compliance

The analytics system is designed with privacy-first principles:

1. **No PII Collection**: User IDs are SHA-256 hashed
2. **Granular Consent**: Users can control tracking preferences
3. **Data Export**: Users can request their data (GDPR Article 15)
4. **Data Deletion**: Users can request deletion (GDPR Article 17 / CCPA)
5. **Opt-Out Support**: Global opt-out mechanism

### Consent Management

```typescript
// Check consent status
if (analytics.hasConsent()) {
  // Safe to track
}

// Set granular consent
analytics.setConsent({
  analytics: true,
  errorTracking: true,
  performance: false,
  marketing: false,
});

// Revoke all consent
analytics.revokeConsent();
```

### Privacy Components

#### PrivacyConsentBanner

```tsx
import { PrivacyConsentBanner } from '@/components/analytics';

function App() {
  return (
    <>
      <AppContent />
      <PrivacyConsentBanner 
        delay={2000}
        position="bottom"
        onConsentSaved={(prefs) => console.log('Consent saved:', prefs)}
      />
    </>
  );
}
```

#### PrivacySettingsDialog

```tsx
import { PrivacySettingsDialog } from '@/components/analytics';

function Settings() {
  const [open, setOpen] = useState(false);
  
  return (
    <PrivacySettingsDialog
      open={open}
      onOpenChange={setOpen}
    />
  );
}
```

### Events Requiring Consent

Most events require user consent. The following events are exempt:
- `user_consent_granted`
- `user_consent_revoked`
- `user_data_export_requested`
- `user_data_deletion_requested`
- `error_caught`

---

## Machine Integration

XState machines can automatically track events using the analytics integration helper.

### Basic Integration

```typescript
import { AnalyticsActions } from '@/machines/analyticsIntegration';

export const myMachine = setup({
  actions: {
    startPractice: [
      assign({ /* ... */ }),
      () => AnalyticsActions.practice.started('meditation', 600),
    ],
  },
}).createMachine({
  // ...
});
```

### Available Action Helpers

```typescript
AnalyticsActions.practice.started(type, duration)
AnalyticsActions.practice.completed(type, actualDuration)
AnalyticsActions.practice.paused(type, elapsedSeconds)
AnalyticsActions.user.loggedIn(method)
AnalyticsActions.user.loggedOut()
AnalyticsActions.guru.sessionStarted(sessionType)
AnalyticsActions.journal.entryCreated(hasMood, hasTags)
// ... and more
```

### Custom Machine Tracking

```typescript
import { trackMachineTransition, trackMachineAction } from '@/machines/analyticsIntegration';

// Track state transitions
trackMachineTransition('practiceMachine', 'idle', 'active', 'START_PRACTICE');

// Track actions
trackMachineAction('practiceMachine', 'completePractice', { duration: 600 });
```

---

## React Hooks

### useAnalytics

Main hook for tracking in components:

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

function MyComponent() {
  const { track, trackPageView, trackError, hasConsent } = useAnalytics();
  
  useEffect(() => {
    trackPageView('my-page');
  }, []);
  
  const handleClick = () => {
    track(AnalyticsEvents.FEATURE.FEATURE_USED, {
      featureName: 'my-feature',
    });
  };
  
  return <button onClick={handleClick}>Click</button>;
}
```

### usePageViewTracking

Automatic page view tracking:

```typescript
import { usePageViewTracking } from '@/hooks/useAnalytics';

function App() {
  usePageViewTracking(); // Tracks on route change
  return <Routes>...</Routes>;
}
```

### useConsent

Manage consent state:

```typescript
import { useConsent } from '@/hooks/useAnalytics';

function ConsentSettings() {
  const { consent, hasConsent, updateConsent, revokeConsent } = useConsent();
  
  return (
    <div>
      <p>Analytics: {hasConsent ? 'Enabled' : 'Disabled'}</p>
      <button onClick={() => updateConsent({ analytics: true })}>
        Enable Analytics
      </button>
    </div>
  );
}
```

### Other Hooks

- `useEngagementTracking`: Track component engagement time
- `useInteractionTracking`: Track clicks, hovers, focus
- `useFormTracking`: Track form interactions
- `useTimingTracking`: Track operation durations
- `useAnalyticsQueue`: Monitor queue status
- `useFeatureTracking`: Track feature adoption

---

## Dashboard Components

### FeedbackAnalyticsDashboard

Displays user feedback data with visualizations:

```tsx
import { FeedbackAnalyticsDashboard } from '@/components/analytics';

function Dashboard() {
  return <FeedbackAnalyticsDashboard />;
}
```

Features:
- Rating distribution charts
- Weekly trend visualization
- Category breakdown
- Average ratings

### Safe Analytics Components

All analytics components have safe versions with error boundaries:

```tsx
import { 
  SafeFeedbackAnalyticsDashboard,
  SafeAIInsights,
  SafeMonthlyReport 
} from '@/components/analytics';

function Dashboard() {
  return (
    <>
      <SafeFeedbackAnalyticsDashboard />
      <SafeAIInsights />
      <SafeMonthlyReport />
    </>
  );
}
```

---

## Data Export/Deletion

### User Data Export

Users can request their data export:

```typescript
// Via analytics service
await analytics.requestDataExport();

// Via hook
const { requestDataExport } = useAnalytics();
await requestDataExport();
```

The export includes:
- Profile information
- Practice history
- Journal entries
- XP and achievements
- Loop work records

### Data Deletion

Users can request complete data deletion:

```typescript
// Via analytics service
await analytics.requestDataDeletion();

// Via hook
const { requestDataDeletion } = useAnalytics();
await requestDataDeletion();
```

This will:
1. Delete all local storage data
2. Clear pending events
3. Revoke consent
4. Request server-side deletion
5. Log out the user

### GDPR/CCPA Compliance

The PrivacySettingsDialog provides UI for these operations:

```tsx
<PrivacySettingsDialog 
  open={open} 
  onOpenChange={setOpen} 
/>
```

---

## Best Practices

### 1. Always Check Consent

```typescript
const { hasConsent } = useAnalytics();

if (hasConsent) {
  // Track sensitive events
}
```

### 2. No PII in Events

❌ **Don't**:
```typescript
analytics.track('user_action', {
  email: user.email, // ❌ PII!
  name: user.name,   // ❌ PII!
});
```

✅ **Do**:
```typescript
analytics.track('user_action', {
  userIdHash: hashedId, // ✅ Hashed ID
  accountAge: 30,       // ✅ Anonymized metric
});
```

### 3. Use Event Taxonomy

❌ **Don't**:
```typescript
analytics.track('button_clicked'); // ❌ Generic
```

✅ **Do**:
```typescript
analytics.track(AnalyticsEvents.FEATURE.FEATURE_USED, {
  featureName: 'daily_checkin',
  featureCategory: 'daily_flow',
});
```

### 4. Batch Related Events

Use action arrays in XState for atomic tracking:

```typescript
actions: [
  assign({ /* state update */ }),
  () => AnalyticsActions.practice.completed(),
]
```

### 5. Handle Offline Gracefully

The service automatically queues events when offline and flushes when back online.

### 6. Set Appropriate Priority

```typescript
// High priority - immediate flush
analytics.track('critical_event', {}, EVENT_PRIORITY.HIGH);

// Low priority - batch with others
analytics.track('page_view', {}, EVENT_PRIORITY.LOW);
```

### 7. Monitor Queue Health

```typescript
const { pending, offline, isOnline } = useAnalyticsQueue();

if (!isOnline) {
  showWarning(`You're offline. ${pending} events queued.`);
}
```

### 8. Clean Up on Unmount

```typescript
useEffect(() => {
  return () => {
    analytics.destroy(); // Flushes remaining events
  };
}, []);
```

---

## API Reference

### Analytics Service Methods

| Method | Description |
|--------|-------------|
| `track(event, props?, priority?)` | Track an event |
| `trackPageView(page, props?)` | Track page view |
| `trackAction(action, category, props?)` | Track user action |
| `trackError(error, context?)` | Track error |
| `setUserId(userId)` | Set hashed user ID |
| `setConsent(prefs)` | Set consent preferences |
| `revokeConsent()` | Revoke all consent |
| `hasConsent()` | Check if tracking allowed |
| `requestDataExport()` | Request GDPR export |
| `requestDataDeletion()` | Request GDPR deletion |
| `getQueueStats()` | Get queue statistics |
| `destroy()` | Cleanup and flush |

### Event Priority Levels

| Priority | Value | Use Case |
|----------|-------|----------|
| `HIGH` | 1 | Critical events, errors |
| `NORMAL` | 2 | Standard events |
| `LOW` | 3 | Page views, bulk events |

---

## Troubleshooting

### Events Not Tracking

1. Check consent: `analytics.hasConsent()`
2. Check debug logs: enable `debug: true`
3. Verify queue status: `analytics.getQueueStats()`
4. Check network connectivity

### TypeScript Errors

Ensure proper imports:
```typescript
import { AnalyticsEvents } from '@/lib/analytics';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AnalyticsActions } from '@/machines/analyticsIntegration';
```

### Privacy Banner Not Showing

- Check if consent already stored: `localStorage.getItem('cos_analytics_consent_v1')`
- Check if globally opted out: `localStorage.getItem('cos_analytics_opt_out')`
- Ensure delay prop is appropriate

---

## Changelog

### v1.0.0
- Initial analytics infrastructure
- Event taxonomy with 100+ events
- GDPR/CCPA compliant consent management
- Machine integration helpers
- React hooks for tracking
- Data export/deletion functionality
- Privacy components

---

## Support

For analytics-related issues:
1. Check this documentation
2. Review console logs with `debug: true`
3. Verify privacy settings
4. Check network requests to `/api/analytics/events`
