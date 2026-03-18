

## Multi-Language Support (English, Arabic, Hebrew)

### Overview
Add full internationalization (i18n) to HomeHub with support for **English** (default), **Arabic**, and **Hebrew**. Since Arabic and Hebrew are RTL (right-to-left) languages, the app layout must also flip direction dynamically.

### Architecture

**Library**: `i18next` + `react-i18next` — the most widely used React i18n solution. Lightweight, supports JSON translation files, and integrates cleanly with the existing stack.

**Language files structure**:
```text
src/
  i18n/
    index.ts              ← i18n initialization
    locales/
      en.json             ← English translations
      ar.json             ← Arabic translations
      he.json             ← Hebrew translations
```

### What gets translated

Every hardcoded string across 14+ pages and 10+ components:

- **PhoneSignup** — "Welcome to HomeHub", "Phone Number", "4-Digit PIN", form labels, error messages
- **Onboarding** — "Welcome to HomeHub", feature names & descriptions, "Get Started"
- **Dashboard (Index)** — greeting ("Good morning"), card titles ("Tasks Due Today", "Today's Meals", "This Month's Budget"), speed dial labels
- **Bottom Tab Bar** — Home, Tasks, Groceries, Meals, Trips, More
- **More Drawer** — Shopping List, Reminders, Maintenance, Notes, Budget, Settings
- **Tasks page** — headers, empty states, priority labels, form fields
- **Groceries page** — all labels and statuses
- **Meals page** — meal types (breakfast, lunch, dinner, snack), headers
- **Trips, Shopping, Reminders, Maintenance, Notes, Budget pages** — all headers, empty states, form labels, action buttons
- **Settings** — Profile, Household, Notifications, Appearance, Family Members, Invite Family sections
- **Shared components** — ConfirmDialog, EmptyState, DatePicker, PullToRefresh
- **Toast messages** — all success/error notifications via `sonner`

### RTL Support

Arabic and Hebrew require RTL layout:
1. Dynamically set `dir="rtl"` and `lang` attribute on the `<html>` element when language changes
2. Update Tailwind config to enable `rtl:` variant (via `tailwindcss-rtl` plugin or Tailwind's built-in logical properties)
3. Replace directional CSS (e.g., `ml-2` → `ms-2`, `pl-4` → `ps-4`, `left-0` → `start-0`) across components — Tailwind v3+ supports logical properties like `ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`

### Language Selector

- Add a **Language** card in **Settings.tsx** (between Appearance and Sign Out) with 3 options: English, العربية, עברית
- Store selected language in `localStorage` (key: `homehub_language`) so it persists across sessions
- On app load, `i18n` reads from localStorage and applies the correct language + direction

### Implementation Steps

1. **Install dependencies**: `i18next`, `react-i18next`, `i18next-browser-languagedetector`
2. **Create translation files**: `en.json`, `ar.json`, `he.json` with all app strings organized by page/feature namespace
3. **Initialize i18n**: Configure in `src/i18n/index.ts`, import in `main.tsx`
4. **Create a `useDirection` hook**: Sets `document.documentElement.dir` and `lang` based on current language
5. **Replace all hardcoded strings**: Use `useTranslation()` hook's `t()` function across all pages and components
6. **Convert directional Tailwind classes to logical properties**: `ml` → `ms`, `mr` → `me`, `pl` → `ps`, `pr` → `pe`, `left` → `start`, `right` → `end`, `text-left` → `text-start`, `text-right` → `text-end`
7. **Add language selector UI** in Settings page
8. **Handle date formatting**: Use locale-aware formatting with `date-fns` locales (`ar`, `he`)

### Estimated Scope

- ~3 translation files with ~200 keys each
- ~20 files modified (all pages + key components)
- Settings page gets a new Language section

