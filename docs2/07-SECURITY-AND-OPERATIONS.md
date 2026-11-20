# ConsciousOS Security, Operations, and Development Guide

## Complete Security Architecture, Deployment Operations, and Development Practices

---

## Table of Contents

1. [Security Architecture Overview](#security-overview)
2. [Authentication and Authorization](#auth)
3. [Data Protection](#data-protection)
4. [Row Level Security Policies](#rls-policies)
5. [API Security](#api-security)
6. [Secret Management](#secret-management)
7. [Client-Side Security](#client-security)
8. [AI Safety](#ai-safety)
9. [GDPR and Data Privacy](#gdpr)
10. [Operations and Monitoring](#operations)
11. [Deployment Pipeline](#deployment)
12. [Development Practices](#development)
13. [Testing Strategy](#testing)
14. [Performance Monitoring](#performance)
15. [Incident Response](#incident-response)
16. [Contributing Guide](#contributing)

---

## 1. Security Architecture Overview

### 1.1 Security Layers

ConsciousOS implements defense-in-depth with multiple security layers:

```
Layer 1: Network (HTTPS, CORS)
    ↓
Layer 2: Authentication (Supabase Auth / GoTrue)
    ↓
Layer 3: Authorization (RLS + Role-based policies)
    ↓
Layer 4: Input Validation (Zod + SQL constraints)
    ↓
Layer 5: Data Protection (Encryption at rest, secure transmission)
    ↓
Layer 6: Application Logic (Edge function validation)
    ↓
Layer 7: Monitoring (Activity logging, anomaly detection)
```

### 1.2 Threat Model

| Threat | Mitigation |
|--------|-----------|
| Unauthorized data access | RLS policies on every table |
| Privilege escalation | Role checks via security definer functions |
| Session hijacking | Supabase managed JWT with short expiry |
| XSS | React's built-in XSS protection + CSP headers |
| CSRF | Supabase handles CSRF protection |
| Data leakage | No sensitive data in client code or logs |
| API abuse | Rate limiting on edge functions |
| Social engineering | Email verification required |

---

## 2. Authentication and Authorization

### 2.1 Authentication Flow

```
User enters email + password
    │
    ▼
Supabase Auth (GoTrue) validates credentials
    │
    ▼
JWT issued (access_token + refresh_token)
    │
    ▼
Client stores tokens (httpOnly cookies managed by SDK)
    │
    ▼
All API calls include JWT in Authorization header
    │
    ▼
Supabase validates JWT and sets auth.uid() for RLS
```

### 2.2 Session Management

- Access tokens expire after 1 hour
- Refresh tokens automatically renew sessions
- `onAuthStateChange` listener handles token refresh
- Session state checked on app initialization
- Sign-out clears all tokens

### 2.3 Authorization Model

```
User → auth.uid() → profiles (user data)
User → auth.uid() → user_roles (role assignment)
User → has_role() → admin/moderator access
User → org_members → enterprise access
```

### 2.4 Role System

```sql
-- Roles stored in separate table (NOT on profiles)
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

**Why separate table for roles?**
- Prevents privilege escalation via profile updates
- Security definer function bypasses RLS (prevents recursive policy checks)
- Clear separation of concerns between identity and authorization

---

## 3. Data Protection

### 3.1 Data at Rest
- PostgreSQL database encrypted at rest (AES-256)
- File storage encrypted at rest
- Backups encrypted

### 3.2 Data in Transit
- All connections use TLS 1.2+
- HTTPS enforced on all endpoints
- WebSocket connections secured with WSS

### 3.3 Sensitive Data Handling
- Passwords hashed with bcrypt (managed by Supabase Auth)
- No sensitive data logged to console in production
- API keys stored in environment variables, never in code
- Publishable keys (anon key) safe for client-side use
- Private keys only in server-side edge functions

---

## 4. Row Level Security Policies

### 4.1 Standard User Data Pattern

```sql
-- Enable RLS on every table with user data
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

-- Users can only read their own data
CREATE POLICY "own_data_select" ON public.table_name
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Users can only insert their own data
CREATE POLICY "own_data_insert" ON public.table_name
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can only update their own data
CREATE POLICY "own_data_update" ON public.table_name
FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- Users can only delete their own data
CREATE POLICY "own_data_delete" ON public.table_name
FOR DELETE TO authenticated
USING (user_id = auth.uid());
```

### 4.2 Admin Access Pattern

```sql
-- Admins can read all data
CREATE POLICY "admin_select_all" ON public.table_name
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all data
CREATE POLICY "admin_update_all" ON public.table_name
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

### 4.3 Enterprise Organization Pattern

```sql
-- Members can see their organization's data
CREATE POLICY "org_member_select" ON public.org_specific_table
FOR SELECT TO authenticated
USING (
  org_id IN (
    SELECT om.org_id FROM public.org_members om
    WHERE om.user_id = auth.uid()
    AND om.status = 'active'
  )
);
```

### 4.4 Community Data Pattern

```sql
-- All authenticated users can read community content
CREATE POLICY "community_read" ON public.community_observations
FOR SELECT TO authenticated
USING (true);

-- Users can only create their own observations
CREATE POLICY "community_create" ON public.community_observations
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());
```

---

## 5. API Security

### 5.1 Edge Function Security

Every edge function:
1. Validates the Authorization header
2. Verifies the user exists via `supabase.auth.getUser()`
3. Checks role permissions where applicable
4. Validates request body (shape and types)
5. Returns appropriate error codes (401, 403, 400)

### 5.2 CORS Configuration

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": 
    "authorization, x-client-info, apikey, content-type",
};
```

### 5.3 Rate Limiting

- Edge functions have built-in rate limiting via Supabase
- Additional application-level rate limiting on expensive operations (AI calls)
- Credit system acts as economic rate limiting for AI features

---

## 6. Secret Management

### 6.1 Principles

- **Never in code**: No secrets, API keys, or tokens in source code
- **Environment variables**: All secrets stored as environment variables
- **Client vs. Server**: Publishable keys on client, private keys on server only
- **Rotation**: Secrets can be rotated without code changes

### 6.2 Secret Categories

| Secret | Location | Purpose |
|--------|----------|---------|
| `SUPABASE_URL` | Client (.env) | API endpoint |
| `SUPABASE_ANON_KEY` | Client (.env) | Publishable API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server (edge functions) | Admin API key |
| `ELEVENLABS_API_KEY` | Server (edge functions) | Voice AI |
| `RAZORPAY_KEY_ID` | Server (edge functions) | Payment processing |
| `RAZORPAY_KEY_SECRET` | Server (edge functions) | Payment verification |

---

## 7. Client-Side Security

### 7.1 Anti-Patterns Avoided

- ❌ No role checks using localStorage/sessionStorage
- ❌ No hardcoded admin credentials
- ❌ No sensitive data in client-side storage
- ❌ No direct database manipulation without RLS
- ❌ No client-side password hashing (server handles it)

### 7.2 React Security

- React's built-in XSS protection (JSX escaping)
- No `dangerouslySetInnerHTML` without sanitization
- React Markdown for user content rendering (safe by default)
- No eval() or equivalent dynamic code execution

---

## 8. AI Safety

### 8.1 Content Safety

All AI responses are evaluated for:
- Harmful advice (medical, psychological, legal)
- Manipulation techniques
- Inappropriate content
- Crisis situations requiring professional help

### 8.2 Prompt Injection Protection

- System prompts are not modifiable by users
- User input is treated as untrusted data
- AI responses are validated before display
- No execution of AI-suggested code

### 8.3 Data Privacy in AI

- User data is not used to train AI models
- AI conversations are processed through secure edge functions
- No user data is shared with third-party AI providers beyond the current request

---

## 9. GDPR and Data Privacy

### 9.1 Data Subject Rights

| Right | Implementation |
|-------|---------------|
| Right to access | Users can view all their data in-app |
| Right to deletion | Account deletion removes all personal data |
| Right to portability | Data export in JSON format (planned) |
| Right to rectification | Users can edit their profile and data |
| Right to object | Users can opt out of AI processing |

### 9.2 Data Retention

- Active user data: Retained while account is active
- Deleted user data: Removed within 30 days via cascading deletes
- AI usage logs: Retained for 90 days for billing/audit
- Anonymized analytics: Retained indefinitely

---

## 10. Operations and Monitoring

### 10.1 Admin Dashboard

Platform administrators have access to:

**User Management**: View all users, roles, engagement status
**Session Monitoring**: Active sessions, completion rates
**AI Cost Tracking**: Per-function cost, per-model breakdown, trends
**Activity Feed**: Real-time log of significant platform events
**Health Dashboard**: System status, error rates, response times
**Waitlist Management**: Pre-launch waitlist

### 10.2 Logging

```sql
-- admin_activity_log
- id, user_id, event_type, event_name
- metadata (JSONB: detailed event data)
- created_at

-- ai_usage_log
- id, user_id, function_name, model
- input_tokens, output_tokens, total_tokens
- estimated_cost_paise, charged_paise
- status, error_message, metadata
- created_at
```

### 10.3 Alerting

Critical alerts for:
- Error rate exceeds threshold
- AI costs exceed daily budget
- Authentication failures spike
- Database connection issues
- Edge function failures

---

## 11. Deployment Pipeline

### 11.1 Frontend Deployment

```
Code change → Vite build → Static assets → CDN deployment
```

- Automatic on code push
- Zero-downtime deployment
- Asset fingerprinting for cache busting
- Source maps for debugging

### 11.2 Backend Deployment

```
Edge function change → Auto-deploy to Supabase edge
Database migration → Approval → Execute on database
```

- Edge functions deploy automatically
- Database migrations require explicit approval
- No manual server management

### 11.3 Environment Configuration

```
Development: Local Vite dev server + Supabase
Production: CDN-hosted + Supabase managed infrastructure
```

---

## 12. Development Practices

### 12.1 Code Standards

- **TypeScript strict mode**: All code is type-safe
- **ESLint**: Configured for React + TypeScript best practices
- **Component size**: Components should be under 200 lines; refactor if larger
- **File organization**: Features grouped by domain, not by type
- **Naming conventions**: PascalCase components, camelCase functions, kebab-case files

### 12.2 Architecture Decisions

Architecture Decision Records (ADRs) are maintained in `documentation/06-development/`:

| ADR | Decision |
|-----|----------|
| ADR-0001 | Use XState for state management |
| ADR-0002 | Dual state architecture (XState + React Query) |
| ADR-0003 | Supabase for backend |
| ADR-0004 | Vite for build tool |

### 12.3 Hook Patterns

Custom hooks follow consistent patterns:
- `useXxx` for data fetching (wraps React Query)
- Return `{ data, isLoading, error }` for query hooks
- Return `{ mutate, isLoading }` for mutation hooks
- Handle loading and error states within the hook

---

## 13. Testing Strategy

### 13.1 Test Levels

| Level | Tools | Coverage |
|-------|-------|----------|
| Unit | Vitest | Utility functions, calculations, algorithms |
| Component | Vitest + Testing Library | UI components, interaction behavior |
| Integration | Vitest | Hook + component integration |
| E2E | Playwright (planned) | Full user flows |

### 13.2 Testing Priorities

1. **Consciousness score calculation**: Critical algorithm
2. **State machine transitions**: Core flow logic
3. **RLS policies**: Security-critical
4. **AI prompt generation**: Quality-critical
5. **Payment flow**: Revenue-critical

### 13.3 Test Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

---

## 14. Performance Monitoring

### 14.1 Key Metrics

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | < 1.5s | - |
| Largest Contentful Paint | < 2.5s | - |
| Time to Interactive | < 3.0s | - |
| Bundle Size (gzipped) | < 500KB | - |
| API Response Time (p95) | < 500ms | - |
| Edge Function Cold Start | < 200ms | - |

### 14.2 Optimization Techniques

- Route-based code splitting
- React Query caching (5-minute stale time)
- Image optimization via Vite asset pipeline
- Reduced motion for low-performance devices
- IndexedDB persistence for offline capability

---

## 15. Incident Response

### 15.1 Severity Levels

| Level | Definition | Response Time |
|-------|-----------|---------------|
| **P0** | Complete service outage | 15 minutes |
| **P1** | Major feature broken, workaround exists | 1 hour |
| **P2** | Minor feature broken | 4 hours |
| **P3** | Cosmetic issue | Next business day |

### 15.2 Response Process

1. **Detect**: Monitoring alert or user report
2. **Assess**: Determine severity level
3. **Communicate**: Update status page (if applicable)
4. **Fix**: Implement and deploy fix
5. **Verify**: Confirm fix resolves the issue
6. **Post-mortem**: Document root cause and preventive measures

---

## 16. Contributing Guide

### 16.1 Development Setup

```bash
# Clone repository
git clone <repo-url>

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

### 16.2 Code Review Checklist

- [ ] TypeScript types are correct and complete
- [ ] No hardcoded colors — uses design tokens
- [ ] RLS policies created for new tables
- [ ] Error handling for async operations
- [ ] Loading and error states for UI components
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Mobile responsive
- [ ] No secrets in code
- [ ] Tests for critical logic

### 16.3 Pull Request Process

1. Create feature branch from main
2. Implement changes with tests
3. Self-review against checklist
4. Request review
5. Address feedback
6. Merge when approved

---

*This document provides the complete security, operations, and development reference for ConsciousOS. Security is a continuous process, not a destination.*

*ConsciousOS — The journey inward to who you truly are.*
