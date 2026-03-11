
-- 1. Create household_invites table
CREATE TABLE public.household_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  created_by uuid NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.household_invites ENABLE ROW LEVEL SECURITY;

-- RLS: household members can SELECT and INSERT
CREATE POLICY "hh_invites_select" ON public.household_invites
  FOR SELECT TO authenticated
  USING (is_household_member(household_id));

CREATE POLICY "hh_invites_insert" ON public.household_invites
  FOR INSERT TO authenticated
  WITH CHECK (is_household_member(household_id));

CREATE POLICY "hh_invites_delete" ON public.household_invites
  FOR DELETE TO authenticated
  USING (is_household_member(household_id));

-- 2. Security definer function to join a household by invite code
CREATE OR REPLACE FUNCTION public.join_household_by_code(_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _household_id uuid;
  _user_id uuid := auth.uid();
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if user already belongs to a household
  IF EXISTS (SELECT 1 FROM public.household_members WHERE user_id = _user_id) THEN
    RAISE EXCEPTION 'You already belong to a household';
  END IF;

  -- Find valid invite
  SELECT household_id INTO _household_id
  FROM public.household_invites
  WHERE code = _code AND expires_at > now();

  IF _household_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite code';
  END IF;

  -- Add user to household
  INSERT INTO public.household_members (household_id, user_id, role)
  VALUES (_household_id, _user_id, 'member');

  RETURN _household_id;
END;
$$;
