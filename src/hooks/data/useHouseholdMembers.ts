import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface HouseholdMember {
  id: string;
  userId: string;
  role: string;
  displayName: string;
  avatarColor: string;
  joinedAt: string;
}

export function useHouseholdMembers() {
  const { user, householdId } = useAuth();
  const qc = useQueryClient();
  const key = ['household_members', householdId];

  const { data: members = [], isLoading } = useQuery({
    queryKey: key,
    enabled: !!householdId,
    queryFn: async () => {
      const { data: memberRows } = await supabase
        .from('household_members')
        .select('*')
        .eq('household_id', householdId!);
      if (!memberRows) return [];

      const userIds = memberRows.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      return memberRows.map(m => {
        const profile = profiles?.find(p => p.user_id === m.user_id);
        return {
          id: m.id,
          userId: m.user_id,
          role: m.role,
          displayName: profile?.display_name || 'Unknown',
          avatarColor: profile?.avatar_color || '#6366f1',
          joinedAt: m.joined_at,
        } as HouseholdMember;
      });
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase.from('household_members').delete().eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const { data: household } = useQuery({
    queryKey: ['household_info', householdId],
    enabled: !!householdId,
    queryFn: async () => {
      const { data } = await supabase.from('households').select('*').eq('id', householdId!).single();
      return data;
    },
  });

  const updateHouseholdName = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from('households').update({ name }).eq('id', householdId!);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['household_info', householdId] }),
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const isOwner = household?.created_by === user?.id;

  return {
    members,
    isLoading,
    household,
    isOwner,
    removeMember: (id: string) => removeMember.mutate(id),
    updateHouseholdName: (name: string) => updateHouseholdName.mutate(name),
  };
}
