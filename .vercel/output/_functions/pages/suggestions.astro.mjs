/* empty css                                 */
import { e as createAstro, f as createComponent } from '../chunks/astro/server_CU4hg0qs.mjs';
import 'kleur/colors';
import 'clsx';
import { g as getSupabaseClient } from '../chunks/supabase_CHjbA2D-.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://ChristopherBF.github.io");
const prerender = false;
const $$Suggestions = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Suggestions;
  const supabase = getSupabaseClient(Astro2.cookies);
  const { data: { user } } = await supabase.auth.getUser();
  console.log("[suggestions.astro] User from Supabase:", user ? "authenticated" : "not authenticated");
  if (!user) {
    return Astro2.redirect("/login");
  }
  const basePath = "/bognushunter";
  return Astro2.redirect(`${basePath}admin`);
}, "C:/Users/Christopher/dev/bognushunter/src/pages/suggestions.astro", void 0);
const $$file = "C:/Users/Christopher/dev/bognushunter/src/pages/suggestions.astro";
const $$url = "/bognushunter/suggestions";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Suggestions,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
