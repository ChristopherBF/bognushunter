/* empty css                                 */
import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_CjfJncYZ.mjs';
import 'kleur/colors';
import { g as getCurrentUser, $ as $$Layout } from '../chunks/Layout_D8JOSVxy.mjs';
import { defineComponent, useSSRContext, mergeProps, ref, onMounted, nextTick, onUnmounted } from 'vue';
import { g as getSupabaseClient } from '../chunks/supabase_CHjbA2D-.mjs';
import { s as subscribeSuggestions } from '../chunks/realtime_mEKkIJwq.mjs';
import { s as showError, a as showWarning, b as showInfo, c as showSuccess } from '../chunks/toast_CWK5ebGW.mjs';
import { f as fetchEvents, c as createEvent, a as closeEvent } from '../chunks/eventService_CGQAPXL2.mjs';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrRenderComponent, ssrRenderAttr } from 'vue/server-renderer';
import { _ as _export_sfc } from '../chunks/_plugin-vue_export-helper_pcqpp-6-.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "EventListItem",
  props: {
    event: {
      type: Object,
      required: true
    }
  },
  emits: ["close-event", "view-suggestions", "view-summary", "view-hunt-list", "share-link"],
  setup(__props, { expose: __expose }) {
    __expose();
    const props = __props;
    function formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      }).format(date);
    }
    const __returned__ = { props, formatDate };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-2 border border-streamer-text-secondary/40 rounded hover:bg-orange-900/40 cursor-pointer shadow" }, _attrs))}><div class="flex justify-between items-center"><div class="flex flex-col flex-grow min-w-0"><div class="flex items-center gap-2 mb-1"><span class="text-gold font-medium text-sm truncate">${ssrInterpolate($setup.formatDate($props.event.date))} ${ssrInterpolate($props.event.name || "")}</span><span class="${ssrRenderClass([$props.event.open ? "bg-green-700 text-green-200" : "bg-gray-700 text-gray-300", "px-1.5 py-0.5 rounded text-xs font-semibold flex-shrink-0"])}">${ssrInterpolate($props.event.open ? "Open" : "Closed")}</span></div><div class="flex items-center gap-3 text-xs text-streamer-text-secondary"><span>Start: $${ssrInterpolate($props.event.starting_balance)}</span><span>Current: $${ssrInterpolate($props.event.current_balance)}</span><span class="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> ${ssrInterpolate($props.event.suggestions_count)}</span><span class="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg> ${ssrInterpolate($props.event.hunt_items_count || 0)}</span></div></div><div class="flex space-x-1 items-center flex-shrink-0">`);
  if ($props.event.open) {
    _push(`<button class="px-2 py-1 bg-red-700 text-white text-xs rounded hover:bg-red-800 transition-colors" title="Close"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<button title="Suggestions" class="px-2 py-1 bg-orange-700 text-gold text-xs rounded hover:bg-orange-800 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg></button><button title="Summary" class="px-2 py-1 bg-orange-700 text-gold text-xs rounded hover:bg-orange-800 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg></button><button title="Hunt Details" class="px-2 py-1 bg-orange-700 text-gold text-xs rounded hover:bg-orange-800 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg></button><button title="Share" class="px-2 py-1 bg-orange-700 text-gold text-xs rounded hover:bg-orange-800 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg></button></div></div></div>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/Admin/EventListItem.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const EventListItem = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1]]);

const DEBUG = true;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AdminDashboard",
  props: {
    eventId: {},
    userId: {}
  },
  setup(__props, { expose: __expose }) {
    __expose();
    const log = (...args) => console.log("[AdminDashboard]", ...args);
    const createEventButtonRef = ref(null);
    log("Component script initialization");
    const props = __props;
    log("Props received:", props);
    const supabase = getSupabaseClient();
    const events = ref([]);
    const copiedEventId = ref(null);
    const showCreateEventModal = ref(false);
    const startingBalance = ref(1e3);
    const handleCloseEvent = async (eventId) => {
      log("Closing event:", eventId);
      const idx = events.value.findIndex((e) => e.id === eventId);
      if (idx === -1) {
        log("Event not found in local events array");
        return;
      }
      const prevOpen = events.value[idx].open;
      log("Event current open status:", prevOpen);
      try {
        const { success, error } = await closeEvent(eventId);
        if (success) {
          events.value[idx].open = false;
          log("Event closed successfully in database and UI updated");
          showSuccess("Hunt closed successfully!");
        } else {
          log("Failed to close event:", error);
          showError(error?.message || "Failed to close hunt");
        }
      } catch (error) {
        log("Exception while closing event:", error);
        showError("An unexpected error occurred while closing the hunt");
      }
    };
    const handleCreateEvent = async (e) => {
      log("Create event triggered", e);
      log("User ID:", props.userId);
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (!props.userId) {
        console.error("Error: No user ID provided");
        showError("Error: User ID is required to create a hunt");
        return;
      }
      if (startingBalance.value <= 0) {
        showWarning("Starting balance must be greater than zero");
        return;
      }
      try {
        log("Creating new hunt using event service with starting balance:", startingBalance.value);
        showInfo("Creating new hunt...");
        const huntName = `Hunt ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`;
        const { event, error } = await createEvent(huntName, props.userId, startingBalance.value);
        if (error) {
          console.error("Error creating event:", error);
          showError(`Failed to create hunt: ${error.message}`);
          return;
        }
        if (!event) {
          console.error("Failed to create event: No event data returned");
          showError("Failed to create hunt: Unknown error");
          return;
        }
        log("Event created successfully:", event);
        showSuccess("Hunt created successfully!");
        showCreateEventModal.value = false;
        startingBalance.value = 1e3;
        await fetchEvents$1();
      } catch (error) {
        console.error("Error in handleCreateEvent:", error);
        showError("An unexpected error occurred while creating the hunt");
      }
    };
    const setupRealTimeSubscriptions = () => {
      log("Setting up real-time subscriptions for all events");
      const cleanupFunctions = {};
      events.value.forEach((event) => {
        log(`Setting up subscription for event ${event.id}`);
        cleanupFunctions[event.id] = subscribeSuggestions(event.id, (payload) => {
          log(`Received suggestion change for event ${event.id}:`, payload);
          const eventIndex = events.value.findIndex((e) => e.id === event.id);
          if (eventIndex !== -1) {
            if (payload.eventType === "INSERT") {
              events.value[eventIndex].suggestions_count += 1;
              log(`Incremented count for event ${event.id} to ${events.value[eventIndex].suggestions_count}`);
            } else if (payload.eventType === "DELETE") {
              events.value[eventIndex].suggestions_count = Math.max(0, events.value[eventIndex].suggestions_count - 1);
              log(`Decremented count for event ${event.id} to ${events.value[eventIndex].suggestions_count}`);
            }
          }
        });
      });
      return () => {
        log("Cleaning up all subscriptions");
        Object.values(cleanupFunctions).forEach((cleanup) => cleanup());
      };
    };
    onMounted(async () => {
      log("Component mounted");
      try {
        await nextTick();
        if (!createEventButtonRef.value) {
          console.error("Create event button ref not found");
        }
        log("Fetching initial data...");
        try {
          log("Calling fetchEvents");
          await fetchEvents$1();
          log("fetchEvents completed successfully");
          log("Setting up real-time subscriptions");
          const cleanup = setupRealTimeSubscriptions();
          onUnmounted(() => {
            log("Component unmounting, cleaning up subscriptions");
            cleanup();
            if (createEventButtonRef.value) {
              log("Removing event listeners");
              createEventButtonRef.value.removeEventListener("click", handleCreateEvent);
            }
          });
        } catch (error) {
          console.error("Error in fetchEvents:", error);
        }
        log("Component mounted successfully");
      } catch (error) {
        console.error("Error during component mounting:", error);
      }
    });
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
    };
    const viewSummary = (eventId) => {
      log("Navigating to summary page for event:", eventId);
      showInfo("Loading summary page...");
      const basePath = "/bognushunter";
      window.location.href = `${basePath}summary/${eventId}`;
    };
    const viewHuntList = (eventId) => {
      log("Navigating to hunt list page for event:", eventId);
      showInfo("Loading hunt list page...");
      const basePath = "/bognushunter";
      window.location.href = `${basePath}huntlist/${eventId}`;
    };
    const shareSuggestionLink = (eventId) => {
      log("Sharing suggestion link for event:", eventId);
      const baseUrl = window.location.origin;
      const basePath = "/bognushunter";
      const suggestionUrl = `${baseUrl}${basePath}suggest/${eventId}`;
      navigator.clipboard.writeText(suggestionUrl).then(() => {
        log("Link copied to clipboard:", suggestionUrl);
        copiedEventId.value = eventId;
        showSuccess("Link copied to clipboard!");
        setTimeout(() => {
          if (copiedEventId.value === eventId) {
            copiedEventId.value = null;
          }
        }, 3e3);
      }).catch((err) => {
        console.error("Error copying link to clipboard:", err);
        showError("Failed to copy link. Please try again.");
      });
    };
    const fetchEvents$1 = async () => {
      log("Fetching events");
      try {
        if (!props.userId) {
          console.error("Error: No user ID provided for fetching events");
          showError("Error: User ID is required to fetch hunts");
          return;
        }
        const { events: fetchedEvents, error } = await fetchEvents(props.userId);
        if (error) {
          console.error("Error fetching events:", error);
          showError(`Failed to fetch hunts: ${error.message}`);
          return;
        }
        events.value = fetchedEvents;
        log("Events fetched:", events.value);
      } catch (error) {
        console.error("Error in fetchEvents:", error);
        showError("Failed to load hunts. Please try again.");
      }
    };
    const viewSuggestions = (eventId) => {
      log("Navigating to suggestions page for event:", eventId);
      showInfo("Loading suggestions page...");
      const basePath = "/bognushunter";
      window.location.href = `${basePath}suggestions/${eventId}`;
    };
    const __returned__ = { DEBUG, log, createEventButtonRef, props, supabase, events, copiedEventId, showCreateEventModal, startingBalance, handleCloseEvent, handleCreateEvent, setupRealTimeSubscriptions, formatDate, viewSummary, viewHuntList, shareSuggestionLink, fetchEvents: fetchEvents$1, viewSuggestions, EventListItem };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<!--[--><div class="space-y-3"><div class="bg-brown border-2 border-orange rounded-lg shadow-lg p-3"><div class="flex justify-between items-center mb-2"><h2 class="text-lg font-display mb-1 flex-grow text-gold">Bognus Hunts</h2><button type="button" class="px-3 py-1.5 text-sm font-display bg-orange-700 text-gold rounded shadow-md hover:bg-orange-800 transition-colors"> Create Hunt </button></div><div class="space-y-2"><!--[-->`);
  ssrRenderList($setup.events.filter((e) => e.open), (event) => {
    _push(ssrRenderComponent($setup["EventListItem"], {
      key: event.id,
      event,
      onViewSuggestions: $setup.viewSuggestions,
      onViewSummary: $setup.viewSummary,
      onViewHuntList: $setup.viewHuntList,
      onShareLink: $setup.shareSuggestionLink,
      onCloseEvent: $setup.handleCloseEvent
    }, null, _parent));
  });
  _push(`<!--]-->`);
  if ($setup.events.some((e) => !e.open)) {
    _push(`<!--[--><hr class="my-3 border-orange/40"><h3 class="text-base text-gold mb-1">Closed Hunts</h3><!--[-->`);
    ssrRenderList($setup.events.filter((e) => !e.open), (event) => {
      _push(ssrRenderComponent($setup["EventListItem"], {
        key: event.id,
        event,
        onViewSuggestions: $setup.viewSuggestions,
        onViewSummary: $setup.viewSummary,
        onViewHuntList: $setup.viewHuntList,
        onShareLink: $setup.shareSuggestionLink,
        onCloseEvent: $setup.handleCloseEvent
      }, null, _parent));
    });
    _push(`<!--]--><!--]-->`);
  } else {
    _push(`<!---->`);
  }
  if ($setup.copiedEventId) {
    _push(`<div class="mt-2 text-sm text-streamer-green-accent flex items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Link copied to clipboard! </div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div></div>`);
  if ($setup.showCreateEventModal) {
    _push(`<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div class="bg-brown-dark border-2 border-orange rounded-lg shadow-lg p-4 w-80 max-w-sm"><h3 class="text-lg font-display text-gold mb-3">Create New Hunt</h3><div class="mb-3"><label for="startingBalance" class="block text-sm font-medium text-gold mb-1">Starting Balance</label><input id="startingBalance"${ssrRenderAttr("value", $setup.startingBalance)} type="number" min="0" step="1" class="w-full px-2 py-1.5 text-sm border border-orange rounded bg-brown text-gold focus:outline-none focus:ring-1 focus:ring-orange" placeholder="Enter starting balance"></div><div class="flex justify-end space-x-2 mt-4"><button class="px-3 py-1.5 text-sm bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"> Cancel </button><button class="px-3 py-1.5 text-sm bg-orange-700 text-gold rounded hover:bg-orange-600 transition-colors"> Create Hunt </button></div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<!--]-->`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/Admin/AdminDashboard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const AdminDashboard = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

const $$Astro = createAstro("https://ChristopherBF.github.io");
const prerender = false;
const $$Admin = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Admin;
  console.log("[admin.astro] Page processing started on server...");
  const user = await getCurrentUser(Astro2.cookies);
  console.log("[admin.astro] User from Supabase:", user ? "authenticated" : "not authenticated");
  if (!user) {
    return Astro2.redirect("/bognushunter/login");
  }
  const defaultEventId = "123e4567-e89b-12d3-a456-426614174000";
  const eventId = Astro2.props.eventId || defaultEventId;
  console.log("[admin.astro] Event ID:", Astro2.props);
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Admin Dashboard", "isAdmin": true }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "AdminDashboard", AdminDashboard, { "client:load": true, "eventId": eventId, "userId": user.id, "client:component-hydration": "load", "client:component-path": "C:/Users/Christopher/dev/bognushunter/src/components/Admin/AdminDashboard.vue", "client:component-export": "default" })} ` })}`;
}, "C:/Users/Christopher/dev/bognushunter/src/pages/admin.astro", void 0);

const $$file = "C:/Users/Christopher/dev/bognushunter/src/pages/admin.astro";
const $$url = "/bognushunter/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Admin,
    file: $$file,
    prerender,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
