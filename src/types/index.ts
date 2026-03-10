export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskCategory = 'cleaning' | 'errands' | 'repairs' | 'kids' | 'pets' | 'cooking' | 'shopping' | 'other';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type StorageLocation = 'fridge' | 'pantry' | 'freezer' | 'bathroom' | 'cleaning';
export type GroceryStatus = 'fresh' | 'expiring' | 'expired';
export type ShoppingCategory = 'produce' | 'dairy' | 'meat' | 'bakery' | 'frozen' | 'beverages' | 'snacks' | 'cleaning' | 'personal-care' | 'other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: Priority;
  category: TaskCategory;
  assignedTo?: string;
  isCompleted: boolean;
  completedAt?: string;
  isRecurring: boolean;
  recurrenceRule?: string;
  subTasks: SubTask[];
  createdAt: string;
}

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  category: ShoppingCategory;
  storageLocation: StorageLocation;
  purchaseDate: string;
  expirationDate?: string;
  status: GroceryStatus;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  note?: string;
  category: ShoppingCategory;
  isPurchased: boolean;
  estimatedPrice?: number;
}

export interface MealPlan {
  id: string;
  date: string;
  mealType: MealType;
  recipeId?: string;
  customMealName?: string;
}

export interface Recipe {
  id: string;
  name: string;
  instructions: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  tags: string[];
  ingredients: RecipeIngredient[];
}

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity: string;
  unit?: string;
}

export type ReminderRepeat = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ReminderCategory = 'Bills & Payments' | 'Health & Medical' | 'Home Maintenance' | 'Subscriptions' | 'Documents & Renewals' | 'Custom';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  isChecked: boolean;
  category: ReminderCategory;
  leadDays: number;
  repeat: ReminderRepeat;
  snoozedUntil?: string;
  createdAt: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  description?: string;
  category: string;
  status: 'upcoming' | 'active' | 'completed';
}
