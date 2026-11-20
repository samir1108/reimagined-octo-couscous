# Day {DAY_NUMBER} Documentation Template

## Day Summary

| Field | Value |
|-------|-------|
| **Day Number** | {dayNumber} |
| **Date** | {date} |
| **User Level** | {level} |
| **Total XP** | {xp} |
| **Current Streak** | {streak} |
| **Active Loops** | {loopCount} |
| **Completion Rate** | {completionRate}% |

## Daily Overview

### Phase Completion Status

```
┌─────────┬──────────┬──────────┬──────────┐
│  Phase  │  Status  │ Duration │   XP     │
├─────────┼──────────┼──────────┼──────────┤
│ Morning │ [status] │ [time]   │ [xp]     │
│ Midday  │ [status] │ [time]   │ [xp]     │
│ Evening │ [status] │ [time]   │ [xp]     │
│ Night   │ [status] │ [time]   │ [xp]     │
└─────────┴──────────┴──────────┴──────────┘
```

### Key Metrics

- **Tasks Generated**: {count}
- **Tasks Completed**: {count}
- **Tasks Skipped**: {count}
- **Practice Time**: {duration}
- **Journal Entries**: {count}
- **AI Interactions**: {count}

---

## Morning Phase (5:00 AM - 11:59 AM)

### Scenario: Morning Session with Guru

#### User Layer

**Screenshots**:
- [ ] Initial Home screen with Morning Session card
- [ ] Guru chat interface
- [ ] Session completion screen

**Interactions**:
```yaml
interaction_001:
  time: 08:30:15
  type: click
  element: morning-session-start-button
  coordinates: [450, 320]
  result: Chat interface loaded

interaction_002:
  time: 08:30:22
  type: type
  element: chat-input
  value: "Good morning, I'm feeling anxious about today's presentation"
  result: Text entered

interaction_003:
  time: 08:30:25
  type: click
  element: send-button
  result: Message sent, loading indicator shown
```

#### AI Layer

**Prompt Sent**:
```json
{
  "system": "You are the ConsciousOS Guru...",
  "context": {
    "userLevel": 3,
    "dayNumber": 1,
    "activeLoops": ["perfectionism"],
    "recentMemories": [...]
  },
  "userMessage": "Good morning, I'm feeling anxious about today's presentation"
}
```

**Response Received**:
```json
{
  "content": "I hear you. That anxiety you're feeling...",
  "tokens": { "input": 425, "output": 185 },
  "latencyMs": 1245,
  "model": "claude-3-5-sonnet"
}
```

#### State Layer

**State Transitions**:
```
08:30:15 - guruMachine: idle → loadingMemories
08:30:16 - guruMachine: loadingMemories → active
08:30:25 - guruMachine: active → processing
08:30:26 - guruMachine: processing → active
08:45:00 - guruMachine: active → completing
08:45:01 - guruMachine: completing → completed
```

**Context Changes**:
```yaml
sessionId:
  before: null
  after: "sess-morning-001"

messages:
  before: []
  after: [{role: "user", content: "..."}, {role: "assistant", content: "..."}]

memories:
  before: null
  after: [{id: "mem-001", content: "..."}]
```

#### Memory Layer

**Retrieval Operations**:
```yaml
operation_001:
  type: retrieve
  memoryType: guru_long_term
  query:
    userId: "user-001"
    timeRange: "last_7_days"
  result:
    memoriesRetrieved: 5
    patternsIdentified: ["morning_anxiety"]
```

**Storage Operations**:
```yaml
operation_002:
  type: store
  memoryType: short_term
  data:
    content: "User expressed anxiety about work presentation"
    tags: ["morning", "anxiety", "work"]
    importance: 8
```

#### Engine Layer

**morning-context-aggregator**:
```yaml
execution:
  startTime: 08:30:15
  endTime: 08:30:18
  durationMs: 3000

steps:
  - name: fetch_yesterday_data
    durationMs: 12
    status: success
    output: { found: false }
  
  - name: fetch_active_loops
    durationMs: 8
    status: success
    output: { loops: ["perfectionism"] }
  
  - name: aggregate_guru_context
    durationMs: 15
    status: success
```

#### Database Layer

**Queries Executed**:
```sql
-- 08:30:12 - Create daily journey
INSERT INTO daily_journeys (user_id, date, status)
VALUES ('user-001', '2026-03-05', 'morning_pending');
-- Result: 1 row affected, 8ms

-- 08:30:16 - Fetch memories
SELECT * FROM guru_memory 
WHERE user_id = 'user-001' 
  AND created_at > NOW() - INTERVAL '7 days';
-- Result: 5 rows returned, 12ms

-- 08:45:01 - Update journey status
UPDATE daily_journeys 
SET status = 'tasks_active', morning_session_id = 'sess-001'
WHERE id = 'journey-001';
-- Result: 1 row affected, 6ms
```

---

## Midday Phase (12:00 PM - 5:59 PM)

### Scenario: Midday Presence Check-in

[Same six-layer structure as above]

---

## Evening Phase (6:00 PM - 9:59 PM)

### Scenario: Evening Sandhya Session

[Same six-layer structure as above]

---

## Night Phase (10:00 PM - 4:59 AM)

### Scenario: Sleep Preparation

[Same six-layer structure as above]

---

## Day Summary Metrics

### Progression

| Metric | Start | End | Change |
|--------|-------|-----|--------|
| XP | {startXP} | {endXP} | +{delta} |
| Level | {startLevel} | {endLevel} | +{delta} |
| Streak | {startStreak} | {endStreak} | +{delta} |

### Engagement

| Activity | Target | Actual | Rate |
|----------|--------|--------|------|
| Morning Session | 1 | {completed} | {rate}% |
| Tasks Completed | {target} | {actual} | {rate}% |
| Practice Time | {target}m | {actual}m | {rate}% |
| Journal Entries | {target} | {actual} | {rate}% |

### System Performance

| Metric | Average | Min | Max |
|--------|---------|-----|-----|
| Page Load | {avg}ms | {min}ms | {max}ms |
| AI Response | {avg}ms | {min}ms | {max}ms |
| DB Query | {avg}ms | {min}ms | {max}ms |

### Issues & Anomalies

| Time | Severity | Description | Resolution |
|------|----------|-------------|------------|
| {time} | {level} | {description} | {status} |

---

## Technical Notes

### State Machine Snapshots

**End of Day State**:
```yaml
guruMachine:
  state: completed
  context:
    sessionId: null
    messages: []
    memories: null

journeyMachine:
  state: completed
  context:
    dayNumber: {dayNumber}
    status: completed
```

### Database State

**Records Created**:
- daily_journeys: 1
- tasks: {count}
- chat_sessions: {count}
- chat_messages: {count}
- journal_entries: {count}
- guru_memory: {count}
- xp_transactions: {count}

**Records Updated**:
- profiles: 1 (XP, level updates)

### Memory Storage

**Session Memory**: Cleared
**Short-Term Memory**: Updated
**Long-Term Memory**: {bytes} bytes stored

---

## Screenshots

| Time | Description | File |
|------|-------------|------|
| 08:30:15 | Morning session start | day-{dayNumber}-morning-start.png |
| 08:30:25 | Guru response | day-{dayNumber}-guru-response.png |
| 12:15:00 | Midday presence | day-{dayNumber}-midday.png |
| 19:00:00 | Evening sandhya | day-{dayNumber}-evening.png |
| 22:30:00 | Night mode | day-{dayNumber}-night.png |

---

## Next Day Preview

Based on today's completion and current state:

- **Suggested Theme**: {theme}
- **Recommended Focus**: {focus}
- **Loop Work**: {loop}
- **Expected Tasks**: {count}

---

*Documentation generated by ConsciousOS E2E Testing Framework*
*Timestamp: {generationTimestamp}*
