

## Populate App with Demo Data

### Overview
Insert realistic demo data across all modules for all three existing households, so any user who logs in sees a fully populated, living app.

### Data to Insert

**Per household** (3 households × all modules):

1. **Tasks** (~8 each) — mix of priorities, categories, some completed, due dates spread across today/this week/next week
2. **Groceries** (~10 each) — items in fridge/pantry/freezer, with expiration dates (some expiring soon, some fresh, some expired)
3. **Reminders** (~6 each) — bills, appointments, renewals with varied due dates
4. **Transactions** (~15 each) — income + expenses across categories for the current month to populate the budget widget
5. **Budget Limits** (~5 each) — category spending limits
6. **Meal Plans** (~6 each) — today + next few days, breakfast/lunch/dinner
7. **Recipes** (~4 each) — with ingredients
8. **Trips** (1-2 each) — one upcoming, one completed
9. **Notes** (~4 each) — pinned and unpinned, different colors
10. **Maintenance Tasks** (~4 each) — HVAC, plumbing, lawn, etc.
11. **Shopping List** (~6 each) — groceries to buy with estimated prices
12. **Family Members** (~3 each) — household members for assignment

### Technical Details

- All inserts use `psql` via the insert tool (data operations, not schema changes)
- Household IDs: `8c37684d-...`, `b4c059e6-...`, `313afee9-...`
- Dates are relative to today (2026-04-05) so dashboard widgets show relevant content
- Existing data in household `b4c059e6` will be preserved (additive inserts only)
- Uses realistic names, amounts, and categories

### Estimated Scope
- Single large SQL insert script covering all tables
- No code changes needed — just data population

