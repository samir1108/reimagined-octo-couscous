# Monitoring System Documentation

## Overview

The ConsciousOS monitoring system provides comprehensive error tracking, logging, health checks, and performance monitoring for production-grade reliability.

## Architecture

```
src/lib/monitoring/
├── index.ts       # Main exports and initialization
├── sentry.ts      # Sentry error tracking integration
├── logger.ts      # Structured logging system
├── health.ts      # Health check system
└── performance.ts # Performance monitoring (Core Web Vitals)
```

## Components

```
src/components/monitoring/
└── StatusDashboard.tsx  # Real-time status monitoring UI
```

## Quick Start

### 1. Initialize Monitoring

Add to your application entry point (e.g., `main.tsx`):

```typescript
import { initMonitoring } from '@/lib/monitoring';

// Initialize all monitoring systems
initMonitoring();
```

Or initialize individually:

```typescript
import { initSentry, initPerformanceMonitoring } from '@/lib/monitoring';

initSentry();
initPerformanceMonitoring();
```

### 2. Environment Variables

Add to your `.env` file:

```bash
# Sentry Configuration
VITE_SENTRY_DSN=https://your-sentry-dsn.ingest.sentry.io/project-id
VITE_APP_VERSION=1.0.0
```

## Sentry Integration

### Error Tracking

```typescript
import { captureError, captureMessage } from '@/lib/monitoring';

try {
  // Your code
} catch (error) {
  captureError(error as Error, {
    component: 'MyComponent',
    action: 'userAction',
  });
}

// Log informational messages
captureMessage('User completed onboarding', 'info');
```

### User Context

```typescript
import { setUserContext, clearUserContext } from '@/lib/monitoring';

// Set user context (use hashed IDs, never email)
setUserContext(user.id, { plan: 'premium' });

// Clear on logout
clearUserContext();
```

### Breadcrumbs

```typescript
import { addBreadcrumb } from '@/lib/monitoring';

addBreadcrumb('User opened settings', 'navigation', 'info');
```

## Structured Logging

### Basic Usage

```typescript
import { logger } from '@/lib/monitoring';

logger.debug('Debug message', { component: 'MyComponent' });
logger.info('User action completed', { userId: '123', action: 'save' });
logger.warn('API rate limit approaching');
logger.error('Request failed', error, { endpoint: '/api/data' });
logger.fatal('Critical system failure', error);
```

### Log Levels

- `debug` - Development-only detailed information
- `info` - General operational information
- `warn` - Warning conditions
- `error` - Error conditions
- `fatal` - Critical errors requiring immediate attention

### Configuration

```typescript
import { logger } from '@/lib/monitoring';

// Set minimum log level
logger.setLogLevel('info'); // Only info and above will be logged
```

## Health Checks

### Built-in Checks

The system automatically monitors:

- **Supabase** - Database connectivity
- **Online** - Network connection status
- **Auth** - Authentication service
- **Storage** - Local storage availability

### Custom Health Checks

```typescript
import { healthMonitor } from '@/lib/monitoring';

// Register custom check
healthMonitor.register({
  name: 'payment-api',
  check: async () => {
    const response = await fetch('/api/health');
    return response.ok;
  },
  critical: true, // Affects overall health status
  description: 'Payment gateway connectivity',
});

// Start periodic monitoring
healthMonitor.startMonitoring(30000); // Check every 30 seconds

// Manual check
const { healthy, results } = await healthMonitor.checkAll();
```

### Health Check Events

```typescript
import { healthMonitor } from '@/lib/monitoring';

// Subscribe to updates
const unsubscribe = healthMonitor.subscribe((result) => {
  console.log('Health status:', result.healthy);
  console.log('Results:', result.results);
});

// Cleanup
unsubscribe();
```

## Performance Monitoring

### Core Web Vitals

Automatically tracks:

- **CLS** (Cumulative Layout Shift) - Visual stability
- **FCP** (First Contentful Paint) - Initial load
- **LCP** (Largest Contentful Paint) - Main content load
- **TTFB** (Time to First Byte) - Server response
- **INP** (Interaction to Next Paint) - Responsiveness

### Custom Performance Measurement

```typescript
import { 
  measureOperation, 
  mark, 
  measure 
} from '@/lib/monitoring';

// Measure a function
const result = measureOperation('dataFetch', () => {
  return fetchData();
});

// Manual marking
mark('start-operation');
// ... do work
mark('end-operation');
measure('operation-duration', 'start-operation', 'end-operation');
```

### Resource Monitoring

Slow resources (>1s) are automatically logged:

```
[PerformanceMonitor] Slow resource loaded: /api/large-data (2.5s)
```

## Status Dashboard

### Usage

```tsx
import { StatusDashboard } from '@/components/monitoring/StatusDashboard';

function AdminPage() {
  return (
    <div>
      <h1>System Administration</h1>
      <StatusDashboard />
    </div>
  );
}
```

### Features

- Real-time health status visualization
- Automatic refresh every 30 seconds
- Manual refresh capability
- Critical service alerts
- Service status history

## Error Boundaries

Error boundaries automatically report to Sentry:

```tsx
import { FeatureErrorBoundary } from '@/components/error';

function MyFeature() {
  return (
    <FeatureErrorBoundary featureType="guru" featureName="GuruChat">
      <GuruChat />
    </FeatureErrorBoundary>
  );
}
```

Errors are captured with:
- Component name and feature type
- Error stack trace
- User context (if available)
- Component stack information

## Privacy & Security

### Data Sanitization

The monitoring system automatically:

1. **Removes PII from Sentry events:**
   - Email addresses
   - IP addresses
   - Usernames

2. **Filters sensitive headers:**
   - Authorization tokens
   - Cookies
   - API keys

3. **Sanitizes log context:**
   - Passwords
   - Tokens
   - Secrets

### Consent Management

Error tracking respects user consent settings:

```typescript
import { analytics } from '@/lib/analytics';

// Check if error tracking is allowed
if (analytics.hasConsent('errorTracking')) {
  // Proceed with error tracking
}
```

## Production Configuration

### Sampling Rates

```typescript
// In sentry.ts, adjust for production:
tracesSampleRate: 0.1, // 10% of transactions
```

### Environment-Specific Settings

```typescript
// Debug logging in development
const logLevel = import.meta.env.PROD ? 'warn' : 'debug';

// Full performance tracking in development
tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
```

## Best Practices

### 1. Error Context

Always provide meaningful context:

```typescript
// Good
captureError(error, {
  component: 'PaymentForm',
  action: 'submit',
  paymentMethod: 'card',
});

// Avoid
captureError(error);
```

### 2. Log Level Selection

```typescript
// Use appropriate levels
logger.debug('Render cycle');                    // Development only
logger.info('User logged in');                   // Normal operations
logger.warn('API deprecated, migrate to v2');   // Action needed
logger.error('Payment failed', error);           // Investigate
logger.fatal('Database connection lost', error); // Immediate action
```

### 3. Health Check Design

Keep health checks lightweight:

```typescript
// Good - lightweight check
async () => {
  const { error } = await supabase.from('health').select('id').limit(1);
  return !error;
}

// Avoid - heavy operation
async () => {
  const result = await expensiveComputation();
  return result.valid;
}
```

## Troubleshooting

### Sentry Not Reporting

1. Check DSN is configured: `VITE_SENTRY_DSN`
2. Verify `initSentry()` is called
3. Check browser console for initialization errors

### Health Checks Failing

1. Verify Supabase connectivity
2. Check browser network tab
3. Review CORS configuration

### Performance Data Missing

1. Ensure `initPerformanceMonitoring()` is called
2. Check browser supports Performance API
3. Verify web-vitals library loaded

## API Reference

See inline JSDoc comments in source files for detailed API documentation.

## Related Documentation

- [Error Boundaries](../ERROR_BOUNDARIES_IMPLEMENTATION.md)
- [Analytics](./ANALYTICS.md)
- [Security](../PHASE_27_SECURITY.md)
