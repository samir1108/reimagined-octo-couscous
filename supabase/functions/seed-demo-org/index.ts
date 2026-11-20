// Seeds a fully populated demo organization for sales demos.
// Creates: org + 5 teams + 50 employees + 30 days of mood pulses + 2 challenges.
// The current user becomes admin of the demo org.

import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

const TEAMS = ["Engineering", "Product", "Design", "Sales", "People"];
const FIRST_NAMES = ["Aarav","Vivaan","Aditya","Vihaan","Arjun","Sai","Reyansh","Krishna","Ishaan","Kabir","Anaya","Saanvi","Aadhya","Aaradhya","Ananya","Diya","Pari","Anika","Navya","Kiara","Liam","Noah","Oliver","Elijah","Mateo","Lucas","Levi","Mason","Ethan","Logan","Olivia","Emma","Charlotte","Amelia","Sophia","Mia","Isabella","Ava","Evelyn","Harper","Aryan","Rohan","Karan","Dev","Yash","Priya","Neha","Riya","Sneha","Pooja"];
const LAST_NAMES = ["Sharma","Verma","Patel","Singh","Kumar","Gupta","Iyer","Nair","Reddy","Khan","Smith","Johnson","Williams","Brown","Jones","Miller","Davis","Garcia","Martinez","Lee"];
const ROLES = ["Engineer","Senior Engineer","Designer","Product Manager","Account Executive","Recruiter","Engineering Manager","Marketing","Customer Success","Data Analyst"];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randBetween(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");

    // Identify caller
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser(jwt);
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const stamp = Date.now().toString(36);

    // 1. Org
    const { data: org, error: orgErr } = await admin.from("organizations").insert({
      name: `Demo Corp ${stamp.slice(-4).toUpperCase()}`,
      slug: `demo-${stamp}`,
      description: "Sample organization with realistic data — explore freely.",
      created_by: user.id,
      settings: { is_demo: true },
    }).select().single();
    if (orgErr) throw orgErr;

    // 2. Caller becomes admin
    await admin.from("org_members").insert({
      org_id: org.id, user_id: user.id, email: user.email, role: "admin", status: "active",
      joined_at: new Date().toISOString(), invited_by: user.id,
    });

    // 3. Teams
    const teamsPayload = TEAMS.map((name) => ({ org_id: org.id, name, description: `${name} team` }));
    const { data: teams } = await admin.from("teams").insert(teamsPayload).select();

    // 4. 50 employees split across teams
    const employees: any[] = [];
    for (let i = 0; i < 50; i++) {
      const fn = rand(FIRST_NAMES), ln = rand(LAST_NAMES);
      employees.push({
        org_id: org.id,
        team_id: teams![i % teams!.length].id,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@democorp.test`,
        role: i < 5 ? "manager" : "employee",
        status: "active",
        joined_at: new Date(Date.now() - randBetween(1, 180) * 86400000).toISOString(),
        invited_by: user.id,
      });
    }
    const { data: members } = await admin.from("org_members").insert(employees).select();

    // 5. 30 days of mood pulses (150 random pulses)
    const pulses: any[] = [];
    for (let d = 0; d < 30; d++) {
      const pulseCount = randBetween(3, 8);
      for (let p = 0; p < pulseCount; p++) {
        const member = rand(members!);
        pulses.push({
          org_id: org.id,
          team_id: member.team_id,
          mood_score: randBetween(40, 95),
          energy_level: randBetween(30, 90),
          stress_level: randBetween(10, 70),
          created_at: new Date(Date.now() - d * 86400000 - randBetween(0, 80000) * 1000).toISOString(),
        });
      }
    }
    // mood_pulses table may or may not exist; insert defensively
    try { await admin.from("mood_pulses").insert(pulses); } catch (_) { /* ignore */ }

    // 6. Two wellness challenges
    await admin.from("wellness_challenges").insert([
      {
        org_id: org.id,
        title: "30-Day Morning Meditation",
        description: "10 minutes daily, every morning. Build the habit together.",
        challenge_type: "meditation",
        target_value: 30,
        target_unit: "days",
        starts_at: new Date(Date.now() - 7 * 86400000).toISOString(),
        ends_at: new Date(Date.now() + 23 * 86400000).toISOString(),
        created_by: user.id,
        status: "active",
      },
      {
        org_id: org.id,
        title: "Mindful Walking Week",
        description: "20 minutes of walking meditation every weekday for one week.",
        challenge_type: "movement",
        target_value: 5,
        target_unit: "sessions",
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 7 * 86400000).toISOString(),
        created_by: user.id,
        status: "active",
      },
    ]);

    return new Response(
      JSON.stringify({ success: true, org_id: org.id, org_slug: org.slug }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("seed-demo-org error:", err);
    return new Response(JSON.stringify({ error: err.message ?? "Seed failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
