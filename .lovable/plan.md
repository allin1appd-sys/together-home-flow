

# Next Step: Dark Mode + Design Polish

The core modules are built. The highest-impact next chunk is adding dark mode support and polishing the design system, since these touch every screen and set the quality bar for everything else.

## What we'll build

### 1. Dark Mode with System Auto-Detection
- Add `next-themes` ThemeProvider (already installed) wrapping the app
- Add a theme toggle (sun/moon icon) in the dashboard header or a Settings page accessible from the "More" drawer
- System auto-detection by default, with manual override (light/dark/system)
- Dark theme variables are already defined in `index.css` — just need the class toggling

### 2. Settings Page (via More Drawer)
- New `/settings` route with a simple page containing:
  - Theme toggle (light / dark / system)
  - User name edit field (stored in zustand)
- Link it from the existing `MoreDrawer` component

### 3. Dashboard Quick-Action FABs
- Currently there's only one generic FAB. Expand to 3 contextual FABs:
  - Add Task (navigates to /tasks with sheet auto-open)
  - Add Grocery (navigates to /groceries)
  - Add Reminder (placeholder for now)
- Use a speed-dial pattern: tap main FAB to fan out options

### 4. Framer Motion "Settle" Animation Consistency
- Ensure all newly added items across Tasks, Groceries, Shopping List, and Meals use the same spring animation (`stiffness: 300, damping: 25`) — currently inconsistent between pages

### 5. Empty State Polish
- Add friendly empty states with icons + CTAs to all modules (some already exist, ensure consistency)
- Use `Source Serif 4` font for empty state messages

## Files to create/modify
- `src/components/ThemeProvider.tsx` — new, wraps app with next-themes
- `src/pages/Settings.tsx` — new settings page
- `src/App.tsx` — add ThemeProvider wrapper + Settings route
- `src/components/layout/MoreDrawer.tsx` — add Settings link
- `src/pages/Index.tsx` — improve FAB speed-dial
- `src/index.css` — add `html.dark` class support (already has `.dark` vars)
- Minor tweaks to Tasks, Groceries, Meals for animation consistency

