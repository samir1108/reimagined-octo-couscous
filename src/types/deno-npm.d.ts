// Deno edge functions import Supabase via the npm: specifier. The client
// TypeScript build resolves the same package from node_modules, so declare the
// specifier as an alias to keep shared edge modules type-checkable.
declare module "npm:@supabase/supabase-js@2" {
  export * from "@supabase/supabase-js";
}
