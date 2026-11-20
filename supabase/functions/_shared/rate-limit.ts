// ============================================================
// Simple rate limiter for edge functions
// Uses ai_usage_log table to track request frequency per user.
// ============================================================

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  maxRequests: number;      // Max requests allowed
  windowMs: number;         // Time window in milliseconds
  scope: "user" | "ip";     // Rate limit by user or IP
}

/**
 * Default rate limits for different function types
 */
export const RATE_LIMITS = {
  AI_CHAT: { maxRequests: 30, windowMs: 60 * 1000, scope: "user" as const },
  AI_SESSION: { maxRequests: 10, windowMs: 60 * 1000, scope: "user" as const },
  AI_ANALYSIS: { maxRequests: 5, windowMs: 60 * 1000, scope: "user" as const },
  GENERAL: { maxRequests: 100, windowMs: 60 * 1000, scope: "user" as const },
} as const;

/**
 * Check if a user has exceeded the rate limit
 * Returns true if the request should be allowed, false if rate limited
 */
export async function checkRateLimit(
  admin: any,
  userId: string,
  config: RateLimitConfig,
  functionName: string,
): Promise<{ allowed: boolean; remaining: number; resetAt: string }> {
  try {
    const windowStart = new Date(Date.now() - config.windowMs).toISOString();

    const { count, error } = await admin
      .from("ai_usage_log")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("function_name", functionName)
      .gte("created_at", windowStart);

    if (error) {
      console.warn("[rate-limit] query failed:", error);
      return { allowed: true, remaining: config.maxRequests, resetAt: new Date(Date.now() + config.windowMs).toISOString() };
    }

    const requestCount = count ?? 0;
    const remaining = Math.max(0, config.maxRequests - requestCount);
    const resetAt = new Date(Date.now() + config.windowMs).toISOString();

    return {
      allowed: requestCount < config.maxRequests,
      remaining,
      resetAt,
    };
  } catch (e) {
    console.warn("[rate-limit] check failed:", e);
    return { allowed: true, remaining: config.maxRequests, resetAt: new Date(Date.now() + config.windowMs).toISOString() };
  }
}

/**
 * Middleware helper: check rate limit and return a Response if limited
 * Usage:
 *   const rateResult = await enforceRateLimit(admin, userId, RATE_LIMITS.AI_CHAT, "guide-chat");
 *   if (rateResult) return rateResult; // 429 response
 *   // ... continue processing
 */
export async function enforceRateLimit(
  admin: any,
  userId: string,
  config: RateLimitConfig,
  functionName: string,
): Promise<Response | null> {
  const result = await checkRateLimit(admin, userId, config, functionName);

  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded",
        retryAfter: Math.ceil((new Date(result.resetAt).getTime() - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil((new Date(result.resetAt).getTime() - Date.now()) / 1000)),
        },
      },
    );
  }

  return null;
}
