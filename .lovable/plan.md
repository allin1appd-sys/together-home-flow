

## Fix: Household Creation RLS Violation

### Root Cause

In `useHousehold.ts`, `createHousehold` does:
1. `INSERT INTO households ... .select().single()` — INSERT works (RLS allows `created_by = auth.uid()`), but the chained `.select()` fails because the SELECT policy requires `is_household_member(id)` — and the user isn't a member yet
2. This causes an RLS violation error before step 2 (inserting into `household_members`) ever runs

### Fix: Create a database function

Create a `create_household_for_user` SECURITY DEFINER function that atomically:
1. Creates the household
2. Adds the creator as owner in `household_members`
3. Returns the household ID

This bypasses the RLS timing issue entirely since the function runs with elevated privileges.

### Changes

**1. Database migration** — new function:
```sql
CREATE OR REPLACE FUNCTION public.create_household_for_user(_name text DEFAULT 'My Home')
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _household_id uuid;
  _user_id uuid := auth.uid();
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if user already belongs to a household
  IF EXISTS (SELECT 1 FROM household_members WHERE user_id = _user_id) THEN
    RAISE EXCEPTION 'Already in a household';
  END IF;

  -- Create household
  INSERT INTO households (name, created_by)
  VALUES (_name, _user_id)
  RETURNING id INTO _household_id;

  -- Add creator as owner
  INSERT INTO household_members (household_id, user_id, role)
  VALUES (_household_id, _user_id, 'owner');

  RETURN _household_id;
END;
$$;
```

**2. Update `src/hooks/useHousehold.ts`** — replace the two separate inserts with a single RPC call:
```typescript
const { data, error } = await supabase.rpc('create_household_for_user', { _name: householdName });
if (error) throw error;
return data;
```

This is a minimal, surgical fix — only 1 migration + 1 file edit.

