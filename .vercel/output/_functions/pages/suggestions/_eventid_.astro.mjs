/* empty css                                    */
import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../chunks/astro/server_CU4hg0qs.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../chunks/Layout_B5w-Bvlh.mjs';
import { g as getSupabaseClient } from '../../chunks/supabase_CHjbA2D-.mjs';
import { defineComponent, useSSRContext, computed, mergeProps, ref, onMounted, onUnmounted } from 'vue';
/* empty css                                    */
import { s as subscribeSuggestions, a as subscribeHuntItems } from '../../chunks/realtime_mEKkIJwq.mjs';
import { s as showError, a as showWarning, c as showSuccess, b as showInfo } from '../../chunks/toast_CWK5ebGW.mjs';
import { f as formatItemName, A as ActionButton, G as GameThumbnail } from '../../chunks/ActionButton_DMSW5pXa.mjs';
import { f as fetchHuntList, r as removeFromHunt, b as addToHunt, u as updateHuntItem } from '../../chunks/huntItemService_DwPZnxQr.mjs';
import { f as fetchSuggestions, b as fetchGameDataForSuggestions, s as saveCustomThumb } from '../../chunks/suggestionService_DakLVKUk.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
/* empty css                                        */
import { _ as _export_sfc } from '../../chunks/_plugin-vue_export-helper_pcqpp-6-.mjs';
export { renderers } from '../../renderers.mjs';

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "HuntListItemSimple",
  props: {
    huntItem: {
      type: Object,
      required: true
    }
  },
  emits: ["remove"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const formattedItemName = computed(() => {
      return formatItemName(props.huntItem.item);
    });
    const __returned__ = { props, emit, formattedItemName, GameThumbnail, ActionButton };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_ssrRender$2(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({
    class: ["p-3 border rounded-lg hover:bg-orange-900/40", $props.huntItem.active ? "bg-green-900/30 item-active" : "bg-gray-800/40 item-inactive"]
  }, _attrs))} data-v-19448714><div class="flex items-center justify-between" data-v-19448714><div class="flex items-center gap-2" data-v-19448714>`);
  _push(ssrRenderComponent($setup["GameThumbnail"], {
    "thumbnail-url": $props.huntItem.custom_thumb,
    alt: $props.huntItem.item,
    size: "xs"
  }, null, _parent));
  _push(`<span class="text-gold" data-v-19448714>${ssrInterpolate($setup.formattedItemName)}</span></div>`);
  _push(ssrRenderComponent($setup["ActionButton"], {
    onClick: ($event) => _ctx.$emit("remove", $props.huntItem.id),
    variant: "danger",
    size: "xs",
    text: "Remove"
  }, null, _parent));
  _push(`</div></div>`);
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/Admin/HuntListItemSimple.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const HuntListItemSimple = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["ssrRender", _sfc_ssrRender$2], ["__scopeId", "data-v-19448714"]]);

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "SuggestionItem",
  props: {
    suggestion: {
      type: Object,
      required: true
    },
    recentlyAdded: {
      type: Boolean,
      default: false
    }
  },
  emits: ["add-to-hunt", "image-error"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const formattedItemName = computed(() => {
      return formatItemName(props.suggestion.item);
    });
    function handleImageError(type) {
      emit("image-error", {
        suggestionId: props.suggestion.id,
        type
      });
    }
    const __returned__ = { props, emit, formattedItemName, handleImageError, GameThumbnail };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({
    class: ["border rounded-lg hover:bg-orange-900/40 cursor-pointer transition-all hover:shadow-md", { "bg-green-100/20": $props.recentlyAdded }]
  }, _attrs))}><div class="p-4 flex flex-col items-center text-center">`);
  _push(ssrRenderComponent($setup["GameThumbnail"], {
    "thumbnail-url": $props.suggestion.custom_thumb || $props.suggestion.url_thumb,
    alt: $props.suggestion.item,
    size: "lg",
    "show-gradient": "",
    onImageError: $setup.handleImageError
  }, null, _parent));
  _push(`<div class="flex justify-between items-start w-full mt-3"><span class="font-medium text-gold">${ssrInterpolate($setup.formattedItemName)}</span><span class="text-xs px-2 py-1 bg-blue-100/20 text-blue-300 rounded-full"> x${ssrInterpolate($props.suggestion.count)}</span></div></div></div>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/Admin/SuggestionItem.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const SuggestionItem = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1]]);

const DEBUG = true;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SuggestionsList",
  props: {
    eventId: {},
    userId: {}
  },
  setup(__props, { expose: __expose }) {
    __expose();
    function log(...args) {
      console.log("[SuggestionsList]", ...args);
    }
    log("Component script initialization");
    const props = __props;
    log("Props received:", props);
    const supabase = getSupabaseClient();
    const suggestions = ref([]);
    const huntList = ref([]);
    const recentlyAddedSuggestions = ref([]);
    const initialHuntListLoaded = ref(false);
    const initialSuggestionsLoaded = ref(false);
    const saveCustomThumb$1 = async (suggestionId, thumbUrl, backgroundUrl = null) => {
      try {
        const { success, error } = await saveCustomThumb(suggestionId, thumbUrl, backgroundUrl);
        if (error) {
          console.error("Error saving custom thumbnail:", error);
          return false;
        }
        return success;
      } catch (e) {
        console.error("Exception during saving custom thumbnail:", e);
        return false;
      }
    };
    const fetchSuggestions$1 = async () => {
      try {
        log("Fetching suggestions for event:", props.eventId);
        const { suggestions: processedSuggestions, error } = await fetchSuggestions(props.eventId);
        if (error) {
          console.error("Error fetching suggestions:", error);
          showError(`Failed to load suggestions: ${error.message}`);
          return;
        }
        try {
          const baseUrl = "/bognushunter";
          const { updatedSuggestions, error: gameDataError } = await fetchGameDataForSuggestions(processedSuggestions, baseUrl);
          if (gameDataError) {
            console.error("Error fetching game data for suggestions:", gameDataError);
            showWarning(`Some game thumbnails could not be loaded. Using placeholders instead.`);
          } else {
            suggestions.value = updatedSuggestions;
          }
        } catch (e) {
          console.error("Error fetching game data for suggestions:", e);
          showWarning(`Some game thumbnails could not be loaded. Using placeholders instead.`);
          suggestions.value = processedSuggestions;
        }
        suggestions.value.sort((a, b) => b.count - a.count);
        log("Suggestions processed:", suggestions.value.length);
        console.log(suggestions);
        if (!initialSuggestionsLoaded.value) {
          initialSuggestionsLoaded.value = true;
          if (suggestions.value.length > 0) {
            showSuccess(`Loaded ${suggestions.value.length} suggestions`);
          } else {
            showInfo("No suggestions found for this hunt yet.");
          }
        }
      } catch (e) {
        console.error("Exception during suggestions fetching:", e);
        showError(`Failed to load suggestions: ${e instanceof Error ? e.message : "Unknown error"}`);
      }
    };
    const fetchHuntList$1 = async () => {
      try {
        log("Fetching hunt list for event:", props.eventId);
        const { huntItems, error } = await fetchHuntList(props.eventId);
        if (error) {
          console.error("Error fetching hunt items:", error);
          showError(`Failed to load hunt list: ${error.message}`);
          return;
        }
        huntList.value = huntItems;
        log("Hunt list fetched:", huntList.value.length);
        if (!initialHuntListLoaded.value) {
          initialHuntListLoaded.value = true;
          if (huntList.value.length > 0) {
            showSuccess(`Hunt list loaded with ${huntList.value.length} items`);
          } else {
            showInfo("Hunt list is empty. Add items by clicking on suggestions.");
          }
        }
      } catch (e) {
        console.error("Exception during hunt list fetching:", e);
        showError(`Failed to load hunt list: ${e instanceof Error ? e.message : "Unknown error"}`);
      }
    };
    const updateHuntItem$1 = async (item) => {
      try {
        const isCompleted = item.wager !== null && item.result !== null && (item.bonus || item.super_bonus);
        const huntItemToUpdate = {
          id: item.id,
          event_id: item.event_id,
          suggestion_id: item.suggestion_id,
          wager: item.wager,
          result: item.result,
          bonus: item.bonus,
          super_bonus: item.super_bonus,
          completed: isCompleted,
          active: item.active,
          custom_thumb: item.custom_thumb,
          url_background: item.url_background,
          item: item.item
        };
        const { huntItem, error } = await updateHuntItem(huntItemToUpdate);
        if (error) {
          console.error("Error updating hunt item:", error);
          showError(`Failed to update hunt item: ${error.message}`);
          return;
        }
        if (!huntItem) {
          console.error("Failed to update hunt item");
          showError("Failed to update hunt item: Unknown error");
          return;
        }
        log("Hunt item updated:", item.id);
        showSuccess("Hunt item updated successfully");
      } catch (e) {
        console.error("Exception during hunt item update:", e);
        showError(`Failed to update hunt item: ${e instanceof Error ? e.message : "Unknown error"}`);
      }
    };
    const addToHunt$1 = async (suggestion) => {
      try {
        log("Adding suggestion to hunt list:", suggestion);
        const existingItem = huntList.value.find((item) => item.item === suggestion.item);
        if (existingItem) {
          log("Item already exists in hunt list");
          showInfo(`"${formatItemName(suggestion.item)}" is already in the hunt list`);
          return;
        }
        showInfo(`Adding "${formatItemName(suggestion.item)}" to hunt list...`);
        const { huntItem, error, exists } = await addToHunt(props.eventId, suggestion);
        if (exists) {
          log("Item already exists in hunt list:", suggestion.item);
          showInfo(`"${formatItemName(suggestion.item)}" is already in the hunt list.`);
          return;
        }
        if (error) {
          console.error("Error adding suggestion to hunt list:", error);
          showError(`Failed to add "${formatItemName(suggestion.item)}" to hunt list: ${error.message}`);
          return;
        }
        await fetchHuntList$1();
        log("Suggestion added to hunt list:", suggestion.item);
        showSuccess(`"${formatItemName(suggestion.item)}" added to hunt list!`);
      } catch (e) {
        console.error("Exception during adding suggestion to hunt list:", e);
        showError(`Failed to add "${formatItemName(suggestion.item)}" to hunt list: ${e instanceof Error ? e.message : "Unknown error"}`);
      }
    };
    const removeFromHunt$1 = async (id) => {
      if (!id) {
        console.error("Invalid hunt item ID for removal");
        showError("Cannot remove item: Invalid ID");
        return;
      }
      const originalList = [...huntList.value];
      try {
        log("Removing hunt item with ID:", id);
        const itemToRemove = huntList.value.find((item) => item.id === id);
        const itemName = itemToRemove ? formatItemName(itemToRemove.item) : "Item";
        huntList.value = huntList.value.filter((item) => item.id !== id);
        showInfo(`Removing "${itemName}" from hunt list...`);
        if (!props.eventId) {
          console.error("Missing event ID for hunt item removal");
          showError("Cannot remove item: Missing event ID");
          huntList.value = originalList;
          return;
        }
        const { success, error, data } = await removeFromHunt(id);
        if (error) {
          console.error("Error removing hunt item:", error);
          huntList.value = originalList;
          showError(`Failed to remove item: ${error.message}`);
          return;
        }
        if (!success) {
          console.error("Failed to remove hunt item");
          huntList.value = originalList;
          showError("Failed to remove item: Unknown error");
          return;
        }
        log("Hunt item removed successfully from database");
        showSuccess(`"${itemName}" removed from hunt list!`);
        await fetchHuntList$1();
      } catch (e) {
        console.error("Exception during removing hunt item:", e);
        huntList.value = originalList;
        showError(`An error occurred while removing the item: ${e instanceof Error ? e.message : "Unknown error"}`);
        await fetchHuntList$1();
      }
    };
    const setupRealTimeSubscriptions = () => {
      log("Setting up real-time subscriptions");
      const suggestionsCleanup = subscribeSuggestions(props.eventId, (payload) => {
        log("Received suggestion change:", payload.new?.event_id);
        if (payload.new?.item) {
          recentlyAddedSuggestions.value.push(payload.new.item);
          setTimeout(() => {
            const index = recentlyAddedSuggestions.value.indexOf(payload.new.item);
            if (index !== -1) {
              recentlyAddedSuggestions.value.splice(index, 1);
            }
          }, 5e3);
        }
        if (payload.new && payload.new.id && payload.new.event_id === props.eventId) {
          const exists = suggestions.value.some((s) => s.id === payload.new.id);
          if (!exists) {
            suggestions.value.unshift({
              ...payload.new,
              count: 1
              // or whatever default makes sense
            });
            log("Optimistically added new suggestion:", payload.new);
          }
        }
        setTimeout(() => {
          log("Triggering fetchSuggestions due to real-time update (delayed for consistency)");
          fetchSuggestions$1();
        }, 500);
      });
      const huntItemsCleanup = subscribeHuntItems(props.eventId, (payload) => {
        log("Received hunt item change");
        fetchHuntList$1();
      });
      return { suggestionsCleanup, huntItemsCleanup };
    };
    const cleanupSubscriptions = (cleanupFunctions) => {
      if (cleanupFunctions?.suggestionsCleanup) {
        cleanupFunctions.suggestionsCleanup();
      }
      if (cleanupFunctions?.huntItemsCleanup) {
        cleanupFunctions.huntItemsCleanup();
      }
    };
    onMounted(async () => {
      try {
        log("Component mounted, event ID:", props.eventId);
        await fetchSuggestions$1();
        await fetchHuntList$1();
        const cleanupFunctions = setupRealTimeSubscriptions();
        onUnmounted(() => {
          log("Component unmounting, cleaning up subscriptions");
          cleanupSubscriptions(cleanupFunctions);
        });
        log("Component mounted successfully");
      } catch (error) {
        console.error("Error during component mounting:", error);
      }
    });
    const handleSuggestionImageError = async ({ suggestionId, type }) => {
      const suggestion = suggestions.value.find((s) => s.id === suggestionId);
      if (!suggestion) return;
      try {
        log("Handling image error for suggestion:", suggestion.item);
        const baseUrl = "/bognushunter";
        const result = await fetchGameDataForSuggestions([suggestion], baseUrl);
        if (result.error) {
          console.error("Error fetching game data:", result.error);
          return;
        }
        const updatedSuggestion = result.updatedSuggestions.find((s) => s.id === suggestion.id);
        if (updatedSuggestion && updatedSuggestion.custom_thumb) {
          log("Found game data for", suggestion.item, updatedSuggestion);
          log("Custom thumb saved for", suggestion.item);
        }
      } catch (err) {
        console.error("Error in handleSuggestionImageError:", err);
      }
    };
    const handleImageError = (event, suggestion) => {
      const target = event.target;
      target.src = getPlaceholderImage(suggestion.item);
      handleSuggestionImageError({ suggestionId: suggestion.id, type: "thumbnail" });
    };
    const getPlaceholderImage = (gameName) => {
      return `https://via.placeholder.com/300x200/e2e8f0/64748b?text=${encodeURIComponent(formatItemName(gameName))}`;
    };
    onUnmounted(() => {
      log("Component unmounting");
    });
    const __returned__ = { DEBUG, log, props, supabase, suggestions, huntList, recentlyAddedSuggestions, initialHuntListLoaded, initialSuggestionsLoaded, saveCustomThumb: saveCustomThumb$1, fetchSuggestions: fetchSuggestions$1, fetchHuntList: fetchHuntList$1, updateHuntItem: updateHuntItem$1, addToHunt: addToHunt$1, removeFromHunt: removeFromHunt$1, setupRealTimeSubscriptions, cleanupSubscriptions, handleSuggestionImageError, handleImageError, getPlaceholderImage, HuntListItemSimple, SuggestionItem };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-3 bg-brown text-gold" }, _attrs))}><div class="rounded-lg shadow p-3"><div class="mb-3"><h2 class="text-lg font-semibold text-orange">Bognus suggestions for hunt</h2><p class="text-xs mt-1 opacity-75">Click on an item to add it to the hunt list</p></div><div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2"><!--[-->`);
  ssrRenderList($setup.suggestions, (suggestion) => {
    _push(ssrRenderComponent($setup["SuggestionItem"], {
      key: suggestion.id,
      suggestion,
      "recently-added": $setup.recentlyAddedSuggestions.includes(suggestion.item),
      onAddToHunt: $setup.addToHunt,
      onImageError: $setup.handleSuggestionImageError
    }, null, _parent));
  });
  _push(`<!--]--></div></div><div class="rounded-lg shadow p-3"><h2 class="text-lg font-semibold mb-2 text-orange">Hunt List</h2><div class="space-y-2"><!--[-->`);
  ssrRenderList($setup.huntList, (huntItem) => {
    _push(ssrRenderComponent($setup["HuntListItemSimple"], {
      key: huntItem.id,
      "hunt-item": huntItem,
      onRemove: $setup.removeFromHunt
    }, null, _parent));
  });
  _push(`<!--]--></div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/Admin/SuggestionsList.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const SuggestionsList = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

const $$Astro = createAstro("https://ChristopherBF.github.io");
const prerender = false;
const $$eventId = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$eventId;
  const { eventId } = Astro2.params;
  const supabase = getSupabaseClient(Astro2.cookies);
  const { data: { user } } = await supabase.auth.getUser();
  console.log("[suggestions.astro] User from Supabase:", user ? "authenticated" : "not authenticated");
  console.log("[suggestions.astro] Event ID:", eventId);
  if (!user) {
    return Astro2.redirect("/login");
  }
  const userId = user.id;
  const basePath = "/bognushunter";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Suggestions" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="container mx-auto px-3 py-2"> <div class="flex justify-between items-center mb-3"> <h1 class="text-lg font-bold">Bognus suggestions</h1> <a${addAttribute(`${basePath}admin`, "href")} class="px-3 py-1.5 text-sm bg-orange-500 text-gold rounded hover:bg-orange-700">
Back to Admin
</a> </div> ${eventId ? renderTemplate`${renderComponent($$result2, "SuggestionsList", SuggestionsList, { "client:load": true, "eventId": eventId, "userId": userId, "client:component-hydration": "load", "client:component-path": "C:/Users/Christopher/dev/bognushunter/src/components/Admin/SuggestionsList.vue", "client:component-export": "default" })}` : renderTemplate`<div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 mb-3 text-sm"> <p>No event selected. Please select an event from the <a href="/admin" class="underline">Admin Dashboard</a>.</p> </div>`} </main> ` })}`;
}, "C:/Users/Christopher/dev/bognushunter/src/pages/suggestions/[eventId].astro", void 0);
const $$file = "C:/Users/Christopher/dev/bognushunter/src/pages/suggestions/[eventId].astro";
const $$url = "/bognushunter/suggestions/[eventId]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$eventId,
    file: $$file,
    prerender,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
