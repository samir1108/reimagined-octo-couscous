import { createClient } from "npm:@supabase/supabase-js@2";
import {
  validateAmount,
  generateReceipt,
  getConfig,
  isDev,
  paymentLog,
} from "../_shared/payment-config.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ─── Auth ───
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { amount } = await req.json(); // amount in paise

    // ─── Validate Amount ───
    const amountCheck = validateAmount(amount);
    if (!amountCheck.valid) {
      return new Response(
        JSON.stringify({ error: amountCheck.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      paymentLog.error("Razorpay keys not configured");
      return new Response(
        JSON.stringify({
          error: "Payment gateway not configured",
          ...(isDev() && { hint: "Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in secrets" }),
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const receipt = generateReceipt(user.id);
    paymentLog.info("Creating order:", { amount, receipt, userId: user.id });

    // ─── Idempotency: Check if recent order exists for same user+amount ───
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const config = getConfig();
    const windowStart = new Date(Date.now() - config.idempotencyWindow * 1000).toISOString();

    const { data: recentOrder } = await admin
      .from("credit_transactions")
      .select("razorpay_order_id")
      .eq("user_id", user.id)
      .eq("amount_paise", amount)
      .eq("type", "purchase")
      .gte("created_at", windowStart)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentOrder?.razorpay_order_id) {
      paymentLog.warn("Duplicate order attempt blocked", {
        userId: user.id,
        existingOrderId: recentOrder.razorpay_order_id,
      });
      // Return existing order instead of creating new one
      return new Response(
        JSON.stringify({
          order_id: recentOrder.razorpay_order_id,
          amount,
          currency: "INR",
          key_id: keyId,
          deduplicated: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── Create Razorpay Order ───
    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(`${keyId}:${keySecret}`),
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt,
        notes: {
          user_id: user.id,
          mode: isDev() ? "development" : "production",
        },
      }),
    });

    if (!orderRes.ok) {
      const errText = await orderRes.text();
      paymentLog.error("Razorpay API error:", orderRes.status, errText);
      return new Response(
        JSON.stringify({
          error: "Failed to create payment order",
          ...(isDev() && { debug: errText }),
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const order = await orderRes.json();
    paymentLog.info("Order created:", order.id);

    return new Response(
      JSON.stringify({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: keyId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    paymentLog.error("Unhandled error:", e);
    return new Response(
      JSON.stringify({
        error: "Internal error",
        ...(isDev() && { debug: e.message }),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
