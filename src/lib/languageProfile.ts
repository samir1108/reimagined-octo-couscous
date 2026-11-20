// Persist the selected app language to the signed-in user's profile.
// The preference is stored inside profiles.bio as JSON, which is the same
// location useUserLanguage, LanguagePicker and the AI edge functions read.

import { supabase } from "@/lib/supabase";

export async function persistLanguageToProfile(code: string, userId?: string): Promise<void> {
  try {
    let uid = userId;
    if (!uid) {
      const { data: { user } } = await supabase.auth.getUser();
      uid = user?.id;
    }
    if (!uid) return;

    const { data } = await supabase
      .from("profiles")
      .select("bio")
      .eq("user_id", uid)
      .maybeSingle();

    let prefs: Record<string, unknown> = {};
    if (data?.bio) {
      try {
        const parsed = JSON.parse(data.bio);
        prefs = parsed && typeof parsed === "object" ? parsed : { text: data.bio };
      } catch {
        prefs = { text: data.bio };
      }
    }
    prefs.language = code;

    await supabase
      .from("profiles")
      .update({ bio: JSON.stringify(prefs) })
      .eq("user_id", uid);
  } catch (e) {
    // Language persistence must never block the UI or first-run flow.
    console.warn("persistLanguageToProfile failed", e);
  }
}
