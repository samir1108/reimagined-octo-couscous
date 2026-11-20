// save-observation: save session observations and consolidate into threads
import { createClient } from " npm:@supabase/supabase-js@2\;

const corsHeaders = {
 \Access-Control-Allow-Origin\: \*\,
 \Access-Control-Allow-Headers\: \authorization x-client-info apikey content-type\,
 \Access-Control-Allow-Methods\: \POST OPTIONS\,
};

Deno.serve(async (req) => {
 if (req.method === \OPTIONS\) return new Response(\ok\, { headers: corsHeaders });
 try {
 const authHeader = req.headers.get(\Authorization\) ?? \\;
 const supabase = createClient(
 Deno.env.get(\SUPABASE_URL\)!,
 Deno.env.get(\SUPABASE_ANON_KEY\)!,
 { global: { headers: { Authorization: authHeader } } }
 );
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return new Response(JSON.stringify({ error: \unauthorized\ }), { status: 401, headers: { ...corsHeaders, \Content-Type\: \application/json\ } });

 const body = await req.json().catch(() => ({}));
 const id = body.id || crypto.randomUUID();
 const { data, error } = await supabase.from(\session_observations\).insert({
 id,
 user_id: user.id,
 session_id: body.session_id ?? null,
 thread_id: body.thread_id ?? null,
 observation: body.observation,
 confirmed: body.confirmed ?? false,
 source: body.source ?? \user_shared\,
 confidence: body.confidence ?? 1.0,
 }).select().single();
 if (error) throw error;

 // If observation is linked to a thread, increment exploration count
 if (body.thread_id) {
 await supabase.rpc(\increment_thread_exploration\, { p_thread_id: body.thread_id }).catch(() => {});
 }

 return new Response(JSON.stringify({ ok: true, observation: data }), { headers: { ...corsHeaders, \Content-Type\: \application/json\ } });
 } catch (e: any) {
 console.error(\save-observation error\, e);
 return new Response(JSON.stringify({ error: e?.message ?? \unknown\ }), { status: 500, headers: { ...corsHeaders, \Content-Type\: \application/json\ } });
 }
});

