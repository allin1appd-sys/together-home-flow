import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  category: z.enum(['cleaning', 'errands', 'repairs', 'kids', 'pets', 'cooking', 'shopping', 'other']),
  assignedTo: z.string().optional(),
});

export const grocerySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unit: z.string().max(50).optional(),
  category: z.string(),
  storageLocation: z.string(),
  expirationDate: z.string().optional(),
});

export const shoppingItemSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  quantity: z.number().int().min(1).default(1),
  category: z.string(),
  note: z.string().max(500).optional(),
  estimatedPrice: z.number().min(0).optional(),
});

export const reminderSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  category: z.string(),
  leadDays: z.number().int().min(0).max(30),
  repeat: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly']),
});

export const transactionSchema = z.object({
  description: z.string().trim().min(1, 'Description is required').max(200),
  amount: z.number().positive('Amount must be greater than 0'),
  category: z.string(),
  type: z.enum(['income', 'expense']),
});

export const tripSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  destination: z.string().trim().min(1, 'Destination is required').max(200),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  description: z.string().max(1000).optional(),
  category: z.string(),
  status: z.enum(['upcoming', 'active', 'completed']),
}).refine(data => data.endDate >= data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const recipeSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  instructions: z.string().max(5000).optional(),
  prepTime: z.number().int().min(0).default(0),
  cookTime: z.number().int().min(0).default(0),
  servings: z.number().int().min(1).default(4),
});

export const noteSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  body: z.string().max(5000).optional(),
});

export const maintenanceSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  frequencyDays: z.number().int().min(1, 'Frequency must be at least 1 day'),
  assignedTo: z.string().optional(),
  notes: z.string().max(1000).optional(),
});
