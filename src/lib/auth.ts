import { supabase, getSupabaseClient } from './supabase.ts'; // supabase is browser client
import type { AstroCookies } from 'astro';

// Runs on CLIENT-SIDE (e.g., in a <script> tag or a .ts file imported by one)
export async function signInWithTwitch() {
  console.log('[auth.ts] Attempting to sign in with Twitch (client-side)...');
  // Uses the browser client directly
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'twitch',
    options: {
      // window.location.origin is only available on client
      redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}callback`
    }
  });
  if (error) {
    console.error('[auth.ts] Error in signInWithTwitch:', error.message);
    throw error;
  }
  return data;
}

// Can run on CLIENT-SIDE. If server-side signout is needed, it would require cookies.
export async function signOut() {
  console.log('[auth.ts] Attempting to sign out (client-side)...');
  // Uses the browser client
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('[auth.ts] Error in signOut:', error.message);
    throw error;
  }
}

// Runs on SERVER-SIDE (Astro frontmatter) or CLIENT-SIDE.
// `cookies` MUST be provided if called from server-side.
export async function getCurrentUser(cookies?: AstroCookies) {
  console.log(`[auth.ts] Attempting to get current user (cookies ${cookies ? 'provided' : 'not provided'})...`);
  const client = getSupabaseClient(cookies); // Gets server or browser client

  const { data: { session }, error: sessionError } = await client.auth.getSession();
  
  if (sessionError) {
    console.error('[auth.ts] Error getting session:', sessionError.message);
  }
  // console.log('[auth.ts] Session from getSession():', session); // Can be too verbose

  if (session) {
    // console.log('[auth.ts] User found in session:', session.user); // Can be too verbose
    return session.user;
  }
  
  // console.log('[auth.ts] No session. Trying client.auth.getUser() as fallback...');
  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError) {
    // This is expected if no one is logged in.
    // console.error('[auth.ts] Error getting user via getUser():', userError.message);
  }
  // console.log('[auth.ts] User from getUser():', user); // Can be too verbose
  return user;
}

// Runs on SERVER-SIDE or CLIENT-SIDE.
export async function isAuthenticated(cookies?: AstroCookies) {
  const user = await getCurrentUser(cookies);
  return !!user;
}

// Runs on SERVER-SIDE (Astro frontmatter).
export async function requireAuth(astroContext: { cookies: AstroCookies, redirect: (path: string) => any }) {
  const { cookies, redirect } = astroContext;
  const user = await getCurrentUser(cookies); // Pass cookies here
  console.log('[auth.ts] User from requireAuth (server-side):', user ? user.id : null);
  if (!user) {
    return redirect(`${import.meta.env.BASE_URL}login`);
  }
  return { user }; // Return user if authenticated
}