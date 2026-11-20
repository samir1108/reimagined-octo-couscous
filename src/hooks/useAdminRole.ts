import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useAdminRole() {
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['admin-role'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) return false;
      return !!data;
    },
    staleTime: 1000 * 60 * 10,
  });

  return { isAdmin: !!isAdmin, isLoading };
}
