import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Reminder } from '@/types';
import { useEffect } from 'react';

function mapRow(r: any): Reminder {
  return {
    id: r.id, title: r.title, description: r.description || undefined,
    dueDate: typeof r.due_date === 'string' ? r.due_date.split('T')[0] : r.due_date,
    isChecked: r.is_checked, category: r.category, leadDays: r.lead_days,
    repeat: r.repeat, snoozedUntil: r.snoozed_until || undefined, createdAt: r.created_at,
  };
}

export function useReminders() {
  const { householdId } = useAuth();
  const qc = useQueryClient();
  const key = ['reminders', householdId];

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: key, enabled: !!householdId,
    queryFn: async () => {
      const { data } = await supabase.from('reminders').select('*').eq('household_id', householdId!).order('due_date');
      return (data || []).map(mapRow);
    },
  });

  useEffect(() => {
    if (!householdId) return;
    const ch = supabase.channel('reminders-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reminders' }, () => qc.invalidateQueries({ queryKey: key }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [householdId]);

  const addReminder = useMutation({
    mutationFn: async (r: Reminder) => {
      await supabase.from('reminders').insert({
        household_id: householdId!, title: r.title, description: r.description,
        due_date: r.dueDate, is_checked: false, category: r.category,
        lead_days: r.leadDays, repeat: r.repeat,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const updateReminder = useMutation({
    mutationFn: async (r: Reminder) => {
      await supabase.from('reminders').update({
        title: r.title, description: r.description, due_date: r.dueDate,
        is_checked: r.isChecked, category: r.category, lead_days: r.leadDays, repeat: r.repeat,
      }).eq('id', r.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const deleteReminder = useMutation({
    mutationFn: async (id: string) => { await supabase.from('reminders').delete().eq('id', id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const toggleReminder = useMutation({
    mutationFn: async (id: string) => {
      const r = reminders.find(x => x.id === id);
      if (!r) return;
      await supabase.from('reminders').update({ is_checked: !r.isChecked }).eq('id', id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const snoozeReminder = useMutation({
    mutationFn: async ({ id, until }: { id: string; until: string }) => {
      await supabase.from('reminders').update({ snoozed_until: until }).eq('id', id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return {
    reminders, isLoading,
    addReminder: (r: Reminder) => addReminder.mutate(r),
    updateReminder: (r: Reminder) => updateReminder.mutate(r),
    deleteReminder: (id: string) => deleteReminder.mutate(id),
    toggleReminder: (id: string) => toggleReminder.mutate(id),
    snoozeReminder: (id: string, until: string) => snoozeReminder.mutate({ id, until }),
  };
}
