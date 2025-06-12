<template>
  <div class="relative overflow-hidden rounded-md" :class="[sizeClass]">
    <!-- Background image if available -->
    <div v-if="backgroundUrl" class="absolute inset-0 z-0">
      <img 
        :src="processUrl(backgroundUrl)" 
        :alt="`${alt} background`" 
        class="w-full h-full object-cover opacity-30"
        @error="$emit('image-error', 'background')"
      />
    </div>
    
    <!-- Main thumbnail -->
    <template v-if="thumbnailUrl">
      <img 
        :src="processUrl(thumbnailUrl)" 
        :alt="alt" 
        class="w-full h-full object-cover relative z-10"
        @error="handleImageError"
      />
    </template>
    <div v-else class="w-full h-full bg-orange flex items-center justify-center relative z-10">
      <span class="text-gold" :class="[fallbackTextClass]">{{ fallbackText }}</span>
    </div>
    
    <!-- Optional gradient overlay -->
    <div v-if="showGradient" class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-20"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  thumbnailUrl: {
    type: String,
    default: ''
  },
  backgroundUrl: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'md', // xs, sm, md, lg, xl
    validator: (value: string) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  showGradient: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['image-error']);

// Process URLs to handle CDN paths
function processUrl(url: string): string {
  if (!url) return '';
  return url.replace('cdn://', 'https://cdnv1.500.casino/');
}

// Handle image loading errors
function handleImageError(event: Event): void {
  if (event.target) {
    (event.target as HTMLImageElement).style.display = 'none';
  }
  emit('image-error', 'thumbnail');
}

// Compute size class based on the size prop
const sizeClass = computed(() => {
  const sizes = {
    'xs': 'w-8 h-8',
    'sm': 'w-12 h-12',
    'md': 'w-20 h-20',
    'lg': 'w-32 h-32',
    'xl': 'w-40 h-40'
  };
  return sizes[props.size as keyof typeof sizes] || sizes.md;
});

// Compute fallback text size based on the size prop
const fallbackTextClass = computed(() => {
  const sizes = {
    'xs': 'text-xs',
    'sm': 'text-sm',
    'md': 'text-base',
    'lg': 'text-lg',
    'xl': 'text-xl'
  };
  return sizes[props.size as keyof typeof sizes] || sizes.md;
});

// Generate fallback text from alt text (first 2 characters)
const fallbackText = computed(() => {
  return props.alt.substring(0, 2).toUpperCase();
});
</script>
