

# Phase A2 — Grocery & Shopping List Polish

## What we'll build

### 1. Auto-suggest expired/low items to Shopping List
- Add a banner at the top of the Inventory tab showing expired and expiring items not already on the shopping list
- "Add to Shopping List" button per item (or "Add All") that creates a shopping list entry and removes from inventory
- New store action: `suggestToShoppingList(groceryId)` that moves an expired/low item

### 2. Horizontal aisle-grouped carousels in Shopping List
- Replace the vertical category groups in the Shopping tab with horizontally scrollable carousels per category
- Each category gets a header + horizontal scroll row of item cards
- Uses `overflow-x-auto` with `snap-x` for native scroll snapping — no extra dependencies needed

### 3. Estimated cost totals
- Add `estimatedPrice` field to the add-shopping-item form (optional)
- Show per-category subtotals and a grand total at the top of the Shopping List tab
- Display as a small summary card: "Estimated total: $XX.XX"

### 4. Swipe-to-delete on grocery items
- Same Framer Motion `drag="x"` pattern from TaskCard — swipe left reveals red trash background, release past threshold removes item

### 5. Unit field in grocery add form
- Currently missing from the form but exists on the type — add a unit input field

## Files to modify
- **`src/pages/Groceries.tsx`** — auto-suggest banner, swipe-to-delete, horizontal carousels for shopping tab, estimated price in form, unit field
- **`src/stores/useHomeStore.ts`** — add `suggestToShoppingList` action
- **`src/pages/ShoppingList.tsx`** — horizontal carousels, estimated total display

## Next step after this
A3 — Meal Planner polish (drag-and-drop, copy last week, missing ingredients check)

