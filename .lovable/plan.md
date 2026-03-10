

# Phase A3 — Meal Planner Polish

## What we'll build

### 1. Copy Last Week
- "Copy last week" button in the week nav bar
- New store action `copyLastWeekMeals(weekStart)` that duplicates all meal plans from the previous 7 days into the current week, skipping slots that already have meals

### 2. Tap meal to edit (instead of delete)
- Currently tapping a filled meal slot immediately deletes it — bad UX
- Change to: tapping a filled slot opens the meal sheet pre-filled for editing; add a delete button inside the sheet
- New store action `updateMealPlan` for editing

### 3. Missing ingredients check
- When viewing the Recipe Library sheet, each recipe card shows which ingredients are missing from current grocery inventory
- Compare `recipe.ingredients` names against `groceries` names; show a badge like "2 missing" with option to add missing items to shopping list

### 4. Swipe-to-delete on meal slots
- Swipe left on a filled meal cell to reveal red delete background (consistent with Tasks/Groceries pattern)

### 5. Recipe delete
- Add delete button on recipe cards in the library
- New store action `removeRecipe`

## Files to modify
- **`src/pages/Meals.tsx`** — edit flow, copy-last-week button, swipe gesture, missing ingredients display
- **`src/stores/useHomeStore.ts`** — `updateMealPlan`, `copyLastWeekMeals`, `removeRecipe` actions

## Next step after this
A4 — Trips module (add/edit trips bottom sheet, full CRUD)

