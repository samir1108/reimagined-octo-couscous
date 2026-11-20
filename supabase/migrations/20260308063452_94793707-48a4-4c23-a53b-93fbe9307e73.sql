
-- CRITICAL FIX: Attach handle_new_user trigger to auth.users
-- Without this, new signups get NO profile row and the app breaks
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Attach updated_at triggers to all tables that need them
CREATE OR REPLACE TRIGGER update_user_consciousness_profile_updated_at
  BEFORE UPDATE ON public.user_consciousness_profile
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_user_loops_updated_at
  BEFORE UPDATE ON public.user_loops
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_user_samskaras_updated_at
  BEFORE UPDATE ON public.user_samskaras
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
