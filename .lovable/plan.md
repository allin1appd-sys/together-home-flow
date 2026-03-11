

# What's Next

## Completed So Far
- 20 database tables with RLS and realtime
- Full authentication (login/signup/reset password)
- Onboarding with household creation or join-by-code
- 13+ React Query data hooks (all CRUD)
- Push notification infrastructure (Capacitor plugin, push_tokens table, send-push edge function)
- Notification preferences UI in Settings
- Family invite system (generate codes, join household)
- Profile editing (display name)
- Dead code cleanup (useHomeStore deleted)

## Remaining Items

### 1. PWA Support (Recommended Next)
Install `vite-plugin-pwa`, configure service worker with offline caching, add proper icons and meta tags, create an install prompt page. This makes the app installable from the browser on any device without needing app stores.

- Install `vite-plugin-pwa`
- Configure in `vite.config.ts` with manifest and workbox settings
- Add `/~oauth` to `navigateFallbackDenylist`
- Add mobile meta tags to `index.html`
- Create PWA icons (192x192, 512x512)
- Optionally add an `/install` page with install prompt

### 2. Scheduled Notification Triggers
Create a cron-based edge function that runs periodically to check for:
- Reminders due today/tomorrow
- Tasks due today
- Grocery items expiring soon

Then calls the existing `send-push` edge function. Requires enabling `pg_cron` and `pg_net` extensions and setting up the `FCM_SERVER_KEY` secret.

### 3. Other Polish
- Improve the dashboard/Index page with summary widgets
- Add data export functionality
- Add meal plan calendar view improvements

## Recommendation
**PWA support** is the logical next step — it makes the app installable for all users immediately without requiring Capacitor/native builds, and pairs well with the existing Capacitor setup for users who want the full native experience.

