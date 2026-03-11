import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Task, SubTask } from '@/types';
import { useEffect } from 'react';

function mapTask(row: any, subTasks: any[]): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    dueDate: row.due_date ? row.due_date.split('T')[0] : undefined,
    priority: row.priority,
    category: row.category,
    assignedTo: row.assigned_to || undefined,
    isCompleted: row.is_completed,
    completedAt: row.completed_at || undefined,
    isRecurring: row.is_recurring,
    recurrenceRule: row.recurrence_rule || undefined,
    subTasks: subTasks.filter(st => st.task_id === row.id).map(st => ({
      id: st.id, title: st.title, isCompleted: st.is_completed,
    })),
    createdAt: row.created_at,
  };
}

export function useTasks() {
  const { householdId } = useAuth();
  const qc = useQueryClient();
  const key = ['tasks', householdId];

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: key,
    enabled: !!householdId,
    queryFn: async () => {
      const [{ data: rows }, { data: subs }] = await Promise.all([
        supabase.from('tasks').select('*').eq('household_id', householdId!).order('created_at', { ascending: false }),
        supabase.from('sub_tasks').select('*'),
      ]);
      return (rows || []).map(r => mapTask(r, subs || []));
    },
  });

  // Realtime
  useEffect(() => {
    if (!householdId) return;
    const channel = supabase.channel('tasks-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => qc.invalidateQueries({ queryKey: key }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sub_tasks' }, () => qc.invalidateQueries({ queryKey: key }))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [householdId]);

  const addTask = useMutation({
    mutationFn: async (task: Task) => {
      const { data, error } = await supabase.from('tasks').insert({
        household_id: householdId!, title: task.title, description: task.description,
        priority: task.priority, category: task.category, due_date: task.dueDate,
        assigned_to: task.assignedTo, is_completed: false, is_recurring: task.isRecurring,
        recurrence_rule: task.recurrenceRule,
      }).select().single();
      if (error) throw error;
      if (task.subTasks.length > 0) {
        await supabase.from('sub_tasks').insert(
          task.subTasks.map(st => ({ task_id: data.id, title: st.title, is_completed: st.isCompleted }))
        );
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const toggleTask = useMutation({
    mutationFn: async (id: string) => {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      await supabase.from('tasks').update({
        is_completed: !task.isCompleted,
        completed_at: !task.isCompleted ? new Date().toISOString() : null,
      }).eq('id', id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('sub_tasks').delete().eq('task_id', id);
      await supabase.from('tasks').delete().eq('id', id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const updateTask = useMutation({
    mutationFn: async (task: Task) => {
      await supabase.from('tasks').update({
        title: task.title, description: task.description, priority: task.priority,
        category: task.category, due_date: task.dueDate, assigned_to: task.assignedTo,
        is_recurring: task.isRecurring, recurrence_rule: task.recurrenceRule,
      }).eq('id', task.id);
      // Replace sub_tasks
      await supabase.from('sub_tasks').delete().eq('task_id', task.id);
      if (task.subTasks.length > 0) {
        await supabase.from('sub_tasks').insert(
          task.subTasks.map(st => ({ task_id: task.id, title: st.title, is_completed: st.isCompleted }))
        );
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const toggleSubTask = useMutation({
    mutationFn: async ({ taskId, subTaskId }: { taskId: string; subTaskId: string }) => {
      const task = tasks.find(t => t.id === taskId);
      const st = task?.subTasks.find(s => s.id === subTaskId);
      if (!st) return;
      await supabase.from('sub_tasks').update({ is_completed: !st.isCompleted }).eq('id', subTaskId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return {
    tasks, isLoading,
    addTask: (t: Task) => addTask.mutate(t),
    toggleTask: (id: string) => toggleTask.mutate(id),
    deleteTask: (id: string) => deleteTask.mutate(id),
    updateTask: (t: Task) => updateTask.mutate(t),
    toggleSubTask: (taskId: string, subTaskId: string) => toggleSubTask.mutate({ taskId, subTaskId }),
  };
}
