import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Recipe } from '@/types';
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

function mapRow(r: any, ingredients: any[]): Recipe {
  return {
    id: r.id, name: r.name, instructions: r.instructions, prepTime: r.prep_time,
    cookTime: r.cook_time, servings: r.servings, tags: r.tags || [],
    ingredients: ingredients.filter(i => i.recipe_id === r.id).map(i => ({
      id: i.id, name: i.name, quantity: i.quantity, unit: i.unit || undefined,
    })),
  };
}

const onMutationError = (error: Error) => {
  toast({ title: 'Error', description: error.message, variant: 'destructive' });
};

export function useRecipes() {
  const { householdId } = useAuth();
  const qc = useQueryClient();
  const key = ['recipes', householdId];

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: key, enabled: !!householdId,
    queryFn: async () => {
      const [{ data: rows }, { data: ings }] = await Promise.all([
        supabase.from('recipes').select('*').eq('household_id', householdId!),
        supabase.from('recipe_ingredients').select('*'),
      ]);
      return (rows || []).map(r => mapRow(r, ings || []));
    },
  });

  useEffect(() => {
    if (!householdId) return;
    const ch = supabase.channel('recipes-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recipes' }, () => qc.invalidateQueries({ queryKey: key }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [householdId]);

  const addRecipe = useMutation({
    mutationFn: async (recipe: Recipe) => {
      const { data, error } = await supabase.from('recipes').insert({
        household_id: householdId!, name: recipe.name, instructions: recipe.instructions,
        prep_time: recipe.prepTime, cook_time: recipe.cookTime, servings: recipe.servings,
        tags: recipe.tags,
      }).select().single();
      if (error) throw error;
      if (recipe.ingredients.length > 0) {
        await supabase.from('recipe_ingredients').insert(
          recipe.ingredients.map(i => ({ recipe_id: data.id, name: i.name, quantity: i.quantity, unit: i.unit }))
        );
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    onError: onMutationError,
  });

  const removeRecipe = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('recipe_ingredients').delete().eq('recipe_id', id);
      await supabase.from('recipes').delete().eq('id', id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    onError: onMutationError,
  });

  return {
    recipes, isLoading,
    addRecipe: (r: Recipe) => addRecipe.mutate(r),
    removeRecipe: (id: string) => removeRecipe.mutate(id),
  };
}
