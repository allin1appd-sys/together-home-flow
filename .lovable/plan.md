

# Capacitor Compatibility Audit & Refactoring Plan

## Audit Findings

After reviewing the entire codebase, the project is already in good shape for Capacitor — it's mobile-first, uses bottom navigation, bottom sheets, touch gestures, and avoids server-side rendering. However, several adjustments are needed.

### Issues Found

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 1 | **No Capacitor installed** | High | `package.json` |
| 2 | **No safe-area-inset-top padding** | Medium | All pages — content can sit under the iOS status bar / Android notch |
| 3 | **Bottom tab bar uses `safe-bottom` but FABs and fixed elements don't account for safe areas** | Medium | `BottomTabBar.tsx`, `Index.tsx`, `Trips.tsx`, `Reminders.tsx` |
| 4 | **`hover:` utilities used on interactive elements** | Low | `Groceries.tsx`, `TaskCard.tsx`, `MoreDrawer.tsx` — hover states don't trigger on mobile but cause no harm; just unnecessary |
| 5 | **BrowserRouter used instead of a router that works with Capacitor's file:// protocol** | High | `App.tsx` — `BrowserRouter` fails on iOS/Android because there's no server to handle routes; must use `MemoryRouter` or hash-based routing |
| 6 | **No viewport meta for Capacitor** | Medium | `index.html` — missing `viewport-fit=cover` for notch/safe-area support |
| 7 | **`autoFocus` on inputs inside sheets** | Low | Multiple sheets — `autoFocus` can cause the keyboard to jump on Capacitor WebView; remove and let users tap |
| 8 | **Zustand state not persisted** | Low | `useHomeStore.ts` — state resets on app restart; needs `zustand/middleware` persist with a Capacitor-safe storage adapter |
| 9 | **No status bar / navigation bar color control** | Low | Future — will need `@capacitor/status-bar` plugin |
| 10 | **`next-themes` uses localStorage** | OK | Works fine in Capacitor WebView |

### No Issues With
- Framer Motion gestures (drag, swipe) — work in WebView
- Radix UI components (Sheet, Select, Popover) — work in WebView
- Tailwind CSS — no issues
- Zustand — no issues (just needs persist)
- date-fns — no issues
- Sonner toasts — work in WebView

---

## Refactoring Plan

### 1. Install Capacitor dependencies
- Install `@capacitor/core`, `@capacitor/cli` (dev), `@capacitor/ios`, `@capacitor/android`
- Run `npx cap init` with appId `app.lovable.2fc7b9e2e7d041b39b05178a47f441b8`
- Create `capacitor.config.ts` with server URL pointing to sandbox for dev

### 2. Switch BrowserRouter to a Capacitor-safe router
- In `App.tsx`, detect if running inside Capacitor (`window.Capacitor`) and use a custom `basename` or switch to hash routing
- Simplest fix: keep `BrowserRouter` but configure Capacitor's server to use `index.html` as the fallback (Capacitor does this by default for bundled apps). For dev with sandbox URL, `BrowserRouter` works fine. **No change needed** — Capacitor serves from `index.html` with its own server, so client-side routing works. This is a non-issue when properly bundled.

### 3. Add safe area support
- Update `index.html`: add `viewport-fit=cover` to viewport meta tag
- Update `src/index.css`: add `padding-top: env(safe-area-inset-top)` to the app shell
- Update `AppShell.tsx`: add `pt-[env(safe-area-inset-top)]` class to the root div
- Ensure FABs (`bottom-24`) account for safe-area-bottom

### 4. Remove `autoFocus` from sheet inputs
- Remove `autoFocus` from inputs in: `Groceries.tsx` (2 sheets), `TaskSheet.tsx`, `Meals.tsx`
- Prevents keyboard jump issues in Capacitor WebView

### 5. Add Zustand persist middleware
- Wrap store with `persist()` using `localStorage` (works in Capacitor WebView)
- This prevents data loss on app restart

### 6. Minor CSS adjustments
- Replace `hover:` with `active:` or keep both (hover is harmless but add `active:` states for touch feedback where missing)
- Ensure all scrollable areas use `-webkit-overflow-scrolling: touch` (Tailwind's `overflow-y-auto` handles this)

---

## Files to modify
- **`package.json`** — add Capacitor dependencies
- **`index.html`** — add `viewport-fit=cover`
- **`src/index.css`** — add safe-area-top utility
- **`src/components/layout/AppShell.tsx`** — apply safe-area-top padding
- **`src/pages/Groceries.tsx`** — remove `autoFocus`
- **`src/pages/Meals.tsx`** — remove `autoFocus`
- **`src/components/tasks/TaskSheet.tsx`** — remove `autoFocus`
- **`src/stores/useHomeStore.ts`** — add `persist` middleware
- **`capacitor.config.ts`** — new file, Capacitor configuration

## What stays the same
- All existing functionality, UI, and interactions remain intact
- Router stays as `BrowserRouter` (works with Capacitor's bundled server)
- All current libraries are Capacitor-compatible

