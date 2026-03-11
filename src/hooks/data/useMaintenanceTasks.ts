import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MaintenanceTask } from '@/types';
import { useEffect } from 'react';
import { addDays, format } from 'date-fns';

function mapRow(r: any): MaintenanceTask {
  return {
    id: r.id, title: r.title, frequencyDays: r.frequency_days,
    lastCompleted: r.last_completed ? String(r.last_completed).split('T')[0] : undefined,
    nextDue: r.next_due, assignedTo: r.assigned_to || undefined,
    notes: r.notes || undefined, createdAt: r.created_at,
  };
}

export function useMaintenanceTasks() {
  const { householdId } = useAuth();
  const qc = useQueryClient();
  const key = ['maintenance_tasks', householdId];

  const { data: maintenanceTasks = [], isLoading } = useQuery({
    queryKey: key, enabled: !!householdId,
    queryFn: async () => {
      const { data } = await supabase.from('maintenance_tasks').select('*').eq('household_id', householdId!).order('next_due');
      return (data || []).map(mapRow);
    },
  });

  useEffect(() => {
    if (!householdId) return;
    const ch = supabase.channel('maintenance-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_tasks' }, () => qc.invalidateQueries({ queryKey: key }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [householdId]);

  const addMaintenanceTask = useMutation({
    mutationFn: async (t: MaintenanceTask) => {
      await supabase.from('maintenance_tasks').insert({
        household_id: householdId!, title: t.title, frequency_days: t.frequencyDays,
        next_due: t.nextDue, assigned_to: t.assignedTo, notes: t.notes,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const updateMaintenanceTask = useMutation({
    mutationFn: async (t: MaintenanceTask) => {
      await supabase.from('maintenance_tasks').update({
        title: t.title, frequency_days: t.frequencyDays,
        assigned_to: t.assignedTo, notes: t.notes,
      }).eq('id', t.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const deleteMaintenanceTask = useMutation({
    mutationFn: async (id: string) => { await supabase.from('maintenance_tasks').delete().eq('id', id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const completeMaintenanceTask = useMutation({
    mutationFn: async (id: string) => {
      const t = maintenanceTasks.find(x => x.id === id);
      if (!t) return;
      const now = new Date();
      await supabase.from('maintenance_tasks').update({
        last_completed: now.toISOString(),
        next_due: format(addDays(now, t.frequencyDays), 'yyyy-MM-dd'),
      }).eq('id', id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return {
    maintenanceTasks, isLoading,
    addMaintenanceTask: (t: MaintenanceTask) => addMaintenanceTask.mutate(t),
    updateMaintenanceTask: (t: MaintenanceTask) => updateMaintenanceTask.mutate(t),
    deleteMaintenanceTask: (id: string) => deleteMaintenanceTask.mutate(id),
    completeMaintenanceTask: (id: string) => completeMaintenanceTask.mutate(id),
  };
}
