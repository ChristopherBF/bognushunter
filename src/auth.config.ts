import { defineConfig } from 'auth-astro';


export default defineConfig({
  providers: [
    {
        name: 'supabase',
        id: 'supabase',
        type: 'oauth',
        clientId: import.meta.env.VITE_SUPABASE_ANON_KEY,
        clientSecret: import.meta.env.VITE_SUPABASE_ANON_KEY,
        authorization: {
          params: { provider: 'supabase' },
        },
        token: {
          params: { provider: 'supabase' },
        }      
    }
  ],
});