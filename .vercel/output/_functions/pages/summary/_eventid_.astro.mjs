/* empty css                                    */
import { e as createAstro, f as createComponent, m as maybeRenderHead, k as renderComponent, r as renderTemplate, h as addAttribute } from '../../chunks/astro/server_CjfJncYZ.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../chunks/Layout_D8JOSVxy.mjs';
import { g as getSupabaseClient } from '../../chunks/supabase_CHjbA2D-.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://ChristopherBF.github.io");
const prerender = false;
const $$eventId = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$eventId;
  const { eventId } = Astro2.params;
  const supabase = getSupabaseClient(Astro2.cookies);
  const { data: { user } } = await supabase.auth.getUser();
  console.log("[summary.astro] User from Supabase:", user ? "authenticated" : "not authenticated");
  console.log("[summary.astro] Event ID:", eventId);
  if (!user) {
    return Astro2.redirect("/login");
  }
  user.id;
  const basePath = "/bognushunter";
  let summaryItems = [];
  let totalResults = 0;
  if (eventId) {
    try {
      const { data: summaryItemsData, error: summaryItemsError } = await supabase.from("hunt_items").select("*").eq("event_id", eventId).eq("completed", true);
      if (summaryItemsError) {
        console.error("Error fetching summary items:", summaryItemsError);
      } else if (summaryItemsData && summaryItemsData.length > 0) {
        const suggestionIds = summaryItemsData.map((item) => item.suggestion_id);
        const { data: suggestionsData, error: suggestionsError } = await supabase.from("suggestions").select("id, item").in("id", suggestionIds);
        if (suggestionsError) {
          console.error("Error fetching suggestions for summary items:", suggestionsError);
        } else {
          const suggestionMap = /* @__PURE__ */ new Map();
          suggestionsData?.forEach((suggestion) => {
            suggestionMap.set(suggestion.id, suggestion.item);
          });
          summaryItems = summaryItemsData.map((summaryItem) => ({
            ...summaryItem,
            item: suggestionMap.get(summaryItem.suggestion_id) || "Unknown item"
          }));
          totalResults = summaryItems.reduce((sum, item) => sum + item.result, 0);
        }
      }
    } catch (e) {
      console.error("Exception during summary fetching:", e);
    }
  }
  let eventDate = "";
  let startingBalance = 0;
  if (eventId) {
    try {
      const { data: eventData, error: eventError } = await supabase.from("suggestion_events").select("date, starting_balance").eq("id", eventId).single();
      if (eventError) {
        console.error("Error fetching event date:", eventError);
      } else if (eventData) {
        const date = new Date(eventData.date);
        eventDate = date.toLocaleDateString("en-GB", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        });
        startingBalance = eventData.starting_balance || 0;
      }
    } catch (e) {
      console.error("Exception during event date fetching:", e);
    }
  }
  const formatItemName = (name) => {
    if (!name) return "";
    return name.replace(/-/g, " ").split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };
  return renderTemplate`${maybeRenderHead()}<div class="bg-brown text-gold min-h-screen"> ${renderComponent($$result, "Layout", $$Layout, { "title": "Event Summary" }, { "default": async ($$result2) => renderTemplate` <main class="container mx-auto px-4 py-8"> <div class="flex justify-between items-center mb-6"> <h1 class="text-2xl font-bold">Event Summary ${eventDate && `- ${eventDate}`}</h1> <a${addAttribute(`${basePath}admin`, "href")} class="px-4 py-2 bg-orange-500 text-gold rounded-lg hover:bg-orange-700">
Back to Admin
</a> </div> ${summaryItems.length > 0 ? renderTemplate`<div class="bg-white rounded-lg shadow p-6 mb-6"> <div class="flex justify-between items-center mb-4"> <h1 class="text-2xl font-bold">Event Summary - ${eventDate}</h1> <a${addAttribute(`${basePath}admin`, "href")} class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
Back to Admin
</a> </div> <div class="mb-6"> <div class="flex items-center gap-4"> <div class="p-3 bg-white rounded shadow border"> <div class="text-sm text-gray-600">Starting Balance</div> <div class="text-xl font-bold">${startingBalance}</div> </div> <div class="p-3 bg-white rounded shadow border"> <div class="text-sm text-gray-600">Total Wager</div> <div class="text-xl font-bold">${summaryItems.reduce((sum, item) => sum + item.wager, 0)}</div> </div> <div class="p-3 bg-white rounded shadow border"> <div class="text-sm text-gray-600">Total Result</div> <div class="text-xl font-bold">${summaryItems.reduce((sum, item) => sum + item.result, 0)}</div> </div> <div class="p-3 bg-white rounded shadow border"> <div class="text-sm text-gray-600">Profit/Loss</div> <div class="text-xl font-bold">${totalResults}</div> </div> <div class="p-3 bg-white rounded shadow border"> <div class="text-sm text-gray-600">Final Balance</div> <div class="text-xl font-bold"> ${summaryItems.length > 0 && summaryItems[summaryItems.length - 1].current_balance !== null ? summaryItems[summaryItems.length - 1].current_balance : "Not set"} </div> </div> </div> </div> <h2 class="text-xl font-semibold mb-4">Completed Items</h2> <div class="space-y-4"> ${summaryItems.map((item) => renderTemplate`<div class="p-3 border rounded-lg"> <div class="flex justify-between items-center"> <span>${formatItemName(item.item)}</span> <div class="flex items-center gap-4"> <span class="font-medium">Wager: ${item.wager}</span> <span class="font-medium text-green-600">Result: ${item.result}</span> ${item.bonus && renderTemplate`<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Bonus</span>`} ${item.super_bonus && renderTemplate`<span class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Super Bonus</span>`} ${item.current_balance !== null && renderTemplate`<span${addAttribute(`px-2 py-1 rounded-full text-xs ${item.current_balance > 0 ? "bg-green-100 text-green-800" : item.current_balance < 0 ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`, "class")}>
Balance: ${item.current_balance} </span>`} </div> </div> </div>`)} <div class="mt-6 p-4 bg-gray-50 rounded-lg"> <div class="flex justify-between text-lg font-semibold"> <span>Total Items Completed:</span> <span>${summaryItems.length}</span> </div> <div class="flex justify-between text-lg font-semibold text-green-600"> <span>Total Results:</span> <span>${totalResults}</span> </div> </div> </div> </div>` : renderTemplate`<div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6"> <p>No completed items found for this event. Complete items in the suggestions view to see them here.</p> </div>`} </main> ` })}</div>`;
}, "C:/Users/Christopher/dev/bognushunter/src/pages/summary/[eventId].astro", void 0);
const $$file = "C:/Users/Christopher/dev/bognushunter/src/pages/summary/[eventId].astro";
const $$url = "/bognushunter/summary/[eventId]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$eventId,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
