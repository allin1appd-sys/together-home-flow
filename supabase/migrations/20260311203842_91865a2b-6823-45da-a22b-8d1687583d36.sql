
-- Allow household owners to delete members (but not themselves)
CREATE POLICY "Owner can delete members"
ON public.household_members
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.households
    WHERE id = household_members.household_id
    AND created_by = auth.uid()
  )
  AND user_id != auth.uid()
);

-- Allow reading profiles for household members (needed to show member names)
CREATE POLICY "Household members can read profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT hm2.user_id FROM public.household_members hm2
    WHERE hm2.household_id IN (
      SELECT hm1.household_id FROM public.household_members hm1
      WHERE hm1.user_id = auth.uid()
    )
  )
);
