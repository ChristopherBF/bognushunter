import { defineComponent, useSSRContext, computed, mergeProps } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderClass, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper_pcqpp-6-.mjs';

const formatItemName = (name) => {
  if (!name) return "";
  return name.replace(/-/g, " ").split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
};

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "GameThumbnail",
  props: {
    thumbnailUrl: {
      type: String,
      default: ""
    },
    backgroundUrl: {
      type: String,
      default: ""
    },
    alt: {
      type: String,
      required: true
    },
    size: {
      type: String,
      default: "md",
      // xs, sm, md, lg, xl
      validator: (value) => ["xs", "sm", "md", "lg", "xl"].includes(value)
    },
    showGradient: {
      type: Boolean,
      default: false
    }
  },
  emits: ["image-error"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    function processUrl(url) {
      if (!url) return "";
      return url.replace("cdn://", "https://cdnv1.500.casino/");
    }
    function handleImageError(event) {
      if (event.target) {
        event.target.style.display = "none";
      }
      emit("image-error", "thumbnail");
    }
    const sizeClass = computed(() => {
      const sizes = {
        "xs": "w-8 h-8",
        "sm": "w-12 h-12",
        "md": "w-20 h-20",
        "lg": "w-32 h-32",
        "xl": "w-40 h-40"
      };
      return sizes[props.size] || sizes.md;
    });
    const fallbackTextClass = computed(() => {
      const sizes = {
        "xs": "text-xs",
        "sm": "text-sm",
        "md": "text-base",
        "lg": "text-lg",
        "xl": "text-xl"
      };
      return sizes[props.size] || sizes.md;
    });
    const fallbackText = computed(() => {
      return props.alt.substring(0, 2).toUpperCase();
    });
    const __returned__ = { props, emit, processUrl, handleImageError, sizeClass, fallbackTextClass, fallbackText };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({
    class: ["relative overflow-hidden rounded-md", [$setup.sizeClass]]
  }, _attrs))}>`);
  if ($props.backgroundUrl) {
    _push(`<div class="absolute inset-0 z-0"><img${ssrRenderAttr("src", $setup.processUrl($props.backgroundUrl))}${ssrRenderAttr("alt", `${$props.alt} background`)} class="w-full h-full object-cover opacity-30"></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($props.thumbnailUrl) {
    _push(`<img${ssrRenderAttr("src", $setup.processUrl($props.thumbnailUrl))}${ssrRenderAttr("alt", $props.alt)} class="w-full h-full object-cover relative z-10">`);
  } else {
    _push(`<div class="w-full h-full bg-orange flex items-center justify-center relative z-10"><span class="${ssrRenderClass([[$setup.fallbackTextClass], "text-gold"])}">${ssrInterpolate($setup.fallbackText)}</span></div>`);
  }
  if ($props.showGradient) {
    _push(`<div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-20"></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/UI/GameThumbnail.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const GameThumbnail = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1]]);

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ActionButton",
  props: {
    text: {
      type: String,
      default: ""
    },
    type: {
      type: String,
      default: "button"
    },
    size: {
      type: String,
      default: "md",
      validator: (value) => ["xs", "sm", "md", "lg", "xl"].includes(value)
    },
    variant: {
      type: String,
      default: "primary",
      validator: (value) => ["primary", "secondary", "danger", "success", "warning"].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    animate: {
      type: Boolean,
      default: true
    }
  },
  emits: ["click"],
  setup(__props, { expose: __expose }) {
    __expose();
    const props = __props;
    const sizeClasses = computed(() => {
      const sizes = {
        "xs": "px-2 py-1 text-xs",
        "sm": "px-3 py-1 text-sm",
        "md": "px-4 py-2 text-base",
        "lg": "px-6 py-3 text-lg",
        "xl": "px-8 py-4 text-xl"
      };
      return sizes[props.size] || sizes.md;
    });
    const variantClasses = computed(() => {
      const variants = {
        "primary": "bg-orange-700 text-gold hover:bg-orange-800 hover:text-gold disabled:bg-orange-700/50 disabled:text-gold/50",
        "secondary": "bg-brown-dark text-gold hover:bg-brown hover:text-gold disabled:bg-brown-dark/50 disabled:text-gold/50",
        "danger": "bg-red-700 text-white hover:bg-red-800 hover:text-white disabled:bg-red-700/50 disabled:text-white/50",
        "success": "bg-green-700 text-white hover:bg-green-800 hover:text-white disabled:bg-green-700/50 disabled:text-white/50",
        "warning": "bg-amber-600 text-white hover:bg-amber-700 hover:text-white disabled:bg-amber-600/50 disabled:text-white/50"
      };
      return variants[props.variant] || variants.primary;
    });
    const __returned__ = { props, sizeClasses, variantClasses };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<button${ssrRenderAttrs(mergeProps({
    type: $props.type,
    class: [
      "font-display rounded shadow transition-all",
      $setup.sizeClasses,
      $setup.variantClasses,
      { "transform hover:scale-105 transition-transform": $props.animate }
    ],
    disabled: $props.disabled
  }, _attrs))}><div class="flex items-center justify-center gap-2">`);
  ssrRenderSlot(_ctx.$slots, "icon-left", {}, null, _push, _parent);
  ssrRenderSlot(_ctx.$slots, "default", {}, () => {
    _push(`${ssrInterpolate($props.text)}`);
  }, _push, _parent);
  ssrRenderSlot(_ctx.$slots, "icon-right", {}, null, _push, _parent);
  _push(`</div></button>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/UI/ActionButton.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ActionButton = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { ActionButton as A, GameThumbnail as G, formatItemName as f };
