// ============================================================
// EDGE FUNCTION MIDDLEWARE — Standardized Auth, Credits, CORS, Errors
// ============================================================
// Usage in edge functions:
// import { withMiddleware, requireAuth, requireCredits } from "../_shared/middleware.ts";
// 
// Deno.serve(withMiddleware(async (req, context) => {
//   // context.user, context.admin, context.userId available
//   // Credits already checked if requireCredits was used
// }));

import { createClient } from "npm:@supabase/supabase-js@2";
import { check_credit_balance, computeChargedPaise } from "./billing-from-req.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

export interface MiddlewareContext {
  user: any;
  userId: string;
  admin: any;
  supabase: any; // user-scoped client
}

type Handler = (req: Request, context: MiddlewareContext) => Promise<Response>;

interface MiddlewareOptions {
  requireAuth?: boolean;
  minCredits?: number;
  cors?: boolean;
  rateLimit?: { maxRequests: number; windowMs: number };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function corsResponse(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
}

function errorResponse(message: string, status: number, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extraHeaders },
  });
}

async function extractUser(req: Request): Promise<{ user: any; userId: string; supabase: any } | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const supabase = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  return { user, userId: user.id, supabase };
}

async function checkCredits(admin: any, userId: string, minCredits: number): Promise<boolean> {
  try {
    const { data } = await admin.rpc("check_credit_balance", { p_user_id: userId, p_min_balance: minCredits });
    return data?.sufficient === true;
  } catch {
    return false;
  }
}

export function withMiddleware(
  handler: Handler,
  options: MiddlewareOptions = {}
): (req: Request) => Promise<Response> {
  const {
    requireAuth = true,
    minCredits,
    cors = true,
    rateLimit,
  } = options;

  return async (req: Request): Promise<Response> => {
    const startTime = Date.now();

    // CORS preflight
    if (cors && req.method === "OPTIONS") {
      return corsResponse();
    }

    // Rate limiting (simple in-memory, per deployment)
    if (rateLimit) {
      // Would need persistent store (Redis/KV) for production
      // Placeholder for now
    }

    // Auth extraction
    let context: MiddlewareContext | null = null;
    if (requireAuth) {
      const authResult = await extractUser(req);
      if (!authResult) {
        return errorResponse("Unauthorized", 401);
      }

      const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
      context = { ...authResult, admin };

      // Credit check
      if (minCredits && minCredits > 0) {
        const hasCredits = await checkCredits(admin, authResult.userId, minCredits);
        if (!hasCredits) {
          return errorResponse("Insufficient credits", 402, { "X-Credit-Required": String(minCredits) });
        }
      }
    } else {
      // No auth required, but create admin client
      context = {
        user: null,
        userId: "",
        admin: createClient(SUPABASE_URL, SERVICE_ROLE),
        supabase: createClient(SUPABASE_URL, ANON_KEY),
      };
    }

    try {
      const response = await handler(req, context!);
      
      // Add timing header
      const elapsed = Date.now() - startTime;
      const headers = new Headers(response.headers);
      headers.set("X-Response-Time", `${elapsed}ms`);
      
      // Ensure CORS headers on all responses
      if (cors) {
        for (const [key, value] of Object.entries(corsHeaders)) {
          headers.set(key, value);
        }
      }
      
      return new Response(response.body, {
        status: response.status,
        headers,
      });
    } catch (error) {
      console.error("[Edge Function Error]", error);
      return errorResponse(
        error instanceof Error ? error.message : "Internal server error",
        500
      );
    }
  };
}

// Specialized middleware combinators
export const requireAuth = (handler: Handler) => withMiddleware(handler, { requireAuth: true });
export const requireCredits = (minCredits: number) => (handler: Handler) => withMiddleware(handler, { requireAuth: true, minCredits });
export const publicEndpoint = (handler: Handler) => withMiddleware(handler, { requireAuth: false });

// Utility: get user context with credit check (for functions that need custom logic)
export async function getAuthenticatedContext(req: Request, minCredits = 0): Promise<MiddlewareContext | { error: Response }> {
  const authResult = await extractUser(req);
  if (!authResult) return { error: errorResponse("Unauthorized", 401) };

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  
  if (minCredits > 0) {
    const hasCredits = await checkCredits(admin, authResult.userId, minCredits);
    if (!hasCredits) return { error: errorResponse("Insufficient credits", 402) };
  }

  return { ...authResult, admin };
}

// Standardized success response
export function successResponse<T>(data: T, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify({ ok: true, ...data }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extraHeaders },
  });
}

// Standardized error response
export function failureResponse(message: string, status = 400, extraHeaders: Record<string, string> = {}): Response {
  return errorResponse(message, status, extraHeaders);
}