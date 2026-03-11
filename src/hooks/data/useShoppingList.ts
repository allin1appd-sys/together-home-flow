import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingListItem } from '@/types';
import { useEffect } from 'react';

function mapRow(r: any): ShoppingListItem {
  return {
    id: r.id, name: r.name, quantity: r.quantity, category: r.category,
    isPurchased: r.is_purchased, estimatedPrice: r.estimated_price ? Number(r.estimated_price) : undefined,
    note: r.note || undefined,
  };
}

export function useShoppingList() {
  const { householdId } = useAuth();
  const qc = useQueryClient();
  const key = ['shopping_list', householdId];

  const { data: shoppingList = [], isLoading } = useQuery({
    queryKey: key, enabled: !!householdId,
    queryFn: async () => {
      const { data } = await supabase.from('shopping_list').select('*').eq('household_id', householdId!).order('created_at', { ascending: false });
      return (data || []).map(mapRow);
    },
  });

  useEffect(() => {
    if (!householdId) return;
    const ch = supabase.channel('shopping-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_list' }, () => qc.invalidateQueries({ queryKey: key }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [householdId]);

  const addShoppingItem = useMutation({
    mutationFn: async (item: ShoppingListItem) => {
      await supabase.from('shopping_list').insert({
        household_id: householdId!, name: item.name, quantity: item.quantity,
        category: item.category, is_purchased: false,
        estimated_price: item.estimatedPrice ?? null, note: item.note ?? null,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const toggleShoppingItem = useMutation({
    mutationFn: async (id: string) => {
      const item = shoppingList.find(i => i.id === id);
      if (!item) return;
      await supabase.from('shopping_list').update({ is_purchased: !item.isPurchased }).eq('id', id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const removeShoppingItem = useMutation({
    mutationFn: async (id: string) => { await supabase.from('shopping_list').delete().eq('id', id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const updateShoppingItem = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ShoppingListItem> }) => {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.estimatedPrice !== undefined) dbUpdates.estimated_price = updates.estimatedPrice ?? null;
      if (updates.note !== undefined) dbUpdates.note = updates.note ?? null;
      await supabase.from('shopping_list').update(dbUpdates).eq('id', id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const clearCompletedShopping = useMutation({
    mutationFn: async () => {
      await supabase.from('shopping_list').delete().eq('household_id', householdId!).eq('is_purchased', true);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const suggestToShoppingList = useMutation({
    mutationFn: async (grocery: { name: string; quantity: number; category: string }) => {
      const exists = shoppingList.some(i => i.name.toLowerCase() === grocery.name.toLowerCase());
      if (exists) return;
      await supabase.from('shopping_list').insert({
        household_id: householdId!, name: grocery.name, quantity: grocery.quantity,
        category: grocery.category, is_purchased: false,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return {
    shoppingList, isLoading,
    addShoppingItem: (i: ShoppingListItem) => addShoppingItem.mutate(i),
    toggleShoppingItem: (id: string) => toggleShoppingItem.mutate(id),
    removeShoppingItem: (id: string) => removeShoppingItem.mutate(id),
    updateShoppingItem: (id: string, updates: Partial<ShoppingListItem>) => updateShoppingItem.mutate({ id, updates }),
    clearCompletedShopping: () => clearCompletedShopping.mutate(),
    suggestToShoppingList: (grocery: { name: string; quantity: number; category: string }) => suggestToShoppingList.mutate(grocery),
  };
}
