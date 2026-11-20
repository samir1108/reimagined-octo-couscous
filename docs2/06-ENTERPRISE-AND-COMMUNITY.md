# ConsciousOS Enterprise & Community Documentation

## Organizational Consciousness Development and Collective Awareness Features

---

## Table of Contents

1. [Enterprise Vision](#enterprise-vision)
2. [Organization Structure](#organization-structure)
3. [Enterprise Dashboard](#enterprise-dashboard)
4. [Team Consciousness Metrics](#team-metrics)
5. [Manager Coaching System](#manager-coaching)
6. [Wellness Challenges](#challenges)
7. [Mood Pulse System](#mood-pulse)
8. [Quarterly Reports](#quarterly-reports)
9. [Enterprise Notifications](#enterprise-notifications)
10. [Employee Portal](#employee-portal)
11. [Invitation and Onboarding](#invitation)
12. [Enterprise AI Insights](#enterprise-ai)
13. [Data Privacy and Anonymization](#privacy)
14. [Enterprise Pricing Model](#pricing)
15. [Community Features](#community)
16. [Awareness Wall](#awareness-wall)
17. [Collective Meditations](#collective-meditations)
18. [Witness Circles](#witness-circles)
19. [Journey Groups](#journey-groups)
20. [Consciousness Map](#consciousness-map)

---

## 1. Enterprise Vision

### 1.1 Why Organizational Consciousness?

Organizations are consciousness systems. Every team meeting, every strategic decision, every customer interaction is shaped by the collective consciousness of the people involved. When individuals within an organization develop greater awareness, the entire organization transforms:

- **Decision Quality**: Conscious leaders make decisions from clarity rather than reactivity
- **Conflict Resolution**: Teams with higher awareness resolve conflicts faster and more creatively
- **Innovation**: Creativity flows from connected awareness, not from stress-driven brainstorming
- **Wellbeing**: Conscious organizations have lower burnout, higher satisfaction, and better retention
- **Performance**: Paradoxically, reducing the pressure to perform often increases performance

### 1.2 The Enterprise Offering

ConsciousOS Enterprise provides organizations with:
1. **Individual consciousness development** for every employee
2. **Team-level metrics** that reveal collective patterns
3. **Manager coaching tools** for conscious leadership
4. **Organization-wide challenges** that build collective awareness
5. **AI-powered insights** that connect individual growth to organizational health
6. **Quarterly reports** that track consciousness development over time

---

## 2. Organization Structure

### 2.1 Data Model

```
Organization
├── Settings (branding, preferences)
├── Teams
│   ├── Team A
│   │   ├── Members (with roles)
│   │   └── Team-level metrics
│   ├── Team B
│   └── ...
├── Invitations (pending)
├── Challenges (wellness programs)
├── Activity Log
├── Notifications
└── Quarterly Reports
```

### 2.2 Roles

| Role | Permissions |
|------|------------|
| **Owner** | Full control: settings, billing, data, member management |
| **Admin** | Member management, settings, reports, challenges |
| **Manager** | Team management, coaching tools, team reports |
| **Employee** | Individual consciousness journey, challenge participation |

### 2.3 Database Tables

**organizations**: Core organization data
```sql
- id, name, slug, description, logo_url
- settings (JSONB: branding, preferences)
- created_by (owner user_id)
- created_at, updated_at
```

**teams**: Team groupings within organization
```sql
- id, org_id, name, description, created_at
```

**org_members**: Membership records
```sql
- id, org_id, user_id, email
- role (owner/admin/manager/employee)
- team_id (optional team assignment)
- status (invited/active/deactivated)
- invited_by, invited_at, joined_at
```

**org_invites**: Pending invitations
```sql
- id, org_id, email, role, team_id
- token (unique invite token)
- invited_by, expires_at, accepted_at
```

---

## 3. Enterprise Dashboard

### 3.1 Dashboard Sections

The enterprise dashboard provides a comprehensive view of organizational consciousness:

**Header**: Organization name, member count, active challenges count

**Consciousness Heatmap**: Visual grid showing awareness levels across teams, using color intensity to indicate average consciousness scores. Enables quick identification of teams that may need additional support.

**Mood Pulse Widget**: Real-time aggregate of the most recent mood and energy scores across the organization. Shows trend arrows for week-over-week changes.

**Engagement Overview**: Active users (daily/weekly/monthly), average session duration, program enrollment rates, streak statistics.

**Team Comparison**: Side-by-side comparison of consciousness metrics across teams, enabling benchmarking and resource allocation.

**Recent Activity**: Live feed of organizational events (new members, challenge completions, milestones).

### 3.2 Navigation

```
Enterprise Dashboard
├── Dashboard (overview)
├── Employees (member management)
├── Teams (team management)
├── Managers (coaching tools)
├── Challenges (wellness challenges)
├── Reports (quarterly consciousness reports)
├── Settings (organization settings)
└── Invite (member invitation)
```

---

## 4. Team Consciousness Metrics

### 4.1 Aggregate Metrics

For each team, the system calculates:

- **Average Consciousness Score**: Mean of all team members' scores (0-1000)
- **Engagement Rate**: Percentage of team members who used the app in the last 7 days
- **Mood Trend**: Average mood score trend over 30 days
- **Energy Trend**: Average energy score trend over 30 days
- **Top Active Loops**: Most common Core Loops across team members (anonymized)
- **Strongest Dimensions**: Highest-scoring dimensions across the team
- **Growth Velocity**: Rate of consciousness score improvement

### 4.2 Privacy-Preserving Aggregation

All team metrics are aggregated to preserve individual privacy:
- Minimum team size for metrics: 5 members (prevents individual identification)
- Loop data is presented as percentages, never attributed to individuals
- Mood pulses are anonymized
- Individual scores are never visible to managers

---

## 5. Manager Coaching System

### 5.1 Purpose

The Manager Coaching system helps managers become conscious leaders by providing AI-generated coaching insights for their team interactions.

### 5.2 Coaching Talking Points

For each upcoming 1-on-1 meeting, the system generates:

```json
{
  "employee_id": "anonymous_or_consented",
  "talking_points": [
    {
      "category": "wellbeing",
      "point": "This team member's energy levels have been declining over the past two weeks. Consider asking about workload.",
      "priority": "high"
    },
    {
      "category": "growth",
      "point": "Strong progress in awareness practices. Acknowledge their consistency.",
      "priority": "medium"
    },
    {
      "category": "engagement",
      "point": "They haven't participated in the latest team challenge. No pressure, but an invitation might help.",
      "priority": "low"
    }
  ],
  "conversation_starters": [
    "I noticed you've been showing up consistently with your practice. What's that been like?",
    "How are you feeling about your workload right now?",
    "Is there anything I can do to better support your growth?"
  ]
}
```

### 5.3 Manager Dashboard

Managers see:
- Team consciousness heatmap
- Individual development trajectories (with consent)
- Coaching talking points for upcoming 1-on-1s
- Challenge participation and completion rates
- Mood pulse trends for their team

---

## 6. Wellness Challenges

### 6.1 Challenge Types

| Challenge Type | Description | Duration |
|---------------|-------------|----------|
| **Streak Challenge** | Who can maintain the longest streak? | 7-30 days |
| **Mindful Minutes** | Collective meditation time goal | 14-30 days |
| **Gratitude Chain** | Daily gratitude entries, team chain | 7 days |
| **Body Awareness Week** | Daily somatic practices | 7 days |
| **Digital Sunset** | No screens after 8 PM | 14 days |
| **Observation Sprint** | Complete observation tasks daily | 7 days |

### 6.2 Challenge Structure

```sql
-- wellness_challenges
- id, org_id, title, description
- type (streak/meditation/gratitude/custom)
- target_value (e.g., 100 collective hours)
- start_date, end_date
- status (upcoming/active/completed)
- created_by

-- challenge_participants
- id, challenge_id, user_id, team_id
- current_value (individual progress)
- completed (boolean)
- joined_at
```

### 6.3 Leaderboard

The ChallengeLeaderboard component shows:
- Individual rankings (opt-in)
- Team rankings
- Progress toward collective goal
- Celebration of completions

---

## 7. Mood Pulse System

### 7.1 Purpose

The Mood Pulse is a quick daily check-in (2 data points: mood + energy) that enables organizations to track collective emotional health without requiring deep engagement.

### 7.2 Data Collection

```sql
-- mood_pulses
- id, org_id, user_id
- mood_score (1-5)
- energy_score (1-5)
- note (optional text)
- created_at
```

### 7.3 Visualization

**MoodTrendsChart**: Line chart showing 30-day mood and energy trends, with annotations for significant events (challenge starts, organizational changes).

**MoodPulseWidget**: Real-time aggregate showing current organizational mood with comparison to previous week.

---

## 8. Quarterly Reports

### 8.1 Report Generation

The `org_quarterly_reports` table stores pre-generated quarterly consciousness reports:

```json
{
  "summary": {
    "total_members": 45,
    "active_members": 38,
    "avg_consciousness_score": 412,
    "score_change": +67,
    "top_growing_team": "Engineering"
  },
  "consciousness_metrics": {
    "awareness_avg": 5.2,
    "equanimity_avg": 4.8,
    "presence_avg": 5.5,
    "compassion_avg": 6.1
  },
  "loop_landscape": {
    "most_common": "performance",
    "most_dissolving": "control",
    "organization_wide_pattern": "Perfectionism culture contributing to Performance Loop prevalence"
  },
  "recommendations": [
    "Consider organization-wide breathwork challenge to address stress patterns",
    "The Engineering team shows high awareness but low equanimity — suggest equanimity-focused program",
    "Manager coaching uptake is low — consider making it part of leadership development program"
  ]
}
```

---

## 9. Enterprise Notifications

### 9.1 Notification Types

| Type | Severity | Example |
|------|----------|---------|
| **milestone** | info | "Your team completed the Gratitude Challenge! 🎉" |
| **alert** | warning | "Team engagement dropped 30% this week" |
| **insight** | info | "AI detected a collective pattern worth exploring" |
| **system** | info | "3 new members joined your organization" |
| **challenge** | info | "New challenge starting Monday: Mindful Minutes" |

---

## 10. Employee Portal

### 10.1 Experience

Employees access ConsciousOS through their organization:
- Standard individual consciousness journey
- Organizational branding and context
- Challenge participation
- Mood pulse submission
- Anonymous contribution to team metrics

### 10.2 Employee Detail View

Managers can view (with consent):
- Overall consciousness score (current and trend)
- Engagement metrics (sessions, journal entries, streaks)
- Program enrollment and progress
- Challenge participation
- Mood pulse trends

---

## 11. Invitation and Onboarding

### 11.1 Invitation Flow

```
Admin enters email + role + team
    │
    ▼
System creates org_invite with unique token
    │
    ▼
Email sent with invitation link
    │
    ▼
Employee clicks link → Auth page → Sign up/Sign in
    │
    ▼
Token verified → org_member created → Employee portal access
```

### 11.2 Bulk Invitation

Admins can invite multiple employees at once via email list.

---

## 12. Enterprise AI Insights

### 12.1 Organization-Level Analysis

The `enterprise-insights` edge function generates:

- **Culture Assessment**: AI analysis of collective patterns
- **Risk Detection**: Teams showing burnout indicators
- **Growth Opportunities**: Dimensions with highest growth potential
- **Intervention Recommendations**: Suggested programs and challenges
- **Trend Predictions**: Projected consciousness development trajectory

### 12.2 AIInsightsPanel Component

Displays AI-generated insights in a clean, actionable format:
- Key findings with severity indicators
- Recommended actions with implementation guides
- Trend visualizations
- Comparison to industry benchmarks (when available)

---

## 13. Data Privacy and Anonymization

### 13.1 Privacy Principles

1. **Individual data belongs to the individual**: Organizations see aggregates, not individual records
2. **Consent-based visibility**: Individual data visible to managers only with explicit consent
3. **Minimum group size**: Metrics require 5+ members to prevent individual identification
4. **Mood pulses are anonymous**: No attribution of mood data to individuals
5. **Loop data is percentages**: "40% of team experiences Performance Loop" not "John has Performance Loop"

### 13.2 RLS Policies

Enterprise tables use organization-based RLS:
```sql
-- Members can see their own org's data
CREATE POLICY "Members view own org"
ON public.org_members
FOR SELECT
TO authenticated
USING (
  org_id IN (
    SELECT org_id FROM public.org_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
);
```

---

## 14. Enterprise Pricing Model

### 14.1 Pricing Structure

- **Per-seat monthly licensing**: Base price per employee
- **Tiered pricing**: Discounts for larger organizations
- **Annual commitment discount**: 20% discount for annual plans
- **Custom programs**: Additional cost for tailored consciousness programs
- **Manager coaching**: Included in standard pricing
- **Quarterly reports**: Included in standard pricing
- **API access**: Premium tier

### 14.2 Tiers

| Tier | Seats | Features |
|------|-------|----------|
| **Starter** | 10-50 | Basic dashboard, challenges, mood pulse |
| **Growth** | 50-200 | Full analytics, coaching, custom programs |
| **Enterprise** | 200+ | API, custom integrations, dedicated support |

---

## 15. Community Features

### 15.1 Community Vision

ConsciousOS's community features are designed to facilitate collective consciousness development — not social media engagement. The community is a space for shared awareness, not performance or comparison.

### 15.2 Community Page Structure

The Community page (`/app/community`) contains:
- Awareness Wall
- Collective Meditations
- Witness Circles
- Journey Groups
- Consciousness Map

---

## 16. Awareness Wall

### 16.1 Purpose

A shared space where users post anonymous or named observations from their consciousness journey. Think of it as a mindful social feed — but focused on awareness rather than ego.

### 16.2 Observation Cards

```sql
-- community_observations
- id, user_id, content
- display_mode ('anonymous' | 'named')
- tags (JSONB)
- created_at
```

### 16.3 Reactions

Instead of "likes," observations receive consciousness-themed reactions:
- 🪷 (lotus) — "This resonated"
- 👁️ (witness) — "I see this pattern too"
- 💫 (sparkle) — "Beautiful insight"
- 🫂 (embrace) — "Thank you for sharing"

```sql
-- community_reactions
- id, observation_id, user_id
- reaction_type ('resonance' | 'witness' | 'insight' | 'gratitude')
- created_at
```

### 16.4 Moderation

- Content reviewed for safety and appropriateness
- No debates, arguments, or advice-giving encouraged
- Focus on personal observation, not prescription

---

## 17. Collective Meditations

### 17.1 Purpose

Scheduled group meditation sessions where multiple users meditate simultaneously, creating a sense of shared practice even though each person is in their own location.

### 17.2 Structure

```sql
-- collective_meditations
- id, title, description
- type ('silent' | 'guided' | 'loving_kindness' | 'body_scan')
- scheduled_at
- duration_minutes
- participant_count
- status ('upcoming' | 'active' | 'completed')
```

### 17.3 Experience

- Users see upcoming meditations on the community page
- Joining a meditation shows a simple counter of participants
- After meditation, a brief sharing space opens
- No competition, no tracking — just shared presence

---

## 18. Witness Circles

### 18.1 Purpose

Small groups (3-8 people) who commit to practicing together for a defined period. Witness circles provide the accountability and intimacy that individual practice sometimes lacks.

### 18.2 Circle Types

- **Beginner Circles**: For those new to consciousness practice
- **Shadow Work Circles**: For deeper psychological exploration
- **Silence Circles**: Minimal words, shared presence
- **Loop Work Circles**: Focused on specific Core Loop dissolution

---

## 19. Journey Groups

### 19.1 Purpose

Larger groups organized around specific programs or themes. Journey groups provide a cohort experience — going through a 7-30 day program together.

### 19.2 Structure

```sql
-- journey_groups
- id, name, description, type
- created_by
- max_members, duration_days
- starts_at, status
```

### 19.3 Features

- Shared progress tracking
- Group discussion threads
- Collective milestones
- Group completion celebrations

---

## 20. Consciousness Map

### 20.1 Purpose

A global visualization showing the geographic distribution of ConsciousOS users and their collective consciousness state. This serves as:
- A reminder that you're part of a larger movement
- A visualization of collective consciousness development
- A motivator for continued practice

### 20.2 Privacy

- Locations are approximate (city-level, not address-level)
- No individual identification possible from the map
- Opt-in only — users choose whether to appear
- Displays aggregate consciousness levels by region

---

*This document provides the complete enterprise and community reference for ConsciousOS. Organizational consciousness and collective awareness features represent the platform's vision for scaling consciousness development beyond individuals.*

*ConsciousOS — The journey inward to who you truly are.*
