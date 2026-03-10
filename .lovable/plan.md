

# Phase A4 — Trips Module CRUD

**Completed so far:** A1 Tasks ✓ | A2 Groceries/Shopping ✓ | A3 Meals ✓

## What we'll build

1. **Add Trip** — FAB "+" button opens a bottom sheet with fields: title, destination, start/end dates, description, category select, status select
2. **Tap-to-Edit** — tapping a trip card opens the same sheet pre-filled for editing
3. **Swipe-to-Delete** — consistent left-swipe pattern with red trash reveal (framer-motion `drag="x"`)
4. **Status badges** — color-coded: upcoming (blue), active (green), completed (muted)
5. **Store actions** — add `addTrip`, `updateTrip`, `deleteTrip` to `useHomeStore.ts`

## Files to modify
- **`src/pages/Trips.tsx`** — add sheet, edit flow, swipe gesture, FAB button
- **`src/stores/useHomeStore.ts`** — add `updateTrip`, `deleteTrip` actions (`addTrip` pattern from existing)

## Next step after this
B1 — Reminders module (dedicated page, categories, snooze, repeat rules)

