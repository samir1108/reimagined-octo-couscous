import { createClient } from 'npm:@supabase/supabase-js@2';
import { buildLongTermMemoryBlock } from '../_shared/long-term-memory.ts';
import { aiGatewayFetchWithLang } from '../_shared/ai-config.ts';
import { getUserContext } from '../_shared/user-context.ts';

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const userCtx = await getUserContext(userClient, user.id, {});
    const memBlock = await buildLongTermMemoryBlock({ admin, userId: user.id, queryText: 'patterns threads', activeLoops: userCtx.recentLoopIds }).catch(() => '');
    const sys = "You are a careful memory consolidator. Suggest 1-2 candidate Open Threads. Treat inferences as HYPOTHESES. Return ONLY JSON: {\"candidates\":[{\"question\":\"string\",\"evidence\":[\"string\"],\"confidence\":0.5,\"reason\":\"string\"}]}";
    const userMsg = 'GOALS:' + JSON.stringify(userCtx.personalization.goals) + '\nOBS:' + JSON.stringify(userCtx.personalization.confirmedObservations.slice(0,10)) + '\nMEM:' + memBlock;
    const r = await aiGatewayFetchWithLang(req, { model: 'tier:fast', messages: [{ role: 'system', content: sys }, { role: 'user', content: userMsg }], response_format: { type: 'json_object' } }, {}, { admin, userId: user.id, functionName: 'consolidate-memory-thread', aiMode: userCtx.identity.aiMode === 'premium' ? 'premium' : 'fast' });
    if (!r.ok) return new Response(JSON.stringify({ ok: true, candidates: [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const j = await r.json();
    let parsed: any = null;
    try { parsed = JSON.parse(j?.choices?.[0]?.message?.content || '{}'); } catch {}
    return new Response(JSON.stringify({ ok: true, candidates: parsed?.candidates ?? [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? 'unknown' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
