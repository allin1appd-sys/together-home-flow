

# Full App Status — What's Done vs. What's Remaining

## Completed (Functional)
- **Auth**: Login, signup, forgot/reset password, email verification, AuthGuard
- **Onboarding**: Create household or join via invite code (dual-path)
- **Dashboard**: Greeting, today's tasks/meals, upcoming reminders, expiring groceries, trip countdown, monthly budget summary, speed dial FAB
- **Tasks**: Full CRUD, subtasks, priorities, categories, assignment, recurring tasks, swipe-to-delete, completion history
- **Groceries**: Full CRUD, storage locations, expiration tracking, status (fresh/expiring/expired)
- **Meals**: Meal planning by date/type, recipe book with ingredients, link recipes to meal plans
- **Shopping List**: Full CRUD, categories, estimated prices, purchased toggle
- **Reminders**: Full CRUD, categories, repeat schedules, lead days, snooze, swipe-to-delete
- **Maintenance**: Recurring home maintenance tasks with frequency and completion tracking
- **Notes**: Color-coded sticky notes, pinning, full CRUD
- **Budget**: Transactions (income/expense), pie chart, category budget limits, progress bars
- **Trips**: Trip planning with itinerary, packing lists, status tracking
- **Settings**: Theme (light/dark/system), profile editing, family members, invite codes, notification preferences
- **Family Invites**: Generate/copy/delete 6-char codes, join via onboarding
- **Push Notifications**: Capacitor plugin, token registration, send-push edge function, per-category toggle
- **PWA**: vite-plugin-pwa configured with manifest, icons, workbox caching
- **Database**: 20 tables with RLS, realtime on key tables, security definer functions
- **Realtime**: Live sync on tasks, groceries, shopping list, meals, reminders, notes, transactions, maintenance, trips

## Remaining — Grouped by Priority

### High Priority (Core Gaps)
1. **FCM secret not configured** — The `send-push` edge function exists but `FCM_SERVER_KEY` is not set, so no push notifications actually deliver
2. **No scheduled notification triggers** — No cron job to scan for due reminders/tasks/expiring groceries and call `send-push`
3. **Error handling gaps** — Most mutations lack proper error toasts; failures are silent
4. **No loading/empty states on some pages** — Some pages show blank when data is loading or empty (inconsistent)

### Medium Priority (UX Polish)
5. **No "pull to refresh"** — Common mobile pattern missing
6. **No offline support** — PWA workbox only caches static assets; no runtime API caching or offline data strategy
7. **No data validation on forms** — Most forms use basic `required` checks but no Zod validation (library is installed but unused)
8. **Calendar/date picker** — Dates are entered via native `<input type="date">`; the `react-day-picker` Calendar component is installed but not used in most forms
9. **No edit flow for some entities** — Transactions, shopping list items, and grocery items can only be added/deleted, not edited
10. **No household name editing** — `households` table has `name` but there's no UI to change it
11. **No member removal** — Can't remove household members (no DELETE RLS policy on `household_members`)

### Lower Priority (Nice-to-Have)
12. **No activity log/audit trail** — No record of who did what
13. **No file/image attachments** — No storage buckets configured; recipes/notes could benefit from images
14. **No data export** — No way to export grocery lists, budgets, etc.
15. **No recurring transaction support** — Budget only has one-off transactions
16. **No search within pages** — Global search exists but individual page filtering is basic
17. **No accessibility audit** — Missing ARIA labels in several custom components
18. **No E2E tests** — Playwright is configured but only has an example test
19. **Capacitor native build** — `capacitor.config.ts` exists but the native projects (android/) haven't been generated/synced

### Not Started (Feature Ideas)
20. **Social/Google login** — Only email/password auth
21. **Multi-household support** — Users can only belong to one household
22. **Shared shopping list sync with stores** — No store/aisle mapping
23. **Recipe import from URL** — No web scraping for recipes

## Recommended Next Step
**Set up scheduled notification triggers** — This completes the push notification pipeline end-to-end. Create a `check-notifications` edge function that queries due reminders, tasks, and expiring groceries, then calls `send-push`. Schedule it via `pg_cron` to run every 15 minutes.

Alternatively, **add proper error handling and form validation** across all pages using Zod + react-hook-form (both already installed) to make the app production-ready.

