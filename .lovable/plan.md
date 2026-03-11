

# Status & Next Steps

## Backend Status — What's Done
- 18 database tables with RLS policies and realtime enabled
- Authentication (login, signup, forgot/reset password)
- Household creation via onboarding
- 13 React Query data hooks replacing Zustand for all CRUD
- Realtime subscriptions on key tables
- Profile and family member management

## What's Remaining
1. **Push notifications** (Capacitor) — not started
2. **Clean up dead code** — `useHomeStore.ts` still has 269 lines of mock data, no longer used
3. **PWA support** — not configured (manifest exists but no service worker / vite-plugin-pwa)
4. **Family invite system** — no way to invite others to a household yet

---

# Plan: Push Notifications with Capacitor

## 1. Install Capacitor Push Notifications plugin
Add `@capacitor/push-notifications` to dependencies. This provides native push registration on iOS/Android.

## 2. Create `push_tokens` database table
Store device tokens per user so the backend can target notifications.

| Column | Type |
|--------|------|
| id | uuid PK |
| user_id | uuid (references auth.users) |
| token | text (unique) |
| platform | text (ios/android/web) |
| created_at | timestamptz |

RLS: users can insert/read/delete their own tokens only.

## 3. Create a push notification hook — `src/hooks/usePushNotifications.ts`
- On app load (after auth), register for push notifications via Capacitor API
- On token received, upsert into `push_tokens` table
- Handle notification received/tapped events (navigate to relevant page)
- Clean up token on sign-out

## 4. Create an edge function — `supabase/functions/send-push/index.ts`
- Accepts `{ user_ids, title, body, data }` payload
- Looks up tokens from `push_tokens` table
- Sends via **FCM HTTP v1 API** (Firebase Cloud Messaging — works for both iOS and Android via Capacitor)
- Requires a Firebase service account key secret

## 5. Wire notifications to app events
- Create a database trigger or cron (via pg_cron or edge function scheduled) to check for:
  - Reminders due today/tomorrow (based on `lead_days`)
  - Tasks due today
  - Grocery items expiring soon
- Call the `send-push` edge function to notify relevant household members

## 6. Add notification preferences to Settings
- Toggle push notifications on/off per category (reminders, tasks, groceries)
- Store preferences in a `notification_preferences` table or as a JSON column on profiles

## 7. Clean up `useHomeStore.ts`
- Delete the file entirely since all data now comes from Supabase hooks
- Remove any remaining imports across the codebase

## Prerequisites
- A **Firebase project** with Cloud Messaging enabled — the user will need to provide a Firebase service account JSON key
- The user must have the native app built with Capacitor (`npx cap sync`) to test push notifications on device

## Execution Order
1. Add `push_tokens` table migration
2. Install `@capacitor/push-notifications` 
3. Create `usePushNotifications` hook
4. Create `send-push` edge function (after Firebase secret is configured)
5. Add notification preferences UI in Settings
6. Delete `useHomeStore.ts`

