/* empty css                                    */
import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../chunks/astro/server_CjfJncYZ.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../chunks/Layout_D8JOSVxy.mjs';
import { g as getSupabaseClient } from '../../chunks/supabase_CHjbA2D-.mjs';
import { defineComponent, useSSRContext, ref, watch, computed, mergeProps, onMounted, onUnmounted } from 'vue';
import { f as formatItemName, A as ActionButton, G as GameThumbnail } from '../../chunks/ActionButton_DMSW5pXa.mjs';
import { s as showError, b as showInfo, c as showSuccess } from '../../chunks/toast_CWK5ebGW.mjs';
import { f as fetchHuntList, a as addGameToHunt, r as removeFromHunt, u as updateHuntItem } from '../../chunks/huntItemService_DwPZnxQr.mjs';
import { b as getEvent, u as updateCurrentBalance, d as updateStartingBalance } from '../../chunks/eventService_CGQAPXL2.mjs';
import { f as fetchSuggestions } from '../../chunks/suggestionService_DakLVKUk.mjs';
/* empty css                                    */
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrRenderStyle, ssrRenderList } from 'vue/server-renderer';
/* empty css                                        */
import { _ as _export_sfc } from '../../chunks/_plugin-vue_export-helper_pcqpp-6-.mjs';
export { renderers } from '../../renderers.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "HuntListItem",
  props: {
    huntItem: {
      type: Object,
      required: true
    }
  },
  emits: ["update", "remove", "image-error"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const localItem = ref({ ...props.huntItem });
    const showBalanceModal = ref(false);
    const currentBalance = ref(props.huntItem.current_balance || 0);
    const bonusTypeBeingUpdated = ref(null);
    const previousBonusState = ref(false);
    watch(() => props.huntItem, (newItem) => {
      localItem.value = { ...newItem };
    }, { deep: true });
    const formattedItemName = computed(() => {
      return formatItemName(props.huntItem.item);
    });
    function updateItem() {
      emit("update", { ...localItem.value });
    }
    function handleBonusChange(type) {
      previousBonusState.value = type === "bonus" ? !localItem.value.bonus : !localItem.value.super_bonus;
      bonusTypeBeingUpdated.value = type;
      if (type === "bonus" && localItem.value.bonus || type === "super_bonus" && localItem.value.super_bonus) {
        showBalanceModal.value = true;
      } else {
        updateItem();
      }
    }
    function saveBalanceUpdate() {
      localItem.value.current_balance = currentBalance.value;
      updateItem();
      showBalanceModal.value = false;
      bonusTypeBeingUpdated.value = null;
    }
    function cancelBalanceUpdate() {
      if (bonusTypeBeingUpdated.value === "bonus") {
        localItem.value.bonus = previousBonusState.value;
      } else if (bonusTypeBeingUpdated.value === "super_bonus") {
        localItem.value.super_bonus = previousBonusState.value;
      }
      showBalanceModal.value = false;
      bonusTypeBeingUpdated.value = null;
    }
    function handleImageError(type) {
      emit("image-error", {
        huntItemId: props.huntItem.id,
        type
      });
    }
    const __returned__ = { props, emit, localItem, showBalanceModal, currentBalance, bonusTypeBeingUpdated, previousBonusState, formattedItemName, updateItem, handleBonusChange, saveBalanceUpdate, cancelBalanceUpdate, handleImageError, GameThumbnail, ActionButton };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({
    class: ["p-3 border rounded-lg hover:bg-orange-900/40", $props.huntItem.active ? "bg-green-900/30 item-active" : "bg-gray-800/40 item-inactive"]
  }, _attrs))} data-v-9157b30b><div class="flex items-center justify-between" data-v-9157b30b><div class="flex items-center gap-3" data-v-9157b30b>`);
  _push(ssrRenderComponent($setup["GameThumbnail"], {
    "thumbnail-url": $props.huntItem.custom_thumb,
    "background-url": $props.huntItem.url_background,
    alt: $props.huntItem.item,
    size: "sm",
    onImageError: $setup.handleImageError
  }, null, _parent));
  _push(`<span class="font-medium text-gold" data-v-9157b30b>${ssrInterpolate($setup.formattedItemName)}</span></div><div class="flex items-center gap-4" data-v-9157b30b><div class="flex items-center gap-2" data-v-9157b30b><label class="text-sm text-gold" data-v-9157b30b>Wager:</label><input type="number"${ssrRenderAttr("value", $setup.localItem.wager)} class="w-24 px-2 py-1 border rounded bg-brown-dark text-gold" data-v-9157b30b></div><div class="flex items-center gap-2" data-v-9157b30b><label class="text-sm text-gold" data-v-9157b30b>Result:</label><input type="number"${ssrRenderAttr("value", $setup.localItem.result)} class="w-24 px-2 py-1 border rounded bg-brown-dark text-gold" data-v-9157b30b></div><div class="flex items-center gap-2" data-v-9157b30b><label class="text-sm text-gold" data-v-9157b30b>Bonus:</label><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray($setup.localItem.bonus) ? ssrLooseContain($setup.localItem.bonus, null) : $setup.localItem.bonus) ? " checked" : ""} class="form-checkbox h-5 w-5 text-orange-600 rounded border-orange-400 focus:ring-orange-500" data-v-9157b30b></div><div class="flex items-center gap-2" data-v-9157b30b><label class="text-sm text-gold" data-v-9157b30b>Super:</label><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray($setup.localItem.super_bonus) ? ssrLooseContain($setup.localItem.super_bonus, null) : $setup.localItem.super_bonus) ? " checked" : ""} class="form-checkbox h-5 w-5 text-orange-600 rounded border-orange-400 focus:ring-orange-500" data-v-9157b30b></div><div class="flex items-center gap-2" data-v-9157b30b><label class="text-sm text-gold" data-v-9157b30b>Done:</label><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray($setup.localItem.completed) ? ssrLooseContain($setup.localItem.completed, null) : $setup.localItem.completed) ? " checked" : ""} class="form-checkbox h-5 w-5 text-orange-600 rounded border-orange-400 focus:ring-orange-500" data-v-9157b30b></div>`);
  _push(ssrRenderComponent($setup["ActionButton"], {
    icon: "trash",
    variant: "danger",
    size: "sm",
    onClick: ($event) => $setup.emit("remove", $setup.props.huntItem.id)
  }, null, _parent));
  _push(`</div></div>`);
  if ($setup.showBalanceModal) {
    _push(`<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-v-9157b30b><div class="bg-brown-dark border border-gold rounded-lg p-6 w-96 shadow-xl" data-v-9157b30b><h3 class="text-xl font-bold text-gold mb-4" data-v-9157b30b>Enter Current Balance</h3><div class="mb-4" data-v-9157b30b><label class="block text-gold mb-2" data-v-9157b30b>Current Balance:</label><input type="number"${ssrRenderAttr("value", $setup.currentBalance)} class="w-full px-3 py-2 border rounded bg-brown-light text-gold" placeholder="Enter current balance" data-v-9157b30b></div><div class="flex justify-end gap-3" data-v-9157b30b><button class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700" data-v-9157b30b> Cancel </button><button class="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700" data-v-9157b30b> Save </button></div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/Admin/HuntListItem.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const HuntListItem = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1], ["__scopeId", "data-v-9157b30b"]]);

const DEBUG = true;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "HuntList",
  props: {
    eventId: {},
    userId: {}
  },
  setup(__props, { expose: __expose }) {
    __expose();
    const props = __props;
    const loading = ref(true);
    const huntList = ref([]);
    const startingBalance = ref(0);
    const currentBalance = ref(null);
    const games = ref([]);
    const gamesLoading = ref(false);
    const searchTerm = ref("");
    const searchTimeout = ref(null);
    const currentPage = ref(1);
    const totalItems = ref(0);
    const itemsPerPage = ref(20);
    const totalItemsCount = computed(() => huntList.value.length);
    const totalBonusCount = computed(() => huntList.value.filter((i) => i.bonus === true).length);
    const totalSuperBonusCount = computed(() => huntList.value.filter((i) => i.super_bonus === true).length);
    const formattedStartingBalance = computed(() => {
      const n = startingBalance.value ?? 0;
      try {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
      } catch {
        return `$${Math.round(n).toLocaleString("en-US")}`;
      }
    });
    const hasPrevPage = ref(false);
    const hasNextPage = ref(false);
    const suggestions = ref([]);
    const suggestionsLoading = ref(false);
    const log = (...args) => {
      {
        console.log("[HuntList]", ...args);
      }
    };
    const basePath = computed(() => "/bognushunter");
    const openStreamWindow = () => {
      console.log(`${window.location.origin}${basePath.value}stream/${props.eventId}`);
      const streamUrl = `${window.location.origin}${basePath.value}stream/${props.eventId}`;
      const windowFeatures = "width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no";
      const streamWindow = window.open(streamUrl, "huntStreamElement", windowFeatures);
      if (streamWindow) {
        streamWindow.focus();
        showSuccess("Stream element opened in new window");
      } else {
        showError("Failed to open stream window. Please check your popup blocker settings.");
      }
    };
    const fetchHuntList$1 = async () => {
      try {
        log("Fetching hunt list for event:", props.eventId);
        loading.value = true;
        const { event, error: eventError } = await getEvent(props.eventId);
        if (eventError) {
          console.error("Error fetching event details:", eventError);
          showError(`Failed to load event details: ${eventError.message}`);
        } else if (event) {
          log("Event details fetched:", event.id);
          const supabase = getSupabaseClient();
          const { data: balanceData, error: balanceError } = await supabase.from("suggestion_events").select("starting_balance, current_balance").eq("id", props.eventId).single();
          if (balanceError) {
            console.error("Error fetching balance information:", balanceError);
          } else if (balanceData) {
            startingBalance.value = balanceData.starting_balance || 0;
            currentBalance.value = balanceData.current_balance || null;
            log("Starting balance:", startingBalance.value);
            log("Current balance:", currentBalance.value);
          }
        }
        const result = await fetchHuntList(props.eventId);
        const { huntItems, error } = result;
        if (error) {
          console.error("Error fetching hunt items:", error);
          showError(`Failed to load hunt list: ${error.message}`);
          return;
        }
        huntList.value = huntItems;
        log("Hunt list fetched:", huntList.value.length);
        if (huntList.value.length === 0) {
          showInfo("Hunt list is empty. Add items from the Suggestions page.");
        }
      } catch (e) {
        console.error("Exception during hunt list fetching:", e);
        showError(`Failed to load hunt list: ${e instanceof Error ? e.message : "Unknown error"}`);
      } finally {
        loading.value = false;
      }
    };
    const updateHuntItem$1 = async (item) => {
      try {
        console.log("Full hunt item being updated:", JSON.stringify(item, null, 2));
        log("Updating hunt item with ID:", item.id);
        log("Suggestion ID:", item.suggestion_id);
        if (!item.id.includes("-")) {
          console.error("Invalid hunt item ID format. Expected UUID format but got:", item.id);
          showError("Invalid hunt item ID format. Please refresh the page and try again.");
          return;
        }
        const huntItemToUpdate = {
          id: item.id,
          // This should be the hunt_items table ID, not the suggestion ID
          event_id: item.event_id,
          suggestion_id: item.suggestion_id,
          wager: item.wager,
          result: item.result,
          bonus: item.bonus,
          super_bonus: item.super_bonus,
          completed: item.completed,
          custom_thumb: item.custom_thumb,
          url_background: item.url_background,
          item: item.item,
          active: item.active
        };
        console.log("Hunt item object being sent to service:", huntItemToUpdate);
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
        const idx = huntList.value.findIndex((i) => i.id === huntItem.id);
        if (idx !== -1) {
          huntList.value[idx] = { ...huntList.value[idx], ...huntItem };
        } else {
          await fetchHuntList$1();
        }
        log("Hunt item updated:", item.id);
        showSuccess("Hunt item updated successfully");
      } catch (e) {
        console.error("Exception during hunt item update:", e);
        showError(`Failed to update hunt item: ${e instanceof Error ? e.message : "Unknown error"}`);
      }
    };
    const removeHuntItem = async (itemId) => {
      if (!itemId) {
        console.error("Invalid item ID for removal");
        showError("Cannot remove item: Invalid ID");
        return;
      }
      try {
        log("Removing hunt item with ID:", itemId);
        const itemName = huntList.value.find((item) => item.id === itemId)?.item || "Item";
        showInfo(`Removing "${formatItemName(itemName)}" from hunt list...`);
        const originalList = [...huntList.value];
        huntList.value = huntList.value.filter((item) => item.id !== itemId);
        const { success, error, data } = await removeFromHunt(itemId);
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
        log("Hunt item removed successfully:", data);
        showSuccess(`"${formatItemName(itemName)}" removed from hunt list!`);
      } catch (e) {
        console.error("Exception during hunt item removal:", e);
        showError(`An error occurred while removing the item: ${e instanceof Error ? e.message : "Unknown error"}`);
        await fetchHuntList$1();
      }
    };
    const updateStartingBalance$1 = async () => {
      try {
        log("Updating starting balance for event:", props.eventId);
        const { success, error } = await updateStartingBalance(props.eventId, startingBalance.value);
        if (error) {
          console.error("Error updating starting balance:", error);
          showError(`Failed to update starting balance: ${error.message}`);
          return;
        }
        if (!success) {
          console.error("Failed to update starting balance");
          showError("Failed to update starting balance: Unknown error");
          return;
        }
        log("Starting balance updated for event:", props.eventId);
        showSuccess("Starting balance updated successfully");
      } catch (e) {
        console.error("Exception during starting balance update:", e);
        showError(`Failed to update starting balance: ${e instanceof Error ? e.message : "Unknown error"}`);
      }
    };
    const updateCurrentBalance$1 = async () => {
      try {
        log("Updating current balance for event:", props.eventId);
        const { success, error } = await updateCurrentBalance(props.eventId, currentBalance.value);
        if (error) {
          console.error("Error updating current balance:", error);
          showError(`Failed to update current balance: ${error.message}`);
          return;
        }
        if (!success) {
          console.error("Failed to update current balance");
          showError("Failed to update current balance: Unknown error");
          return;
        }
        log("Current balance updated for event:", props.eventId);
        showSuccess("Current balance updated successfully");
      } catch (e) {
        console.error("Exception during current balance update:", e);
        showError(`Failed to update current balance: ${e instanceof Error ? e.message : "Unknown error"}`);
      }
    };
    const calculateTotalWager = () => {
      return huntList.value.reduce((total, item) => {
        return total + (item.wager || 0);
      }, 0);
    };
    const calculateTotalResult = () => {
      return huntList.value.reduce((total, item) => {
        return total + (item.result || 0);
      }, 0);
    };
    const calculateProfit = () => {
      return calculateTotalResult() - calculateTotalWager();
    };
    const getPlaceholderImage = (itemName) => {
      return `https://placehold.co/100x100/orange/white?text=${encodeURIComponent(itemName.substring(0, 2).toUpperCase())}`;
    };
    const handleImageError = (event, item) => {
      const target = event.target;
      target.src = getPlaceholderImage(item.item);
    };
    const formatGameName = (name) => {
      if (!name) return "";
      return name.replace(/-/g, " ").split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    };
    const handleGameImageError = (event, game) => {
      const target = event.target;
      if (target.src !== game.custom_thumb && game.custom_thumb) {
        target.src = game.custom_thumb?.replace("cdn://", "https://cdnv1.500.casino/");
      } else {
        target.src = `https://via.placeholder.com/300x200/e2e8f0/64748b?text=${encodeURIComponent(formatGameName(game.name))}`;
      }
    };
    const isGameInHuntList = (gameName) => {
      return huntList.value.some((item) => item.item === gameName);
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
        gamesLoading.value = false;
        return;
      }
      gamesLoading.value = true;
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
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        const data = await response.json();
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
        gamesLoading.value = false;
      }
    };
    const resetAndFetchGames = () => {
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
    const addGameToHunt$1 = async (game) => {
      if (isGameInHuntList(game.name)) {
        showInfo(`"${formatGameName(game.name)}" is already in the hunt list`);
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
        await fetchHuntList$1();
        showSuccess(`"${formatGameName(game.name)}" added to hunt list!`);
        console.log("Game added to hunt list successfully:", huntItem);
      } catch (error) {
        console.error("Error adding to hunt list:", error);
        showError(`Failed to add "${formatGameName(game.name)}" to hunt list. Please try again.`);
      }
    };
    const fetchSuggestionsData = async () => {
      try {
        suggestionsLoading.value = true;
        log("Fetching suggestions for event:", props.eventId);
        const { suggestions: fetchedSuggestions, error } = await fetchSuggestions(props.eventId);
        if (error) {
          console.error("Error fetching suggestions:", error);
          showError(`Failed to load suggestions: ${error.message}`);
          return;
        }
        suggestions.value = fetchedSuggestions;
        log("Suggestions fetched:", suggestions.value.length);
      } catch (e) {
        console.error("Exception during suggestions fetching:", e);
        showError(`Failed to load suggestions: ${e instanceof Error ? e.message : "Unknown error"}`);
      } finally {
        suggestionsLoading.value = false;
      }
    };
    const handleSuggestionImageError = (event) => {
      const img = event.target;
      img.src = "/placeholder-game.png";
    };
    const addSuggestionToHunt = async (suggestion) => {
      if (isGameInHuntList(suggestion.item)) {
        showInfo(`"${formatGameName(suggestion.item)}" is already in the hunt list`);
        return;
      }
      try {
        console.log("Adding suggestion to hunt list:", suggestion);
        const { huntItem, error, exists } = await addGameToHunt(
          props.eventId,
          suggestion.item,
          props.userId,
          suggestion.custom_thumb || suggestion.url_thumb || null,
          suggestion.url_background || null
        );
        if (error) {
          console.error("Error adding suggestion to hunt list:", error);
          showError(`Failed to add "${formatGameName(suggestion.item)}" to hunt list: ${error.message}`);
          return;
        }
        if (exists) {
          showInfo(`"${formatGameName(suggestion.item)}" is already in the hunt list`);
          return;
        }
        await fetchHuntList$1();
        showSuccess(`"${formatGameName(suggestion.item)}" added to hunt list!`);
        console.log("Suggestion added to hunt list successfully:", huntItem);
      } catch (error) {
        console.error("Error adding suggestion to hunt list:", error);
        showError(`Failed to add "${formatGameName(suggestion.item)}" to hunt list. Please try again.`);
      }
    };
    const setupSuggestionsSubscription = () => {
      const supabase = getSupabaseClient();
      log("Setting up real-time subscription for suggestions");
      const suggestionsChannel2 = supabase.channel("suggestions-changes").on(
        "postgres_changes",
        {
          event: "*",
          // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "suggestions",
          filter: `event_id=eq.${props.eventId}`
        },
        (payload) => {
          log("Suggestions change detected:", payload);
          if (suggestionsRefreshTimeout.value) {
            clearTimeout(suggestionsRefreshTimeout.value);
          }
          suggestionsRefreshTimeout.value = setTimeout(() => {
            log("Refreshing suggestions due to real-time update");
            fetchSuggestionsData();
          }, 500);
        }
      ).subscribe((status) => {
        log("Suggestions subscription status:", status);
      });
      return suggestionsChannel2;
    };
    const cleanupSubscriptions = (channel) => {
      if (channel) {
        log("Cleaning up suggestions subscription");
        channel.unsubscribe();
      }
    };
    let suggestionsChannel;
    const suggestionsRefreshTimeout = ref(null);
    onMounted(async () => {
      log("Component mounted");
      await fetchHuntList$1();
      await fetchSuggestionsData();
      suggestionsChannel = setupSuggestionsSubscription();
    });
    onUnmounted(() => {
      log("Component unmounting, cleaning up subscriptions");
      cleanupSubscriptions(suggestionsChannel);
      if (suggestionsRefreshTimeout.value) {
        clearTimeout(suggestionsRefreshTimeout.value);
      }
    });
    const __returned__ = { DEBUG, props, loading, huntList, startingBalance, currentBalance, games, gamesLoading, searchTerm, searchTimeout, currentPage, totalItems, itemsPerPage, totalItemsCount, totalBonusCount, totalSuperBonusCount, formattedStartingBalance, hasPrevPage, hasNextPage, suggestions, suggestionsLoading, log, basePath, openStreamWindow, fetchHuntList: fetchHuntList$1, updateHuntItem: updateHuntItem$1, removeHuntItem, updateStartingBalance: updateStartingBalance$1, updateCurrentBalance: updateCurrentBalance$1, calculateTotalWager, calculateTotalResult, calculateProfit, getPlaceholderImage, handleImageError, formatGameName, handleGameImageError, isGameInHuntList, handleSearchInput, fetchGames, resetAndFetchGames, nextPage, prevPage, addGameToHunt: addGameToHunt$1, fetchSuggestionsData, handleSuggestionImageError, addSuggestionToHunt, setupSuggestionsSubscription, cleanupSubscriptions, get suggestionsChannel() {
      return suggestionsChannel;
    }, set suggestionsChannel(v) {
      suggestionsChannel = v;
    }, suggestionsRefreshTimeout, HuntListItem };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex gap-6" }, _attrs))}><div class="flex-1 space-y-6"><div class="bg-brown rounded-lg shadow p-6"><div class="flex items-center justify-between mb-4"><h2 class="text-xl font-semibold text-gold">Hunt List</h2><button class="flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-md transition-colors" title="Open Stream Element in New Window"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg> Stream Element </button></div><div class="mb-6 p-4 bg-brown-dark rounded-lg border border-orange"><h3 class="text-lg font-semibold mb-3 text-gold">Add Games to Hunt</h3><div class="mb-3"><div class="relative"><input style="${ssrRenderStyle({ "background-color": "#592101" })}"${ssrRenderAttr("value", $setup.searchTerm)} type="text" placeholder="Search for games to add to hunt list..." class="w-full px-3 py-2 text-sm border rounded-md pr-10 text-gold"><button class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gold hover:text-gray-700 bg-orange p-1 rounded"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></button></div></div>`);
  if ($setup.gamesLoading) {
    _push(`<div class="flex justify-center my-4"><div class="w-6 h-6 border-2 border-orange border-t-transparent rounded-full animate-spin"></div></div>`);
  } else if (!$setup.gamesLoading && $setup.games.length > 0) {
    _push(`<div class="space-y-2 max-h-60 overflow-y-auto"><!--[-->`);
    ssrRenderList($setup.games, (game) => {
      _push(`<div class="flex items-center p-2 border rounded hover:bg-orange-900/40 transition-all duration-200"><div class="relative w-10 h-10 mr-3 overflow-hidden rounded flex-shrink-0"><img${ssrRenderAttr("src", game.custom_thumb?.replace("cdn://", "https://cdnv1.500.casino/") || game.url_thumb)}${ssrRenderAttr("alt", game.name)} class="w-full h-full object-cover"></div><div class="flex-grow min-w-0"><div class="flex items-center justify-between"><span class="font-medium text-gold text-sm truncate">${ssrInterpolate($setup.formatGameName(game.name))}</span>`);
      if (game.rtp) {
        _push(`<span class="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 rounded ml-2 flex-shrink-0">${ssrInterpolate(game.rtp)}%</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="text-gold text-xs opacity-75">${ssrInterpolate(game.provider)}</div></div><button${ssrIncludeBooleanAttr($setup.isGameInHuntList(game.name)) ? " disabled" : ""} class="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-2"${ssrRenderAttr("title", $setup.isGameInHuntList(game.name) ? "Already in hunt list" : "Add to hunt list")}>${ssrInterpolate($setup.isGameInHuntList(game.name) ? "✓ Added" : "+ Add to Hunt")}</button></div>`);
    });
    _push(`<!--]--></div>`);
  } else if (!$setup.gamesLoading && $setup.games.length === 0 && $setup.searchTerm.trim() !== "") {
    _push(`<div class="text-center py-4"><p class="text-gold text-sm">No games found. Try a different search term.</p></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($setup.games.length > 0) {
    _push(`<div class="mt-3 flex justify-between items-center text-sm"><button${ssrIncludeBooleanAttr($setup.currentPage === 1 || !$setup.hasPrevPage) ? " disabled" : ""} class="px-3 py-1.5 border rounded bg-orange text-gold disabled:opacity-50 disabled:cursor-not-allowed text-sm"> Previous </button><span class="text-gold">Page ${ssrInterpolate($setup.currentPage)}</span><button${ssrIncludeBooleanAttr(!$setup.hasNextPage) ? " disabled" : ""} class="px-3 py-1.5 border rounded bg-orange text-gold disabled:opacity-50 disabled:cursor-not-allowed text-sm"> Next </button></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
  if (!$setup.loading) {
    _push(`<div class="mb-3"><div class="flex flex-wrap items-center gap-3 px-3 py-2 bg-brown-dark rounded border border-orange"><div class="text-xs text-gold/80">Starting</div><div class="text-sm font-semibold text-gold">${ssrInterpolate($setup.formattedStartingBalance)}</div><span class="mx-2 h-4 w-px bg-orange/40"></span><div class="text-xs text-gold/80">Items</div><div class="text-sm font-semibold text-gold">${ssrInterpolate($setup.totalItemsCount)}</div><span class="mx-2 h-4 w-px bg-orange/40"></span><div class="text-xs text-gold/80">Bonuses</div><div class="text-sm font-semibold text-violet-300">${ssrInterpolate($setup.totalBonusCount)}</div><span class="mx-2 h-4 w-px bg-orange/40"></span><div class="text-xs text-gold/80">Super</div><div class="text-sm font-semibold text-amber-300">${ssrInterpolate($setup.totalSuperBonusCount)}</div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($setup.loading) {
    _push(`<div class="flex justify-center my-8"><div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>`);
  } else if ($setup.huntList.length > 0) {
    _push(`<div class="space-y-4"><!--[-->`);
    ssrRenderList($setup.huntList, (huntItem) => {
      _push(ssrRenderComponent($setup["HuntListItem"], {
        key: huntItem.id,
        "hunt-item": huntItem,
        onUpdate: $setup.updateHuntItem,
        onRemove: $setup.removeHuntItem
      }, null, _parent));
    });
    _push(`<!--]--></div>`);
  } else {
    _push(`<div class="text-center py-8"><p class="text-gold">No items in the hunt list yet.</p></div>`);
  }
  _push(`</div></div><div class="w-80 space-y-3"><div class="bg-brown rounded-lg shadow p-4"><div class="flex items-center justify-between mb-3"><h3 class="text-lg font-semibold text-gold">Suggestions</h3><span class="text-sm text-orange bg-brown-dark px-2 py-1 rounded">${ssrInterpolate($setup.suggestions.length)}</span></div>`);
  if ($setup.suggestionsLoading) {
    _push(`<div class="flex justify-center my-4"><div class="w-6 h-6 border-2 border-orange border-t-transparent rounded-full animate-spin"></div></div>`);
  } else if ($setup.suggestions.length > 0) {
    _push(`<div class="space-y-2 max-h-96 overflow-y-auto"><!--[-->`);
    ssrRenderList($setup.suggestions, (suggestion) => {
      _push(`<div class="flex items-center p-2 border rounded hover:bg-orange-900/40 transition-all duration-200"><div class="relative w-8 h-8 mr-2 overflow-hidden rounded flex-shrink-0"><img${ssrRenderAttr("src", suggestion.custom_thumb?.replace("cdn://", "https://cdnv1.500.casino/") || suggestion.url_thumb || "/placeholder-game.png")}${ssrRenderAttr("alt", suggestion.item)} class="w-full h-full object-cover"></div><div class="flex-grow min-w-0 mr-2"><div class="font-medium text-gold text-sm truncate">${ssrInterpolate($setup.formatGameName(suggestion.item))}</div><div class="text-xs text-orange">${ssrInterpolate(suggestion.count)} suggestion${ssrInterpolate(suggestion.count > 1 ? "s" : "")}</div></div><button${ssrIncludeBooleanAttr($setup.isGameInHuntList(suggestion.item)) ? " disabled" : ""} class="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"${ssrRenderAttr("title", $setup.isGameInHuntList(suggestion.item) ? "Already in hunt list" : "Add to hunt list")}>${ssrInterpolate($setup.isGameInHuntList(suggestion.item) ? "✓" : "+")}</button></div>`);
    });
    _push(`<!--]--></div>`);
  } else {
    _push(`<div class="text-center py-4"><p class="text-gold text-sm">No suggestions yet.</p><p class="text-gold text-xs opacity-75 mt-1">Users can add suggestions from the main page.</p></div>`);
  }
  _push(`</div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/Admin/HuntList.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const HuntList = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

const $$Astro = createAstro("https://ChristopherBF.github.io");
const prerender = false;
const $$eventId = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$eventId;
  const { eventId } = Astro2.params;
  const supabase = getSupabaseClient(Astro2.cookies);
  const { data: { user } } = await supabase.auth.getUser();
  console.log("[huntlist.astro] User from Supabase:", user ? "authenticated" : "not authenticated");
  console.log("[huntlist.astro] Event ID:", eventId);
  if (!user) {
    return Astro2.redirect("/login");
  }
  const userId = user.id;
  const basePath = "/bognushunter";
  let eventDate = "";
  if (eventId) {
    try {
      const { data: eventData, error: eventError } = await supabase.from("suggestion_events").select("date").eq("id", eventId).single();
      if (eventError) {
        console.error("Error fetching event:", eventError);
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
      }
    } catch (e) {
      console.error("Exception during event fetch:", e);
    }
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `Hunt List - ${eventDate}` }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="container mx-auto px-4 py-8"> <div class="flex justify-between items-center mb-6"> <h1 class="text-2xl font-bold">Hunt List - ${eventDate}</h1> <a${addAttribute(`${basePath}admin`, "href")} class="px-4 py-2 bg-orange-500 text-gold rounded-lg hover:bg-orange-700">
Back to Admin
</a> </div> ${eventId ? renderTemplate`${renderComponent($$result2, "HuntList", HuntList, { "client:load": true, "eventId": eventId, "userId": userId, "client:component-hydration": "load", "client:component-path": "C:/Users/Christopher/dev/bognushunter/src/components/Admin/HuntList.vue", "client:component-export": "default" })}` : renderTemplate`<div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6"> <p>No event selected. Please select an event from the <a${addAttribute(`${basePath}admin`, "href")} class="underline">Admin Dashboard</a>.</p> </div>`} </main> ` })}`;
}, "C:/Users/Christopher/dev/bognushunter/src/pages/huntlist/[eventId].astro", void 0);
const $$file = "C:/Users/Christopher/dev/bognushunter/src/pages/huntlist/[eventId].astro";
const $$url = "/bognushunter/huntlist/[eventId]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$eventId,
    file: $$file,
    prerender,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
