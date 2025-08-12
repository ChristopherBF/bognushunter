/* empty css                                    */
import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_CU4hg0qs.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../chunks/Layout_B5w-Bvlh.mjs';
import { g as getSupabaseClient } from '../../chunks/supabase_CHjbA2D-.mjs';
import { defineComponent, useSSRContext, ref, computed, onMounted, nextTick, onUnmounted, watch, mergeProps } from 'vue';
import { b as getEvent } from '../../chunks/eventService_CGQAPXL2.mjs';
import { f as fetchHuntList } from '../../chunks/huntItemService_DwPZnxQr.mjs';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrRenderStyle, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
/* empty css                                        */
import { _ as _export_sfc } from '../../chunks/_plugin-vue_export-helper_pcqpp-6-.mjs';
export { renderers } from '../../renderers.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "HuntGamesStream",
  props: {
    eventId: {},
    refreshInterval: { default: 30 }
  },
  setup(__props, { expose: __expose }) {
    __expose();
    const props = __props;
    const huntItems = ref([]);
    const loading = ref(true);
    const startingBalance = ref(0);
    const tickerContainer = ref(null);
    const tickerTrack = ref(null);
    const scrollDistance = ref(0);
    let refreshTimer = null;
    let realtimeChannel = null;
    const fetchHuntItems = async () => {
      console.log("Fetching hunt items for eventId:", props.eventId);
      try {
        const { huntItems: items, error } = await fetchHuntList(props.eventId);
        if (error) {
          console.error("Error fetching hunt items:", error);
          return;
        }
        console.log("Fetched hunt items:", items);
        huntItems.value = items.filter((item) => item.active);
      } catch (error) {
        console.error("Exception fetching hunt items:", error);
      } finally {
        loading.value = false;
        await nextTick();
        updateScrollDistance();
      }
    };
    const totalBonus = computed(() => huntItems.value.filter((i) => i.bonus).length);
    const totalSuper = computed(() => huntItems.value.filter((i) => i.super_bonus).length);
    const totalItems = computed(() => huntItems.value.length);
    const formatCurrency = (val) => {
      const n = typeof val === "number" ? val : 0;
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
    };
    const getGameStatusClass = (item) => {
      if (item.super_bonus) return "super-bonus";
      if (item.bonus) return "bonus";
      return "regular";
    };
    const getGameTooltip = (item) => {
      const status = item.super_bonus ? "Super Bonus" : item.bonus ? "Bonus" : "Regular";
      const wager = item.wager ? `Wager: ${item.wager}` : "";
      const result = item.result ? `Result: ${item.result}` : "";
      return [item.item, status, wager, result].filter(Boolean).join(" \u2022 ");
    };
    const getGameThumbnail = (item) => {
      if (item.custom_thumb) {
        return item.custom_thumb.replace("cdn://", "https://cdnv1.500.casino/");
      }
      return "/placeholder-game.png";
    };
    const formatGameName = (name) => {
      return name.length > 20 ? name.substring(0, 17) + "..." : name;
    };
    const handleImageError = (event) => {
      const img = event.target;
      img.src = "/placeholder-game.png";
    };
    const setupRealtimeUpdates = () => {
      const supabase = getSupabaseClient();
      realtimeChannel = supabase.channel("hunt-items-stream").on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "hunt_items",
          filter: `event_id=eq.${props.eventId}`
        },
        () => {
          fetchHuntItems();
        }
      ).on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "suggestion_events",
          filter: `id=eq.${props.eventId}`
        },
        (payload) => {
          const newStarting = payload?.new?.starting_balance;
          if (typeof newStarting === "number") {
            startingBalance.value = newStarting;
          } else {
            getEvent(props.eventId).then(({ event }) => {
              if (event && typeof event.starting_balance === "number") {
                startingBalance.value = event.starting_balance;
              }
            }).catch(() => {
            });
          }
        }
      ).subscribe();
    };
    const setupAutoRefresh = () => {
      if (props.refreshInterval > 0) {
        refreshTimer = setInterval(() => {
          fetchHuntItems();
        }, props.refreshInterval * 1e3);
      }
    };
    const cleanup = () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
      }
      if (realtimeChannel) {
        realtimeChannel.unsubscribe();
        realtimeChannel = null;
      }
    };
    onMounted(async () => {
      await fetchHuntItems();
      try {
        const { event } = await getEvent(props.eventId);
        if (event && typeof event.starting_balance === "number") {
          startingBalance.value = event.starting_balance;
        }
      } catch (e) {
        console.error("Error fetching event for starting balance", e);
      }
      setupRealtimeUpdates();
      setupAutoRefresh();
      await nextTick();
      updateScrollDistance();
      window.addEventListener("resize", updateScrollDistance);
    });
    onUnmounted(() => {
      cleanup();
      window.removeEventListener("resize", updateScrollDistance);
    });
    watch(huntItems, async () => {
      await nextTick();
      updateScrollDistance();
    });
    const updateScrollDistance = () => {
      const c = tickerContainer.value?.offsetWidth || 0;
      const t = tickerTrack.value?.scrollWidth || 0;
      scrollDistance.value = Math.max(0, t - c);
    };
    const __returned__ = { props, huntItems, loading, startingBalance, tickerContainer, tickerTrack, scrollDistance, get refreshTimer() {
      return refreshTimer;
    }, set refreshTimer(v) {
      refreshTimer = v;
    }, get realtimeChannel() {
      return realtimeChannel;
    }, set realtimeChannel(v) {
      realtimeChannel = v;
    }, fetchHuntItems, totalBonus, totalSuper, totalItems, formatCurrency, getGameStatusClass, getGameTooltip, getGameThumbnail, formatGameName, handleImageError, setupRealtimeUpdates, setupAutoRefresh, cleanup, updateScrollDistance };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "hunt-games-stream" }, _attrs))} data-v-b6e6b833>`);
  if ($setup.loading) {
    _push(`<div class="flex justify-center items-center p-2" data-v-b6e6b833><div class="w-4 h-4 border-2 border-orange border-t-transparent rounded-full animate-spin" data-v-b6e6b833></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if (!$setup.loading) {
    _push(`<div class="stream-stats" data-v-b6e6b833><div class="stat" data-v-b6e6b833><span class="label" data-v-b6e6b833>Starting</span><span class="value value-gold" data-v-b6e6b833>${ssrInterpolate($setup.formatCurrency($setup.startingBalance))}</span></div><div class="stat" data-v-b6e6b833><span class="label" data-v-b6e6b833>Items</span><span class="value value-gold" data-v-b6e6b833>${ssrInterpolate($setup.totalItems)}</span></div><div class="stat" data-v-b6e6b833><span class="label" data-v-b6e6b833>Bonuses</span><span class="value value-bonus" data-v-b6e6b833>${ssrInterpolate($setup.totalBonus)}</span></div><div class="stat" data-v-b6e6b833><span class="label" data-v-b6e6b833>Super</span><span class="value value-super" data-v-b6e6b833>${ssrInterpolate($setup.totalSuper)}</span></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if (!$setup.loading && $setup.huntItems.length > 0) {
    _push(`<div class="ticker" data-v-b6e6b833><div class="${ssrRenderClass([{ "no-scroll": $setup.scrollDistance <= 0 }, "ticker-track"])}" style="${ssrRenderStyle({ "--scroll-distance": $setup.scrollDistance + "px" })}" data-v-b6e6b833><!--[-->`);
    ssrRenderList($setup.huntItems, (item) => {
      _push(`<div class="${ssrRenderClass([
        "game-card",
        "ticker-card",
        $setup.getGameStatusClass(item)
      ])}"${ssrRenderAttr("title", $setup.getGameTooltip(item))} data-v-b6e6b833><div class="game-thumb" data-v-b6e6b833><img${ssrRenderAttr("src", $setup.getGameThumbnail(item))}${ssrRenderAttr("alt", item.item || "Game")} class="w-full h-full object-cover" data-v-b6e6b833></div>`);
      if (item.completed) {
        _push(`<div class="completed-overlay" data-v-b6e6b833><svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-v-b6e6b833><path d="M20 6L9 17l-5-5" stroke="#ffffff" stroke-width="6" data-v-b6e6b833></path><path d="M20 6L9 17l-5-5" data-v-b6e6b833></path></svg></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="game-name" data-v-b6e6b833>${ssrInterpolate($setup.formatGameName(item.item || "Unknown"))}</div><div class="status-indicator" data-v-b6e6b833>`);
      if (item.super_bonus) {
        _push(`<span class="status-badge super" data-v-b6e6b833>S</span>`);
      } else if (item.bonus) {
        _push(`<span class="status-badge bonus" data-v-b6e6b833>B</span>`);
      } else {
        _push(`<span class="status-badge regular" data-v-b6e6b833>R</span>`);
      }
      _push(`</div></div>`);
    });
    _push(`<!--]--></div></div>`);
  } else if (!$setup.loading) {
    _push(`<div class="empty-state" data-v-b6e6b833><div class="text-gold text-sm opacity-75" data-v-b6e6b833>No games in hunt</div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/Stream/HuntGamesStream.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const HuntGamesStream = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-b6e6b833"]]);

const $$Astro = createAstro("https://ChristopherBF.github.io");
const prerender = false;
const $$eventId = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$eventId;
  const { eventId } = Astro2.params;
  console.log("[stream.astro] Event ID from params:", eventId);
  if (!eventId) {
    console.log("[stream.astro] No eventId provided, redirecting");
    return Astro2.redirect("/");
  }
  const supabase = getSupabaseClient();
  let event = { id: eventId, name: "Hunt Stream" };
  try {
    const { data: eventData, error } = await supabase.from("suggestion_events").select("id").eq("id", eventId).single();
    console.log("[stream.astro] Event lookup result:", { eventData, error });
    if (eventData && !error) {
      event = { id: eventData.id, name: "Hunt Stream" };
      console.log("[stream.astro] Event found in suggestion_events:", event.id);
    } else {
      console.log("[stream.astro] Event not found or error, using fallback");
    }
  } catch (e) {
    console.log("[stream.astro] Exception during event lookup:", e);
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `Hunt Games Stream - ${event.name}`, "hideNav": true, "data-astro-cid-tk2nqhsr": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-gradient-to-br from-brown-dark to-brown p-4" data-astro-cid-tk2nqhsr> <div class="max-w-6xl mx-auto" data-astro-cid-tk2nqhsr> <!-- Stream Element Component --> <div class="flex justify-center gap-4 mt-2" data-astro-cid-tk2nqhsr> <div class="flex items-center gap-1" data-astro-cid-tk2nqhsr> <div class="w-3 h-3 bg-amber-400 rounded border-2 border-amber-400" data-astro-cid-tk2nqhsr></div> <span data-astro-cid-tk2nqhsr>Super Bonus</span> </div> <div class="flex items-center gap-1" data-astro-cid-tk2nqhsr> <div class="w-3 h-3 bg-violet-500 rounded border-2 border-violet-500" data-astro-cid-tk2nqhsr></div> <span data-astro-cid-tk2nqhsr>Bonus</span> </div> </div> <div class="bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-orange/30" data-astro-cid-tk2nqhsr> ${renderComponent($$result2, "HuntGamesStream", HuntGamesStream, { "client:load": true, "eventId": event.id, "client:component-hydration": "load", "client:component-path": "C:/Users/Christopher/dev/bognushunter/src/components/Stream/HuntGamesStream.vue", "client:component-export": "default", "data-astro-cid-tk2nqhsr": true })} </div> </div> </div>  ` })}`;
}, "C:/Users/Christopher/dev/bognushunter/src/pages/stream/[eventId].astro", void 0);

const $$file = "C:/Users/Christopher/dev/bognushunter/src/pages/stream/[eventId].astro";
const $$url = "/bognushunter/stream/[eventId]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$eventId,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
