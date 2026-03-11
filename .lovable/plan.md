

# What's Next — Phase B3: Family Notes / Shared Board

**Completed so far**: Dashboard, Tasks, Groceries, Shopping List, Meals, Trips, Reminders (B1), Maintenance (B2), Capacitor refactor.

## Next up: Family Notes module

A `/notes` page for quick notes, links, and reminders pinned to a shared board — like a digital fridge door.

### Features
1. **Note cards** in a masonry-style grid (2 columns) — each with title, body text, color label, pin toggle, and timestamp
2. **Color-coded labels** — 6 preset colors (yellow, blue, green, pink, purple, orange) as background tints
3. **Pin to top** — pinned notes always appear first
4. **Add/Edit bottom sheet** — title, body, color picker, pin toggle
5. **Swipe-to-delete** — consistent framer-motion pattern
6. **FAB** to add new note

### Data model
```text
Note {
  id, title, body?, color, isPinned, createdAt, updatedAt
}
```

### Files to create/modify
- `src/types/index.ts` — add `Note` interface
- `src/stores/useHomeStore.ts` — add `notes` state, mock data, CRUD actions
- `src/pages/Notes.tsx` — new page with grid, FAB, add/edit sheet
- `src/App.tsx` — register `/notes` route
- `src/components/layout/MoreDrawer.tsx` — enable Notes link

### After B3
- **B4**: Budget Tracker (spending log, charts, category breakdown)
- Then: Trip sub-features (itinerary, packing lists, trip budget)
- Then: Supabase backend integration

