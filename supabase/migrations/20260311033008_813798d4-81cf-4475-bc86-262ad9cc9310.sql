
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groceries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_packing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_limits ENABLE ROW LEVEL SECURITY;

-- Security definer function
CREATE OR REPLACE FUNCTION public.is_household_member(_household_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members
    WHERE household_id = _household_id
      AND user_id = auth.uid()
  )
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profiles policies
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Households policies
CREATE POLICY "Members can read household" ON public.households FOR SELECT TO authenticated USING (public.is_household_member(id));
CREATE POLICY "Creator can update household" ON public.households FOR UPDATE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Authenticated can create household" ON public.households FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

-- Household members policies
CREATE POLICY "Members can read members" ON public.household_members FOR SELECT TO authenticated USING (public.is_household_member(household_id));
CREATE POLICY "Can insert own membership" ON public.household_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- All household-scoped tables
CREATE POLICY "hh_family_members" ON public.family_members FOR ALL TO authenticated USING (public.is_household_member(household_id)) WITH CHECK (public.is_household_member(household_id));
CREATE POLICY "hh_tasks" ON public.tasks FOR ALL TO authenticated USING (public.is_household_member(household_id)) WITH CHECK (public.is_household_member(household_id));
CREATE POLICY "hh_groceries" ON public.groceries FOR ALL TO authenticated USING (public.is_household_member(household_id)) WITH CHECK (public.is_household_member(household_id));
CREATE POLICY "hh_shopping_list" ON public.shopping_list FOR ALL TO authenticated USING (public.is_household_member(household_id)) WITH CHECK (public.is_household_member(household_id));
CREATE POLICY "hh_recipes" ON public.recipes FOR ALL TO authenticated USING (public.is_household_member(household_id)) WITH CHECK (public.is_household_member(household_id));
CREATE POLICY "hh_meal_plans" ON public.meal_plans FOR ALL TO authenticated USING (public.is_household_member(household_id)) WITH CHECK (public.is_household_member(household_id));
CREATE POLICY "hh_reminders" ON public.reminders FOR ALL TO authenticated USING (public.is_household_member(household_id)) WITH CHECK (public.is_household_member(household_id));
CREATE POLICY "hh_trips" ON public.trips FOR ALL TO authenticated USING (public.is_household_member(household_id)) WITH CHECK (public.is_household_member(household_id));
CREATE POLICY "hh_maintenance_tasks" ON public.maintenance_tasks FOR ALL TO authenticated USING (public.is_household_member(household_id)) WITH CHECK (public.is_household_member(household_id));
CREATE POLICY "hh_notes" ON public.notes FOR ALL TO authenticated USING (public.is_household_member(household_id)) WITH CHECK (public.is_household_member(household_id));
CREATE POLICY "hh_transactions" ON public.transactions FOR ALL TO authenticated USING (public.is_household_member(household_id)) WITH CHECK (public.is_household_member(household_id));
CREATE POLICY "hh_budget_limits" ON public.budget_limits FOR ALL TO authenticated USING (public.is_household_member(household_id)) WITH CHECK (public.is_household_member(household_id));

-- Child tables (via parent join)
CREATE POLICY "hh_sub_tasks" ON public.sub_tasks FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND public.is_household_member(t.household_id))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND public.is_household_member(t.household_id))
);
CREATE POLICY "hh_recipe_ingredients" ON public.recipe_ingredients FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = recipe_id AND public.is_household_member(r.household_id))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = recipe_id AND public.is_household_member(r.household_id))
);
CREATE POLICY "hh_trip_packing_items" ON public.trip_packing_items FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND public.is_household_member(t.household_id))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND public.is_household_member(t.household_id))
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.groceries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shopping_list;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meal_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reminders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.family_members;
