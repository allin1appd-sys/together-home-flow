

# Frontend Completion Plan

Based on the status report, the frontend is ~90% done. Here are the remaining items and the plan to build them.

## What's Left

### 1. Family Member Management (Settings)
Add a "Family Members" card to Settings where users can add/remove household members with name and avatar color. Store in Zustand. Use these members in `assignedTo` dropdowns on Tasks and Maintenance pages instead of free-text input.

**Files**: `src/types/index.ts` (add `FamilyMember`), `src/stores/useHomeStore.ts` (add `familyMembers` array + CRUD), `src/pages/Settings.tsx` (add Family Members card with inline add/remove), `src/pages/Tasks.tsx` and `src/components/tasks/TaskSheet.tsx` (swap assignedTo text input for a Select of family members), `src/pages/Maintenance.tsx` (same Select swap).

### 2. Onboarding / First-Run Flow
Show a welcome screen when `userName` is still the default "Alex" and there's no `onboardingComplete` flag. A simple multi-step bottom sheet: enter name → brief feature overview → done. Sets `onboardingComplete: true` in the store.

**Files**: `src/components/onboarding/OnboardingSheet.tsx` (new), `src/stores/useHomeStore.ts` (add `onboardingComplete` flag), `src/pages/Index.tsx` (trigger sheet on mount if not completed).

### 3. Empty States
Add friendly empty-state illustrations (icon + message + CTA button) to pages that don't already handle zero-data gracefully. Audit each page and add where missing.

**Files**: Touch each page file that lacks an empty state fallback (most already have them based on the code — will verify and patch any gaps).

### 4. Polish & Edge Cases
- Add confirmation dialogs for destructive actions (delete trip, delete task, etc.) using AlertDialog
- Shopping list item editing (tap to edit name/quantity)
- Better form validation feedback on required fields

**Files**: Various page files, potentially a shared `ConfirmDialog` component.

## Execution Order

1. **Family members** — new type, store update, Settings UI, then wire into Task/Maintenance selects
2. **Onboarding** — new sheet component, store flag, trigger from dashboard
3. **Empty states** — audit and patch
4. **Polish** — confirmation dialogs, edit flows, validation

All changes stay within the existing Zustand + localStorage pattern. No backend needed for these.

