import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export function useHousehold() {
  const { user, householdId } = useAuth();
  const queryClient = useQueryClient();

  const createHousehold = async (householdName: string = 'My Home') => {
    if (!user) throw new Error('Not authenticated');

    console.log('[useHousehold] calling RPC create_household_for_user, user:', user.id);
    const { data, error } = await supabase.rpc('create_household_for_user', { _name: householdName });
    console.log('[useHousehold] RPC result:', { data, error });
    if (error) throw error;

    // Force re-fetch of householdId in AuthProvider
    queryClient.invalidateQueries();
    
    return data;
  };

  const updateProfile = async (displayName: string) => {
    if (!user) throw new Error('Not authenticated');
    await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('user_id', user.id);
  };

  return { householdId, createHousehold, updateProfile };
}
