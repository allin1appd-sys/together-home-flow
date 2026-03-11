import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, GroceryItem, ShoppingListItem, MealPlan, Recipe, Reminder, Trip, MaintenanceTask, Note, Transaction, BudgetLimit, FamilyMember } from '@/types';
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
  { id: 'trip1', title: 'Beach Weekend', destination: 'Santa Monica', startDate: format(addDays(new Date(), 5), 'yyyy-MM-dd'), endDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'), description: 'Relaxing weekend at the beach', category: 'weekend getaway', status: 'upcoming', itinerary: [], packingList: [{ id: 'pk1', name: 'Sunscreen', isPacked: false }, { id: 'pk2', name: 'Swimsuit', isPacked: true }] },
];

const mockMaintenanceTasks: MaintenanceTask[] = [
  { id: 'mt1', title: 'Replace HVAC filter', frequencyDays: 90, lastCompleted: format(subDays(new Date(), 95), 'yyyy-MM-dd'), nextDue: format(subDays(new Date(), 5), 'yyyy-MM-dd'), assignedTo: 'Alex', createdAt: yesterday },
  { id: 'mt2', title: 'Pest control spray', frequencyDays: 180, lastCompleted: format(subDays(new Date(), 160), 'yyyy-MM-dd'), nextDue: format(addDays(new Date(), 20), 'yyyy-MM-dd'), createdAt: yesterday },
  { id: 'mt3', title: 'Deep clean kitchen', frequencyDays: 30, lastCompleted: format(subDays(new Date(), 28), 'yyyy-MM-dd'), nextDue: format(addDays(new Date(), 2), 'yyyy-MM-dd'), assignedTo: 'Jordan', createdAt: yesterday },
  { id: 'mt4', title: 'Clean gutters', frequencyDays: 180, lastCompleted: format(subDays(new Date(), 50), 'yyyy-MM-dd'), nextDue: format(addDays(new Date(), 130), 'yyyy-MM-dd'), createdAt: yesterday },
];

const mockNotes: Note[] = [
  { id: 'note1', title: 'WiFi Password', body: 'Network: HomeHub5G\nPassword: sunshine2024!', color: 'blue', isPinned: true, createdAt: yesterday, updatedAt: yesterday },
  { id: 'note2', title: 'Grocery run Saturday', body: 'Don\'t forget the farmers market closes at 1pm', color: 'green', isPinned: false, createdAt: yesterday, updatedAt: yesterday },
  { id: 'note3', title: 'Plumber visit', body: 'Tuesday 10am — Mike\'s Plumbing (555-0123)', color: 'orange', isPinned: true, createdAt: yesterday, updatedAt: yesterday },
  { id: 'note4', title: 'Movie night picks', body: '• The Grand Budapest Hotel\n• Spirited Away\n• Knives Out', color: 'purple', isPinned: false, createdAt: yesterday, updatedAt: yesterday },
  { id: 'note5', title: 'Return Amazon package', color: 'pink', isPinned: false, createdAt: yesterday, updatedAt: yesterday },
];

const mockTransactions: Transaction[] = [
  { id: 'txn1', description: 'Rent', amount: 1800, category: 'housing', date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), type: 'expense' },
  { id: 'txn2', description: 'Salary', amount: 4500, category: 'other', date: format(subDays(new Date(), 5), 'yyyy-MM-dd'), type: 'income' },
  { id: 'txn3', description: 'Groceries', amount: 127.50, category: 'food', date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), type: 'expense' },
  { id: 'txn4', description: 'Electric bill', amount: 85, category: 'utilities', date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), type: 'expense' },
  { id: 'txn5', description: 'Movie tickets', amount: 32, category: 'entertainment', date: today, type: 'expense' },
  { id: 'txn6', description: 'Gas', amount: 55, category: 'transport', date: format(subDays(new Date(), 4), 'yyyy-MM-dd'), type: 'expense' },
];

const mockBudgetLimits: BudgetLimit[] = [
  { category: 'food', limit: 500 },
  { category: 'entertainment', limit: 150 },
  { category: 'transport', limit: 200 },
  { category: 'utilities', limit: 200 },
];

interface HomeStore {
  tasks: Task[];
  groceries: GroceryItem[];
  shoppingList: ShoppingListItem[];
  mealPlans: MealPlan[];
  recipes: Recipe[];
  reminders: Reminder[];
  trips: Trip[];
  maintenanceTasks: MaintenanceTask[];
  notes: Note[];
  transactions: Transaction[];
  budgetLimits: BudgetLimit[];
  userName: string;
  familyMembers: FamilyMember[];
  onboardingComplete: boolean;
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
  addMaintenanceTask: (task: MaintenanceTask) => void;
  updateMaintenanceTask: (task: MaintenanceTask) => void;
  deleteMaintenanceTask: (id: string) => void;
  completeMaintenanceTask: (id: string) => void;
  addNote: (note: Note) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  toggleNotePin: (id: string) => void;
  addTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  updateBudgetLimit: (category: string, limit: number) => void;
  addFamilyMember: (member: FamilyMember) => void;
  removeFamilyMember: (id: string) => void;
  setOnboardingComplete: (val: boolean) => void;
}

export const useHomeStore = create<HomeStore>()(persist((set) => ({
  tasks: mockTasks,
  groceries: mockGroceries,
  shoppingList: mockShoppingList,
  mealPlans: mockMealPlans,
  recipes: mockRecipes,
  reminders: mockReminders,
  trips: mockTrips,
  maintenanceTasks: mockMaintenanceTasks,
  notes: mockNotes,
  transactions: mockTransactions,
  budgetLimits: mockBudgetLimits,
  userName: 'Alex',
  familyMembers: [
    { id: 'fm1', name: 'Alex', color: 'hsl(220, 70%, 55%)' },
    { id: 'fm2', name: 'Jordan', color: 'hsl(340, 70%, 55%)' },
  ],
  onboardingComplete: false,

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
  addMaintenanceTask: (task) => set((s) => ({ maintenanceTasks: [task, ...s.maintenanceTasks] })),
  updateMaintenanceTask: (task) => set((s) => ({ maintenanceTasks: s.maintenanceTasks.map((t) => t.id === task.id ? task : t) })),
  deleteMaintenanceTask: (id) => set((s) => ({ maintenanceTasks: s.maintenanceTasks.filter((t) => t.id !== id) })),
  completeMaintenanceTask: (id) => set((s) => ({
    maintenanceTasks: s.maintenanceTasks.map((t) => {
      if (t.id !== id) return t;
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      return { ...t, lastCompleted: todayStr, nextDue: format(addDays(new Date(), t.frequencyDays), 'yyyy-MM-dd') };
    }),
  })),
  addNote: (note) => set((s) => ({ notes: [note, ...s.notes] })),
  updateNote: (note) => set((s) => ({ notes: s.notes.map((n) => n.id === note.id ? note : n) })),
  deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
  toggleNotePin: (id) => set((s) => ({
    notes: s.notes.map((n) => n.id === id ? { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() } : n),
  })),
  addTransaction: (transaction) => set((s) => ({ transactions: [transaction, ...s.transactions] })),
  deleteTransaction: (id) => set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
  updateBudgetLimit: (category, limit) => set((s) => {
    const existing = s.budgetLimits.find((b) => b.category === category);
    if (existing) {
      return { budgetLimits: s.budgetLimits.map((b) => b.category === category ? { ...b, limit } : b) };
    }
    return { budgetLimits: [...s.budgetLimits, { category: category as any, limit }] };
  }),
  addFamilyMember: (member) => set((s) => ({ familyMembers: [...s.familyMembers, member] })),
  removeFamilyMember: (id) => set((s) => ({ familyMembers: s.familyMembers.filter((m) => m.id !== id) })),
  setOnboardingComplete: (val) => set({ onboardingComplete: val }),
}), { name: 'homehub-store' }));
