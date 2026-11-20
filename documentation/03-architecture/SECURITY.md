# ConsciousOS Security Documentation

> **Last Updated:** 2026-02-28  
> **Version:** 1.0  
> **Classification:** Internal - Development Team

---

## Table of Contents

1. [Security Architecture](#security-architecture)
2. [Authentication Flow](#authentication-flow)
3. [Data Protection](#data-protection)
4. [API Security](#api-security)
5. [Frontend Security](#frontend-security)
6. [OWASP Top 10 Protection](#owasp-top-10-protection)
7. [GDPR & Privacy Compliance](#gdpr--privacy-compliance)
8. [Incident Response](#incident-response)
9. [Security Audit Procedures](#security-audit-procedures)

---

## Security Architecture

### Overview

ConsciousOS implements a multi-layered security architecture following defense-in-depth principles:

```
┌─────────────────────────────────────────────────────────────┐
│                    CDN / Edge Layer                         │
│         (DDoS Protection, WAF, Rate Limiting)              │
├─────────────────────────────────────────────────────────────┤
│                  Application Layer                          │
│    (Authentication, Authorization, Input Validation)       │
├─────────────────────────────────────────────────────────────┤
│                   API Gateway                               │
│         (CORS, CSP Headers, Request Validation)            │
├─────────────────────────────────────────────────────────────┤
│                 Business Logic                              │
│    (Service Layer, Data Validation, Business Rules)        │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                               │
│         (Supabase, Row Level Security, Encryption)         │
└─────────────────────────────────────────────────────────────┘
```

### Security Components

| Component | Purpose | Implementation |
|-----------|---------|----------------|
| Supabase Auth | User authentication | JWT-based with refresh tokens |
| Row Level Security | Database access control | PostgreSQL RLS policies |
| Content Security Policy | XSS prevention | CSP headers in `public/_headers` |
| Input Validation | Injection prevention | Zod schemas in `src/lib/security/validation.ts` |
| Rate Limiting | Brute force protection | In-memory rate limiter class |
| Secure Storage | Client-side data protection | Encryption layer in `src/lib/security/storage.ts` |

---

## Authentication Flow

### JWT Token Management

```
┌─────────┐         ┌──────────┐         ┌──────────┐
│  User   │────────▶│  Login   │────────▶│ Supabase │
│         │         │  Form    │         │   Auth   │
└─────────┘         └──────────┘         └────┬─────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │  Issue JWT   │
                                       │ Access Token │
                                       └──────┬───────┘
                                              │
                                              ▼
┌─────────┐         ┌──────────┐         ┌──────────┐
│  User   │◀────────│  Store   │◀────────│  Secure  │
│ Session │         │  Token   │         │ Storage  │
└─────────┘         └──────────┘         └──────────┘
```

### Token Storage Strategy

| Token Type | Storage | Encryption | TTL |
|------------|---------|------------|-----|
| Access Token | `sessionStorage` | XOR obfuscation | Session |
| Refresh Token | `localStorage` | XOR obfuscation | 7 days |
| CSRF Token | `sessionStorage` + Cookie | None | Session |

### Security Features

- **Automatic token refresh** via Supabase Auth
- **Secure storage** with session-based encryption keys
- **Logout cleanup** clears all sensitive data
- **Multi-tab synchronization** via storage events

---

## Data Protection

### Encryption at Rest

| Data Type | Encryption Method | Key Management |
|-----------|------------------|----------------|
| User passwords | bcrypt (server-side) | Supabase Auth |
| API Keys | Environment variables | CI/CD secrets |
| Local storage | XOR obfuscation | Session-generated key |

### Encryption in Transit

- **TLS 1.3** enforced for all connections
- **HSTS** headers (enable in production)
- **Certificate pinning** for mobile apps

### Sensitive Data Handling

```typescript
// Example: Secure storage usage
import { secureSet, secureGet, clearSecureStorage } from '@/lib/security/storage';

// Store with encryption
secureSet('user_prefs', preferences, { encrypt: true, ttl: 86400000 });

// Retrieve
const prefs = secureGet('user_prefs');

// Clear on logout
clearSecureStorage();
```

---

## API Security

### Security Headers

All API responses include these security headers:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(self), microphone=(self), geolocation=()
```

### CORS Configuration

```typescript
// Allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://consciousos.app',
  'https://www.consciousos.app',
];
```

### CSRF Protection

Double-submit cookie pattern:

```typescript
import { generateCsrfToken, addCsrfHeader } from '@/lib/security/api-headers';

// Generate and store
generateCsrfToken();

// Include in requests
headers = addCsrfHeader(headers);
```

---

## Frontend Security

### Content Security Policy

```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob: https:;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

### Input Validation

```typescript
import { emailSchema, passwordSchema, sanitizeInput } from '@/lib/security/validation';

// Schema validation
const result = emailSchema.safeParse(userInput);

// Sanitization
const clean = sanitizeInput(userInput);
```

### Rate Limiting

```typescript
import { RateLimiter } from '@/lib/security/validation';

const limiter = new RateLimiter();

if (!limiter.isAllowed(ip, 5, 60000)) {
  throw new Error('Rate limit exceeded');
}
```

---

## OWASP Top 10 Protection

| Rank | Vulnerability | Protection Measures |
|------|---------------|---------------------|
| A01 | Broken Access Control | RLS policies, JWT validation, role-based access |
| A02 | Cryptographic Failures | HTTPS everywhere, secure storage, bcrypt passwords |
| A03 | Injection | Zod validation, parameterized queries, sanitization |
| A04 | Insecure Design | Security-by-design, threat modeling, secure defaults |
| A05 | Security Misconfiguration | Environment checks, minimal permissions, no debug info |
| A06 | Vulnerable Components | npm audit, dependency scanning, regular updates |
| A07 | Auth Failures | Strong passwords, MFA support, session management |
| A08 | Data Integrity Failures | CSRF tokens, input validation, checksums |
| A09 | Logging Failures | Structured logging, no sensitive data in logs |
| A10 | SSRF | URL validation, allowlists, network segmentation |

---

## GDPR & Privacy Compliance

### Data Collection

We collect only necessary data:

- **Account data**: Email, password (hashed), display name
- **Usage data**: Feature interactions (anonymized)
- **Journal entries**: User-generated content

### User Rights

Implemented endpoints for:

- **Right to access**: Export all user data
- **Right to erasure**: Delete all personal data
- **Right to portability**: JSON export format
- **Right to rectification**: Profile editing

### Data Export

```typescript
import { exportUserData } from '@/lib/security/storage';

// GDPR data portability
const userData = exportUserData();
downloadJson(userData, 'my-data-export.json');
```

### Data Retention

| Data Type | Retention Period | Deletion Process |
|-----------|------------------|------------------|
| Account data | Until deletion | Immediate on request |
| Session data | 7 days | Automatic expiration |
| Journal entries | User-controlled | Soft delete + purge after 30 days |
| Analytics | 90 days | Automatic aggregation |

---

## Incident Response

### Severity Levels

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| P1 - Critical | Active exploitation, data breach | Immediate | RCE vulnerability, unauthorized access |
| P2 - High | Potential breach, sensitive data exposure | 4 hours | XSS vulnerability, auth bypass |
| P3 - Medium | Security weakness, no immediate threat | 24 hours | Missing security header, outdated dependency |
| P4 - Low | Best practice deviation | 7 days | Documentation update, code quality |

### Response Procedure

1. **Detect**: Automated monitoring, user reports, security audits
2. **Contain**: Isolate affected systems, revoke compromised tokens
3. **Assess**: Determine scope, impact, and root cause
4. **Remediate**: Deploy fixes, update dependencies
5. **Communicate**: Notify affected users (if required by law)
6. **Learn**: Post-incident review, update procedures

### Contact

| Role | Contact | Responsibility |
|------|---------|----------------|
| Security Lead | security@consciousos.app | Incident coordination |
| Engineering Lead | eng@consciousos.app | Technical response |
| Legal | legal@consciousos.app | Compliance, notifications |

---

## Security Audit Procedures

### Automated Audits

```bash
# Run dependency audit
npm run security:audit

# Check environment security
npm run security:check

# Full security scan
npm run security:full
```

### Manual Review Checklist

- [ ] Review new dependencies for known vulnerabilities
- [ ] Check for hardcoded secrets in code
- [ ] Verify RLS policies are applied
- [ ] Test authentication flows
- [ ] Review error messages for information leakage
- [ ] Check CORS configuration
- [ ] Validate input sanitization
- [ ] Test rate limiting

### Schedule

| Audit Type | Frequency | Owner |
|------------|-----------|-------|
| Dependency scan | Weekly | Automated (CI/CD) |
| Penetration test | Quarterly | External vendor |
| Code review | Every PR | Engineering team |
| Architecture review | Monthly | Security lead |

---

## Security Resources

### Internal

- [`src/lib/security/validation.ts`](../src/lib/security/validation.ts) - Input validation
- [`src/lib/security/storage.ts`](../src/lib/security/storage.ts) - Secure storage
- [`src/lib/security/api-headers.ts`](../src/lib/security/api-headers.ts) - API security
- [`public/_headers`](../public/_headers) - Security headers
- [`scripts/security-audit.js`](../scripts/security-audit.js) - Audit script
- [`scripts/check-env-security.js`](../scripts/check-env-security.js) - Environment check

### External References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [Supabase Security](https://supabase.com/docs/guides/database/secure-data)
- [Web Security Guidelines](https://developer.mozilla.org/en-US/docs/Web/Security)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-28 | Initial security documentation |

---

**Document Owner:** Security Team  
**Review Cycle:** Quarterly  
**Next Review:** 2026-05-28
