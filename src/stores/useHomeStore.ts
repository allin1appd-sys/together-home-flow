import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, GroceryItem, ShoppingListItem, MealPlan, Recipe, Reminder, Trip, MaintenanceTask } from '@/types';
import { addDays, format, subDays } from 'date-fns';

const today = format(new Date(), 'yyyy-MM-dd');
const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

const mockTasks: Task[] = [
  { id: '1', title: 'Vacuum living room', priority: 'medium', category: 'cleaning', isCompleted: false, isRecurring: false, subTasks: [], dueDate: today, createdAt: yesterday },
  { id: '2', title: 'Buy birthday gift for Mom', priority: 'high', category: 'errands', isCompleted: false, isRecurring: false, subTasks: [{ id: 's1', title: 'Research gift ideas', isCompleted: true }, { id: 's2', title: 'Order online', isCompleted: false }], dueDate: tomorrow, createdAt: yesterday },
  { id: '3', title: 'Fix leaky faucet', priority: 'urgent', category: 'repairs', isCompleted: false, isRecurring: false, subTasks: [], dueDate: today, createdAt: yesterday },
  { id: '4', title: 'Walk the dog', priority: 'medium', category: 'pets', isCompleted: true, completedAt: today, isRecurring: true, recurrenceRule: 'daily', subTasks: [], dueDate: today, createdAt: yesterday },
];

const mockGroceries: GroceryItem[] = [
  { id: 'g1', name: 'Milk', quantity: 1, unit: 'gallon', category: 'dairy', storageLocation: 'fridge', purchaseDate: subDays(new Date(), 5).toISOString(), expirationDate: addDays(new Date(), 2).toISOString(), status: 'expiring' },
  { id: 'g2', name: 'Eggs', quantity: 12, unit: 'count', category: 'dairy', storageLocation: 'fridge', purchaseDate: subDays(new Date(), 3).toISOString(), expirationDate: addDays(new Date(), 10).toISOString(), status: 'fresh' },
  { id: 'g3', name: 'Bread', quantity: 1, unit: 'loaf', category: 'bakery', storageLocation: 'pantry', purchaseDate: subDays(new Date(), 7).toISOString(), expirationDate: subDays(new Date(), 1).toISOString(), status: 'expired' },
  { id: 'g4', name: 'Chicken breast', quantity: 2, unit: 'lbs', category: 'meat', storageLocation: 'freezer', purchaseDate: subDays(new Date(), 2).toISOString(), expirationDate: addDays(new Date(), 30).toISOString(), status: 'fresh' },
  { id: 'g5', name: 'Spinach', quantity: 1, unit: 'bag', category: 'produce', storageLocation: 'fridge', purchaseDate: subDays(new Date(), 4).toISOString(), expirationDate: addDays(new Date(), 1).toISOString(), status: 'expiring' },
  { id: 'g6', name: 'Rice', quantity: 5, unit: 'lbs', category: 'other', storageLocation: 'pantry', purchaseDate: subDays(new Date(), 30).toISOString(), status: 'fresh' },
];

const mockShoppingList: ShoppingListItem[] = [
  { id: 'sl1', name: 'Bananas', quantity: 6, category: 'produce', isPurchased: false },
  { id: 'sl2', name: 'Greek yogurt', quantity: 2, category: 'dairy', isPurchased: false, estimatedPrice: 5.99 },
  { id: 'sl3', name: 'Olive oil', quantity: 1, category: 'other', isPurchased: true, note: 'Extra virgin' },
];

const mockRecipes: Recipe[] = [
  { id: 'r1', name: 'Grilled Chicken Salad', instructions: 'Grill chicken, toss with greens and dressing.', prepTime: 15, cookTime: 20, servings: 2, tags: ['healthy', 'quick'], ingredients: [{ id: 'ri1', name: 'Chicken breast', quantity: '2', unit: 'pieces' }, { id: 'ri2', name: 'Mixed greens', quantity: '4', unit: 'cups' }] },
  { id: 'r2', name: 'Pasta Carbonara', instructions: 'Cook pasta, mix with eggs, cheese, and pancetta.', prepTime: 10, cookTime: 15, servings: 4, tags: ['comfort', 'quick'], ingredients: [{ id: 'ri3', name: 'Spaghetti', quantity: '400', unit: 'g' }, { id: 'ri4', name: 'Eggs', quantity: '4' }] },
  { id: 'r3', name: 'Smoothie Bowl', instructions: 'Blend frozen fruit with yogurt, top with granola.', prepTime: 5, cookTime: 0, servings: 1, tags: ['breakfast', 'healthy'], ingredients: [{ id: 'ri5', name: 'Frozen berries', quantity: '1', unit: 'cup' }, { id: 'ri6', name: 'Yogurt', quantity: '1/2', unit: 'cup' }] },
];

const monday = format(addDays(new Date(), -new Date().getDay() + 1), 'yyyy-MM-dd');
const mockMealPlans: MealPlan[] = [
  { id: 'mp1', date: today, mealType: 'breakfast', customMealName: 'Smoothie Bowl' },
  { id: 'mp2', date: today, mealType: 'lunch', recipeId: 'r1', customMealName: 'Grilled Chicken Salad' },
  { id: 'mp3', date: today, mealType: 'dinner', recipeId: 'r2', customMealName: 'Pasta Carbonara' },
  { id: 'mp4', date: tomorrow, mealType: 'breakfast', customMealName: 'Oatmeal with fruit' },
];

const mockReminders: Reminder[] = [
  { id: 'rem1', title: 'Renew car insurance', dueDate: format(addDays(new Date(), 5), 'yyyy-MM-dd'), isChecked: false, category: 'Bills & Payments', leadDays: 3, repeat: 'yearly', createdAt: yesterday },
  { id: 'rem2', title: 'Schedule dentist appointment', dueDate: tomorrow, isChecked: false, category: 'Health & Medical', leadDays: 3, repeat: 'none', createdAt: yesterday },
  { id: 'rem3', title: 'Pay electricity bill', dueDate: today, isChecked: false, category: 'Bills & Payments', leadDays: 1, repeat: 'monthly', createdAt: yesterday },
  { id: 'rem4', title: 'Replace HVAC filter', dueDate: format(addDays(new Date(), 10), 'yyyy-MM-dd'), isChecked: false, category: 'Home Maintenance', leadDays: 7, repeat: 'none', createdAt: yesterday },
  { id: 'rem5', title: 'Netflix subscription renewal', dueDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'), isChecked: false, category: 'Subscriptions', leadDays: 1, repeat: 'monthly', createdAt: yesterday },
];

const mockTrips: Trip[] = [
  { id: 'trip1', title: 'Beach Weekend', destination: 'Santa Monica', startDate: format(addDays(new Date(), 5), 'yyyy-MM-dd'), endDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'), description: 'Relaxing weekend at the beach', category: 'weekend getaway', status: 'upcoming' },
];

interface HomeStore {
  tasks: Task[];
  groceries: GroceryItem[];
  shoppingList: ShoppingListItem[];
  mealPlans: MealPlan[];
  recipes: Recipe[];
  reminders: Reminder[];
  trips: Trip[];
  userName: string;
  addTask: (task: Task) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (task: Task) => void;
  toggleSubTask: (taskId: string, subTaskId: string) => void;
  addGrocery: (item: GroceryItem) => void;
  removeGrocery: (id: string) => void;
  decrementGrocery: (id: string) => void;
  addShoppingItem: (item: ShoppingListItem) => void;
  toggleShoppingItem: (id: string) => void;
  clearCompletedShopping: () => void;
  addMealPlan: (plan: MealPlan) => void;
  removeMealPlan: (id: string) => void;
  updateMealPlan: (id: string, updates: Partial<MealPlan>) => void;
  copyLastWeekMeals: (currentWeekStart: string) => void;
  addRecipe: (recipe: Recipe) => void;
  removeRecipe: (id: string) => void;
  toggleReminder: (id: string) => void;
  addReminder: (reminder: Reminder) => void;
  updateReminder: (reminder: Reminder) => void;
  deleteReminder: (id: string) => void;
  snoozeReminder: (id: string, until: string) => void;
  setUserName: (name: string) => void;
  suggestToShoppingList: (groceryId: string) => void;
  removeShoppingItem: (id: string) => void;
  addTrip: (trip: Trip) => void;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
}

export const useHomeStore = create<HomeStore>()(persist((set) => ({
  tasks: mockTasks,
  groceries: mockGroceries,
  shoppingList: mockShoppingList,
  mealPlans: mockMealPlans,
  recipes: mockRecipes,
  reminders: mockReminders,
  trips: mockTrips,
  userName: 'Alex',

  addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),
  toggleTask: (id) => set((s) => ({
    tasks: s.tasks.map((t) => t.id === id ? { ...t, isCompleted: !t.isCompleted, completedAt: !t.isCompleted ? new Date().toISOString() : undefined } : t),
  })),
  deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
  updateTask: (task) => set((s) => ({ tasks: s.tasks.map((t) => t.id === task.id ? task : t) })),
  toggleSubTask: (taskId, subTaskId) => set((s) => ({
    tasks: s.tasks.map((t) => t.id === taskId ? { ...t, subTasks: t.subTasks.map((st) => st.id === subTaskId ? { ...st, isCompleted: !st.isCompleted } : st) } : t),
  })),
  addGrocery: (item) => set((s) => ({ groceries: [item, ...s.groceries] })),
  removeGrocery: (id) => set((s) => ({ groceries: s.groceries.filter((g) => g.id !== id) })),
  decrementGrocery: (id) => set((s) => ({
    groceries: s.groceries.map((g) => g.id === id ? { ...g, quantity: Math.max(0, g.quantity - 1) } : g).filter((g) => g.quantity > 0),
  })),
  addShoppingItem: (item) => set((s) => ({ shoppingList: [item, ...s.shoppingList] })),
  toggleShoppingItem: (id) => set((s) => ({
    shoppingList: s.shoppingList.map((i) => i.id === id ? { ...i, isPurchased: !i.isPurchased } : i),
  })),
  clearCompletedShopping: () => set((s) => ({ shoppingList: s.shoppingList.filter((i) => !i.isPurchased) })),
  addMealPlan: (plan) => set((s) => ({ mealPlans: [...s.mealPlans, plan] })),
  removeMealPlan: (id) => set((s) => ({ mealPlans: s.mealPlans.filter((m) => m.id !== id) })),
  updateMealPlan: (id, updates) => set((s) => ({
    mealPlans: s.mealPlans.map((m) => m.id === id ? { ...m, ...updates } : m),
  })),
  copyLastWeekMeals: (currentWeekStart) => set((s) => {
    const start = new Date(currentWeekStart + 'T12:00');
    const prevStart = subDays(start, 7);
    const lastWeekMeals = s.mealPlans.filter((m) => {
      const d = new Date(m.date + 'T12:00');
      return d >= prevStart && d < start;
    });
    const newMeals: MealPlan[] = [];
    lastWeekMeals.forEach((m) => {
      const newDate = format(addDays(new Date(m.date + 'T12:00'), 7), 'yyyy-MM-dd');
      const exists = s.mealPlans.some((e) => e.date === newDate && e.mealType === m.mealType);
      if (!exists) {
        newMeals.push({ ...m, id: `mp-${Date.now()}-${Math.random()}`, date: newDate });
      }
    });
    return { mealPlans: [...s.mealPlans, ...newMeals] };
  }),
  addRecipe: (recipe) => set((s) => ({ recipes: [...s.recipes, recipe] })),
  removeRecipe: (id) => set((s) => ({ recipes: s.recipes.filter((r) => r.id !== id) })),
  toggleReminder: (id) => set((s) => ({
    reminders: s.reminders.map((r) => r.id === id ? { ...r, isChecked: !r.isChecked } : r),
  })),
  addReminder: (reminder) => set((s) => ({ reminders: [reminder, ...s.reminders] })),
  updateReminder: (reminder) => set((s) => ({ reminders: s.reminders.map((r) => r.id === reminder.id ? reminder : r) })),
  deleteReminder: (id) => set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),
  snoozeReminder: (id, until) => set((s) => ({
    reminders: s.reminders.map((r) => r.id === id ? { ...r, snoozedUntil: until } : r),
  })),
  setUserName: (name) => set({ userName: name }),
  suggestToShoppingList: (groceryId) => set((s) => {
    const grocery = s.groceries.find((g) => g.id === groceryId);
    if (!grocery) return s;
    const alreadyExists = s.shoppingList.some((i) => i.name.toLowerCase() === grocery.name.toLowerCase());
    if (alreadyExists) return s;
    const newItem: ShoppingListItem = {
      id: `sl-${Date.now()}`,
      name: grocery.name,
      quantity: grocery.quantity,
      category: grocery.category,
      isPurchased: false,
    };
    return { shoppingList: [newItem, ...s.shoppingList] };
  }),
  removeShoppingItem: (id) => set((s) => ({ shoppingList: s.shoppingList.filter((i) => i.id !== id) })),
  addTrip: (trip) => set((s) => ({ trips: [trip, ...s.trips] })),
  updateTrip: (trip) => set((s) => ({ trips: s.trips.map((t) => t.id === trip.id ? trip : t) })),
  deleteTrip: (id) => set((s) => ({ trips: s.trips.filter((t) => t.id !== id) })),
}), { name: 'homehub-store' }));
