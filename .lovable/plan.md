

# What's Next — Remaining Work

## Already Complete
All 5 batches from the previous plan have been implemented:
- Household management (name editing, member removal, DELETE policy)
- Edit flows for groceries and transactions
- Zod validation schemas created (in `src/lib/validations.ts`)
- Empty states and loading skeletons standardized
- Pull-to-refresh on all list pages
- Error toasts on all mutations
- Scheduled notification cron job (`check-notifications` edge function + `pg_cron`)

## Still Remaining

### 1. **Zod schemas are defined but NOT wired into forms** (High Priority)
The schemas exist in `validations.ts` but no form actually uses `zodResolver` with `react-hook-form`. All forms still use raw `useState` with no client-side validation. This means validation errors never surface to users.

**Work**: Integrate `zodResolver` + `useForm` into TaskSheet, Groceries add/edit sheet, Reminders form, Budget transaction form, Trips form, Recipe form, Notes form, Maintenance form, and Shopping List form.

### 2. **FCM Secret not configured** (Medium — requires user action)
Push notifications won't deliver without `FCM_SERVER_KEY`. This requires the user to create a Firebase project and provide the server key.

### 3. **Native `<input type="date">` everywhere** (Low-Medium)
The `react-day-picker` Calendar component is installed but unused. Date inputs could use the Popover + Calendar pattern for a more polished mobile UX.

### 4. **Remaining feature gaps** (Lower Priority)
- No offline data caching (only static asset caching via workbox)
- No file/image attachments (no storage buckets)
- No data export
- No E2E tests (only example test exists)
- No activity log / audit trail
- Capacitor native build not generated

## Recommended Next Step
**Wire Zod validation into all forms** — the schemas already exist, the libraries (`react-hook-form`, `@hookform/resolvers`, `zod`) are already installed. This is pure frontend work that immediately improves data quality and user feedback. Each form needs:
1. Replace `useState` fields with `useForm({ resolver: zodResolver(schema) })`
2. Wrap inputs in `<Form>` / `<FormField>` components
3. Display `<FormMessage>` for validation errors

This touches ~9 form components across the app.

