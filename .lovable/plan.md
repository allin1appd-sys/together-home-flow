

# Plan: Complete Frontend Polish

The `ConfirmDialog` component exists but isn't wired into any page. Most pages already have empty states. The remaining work is:

## 1. Wire ConfirmDialog into all destructive swipe actions

Currently, swipe-to-delete on Tasks, Trips, Reminders, Notes, Budget transactions, Maintenance, Groceries, and Meals immediately deletes without confirmation. Add `ConfirmDialog` to each page so swiping triggers a confirmation prompt before actually deleting.

**Files to edit**: `Tasks.tsx`, `Trips.tsx`, `Reminders.tsx`, `Notes.tsx`, `Budget.tsx`, `Maintenance.tsx`, `Groceries.tsx`, `Meals.tsx`

**Pattern for each page**:
- Add state: `deleteId` (string | null) to track which item is pending deletion
- On swipe-delete, set `deleteId` instead of calling delete directly
- Render `<ConfirmDialog>` at page level, calling the real delete on confirm and clearing `deleteId` on cancel

## 2. Shopping list item editing

Currently, shopping list items can only be toggled. Add the ability to tap an item to edit its name, quantity, and estimated price via a small Sheet.

**Files**: `ShoppingList.tsx`, `useHomeStore.ts` (add `updateShoppingItem` action)

## 3. Empty state audit

Most pages already have empty states. Quick gaps to fill:
- **Meals page**: No empty state when no meals are planned for the week — add a friendly message
- **Budget page**: Verify transactions list has an empty state

## 4. Shopping list — add items inline

The Shopping List page has no way to add items (the Groceries page has an add sheet, but the standalone Shopping List doesn't). Add a quick-add input at the top.

**Files**: `ShoppingList.tsx`

## Summary of changes

| File | Change |
|------|--------|
| 8 page files | Add ConfirmDialog for delete confirmations |
| `ShoppingList.tsx` | Add edit sheet + inline add input |
| `useHomeStore.ts` | Add `updateShoppingItem` action |
| `Meals.tsx` | Add empty state for no-meals week |
| `Budget.tsx` | Verify/add empty state for no transactions |

All changes are frontend-only, no backend needed.

