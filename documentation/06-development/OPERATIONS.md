# ConsciousOS Operations Guide

> **Version**: 1.0.0  
> **Last Updated**: 2026-02-28  
> **Status**: Active

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Monitoring Dashboards](#monitoring-dashboards)
3. [Incident Response](#incident-response)
4. [Common Issues & Solutions](#common-issues--solutions)
5. [Escalation Paths](#escalation-paths)
6. [Maintenance Procedures](#maintenance-procedures)
7. [Backup & Recovery](#backup--recovery)
8. [Security Procedures](#security-procedures)

---

## Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CDN (Vercel)                         │
│                   Static Assets + Edge                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   Application Layer                         │
│              React + Vite + TypeScript                      │
│         ┌──────────────┬──────────────┐                     │
│         │   Auth UI    │  Dashboard   │                     │
│         │   Journal    │  Practice    │                     │
│         │   Loops      │   Guru AI    │                     │
│         └──────────────┴──────────────┘                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    API Gateway                              │
│              Supabase (REST + Realtime)                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   Data Layer                                │
│     ┌─────────────┬─────────────┬─────────────┐             │
│     │  PostgreSQL │    Redis    │   Storage   │             │
│     │   (Supa)    │  (Cache)    │  (Images)   │             │
│     └─────────────┴─────────────┴─────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### Service Dependencies

| Service | Provider | Status Page | SLA |
|---------|----------|-------------|-----|
| Application Hosting | Vercel | [status](https://www.vercel-status.com/) | 99.99% |
| Database | Supabase | [status](https://status.supabase.com/) | 99.9% |
| Auth | Supabase Auth | [status](https://status.supabase.com/) | 99.9% |
| Error Tracking | Sentry | [status](https://status.sentry.io/) | 99.9% |
| Analytics | PostHog | [status](https://status.posthog.com/) | 99.9% |
| Email | Resend | [status](https://resend-status.com/) | 99.9% |

---

## Monitoring Dashboards

### Primary Dashboards

#### 1. Vercel Analytics
- **URL**: https://vercel.com/dashboard/conscious-os/analytics
- **Metrics**:
  - Web Vitals (LCP, FID, CLS)
  - Traffic and usage
  - Edge function performance
  - Build times

#### 2. Sentry Error Tracking
- **URL**: https://sentry.io/organizations/consciousos/issues/
- **Key Views**:
  - Unresolved errors
  - Error trends
  - Performance monitoring
  - User feedback

#### 3. Supabase Dashboard
- **URL**: https://app.supabase.com/project/_
- **Monitoring**:
  - Database performance
  - Connection pool
  - Storage usage
  - Auth events
  - Realtime connections

#### 4. PostHog Analytics
- **URL**: https://app.posthog.com/project/_
- **Insights**:
  - User funnels
  - Feature usage
  - Session recordings
  - Retention metrics

### Custom Dashboard Queries

#### Error Rate Alert
```sql
-- Supabase: Error logs in last hour
SELECT 
  count(*),
  error_message,
  date_trunc('minute', created_at) as minute
FROM error_logs
WHERE created_at > now() - interval '1 hour'
GROUP BY error_message, minute
ORDER BY minute DESC;
```

#### Active Users
```sql
-- Supabase: Active users in last 24h
SELECT 
  count(distinct user_id) as active_users,
  count(*) as total_sessions
FROM user_sessions
WHERE last_active > now() - interval '24 hours';
```

#### Slow Queries
```sql
-- Supabase: Queries taking >1s
SELECT 
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## Incident Response

### Severity Levels

| Level | Description | Response Time | Resolution Target |
|-------|-------------|---------------|-------------------|
| **P0 - Critical** | Complete outage, data loss, security breach | 15 min | 1 hour |
| **P1 - High** | Major feature broken, significant degradation | 30 min | 4 hours |
| **P2 - Medium** | Minor feature issues, workarounds available | 2 hours | 24 hours |
| **P3 - Low** | Cosmetic issues, feature requests | 1 day | Next sprint |

### Incident Response Playbook

#### 1. Detection
- Automated alerts (Sentry, PagerDuty)
- User reports (#support channel)
- Manual monitoring

#### 2. Assessment
```bash
# Quick health check
curl https://consciousos.app/api/health

# Check error rate
# Sentry: View issues in last hour

# Check recent deployments
# Vercel: View deployment logs
```

#### 3. Communication
```
Template:
🚨 INCIDENT: [Brief description]
Severity: [P0/P1/P2/P3]
Status: [Investigating/Identified/Monitoring/Resolved]
Impact: [User impact description]
Started: [Timestamp]
Updates: [Link to incident channel]
```

#### 4. Resolution
- Attempt quick fix if <30 min
- Otherwise, execute [ROLLBACK_PLAN.md](../ROLLBACK_PLAN.md)

#### 5. Post-Incident
- Document timeline
- Schedule post-mortem (within 48 hours)
- Update runbooks

### Incident Command Structure

```
Incident Commander (IC)
├── Technical Lead
│   ├── Frontend Engineer
│   ├── Backend Engineer
│   └── Database Admin
├── Communications Lead
└── Scribe (timeline)
```

---

## Common Issues & Solutions

### 1. Database Connection Issues

**Symptoms**: 
- "Connection timeout" errors
- Slow response times
- 503 errors

**Diagnosis**:
```bash
# Check connection pool status
supabase inspect db pool

# Check active connections
SELECT count(*) FROM pg_stat_activity;
```

**Solutions**:
1. Restart connection pool: `supabase db reset --linked`
2. Scale database plan if consistently maxed
3. Check for connection leaks in application code

**Prevention**:
- Monitor connection pool usage
- Set up alerts at 80% capacity
- Regular connection pool tuning

### 2. High Error Rates

**Symptoms**:
- Spike in Sentry errors
- User complaints
- Failed API calls

**Diagnosis**:
```bash
# Check Sentry for error patterns
# Look for:
# - New releases correlating with errors
# - Specific endpoints failing
# - User agent patterns
```

**Solutions**:
1. Identify error source in Sentry
2. Check recent deployments
3. Rollback if deployment-related
4. Deploy hotfix if solution known

**Prevention**:
- Feature flags for gradual rollout
- Canary deployments
- Comprehensive E2E testing

### 3. Performance Degradation

**Symptoms**:
- High latency
- Timeout errors
- Poor Lighthouse scores

**Diagnosis**:
```bash
# Check Vercel Analytics for Web Vitals
# Review Sentry Performance tab
# Analyze bundle size: npm run analyze
```

**Solutions**:
1. Enable CDN caching
2. Optimize database queries
3. Implement lazy loading
4. Scale infrastructure if needed

**Prevention**:
- Performance budgets
- Regular Lighthouse audits
- Bundle size monitoring

### 4. Authentication Failures

**Symptoms**:
- Users can't log in
- Session expiration issues
- OAuth provider errors

**Diagnosis**:
```bash
# Check Supabase Auth logs
# Verify OAuth provider status
# Test auth flow manually
```

**Solutions**:
1. Check Supabase Auth dashboard
2. Verify OAuth provider credentials
3. Clear auth cache if needed
4. Reset sessions if compromised

**Prevention**:
- Monitor auth success rates
- Regular OAuth credential rotation
- Test auth flows in staging

### 5. Realtime Subscription Issues

**Symptoms**:
- Live updates not working
- WebSocket disconnections
- Stale data in UI

**Diagnosis**:
```bash
# Check Supabase Realtime metrics
# Verify WebSocket connections
# Review browser console for errors
```

**Solutions**:
1. Check Supabase Realtime status
2. Restart Realtime service
3. Review RLS policies affecting subscriptions
4. Implement reconnection logic

**Prevention**:
- Heartbeat monitoring
- Connection health checks
- Graceful degradation

---

## Escalation Paths

### Technical Escalation

```
Level 1: On-Call Engineer (15 min)
    ↓ No resolution + P0/P1
Level 2: Tech Lead (30 min)
    ↓ No resolution
Level 3: Engineering Manager (1 hour)
    ↓ Business impact
Level 4: CTO (immediate)
```

### Communication Escalation

```
Internal (Slack)
├── #incidents (all hands)
├── #engineering (team)
└── #leadership (execs)

External (Status Page)
├── Investigating
├── Identified
├── Monitoring
└── Resolved
```

### External Vendor Escalation

| Vendor | Support Channel | Emergency Contact |
|--------|----------------|-------------------|
| Vercel | support@vercel.com | Enterprise support |
| Supabase | support@supabase.com | Dashboard support |
| Sentry | support@sentry.io | Help Center |
| PostHog | support@posthog.com | Community Slack |

---

## Maintenance Procedures

### Regular Maintenance Schedule

#### Daily
- [ ] Review Sentry error reports
- [ ] Check Vercel Analytics
- [ ] Monitor database performance
- [ ] Review security alerts

#### Weekly
- [ ] Dependency update review
- [ ] Performance audit
- [ ] Backup verification
- [ ] Log analysis

#### Monthly
- [ ] Security audit
- [ ] Cost optimization review
- [ ] Capacity planning
- [ ] Documentation updates

#### Quarterly
- [ ] Disaster recovery drill
- [ ] Penetration testing
- [ ] Architecture review
- [ ] Vendor SLA review

### Deployment Windows

| Environment | Window | Approval Required |
|-------------|--------|-------------------|
| Production | Tue-Thu, 10AM-4PM UTC | Tech Lead |
| Staging | Anytime | None |
| Hotfix | Anytime | On-Call Engineer |

### Database Maintenance

```bash
# Weekly: Analyze tables
supabase db execute "ANALYZE;"

# Monthly: Vacuum analyze
supabase db execute "VACUUM ANALYZE;"

# Quarterly: Full vacuum
supabase db execute "VACUUM FULL;"
```

---

## Backup & Recovery

### Backup Strategy

| Data Type | Frequency | Retention | Method |
|-----------|-----------|-----------|--------|
| Database | Daily | 30 days | Supabase PITR |
| Database | Weekly | 90 days | Manual export |
| Storage | Real-time | 30 days | Supabase replication |
| Config | On change | Forever | Git |

### Recovery Procedures

#### Database Point-in-Time Recovery
```bash
# Via Supabase Dashboard
# 1. Go to Database → Backups
# 2. Select Point-in-Time tab
# 3. Choose restore time
# 4. Confirm restoration

# Via CLI
supabase db restore --project-ref [REF] --target [TIMESTAMP]
```

#### Storage Recovery
```bash
# List available backups
supabase storage ls backups/

# Restore from backup
supabase storage cp backups/[file] [destination]
```

#### Configuration Recovery
```bash
# Config is in Git - simply revert
git revert [commit]
git push
```

---

## Security Procedures

### Security Incident Response

#### 1. Detection
- Automated alerts (Sentry, security scanners)
- User reports
- Monitoring anomalies

#### 2. Containment
```bash
# Rotate compromised credentials
vercel env rm COMPROMISED_KEY
vercel env add COMPROMISED_KEY [new-value]

# Revoke sessions
supabase auth admin signout-all

# Enable maintenance mode if needed
# (Custom implementation)
```

#### 3. Investigation
- Preserve logs
- Identify scope
- Document timeline

#### 4. Recovery
- Apply fixes
- Verify security
- Restore services

#### 5. Post-Incident
- Security audit
- Policy updates
- Team training

### Access Control

#### Production Access
| Role | Database | Vercel | Supabase |
|------|----------|--------|----------|
| On-Call Engineer | Read | Deploy | Admin |
| Tech Lead | All | All | All |
| Developer | None | Preview | Staging |

#### Key Rotation Schedule
| Key Type | Rotation Frequency |
|----------|-------------------|
| API Keys | Quarterly |
| Database Passwords | Semi-annually |
| OAuth Secrets | Annually |
| JWT Secrets | On suspicion of compromise |

---

## Runbook Library

### Runbook: High Latency Response

1. **Check current status**
   ```bash
   curl -w "%{time_total}" https://consciousos.app/api/health
   ```

2. **Review recent changes**
   - Check last deployment time
   - Review merged PRs
   - Check dependency updates

3. **Database investigation**
   ```sql
   SELECT * FROM pg_stat_activity WHERE state = 'active';
   ```

4. **Scale if needed**
   - Vercel: Automatic
   - Supabase: Contact support for plan upgrade

5. **Rollback if unresolved**
   - Follow [ROLLBACK_PLAN.md](../ROLLBACK_PLAN.md)

### Runbook: Database Outage

1. **Verify outage**
   - Check Supabase status page
   - Test direct connection

2. **Activate read replica** (if available)
   - Switch connection strings
   - Update environment variables

3. **Communicate**
   - Post in #incidents
   - Update status page

4. **Monitor restoration**
   - Watch Supabase dashboard
   - Test connectivity

5. **Post-incident**
   - Document in incident log
   - Schedule review

---

## Contact Information

### Internal Teams

| Team | Slack | Email |
|------|-------|-------|
| Engineering | #engineering | engineering@consciousos.app |
| DevOps | #devops | devops@consciousos.app |
| Security | #security | security@consciousos.app |
| Support | #support | support@consciousos.app |

### External Contacts

| Service | Support URL | Phone |
|---------|-------------|-------|
| Vercel | https://vercel.com/support | N/A |
| Supabase | https://supabase.com/support | N/A |
| Sentry | https://sentry.io/contact/ | N/A |

---

## Document Maintenance

- **Review Schedule**: Monthly
- **Owner**: DevOps Team
- **Approval**: Tech Lead
- **Next Review**: 2026-03-28

---

> **Last Updated**: 2026-02-28  
> **Version**: 1.0.0  
> **Status**: Active
