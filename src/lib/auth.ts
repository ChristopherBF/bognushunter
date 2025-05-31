import { supabase } from './supabase';

export async function signInWithTwitch() {
    console.log(`${window.location.origin}/auth/callback`)
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'twitch',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  console.log(data)
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
    console.log("getCurrentUser")
  // First try to get the session
  const { data: { session } } = await supabase.auth.getSession();
  
  // If we have a session, return the user
  if (session) {
    return session.user;
  }
  
  // If no session, try to get the user directly as a fallback
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function isAuthenticated() {
    console.log("isAuthenticated")
  const user = await getCurrentUser();
  return !!user;
}

export async function requireAuth(astroObj: any) {
    console.log("requireAuth")
  const { redirect } = astroObj;
  const user = await getCurrentUser();
  
  if (!user) {
    return redirect('/login');
  }
  
  return { user };
}
