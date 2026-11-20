// Re-export of the canonical Deno shared engine so client code runs the
// same implementation the edge functions use (no more no-op stubs).
export * from "../../../supabase/functions/_shared/loopMap";
