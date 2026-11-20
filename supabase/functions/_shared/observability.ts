/**
 * EDGE FUNCTION OBSERVABILITY — Metrics wrapper for all Deno edge functions
 * Wrap every handler: export const handler = withMetrics('fn-name', async (req) => { ... })
 */

import { createClient } from 'npm:@supabase/supabase-js@2';

export interface FnMetrics {
  fnName: string;
  durationMs: number;
  aiCalls: number;
  aiTokensIn: number;
  aiTokensOut: number;
  aiCostPaise: number;
  dbQueries: number;
  cacheHits: number;
  cacheMisses: number;
  error?: string;
  userId?: string;
  timestamp: string;
}

// In-memory buffer (flushed periodically)
const metricsBuffer: FnMetrics[] = [];
const FLUSH_INTERVAL_MS = 30_000; // 30 seconds
const BUFFER_MAX = 100;

let flushTimer: number | null = null;

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(async () => {
    flushTimer = null;
    await flushMetrics();
  }, FLUSH_INTERVAL_MS);
}

async function flushMetrics() {
  if (metricsBuffer.length === 0) return;
  
  const toFlush = metricsBuffer.splice(0, BUFFER_MAX);
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) return;
    
    const admin = createClient(supabaseUrl, serviceKey);
    await admin.from('edge_function_metrics').insert(toFlush);
  } catch (e) {
    console.warn('[observability] Failed to flush metrics:', (e as Error).message);
    // Put back on buffer (with limit)
    metricsBuffer.unshift(...toFlush.slice(0, BUFFER_MAX));
  }
}

/** Wrap an edge function handler with metrics collection */
export function withMetrics<T extends Request>(
  fnName: string,
  handler: (req: T) => Promise<Response>
): (req: T) => Promise<Response> {
  return async (req: T) => {
    const start = Date.now();
    const metrics: FnMetrics = {
      fnName,
      durationMs: 0,
      aiCalls: 0,
      aiTokensIn: 0,
      aiTokensOut: 0,
      aiCostPaise: 0,
      dbQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      timestamp: new Date().toISOString(),
    };

    // Extract user ID from auth header if present
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
        if (supabaseUrl && anonKey) {
          const userClient = createClient(supabaseUrl, anonKey, {
            global: { headers: { Authorization: authHeader } },
          });
          const { data: { user } } = await userClient.auth.getUser();
          if (user) metrics.userId = user.id;
        }
      } catch { /* ignore */ }
    }

    // Patch console to capture AI calls (if using aiGatewayFetch)
    const originalFetch = globalThis.fetch;
    let fetchPatched = false;
    
    const patchFetch = () => {
      if (fetchPatched) return;
      fetchPatched = true;
      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = input instanceof Request ? input.url : String(input);
        const isAICall = url.includes('groq.com') || url.includes('generativelanguage.googleapis.com');
        
        const resp = await originalFetch(input, init);
        
        if (isAICall && resp.ok) {
          metrics.aiCalls++;
          // Try to extract token usage from response
          try {
            const clone = resp.clone();
            const data = await clone.json();
            if (data.usage) {
              metrics.aiTokensIn += data.usage.prompt_tokens || 0;
              metrics.aiTokensOut += data.usage.completion_tokens || 0;
              // Rough cost estimation (will be refined by ai-billing)
              metrics.aiCostPaise += estimateAICost(url, data.usage);
            }
          } catch { /* ignore */ }
        }
        return resp;
      };
    };

    // Patch Supabase client to count DB queries
    // This is best-effort; real implementation would wrap the Supabase client
    
    try {
      patchFetch();
      const response = await handler(req);
      metrics.durationMs = Date.now() - start;
      metrics.error = response.ok ? undefined : `HTTP ${response.status}`;
      return response;
    } catch (e) {
      metrics.durationMs = Date.now() - start;
      metrics.error = (e as Error).message;
      throw e;
    } finally {
      // Restore fetch
      if (fetchPatched) {
        globalThis.fetch = originalFetch;
      }
      metricsBuffer.push(metrics);
      if (metricsBuffer.length >= BUFFER_MAX) {
        await flushMetrics();
      } else {
        scheduleFlush();
      }
    }
  };
}

/** Estimate AI cost in paise from token usage */
function estimateAICost(url: string, usage: any): number {
  const isGroq = url.includes('groq.com');
  const isGemini = url.includes('generativelanguage.googleapis.com');
  
  const inputTokens = usage.prompt_tokens || 0;
  const outputTokens = usage.completion_tokens || 0;
  
  // Rough estimates (paise per 1K tokens)
  if (isGroq) {
    // Groq: ~$0.05-0.59 per 1M tokens depending on model
    return Math.round((inputTokens * 0.05 + outputTokens * 0.15) / 1000 * 100); // paise
  }
  if (isGemini) {
    // Gemini 2.5 Pro: ~$1.25/1M in, $5/1M out
    return Math.round((inputTokens * 1.25 + outputTokens * 5) / 1000 * 100); // paise
  }
  return 0;
}

/** Manual metric recording for non-fetch operations */
export function recordMetric(partial: Partial<FnMetrics> & { fnName: string }) {
  const existing = metricsBuffer.find(m => m.fnName === partial.fnName && !m.durationMs);
  if (existing) {
    Object.assign(existing, partial);
  } else {
    metricsBuffer.push({
      fnName: partial.fnName,
      durationMs: 0,
      aiCalls: 0,
      aiTokensIn: 0,
      aiTokensOut: 0,
      aiCostPaise: 0,
      dbQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      timestamp: new Date().toISOString(),
      ...partial,
    });
  }
}

/** Record DB query */
export function recordDbQuery(fnName: string, count = 1) {
  recordMetric({ fnName, dbQueries: count });
}

/** Record cache hit/miss */
export function recordCache(fnName: string, hit: boolean) {
  recordMetric({ fnName, cacheHits: hit ? 1 : 0, cacheMisses: hit ? 0 : 1 });
}

/** Record AI call details */
export function recordAICall(fnName: string, tokensIn: number, tokensOut: number, costPaise: number) {
  recordMetric({ fnName, aiCalls: 1, aiTokensIn: tokensIn, aiTokensOut: tokensOut, aiCostPaise: costPaise });
}

/** Get buffered metrics (for testing/debugging) */
export function getBufferedMetrics(): FnMetrics[] {
  return [...metricsBuffer];
}

/** Force flush */
export async function forceFlushMetrics(): Promise<void> {
  await flushMetrics();
}