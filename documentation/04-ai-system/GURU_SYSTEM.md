# Guru System Architecture

## Overview

The ConsciousOS Guru System is an AI-powered spiritual guidance platform featuring a 3D animated Guru with pixel streaming, real-time chat, voice interaction, and persistent memory. This document describes the hardened, production-ready architecture.

## Architecture Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Guru System Architecture                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   Frontend      │    │   Frontend      │    │   Frontend      │         │
│  │   Components    │    │   Hooks         │    │   Utilities     │         │
│  │                 │    │                 │    │                 │         │
│  │ • GuruPixelPlayer│   │ • useGuruStream │    │ • session-      │         │
│  │ • GuruSession   │    │ • useGuruHealth │    │   persistence   │         │
│  │ • SafeGuru      │    │                 │    │ • error-recovery│         │
│  │ • VoiceGuru3D   │    │                 │    │                 │         │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘         │
│           │                      │                      │                   │
│           ▼                      ▼                      ▼                   │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │                      State Management                            │     │
│  │                                                                  │     │
│  │  ┌─────────────────┐    ┌─────────────────┐                      │     │
│  │  │   guruMachine   │    │   XState        │                      │     │
│  │  │   (XState)      │    │   Actors        │                      │     │
│  │  │                 │    │                 │                      │     │
│  │  │ • idle          │    │ • fetchMemories │                      │     │
│  │  │ • loading       │    │ • persistState  │                      │     │
│  │  │ • active        │    │ • processNLP    │                      │     │
│  │  │ • processing    │    │                 │                      │     │
│  │  │ • error         │    │                 │                      │     │
│  │  └─────────────────┘    └─────────────────┘                      │     │
│  └──────────────────────────────────┬───────────────────────────────┘     │
│                                     │                                     │
│                                     ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │                    Transport Layer                               │     │
│  │                                                                  │     │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐   │     │
│  │  │  WebSocket       │  │  WebRTC          │  │  REST API    │   │     │
│  │  │  (Signaling)     │  │  (Pixel Stream)  │  │  (HTTP)      │   │     │
│  │  │                  │  │                  │  │              │   │     │
│  │  │ • Real-time      │  │ • Video          │  │ • Health     │   │     │
│  │  │   commands       │  │ • Audio          │  │   checks     │   │     │
│  │  │ • Chat           │  │ • Data channels  │  │ • Fallback   │   │     │
│  │  └──────────────────┘  └──────────────────┘  └──────────────┘   │     │
│  └──────────────────────────────────┬───────────────────────────────┘     │
│                                     │                                     │
│           ┌─────────────────────────┼─────────────────────────┐            │
│           │                         │                         │            │
│           ▼                         ▼                         ▼            │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │  Stream Server  │    │  Pixel Stream   │    │  Supabase       │         │
│  │  (Node.js)      │    │  (Unreal Engine)│    │  (Database)     │         │
│  │                 │    │                 │    │                 │         │
│  │ • Session Mgmt  │    │ • 3D Rendering  │    │ • Memories      │         │
│  │ • Rate Limiting │    │ • Animation     │    │ • Sessions      │         │
│  │ • Health Checks │    │ • Voice Sync    │    │ • Auth          │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. GuruPixelPlayer

The main video player component for 3D Guru pixel streaming.

**Features:**
- WebRTC connection with automatic retry and exponential backoff
- Connection health monitoring with visual indicators
- Graceful degradation (video → audio → text)
- Fullscreen and picture-in-picture support
- Mouse/keyboard input forwarding to Unreal Engine

**Connection State Machine:**
```
┌─────────┐     ┌──────────┐     ┌───────────┐     ┌──────────┐
│  Idle   │────▶│Connecting│────▶│ Connected │────▶│  Error   │
└─────────┘     └──────────┘     └───────────┘     └──────────┘
                    │                                │
                    │                                │
                    ▼                                ▼
              ┌──────────┐                      ┌──────────┐
              │Reconnect-│                      │  Failed  │
              │  ing     │                      │ (Final)  │
              └──────────┘                      └──────────┘
```

**Retry Logic:**
- Exponential backoff: `delay = baseDelay * 2^attempt`
- Maximum retry delay: 30 seconds
- Maximum attempts: 5 (configurable)
- Automatic reset on successful connection

### 2. GuruSession

Complete session management with persistence and recovery.

**Features:**
- Auto-save session state to localStorage
- Session recovery after page refresh
- Chat message persistence
- Context preservation (pose, breathing, expression)
- Timeout handling with graceful degradation

**Session Persistence:**
```typescript
interface PersistentSession {
  id: string;
  userId: string;
  messages: GuruMessage[];
  memories: GuruMemory[];
  context: GuruContext;
  timestamp: number;
  version: string;
}
```

### 3. SafeGuru

Error boundary wrappers for all Guru components.

**Components:**
- `SafeGuruPixelPlayer` - Streaming error handling
- `SafeGuruSession` - Session management errors
- `SafeGuruControls` - Control panel errors
- `SafeGuruNudgeCard` - Compact nudge error handling
- `SafeGuruContextBadge` - Badge error handling

**Error Coverage:**
- Streaming errors (WebRTC, connection loss)
- WebSocket errors (signaling, message delivery)
- Voice API errors (microphone, speech synthesis)
- Memory API errors (persistence, retrieval)

## State Management

### guruMachine (XState)

Finite state machine for Guru session lifecycle.

**States:**
1. **idle** - Initial state, waiting for user
2. **loadingMemories** - Fetching user memories
3. **loaded** - Memories loaded, ready for session
4. **startingSession** - Creating new session
5. **active** - Session active, accepting messages
6. **processing** - Processing user message
7. **endingSession** - Closing session
8. **error** - Error state with recovery options

**Transitions:**
```typescript
// Start session
LOAD_MEMORIES → loadingMemories
START_SESSION → startingSession

// Session operations
SEND_MESSAGE → processing
END_SESSION → endingSession

// Error handling
ERROR → error
RETRY → idle (or previous state)
```

## Utility Modules

### 1. session-persistence.ts

Comprehensive session persistence with privacy controls.

**Features:**
- localStorage-based persistence
- Automatic session cleanup (7-day default TTL)
- Multi-session support (up to 5 concurrent)
- Auto-save with configurable intervals
- Version compatibility checking

**API:**
```typescript
saveSession(session: PersistentSession, options?: PersistenceOptions): boolean
loadSession(sessionId: string): PersistentSession | null
loadActiveSession(): PersistentSession | null
cleanupOldSessions(maxAge?: number): number
createAutoSave(getSession, options): AutoSaveController
```

### 2. error-recovery.ts

Structured error handling and recovery strategies.

**Error Types:**
- `CONNECTION_LOST` - WebRTC/WebSocket disconnection
- `STREAM_ERROR` - Pixel streaming failure
- `VOICE_ERROR` - Voice interface failure
- `MEMORY_ERROR` - Memory persistence failure
- `WEBSOCKET_ERROR` - Signaling connection failure
- `AUTH_ERROR` - Authentication failure
- `TIMEOUT_ERROR` - Request timeout

**Recovery Strategies:**
- `retryWithBackoff` - Exponential backoff retry
- `switchToTextMode` - Fallback to text chat
- `disableVideo` - Audio-only mode
- `resetContext` - Fresh session start
- `switchToPolling` - HTTP polling fallback
- `redirectToLogin` - Re-authentication

**API:**
```typescript
createGuruError(type, message?, originalError?): GuruError
classifyError(error, context?): GuruError
handleGuruError(error, options?): Promise<RecoveryResult>
retryWithBackoff(fn, options?): Promise<T>
```

### 3. useGuruHealth Hook

Real-time health monitoring for connection quality.

**Metrics:**
- Connection latency (ms)
- Jitter (variance)
- Packet loss (%)
- Reconnect attempts
- Error count

**Health Status:**
- `healthy` - All systems operational
- `degraded` - Minor issues, still functional
- `unhealthy` - Significant problems
- `unknown` - Not yet assessed

**API:**
```typescript
useGuruHealth(connectionStatus, config?): {
  health: GuruHealth;
  checkHealth(): Promise<void>;
  recordError(): void;
  recordReconnect(): void;
  resetMetrics(): void;
  latencyHistory: number[];
}
```

## Server Architecture

### guru-stream-server (Node.js)

WebSocket gateway for real-time communication.

**Features:**
- WebSocket connection management
- Session multiplexing (10 concurrent max)
- Rate limiting (token bucket algorithm)
- Health check endpoints
- Animation command routing
- Graceful shutdown handling

**Endpoints:**
```
GET /health - General health status
GET /health/ready - Readiness probe
GET /health/live - Liveness probe
WS /ws - WebSocket endpoint
```

**Rate Limiting:**
- 100 messages/minute per client
- Burst size: 20 messages
- Progressive blocking after violations
- Automatic cleanup of stale entries

### Unreal Engine Pixel Streaming

3D Guru rendering and animation.

**Setup:**
- Pixel Streaming plugin enabled
- Custom animation blueprints
- Voice synchronization
- Gesture/expression triggers

**Communication:**
- WebRTC data channels for commands
- Video/audio streaming to browser
- Input forwarding from browser

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Error Handling Flow                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                  │
│  │  Error   │───▶│ Classify │───▶│  Log &   │                  │
│  │  Occurs  │    │  Error   │    │  Notify  │                  │
│  └──────────┘    └──────────┘    └────┬─────┘                  │
│                                       │                         │
│                              ┌────────┴────────┐                │
│                              ▼                 ▼                │
│                       ┌──────────┐      ┌──────────┐          │
│                       │ Retryable│      │Non-Retry-│          │
│                       │  Error   │      │  able    │          │
│                       └────┬─────┘      └────┬─────┘          │
│                            │                  │                │
│                            ▼                  ▼                │
│                    ┌──────────┐       ┌──────────────┐         │
│                    │ Attempt  │       │ Show Fallback│         │
│                    │ Recovery │       │      UI      │         │
│                    └────┬─────┘       └──────────────┘         │
│                         │                                       │
│              ┌─────────┴─────────┐                           │
│              ▼                   ▼                            │
│       ┌──────────┐        ┌──────────┐                       │
│       │ Success  │        │  Failed  │                       │
│       │          │        │          │                       │
│       │ Continue │        │ Max      │                       │
│       │ Normal   │        │ Retries? │                       │
│       └──────────┘        └────┬─────┘                       │
│                                │                              │
│                     ┌──────────┴──────────┐                  │
│                     ▼                      ▼                  │
│              ┌──────────┐         ┌──────────────┐          │
│              │  Retry   │         │    Final     │          │
│              │  Again   │         │   Fallback   │          │
│              │ (Backoff) │         │   Action     │          │
│              └──────────┘         └──────────────┘          │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

## Security Considerations

1. **localStorage Privacy**
   - Sessions expire after 7 days (configurable)
   - Automatic cleanup of stale data
   - Version tracking for migration

2. **Rate Limiting**
   - Client-level rate limiting on server
   - Progressive penalties for abuse
   - IP-based tracking with cleanup

3. **Error Exposure**
   - Internal errors logged but not displayed
   - User-friendly error messages
   - Context sanitized before transmission

## Performance Optimizations

1. **Connection Management**
   - Lazy loading of heavy components
   - WebSocket keep-alive ping/pong
   - Automatic cleanup on unmount

2. **Session Persistence**
   - Debounced auto-save (30s default)
   - Selective persistence (exclude sensitive data)
   - Version checking for compatibility

3. **Health Monitoring**
   - Non-blocking health checks
   - Configurable intervals
   - Metrics history limited to 20 readings

## Configuration

### Environment Variables

```bash
# Client
VITE_GURU_WEBSOCKET_URL=ws://localhost:8080/ws
VITE_GURU_SIGNALING_URL=http://localhost:8080
VITE_GURU_PIXEL_STREAMING=true

# Server
PORT=8080
PIXEL_STREAMING_URL=http://localhost:3000
MAX_CONCURRENT_SESSIONS=10
PING_INTERVAL=30000
PING_TIMEOUT=5000
RATE_LIMIT_MESSAGES_PER_MINUTE=100
RATE_LIMIT_BURST_SIZE=20
```

### Feature Flags

```typescript
GURU_FEATURES = {
  pixelStreaming: true,    // Enable 3D streaming
  webSocket: true,         // Enable real-time chat
  voice: true,             // Enable voice interaction
  fullscreen: true,        // Enable fullscreen mode
  sessionPersistence: true, // Enable auto-save
}
```

## Testing

### Test Coverage

- Connection retry logic
- Session persistence and recovery
- Error classification and recovery
- Health monitoring accuracy
- Error boundary coverage

### Test Commands

```bash
# Run Guru system tests
npm test -- src/components/guru/__tests__/GuruSystem.test.tsx

# Run with coverage
npm test -- --coverage --testPathPattern=GuruSystem
```

## Monitoring and Debugging

### Health Check Dashboard

Access `/health` endpoint for real-time status:

```json
{
  "status": "healthy",
  "timestamp": "2026-02-28T10:30:00.000Z",
  "uptime": 3600,
  "sessions": 5,
  "clients": 8,
  "queue": { "pending": 2, "processing": 1 },
  "rateLimiting": { "totalEntries": 15, "blockedEntries": 0 }
}
```

### Error Tracking

Errors are tracked with context for debugging:

```typescript
{
  type: 'CONNECTION_LOST',
  message: 'Connection failed after 5 attempts',
  severity: 'high',
  retryable: true,
  context: { sessionId: 'xxx', attempt: 5, latency: 5000 },
  timestamp: 1772273919867
}
```

## Future Enhancements

1. **Encryption** - Encrypt sensitive session data in localStorage
2. **Service Worker** - Offline support with service worker caching
3. **Analytics** - Detailed usage analytics and error reporting
4. **A/B Testing** - Feature flag support for gradual rollouts
5. **Multi-Guru** - Support for multiple Guru personas

## API Reference

See inline JSDoc comments for detailed API documentation in:
- `src/lib/guru/session-persistence.ts`
- `src/lib/guru/error-recovery.ts`
- `src/hooks/useGuruHealth.ts`
- `src/machines/guruMachine.ts`
