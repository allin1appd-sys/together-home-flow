

# Switch to Local Notifications (No Firebase Required)

You're right — since this is a Capacitor app, we don't need Firebase at all. We can use **Capacitor Local Notifications** (`@capacitor/local-notifications`) instead. These work on both iOS and Android natively, scheduled directly on the device with zero server-side push infrastructure.

## What Changes

### Install
- Add `@capacitor/local-notifications` package

### Replace Push with Local Notifications
- **Rewrite `usePushNotifications.ts`** → `useLocalNotifications.ts`
  - Use `LocalNotifications` from `@capacitor/local-notifications`
  - Request permissions on native platforms
  - Fetch due reminders, tasks, and expiring groceries from the database
  - Schedule local notifications for each item (e.g., task due today, grocery expiring in 3 days)
  - Re-schedule periodically (on app open / every few minutes via `setInterval`)
  - Respect notification preferences from `useNotificationPreferences`

### Remove Server-Side Push Infrastructure
- **Delete** `supabase/functions/send-push/index.ts` — no longer needed
- **Delete** `supabase/functions/check-notifications/index.ts` — logic moves client-side
- **Remove** the `pg_cron` job that calls `check-notifications`
- The `push_tokens` and `notification_preferences` tables can stay (preferences still used client-side)

### How Local Scheduling Works
On each app open (and on a periodic interval), the hook will:
1. Query the database for due/upcoming items (same logic as the old edge function)
2. Cancel previously scheduled notifications
3. Schedule new local notifications with appropriate timestamps
4. Filter by the user's notification preference toggles

This gives the same user experience — notifications about due tasks, reminders, and expiring groceries — without any external service or API key.

## Files Changed
- `package.json` — add `@capacitor/local-notifications`
- New `src/hooks/useLocalNotifications.ts` — all scheduling logic
- `src/components/layout/AppShell.tsx` — swap hook import
- Delete `supabase/functions/send-push/index.ts`
- Delete `supabase/functions/check-notifications/index.ts`
- Migration to remove the `pg_cron` job
- Remove `src/hooks/usePushNotifications.ts`

