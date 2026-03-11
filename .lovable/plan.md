

# Phase 2: Migrate Zustand to Supabase-backed React Query Hooks

All 10+ pages currently import `useHomeStore` for data. We need to replace this with Supabase queries while keeping the same API shape to minimize page-level changes.

## Approach

Create a set of custom React Query hooks (one per entity) that read/write from the database. Each hook returns `data`, `isLoading`, and mutation functions matching the current Zustand API. Pages swap `useHomeStore()` for these hooks with minimal changes.

The `useAuth` hook already provides `householdId` — all queries will be scoped to it.

## New Files to Create

### 1. `src/hooks/useHousehold.ts`
- On first login when `householdId` is null, auto-create a household + membership
- Provides `householdId` to all other hooks
- Creates profile/household during onboarding flow

### 2. `src/hooks/data/useTasks.ts`
- `useQuery` fetching tasks + sub_tasks for household
- Mutations: `addTask`, `toggleTask`, `deleteTask`, `updateTask`, `toggleSubTask`
- Maps DB snake_case to frontend camelCase types

### 3. `src/hooks/data/useGroceries.ts`
- CRUD for groceries table
- `addGrocery`, `removeGrocery`, `decrementGrocery`

### 4. `src/hooks/data/useShoppingList.ts`
- CRUD for shopping_list table
- `addShoppingItem`, `toggleShoppingItem`, `removeShoppingItem`, `updateShoppingItem`, `clearCompletedShopping`
- `suggestToShoppingList` (from grocery)

### 5. `src/hooks/data/useMealPlans.ts`
- CRUD for meal_plans table
- `addMealPlan`, `removeMealPlan`, `updateMealPlan`, `copyLastWeekMeals`

### 6. `src/hooks/data/useRecipes.ts`
- CRUD for recipes + recipe_ingredients
- `addRecipe`, `removeRecipe`

### 7. `src/hooks/data/useReminders.ts`
- CRUD for reminders table
- `toggleReminder`, `addReminder`, `updateReminder`, `deleteReminder`, `snoozeReminder`

### 8. `src/hooks/data/useTrips.ts`
- CRUD for trips + trip_packing_items
- `addTrip`, `updateTrip`, `deleteTrip`

### 9. `src/hooks/data/useMaintenanceTasks.ts`
- CRUD + `completeMaintenanceTask`

### 10. `src/hooks/data/useNotes.ts`
- CRUD + `toggleNotePin`

### 11. `src/hooks/data/useTransactions.ts`
- `addTransaction`, `deleteTransaction`

### 12. `src/hooks/data/useBudgetLimits.ts`
- `updateBudgetLimit` (upsert)

### 13. `src/hooks/data/useFamilyMembers.ts`
- `addFamilyMember`, `removeFamilyMember`

## Pages to Update

Every page that currently does `const { ... } = useHomeStore()` will swap to the relevant hook(s):

| Page | Hooks Used |
|------|-----------|
| `Index.tsx` | useTasks, useGroceries, useReminders, useTrips, useMealPlans, useTransactions, useBudgetLimits |
| `Tasks.tsx` | useTasks |
| `Groceries.tsx` | useGroceries, useShoppingList |
| `ShoppingList.tsx` | useShoppingList |
| `Meals.tsx` | useMealPlans, useRecipes |
| `Reminders.tsx` | useReminders |
| `Trips.tsx` | useTrips |
| `Maintenance.tsx` | useMaintenanceTasks, useFamilyMembers |
| `Notes.tsx` | useNotes |
| `Budget.tsx` | useTransactions, useBudgetLimits |
| `Settings.tsx` | useFamilyMembers + profile data |
| `TaskSheet.tsx` | useFamilyMembers (for assignedTo dropdown) |
| `OnboardingSheet.tsx` | useHousehold (create household + profile) |

## Key Patterns

- **Snake-to-camel mapping**: Each hook maps DB rows (e.g. `is_completed`, `due_date`) to frontend types (e.g. `isCompleted`, `dueDate`) and vice versa
- **Loading states**: Pages add `isLoading` checks with skeleton UI
- **Household scoping**: All inserts include `household_id` from `useAuth().householdId`
- **Optimistic updates**: Use `onMutate` for toggle actions (tasks, reminders) for instant feedback
- **Realtime**: Subscribe to postgres_changes on key tables and invalidate queries on change

## Onboarding Update

The `OnboardingSheet` will create a household and household_members entry on completion, then set the user's profile display_name. After this, `householdId` populates and all data hooks start working.

## What Stays in Zustand

- `onboardingComplete` flag (local-only UI state)
- UI state like filter selections, modal open states (already local component state)
- `useHomeStore` will be stripped down to only UI preferences or removed entirely

## Execution Order

1. Create `useHousehold` hook + update onboarding to create household
2. Create all 13 data hooks
3. Update all pages to use new hooks (add loading skeletons)
4. Add realtime subscriptions
5. Strip `useHomeStore` down to UI-only state
6. Add sign-out button to Settings

This is a large migration touching ~20 files. I'll implement it incrementally, starting with the household setup and a few core hooks, then expanding to all pages.

