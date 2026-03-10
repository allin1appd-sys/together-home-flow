

# HomeHub — MVP Implementation Plan

## Phase: Core MVP (UI-First with Mock Data)

We'll build 4 core modules with the full design system from Atelier Kanso, using local state and mock data. Backend (Supabase) will be wired up in a future phase.

---

### 1. Design System & App Shell
- Install **Plus Jakarta Sans** and **Source Serif 4** fonts
- Implement the full color palette (Warm Paper, Soft Sage, Charcoal, Stone, Amber, Terracotta Red, Moss Green) with light/dark mode
- Build the bottom tab bar with 5 tabs: **Home, Tasks, Groceries, Meals, Trips**
- "More" drawer for secondary modules (Shopping List, Reminders, Maintenance, Notes, Budget, Settings)
- Install **Framer Motion** for the signature "Settle" spring animation on all item additions
- Set up PWA manifest and service worker for installability
- Mobile-first layout optimized for 375–430px

### 2. Dashboard (Home Screen)
- Greeting with user name and today's date
- Today's meals summary (from meal plan mock data)
- Active tasks due today, sorted by priority
- Upcoming reminders (next 48 hours)
- Expiring groceries alert banner
- Next trip countdown banner
- Quick-action floating buttons: Add Task, Add Grocery, Add Reminder
- Card-based layout with generous whitespace

### 3. Task Manager
- Create tasks with title, description, due date, priority (low/medium/high/urgent), assigned member, category tags
- Sub-tasks / checklist within a task
- Recurring task configuration (daily, weekly, biweekly, monthly, custom)
- Filter & sort by category, assignee, priority, due date, status
- Bottom sheet for adding/editing tasks (no full-screen modals)
- Swipe-to-complete with graceful fade + strikethrough animation (no confetti)
- Completion history log

### 4. Grocery Inventory & Shopping List
- **Inventory view**: items with name, quantity, category, storage location, expiration date
- Color-coded status: green (fresh), amber (expiring soon), red (expired)
- "Used it" button to decrement/remove
- Auto-suggest expired/low items to Shopping List
- **Shopping List**: items grouped by aisle in horizontal-scrolling carousels (the convention break from the design brief)
- Check-off items → move to "Got It" section
- One-tap "Clear Completed"
- Bottom sheet for adding items

### 5. Weekly Meal Planner
- 7-day visual calendar grid (Mon–Sun)
- Slots for Breakfast, Lunch, Dinner, Snacks per day
- Tap slot to assign a meal name or pick from saved recipes
- Simple recipe library: name, ingredients, prep time, instructions, tags
- Drag-and-drop to rearrange meals
- "Copy last week" template feature
- Missing ingredients flagged against grocery inventory

---

### Design Details Applied Throughout
- **No gamification** — no streaks, badges, or confetti
- **Bottom sheets** for all add/edit flows, never full-screen modals
- **Settle animation** (Framer Motion spring) on every new item addition
- **Source Serif 4** for content/notes, **Plus Jakarta Sans** for all UI
- **Empty states** with friendly illustrations and clear CTAs
- **Dark mode** with Deep Slate (#1C2127) background

### What's Deferred to Future Phases
- Supabase backend, auth, real-time sync, and RLS
- Reminders with push notifications
- Trip planner (full itinerary, packing, budget)
- Home maintenance log, family notes board
- Budget tracker, smart insights
- Voice input, barcode scanner
- Multi-user profiles and activity feed
- Onboarding flow

