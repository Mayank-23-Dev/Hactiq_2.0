# Goal Tracker – Complete Design Specification

## Design System

- **Framework**: React + Vite + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: lucide-react (no emojis anywhere)
- **Theming**: Dark / Light mode toggle (shadcn default theme with CSS variables)
- **Responsiveness**: Desktop-first, mobile-friendly with collapsible sidebar on smaller screens

---

## Layout Structure

### Global Layout
┌─────────────────────────────────────────────────────────────────────┐
│ Sidebar (fixed width: 260px) │ Main Content Area (flex-grow) │
│ │ │
│ • Logo / App Name │ • Top Bar (greeting + date) │
│ • Navigation Links │ • Page content (dashboard │
│ • User Profile (avatar, name, email) │ or other views) │
│ • Theme Toggle (Sun/Moon) │ │
└─────────────────────────────────────────────────────────────────────┘

### Sidebar (`Sidebar.tsx`)

- **Logo**: "Goal Tracker" (text, no icon required) – using `h2` or `h3`
- **Navigation** (each item: icon + label, active state highlighted)
  - Dashboard (`LayoutDashboard`)
  - Today (`CalendarCheck2`)
  - Yesterday (`ArrowLeft`)
  - **Goal Board** (`Kanban`) – new date‑selectable board view
  - Boards (`Grid3x3`) – existing boards list (Product Roadmap, Bug Tracker, etc.)
  - Calendar (`Calendar`)
  - Stats (`BarChart3`)
  - All Goals (`ListChecks`)
  - Templates (`FileText`)
  - Streak Goals (`Flame`)
  - Settings (`Settings`)
- **Bottom section**:
  - User avatar (shadcn Avatar component) – placeholder image or initials
  - User name and email (e.g., "Alex Chen", "alex@company.co")
  - Theme toggle button (`Sun` / `Moon` icons) – `Button variant="ghost" size="icon"`

### Main Content Area

- **Top Bar** (inside main area, not part of sidebar)
  - Greeting: "Good morning, {user name}" – dynamic based on time of day
  - Current date: formatted as "Monday, June 15th, 2026" (using date-fns)
- **Page container**: `div` with padding `p-6`, max-width optional

---

## Today Dashboard (default view)

Two‑column layout on desktop (1 column on mobile):

### Left Column

#### Add New Goal Card (`Card`)

- **Header**: "Add New Goal" (`CardTitle`)
- **Form fields** (using shadcn components):

| Field | Component | Notes |
|-------|-----------|-------|
| Goal Title | `Input` + `Button` group | Input field with two buttons beside it: "Parse AI" (icon: `Sparkles`) and "Voice" (icon: `Mic`) |
| Example placeholder | `div` or `p` (optional) | Small muted text: "e.g., read 20 pages high priority learning" |
| Category + Suggest | `Select` + `Button` | Select dropdown (Health, Work, Personal, Learning, Other) + "Suggest" button (`Sparkles` icon) |
| Priority | `Select` | High / Medium / Low |
| Notes (Optional) | `Textarea` | Placeholder: "Add some context..." |
| Submit | `Button` | "Add Goal" – full width, variant="default" |

#### Today's Goals List

- **Header**: "Today's Goals" (`h3`)
- Each goal as a `Card` or `div` with:
  - Checkbox (`Checkbox` component) for completion toggle
  - Goal title (with optional strikethrough if completed)
  - Priority badge (`Badge` variant: High=destructive, Medium=warning, Low=success)
  - Category badge (`Badge` variant="secondary")
  - If goal belongs to streak: inline `Badge` variant="outline" with `Repeat` icon + "Streak"
  - Edit/delete icons (`Pencil`, `Trash2`) – optional
  - Notes preview (if exists) – small text or expandable

#### Goals Progress Card

- **Title**: "Goals Progress"
- **Text**: "Today's Progress: 0%" (dynamic)
- **Progress bar**: shadcn progress component or custom `div` with background fill

### Right Column

#### Your Boards Card (`Card`)

- **Header**: "Your Boards" + button "New Board" (`Button` variant="outline", size="sm", icon `Plus`)
- **List of boards** (each board as a clickable item or badge):
  - Product Roadmap
  - Bug Tracker
  - Marketing Campaign
  - etc. (stored in state, user can add)

#### Recent Activity Card (`Card`)

- **Header**: "Recent Activity"
- **Feed list** (each item: icon + action text + relative time):
  - Moved "Design new onboarding flow" to In Progress – Product Roadmap • 2 min ago
  - Created task "Fix login redirect bug" – Bug Tracker • 1 hr ago
  - Completed "Set up CI/CD pipeline" – Product Roadmap • 3 hrs ago
  - Added comment on "Homepage redesign" – Marketing Campaign • 5 hrs ago
  - Assigned "Memory leak in dashboard" to AC – Bug Tracker • Yesterday

#### Calendar Mini Preview (optional)

- Small month view showing current month with dots on days that have goals. Clicking opens full Calendar view or modal.

---

## 🆕 Goal Board by Date (`/goal-board`)

This is a **new dedicated view** that behaves like a dynamic board (Kanban or list) for any selected date. Any change made here (add, edit, delete, complete) **syncs globally** across Today, Yesterday, Calendar, and All Goals views.

### UI Components

- **Date Selector** (`Calendar` component or two `DatePicker` inputs)
  - Default: today's date
  - User picks any date (past, present, or future)
  - Displays goals for that exact date

- **Board Display** (two layout options, user can toggle):
  1. **List View** (default): Table or card list similar to Today dashboard
  2. **Kanban Board View**: Columns by status (To Do, In Progress, Done) – drag‑and‑drop optional but not required

- **Goal Cards** (same as Today dashboard):
  - Title, category badge, priority badge, completion checkbox, notes, edit/delete
  - Add new goal button for that specific date (pre‑fills the date field)

- **Bulk actions** (optional):
  - Copy all goals from this date to another date
  - Move selected goals to another date

- **Mood/Energy for selected date** – display and edit

### Behavior & Sync

- **When user adds/edits/deletes/toggles a goal in this board** → updates global `goals` state → immediately reflected in all other views (Today, Yesterday, Calendar, All Goals).
- **When user changes the selected date** → board reloads goals for that new date.
- **Persistent query param** (optional): `?date=2026-06-15` so user can share or bookmark a specific board date.

### Integration with Existing Features

- **Streak Goals**: If the selected date falls within an active streak range, the auto‑created goal appears here as well (with `Repeat` badge).
- **AI Briefing**: Not needed here, but AI features (natural language entry, auto‑categorization, decomposition) are available in the "Add Goal" form inside the board.
- **Templates**: Load template button works the same.

### Visual Example
┌─────────────────────────────────────────────────────────────┐
│ Goal Board [Date Picker] │
├─────────────────────────────────────────────────────────────┤
│ │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ To Do │ │ In Progress │ │ Done │ │
│ │ │ │ │ │ │ │
│ │ • Goal A │ │ • Goal C │ │ ✓ Goal E │ │
│ │ • Goal B │ │ │ │ ✓ Goal F │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ │
│ │
│ [+ Add Goal for this date] │
└─────────────────────────────────────────────────────────────┘

---

## Yesterday View (`/yesterday`)

- **Title**: "Yesterday's Goals" – date of yesterday
- **List of goals** (same card style as Today dashboard)
- **Each goal card** includes:
  - Completion checkbox (disabled? or can mark complete but that modifies historical data – better to allow editing)
  - "Carry Forward" button (`Button` variant="outline", size="sm", icon `ArrowRight`) – duplicates goal to today
  - "AI Suggest" button (`Button` variant="ghost", icon `Sparkles`) – calls Groq to advise rescheduling
- **Global action**: "Carry All Uncompleted" button (`Button` variant="default", icon `ArrowRightToLine`)

---

## Calendar View (`/calendar`)

- **Month navigation**: Prev / Next month buttons + "Today" button
- **Month grid**: 7 columns, 5-6 rows. Each day cell:
  - Day number (top)
  - Dot indicators (or small badge) showing number of goals on that day (e.g., 2 dots or "2")
  - Background shading for current day (light gray)
- **Click day**: Opens a `Sheet` or `Dialog` component showing:
  - List of goals for that day (with completion toggle, edit/delete)
  - Form to add a new goal for that specific day
  - Mood/Energy log for that day (editable)

---

## Stats View (`/stats`)

- **Streak counter**: Card showing current streak (e.g., "5 days" with `Flame` icon)
- **Today's completion rate**: Card with percentage and progress ring (optional)
- **Weekly summary chart**: Bar chart (recharts) – X-axis: days of last 7 days, Y-axis: count; bars for "Goals set" and "Goals completed"
- **Category breakdown chart**: Doughnut or pie chart (recharts) – completion percentage per category (Health, Work, etc.) for last 30 days
- **AI Coach button**: `Button` with `Sparkles` icon – "Ask AI Coach" – displays insights below (loading state, then text response)

---

## All Goals Database (`/database`)

- **Table** (shadcn `Table` component) with columns:
  - Date (YYYY-MM-DD)
  - Title
  - Category
  - Priority (badge)
  - Completed (checkbox or Yes/No)
  - Notes (truncated preview)
  - Actions (edit `Pencil`, delete `Trash2`)
- **Filtering bar**:
  - Category dropdown
  - Priority dropdown
  - Status (All, Completed, Pending)
  - Date range picker (two date inputs)
- **Pagination** (shadcn `Pagination` component)

---

## Templates Manager (`/templates`)

- **Header**: "Goal Templates" + "New Template" button (`Plus` icon)
- **List of templates** (cards or table):
  - Title, category, priority, notes (preview)
  - Edit / Delete buttons
- **Create / Edit modal**: Form fields same as Add Goal (no date, no completion)
- **Integration**: In Today dashboard and Goal Board, "Load from Template" dropdown next to form (Select component with template titles). Selecting pre‑fills the form.

---

## Streak Goals (`/streak-goals`)

- Header + "New Streak Goal" button (`Plus`)
- Grid of cards – each with title, category badge, priority badge, date range, progress bar, pause/play (`Pause`/`Play`), delete (`Trash2`)
- Create modal: `Dialog` with fields: title, category, priority, start date, end date, frequency (radio or select), custom days checkboxes (Sun‑Sat)
- Progress: `{completed}/{total} days ({percent}%)`

---

## Settings (`/settings`)

- **Tabs** (shadcn `Tabs` component): "General", "AI Integrations"
- **General**: (future options)
- **AI Integrations**:
  - Groq API Key input (`Input` type="password") + "Test Connection" button
  - Toggle switches (`Switch` component) for each AI feature (Natural Language, Voice, Auto‑Categorization, Briefing, Rescheduling, Auto‑Reflection, AI Coach, Smart Templates, Decomposition, Streak Prediction)
  - Save button

---

## Dark / Light Mode Implementation

- Use `next-themes` or custom `ThemeProvider` that adds/removes `dark` class on `<html>` element.
- Theme toggle button in sidebar: `Sun` / `Moon` icons, switching between themes.
- shadcn components automatically adapt via CSS variables.
- Tailwind config: `darkMode: "class"`.

---

## Component Guidelines (shadcn only)

- **Card**: `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`
- **Button**: variants – `default`, `outline`, `ghost`, `destructive`, `secondary`
- **Badge**: `Badge` with custom colors using className or variants
- **Dialog**: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`
- **Select**: `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`
- **Input**: `Input`
- **Textarea**: `Textarea`
- **Checkbox**: `Checkbox`
- **Switch**: `Switch`
- **Tabs**: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- **Progress**: `Progress` (or custom)
- **Avatar**: `Avatar`, `AvatarImage`, `AvatarFallback`
- **Table**: `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`, `TableHead`
- **Sheet / Dialog** for day details

---

## Icons (lucide-react) – No Emojis

| Feature | Icon |
|---------|------|
| Dashboard | `LayoutDashboard` |
| Today | `CalendarCheck2` |
| Yesterday | `ArrowLeft` |
| Goal Board (new) | `Kanban` |
| Boards (existing) | `Grid3x3` |
| Calendar | `Calendar` |
| Stats | `BarChart3` |
| All Goals | `ListChecks` |
| Templates | `FileText` |
| Streak Goals | `Flame` |
| Settings | `Settings` |
| Theme toggle | `Sun` / `Moon` |
| Add new | `Plus` |
| Edit | `Pencil` |
| Delete | `Trash2` |
| AI / Parse | `Sparkles` |
| Voice input | `Mic` |
| Carry forward | `ArrowRight` |
| Carry all | `ArrowRightToLine` |
| Repeat (streak badge) | `Repeat` |
| Pause | `Pause` |
| Play | `Play` |
| User avatar | `User` (fallback) |

---

## Accessibility & Behavior

- All interactive elements have proper `aria-label` or accessible text.
- Focus indicators visible (shadcn default ring).
- Toast notifications for actions (using `sonner` or shadcn toast).
- Confirmation dialogs for destructive actions (delete streak, delete template, delete goal).
- Loading states for AI calls (spinners inside buttons or skeleton loaders).

---

## Data Persistence

- `localStorage` with keys: `goals`, `streakGoals`, `templates`, `dailyMetadata`, `boards`, `recentActivity`, `groqApiKey`, `aiFeaturesConfig`.
- On app mount, load from localStorage; if empty, seed with example data.
- All state updates trigger immediate `localStorage.setItem`.

---
## Scroll Behavior

- **No forced scrollbar** – Vertical scrollbar appears only when content height exceeds viewport height.
- `html, body` styles: `overflow-x: hidden; overflow-y: auto; min-height: 100vh;`
- Main content area uses `min-height: calc(100vh - {header height})` to prevent unnecessary scroll on short pages.
- Sidebar independently scrollable if its content overflows, using `overflow-y: auto` on the sidebar container.
- All dialogs (`Dialog`, `Sheet`) use `overflow-y: auto` internally – no double scrollbars.
- No horizontal scroll on any viewport (responsive breakpoints prevent overflow).

This design.md ensures a consistent, modern, accessible UI using only shadcn components and lucide icons, with full dark/light theme support, and includes the **Goal Board by Date** feature that syncs changes globally.