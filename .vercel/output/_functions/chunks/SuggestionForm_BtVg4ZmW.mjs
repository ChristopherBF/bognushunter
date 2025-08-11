import { defineComponent, useSSRContext, ref, onMounted, onUnmounted, mergeProps } from 'vue';
import { g as getSupabaseClient } from './supabase_CHjbA2D-.mjs';
import { a as addSuggestion } from './suggestionService_DakLVKUk.mjs';
import { a as addGameToHunt } from './huntItemService_DwPZnxQr.mjs';
import { s as showError, b as showInfo, c as showSuccess } from './toast_CWK5ebGW.mjs';
/* empty css                         */
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderAttr, ssrRenderList, ssrInterpolate, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper_pcqpp-6-.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SuggestionForm",
  props: {
    eventId: {},
    userId: {}
  },
  setup(__props, { expose: __expose }) {
    __expose();
    const props = __props;
    const games = ref([]);
    const suggestedItems = ref([]);
    const huntItems = ref([]);
    const loading = ref(false);
    const currentPage = ref(1);
    const totalItems = ref(0);
    const itemsPerPage = ref(36);
    const searchTerm = ref("");
    const searchTimeout = ref(null);
    const hasPrevPage = ref(false);
    const hasNextPage = ref(false);
    const formatGameName = (name) => {
      if (!name) return "";
      return name.replace(/-/g, " ").split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    };
    const formatFeature = (feature) => {
      if (!feature) return "";
      return feature.replace(/-/g, " ").split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    };
    const handleImageError = (event, game) => {
      const target = event.target;
      if (target.src !== game.custom_thumb && game.custom_thumb) {
        target.src = game.custom_thumb?.replace("cdn://", "https://cdnv1.500.casino/");
      } else {
        target.src = `https://via.placeholder.com/300x200/e2e8f0/64748b?text=${encodeURIComponent(formatGameName(game.name))}`;
      }
    };
    const handleSearchInput = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
      }
      searchTimeout.value = setTimeout(() => {
        resetAndFetchGames();
        showInfo("Searching for games...");
      }, 500);
    };
    const fetchGames = async () => {
      if (!searchTerm.value.trim()) {
        games.value = [];
        totalItems.value = 0;
        loading.value = false;
        return;
      }
      loading.value = true;
      console.log("Fetching games with params:", {
        search: searchTerm.value,
        page: currentPage.value,
        perPage: itemsPerPage.value
      });
      try {
        const apiUrl = "/bognushunter/api/games";
        const response = await fetch(apiUrl, {
          method: "POST",
          body: JSON.stringify({
            search: searchTerm.value,
            page: currentPage.value,
            perPage: itemsPerPage.value
          }),
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
            "Accept": "application/json"
          }
        });
        console.log("API Response status:", response.status);
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        const data = await response.json();
        console.log("API Response data:", data);
        games.value = data.results || [];
        totalItems.value = data.pagination?.totalEntries || 0;
        hasPrevPage.value = data.pagination?.hasPrev || false;
        hasNextPage.value = data.pagination?.hasNext || false;
      } catch (error) {
        console.error("Error fetching games:", error);
        showError("Failed to load games. Please try again.");
        games.value = [];
        totalItems.value = 0;
        hasPrevPage.value = false;
        hasNextPage.value = false;
      } finally {
        loading.value = false;
      }
    };
    const resetAndFetchGames = () => {
      console.log("Resetting pagination and fetching games");
      currentPage.value = 1;
      fetchGames();
    };
    const nextPage = () => {
      if (hasNextPage.value) {
        currentPage.value++;
        fetchGames();
      }
    };
    const prevPage = () => {
      if (hasPrevPage.value && currentPage.value > 1) {
        currentPage.value--;
        fetchGames();
      }
    };
    const suggestItem = async (item) => {
      if (suggestedItems.value.includes(item)) {
        return;
      }
      const selectedGame = games.value.find((game) => game.name === item);
      try {
        console.log("Suggesting item with game data:", selectedGame);
        const { suggestion, error } = await addSuggestion(
          props.eventId,
          // This can be null/invalid, service will handle it
          item,
          props.userId,
          selectedGame?.custom_thumb || selectedGame?.url_thumb || null,
          selectedGame?.url_background || null
        );
        if (error) {
          console.error("Error suggesting item:", error);
          showError(`Failed to suggest "${formatGameName(item)}": ${error.message}`);
          return;
        }
        suggestedItems.value.push(item);
        console.log("Item suggested successfully with images:", {
          custom_thumb: selectedGame?.custom_thumb || selectedGame?.url_thumb,
          url_background: selectedGame?.url_background,
          suggestion
        });
      } catch (error) {
        console.error("Error suggesting item:", error);
        showError(`Failed to suggest "${formatGameName(item)}". Please try again.`);
      }
    };
    const addToHuntList = async (game) => {
      if (huntItems.value.includes(game.name)) {
        return;
      }
      try {
        console.log("Adding game to hunt list:", game);
        const { huntItem, error, exists } = await addGameToHunt(
          props.eventId,
          game.name,
          props.userId,
          game.custom_thumb || game.url_thumb || null,
          game.url_background || null
        );
        if (error) {
          console.error("Error adding to hunt list:", error);
          showError(`Failed to add "${formatGameName(game.name)}" to hunt list: ${error.message}`);
          return;
        }
        if (exists) {
          showInfo(`"${formatGameName(game.name)}" is already in the hunt list`);
          return;
        }
        huntItems.value.push(game.name);
        if (!suggestedItems.value.includes(game.name)) {
          suggestedItems.value.push(game.name);
        }
        showSuccess(`"${formatGameName(game.name)}" added to hunt list!`);
        console.log("Game added to hunt list successfully:", huntItem);
      } catch (error) {
        console.error("Error adding to hunt list:", error);
        showError(`Failed to add "${formatGameName(game.name)}" to hunt list. Please try again.`);
      }
    };
    const fetchHuntItems = async () => {
      const supabase = getSupabaseClient();
      try {
        const { data: huntItemsData, error: huntError } = await supabase.from("hunt_items").select("suggestion_id").eq("event_id", props.eventId);
        if (huntError) throw huntError;
        if (huntItemsData && huntItemsData.length > 0) {
          const suggestionIds = huntItemsData.map((item) => item.suggestion_id);
          const { data: suggestionsData, error: suggestionsError } = await supabase.from("suggestions").select("item").in("id", suggestionIds);
          if (suggestionsError) throw suggestionsError;
          huntItems.value = suggestionsData?.map((suggestion) => suggestion.item) || [];
        } else {
          huntItems.value = [];
        }
      } catch (error) {
        console.error("Error fetching hunt items:", error);
      }
    };
    const fetchSuggestedItems = async () => {
      const supabase = getSupabaseClient();
      try {
        const { data, error } = await supabase.from("suggestions").select("item").eq("event_id", props.eventId).eq("user_id", props.userId);
        if (error) throw error;
        suggestedItems.value = data?.map((suggestion) => suggestion.item) || [];
      } catch (error) {
        console.error("Error fetching suggested items:", error);
      }
    };
    const cleanupSubscriptions = (channel) => {
      if (channel) {
        console.log("Cleaning up real-time subscriptions");
        channel.unsubscribe();
      }
    };
    let suggestionsChannel;
    onMounted(() => {
      console.log("Component mounted, calling fetchGames...");
      fetchGames();
      console.log("Called fetchGames, now calling fetchSuggestedItems...");
      fetchSuggestedItems();
      console.log("Called fetchSuggestedItems, now calling fetchHuntItems...");
      fetchHuntItems();
      console.log("Component initialization complete");
    });
    onUnmounted(() => {
      console.log("Component unmounting, cleaning up subscriptions");
      cleanupSubscriptions(suggestionsChannel);
    });
    const __returned__ = { props, games, suggestedItems, huntItems, loading, currentPage, totalItems, itemsPerPage, searchTerm, searchTimeout, hasPrevPage, hasNextPage, formatGameName, formatFeature, handleImageError, handleSearchInput, fetchGames, resetAndFetchGames, nextPage, prevPage, suggestItem, addToHuntList, fetchHuntItems, fetchSuggestedItems, cleanupSubscriptions, get suggestionsChannel() {
      return suggestionsChannel;
    }, set suggestionsChannel(v) {
      suggestionsChannel = v;
    } };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-3" }, _attrs))}><div class="bg-brown rounded-lg shadow p-3"><div class="mb-2"><div class="relative"><input style="${ssrRenderStyle({ "background-color": "#592101" })}"${ssrRenderAttr("value", $setup.searchTerm)} type="text" placeholder="Search for games..." class="w-full px-3 py-1.5 text-sm border rounded-md pr-8"><button class="absolute right-1.5 top-1/2 transform -translate-y-1/2 text-gold hover:text-gray-700 bg-orange p-1 rounded"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></button></div></div>`);
  if ($setup.loading) {
    _push(`<div class="flex justify-center my-4"><div class="w-6 h-6 border-2 border-orange border-t-transparent rounded-full animate-spin"></div></div>`);
  } else if (!$setup.loading && $setup.games.length > 0) {
    _push(`<div class="space-y-1"><!--[-->`);
    ssrRenderList($setup.games, (game) => {
      _push(`<div class="flex items-center p-2 border rounded hover:bg-orange-900/40 cursor-pointer transition-all duration-200"><div class="relative w-12 h-12 mr-3 overflow-hidden rounded flex-shrink-0"><img${ssrRenderAttr("src", game.custom_thumb?.replace("cdn://", "https://cdnv1.500.casino/") || game.url_thumb)}${ssrRenderAttr("alt", game.name)} class="w-full h-full object-cover"></div><div class="flex-grow min-w-0"><div class="flex items-center justify-between"><span class="font-medium text-gold text-sm truncate">${ssrInterpolate($setup.formatGameName(game.name))}</span>`);
      if (game.rtp) {
        _push(`<span class="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 rounded ml-2 flex-shrink-0">${ssrInterpolate(game.rtp)}%</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="text-gold text-xs opacity-75">${ssrInterpolate(game.provider)}</div>`);
      if (game.features && game.features.length) {
        _push(`<div class="flex flex-wrap gap-1 mt-1"><!--[-->`);
        ssrRenderList(game.features.slice(0, 3), (feature) => {
          _push(`<span class="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">${ssrInterpolate($setup.formatFeature(feature))}</span>`);
        });
        _push(`<!--]-->`);
        if (game.features.length > 3) {
          _push(`<span class="text-xs text-gold opacity-50">+${ssrInterpolate(game.features.length - 3)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex flex-col gap-1 ml-2"><button${ssrIncludeBooleanAttr($setup.huntItems.includes(game.name)) ? " disabled" : ""} class="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"${ssrRenderAttr("title", $setup.huntItems.includes(game.name) ? "Already in hunt list" : "Add to hunt list")}>${ssrInterpolate($setup.huntItems.includes(game.name) ? "\u2713 Hunt" : "+ Hunt")}</button></div></div>`);
    });
    _push(`<!--]--></div>`);
  } else if (!$setup.loading && $setup.games.length === 0 && $setup.searchTerm.trim() !== "") {
    _push(`<div class="text-center py-4"><p class="text-gold text-sm">No games found. Try a different search term.</p></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<div class="mt-3 flex justify-between items-center text-sm"><button${ssrIncludeBooleanAttr($setup.currentPage === 1 || !$setup.hasPrevPage) ? " disabled" : ""} class="px-3 py-1.5 border rounded bg-orange text-gold disabled:opacity-50 disabled:cursor-not-allowed text-sm"> Previous </button><span class="text-gold">Page ${ssrInterpolate($setup.currentPage)}</span><button${ssrIncludeBooleanAttr(!$setup.hasNextPage) ? " disabled" : ""} class="px-3 py-1.5 border rounded bg-orange text-gold disabled:opacity-50 disabled:cursor-not-allowed text-sm"> Next </button></div></div><div class="rounded-lg shadow p-3"><h2 class="text-lg font-semibold mb-2 text-orange">Your Suggestions</h2><div class="space-y-1"><!--[-->`);
  ssrRenderList($setup.suggestedItems, (item) => {
    _push(`<div class="flex items-center justify-between p-2 border rounded hover:bg-orange text-sm"><span class="truncate">${ssrInterpolate($setup.formatGameName(item))}</span><span class="text-green-600 text-xs ml-2 flex-shrink-0">\u2713</span></div>`);
  });
  _push(`<!--]--></div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/User/SuggestionForm.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const SuggestionForm = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { SuggestionForm as S };
