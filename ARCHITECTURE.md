# Deep Dive Architecture Summary

## 1. Project Overview

- **Framework:** Astro (with Node SSR adapter)
- **Frontend:** Vue 3 (integrated into Astro for interactive components)
- **Styling:** Tailwind CSS
- **Backend/Data:** Supabase (authentication, real-time, and data storage)
- **Notifications:** vue3-toastify for user feedback
- **TypeScript:** Used throughout for type safety
- **Package Manager:** pnpm

---

## 2. Directory Structure & Key Modules

- **`src/lib/`** – Core services and utilities:
  - `auth.ts`: Handles authentication, login/logout, and session checks (client & server).
  - `realtime.ts`: Manages real-time subscriptions for hunt items and suggestions via Supabase.
  - `supabase.ts`: Factory for Supabase clients (browser/server), plus core data interfaces.
  - `toast.ts`: Centralizes toast notification logic.
  - `utils.ts`: Helper functions (e.g., string formatting).

- **`src/components/`** – UI building blocks:
  - **Admin:** `AdminDashboard.vue`, `HuntList.vue`, `SuggestionsList.vue`, etc. for event/hunt management.
  - **User:** `SuggestionForm.vue` for suggesting items.
  - **UI:** `ActionButton.vue`, `Modal.vue`, etc. for reusable interface elements.

- **`src/pages/`** – Routing and page entrypoints:
  - `.astro` files for each route (e.g., `admin.astro`, `index.astro`, `login.astro`).
  - Dynamic folders like `huntlist/[eventId].astro` for per-event pages.

- **`public/`, `assets/`, `styles/`** – Static assets and global styles.

---

## 3. Routing & Data Flow

- **Authentication:**
  - All major pages (`index.astro`, `admin.astro`, etc.) perform server-side authentication using Supabase.
  - Unauthenticated users are redirected to `/login`.

- **Page Components:**
  - Each page loads a Vue component (e.g., `AdminDashboard`, `SuggestionForm`) and passes authenticated user and event IDs as props.
  - Layouts (`Layout.astro`) wrap all pages for consistent look and feel.

- **Dynamic Routing:**
  - Event-based routes (`/huntlist/[eventId]`, `/suggestions/[eventId]`, etc.) enable per-event context and data loading.

- **Real-Time Data:**
  - Components subscribe to Supabase channels for live updates (e.g., when a suggestion or hunt item changes).

- **Notifications:**
  - All user actions (success, error, info) are surfaced via toast notifications for immediate feedback.

---

## 4. Component Roles

- **Admin Components:** For creating/managing hunts, viewing suggestions, and handling event-specific logic.
- **User Components:** For suggesting new items (games), searching, and managing personal suggestions.
- **UI Components:** For common interface elements (buttons, modals, thumbnails).

---

## 5. Key Data Models

- **Suggestion:** Represents a user-suggested item for a hunt/event.
- **HuntItem:** An item added to a hunt, with wager, result, and completion status.
- **SuggestionEvent:** Metadata for each hunt/event.

---

## 6. Typical User Flow

1. **Login:**  
   User authenticates via Twitch (Supabase OAuth).
2. **Dashboard:**  
   Authenticated users are routed to the dashboard (`/` or `/admin`), where they can view or manage hunts.
3. **Suggesting Items:**  
   Users search for games and suggest them for hunts. Suggestions are live-updated for admins.
4. **Managing Hunts:**  
   Admins create hunts, manage hunt lists, and see real-time updates on suggestions and hunt items.
5. **Feedback:**  
   All actions (success/fail/info) are communicated via toast notifications.

---

## 7. Visual Architecture Diagram

```mermaid
flowchart TD
    subgraph User
        A1[User Browser]
    end

    subgraph AstroApp["Astro App (SSR + Vue)"]
        B1[.astro Page (e.g. index.astro, admin.astro)]
        B2[Layout.astro]
        B3[Vue Components]
        B4[Toast Notifications]
    end

    subgraph Services
        C1[auth.ts]
        C2[realtime.ts]
        C3[supabase.ts]
        C4[toast.ts]
        C5[utils.ts]
    end

    subgraph SupabaseCloud["Supabase Cloud"]
        D1[Auth]
        D2[Database (Suggestions, HuntItems, Events)]
        D3[Realtime Channels]
    end

    %% User Flow
    A1 -- HTTP Request --> B1
    B1 --> B2
    B1 -- Auth Check --> C1
    B1 -- Data Fetch/Mutate --> C3
    B1 -- Real-time Subscriptions --> C2
    B3 -- UI Actions --> B1
    B3 -- Show Toast --> B4
    B4 -- Notification --> A1
    C1 -- Session/Token --> D1
    C3 -- DB/API Calls --> D2
    C2 -- Subscribe/Publish --> D3
    D3 -- Real-time Events --> C2
    C2 -- Update UI --> B3

    %% Admin/User Split
    B1 -- Load AdminDashboard.vue / HuntList.vue --> B3
    B1 -- Load SuggestionForm.vue --> B3
```

---

## 8. Best Practices in Use

- **Separation of concerns:** Clear split between admin, user, and UI components.
- **Reusability:** Modular components (e.g., ActionButton, Modal).
- **Type safety:** TypeScript interfaces for all core data.
- **SSR & Client:** Authentication and data loading are handled server-side for security, but interactivity is provided client-side with Vue.
- **Real-time UX:** Live updates using Supabase channels, providing a responsive experience.

---

If you need this in another format, or want a more detailed breakdown for a specific feature, let me know!
