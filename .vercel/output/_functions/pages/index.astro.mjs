/* empty css                                 */
import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_CjfJncYZ.mjs';
import 'kleur/colors';
import { g as getCurrentUser, $ as $$Layout } from '../chunks/Layout_D8JOSVxy.mjs';
import { S as SuggestionForm } from '../chunks/SuggestionForm_BtVg4ZmW.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://ChristopherBF.github.io");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const user = await getCurrentUser(Astro2.cookies);
  console.log("[index.astro] User from Supabase:", user ? "authenticated" : "not authenticated");
  if (!user) {
    return Astro2.redirect("/bognushunter/login");
  }
  const defaultEventId = "123e4567-e89b-12d3-a456-426614174000";
  const eventId = Astro2.props.eventId || defaultEventId;
  console.log("[index.astro] Event ID:", Astro2.props.eventId);
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Bognus Hunter Dashboard" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "SuggestionForm", SuggestionForm, { "eventId": eventId, "userId": user.id, "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Christopher/dev/bognushunter/src/components/User/SuggestionForm.vue", "client:component-export": "default" })} ` })}`;
}, "C:/Users/Christopher/dev/bognushunter/src/pages/index.astro", void 0);

const $$file = "C:/Users/Christopher/dev/bognushunter/src/pages/index.astro";
const $$url = "/bognushunter";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
