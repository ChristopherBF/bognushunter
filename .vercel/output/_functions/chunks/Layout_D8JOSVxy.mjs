import { e as createAstro, f as createComponent, h as addAttribute, l as renderHead, o as renderSlot, n as renderScript, r as renderTemplate } from './astro/server_CjfJncYZ.mjs';
import 'kleur/colors';
import 'clsx';
import { g as getSupabaseClient } from './supabase_CHjbA2D-.mjs';

async function getCurrentUser(cookies) {
  console.log(`[auth.ts] Attempting to get current user (cookies ${cookies ? "provided" : "not provided"})...`);
  const client = getSupabaseClient(cookies);
  const { data: { session }, error: sessionError } = await client.auth.getSession();
  if (sessionError) {
    console.error("[auth.ts] Error getting session:", sessionError.message);
  }
  if (session) {
    return session.user;
  }
  const { data: { user }, error: userError } = await client.auth.getUser();
  return user;
}
async function isAuthenticated(cookies) {
  const user = await getCurrentUser(cookies);
  return !!user;
}

const logoImage = new Proxy({"src":"/bognushunter/_astro/heaton-logotype.BIo0xyDr.png","width":1024,"height":1024,"format":"png"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/Christopher/dev/bognushunter/src/assets/heaton-logotype.png";
							}
							
							return target[name];
						}
					});

const $$Astro = createAstro("https://ChristopherBF.github.io");
const $$Layout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title, isAdmin, skipAuth = false, hideNav = false } = Astro2.props;
  let authenticated = false;
  let user = null;
  if (!skipAuth) {
    authenticated = await isAuthenticated();
    user = await getCurrentUser();
    console.log("Authenticated:", authenticated);
    console.log("User:", user);
  }
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>${title}</title>${renderHead()}</head> <body class="bg-brown text-gold min-h-screen" style="background-color: #3c1600"> ${!hideNav && renderTemplate`<nav class="bg-zinc-800 text-white py-2 px-3" style="background: transparent"> <div class="container mx-auto flex justify-center items-center"> <img${addAttribute(logoImage.src, "src")} alt="Heaton Logotype" class="h-72 w-auto"> <!-- {authenticated && (
            <div class="flex gap-4 items-center">
              {isAdmin ? (
                <a href="/admin" class="hover:underline">Admin Dashboard</a>
              ) : (
                <a href="/" class="hover:underline">Suggest Items</a>
              )}
              <div class="flex items-center gap-2">
                <span class="text-sm">Welcome, {user?.user_metadata?.name || user?.email || 'User'}</span>
                <button
                  id="logout-button"
                  class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            </div>
          )} --> </div> </nav>`} <main class="container mx-auto px-3 py-2"> ${renderSlot($$result, $$slots["default"])} </main> ${renderScript($$result, "C:/Users/Christopher/dev/bognushunter/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts")}</body></html>`;
}, "C:/Users/Christopher/dev/bognushunter/src/layouts/Layout.astro", void 0);

export { $$Layout as $, getCurrentUser as g };
