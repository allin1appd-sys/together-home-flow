

# HomeHub MVP — Progress & Remaining Work

## What's Done
1. App Shell — bottom tab bar, More drawer, routing
2. Dashboard — greeting, today's meals, tasks, reminders, expiring groceries, trip countdown, speed-dial FAB
3. Task Manager — CRUD, priority/category filters, sub-tasks, completion toggle
4. Grocery Inventory — add/remove items, expiration status, storage location filter, "Used it" decrement
5. Shopping List — add items, check-off, clear completed
6. Meal Planner — 7-day grid, meal slots, recipe library, add/remove meals
7. Trips — read-only trip cards with countdown
8. Settings — theme toggle (light/dark/system), user name edit
9. Dark mode — system auto-detection via next-themes
10. Zustand store with mock data

## Remaining Work (ordered by priority)

### Phase A — Polish Existing Modules
| # | Task | Effort |
|---|------|--------|
| A1 | **Task Manager polish** — swipe-to-complete gesture, task editing (tap to edit in bottom sheet), recurring task UI, completion history view | Medium |
| A2 | **Grocery & Shopping polish** — auto-suggest low/expired items to shopping list, horizontal aisle-grouped carousels in shopping list, estimated cost total | Medium |
| A3 | **Meal Planner polish** — drag-and-drop meals between slots, "copy last week" button, missing ingredients check vs inventory | Medium |
| A4 | **Trips module** — add/edit trips bottom sheet, trip CRUD in store | Small |

### Phase B — New Modules
| # | Task | Effort |
|---|------|--------|
| B1 | **Reminders module** — dedicated page, categories, snooze options, repeat rules, check-off confirmation | Medium |
| B2 | **Home Maintenance Log** — recurring home tasks, frequency tracking, next-due auto-calculation | Medium |
| B3 | **Family Notes & Shared Board** — pinnable notes with color labels | Small |
| B4 | **Budget Tracker** — spending log, monthly category breakdown charts, budget progress bars | Medium |

### Phase C — Advanced Features
| # | Task | Effort |
|---|------|--------|
| C1 | **Supabase backend** — database schema, auth, RLS, real-time sync | Large |
| C2 | **Multi-user profiles** — family members, role-based access, activity feed | Large |
| C3 | **Push notifications** — browser notifications for reminders & expiring items | Medium |
| C4 | **PWA service worker** — offline caching, background sync | Medium |
| C5 | **Onboarding flow** — 3-step guided setup | Small |
| C6 | **Smart insights** — weekly summary, waste reduction nudges | Medium |
| C7 | **Voice input** — floating mic button, speech-to-text quick-add | Small |
| C8 | **Barcode scanner** — camera-based grocery quick-add via Open Food Facts | Medium |

---

## Recommended Next Step: A1 — Task Manager Polish

This is the most-used module and will benefit most from interaction polish.

### What we'll build
1. **Swipe-to-complete** — horizontal swipe gesture on task cards using Framer Motion's `drag="x"` with a green check reveal underneath; on release past threshold, mark complete with fade-out animation
2. **Tap-to-edit** — tapping a task opens the existing bottom sheet pre-filled with task data for editing; add `updateTask` usage
3. **Task description field** — add optional description to the add/edit sheet
4. **Sub-task creation** — ability to add sub-tasks inline in the add/edit sheet
5. **Completion history** — a new section/tab showing completed tasks with timestamps, grouped by date

### Files to modify
- `src/pages/Tasks.tsx` — swipe gesture, edit mode, description field, sub-task creation, history view
- `src/stores/useHomeStore.ts` — no changes needed (updateTask already exists)

