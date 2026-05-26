# Implementation Plan: Supabase Backend Integration

This plan outlines the steps to move the **LATNOVVA ServiceTool** from its current local-only state (persisted in browser localStorage) to a centralized, production-ready **Supabase** backend.

## User Review Required

> [!IMPORTANT]
> **Data Migration Strategy**: I will create a script to push your current 133 projects and personnel into Supabase. You will need to run this once to ensure your live database matches your current environment.
> 
> **Offline Support**: The current PWA uses Zustand persistence. We will maintain this as a cache layer, but the primary source of truth will move to the cloud.

## Proposed Changes

### 1. Infrastructure (Core Client)
- **[NEW] `src/lib/supabase.ts`**: Initialize the Supabase client using the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your `.env`.

### 2. Authentication & Protected Routes
- **[NEW] `src/components/auth/Login.tsx`**: Create a premium login component for email/password authentication via Supabase.
- **[NEW] `src/components/auth/AuthRoute.tsx`**: A protected route wrapper to ensure only authenticated users access core modules.
- **[MODIFY] `src/store/useStore.ts`**: Sync the currently logged-in Supabase user with the store state.

### 3. Data Migration
- **[NEW] `src/scripts/seedSupabase.ts`**: A one-time utility to take all data currently in `mockData.ts` and upsert it into your new Supabase tables. This ensures your 133 projects are available immediately.

### 3. Store Integration (`src/store/useStore.ts`)
- **[MODIFY] `initDb`**: Update this function to perform an initial `SELECT` from Supabase for all core entities (Projects, Clients, Personnel, Reports, Timesheets).
- **[MODIFY] Actions**: Update the following actions to be `async` and perform Supabase mutations:
    - `addProject` / `updateProject`
    - `addReport` / `updateReport`
    - `addPersonnel` / `updatePersonnel`
    - `clockPunch` / `addTimesheet`
- **[NEW] Error Handling**: Add a global `isSyncing` or `error` state to the store to handle network issues.

### 4. Components
- **[MODIFY] `src/App.tsx`**: Wrap relevant routes in the `AuthRoute` and ensure `initDb` is called on mount for authenticated users.

---

## Open Questions

- **Auth Method**: Magic Link or Email/Password? Magic Link is often smoother for field personnel.
- **Initial User Base**: Should the migration script also create Supabase Auth accounts for the 25 current mock personnel?

## Verification Plan

### Automated/Manual Tests
- **Data Integrity**: Verify that the 133 projects loaded from Supabase match exactly with the current UI display.
- **Persistence**: Create a report, refresh the page, and ensure it is fetched from the database correctly.
- **Real-time**: If possible, open the app in two windows and verify that updates propagate (if technically implemented in this phase).

### Manual Verification
- Review the Supabase Dashboard "Table Editor" after running the seeding script to confirm all projects are present.
