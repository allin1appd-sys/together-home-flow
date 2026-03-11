

# Next Step: Family Invite System

## What's Done
- 18 DB tables with RLS + realtime
- Full auth (login/signup/reset), onboarding with household creation
- 13 React Query data hooks replacing all Zustand
- Push notification infrastructure (Capacitor plugin, push_tokens table, send-push edge function)
- Notification preferences UI
- Dead code (`useHomeStore`) fully removed

## What's Remaining
1. **Family invite system** -- no way to add other users to a household
2. **Profile editing** -- display name is read-only in Settings
3. **PWA support** -- no service worker or vite-plugin-pwa
4. **FCM secret + scheduled notification triggers** -- send-push needs FCM_SERVER_KEY; no cron for due reminders/tasks

## Plan: Family Invite System

Allow household owners to generate an invite code that other users can enter to join the household.

### Database Changes

1. **New table: `household_invites`**
   - `id` uuid PK
   - `household_id` uuid (FK to households)
   - `code` text unique (6-char alphanumeric)
   - `created_by` uuid
   - `expires_at` timestamptz (default: now + 7 days)
   - `created_at` timestamptz
   - RLS: household members can SELECT/INSERT; no public access

2. **New RLS policy on `household_members`**: Allow INSERT when a valid invite code exists (via a security definer function `join_household_by_code`)

3. **New DB function: `join_household_by_code(invite_code text)`**
   - Security definer function
   - Validates the code exists and hasn't expired
   - Inserts a new row into `household_members` for `auth.uid()`
   - Returns the `household_id`

### Frontend Changes

1. **Settings page** -- Add "Invite Family" section:
   - "Generate Invite Code" button that inserts into `household_invites` and displays the code
   - Copy-to-clipboard functionality
   - Show active invite codes with expiry

2. **New Join page** (`/join`) or dialog on login:
   - Input field for invite code
   - Calls `join_household_by_code` RPC
   - On success, reloads to pick up new `householdId`

3. **Update onboarding flow**:
   - Add option: "Create new household" vs "Join existing household with invite code"

### Execution Order
1. Create `household_invites` table + `join_household_by_code` function via migration
2. Add invite generation UI to Settings
3. Add join-by-code flow (either in onboarding or a `/join` route)
4. Add profile editing (editable display name in Settings) as a bonus

