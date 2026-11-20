/**
 * TEMPORARY: check whether the tables the learning loop needs actually exist
 * in the remote database.
 */
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);

const url = env.VITE_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }

for (const table of ["session_ingredients", "sessions", "daily_sessions", "session_spine", "user_consciousness_profile", "daily_themes"]) {
  try {
    const r = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    const body = await r.text();
    console.log(`${table.padEnd(28)} ${r.status} ${body.slice(0, 120).replace(/\s+/g, " ")}`);
  } catch (e) {
    console.log(`${table.padEnd(28)} ERROR ${String(e).slice(0, 100)}`);
  }
}
