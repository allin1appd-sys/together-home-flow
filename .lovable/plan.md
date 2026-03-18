

## Problem

When pressing "Get Started" on the onboarding screen, the `createHousehold` function tries to insert into the `households` table. The RLS policy requires `created_by = auth.uid()`, which should match. However, the most likely cause is that **email auto-confirm is not enabled** — meaning after signup, the user has an unconfirmed session that cannot pass RLS checks since `auth.uid()` returns null for unconfirmed users.

Since this app uses synthetic emails (`+1555...@homehub.app`) that can never receive a real confirmation email, auto-confirm **must** be enabled.

## Fix

1. **Enable auto-confirm for email signups** using the auth configuration tool — this ensures users are immediately authenticated after signup with their phone+PIN flow.

That single change should resolve the RLS violation. No code changes needed.

