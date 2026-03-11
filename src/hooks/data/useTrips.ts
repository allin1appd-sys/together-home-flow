import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Trip } from '@/types';
import { useEffect } from 'react';

function mapRow(r: any, packingItems: any[]): Trip {
  return {
    id: r.id, title: r.title, destination: r.destination,
    startDate: r.start_date, endDate: r.end_date,
    description: r.description || undefined, category: r.category,
    status: r.status, itinerary: Array.isArray(r.itinerary) ? r.itinerary : [],
    packingList: packingItems.filter(p => p.trip_id === r.id).map(p => ({
      id: p.id, name: p.name, isPacked: p.is_packed,
    })),
  };
}

export function useTrips() {
  const { householdId } = useAuth();
  const qc = useQueryClient();
  const key = ['trips', householdId];

  const { data: trips = [], isLoading } = useQuery({
    queryKey: key, enabled: !!householdId,
    queryFn: async () => {
      const [{ data: rows }, { data: packing }] = await Promise.all([
        supabase.from('trips').select('*').eq('household_id', householdId!).order('start_date'),
        supabase.from('trip_packing_items').select('*'),
      ]);
      return (rows || []).map(r => mapRow(r, packing || []));
    },
  });

  useEffect(() => {
    if (!householdId) return;
    const ch = supabase.channel('trips-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, () => qc.invalidateQueries({ queryKey: key }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_packing_items' }, () => qc.invalidateQueries({ queryKey: key }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [householdId]);

  const addTrip = useMutation({
    mutationFn: async (trip: Trip) => {
      const { data, error } = await supabase.from('trips').insert({
        household_id: householdId!, title: trip.title, destination: trip.destination,
        start_date: trip.startDate, end_date: trip.endDate, description: trip.description,
        category: trip.category, status: trip.status, itinerary: trip.itinerary as any,
      }).select().single();
      if (error) throw error;
      if (trip.packingList.length > 0) {
        await supabase.from('trip_packing_items').insert(
          trip.packingList.map(p => ({ trip_id: data.id, name: p.name, is_packed: p.isPacked }))
        );
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const updateTrip = useMutation({
    mutationFn: async (trip: Trip) => {
      await supabase.from('trips').update({
        title: trip.title, destination: trip.destination, start_date: trip.startDate,
        end_date: trip.endDate, description: trip.description, category: trip.category,
        status: trip.status, itinerary: trip.itinerary as any,
      }).eq('id', trip.id);
      await supabase.from('trip_packing_items').delete().eq('trip_id', trip.id);
      if (trip.packingList.length > 0) {
        await supabase.from('trip_packing_items').insert(
          trip.packingList.map(p => ({ trip_id: trip.id, name: p.name, is_packed: p.isPacked }))
        );
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const deleteTrip = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('trip_packing_items').delete().eq('trip_id', id);
      await supabase.from('trips').delete().eq('id', id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return {
    trips, isLoading,
    addTrip: (t: Trip) => addTrip.mutate(t),
    updateTrip: (t: Trip) => updateTrip.mutate(t),
    deleteTrip: (id: string) => deleteTrip.mutate(id),
  };
}
