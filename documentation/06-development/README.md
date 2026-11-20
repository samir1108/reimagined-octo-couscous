# ConsciousOS Deployment & Infrastructure Guide

> **Version**: 1.0.0  
> **Last Updated**: 2026-02-28  
> **Status**: Production Ready  

---

## Table of Contents

1. [Deployment Overview](#1-deployment-overview)
2. [Environment Setup](#2-environment-setup)
3. [Infrastructure Architecture](#3-infrastructure-architecture)
4. [Deployment Process](#4-deployment-process)
5. [Docker & Containerization](#5-docker--containerization)
6. [CI/CD Pipeline](#6-cicd-pipeline)
7. [Environment Variables & Secrets](#7-environment-variables--secrets)
8. [Database Deployment](#8-database-deployment)
9. [Monitoring & Alerting](#9-monitoring--alerting)
10. [Backup & Disaster Recovery](#10-backup--disaster-recovery)
11. [Rollback Procedures](#11-rollback-procedures)
12. [Scaling Strategy](#12-scaling-strategy)

---

## 1. Deployment Overview

### 1.1 System Overview

ConsciousOS is a comprehensive spiritual operating system deployed across multiple environments with a microservices architecture. The deployment strategy supports high availability, horizontal scaling, and rapid recovery.

### 1.2 Deployment Philosophy

| Principle | Implementation |
|-----------|----------------|
| **Infrastructure as Code** | All infrastructure defined in version control |
| **Immutable Deployments** | Blue-green deployments with versioned artifacts |
| **Automated Rollbacks** | One-click rollback with health-verified promotions |
| **Security First** | Secrets management, encrypted connections, least privilege |
| **Observability** | Full stack monitoring, tracing, and alerting |

### 1.3 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React + Vite | User interface |
| **Backend** | Supabase | Database, Auth, Realtime |
| **Edge Functions** | Deno/TypeScript | Serverless API endpoints |
| **3D Rendering** | RunPod GPU | Unreal Engine Pixel Streaming |
| **CDN** | Vercel/Cloudflare | Static asset delivery |
| **Monitoring** | Sentry + PostHog | Error tracking & analytics |

### 1.4 Deployment Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CDN Layer                                       │
│                    (Cloudflare / Vercel Edge Network)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                           Frontend (Vercel)                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   React App │  │  PWA Shell  │  │Service Worker│  │   Assets    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API Gateway (Supabase)                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        Edge Functions                                │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │   Auth   │ │   Chat   │ │ Analytics│ │  Daily   │ │  Webhook │  │   │
│  │  │          │ │          │ │          │ │  Flow    │ │          │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Database Layer (Supabase PostgreSQL)                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Row Level Security (RLS)                                          │   │
│  │  • Realtime subscriptions                                            │   │
│  │  • Automated backups                                                 │   │
│  │  • Connection pooling                                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      3D Guru Pixel Streaming (RunPod GPU)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Unreal     │  │   TURN      │  │  WebSocket  │  │   Nginx     │        │
│  │  Engine     │  │  Server     │  │  Gateway    │  │   Proxy     │        │
│  │             │  │             │  │             │  │             │        │
│  │  • RTX 3090 │  │  • Coturn   │  │  • Node.js  │  │  • SSL/TLS  │        │
│  │  • WebRTC   │  │  • UDP/TCP  │  │  • WS/WSS   │  │  • HTTP/2   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Environment Setup

### 2.1 Environment Types

| Environment | Purpose | URL Pattern | Access |
|-------------|---------|-------------|--------|
| **Development** | Local development | `http://localhost:5173` | Developers only |
| **Staging** | Pre-production testing | `https://staging.consciousos.app` | Team + QA |
| **Production** | Live application | `https://consciousos.app` | Public |

### 2.2 Development Environment Setup

```bash
# 1. Clone the repository
git clone https://github.com/consciousos/app.git
cd app

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env

# 4. Fill in environment variables (see section 7)
# Edit .env with your Supabase credentials

# 5. Start development server
npm run dev
```

### 2.3 Staging Environment Setup

```bash
# 1. Create staging branch
git checkout -b staging

# 2. Configure staging environment variables
cp .env.production.template .env.staging

# 3. Update staging-specific variables
VITE_ENVIRONMENT=staging
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SENTRY_DSN=https://staging-dsn.ingest.sentry.io/project-id

# 4. Deploy to staging
vercel --target=staging
```

### 2.4 Production Environment Setup

```bash
# 1. Ensure you're on main branch
git checkout main
git pull origin main

# 2. Configure production environment
cp .env.production.template .env.production

# 3. Fill in all production credentials
# (See Environment Variables section for details)

# 4. Verify configuration
npm run typecheck
npm run lint
npm run build

# 5. Deploy to production
vercel --prod
```

### 2.5 Environment Configuration Matrix

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `VITE_ENVIRONMENT` | `development` | `staging` | `production` |
| `VITE_DEBUG` | `true` | `false` | `false` |
| `VITE_ENABLE_ANALYTICS` | `false` | `true` | `true` |
| `VITE_ENABLE_SENTRY` | `false` | `true` | `true` |
| `VITE_ENABLE_PWA` | `false` | `true` | `true` |
| `VITE_ENABLE_PUSH_NOTIFICATIONS` | `false` | `true` | `true` |
| `VITE_ENABLE_REALTIME` | `true` | `true` | `true` |
| `VITE_ENABLE_OFFLINE_MODE` | `true` | `true` | `true` |

---

## 3. Infrastructure Architecture

### 3.1 Frontend Infrastructure

```
┌─────────────────────────────────────────────────────────────────┐
│                      Vercel Edge Network                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Edge Node  │  │  Edge Node  │  │  Edge Node  │              │
│  │   (US-East) │  │   (EU-West) │  │  (AP-South) │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          └────────────────┴────────────────┘
                           │
                    ┌──────┴──────┐
                    │   Vercel    │
                    │   Build &   │
                    │   Deploy    │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │  Static     │
                    │  Assets     │
                    │  (dist/)    │
                    └─────────────┘
```

### 3.2 Backend Infrastructure (Supabase)

```
┌─────────────────────────────────────────────────────────────────┐
│                     Supabase Project                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              PostgreSQL Database                         │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐             │   │
│  │  │   Users   │ │  Journal  │ │   Daily   │             │   │
│  │  │           │ │  Entries  │ │   Flows   │             │   │
│  │  └───────────┘ └───────────┘ └───────────┘             │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Edge Functions (Deno)                       │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│  │  │  Auth   │ │  Chat   │ │ Analyze │ │ Notify  │       │   │
│  │  │         │ │         │ │   Day   │ │         │       │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Realtime Subscriptions                      │   │
│  │  • WebSocket connections                                 │   │
│  │  • Database change streaming                             │   │
│  │  • Multi-tab synchronization                             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 3D Guru Infrastructure (RunPod GPU)

```
┌─────────────────────────────────────────────────────────────────┐
│                     RunPod GPU Instance                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  NVIDIA GPU (RTX 3090)                   │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │           Unreal Engine 5.4                      │   │   │
│  │  │  ┌─────────────┐  ┌─────────────┐              │   │   │
│  │  │  │  MetaHuman  │  │  Animations │              │   │   │
│  │  │  │   Guru      │  │   System    │              │   │   │
│  │  │  └─────────────┘  └─────────────┘              │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │         Pixel Streaming Plugin                   │   │   │
│  │  │  • WebRTC video encoding                         │   │   │
│  │  │  • Stream compression                            │   │   │
│  │  │  • Multi-peer support                            │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Supporting Services                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │   TURN      │  │  WebSocket  │  │    Nginx    │     │   │
│  │  │  Server     │  │  Gateway    │  │   Proxy     │     │   │
│  │  │  (Coturn)   │  │  (Port 8080)│  │ (80/443)    │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Network Architecture

```
                    ┌─────────────────────┐
                    │      Internet       │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
    ┌─────────────────┐ ┌──────────────┐ ┌──────────────┐
    │   Vercel Edge   │ │  Cloudflare  │ │   RunPod     │
    │   (Frontend)    │ │    DNS/WAF   │ │   (GPU)      │
    └────────┬────────┘ └──────┬───────┘ └──────┬───────┘
             │                 │                │
             ▼                 ▼                ▼
    ┌─────────────────┐ ┌──────────────┐ ┌──────────────┐
    │  Supabase Auth  │ │  Supabase    │ │   WebRTC     │
    │  & Database     │ │   Storage    │ │   Stream     │
    └─────────────────┘ └──────────────┘ └──────────────┘
```

---

## 4. Deployment Process

### 4.1 Pre-Deployment Checklist

Before deploying to production, ensure the following:

| Check | Command/Action | Expected Result |
|-------|----------------|-----------------|
| TypeScript compilation | `npm run typecheck` | No errors |
| Lint checks | `npm run lint` | No critical errors |
| Unit tests | `npm run test` | All passing |
| E2E tests | `npx playwright test` | All passing |
| Security audit | `npm run security:audit` | No high/critical |
| Build success | `npm run build` | dist/ created |
| Bundle analysis | `npm run analyze` | < 500KB main |

### 4.2 Frontend Deployment (Vercel)

#### 4.2.1 Automated Deployment via Git

```bash
# Push to main branch triggers automatic deployment
git checkout main
git merge staging
git push origin main
```

#### 4.2.2 Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project (first time only)
vercel link

# Deploy to production
vercel --prod

# Deploy specific commit
vercel --prod --meta commit=$GIT_COMMIT_SHA
```

#### 4.2.3 Vercel Configuration (vercel.json)

```json
{
  "version": 2,
  "name": "consciousos",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-project.supabase.co/functions/v1/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 4.3 Edge Functions Deployment

```bash
# Deploy all edge functions
supabase functions deploy

# Deploy specific function
supabase functions deploy chat
supabase functions deploy analyze-day
supabase functions deploy morning-context
supabase functions deploy evening-reflection

# Deploy with specific flags
supabase functions deploy --project-ref your-project-ref
```

### 4.4 Database Migrations

```bash
# Create a new migration
supabase migration new add_user_preferences

# Apply migrations to local
supabase db reset

# Apply migrations to remote
supabase db push

# Check migration status
supabase migration list

# Generate types from database
supabase gen types typescript --local > src/types/supabase.ts
```

### 4.5 3D Guru Pixel Streaming Deployment

#### 4.5.1 RunPod Deployment

```bash
# Build Docker image
docker build -t pixel-streaming:latest -f files/deploy/runpod/Dockerfile.gpu .

# Tag for registry
docker tag pixel-streaming:latest ghcr.io/consciousos/pixel-streaming:latest

# Push to registry
docker push ghcr.io/consciousos/pixel-streaming:latest

# Deploy to RunPod using template
curl -X POST https://api.runpod.io/v1/pods \
  -H "Authorization: Bearer $RUNPOD_API_KEY" \
  -d @files/deploy/runpod/runpod-template.json
```

#### 4.5.2 Google Colab (Development)

```bash
# Upload notebook.ipynb to Google Colab
# Run cells sequentially for testing
# Use ngrok for external access
```

### 4.6 Deployment Commands Reference

| Action | Command |
|--------|---------|
| Build production | `npm run build` |
| Preview build | `npm run preview` |
| Deploy to Vercel | `vercel --prod` |
| Deploy edge functions | `supabase functions deploy` |
| Apply DB migrations | `supabase db push` |
| Start GPU server | `./files/deploy/runpod/start.sh` |
| Health check | `curl https://consciousos.app/api/health` |

---

## 5. Docker & Containerization

### 5.1 Frontend Container (Optional)

```dockerfile
# Dockerfile.frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 5.2 GPU-Optimized Container (RunPod)

The GPU container includes:

| Component | Port | Purpose |
|-----------|------|---------|
| Nginx | 80/443 | Reverse proxy & SSL |
| TURN Server | 3478 | WebRTC NAT traversal |
| WebSocket Gateway | 8080 | Frontend communication |
| Unreal Engine | 8888 | Pixel streaming |

See [`files/deploy/runpod/Dockerfile.gpu`](../../files/deploy/runpod/Dockerfile.gpu) for complete configuration.

### 5.3 Docker Compose (Local Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

  guru-server:
    build:
      context: ./files/server/guru-stream-server
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - PORT=8080
      - PIXEL_STREAMING_URL=http://pixel-streaming:8888

  pixel-streaming:
    build:
      context: ./files/deploy/runpod
      dockerfile: Dockerfile.gpu
    ports:
      - "8888:8888"
      - "3478:3478/udp"
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
      - TURN_SECRET=${TURN_SECRET}
```

### 5.4 Container Registry

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Build and tag
docker build -t ghcr.io/consciousos/pixel-streaming:v1.0.0 .

# Push
docker push ghcr.io/consciousos/pixel-streaming:v1.0.0

# Pull
docker pull ghcr.io/consciousos/pixel-streaming:v1.0.0
```

---

## 6. CI/CD Pipeline

### 6.1 GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy ConsciousOS

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run type check
        run: npm run typecheck
      
      - name: Run linter
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Run E2E tests
        run: npx playwright test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build
          path: dist/
      
      - name: Deploy to Vercel (Staging)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--target=staging'

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build
          path: dist/
      
      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
      
      - name: Deploy Edge Functions
        run: |
          npm install -g supabase
          supabase functions deploy --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      
      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          text: 'ConsciousOS deployed to production'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 6.2 Pipeline Stages

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Code   │───▶│  Test   │───▶│  Build  │───▶│ Deploy  │───▶│ Verify  │
│  Push   │    │         │    │         │    │         │    │         │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
     │              │              │              │              │
     ▼              ▼              ▼              ▼              ▼
  Trigger       TypeScript     Vite Build    Vercel        Health
  Pipeline      Lint           Edge Funcs    Supabase      E2E Tests
                Unit Tests     Docker        RunPod        Sentry
                E2E Tests                     Notify
```

### 6.3 Environment Protection Rules

| Environment | Required Approvals | Branch Protection | Secrets |
|-------------|-------------------|-------------------|---------|
| Development | None | None | Local .env |
| Staging | 1 (QA Lead) | staging | Repository secrets |
| Production | 2 (Tech Lead + Product) | main | Environment secrets |

---

## 7. Environment Variables & Secrets

### 7.1 Required Environment Variables

#### 7.1.1 Application Configuration

```bash
# Application
VITE_APP_NAME=ConsciousOS
VITE_APP_VERSION=$npm_package_version
VITE_BUILD_DATE=$npm_package_build_date
VITE_ENVIRONMENT=production
VITE_DEBUG=false
```

#### 7.1.2 Supabase Configuration

```bash
# Client-side (safe to expose)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Server-side (NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_JWT_SECRET=your-jwt-secret-here
```

#### 7.1.3 Monitoring & Analytics

```bash
# Sentry
VITE_SENTRY_DSN=https://your-sentry-dsn.ingest.sentry.io/project-id
SENTRY_AUTH_TOKEN=your-sentry-auth-token
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name

# PostHog
VITE_POSTHOG_API_KEY=your-posthog-api-key
VITE_POSTHOG_HOST=https://app.posthog.com

# Google Analytics (optional)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

#### 7.1.4 Third-Party Integrations

```bash
# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Resend (email)
RESEND_API_KEY=re_your-resend-api-key

# Stripe (payments)
VITE_STRIPE_PUBLIC_KEY=pk_live_your-stripe-key
STRIPE_SECRET_KEY=sk_live_your-stripe-secret
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

#### 7.1.5 3D Guru Configuration

```bash
# Pixel Streaming Gateway
GURU_API_URL=https://your-guru-server.com
GURU_API_KEY=your-guru-api-key
GURU_WS_URL=wss://your-guru-server.com/ws

# TURN Server (for WebRTC)
VITE_TURN_SERVER=turn:your-runpod-url.runpod.io:3478
VITE_TURN_SECRET=your-turn-secret
```

#### 7.1.6 Security

```bash
# Encryption
ENCRYPTION_KEY=your-256-bit-encryption-key

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=100
RATE_LIMIT_WINDOW_MS=60000
```

### 7.2 Secrets Management

#### 7.2.1 Vercel Secrets

```bash
# Add secrets to Vercel
vercel secrets add supabase-url "https://your-project.supabase.co"
vercel secrets add supabase-anon-key "your-anon-key"
vercel secrets add sentry-dsn "https://your-dsn.ingest.sentry.io/project-id"
```

#### 7.2.2 GitHub Secrets

Add to Repository Settings → Secrets and variables → Actions:

| Secret Name | Description |
|-------------|-------------|
| `VERCEL_TOKEN` | Vercel authentication token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `SUPABASE_ACCESS_TOKEN` | Supabase management token |
| `SUPABASE_PROJECT_REF` | Supabase project reference |
| `SENTRY_AUTH_TOKEN` | Sentry integration token |
| `SLACK_WEBHOOK_URL` | Deployment notifications |

#### 7.2.3 Supabase Secrets

```bash
# Set secrets for edge functions
supabase secrets set OPENAI_API_KEY=sk-xxx
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx

# List secrets
supabase secrets list
```

### 7.3 Environment Variable Validation

```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_SENTRY_DSN: z.string().url().optional(),
  VITE_POSTHOG_API_KEY: z.string().optional(),
  VITE_ENVIRONMENT: z.enum(['development', 'staging', 'production']),
});

export const env = envSchema.parse(import.meta.env);
```

---

## 8. Database Deployment

### 8.1 Database Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Supabase PostgreSQL                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │    Users     │ │   Profiles   │ │    Auth      │            │
│  │              │ │              │ │              │            │
│  │  • id (PK)   │ │  • user_id   │ │  • providers │            │
│  │  • email     │ │  • level     │ │  • sessions  │            │
│  │  • created   │ │  • xp        │ │  • mfa       │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │Journal Entries│ │ Daily Flows  │ │ Achievements │            │
│  │              │ │              │ │              │            │
│  │  • id (PK)   │ │  • id (PK)   │ │  • id (PK)   │            │
│  │  • user_id   │ │  • user_id   │ │  • user_id   │            │
│  │  • content   │ │  • date      │ │  • badge     │            │
│  │  • mood      │ │  • status    │ │  • unlocked  │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │   Chats      │ │  Practices   │ │  Settings    │            │
│  │              │ │              │ │              │            │
│  │  • messages  │ │  • sessions  │ │  • prefs     │            │
│  │  • ai_resp   │ │  • duration  │ │  • notifs    │            │
│  │  • context   │ │  • completed │ │  • privacy   │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Migration Workflow

```bash
# 1. Create migration
supabase migration new add_user_preferences

# 2. Edit migration file
# migrations/20240228000000_add_user_preferences.sql

# 3. Test locally
supabase db reset

# 4. Apply to staging
supabase db push --db-url $STAGING_DATABASE_URL

# 5. Apply to production
supabase db push
```

### 8.3 Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_flows ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Journal entries
CREATE POLICY "Users can CRUD own journal" ON public.journal_entries
  FOR ALL USING (auth.uid() = user_id);
```

### 8.4 Database Backup Strategy

| Backup Type | Frequency | Retention | Method |
|-------------|-----------|-----------|--------|
| **Automated** | Daily | 7 days | Supabase built-in |
| **Point-in-Time** | Continuous | 7 days | PITR (Pro plan) |
| **Manual** | Pre-deployment | 30 days | `supabase db dump` |
| **Export** | Weekly | 90 days | SQL dumps to S3 |

```bash
# Manual backup
supabase db dump > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
supabase db restore --backup-id <backup-id>

# Point-in-time restore
supabase db restore --project-ref <ref> --target "2026-02-28T10:00:00Z"
```

---

## 9. Monitoring & Alerting

### 9.1 Monitoring Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                     Monitoring Architecture                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │    Sentry    │ │   PostHog    │ │   Vercel     │            │
│  │              │ │              │ │  Analytics   │            │
│  │  • Errors    │ │  • Events    │ │              │            │
│  │  • Performance│ │  • Funnels   │ │  • Traffic   │            │
│  │  • Sessions  │ │  • Retention │ │  • Speed     │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │   Supabase   │ │   Uptime     │ │   Custom     │            │
│  │   Dashboard  │ │   Monitor    │ │   Dashboard  │            │
│  │              │ │              │ │              │            │
│  │  • Queries   │ │  • Ping      │ │  • Health    │            │
│  │  • Connections│ │  • SSL      │ │  • Metrics   │            │
│  │  • Storage   │ │  • Response  │ │  • Alerts    │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Health Check Implementation

```typescript
// src/lib/health.ts
export interface HealthCheck {
  name: string;
  check: () => Promise<boolean>;
  critical: boolean;
}

export const healthChecks: HealthCheck[] = [
  {
    name: 'supabase',
    critical: true,
    check: async () => {
      const { error } = await supabase.from('health').select('id').limit(1);
      return !error;
    },
  },
  {
    name: 'pixel-streaming',
    critical: false,
    check: async () => {
      try {
        const res = await fetch(`${GURU_API_URL}/health`);
        return res.ok;
      } catch {
        return false;
      }
    },
  },
];
```

### 9.3 Alerting Rules

| Metric | Threshold | Severity | Channel | Response |
|--------|-----------|----------|---------|----------|
| Error Rate | > 1% | Warning | Slack | Investigate |
| Error Rate | > 5% | Critical | PagerDuty | Rollback |
| Response Time | > 2s | Warning | Slack | Optimize |
| Response Time | > 5s | Critical | PagerDuty | Scale |
| Uptime | < 99.9% | Critical | PagerDuty | Incident |
| DB Connections | > 80% | Warning | Slack | Optimize |
| Storage | > 80% | Warning | Email | Cleanup |

### 9.4 Performance Monitoring

```typescript
// Core Web Vitals tracking
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

onCLS(console.log);
onFID(console.log);
onFCP(console.log);
onLCP(console.log);
onTTFB(console.log);
```

### 9.5 Dashboard URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Sentry | https://sentry.io/organizations/consciousos | Error tracking |
| PostHog | https://app.posthog.com/project/xxx | Product analytics |
| Vercel | https://vercel.com/dashboard | Deployment metrics |
| Supabase | https://app.supabase.com/project/xxx | Database health |
| UptimeRobot | https://uptimerobot.com/dashboard | Uptime monitoring |
| Status Page | https://status.consciousos.app | Public status |

---

## 10. Backup & Disaster Recovery

### 10.1 Backup Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                       Backup Architecture                        │
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  Database   │───▶│  Daily      │───▶│  7-day      │         │
│  │  (Primary)  │    │  Snapshot   │    │  Retention  │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                                                  │    │
│         ▼                                                  ▼    │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   PITR      │───▶│  7-day      │───▶│  Point-in   │         │
│  │  (WAL)      │    │  Recovery   │    │  Time       │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Code      │───▶│   GitHub    │───▶│  Immutable  │         │
│  │             │    │  Repository │    │  History    │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 Disaster Recovery Procedures

#### 10.2.1 Database Failure

```bash
# 1. Identify last known good backup
supabase backups list

# 2. Restore from backup
supabase db restore --backup-id <backup-id>

# 3. Verify restoration
supabase db list

# 4. Update connection strings if needed
```

#### 10.2.2 Application Failure

```bash
# 1. Rollback to previous version
vercel --version <previous-deployment-id> --prod

# 2. Verify rollback
curl https://consciousos.app/api/health

# 3. Investigate issue in Sentry
```

#### 10.2.3 Complete Outage

| Step | Action | Owner | Time |
|------|--------|-------|------|
| 1 | Acknowledge incident | On-call | 0 min |
| 2 | Assess scope | On-call | 5 min |
| 3 | Initiate rollback | Tech Lead | 10 min |
| 4 | Verify recovery | QA Lead | 15 min |
| 5 | Communicate status | Product | 20 min |
| 6 | Root cause analysis | Engineering | 1 hour |

### 10.3 Recovery Time Objectives (RTO)

| Service | RTO | RPO | Procedure |
|---------|-----|-----|-----------|
| Frontend | 5 min | N/A | Vercel rollback |
| Database | 15 min | 1 hour | PITR restore |
| Edge Functions | 10 min | N/A | Redeploy |
| Pixel Streaming | 30 min | N/A | RunPod restart |

---

## 11. Rollback Procedures

### 11.1 Rollback Decision Matrix

| Issue Severity | Code Rollback | Database Rollback | Time Target |
|----------------|---------------|-------------------|-------------|
| Critical (Site down) | ✅ Yes | ❌ No | < 5 min |
| High (Core feature broken) | ✅ Yes | ⚠️ If needed | < 15 min |
| Medium (Minor feature issues) | ⚠️ Hotfix preferred | ❌ No | < 1 hour |
| Low (Cosmetic issues) | ❌ No | ❌ No | Next deploy |

### 11.2 Vercel Instant Rollback

```bash
# Via CLI
vercel --version [PREVIOUS_DEPLOYMENT_ID] --prod

# Via Dashboard
# 1. Go to https://vercel.com/dashboard
# 2. Select conscious-os project
# 3. Go to "Deployments" tab
# 4. Find previous stable deployment
# 5. Click "..." → "Promote to Production"
```

### 11.3 Git Revert & Redeploy

```bash
# Step 1: Identify the commit to revert
git log --oneline -20

# Step 2: Revert the specific commit
git revert [COMMIT_HASH]

# Alternative: Revert entire release
git revert HEAD

# Step 3: Push to trigger redeployment
git push origin main

# Step 4: Tag the rollback
git tag -a rollback-v$(date +%Y%m%d-%H%M) -m "Emergency rollback"
git push origin --tags
```

### 11.4 Database Rollback

#### Point-in-Time Recovery

```bash
# Via Supabase Dashboard
# 1. Go to https://app.supabase.com/project/_/database/backups
# 2. Select "Point in Time" tab
# 3. Choose time before the incident
# 4. Click "Restore"

# Via Supabase CLI
supabase db restore --project-ref [PROJECT_REF] --target [TIMESTAMP]
```

#### Migration Rollback

```bash
# Step 1: Identify the migration to rollback
supabase migration list

# Step 2: Create a reversal migration
supabase migration new rollback_[migration_name]

# Step 3: Write the reversal SQL in the generated file

# Step 4: Apply the rollback
supabase db push
```

### 11.5 Rollback Verification

```bash
# 1. Health check
curl https://consciousos.app/api/health

# 2. Critical endpoints
curl https://consciousos.app/api/auth/verify
curl https://consciousos.app/api/user/profile

# 3. Error rate check
# Via Sentry: https://sentry.io/organizations/consciousos/issues/

# 4. Run smoke tests
npm run test:smoke
```

---

## 12. Scaling Strategy

### 12.1 Scaling Triggers

| Metric | Scale Up Threshold | Scale Down Threshold |
|--------|-------------------|---------------------|
| CPU Usage | > 70% for 5 min | < 30% for 10 min |
| Memory Usage | > 80% for 5 min | < 40% for 10 min |
| Response Time | > 2s average | < 1s average |
| Error Rate | > 1% | < 0.5% |
| Concurrent Users | > 1000 | < 500 |

### 12.2 Frontend Scaling (Vercel)

Vercel automatically scales:
- **Static Assets**: Global edge caching
- **Serverless Functions**: Auto-scaling based on demand
- **Bandwidth**: Unlimited with fair use policy

### 12.3 Database Scaling (Supabase)

| Plan | Connections | Storage | CPU | Scale Method |
|------|-------------|---------|-----|--------------|
| Free | 60 | 500 MB | Shared | Upgrade plan |
| Pro | 200 | 8 GB | 2-core | Upgrade plan |
| Team | 300 | 10 GB | 4-core | Upgrade plan |
| Enterprise | Custom | Custom | Custom | Contact sales |

```bash
# Enable connection pooling
supabase settings update --project-ref <ref> --pooler-mode transaction

# Read replicas (Enterprise)
supabase read-replicas create --project-ref <ref> --region us-west-2
```

### 12.4 GPU Scaling (RunPod)

```bash
# Scale up - deploy additional GPU instances
curl -X POST https://api.runpod.io/v1/pods \
  -H "Authorization: Bearer $RUNPOD_API_KEY" \
  -d '{
    "imageName": "ghcr.io/consciousos/pixel-streaming:latest",
    "gpuTypeId": "RTX 3090",
    "gpuCount": 2
  }'

# Configure auto-scaling (via RunPod dashboard)
# - Min replicas: 1
# - Max replicas: 5
# - Target concurrent users: 10 per instance
```

### 12.5 Load Balancing

```
                    ┌─────────────────────┐
                    │   CDN / DNS         │
                    │  (Cloudflare)       │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Load Balancer     │
                    │   (Round Robin)     │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
    ┌─────────────────┐ ┌──────────────┐ ┌──────────────┐
    │  Vercel Edge    │ │  Vercel Edge │ │  Vercel Edge │
    │   (US-East)     │ │  (EU-West)   │ │  (APAC)      │
    └─────────────────┘ └──────────────┘ └──────────────┘
```

### 12.6 Caching Strategy

| Layer | Technology | TTL | Invalidation |
|-------|------------|-----|--------------|
| Browser | Service Worker | 24h | Version bump |
| CDN | Cloudflare/Vercel | 1 year | Purge API |
| API Response | Redis | 5 min | Key eviction |
| Database | Supabase Cache | Auto | Query-based |

```typescript
// Cache configuration
export const cacheConfig = {
  static: {
    maxAge: 31536000, // 1 year
    immutable: true,
  },
  api: {
    maxAge: 300, // 5 minutes
    staleWhileRevalidate: 86400, // 1 day
  },
  dynamic: {
    maxAge: 60, // 1 minute
  },
};
```

---

## Appendices

### A. Deployment Scripts

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

ENVIRONMENT=${1:-staging}
echo "Deploying to $ENVIRONMENT..."

# Run checks
npm run typecheck
npm run lint
npm run test

# Build
npm run build

# Deploy
if [ "$ENVIRONMENT" == "production" ]; then
  vercel --prod
  supabase functions deploy
else
  vercel --target=staging
fi

echo "Deployment complete!"
```

### B. Health Check Script

```bash
#!/bin/bash
# scripts/health-check.sh

echo "=== ConsciousOS Health Check ==="

# Check frontend
curl -sf https://consciousos.app/health || echo "❌ Frontend unhealthy"

# Check API
curl -sf https://consciousos.app/api/health || echo "❌ API unhealthy"

# Check Supabase
# (Requires service role key)

echo "=== End Health Check ==="
```

### C. Emergency Contacts

| Role | Name | Phone | Email | Slack |
|------|------|-------|-------|-------|
| Tech Lead | [TBD] | [TBD] | [TBD] | @[handle] |
| DevOps Lead | [TBD] | [TBD] | [TBD] | @[handle] |
| Product Manager | [TBD] | [TBD] | [TBD] | @[handle] |
| On-Call Engineer | [TBD] | [TBD] | [TBD] | @[handle] |

### D. Useful Links

| Resource | URL |
|----------|-----|
| Vercel Dashboard | https://vercel.com/dashboard |
| Supabase Dashboard | https://app.supabase.com |
| Sentry Dashboard | https://sentry.io/organizations/consciousos |
| PostHog Dashboard | https://app.posthog.com |
| RunPod Console | https://www.runpod.io/console |
| Status Page | https://status.consciousos.app |

---

> **Document Owner**: DevOps Team  
> **Review Cycle**: Monthly  
> **Last Reviewed**: 2026-02-28  
> **Next Review**: 2026-03-28
