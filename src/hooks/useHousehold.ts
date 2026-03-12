import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export function useHousehold() {
  const { user, householdId } = useAuth();
  const queryClient = useQueryClient();

  const createHousehold = async (householdName: string = 'My Home') => {
    if (!user) throw new Error('Not authenticated');

    const { data: household, error: hErr } = await supabase
      .from('households')
      .insert({ name: householdName, created_by: user.id })
      .select()
      .single();

    if (hErr) throw hErr;

    const { error: mErr } = await supabase
      .from('household_members')
      .insert({ household_id: household.id, user_id: user.id, role: 'owner' });

    if (mErr) throw mErr;

    // Force re-fetch of householdId in AuthProvider
    queryClient.invalidateQueries();
    
    return household.id;
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
