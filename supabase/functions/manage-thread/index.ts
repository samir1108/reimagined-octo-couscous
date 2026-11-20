// manage-thread: Create/update/resume/abandon/resolve open threads
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
 const action = body.action as string;

 if (action === \create\) {
 const id = body.id || crypto.randomUUID();
 const { data, error } = await supabase.from(\open_threads\).insert({
 id,
 user_id: user.id,
 question: body.question,
 origin_goal_id: body.origin_goal_id ?? null,
 origin_observation_id: body.origin_observation_id ?? null,
 status: \open\,
 depth_mode: \arrive\,
 source: body.source ?? \user_shared\,
 confidence: body.confidence ?? 1.0,
 }).select().single();
 if (error) throw error;
 return new Response(JSON.stringify({ ok: true, thread: data }), { headers: { ...corsHeaders, \Content-Type\: \application/json\ } });
 }

 if (action === \update\) {
 const updates: any = { updated_at: new Date().toISOString() };
 if (body.status) updates.status = body.status;
 if (body.depth_mode) updates.depth_mode = body.depth_mode;
 if (body.question) updates.question = body.question;
 if (body.resolution_note) updates.resolution_note = body.resolution_note;
 const { data, error } = await supabase.from(\open_threads\)
 .update(updates)
 .eq(\id\, body.id)
 .eq(\user_id\, user.id)
 .select()
 .single();
 if (error) throw error;
 return new Response(JSON.stringify({ ok: true, thread: data }), { headers: { ...corsHeaders, \Content-Type\: \application/json\ } });
 }

 if (action === \explore\) {
 const { data: thread } = await supabase.from(\open_threads\).select(\*\).eq(\id\, body.id).eq(\user_id\, user.id).single();
 if (!thread) return new Response(JSON.stringify({ error: \not found\ }), { status: 404, headers: { ...corsHeaders, \Content-Type\: \application/json\ } });
 const { data, error } = await supabase.from(\open_threads\)
 .update({ sessions_count: (thread.sessions_count || 0) + 1, last_explored_at: new Date().toISOString(), updated_at: new Date().toISOString() })
 .eq(\id\, body.id)
 .eq(\user_id\, user.id)
 .select()
 .single();
 if (error) throw error;
 return new Response(JSON.stringify({ ok: true, thread: data }), { headers: { ...corsHeaders, \Content-Type\: \application/json\ } });
 }

 return new Response(JSON.stringify({ error: \unknown action\ }), { status: 400, headers: { ...corsHeaders, \Content-Type\: \application/json\ } });
 } catch (e: any) {
 console.error(\manage-thread error\, e);
 return new Response(JSON.stringify({ error: e?.message ?? \unknown\ }), { status: 500, headers: { ...corsHeaders, \Content-Type\: \application/json\ } });
 }
});

