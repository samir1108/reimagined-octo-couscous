# ConsciousOS Deployment Guide

## Overview

This guide covers the deployment process for ConsciousOS to production environments.

## Prerequisites

- Node.js 18+ and npm
- Access to Supabase project
- Sentry account (for error tracking)
- Domain configured (consciousos.app)
- SSL certificates

## Environment Setup

### 1. Copy Environment Template

```bash
cp .env.production .env
```

### 2. Configure Environment Variables

Fill in all required values in `.env`:

| Variable | Description | Source |
|----------|-------------|--------|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | Supabase Dashboard > Settings > API |
| `VITE_SENTRY_DSN` | Sentry DSN | Sentry Dashboard > Project Settings |
| `VITE_API_BASE_URL` | API base URL | Your deployment URL |
| `VITE_ELEVENLABS_API_KEY` | ElevenLabs API key | ElevenLabs Dashboard |

### 3. Verify Production Configuration

```bash
# Run TypeScript check
npm run typecheck

# Run ESLint
npm run lint

# Build for production
npm run build
```

## Deployment Steps

### Frontend Deployment (Vercel/Netlify)

1. **Connect Repository**
   - Link GitHub repository to Vercel/Netlify
   - Configure build settings:
     - Build Command: `npm run build`
     - Output Directory: `dist`

2. **Environment Variables**
   - Add all variables from `.env.production` to deployment platform
   - Mark sensitive values as encrypted

3. **Domain Configuration**
   - Add custom domain: `consciousos.app`
   - Configure SSL/TLS certificates
   - Set up DNS records (A/CNAME)

### Supabase Edge Functions Deployment

```bash
# Deploy all edge functions
supabase functions deploy

# Or deploy specific functions
supabase functions deploy chat
supabase functions deploy analyze-day
supabase functions deploy morning-context
```

### Database Migrations

```bash
# Apply pending migrations
supabase db push

# Verify migration status
supabase migration list
```

## Post-Deployment Verification

### 1. Health Checks

```bash
# Check API endpoints
curl https://api.consciousos.app/health

# Verify edge functions
supabase functions list
```

### 2. Feature Verification

- [ ] Authentication flow works
- [ ] User registration/login
- [ ] Chat functionality
- [ ] Daily flow generation
- [ ] Guru animations
- [ ] Push notifications
- [ ] Offline mode

### 3. Performance Checks

- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.5s
- [ ] Bundle size < 500KB (main)

## Rollback Procedure

### Quick Rollback (Vercel)

1. Go to Vercel Dashboard
2. Select previous deployment
3. Click "Promote to Production"

### Database Rollback

```bash
# Restore from backup (if needed)
supabase db restore --backup-id <backup-id>
```

## Monitoring

### Sentry Dashboard
- Monitor error rates: https://sentry.io/organizations/your-org
- Set up alerting for > 1% error rate

### Performance Monitoring
- Check Web Vitals in Sentry Performance
- Monitor Core Web Vitals trends

### Uptime Monitoring
- Configure uptime checks (e.g., UptimeRobot)
- Set alerts for downtime > 2 minutes

## Security Checklist

- [ ] Environment variables are encrypted
- [ ] Supabase RLS policies are active
- [ ] API rate limiting is enabled
- [ ] CORS is properly configured
- [ ] No secrets in client-side code
- [ ] HTTPS enforced
- [ ] CSP headers configured

## Troubleshooting

### Build Failures

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run typecheck
```

### Runtime Errors

1. Check Sentry for error reports
2. Verify environment variables
3. Check Supabase connection
4. Review edge function logs

### Performance Issues

1. Analyze bundle size: `npm run build -- --analyze`
2. Check for unnecessary re-renders
3. Verify code splitting is working
4. Review network waterfall in DevTools

## Support Contacts

- **Technical Lead**: [Name] <email>
- **DevOps**: [Name] <email>
- **Emergency Hotline**: [Number]

## Deployment History

| Date | Version | Deployed By | Notes |
|------|---------|-------------|-------|
| 2026-02-27 | 1.0.0 | AI Assistant | Initial production deployment |