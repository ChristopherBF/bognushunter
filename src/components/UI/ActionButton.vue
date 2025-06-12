<template>
  <button
    :type="type"
    :class="[
      'font-display rounded shadow transition-all',
      sizeClasses,
      variantClasses,
      { 'transform hover:scale-105 transition-transform': animate }
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <div class="flex items-center justify-center gap-2">
      <slot name="icon-left"></slot>
      <slot>{{ text }}</slot>
      <slot name="icon-right"></slot>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'button'
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary', 'danger', 'success', 'warning'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  animate: {
    type: Boolean,
    default: true
  }
});

defineEmits(['click']);

// Size classes
const sizeClasses = computed(() => {
  const sizes = {
    'xs': 'px-2 py-1 text-xs',
    'sm': 'px-3 py-1 text-sm',
    'md': 'px-4 py-2 text-base',
    'lg': 'px-6 py-3 text-lg',
    'xl': 'px-8 py-4 text-xl'
  };
  return sizes[props.size as keyof typeof sizes] || sizes.md;
});

// Variant classes
const variantClasses = computed(() => {
  const variants = {
    'primary': 'bg-orange-700 text-gold hover:bg-orange-800 hover:text-gold disabled:bg-orange-700/50 disabled:text-gold/50',
    'secondary': 'bg-brown-dark text-gold hover:bg-brown hover:text-gold disabled:bg-brown-dark/50 disabled:text-gold/50',
    'danger': 'bg-red-700 text-white hover:bg-red-800 hover:text-white disabled:bg-red-700/50 disabled:text-white/50',
    'success': 'bg-green-700 text-white hover:bg-green-800 hover:text-white disabled:bg-green-700/50 disabled:text-white/50',
    'warning': 'bg-amber-600 text-white hover:bg-amber-700 hover:text-white disabled:bg-amber-600/50 disabled:text-white/50'
  };
  return variants[props.variant as keyof typeof variants] || variants.primary;
});
</script>
