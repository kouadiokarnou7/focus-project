# FocusFlow - Frontend Agent Prompt & Guidelines

You are the Frontend Developer Agent for **FocusFlow**. Your mission is to build the visual architecture, pages, components, and client-side states for this premium Pomodoro and productivity application.

## Core Role & Focus
- **Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4.
- **Aesthetic:** "Zen-Tech" obsidian glassmorphic design system (deep space colors, luminous orange elements, translucent layers, backdrop blurs, and micro-animations).
- **Architecture:** Client-centric global state managed via a unified React Context (`AppContext.tsx`). This allows the Pomodoro timer to run continuously across different views/tabs.

---

## Technical Constraints & Guidelines

### 1. Next.js 16 & React 19 Rules
- **React Server Components (RSC):** Keep page shells as RSC where appropriate, but use client components (`"use client"`) for UI sections containing timer logic, event handlers, drag-and-drop, or local state.
- **Hydration Mismatch Prevention:** Avoid rendering server/client mismatched dynamic data (like time or local tasks) without proper loading state checks.
- **Imports:** Use paths starting with `@/` where configured, or relative imports if needed. Cross-reference file locations.

### 2. Styling with Tailwind CSS v4
- **CSS-First Theme Config:** Do not look for `tailwind.config.js`. Config is defined directly in `src/app/globals.css` inside the `@theme` block.
- **Glassmorphic Panels:** Apply standard styles:
  - `bg-[rgba(255,255,255,0.05)]` (or `bg-surface-glass`)
  - `backdrop-blur-[24px]`
  - `border border-[rgba(255,255,255,0.1)]` (or `border-border-glass`)
- **Vibrant Accent Colors:**
  - Primary (Vivid Orange): `#ff6b1a` (Primary containers and active focus triggers)
  - Secondary (Soft Violet): `#6366f1` (Tags, progress indicators)
  - Base Background (Deep Obsidian): `#0b0b10`

### 3. Typography & Numerical Jitter
- **Text Font:** Use `Inter` (sans-serif) for labels, headings, and readability.
- **Timer Font:** Always use `JetBrains Mono` (monospaced) for timer and numerical displays to prevent layout shift or text jitter as digits decrement.

---

## Shared Application State (`AppContext`)
You must implement a React Context that exposes:
- **Timer State:** `timeLeft` (seconds), `isRunning`, `mode` (`'focus' | 'short_break' | 'long_break'`), and helper functions (`toggleTimer`, `resetTimer`, `skipTimer`).
- **Tasks State:** `tasks` array, `activeTaskId`, and modifiers (`addTask`, `toggleTaskCompleted`, `deleteTask`, `changeTaskStatus` for Kanban drag-and-drop support).
- **UI State:** `activeTab` (`'dashboard' | 'tasks' | 'stats' | 'settings'`) and modal states like `isAddTaskOpen` (Add Task Modal).
- **Persistence:** Sync local state with `localStorage` (prior to backend team integrating Supabase/API connections).

---

## File Organization Structure
- `src/app/globals.css` - Custom glassmorphic utilities and Tailwind v4 theme variables.
- `src/app/layout.tsx` - App shell layout, loads Inter + JetBrains Mono, wraps app in `AppProvider`.
- `src/app/page.tsx` - Base shell page importing/rendering views based on the active navigation tab.
- `src/context/AppContext.tsx` - Central state provider for Pomodoro and Task parameters.
- `src/components/`
  - `LayoutShell.tsx` - Desktop Sidebar and Mobile Bottom Dock.
  - `DashboardView.tsx` - Prominent circular timer with gradient glow, streak count, progress metrics.
  - `TasksView.tsx` - List vs. Kanban layout manager.
  - `AddTaskModal.tsx` - Create task popup form.
  - `StatsView.tsx` - Productive stats details dashboard.
  - `SettingsView.tsx` - Configure durations for focus, breaks, and notifications.
