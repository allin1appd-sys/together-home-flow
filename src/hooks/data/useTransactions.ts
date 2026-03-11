import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Transaction } from '@/types';
import { useEffect } from 'react';

function mapRow(r: any): Transaction {
  return {
    id: r.id, description: r.description, amount: Number(r.amount),
    category: r.category, date: r.date, type: r.type,
  };
}

export function useTransactions() {
  const { householdId } = useAuth();
  const qc = useQueryClient();
  const key = ['transactions', householdId];

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: key, enabled: !!householdId,
    queryFn: async () => {
      const { data } = await supabase.from('transactions').select('*').eq('household_id', householdId!).order('date', { ascending: false });
      return (data || []).map(mapRow);
    },
  });

  useEffect(() => {
    if (!householdId) return;
    const ch = supabase.channel('transactions-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => qc.invalidateQueries({ queryKey: key }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [householdId]);

  const addTransaction = useMutation({
    mutationFn: async (t: Transaction) => {
      await supabase.from('transactions').insert({
        household_id: householdId!, description: t.description,
        amount: t.amount, category: t.category, date: t.date, type: t.type,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => { await supabase.from('transactions').delete().eq('id', id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return {
    transactions, isLoading,
    addTransaction: (t: Transaction) => addTransaction.mutate(t),
    deleteTransaction: (id: string) => deleteTransaction.mutate(id),
  };
}
