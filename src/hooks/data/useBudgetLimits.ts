import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BudgetLimit } from '@/types';
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

function mapRow(r: any): BudgetLimit {
  return { category: r.category, limit: Number(r.limit_amount) };
}

const onMutationError = (error: Error) => {
  toast({ title: 'Error', description: error.message, variant: 'destructive' });
};

export function useBudgetLimits() {
  const { householdId } = useAuth();
  const qc = useQueryClient();
  const key = ['budget_limits', householdId];

  const { data: budgetLimits = [], isLoading } = useQuery({
    queryKey: key, enabled: !!householdId,
    queryFn: async () => {
      const { data } = await supabase.from('budget_limits').select('*').eq('household_id', householdId!);
      return (data || []).map(mapRow);
    },
  });

  useEffect(() => {
    if (!householdId) return;
    const ch = supabase.channel('budgetlimits-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budget_limits' }, () => qc.invalidateQueries({ queryKey: key }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [householdId]);

  const updateBudgetLimit = useMutation({
    mutationFn: async ({ category, limit }: { category: string; limit: number }) => {
      const existing = budgetLimits.find(b => b.category === category);
      if (existing) {
        await supabase.from('budget_limits').update({ limit_amount: limit }).eq('household_id', householdId!).eq('category', category);
      } else {
        await supabase.from('budget_limits').insert({ household_id: householdId!, category, limit_amount: limit });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    onError: onMutationError,
  });

  return {
    budgetLimits, isLoading,
    updateBudgetLimit: (category: string, limit: number) => updateBudgetLimit.mutate({ category, limit }),
  };
}
