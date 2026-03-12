import { useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';

const SYNC_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

export const useLocalNotifications = () => {
  const { user, householdId } = useAuth();
  const { preferences } = useNotificationPreferences();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scheduleNotifications = useCallback(async () => {
    if (!user || !householdId || !Capacitor.isNativePlatform()) return;

    try {
      // Cancel all previously scheduled notifications
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const threeDaysOut = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const notifications: {
        id: number;
        title: string;
        body: string;
        schedule: { at: Date };
      }[] = [];

      let notifId = 1;

      // 1. Reminders due today or tomorrow
      if (preferences.remindersEnabled) {
        const { data: reminders } = await supabase
          .from('reminders')
          .select('id, title, due_date, snoozed_until')
          .eq('household_id', householdId)
          .eq('is_checked', false)
          .lte('due_date', tomorrow + 'T23:59:59Z');

        for (const r of reminders || []) {
          if (r.snoozed_until && new Date(r.snoozed_until) > now) continue;
          const dueDate = new Date(r.due_date);
          const scheduleAt = dueDate > now ? dueDate : new Date(now.getTime() + 60000);
          notifications.push({
            id: notifId++,
            title: '⏰ Reminder Due',
            body: r.title,
            schedule: { at: scheduleAt },
          });
        }
      }

      // 2. Tasks due today
      if (preferences.tasksEnabled) {
        const { data: tasks } = await supabase
          .from('tasks')
          .select('id, title, due_date, assigned_to')
          .eq('household_id', householdId)
          .eq('is_completed', false)
          .not('due_date', 'is', null)
          .lte('due_date', today + 'T23:59:59Z');

        for (const t of tasks || []) {
          const assignee = t.assigned_to ? ` (${t.assigned_to})` : '';
          const dueDate = new Date(t.due_date!);
          const scheduleAt = dueDate > now ? dueDate : new Date(now.getTime() + 60000);
          notifications.push({
            id: notifId++,
            title: '✅ Task Due Today',
            body: `${t.title}${assignee}`,
            schedule: { at: scheduleAt },
          });
        }
      }

      // 3. Groceries expiring within 3 days
      if (preferences.groceriesEnabled) {
        const { data: groceries } = await supabase
          .from('groceries')
          .select('id, name, expiration_date')
          .eq('household_id', householdId)
          .not('expiration_date', 'is', null)
          .lte('expiration_date', threeDaysOut)
          .gte('expiration_date', today);

        for (const g of groceries || []) {
          notifications.push({
            id: notifId++,
            title: '🥫 Expiring Soon',
            body: `${g.name} expires on ${g.expiration_date}`,
            schedule: { at: new Date(now.getTime() + 60000) },
          });
        }
      }

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
      }
    } catch (e) {
      console.error('Failed to schedule local notifications:', e);
    }
  }, [user, householdId, preferences]);

  useEffect(() => {
    if (!user || !Capacitor.isNativePlatform()) return;

    const setup = async () => {
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display === 'prompt') {
        const req = await LocalNotifications.requestPermissions();
        if (req.display !== 'granted') return;
      } else if (perm.display !== 'granted') {
        return;
      }

      // Schedule immediately on app open
      await scheduleNotifications();

      // Re-sync periodically
      intervalRef.current = setInterval(scheduleNotifications, SYNC_INTERVAL_MS);
    };

    setup();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, scheduleNotifications]);
};
