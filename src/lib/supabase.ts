import {
  createBrowserClient,
  createServerClient,
  type CookieOptions,
} from '@supabase/ssr';
import type { AstroCookies } from 'astro';

// Default to these values if environment variables aren't available
// In production, these would be set properly
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pectjcgoyjxgrlssbfuy.supabase.co';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlY3RqY2dveWp4Z3Jsc3NiZnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2ODE5MjcsImV4cCI6MjA2NDI1NzkyN30.vVeI86SPCt14PO3DydhEd6kwQmH0OGTXsreD0RGvkrw';

// Client-side Supabase client (can be used in <script> tags or .ts/.js files run on the client)
// This is the one that will be imported as `supabase` directly.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Function to get a Supabase client, adaptable for server or client context
export const getSupabaseClient = (cookies?: AstroCookies) => {
  if (cookies) {
    // Server-side client (used in Astro frontmatter or API routes)
    // This creates a new server client instance each time it's called with cookies.
    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(key: string) {
          return cookies.get(key)?.value;
        },
        set(key: string, value: string, options: CookieOptions) {
          cookies.set(key, value, options);
        },
        remove(key: string, options: CookieOptions) {
          cookies.delete(key, options);
        },
      },
    });
  }
  // Fallback to client-side client if no cookies object is provided
  // (e.g., if called from a client-side script that didn't import `supabase` directly)
  return supabase;
};

import type { HuntItem } from '../types/hunt';
import type { Suggestion } from '../types/suggestion';
import type { Event as SuggestionEvent } from '../types/event';