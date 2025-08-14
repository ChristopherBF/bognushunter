import {
  createBrowserClient,
  createServerClient,
  type CookieOptions,
} from '@supabase/ssr';
import type { AstroCookies } from 'astro';

// Read from PUBLIC_ env vars (exposed to client by Astro)
export const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
export const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('[supabase.ts] Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY environment variables');
}

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

import type { HuntItem } from '../types/hunt.ts';
import type { Suggestion } from '../types/suggestion.ts';
import type { Event as SuggestionEvent } from '../types/event.ts';