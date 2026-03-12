

# Replace Auth with Phone + PIN Signup & Shareable Family Link

## How It Works

### Owner (first-time user)
1. Opens app → sees a signup screen asking for **phone number** and a **4-digit PIN**
2. Behind the scenes, we use the phone number to generate an internal email (`+15551234567@homehub.app`) and use the PIN as the password — this leverages the existing auth system without requiring any external service
3. A household is auto-created, and they land on the dashboard
4. Auto-confirm is enabled so no email verification is needed

### Family members
1. Owner shares a link from inside the app (e.g., `https://app-url.com/join/ABC123`)
2. Family member opens the link → sees a simple screen: "Enter your name to join"
3. Behind the scenes, a random account is auto-created for them, they're added to the household, and they land on the dashboard with full access
4. Their credentials are persisted in localStorage so they stay logged in

### Returning owner
- If the owner opens the app on a new device, they enter their phone + PIN to log back in

## Database Changes

1. **Migration**: Add `phone` column to `profiles` table (nullable, for owner identification)
2. **Migration**: Enable auto-confirm for email signups (since we're using synthetic emails)

## Files to Create/Modify

### New files
- `src/pages/PhoneSignup.tsx` — Phone + PIN signup screen (replaces Login/Signup)
- `src/pages/JoinHousehold.tsx` — Name-only join screen for family members arriving via shared link

### Modified files
- `src/App.tsx` — Replace `/login` and `/signup` routes with `/phone-signup`; add `/join/:code` public route
- `src/hooks/useAuth.tsx` — Add `signUpWithPhone(phone, pin)` and `signInWithPhone(phone, pin)` methods that convert phone→synthetic email internally; add `autoJoin(name, code)` for family members
- `src/components/auth/AuthGuard.tsx` — Redirect to `/phone-signup` instead of `/login`
- `src/components/onboarding/OnboardingSheet.tsx` — Remove create/join choice (household is auto-created on signup; joining is via link)
- `src/pages/Settings.tsx` — Replace invite code section with a "Share Link" button that copies the join URL
- `src/pages/Index.tsx` — Update OnboardingSheet usage

### Deleted files
- `src/pages/Login.tsx`
- `src/pages/Signup.tsx`
- `src/pages/ForgotPassword.tsx`
- `src/pages/ResetPassword.tsx`

## Auth Flow Summary

```text
OWNER:                          FAMILY MEMBER:
Phone + PIN                     Shared link /join/ABC123
    │                               │
    ▼                               ▼
synthetic email auth            "Enter your name"
    │                               │
    ▼                               ▼
auto-create household           auto-create account
    │                           auto-join household
    ▼                               │
  Dashboard ◄───────────────────────┘
```

## Key Details
- PIN is exactly 4 digits, enforced in UI
- Phone number validated for basic format
- Synthetic email format: `{phone}@homehub.app` (never shown to user)
- Family member synthetic email: `family_{randomId}@homehub.app` with random password stored in localStorage
- Auto-confirm enabled so no email verification step
- All existing RLS policies continue to work unchanged since every user still gets a real auth session
- The join link uses the existing `household_invites` table and `join_household_by_code` function

