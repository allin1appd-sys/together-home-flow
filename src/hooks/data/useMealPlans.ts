import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MealPlan } from '@/types';
import { useEffect } from 'react';
import { addDays, format, subDays } from 'date-fns';
import { toast } from '@/hooks/use-toast';

function mapRow(r: any): MealPlan {
  return { id: r.id, date: r.date, mealType: r.meal_type, recipeId: r.recipe_id || undefined, customMealName: r.custom_meal_name || undefined };
}

const onMutationError = (error: Error) => {
  toast({ title: 'Error', description: error.message, variant: 'destructive' });
};

export function useMealPlans() {
  const { householdId } = useAuth();
  const qc = useQueryClient();
  const key = ['meal_plans', householdId];

  const { data: mealPlans = [], isLoading } = useQuery({
    queryKey: key, enabled: !!householdId,
    queryFn: async () => {
      const { data } = await supabase.from('meal_plans').select('*').eq('household_id', householdId!);
      return (data || []).map(mapRow);
    },
  });

  useEffect(() => {
    if (!householdId) return;
    const ch = supabase.channel('meals-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meal_plans' }, () => qc.invalidateQueries({ queryKey: key }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [householdId]);

  const addMealPlan = useMutation({
    mutationFn: async (plan: MealPlan) => {
      await supabase.from('meal_plans').insert({
        household_id: householdId!, date: plan.date, meal_type: plan.mealType,
        recipe_id: plan.recipeId || null, custom_meal_name: plan.customMealName || null,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    onError: onMutationError,
  });

  const removeMealPlan = useMutation({
    mutationFn: async (id: string) => { await supabase.from('meal_plans').delete().eq('id', id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    onError: onMutationError,
  });

  const updateMealPlan = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MealPlan> }) => {
      const dbUpdates: any = {};
      if (updates.recipeId !== undefined) dbUpdates.recipe_id = updates.recipeId || null;
      if (updates.customMealName !== undefined) dbUpdates.custom_meal_name = updates.customMealName || null;
      if (updates.mealType !== undefined) dbUpdates.meal_type = updates.mealType;
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      await supabase.from('meal_plans').update(dbUpdates).eq('id', id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    onError: onMutationError,
  });

  const copyLastWeekMeals = useMutation({
    mutationFn: async (currentWeekStart: string) => {
      const start = new Date(currentWeekStart + 'T12:00');
      const prevStart = subDays(start, 7);
      const lastWeekMeals = mealPlans.filter(m => {
        const d = new Date(m.date + 'T12:00');
        return d >= prevStart && d < start;
      });
      const inserts = lastWeekMeals
        .map(m => {
          const newDate = format(addDays(new Date(m.date + 'T12:00'), 7), 'yyyy-MM-dd');
          const exists = mealPlans.some(e => e.date === newDate && e.mealType === m.mealType);
          if (exists) return null;
          return {
            household_id: householdId!, date: newDate, meal_type: m.mealType,
            recipe_id: m.recipeId || null, custom_meal_name: m.customMealName || null,
          };
        })
        .filter(Boolean);
      if (inserts.length > 0) await supabase.from('meal_plans').insert(inserts as any[]);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    onError: onMutationError,
  });

  return {
    mealPlans, isLoading,
    addMealPlan: (p: MealPlan) => addMealPlan.mutate(p),
    removeMealPlan: (id: string) => removeMealPlan.mutate(id),
    updateMealPlan: (id: string, updates: Partial<MealPlan>) => updateMealPlan.mutate({ id, updates }),
    copyLastWeekMeals: (ws: string) => copyLastWeekMeals.mutate(ws),
  };
}
