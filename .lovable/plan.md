

# Backend Integration Plan

The frontend is 100% complete. The next step is setting up the backend via Lovable Cloud.

## Phase 1: Authentication & Core Tables

### 1. Authentication
- Create login and signup pages with email/password
- Add a protected route wrapper that redirects unauthenticated users to `/login`
- Create a `profiles` table (id, user_id, display_name, created_at) with auto-creation trigger on signup
- Create a `households` table and `household_members` join table so family members share data

### 2. Database Schema
Create all tables with RLS policies scoped to household membership:

| Table | Key Columns |
|-------|-------------|
| `households` | id, name, created_by |
| `household_members` | household_id, user_id, role |
| `profiles` | id, user_id, display_name, avatar_color |
| `tasks` | id, household_id, title, priority, category, is_completed, due_date, assigned_to, is_recurring, recurrence_rule |
| `sub_tasks` | id, task_id, title, is_completed |
| `groceries` | id, household_id, name, quantity, unit, category, storage_location, purchase_date, expiration_date, status |
| `shopping_list` | id, household_id, name, quantity, category, is_purchased, estimated_price, note |
| `recipes` | id, household_id, name, instructions, prep_time, cook_time, servings, tags |
| `recipe_ingredients` | id, recipe_id, name, quantity, unit |
| `meal_plans` | id, household_id, date, meal_type, recipe_id, custom_meal_name |
| `reminders` | id, household_id, title, due_date, is_checked, category, lead_days, repeat, snoozed_until |
| `trips` | id, household_id, title, destination, start_date, end_date, description, category, status |
| `trip_packing_items` | id, trip_id, name, is_packed |
| `maintenance_tasks` | id, household_id, title, frequency_days, last_completed, next_due, assigned_to |
| `notes` | id, household_id, title, body, color, is_pinned |
| `transactions` | id, household_id, description, amount, category, date, type |
| `budget_limits` | id, household_id, category, limit_amount |
| `family_members` | id, household_id, name, color |

All tables get RLS policies using a `is_household_member(household_id)` security definer function.

### 3. Enable Realtime
Add realtime publication for key tables (tasks, groceries, shopping_list, meal_plans, reminders, notes) so all family members see updates instantly.

## Phase 2: Migrate State to Backend

### 4. Replace Zustand with React Query + Supabase
- Create custom hooks per entity (e.g., `useTasks`, `useGroceries`, etc.) using `@tanstack/react-query` with Supabase queries
- Each hook provides `data`, `isLoading`, and mutation functions (add, update, delete)
- Remove mock data from `useHomeStore`; keep only UI-local state (filters, selected tabs, modals)
- Invalidate queries on mutations for instant UI updates
- Subscribe to realtime channels per table for cross-device sync

### 5. Update All Pages
- Swap `useHomeStore()` calls for the new query hooks
- Add loading skeletons while data fetches
- Handle error states gracefully

## Phase 3: Onboarding Update

### 6. Update Onboarding Flow
- After signup, the onboarding sheet creates the user's household and profile
- Family members added during onboarding are inserted into the `family_members` table

## Execution Order
1. Create all database tables + RLS policies (single large migration)
2. Build auth pages (Login, Signup, ResetPassword) + protected route wrapper
3. Create React Query hooks for each entity
4. Wire hooks into all pages, replacing Zustand data calls
5. Add realtime subscriptions
6. Update onboarding to create household on first run

This is a large change — I recommend we tackle it in steps, starting with auth + tables, then migrating one module at a time.

