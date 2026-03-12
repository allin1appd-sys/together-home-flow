import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FamilyMember } from '@/types';
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

function mapRow(r: any): FamilyMember {
  return { id: r.id, name: r.name, color: r.color };
}

const onMutationError = (error: Error) => {
  toast({ title: 'Error', description: error.message, variant: 'destructive' });
};

export function useFamilyMembers() {
  const { householdId } = useAuth();
  const qc = useQueryClient();
  const key = ['family_members', householdId];

  const { data: familyMembers = [], isLoading } = useQuery({
    queryKey: key, enabled: !!householdId,
    queryFn: async () => {
      const { data } = await supabase.from('family_members').select('*').eq('household_id', householdId!).order('created_at');
      return (data || []).map(mapRow);
    },
  });

  useEffect(() => {
    if (!householdId) return;
    const ch = supabase.channel('family-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'family_members' }, () => qc.invalidateQueries({ queryKey: key }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [householdId]);

  const addFamilyMember = useMutation({
    mutationFn: async (m: FamilyMember) => {
      await supabase.from('family_members').insert({
        household_id: householdId!, name: m.name, color: m.color,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    onError: onMutationError,
  });

  const removeFamilyMember = useMutation({
    mutationFn: async (id: string) => { await supabase.from('family_members').delete().eq('id', id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    onError: onMutationError,
  });

  return {
    familyMembers, isLoading,
    addFamilyMember: (m: FamilyMember) => addFamilyMember.mutate(m),
    removeFamilyMember: (id: string) => removeFamilyMember.mutate(id),
  };
}
