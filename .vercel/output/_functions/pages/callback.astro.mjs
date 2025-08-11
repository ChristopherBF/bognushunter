/* empty css                                 */
import { e as createAstro, f as createComponent, l as renderHead, n as renderScript, r as renderTemplate } from '../chunks/astro/server_CjfJncYZ.mjs';
import 'kleur/colors';
import 'clsx';
import { g as getSupabaseClient } from '../chunks/supabase_CHjbA2D-.mjs';
/* empty css                                    */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://ChristopherBF.github.io");
const $$Callback = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Callback;
  const supabase = getSupabaseClient(Astro2.cookies);
  const { searchParams } = new URL(Astro2.request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  if (error) {
    console.error("Auth callback error:", error, errorDescription);
  }
  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error getting user after session exchange:", userError);
      } else if (user) {
        const { data: existingUser, error: fetchError } = await supabase.from("users").select("id").eq("id", user.id).single();
        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Error checking user existence in users table:", fetchError);
        }
        if (!existingUser) {
          const { error: insertError } = await supabase.from("users").insert([
            {
              id: user.id,
              email: user.email,
              name: user.user_metadata?.full_name || user.user_metadata?.name || null,
              avatar_url: user.user_metadata?.avatar_url || null
            }
          ]);
          if (insertError) {
            console.error("Error inserting user into users table:", insertError);
          } else {
            console.log("User inserted into users table:", user.id);
          }
        }
      }
    } catch (err) {
      console.error("Error exchanging code for session:", err);
    }
  }
  return renderTemplate`<html lang="en" data-astro-cid-62g22v6u> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Authentication Callback</title>${renderHead()}</head> <body class="bg-brown text-gold min-h-screen" class="bg-brown text-gold min-h-screen" data-astro-cid-62g22v6u> <div class="container" data-astro-cid-62g22v6u> <h1 data-astro-cid-62g22v6u>Completing Sign In</h1> <p data-astro-cid-62g22v6u>Please wait while we finish authentication...</p> <div class="loader" data-astro-cid-62g22v6u></div> </div> ${renderScript($$result, "C:/Users/Christopher/dev/bognushunter/src/pages/callback.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "C:/Users/Christopher/dev/bognushunter/src/pages/callback.astro", void 0);

const $$file = "C:/Users/Christopher/dev/bognushunter/src/pages/callback.astro";
const $$url = "/bognushunter/callback";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Callback,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
