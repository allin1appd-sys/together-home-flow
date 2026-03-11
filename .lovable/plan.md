

# Implementation Plan — Remaining Features

**Completed**: Dashboard, Tasks, Groceries, Shopping List, Meals, Trips, Reminders, Maintenance, Notes, Capacitor refactor.

## What we'll build (3 phases)

### Phase 1: Budget Tracker (B4)
New `/budget` page for tracking household spending.

**Data model**: `Transaction` (id, description, amount, category, date, type: income|expense), `BudgetLimit` (category, limit). New `BudgetCategory` type.

**Files**:
- `src/types/index.ts` — add `Transaction`, `BudgetLimit`, `BudgetCategory` types
- `src/stores/useHomeStore.ts` — add `transactions`, `budgetLimits` state + CRUD actions + mock data
- `src/pages/Budget.tsx` — new page with:
  - Monthly summary card (total income, expenses, balance)
  - Recharts bar/pie chart for category breakdown
  - Transaction list with swipe-to-delete
  - Add transaction bottom sheet
  - Category budget progress bars
- `src/App.tsx` — register `/budget` route
- `src/components/layout/MoreDrawer.tsx` — enable Budget link (remove `disabled: true`)

### Phase 2: Trip Sub-features
Enhance existing Trips page with itinerary and packing lists.

**Data model**: Add `itinerary: TripActivity[]` and `packingList: PackingItem[]` arrays to existing `Trip` type.

**Files**:
- `src/types/index.ts` — add `TripActivity`, `PackingItem` interfaces; extend `Trip`
- `src/stores/useHomeStore.ts` — add actions for itinerary/packing CRUD
- `src/pages/Trips.tsx` — add tabs (Details / Itinerary / Packing) inside the trip edit sheet:
  - Itinerary tab: day-by-day activity list with time, description
  - Packing tab: checklist with checkbox items, add inline

### Phase 3: Global Search
A search bar in the app shell that searches across all modules.

**Files**:
- `src/components/layout/GlobalSearch.tsx` — search dialog (cmdk already installed) searching tasks, notes, reminders, groceries, trips, maintenance
- `src/components/layout/AppShell.tsx` — add search icon button in header that opens GlobalSearch
- Results grouped by module, tapping a result navigates to the relevant page

## Technical notes
- Recharts is already installed for budget charts
- cmdk is already installed for the command palette search
- All new pages follow the existing pattern: framer-motion animations, swipe gestures, bottom sheets, FAB
- Zustand persist middleware continues to handle all state

