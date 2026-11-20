import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as typedSupabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const supabase = typedSupabase as SupabaseClient<Database, "public", any>;
