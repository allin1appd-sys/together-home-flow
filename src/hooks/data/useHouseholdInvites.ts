import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function useHouseholdInvites() {
  const { householdId, user } = useAuth();
  const qc = useQueryClient();
  const key = ['household_invites', householdId];

  const { data: invites = [], isLoading } = useQuery({
    queryKey: key,
    enabled: !!householdId,
    queryFn: async () => {
      const { data } = await supabase
        .from('household_invites')
        .select('*')
        .eq('household_id', householdId!)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const createInvite = useMutation({
    mutationFn: async () => {
      if (!householdId || !user) throw new Error('Not in a household');
      const code = generateCode();
      const { error } = await supabase.from('household_invites').insert({
        household_id: householdId,
        code,
        created_by: user.id,
      });
      if (error) throw error;
      return code;
    },
    onSuccess: (code) => {
      qc.invalidateQueries({ queryKey: key });
      toast.success(`Invite code: ${code}`);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteInvite = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('household_invites').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return {
    invites,
    isLoading,
    createInvite: () => createInvite.mutateAsync(),
    deleteInvite: (id: string) => deleteInvite.mutate(id),
    isCreating: createInvite.isPending,
  };
}
