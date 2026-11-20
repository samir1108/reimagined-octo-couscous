// ============================================================
// ORCHESTRATOR HEALTH — Health Check & Metrics Endpoint
// ============================================================
// Provides health status, latency metrics, and system diagnostics
// for the ConsciousnessOrchestrator pipeline.

import { createClient } from "npm:@supabase/supabase-js@2";
import { withMiddleware, successResponse } from "../_shared/middleware.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface HealthCheckResult {
  ok: boolean;
  timestamp: string;
  version: string;
  checks: {
    database: { ok: boolean; latencyMs: number };
    aiGateway: { ok: boolean; latencyMs: number };
    memory: { ok: boolean; latencyMs: number };
    hardwareSignals: { ok: boolean; latencyMs: number };
    vLevelRpc: { ok: boolean; latencyMs: number };
  };
  metrics: {
    p50LatencyMs: number;
    p99LatencyMs: number;
    errorRate: number;
    sessionsLastHour: number;
    memoryInjectionRate: number;
    hardwareSignalRate: number;
  };
  featureFlags: {
    sankalpaV3: boolean;
    hardwareSignals: boolean;
    memoryInjection: boolean;
    noveltyFilter: boolean;
  };
}

Deno.serve(withMiddleware(async (req, context) => {
  const { admin } = context;
  const startTime = Date.now();
  
  // Check if admin (for full metrics) or user (basic health)
  const isAdmin = context.user?.id && await checkIsAdmin(admin, context.user.id);
  
  const checks = await Promise.allSettled([
    checkDatabase(admin),
    checkAIGateway(),
    checkMemory(admin),
    checkHardwareSignals(admin),
    checkVLevelRpc(admin),
  ]);

  const healthResult: HealthCheckResult = {
    ok: checks.every(c => c.status === 'fulfilled' && c.value.ok),
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    checks: {
      database: checks[0].status === 'fulfilled' ? checks[0].value : { ok: false, latencyMs: -1 },
      aiGateway: checks[1].status === 'fulfilled' ? checks[1].value : { ok: false, latencyMs: -1 },
      memory: checks[2].status === 'fulfilled' ? checks[2].value : { ok: false, latencyMs: -1 },
      hardwareSignals: checks[3].status === 'fulfilled' ? checks[3].value : { ok: false, latencyMs: -1 },
      vLevelRpc: checks[4].status === 'fulfilled' ? checks[4].value : { ok: false, latencyMs: -1 },
    },
    metrics: isAdmin ? await getMetrics(admin) : getEmptyMetrics(),
    featureFlags: {
      sankalpaV3: true, // Now enabled by default
      hardwareSignals: true,
      memoryInjection: true,
      noveltyFilter: true,
    },
  };

  const statusCode = healthResult.ok ? 200 : 503;
  return successResponse(healthResult, statusCode);
}));

async function checkDatabase(admin: any): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    await admin.from("profiles").select("id").limit(1);
    return { ok: true, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}

async function checkAIGateway(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    // Quick ping to AI gateway
    const resp = await fetch(`${Deno.env.get("AI_GATEWAY_URL")}/health`, { 
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    return { ok: resp.ok, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}

async function checkMemory(admin: any): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    await admin.from("user_memory_vectors").select("id").limit(1);
    return { ok: true, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}

async function checkHardwareSignals(admin: any): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    await admin.from("bio_signals").select("id").limit(1);
    return { ok: true, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}

async function checkVLevelRpc(admin: any): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    const { error } = await admin.rpc("compute_vlevel", {
      p_dimension_scores: { thought: 3, emotion: 3, body: 3, awareness: 3 },
      p_profile: { journey_day: 10, last_session_at: new Date().toISOString() },
    });
    return { ok: !error, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}

async function checkIsAdmin(admin: any, userId: string): Promise<boolean> {
  try {
    const { data } = await admin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}

async function getMetrics(admin: any) {
  const hourAgo = new Date(Date.now() - 3600000).toISOString();
  
  const [
    { data: sessions },
    { data: memoryCalls },
    { data: hardwareSignals },
  ] = await Promise.all([
    admin.from("session_spine").select("id, elapsed_ms, created_at").gte("created_at", hourAgo),
    admin.from("user_memory_vectors").select("id, created_at").gte("created_at", hourAgo),
    admin.from("bio_signals").select("id, created_at").gte("created_at", hourAgo),
  ]);

  const latencies = sessions?.map(s => s.elapsed_ms).filter(Boolean) || [];
  latencies.sort((a, b) => a - b);

  return {
    p50LatencyMs: latencies.length ? latencies[Math.floor(latencies.length * 0.5)] : 0,
    p99LatencyMs: latencies.length ? latencies[Math.floor(latencies.length * 0.99)] : 0,
    errorRate: 0, // Would track from logs
    sessionsLastHour: sessions?.length || 0,
    memoryInjectionRate: memoryCalls?.length || 0,
    hardwareSignalRate: hardwareSignals?.length || 0,
  };
}

function getEmptyMetrics() {
  return {
    p50LatencyMs: 0,
    p99LatencyMs: 0,
    errorRate: 0,
    sessionsLastHour: 0,
    memoryInjectionRate: 0,
    hardwareSignalRate: 0,
  };
}