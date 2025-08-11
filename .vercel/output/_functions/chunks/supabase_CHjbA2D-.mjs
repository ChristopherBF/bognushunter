import { createBrowserClient, createServerClient } from '@supabase/ssr';

const supabaseUrl = "https://pectjcgoyjxgrlssbfuy.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlY3RqY2dveWp4Z3Jsc3NiZnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2ODE5MjcsImV4cCI6MjA2NDI1NzkyN30.vVeI86SPCt14PO3DydhEd6kwQmH0OGTXsreD0RGvkrw";
const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
const getSupabaseClient = (cookies) => {
  if (cookies) {
    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(key) {
          return cookies.get(key)?.value;
        },
        set(key, value, options) {
          cookies.set(key, value, options);
        },
        remove(key, options) {
          cookies.delete(key, options);
        }
      }
    });
  }
  return supabase;
};

export { getSupabaseClient as g, supabase as s };
