import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Note } from '@/types';
import { useEffect } from 'react';

function mapRow(r: any): Note {
  return {
    id: r.id, title: r.title, body: r.body || undefined, color: r.color,
    isPinned: r.is_pinned, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export function useNotes() {
  const { householdId } = useAuth();
  const qc = useQueryClient();
  const key = ['notes', householdId];

  const { data: notes = [], isLoading } = useQuery({
    queryKey: key, enabled: !!householdId,
    queryFn: async () => {
      const { data } = await supabase.from('notes').select('*').eq('household_id', householdId!).order('updated_at', { ascending: false });
      return (data || []).map(mapRow);
    },
  });

  useEffect(() => {
    if (!householdId) return;
    const ch = supabase.channel('notes-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, () => qc.invalidateQueries({ queryKey: key }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [householdId]);

  const addNote = useMutation({
    mutationFn: async (n: Note) => {
      await supabase.from('notes').insert({
        household_id: householdId!, title: n.title, body: n.body,
        color: n.color, is_pinned: n.isPinned,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const updateNote = useMutation({
    mutationFn: async (n: Note) => {
      await supabase.from('notes').update({
        title: n.title, body: n.body, color: n.color, is_pinned: n.isPinned,
        updated_at: new Date().toISOString(),
      }).eq('id', n.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => { await supabase.from('notes').delete().eq('id', id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const toggleNotePin = useMutation({
    mutationFn: async (id: string) => {
      const n = notes.find(x => x.id === id);
      if (!n) return;
      await supabase.from('notes').update({ is_pinned: !n.isPinned, updated_at: new Date().toISOString() }).eq('id', id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return {
    notes, isLoading,
    addNote: (n: Note) => addNote.mutate(n),
    updateNote: (n: Note) => updateNote.mutate(n),
    deleteNote: (id: string) => deleteNote.mutate(id),
    toggleNotePin: (id: string) => toggleNotePin.mutate(id),
  };
}
