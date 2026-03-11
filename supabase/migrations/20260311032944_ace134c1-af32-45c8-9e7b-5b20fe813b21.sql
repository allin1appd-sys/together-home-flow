
-- Step 1: Create all tables WITHOUT RLS policies first

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name text NOT NULL DEFAULT '',
  avatar_color text NOT NULL DEFAULT '#6366f1',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Households
CREATE TABLE public.households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'My Home',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Household members
CREATE TABLE public.household_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(household_id, user_id)
);

-- Family members
CREATE TABLE public.family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#6366f1',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tasks
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  due_date timestamptz,
  priority text NOT NULL DEFAULT 'medium',
  category text NOT NULL DEFAULT 'other',
  assigned_to text,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  is_recurring boolean NOT NULL DEFAULT false,
  recurrence_rule text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Sub-tasks
CREATE TABLE public.sub_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  is_completed boolean NOT NULL DEFAULT false
);

-- Groceries
CREATE TABLE public.groceries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit text,
  category text NOT NULL DEFAULT 'other',
  storage_location text NOT NULL DEFAULT 'pantry',
  purchase_date date NOT NULL DEFAULT CURRENT_DATE,
  expiration_date date,
  status text NOT NULL DEFAULT 'fresh',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Shopping list
CREATE TABLE public.shopping_list (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  category text NOT NULL DEFAULT 'other',
  is_purchased boolean NOT NULL DEFAULT false,
  estimated_price numeric,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Recipes
CREATE TABLE public.recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  instructions text NOT NULL DEFAULT '',
  prep_time integer NOT NULL DEFAULT 0,
  cook_time integer NOT NULL DEFAULT 0,
  servings integer NOT NULL DEFAULT 4,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Recipe ingredients
CREATE TABLE public.recipe_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  quantity text NOT NULL DEFAULT '',
  unit text
);

-- Meal plans
CREATE TABLE public.meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  meal_type text NOT NULL DEFAULT 'dinner',
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE SET NULL,
  custom_meal_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Reminders
CREATE TABLE public.reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  due_date timestamptz NOT NULL,
  is_checked boolean NOT NULL DEFAULT false,
  category text NOT NULL DEFAULT 'Custom',
  lead_days integer NOT NULL DEFAULT 0,
  repeat text NOT NULL DEFAULT 'none',
  snoozed_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Trips
CREATE TABLE public.trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  destination text NOT NULL DEFAULT '',
  start_date date NOT NULL,
  end_date date NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'vacation',
  status text NOT NULL DEFAULT 'upcoming',
  itinerary jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Trip packing items
CREATE TABLE public.trip_packing_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  is_packed boolean NOT NULL DEFAULT false
);

-- Maintenance tasks
CREATE TABLE public.maintenance_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  frequency_days integer NOT NULL DEFAULT 30,
  last_completed timestamptz,
  next_due date NOT NULL DEFAULT CURRENT_DATE,
  assigned_to text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Notes
CREATE TABLE public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  body text,
  color text NOT NULL DEFAULT 'yellow',
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Transactions
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'other',
  date date NOT NULL DEFAULT CURRENT_DATE,
  type text NOT NULL DEFAULT 'expense',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Budget limits
CREATE TABLE public.budget_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  limit_amount numeric NOT NULL DEFAULT 0,
  UNIQUE(household_id, category)
);
