import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GroceryItem } from '@/types';
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

function mapRow(r: any): GroceryItem {
  return {
    id: r.id, name: r.name, quantity: r.quantity, unit: r.unit || undefined,
    category: r.category, storageLocation: r.storage_location,
    purchaseDate: r.purchase_date, expirationDate: r.expiration_date || undefined,
    status: r.status,
  };
}

const onMutationError = (error: Error) => {
  toast({ title: 'Error', description: error.message, variant: 'destructive' });
};

export function useGroceries() {
  const { householdId } = useAuth();
  const qc = useQueryClient();
  const key = ['groceries', householdId];

  const { data: groceries = [], isLoading } = useQuery({
    queryKey: key, enabled: !!householdId,
    queryFn: async () => {
      const { data } = await supabase.from('groceries').select('*').eq('household_id', householdId!).order('created_at', { ascending: false });
      return (data || []).map(mapRow);
    },
  });

  useEffect(() => {
    if (!householdId) return;
    const ch = supabase.channel('groceries-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groceries' }, () => qc.invalidateQueries({ queryKey: key }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [householdId]);

  const addGrocery = useMutation({
    mutationFn: async (item: GroceryItem) => {
      await supabase.from('groceries').insert({
        household_id: householdId!, name: item.name, quantity: item.quantity,
        unit: item.unit, category: item.category, storage_location: item.storageLocation,
        purchase_date: item.purchaseDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        expiration_date: item.expirationDate?.split('T')[0] || null, status: item.status,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    onError: onMutationError,
  });

  const updateGrocery = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<GroceryItem> }) => {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
      if (updates.unit !== undefined) dbUpdates.unit = updates.unit || null;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.storageLocation !== undefined) dbUpdates.storage_location = updates.storageLocation;
      if (updates.expirationDate !== undefined) dbUpdates.expiration_date = updates.expirationDate || null;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      await supabase.from('groceries').update(dbUpdates).eq('id', id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    onError: onMutationError,
  });

  const removeGrocery = useMutation({
    mutationFn: async (id: string) => { await supabase.from('groceries').delete().eq('id', id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    onError: onMutationError,
  });

  const decrementGrocery = useMutation({
    mutationFn: async (id: string) => {
      const item = groceries.find(g => g.id === id);
      if (!item) return;
      if (item.quantity <= 1) {
        await supabase.from('groceries').delete().eq('id', id);
      } else {
        await supabase.from('groceries').update({ quantity: item.quantity - 1 }).eq('id', id);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    onError: onMutationError,
  });

  return {
    groceries, isLoading,
    addGrocery: (i: GroceryItem) => addGrocery.mutate(i),
    updateGrocery: (id: string, updates: Partial<GroceryItem>) => updateGrocery.mutate({ id, updates }),
    removeGrocery: (id: string) => removeGrocery.mutate(id),
    decrementGrocery: (id: string) => decrementGrocery.mutate(id),
  };
}
