

# Remaining Work — Implementation Plan

Based on the full audit, here's everything still needed to bring the app to production quality, organized into batches.

## Batch 1: Household Management + Member Removal

### Database
- Add DELETE policy on `household_members` so household owners can remove members
- Add UPDATE policy on `household_members` (currently missing)

### Frontend (Settings page)
- Add "Household Name" editing (the `households` table already has an UPDATE policy for creators)
- Show household members (from `household_members` joined with `profiles`) with remove buttons for owners
- Distinguish between "family members" (labels for assignment) and actual authenticated household members

## Batch 2: Edit Flows for Missing Entities

### Groceries page
- Add edit capability to `SwipeableGroceryCard` — tap to open edit sheet with pre-filled fields
- The `useGroceries` hook already has `updateGrocery`

### Budget page  
- Add edit capability for transactions — tap a transaction to open edit sheet
- The `useTransactions` hook already has `updateTransaction`

## Batch 3: Form Validation with Zod

Add Zod schemas + react-hook-form integration to all create/edit forms:
- **TaskSheet**: title required, dueDate optional valid date
- **Grocery form**: name required, quantity >= 1
- **Shopping item form**: name required
- **Reminder form**: title required, dueDate required
- **Transaction form**: description required, amount > 0
- **Trip form**: title required, dates required, endDate >= startDate
- **Recipe form**: name required
- **Note form**: title required
- **Maintenance form**: title required, frequencyDays >= 1

## Batch 4: Empty States + Loading Consistency

- Add consistent empty state illustrations with CTAs across all pages (some pages already have them, standardize the pattern)
- Ensure all pages show Skeleton loading states (most already do, verify consistency)

## Batch 5: Pull-to-Refresh

- Add a lightweight pull-to-refresh component that calls `queryClient.invalidateQueries()` for the current page's data
- Apply to all list pages: Tasks, Groceries, Reminders, Shopping, Budget, Meals, Trips, Maintenance, Notes

## Technical Details

### Household member removal (Batch 1)
Migration SQL:
- `CREATE POLICY "Owner can delete members" ON household_members FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM households WHERE id = household_id AND created_by = auth.uid()))`
- Need a query hook to fetch household members with their profile display names

### Zod schemas (Batch 3)
Create `src/lib/validations.ts` with all schemas. Integrate via `zodResolver` in react-hook-form where forms exist, or add `useForm` to pages that currently use raw `useState`.

### Pull-to-refresh (Batch 5)
Create `src/components/shared/PullToRefresh.tsx` using touch event listeners (touchstart/touchmove/touchend) with a visual indicator. Wrap page content in each list page.

## Execution Order
1. Batch 1 — Household management (DB migration + Settings UI)
2. Batch 2 — Edit flows for groceries and transactions
3. Batch 3 — Zod validation across all forms
4. Batch 4 — Empty states consistency
5. Batch 5 — Pull-to-refresh

This covers items 4, 5, 7, 9, 10, 11 from the remaining list. Items like offline support, E2E tests, Capacitor native builds, and social login are lower priority and can follow later.

