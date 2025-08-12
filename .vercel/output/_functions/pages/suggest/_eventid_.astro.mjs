/* empty css                                    */
import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_CU4hg0qs.mjs';
import 'kleur/colors';
import { g as getCurrentUser, $ as $$Layout } from '../../chunks/Layout_B5w-Bvlh.mjs';
import { S as SuggestionForm } from '../../chunks/SuggestionForm_BtVg4ZmW.mjs';
import { g as getSupabaseClient } from '../../chunks/supabase_CHjbA2D-.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://ChristopherBF.github.io");
const prerender = false;
const $$eventId = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$eventId;
  const { eventId } = Astro2.params;
  const user = await getCurrentUser(Astro2.cookies);
  console.log("[suggest/[eventId].astro] User from Supabase:", user ? "authenticated" : "not authenticated");
  console.log("[suggest/[eventId].astro] Event ID:", eventId);
  if (!user) {
    return Astro2.redirect("/login");
  }
  let eventDate = "";
  let eventExists = false;
  if (eventId) {
    try {
      const supabase = getSupabaseClient(Astro2.cookies);
      const { data: eventData, error: eventError } = await supabase.from("suggestion_events").select("date").eq("id", eventId).single();
      if (eventError) {
        console.error("Error fetching event:", eventError);
      } else if (eventData) {
        eventExists = true;
        const date = new Date(eventData.date);
        eventDate = date.toLocaleDateString("en-GB", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        });
      }
    } catch (e) {
      console.error("Exception during event verification:", e);
    }
  }
  if (!eventExists) {
    return Astro2.redirect("/");
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `Suggest items for the bognus hunt - ${eventDate}` }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="bg-brown text-gold min-h-screen"> <main class="container mx-auto px-4 py-8"> <div class="mb-6"> <h1 class="text-2xl font-bold">Suggest items for the bognus hunt - ${eventDate}</h1> <p class="text-gray-600 mt-2">
Select games from the list below to suggest them for this event.
</p> </div> ${renderComponent($$result2, "SuggestionForm", SuggestionForm, { "eventId": eventId, "userId": user.id, "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Christopher/dev/bognushunter/src/components/User/SuggestionForm.vue", "client:component-export": "default" })} </main> </div> ` })}`;
}, "C:/Users/Christopher/dev/bognushunter/src/pages/suggest/[eventId].astro", void 0);

const $$file = "C:/Users/Christopher/dev/bognushunter/src/pages/suggest/[eventId].astro";
const $$url = "/bognushunter/suggest/[eventId]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$eventId,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
