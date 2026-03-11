import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface NotificationPreferences {
  remindersEnabled: boolean;
  tasksEnabled: boolean;
  groceriesEnabled: boolean;
}

const defaults: NotificationPreferences = {
  remindersEnabled: true,
  tasksEnabled: true,
  groceriesEnabled: true,
};

export const useNotificationPreferences = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ['notification_preferences', user?.id];

  const { data: preferences = defaults, isLoading } = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('notification_preferences' as any)
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (!data) return defaults;
      return {
        remindersEnabled: (data as any).reminders_enabled,
        tasksEnabled: (data as any).tasks_enabled,
        groceriesEnabled: (data as any).groceries_enabled,
      } as NotificationPreferences;
    },
  });

  const updatePreference = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      const dbUpdates: Record<string, any> = {};
      if (updates.remindersEnabled !== undefined) dbUpdates.reminders_enabled = updates.remindersEnabled;
      if (updates.tasksEnabled !== undefined) dbUpdates.tasks_enabled = updates.tasksEnabled;
      if (updates.groceriesEnabled !== undefined) dbUpdates.groceries_enabled = updates.groceriesEnabled;

      await supabase.from('notification_preferences' as any).upsert(
        { user_id: user!.id, ...dbUpdates },
        { onConflict: 'user_id' }
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return {
    preferences,
    isLoading,
    updatePreference: (updates: Partial<NotificationPreferences>) => updatePreference.mutate(updates),
  };
};
