import { createClient } from 'npm:@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tier 4: Churn predictor — replays health scores into churn probability table.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: corsHeaders });
    const { data: roleRow } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle();
    if (!roleRow) return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: corsHeaders });

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: scores } = await admin
      .from('user_health_scores')
      .select('user_id, churn_risk, risk_factors, last_active_at');

    let upserted = 0;
    for (const s of scores ?? []) {
      const prob = Math.min(1, Math.max(0, Number(s.churn_risk) / 100));
      const days = s.last_active_at ? Math.floor((Date.now() - new Date(s.last_active_at).getTime()) / 86400000) : 999;
      let topReason = 'Low engagement';
      if (days > 14) topReason = `Inactive ${days} days`;
      else if (prob > 0.5) topReason = 'Engagement declining';

      const predicted = new Date(Date.now() + (1 - prob) * 30 * 86400000).toISOString().slice(0, 10);
      await admin.from('churn_predictions').upsert({
        user_id: s.user_id,
        churn_probability: prob,
        predicted_churn_date: predicted,
        top_reason: topReason,
        reasons: s.risk_factors ?? [],
        computed_at: new Date().toISOString(),
      });
      upserted++;
    }

    return new Response(JSON.stringify({ ok: true, upserted }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
