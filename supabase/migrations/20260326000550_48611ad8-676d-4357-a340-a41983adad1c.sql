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

  IF EXISTS (SELECT 1 FROM household_members WHERE user_id = _user_id) THEN
    RAISE EXCEPTION 'Already in a household';
  END IF;

  INSERT INTO households (name, created_by)
  VALUES (_name, _user_id)
  RETURNING id INTO _household_id;

  INSERT INTO household_members (household_id, user_id, role)
  VALUES (_household_id, _user_id, 'owner');

  RETURN _household_id;
END;
$$;