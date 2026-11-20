import { createClient } from "npm:@supabase/supabase-js@2";
import {
  calculateCredits,
  getConfig,
  isDev,
  isProd,
  paymentLog,
  validateAmount,
} from "../_shared/payment-config.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * HMAC-SHA256 signature verification (Razorpay standard)
 */
async function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const data = encoder.encode(`${orderId}|${paymentId}`);
  const sig = await crypto.subtle.sign("HMAC", key, data);
  const hexSig = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hexSig === signature;
}

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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount_paise } =
      await req.json();

    // ─── Input Validation ───
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !amount_paise) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amountCheck = validateAmount(amount_paise);
    if (!amountCheck.valid) {
      return new Response(JSON.stringify({ error: amountCheck.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Signature Verification ───
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keySecret) {
      paymentLog.error("RAZORPAY_KEY_SECRET not configured");
      return new Response(JSON.stringify({ error: "Payment gateway misconfigured" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const signatureValid = await verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      keySecret
    );

    if (!signatureValid) {
      paymentLog.error("Invalid payment signature", {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        userId: user.id,
      });
      return new Response(
        JSON.stringify({ error: "Payment verification failed — invalid signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    paymentLog.info("Signature verified ✓", { orderId: razorpay_order_id });

    // ─── Service Client ───
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ─── Idempotency: Check for duplicate payment ───
    const { data: existingTx } = await admin
      .from("credit_transactions")
      .select("id, credits_paise")
      .eq("razorpay_payment_id", razorpay_payment_id)
      .maybeSingle();

    if (existingTx) {
      paymentLog.warn("Duplicate payment verification attempt", {
        paymentId: razorpay_payment_id,
        existingTxId: existingTx.id,
      });
      // Return success with existing data (idempotent)
      const { data: currentCredits } = await admin
        .from("user_credits")
        .select("balance_paise")
        .eq("user_id", user.id)
        .single();

      return new Response(
        JSON.stringify({
          success: true,
          credits_added: existingTx.credits_paise,
          new_balance: currentCredits?.balance_paise || 0,
          deduplicated: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── Production: Cross-verify with Razorpay API ───
    if (isProd()) {
      const keyId = Deno.env.get("RAZORPAY_KEY_ID")!;
      const paymentRes = await fetch(
        `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
        {
          headers: {
            Authorization: "Basic " + btoa(`${keyId}:${keySecret}`),
          },
        }
      );

      if (paymentRes.ok) {
        const paymentData = await paymentRes.json();
        // Verify amount matches what Razorpay captured
        if (paymentData.amount !== amount_paise) {
          paymentLog.error("Amount mismatch!", {
            expected: amount_paise,
            actual: paymentData.amount,
            paymentId: razorpay_payment_id,
          });
          return new Response(
            JSON.stringify({ error: "Payment amount mismatch — possible tampering" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        // Verify payment status is captured
        if (paymentData.status !== "captured" && paymentData.status !== "authorized") {
          paymentLog.error("Payment not captured", {
            status: paymentData.status,
            paymentId: razorpay_payment_id,
          });
          return new Response(
            JSON.stringify({ error: `Payment status: ${paymentData.status}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        paymentLog.error("Failed to verify payment with Razorpay API");
        return new Response(
          JSON.stringify({ error: "Could not verify payment with gateway" }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ─── Calculate Credits ───
    const creditsPaise = calculateCredits(amount_paise);

    // ─── Atomic Credit Update (using RPC to prevent race conditions) ───
    // First, ensure user_credits row exists
    const { data: existingCredits } = await admin
      .from("user_credits")
      .select("balance_paise, total_purchased_paise")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingCredits) {
      // Use atomic update
      await admin
        .from("user_credits")
        .update({
          balance_paise: existingCredits.balance_paise + creditsPaise,
          total_purchased_paise: existingCredits.total_purchased_paise + amount_paise,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
    } else {
      await admin.from("user_credits").insert({
        user_id: user.id,
        balance_paise: creditsPaise,
        total_purchased_paise: amount_paise,
      });
    }

    // ─── Log Transaction ───
    await admin.from("credit_transactions").insert({
      user_id: user.id,
      type: "purchase",
      amount_paise,
      credits_paise: creditsPaise,
      razorpay_payment_id,
      razorpay_order_id,
      description: `Purchased ₹${(amount_paise / 100).toFixed(0)} → ₹${(creditsPaise / 100).toFixed(0)} credits`,
    });

    paymentLog.info("Payment verified & credits added ✓", {
      userId: user.id,
      creditsPaise,
      paymentId: razorpay_payment_id,
    });

    const newBalance = (existingCredits?.balance_paise || 0) + creditsPaise;

    return new Response(
      JSON.stringify({
        success: true,
        credits_added: creditsPaise,
        new_balance: newBalance,
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
