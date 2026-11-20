import { createClient } from 'npm:@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: corsHeaders });

    const { data: roleRow } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle();
    if (!roleRow) return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: corsHeaders });

    const { broadcast_id } = await req.json();
    if (!broadcast_id) return new Response(JSON.stringify({ error: 'broadcast_id required' }), { status: 400, headers: corsHeaders });

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: bc, error: bcErr } = await admin.from('broadcasts').select('*').eq('id', broadcast_id).maybeSingle();
    if (bcErr || !bc) return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: corsHeaders });
    if (bc.status === 'sent') return new Response(JSON.stringify({ error: 'already sent' }), { status: 400, headers: corsHeaders });

    // Resolve segment to user_ids
    let userIds: string[] = [];
    if (bc.segment === 'all') {
      const { data } = await admin.from('profiles').select('user_id');
      userIds = (data ?? []).map((r: any) => r.user_id);
    } else if (bc.segment === 'onboarded') {
      const { data } = await admin.from('profiles').select('user_id').eq('onboarded', true);
      userIds = (data ?? []).map((r: any) => r.user_id);
    } else if (bc.segment === 'at_risk') {
      const { data } = await admin.from('user_health_scores').select('user_id').in('risk_level', ['at_risk', 'critical']);
      userIds = (data ?? []).map((r: any) => r.user_id);
    }

    // Insert notifications in chunks
    const rows = userIds.map((uid) => ({
      user_id: uid,
      type: 'broadcast',
      title: bc.title,
      body: bc.body,
      metadata: { broadcast_id: bc.id },
    }));
    for (let i = 0; i < rows.length; i += 500) {
      await admin.from('notifications').insert(rows.slice(i, i + 500));
    }

    await admin.from('broadcasts').update({ status: 'sent', recipient_count: rows.length, sent_at: new Date().toISOString() }).eq('id', bc.id);

    return new Response(JSON.stringify({ ok: true, recipients: rows.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
