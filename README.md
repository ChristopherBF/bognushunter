# Suggestion App

A web application for gathering and managing suggestions from users.

## Features

- User interface for suggesting items from a predefined list
- Admin dashboard with:
  - Event management
  - Suggestions tracking
  - Hunt list management
  - Summary statistics
- **Twitch Authentication** for user access
- Real-time updates using Supabase
- TypeScript support
- Vue 3 components
- Tailwind CSS styling

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Supabase:
   - Create a new Supabase project at https://supabase.com
   - Create the following tables in your Supabase database:
     ```sql
     create table suggestion_events (
       id uuid default uuid_generate_v4() primary key,
       date timestamp with time zone,
       created_by uuid references auth.users(id),
       created_at timestamp with time zone default timezone('utc'::text, now()) not null
     );

     create table suggestions (
       id uuid default uuid_generate_v4() primary key,
       event_id uuid references suggestion_events(id),
       item text not null,
       user_id uuid references auth.users(id),
       created_at timestamp with time zone default timezone('utc'::text, now()) not null
     );

     create table hunt_items (
       id uuid default uuid_generate_v4() primary key,
       event_id uuid references suggestion_events(id),
       suggestion_id uuid references suggestions(id),
       wager numeric,
       result numeric,
       bonus boolean default false,
       super_bonus boolean default false,
       completed boolean default false,
       created_at timestamp with time zone default timezone('utc'::text, now()) not null
     );
     ```

3. Configure Twitch Authentication:
   - In your Supabase dashboard, go to Authentication > Providers
   - Enable Twitch authentication
   - Create a Twitch developer application at https://dev.twitch.tv/console/apps
   - Add the redirect URL from Supabase to your Twitch application
   - Copy your Twitch Client ID and Client Secret to Supabase

4. Add environment variables:
   Create a `.env` file in the root directory with:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── User/
│   │   └── SuggestionForm.vue
│   └── Admin/
│       └── AdminDashboard.vue
├── layouts/
│   └── Layout.astro
├── pages/
│   ├── index.astro
│   ├── admin.astro
│   ├── login.astro
│   └── auth/
│       └── callback.astro
├── lib/
│   ├── supabase.ts
│   └── auth.ts
└── types/
```

## Authentication Flow

1. Users are required to sign in with Twitch to access any page in the application
2. The login page provides a Twitch login button
3. Upon successful authentication, users are redirected to the main application
4. Admin pages use the same authentication but could have additional role checks

## Usage

1. User Interface:
   - Users must be logged in via Twitch
   - Users can suggest items from a predefined list
   - Each user can suggest items for a specific event
   - Suggested items are removed from their available list

2. Admin Interface:
   - Create new suggestion events
   - View suggestions for each event
   - Manage hunt list items
   - Track completed items and results
   - View summary statistics
